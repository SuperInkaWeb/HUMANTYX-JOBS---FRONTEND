import { createWorkItem, isWorkItemEmpty, isSameWorkItem } from "../utils/profileHelpers";
import { EMPTY_WORK_MODAL } from "./useProfileModals";
import { validateWorkDraft } from "../utils/profileValidation";

export default function useWorkManager({
  form,
  setError,
  setMsg,
  openConfirm,
  workItemModal,
  setWorkItemModal,
  workDraft,
  setWorkDraft,
  persistProfile,
}) {
  function openWorkSectionForAdd() {
    setError("");
    setMsg("");

    const newItem = createWorkItem();

    setWorkDraft({ ...newItem });
    setWorkItemModal({
      open: true,
      mode: "create",
      itemId: newItem.id,
    });
  }

  function openWorkItemModal(mode = "edit", itemId = null) {
    const found = form.work_items.find((item) => item.id === itemId);

    setError("");
    setMsg("");
    setWorkDraft(found ? { ...found } : createWorkItem());

    setWorkItemModal({
      open: true,
      mode,
      itemId: found?.id ?? null,
    });
  }

  function closeWorkItemModal() {
    if (!workDraft) {
      setWorkDraft(null);
      setWorkItemModal(EMPTY_WORK_MODAL);
      return;
    }

    const original =
      workItemModal.mode === "edit"
        ? form.work_items.find((item) => item.id === workItemModal.itemId)
        : null;

    const hasChanges =
      workItemModal.mode === "create"
        ? !isWorkItemEmpty(workDraft)
        : !isSameWorkItem(workDraft, original);

    if (hasChanges) {
      openConfirm({
        title: "Descartar cambios",
        message: "¿Estás seguro de que deseas descartar los cambios realizados?",
        confirmText: "Descartar",
        cancelText: workItemModal.mode === "create" ? "Seguir" : "Seguir editando",
        danger: true,
        onConfirm: () => {
          setWorkDraft(null);
          setWorkItemModal(EMPTY_WORK_MODAL);
        },
      });
      return;
    }

    setWorkDraft(null);
    setWorkItemModal(EMPTY_WORK_MODAL);
  }

  function onWorkDraftChange(field, value) {
    const normalized = field === "total_years" ? value.replace(/\D/g, "") : value;

    setError("");
    setWorkDraft((prev) => ({
      ...prev,
      [field]: normalized,
    }));
  }

  function saveWorkDraft() {
    try {
      setError("");
      setMsg("");

      validateWorkDraft(workDraft);

      const isEditing = form.work_items.some((item) => item.id === workDraft.id);

      openConfirm({
        title: isEditing ? "Guardar cambios" : "Agregar experiencia",
        message: isEditing
          ? "¿Deseas guardar los cambios realizados en esta experiencia laboral?"
          : "¿Deseas agregar esta experiencia laboral a tu perfil?",
        confirmText: isEditing ? "Guardar" : "Agregar",
        cancelText: "Cancelar",
        onConfirm: async () => {
          const exists = form.work_items.some((item) => item.id === workDraft.id);

          const cleanedWorkItems = form.work_items.filter(
            (item) => !isWorkItemEmpty(item)
          );

          const nextForm = {
            ...form,
            work_items: exists
              ? cleanedWorkItems.map((item) =>
                  item.id === workDraft.id ? { ...workDraft } : item
                )
              : [...cleanedWorkItems, { ...workDraft }],
          };

          await persistProfile(
            nextForm,
            isEditing
              ? "✅ Experiencia laboral actualizada correctamente."
              : "✅ Experiencia laboral agregada correctamente."
          );

          setWorkDraft(null);
          setWorkItemModal(EMPTY_WORK_MODAL);
        },
      });
    } catch (e) {
      setError(
        e.message || "Completa todos los campos obligatorios antes de continuar."
      );
    }
  }

  function removeWorkItem(id) {
    const filtered = form.work_items.filter((item) => item.id !== id);

    const nextForm = {
      ...form,
      work_items: filtered.length ? filtered : [createWorkItem()],
    };

    return persistProfile(
      nextForm,
      "✅ Experiencia laboral eliminada correctamente."
    );
  }

  function confirmRemoveWorkItem(id) {
    openConfirm({
      title: "Eliminar experiencia",
      message: "¿Estás seguro de que deseas borrar esta experiencia laboral?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      danger: true,
      onConfirm: () => removeWorkItem(id),
    });
  }

  return {
    openWorkSectionForAdd,
    openWorkItemModal,
    closeWorkItemModal,
    onWorkDraftChange,
    saveWorkDraft,
    confirmRemoveWorkItem,
  };
}