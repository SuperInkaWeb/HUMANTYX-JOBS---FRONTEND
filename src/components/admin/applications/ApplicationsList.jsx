import ApplicationActions from "./ApplicationActions";
import ApplicationCandidateInfo from "./ApplicationCandidateInfo";
import ApplicationStatusControl from "./ApplicationStatusControl";

export default function ApplicationsList({
  rows,
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
}) {
  return (
    <div className="hja-cards">
      {rows.map((r) => {
        const fullName =
          `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() || "—";

        const applicationDate = getApplicationDate(r);
        const disabledStatus = updatingId === r.application_id;
        const openingThisPreview = openingPreviewId === r.candidate_id;
        const unreadCount = getUnreadCount(r.unread_messages_count);

        const pendingStatus = getPendingStatus(
          r.application_id,
          r.application_status
        );

        const displayStatus = pendingStatus || r.application_status;
        const hasPendingStatusChange = Boolean(pendingStatus);

        return (
          <article key={r.application_id} className="hja-app-card">
            <div className="hja-app-card__main">
              <ApplicationCandidateInfo
                row={r}
                fullName={fullName}
                applicationDate={applicationDate}
                getInitials={getInitials}
                formatDate={formatDate}
                formatRelativeDate={formatRelativeDate}
                getApplicationDate={getApplicationDate}
              />
            </div>

            <div className="hja-app-card__side">
              <ApplicationStatusControl
                applicationId={r.application_id}
                currentStatus={r.application_status}
                displayStatus={displayStatus}
                disabledStatus={disabledStatus}
                hasPendingStatusChange={hasPendingStatusChange}
                StatusDropdown={StatusDropdown}
                onDraftStatusChange={onDraftStatusChange}
                onSaveDraftStatus={onSaveDraftStatus}
                onCancelDraftStatus={onCancelDraftStatus}
              />

              <ApplicationActions
                jobId={jobId}
                row={r}
                unreadCount={unreadCount}
                openingPreview={openingThisPreview}
                previewLoading={previewLoading}
                onOpenPreview={onOpenPreview}
                onOpenMessages={onOpenMessages}
                getAdminChatButtonLabel={getAdminChatButtonLabel}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}