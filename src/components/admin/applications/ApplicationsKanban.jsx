import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import KanbanColumn from "./KanbanColumn";
import ApplicationKanbanCard from "./ApplicationKanbanCard";

export default function ApplicationsKanban({
  groupedRows,
  STATUS_ORDER,
  STATUS_META,
  jobId,
  updatingId,
  openingPreviewId,
  previewLoading,
  StatusDropdown,
  getPendingStatus,
  getInitials,
  getUnreadCount,
  getApplicationDate,
  formatDate,
  formatRelativeDate,
  getAdminChatButtonLabel,
  onDraftStatusChange,
  onSaveDraftStatus,
  onCancelDraftStatus,
  onOpenPreview,
  onOpenMessages,
  onMoveApplication,
  onOpenApplicationDetail,
}) {
  const [activeCard, setActiveCard] = useState(null);
  const [localRows, setLocalRows] = useState(groupedRows);

  useEffect(() => {
    setLocalRows(groupedRows);
  }, [groupedRows]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event) {
    setActiveCard(event.active.data.current || null);
  }

  async function handleDragEnd(event) {
    const { active, over } = event;

    setActiveCard(null);

    if (!over) return;

    const applicationId = active.data.current?.applicationId;
    const currentStatus = active.data.current?.status;
    const targetStatus = over.data.current?.status;

    if (!applicationId || !currentStatus || !targetStatus) return;
    if (currentStatus === targetStatus) return;

    let previousRowsSnapshot = null;

    setLocalRows((prev) => {
      previousRowsSnapshot = prev;

      const movedCard = Object.values(prev)
        .flat()
        .find((row) => row.application_id === applicationId);

      if (!movedCard) return prev;

      return {
        ...prev,
        [currentStatus]: (prev[currentStatus] || []).filter(
          (row) => row.application_id !== applicationId
        ),
        [targetStatus]: [
          {
            ...movedCard,
            application_status: targetStatus,
          },
          ...(prev[targetStatus] || []),
        ],
      };
    });

    const ok = await onMoveApplication(applicationId, targetStatus);

    if (!ok && previousRowsSnapshot) {
      setLocalRows(previousRowsSnapshot);
    }
  }

  function handleDragCancel() {
    setActiveCard(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="hja-kanban">
        {STATUS_ORDER.map((status) => {
          const meta = STATUS_META[status];
          const items = localRows[status] || [];

          return (
            <KanbanColumn
              key={status}
              status={status}
              meta={meta}
              items={items}
            >
              {items.map((row) => (
                <ApplicationKanbanCard
                  key={row.application_id}
                  row={row}
                  jobId={jobId}
                  updatingId={updatingId}
                  openingPreviewId={openingPreviewId}
                  previewLoading={previewLoading}
                  StatusDropdown={StatusDropdown}
                  getPendingStatus={getPendingStatus}
                  getInitials={getInitials}
                  getUnreadCount={getUnreadCount}
                  getApplicationDate={getApplicationDate}
                  formatDate={formatDate}
                  formatRelativeDate={formatRelativeDate}
                  getAdminChatButtonLabel={getAdminChatButtonLabel}
                  onDraftStatusChange={onDraftStatusChange}
                  onSaveDraftStatus={onSaveDraftStatus}
                  onCancelDraftStatus={onCancelDraftStatus}
                  onOpenPreview={onOpenPreview}
                  onOpenMessages={onOpenMessages}
                  onOpenApplicationDetail={onOpenApplicationDetail}
                />
              ))}
            </KanbanColumn>
          );
        })}
      </div>

      <DragOverlay>
        {activeCard ? (
          <div className="hja-kanban-card hja-kanban-card--overlay">
            <div className="hja-overlay-header">
              <i className="bi bi-person-badge"></i>

              <div>
                <strong>
                  {`${activeCard.firstName ?? ""} ${
                    activeCard.lastName ?? ""
                  }`.trim() || "Postulante"}
                </strong>

                <small>{activeCard.email || "Sin correo"}</small>
              </div>
            </div>

            <div className="hja-overlay-status">
              Arrastrando hacia otra etapa...
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}