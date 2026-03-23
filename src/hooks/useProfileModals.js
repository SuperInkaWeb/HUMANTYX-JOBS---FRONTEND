import { useState } from "react";

export const EMPTY_ACADEMIC_MODAL = {
  open: false,
  mode: "create",
  itemId: null,
};

export const EMPTY_WORK_MODAL = {
  open: false,
  mode: "create",
  itemId: null,
};

export default function useProfileModals() {
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Confirmar",
    cancelText: "Cancelar",
    danger: false,
    onConfirm: null,
  });

  const [activeModal, setActiveModal] = useState(null);
  const [academicItemModal, setAcademicItemModal] = useState(
    EMPTY_ACADEMIC_MODAL
  );
  const [workItemModal, setWorkItemModal] = useState(EMPTY_WORK_MODAL);

  function openConfirm({
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    danger = false,
    onConfirm,
  }) {
    setConfirmState({
      open: true,
      title,
      message,
      confirmText,
      cancelText,
      danger,
      onConfirm,
    });
  }

  function closeConfirm() {
    setConfirmState((prev) => ({
      ...prev,
      open: false,
      onConfirm: null,
    }));
  }

  async function handleConfirmAccept() {
    const action = confirmState.onConfirm;
    closeConfirm();

    if (typeof action === "function") {
      await action();
    }
  }

  function resetAllProfileModals() {
    setActiveModal(null);
    setAcademicItemModal(EMPTY_ACADEMIC_MODAL);
    setWorkItemModal(EMPTY_WORK_MODAL);
  }

  return {
    confirmState,
    openConfirm,
    closeConfirm,
    handleConfirmAccept,

    activeModal,
    setActiveModal,

    academicItemModal,
    setAcademicItemModal,

    workItemModal,
    setWorkItemModal,

    resetAllProfileModals,
  };
}