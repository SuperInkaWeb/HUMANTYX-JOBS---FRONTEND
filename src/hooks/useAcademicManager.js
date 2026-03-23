import { createAcademicItem, isAcademicItemEmpty, isSameAcademicItem } from "../utils/profileHelpers";
import { EMPTY_ACADEMIC_MODAL } from "./useProfileModals";
import { validateAcademicDraft } from "../utils/profileValidation";

export default function useAcademicManager({
  form,
  setError,
  setMsg,
  openConfirm,
  academicItemModal,
  setAcademicItemModal,
  academicDraft,
  setAcademicDraft,
  persistProfile,
}) {
  function openAcademicSectionForAdd() {
    setError("");
    setMsg("");

    const newItem = createAcademicItem();

    setAcademicDraft({ ...newItem });
    setAcademicItemModal({
      open: true,
      mode: "create",
      itemId: newItem.id,
    });
  }

  function openAcademicItemModal(mode = "edit", itemId = null) {
    const found = form.academic_items.find((item) => item.id === itemId);

    setError("");
    setMsg("");
    setAcademicDraft(found ? { ...found } : createAcademicItem());

    setAcademicItemModal({
      open: true,
      mode,
      itemId: found?.id ?? null,
    });
  }

  function closeAcademicItemModal() {
    if (!academicDraft) {
      setAcademicDraft(null);
      setAcademicItemModal(EMPTY_ACADEMIC_MODAL);
      return;
    }

    const original =
      academicItemModal.mode === "edit"
        ? form.academic_items.find((item) => item.id === academicItemModal.itemId)
        : null;

    const hasChanges =
      academicItemModal.mode === "create"
        ? !isAcademicItemEmpty(academicDraft)
        : !isSameAcademicItem(academicDraft, original);

    if (hasChanges) {
      openConfirm({
        title: "Descartar cambios",
        message: "¿Estás seguro de que deseas descartar los cambios realizados?",
        confirmText: "Descartar",
        cancelText:
          academicItemModal.mode === "create" ? "Seguir" : "Seguir editando",
        danger: true,
        onConfirm: () => {
          setAcademicDraft(null);
          setAcademicItemModal(EMPTY_ACADEMIC_MODAL);
        },
      });
      return;
    }

    setAcademicDraft(null);
    setAcademicItemModal(EMPTY_ACADEMIC_MODAL);
  }

  function onAcademicDraftChange(field, value) {
    const normalized = field === "total_years" ? value.replace(/\D/g, "") : value;

    setError("");
    setAcademicDraft((prev) => ({
      ...prev,
      [field]: normalized,
    }));
  }

  function saveAcademicDraft() {
    try {
      setError("");
      setMsg("");

      validateAcademicDraft(academicDraft);

      const isEditing = form.academic_items.some(
        (item) => item.id === academicDraft.id
      );

      openConfirm({
        title: isEditing ? "Guardar cambios" : "Agregar formación",
        message: isEditing
          ? "¿Deseas guardar los cambios realizados en esta información académica?"
          : "¿Deseas agregar esta información académica a tu perfil?",
        confirmText: isEditing ? "Guardar" : "Agregar",
        cancelText: "Cancelar",
        onConfirm: async () => {
          const exists = form.academic_items.some(
            (item) => item.id === academicDraft.id
          );

          const cleanedAcademicItems = form.academic_items.filter(
            (item) => !isAcademicItemEmpty(item)
          );

          const nextForm = {
            ...form,
            academic_items: exists
              ? cleanedAcademicItems.map((item) =>
                  item.id === academicDraft.id ? { ...academicDraft } : item
                )
              : [...cleanedAcademicItems, { ...academicDraft }],
          };

          await persistProfile(
            nextForm,
            isEditing
              ? "✅ Información académica actualizada correctamente."
              : "✅ Información académica agregada correctamente."
          );

          setAcademicDraft(null);
          setAcademicItemModal(EMPTY_ACADEMIC_MODAL);
        },
      });
    } catch (e) {
      setError(
        e.message || "Completa todos los campos obligatorios antes de continuar."
      );
    }
  }

  function removeAcademicItem(id) {
    const filtered = form.academic_items.filter((item) => item.id !== id);

    const nextForm = {
      ...form,
      academic_items: filtered.length ? filtered : [createAcademicItem()],
    };

    return persistProfile(
      nextForm,
      "✅ Formación académica eliminada correctamente."
    );
  }

  function confirmRemoveAcademicItem(id) {
    openConfirm({
      title: "Eliminar formación",
      message: "¿Estás seguro de que deseas borrar esta formación académica?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      danger: true,
      onConfirm: () => removeAcademicItem(id),
    });
  }

  return {
    openAcademicSectionForAdd,
    openAcademicItemModal,
    closeAcademicItemModal,
    onAcademicDraftChange,
    saveAcademicDraft,
    confirmRemoveAcademicItem,
  };
}