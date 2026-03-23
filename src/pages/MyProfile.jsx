import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./my-profile.css";

import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileContactCard from "../components/profile/ProfileContactCard";
import ProfileProfessionalSection from "../components/profile/ProfileProfessionalSection";
import ProfileAcademicSection from "../components/profile/ProfileAcademicSection";
import ProfileWorkSection from "../components/profile/ProfileWorkSection";
import ProfileSidebar from "../components/profile/ProfileSidebar";

import PersonalInfoModal from "../components/profile/PersonalInfoModal";
import ProfessionalInfoModal from "../components/profile/ProfessionalInfoModal";
import AcademicItemModal from "../components/profile/AcademicItemModal";
import WorkItemModal from "../components/profile/WorkItemModal";
import HeadlineModal from "../components/profile/HeadlineModal";
import ConfirmModal from "../components/profile/ConfirmModal";

import {
  AVAILABILITY,
  createAcademicItem,
  createWorkItem,
  isAcademicItemEmpty,
  isProfessionalInfoEmpty,
  isWorkItemEmpty,
  cloneFormState,
  hasSectionChanges,
} from "../utils/profileHelpers";

import {
  validateAcademicItemComplete,
  validateWorkItemComplete,
} from "../utils/profileValidation";

import useProfileModals from "../hooks/useProfileModals";
import useAcademicManager from "../hooks/useAcademicManager";
import useWorkManager from "../hooks/useWorkManager";
import useProfilePersistence from "../hooks/useProfilePersistence";

const INITIAL_FORM = {
  first_name: "",
  last_name: "",
  phone: "",
  document_type: "",
  document_number: "",
  country: "",
  department: "",
  city: "",
  birth_date: "",
  gender: "",
  marital_status: "",
  headline: "",
  about: "",
  experience_years: "",
  availability: "",
  academic_items: [createAcademicItem()],
  work_items: [createWorkItem()],
};

export default function MyProfile() {
  const { user, refreshMe } = useAuth();

  const [sectionDraft, setSectionDraft] = useState(null);
  const [academicDraft, setAcademicDraft] = useState(null);
  const [workDraft, setWorkDraft] = useState(null);

  const {
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
  } = useProfileModals();

  const {
    form,
    setForm,
    cvInfo,
    loading,
    saving,
    error,
    setError,
    msg,
    setMsg,
    persistProfile,
    saveProfileNow,
    validateFormForSave,
  } = useProfilePersistence({
    refreshMe,
    isAcademicItemEmpty,
    isWorkItemEmpty,
    resetAllProfileModals,
    setAcademicDraft,
    setWorkDraft,
    setSectionDraft,
  });

  const safeForm = form || INITIAL_FORM;

  const requiredKeys = useMemo(
    () => [
      "first_name",
      "last_name",
      "phone",
      "document_type",
      "document_number",
      "country",
      "department",
      "city",
    ],
    []
  );

  const visibleAcademicItems = useMemo(
    () => (safeForm.academic_items || []).filter((item) => !isAcademicItemEmpty(item)),
    [safeForm.academic_items]
  );

  const visibleWorkItems = useMemo(
    () => (safeForm.work_items || []).filter((item) => !isWorkItemEmpty(item)),
    [safeForm.work_items]
  );

  const hasProfessionalInfo = useMemo(
    () => !isProfessionalInfoEmpty(safeForm),
    [safeForm]
  );

  const hasAcademicInfo = visibleAcademicItems.length > 0;
  const hasWorkInfo = visibleWorkItems.length > 0;

  const hasPersonalInfo = useMemo(() => {
    return !!(
      safeForm.first_name.trim() ||
      safeForm.last_name.trim() ||
      safeForm.phone.trim() ||
      user?.email ||
      safeForm.department.trim() ||
      safeForm.city.trim()
    );
  }, [safeForm, user?.email]);

  const requiredProgress = useMemo(() => {
    const filled = requiredKeys.filter((k) => {
      const v = safeForm[k];
      return typeof v === "string" ? v.trim() : !!v;
    }).length;

    const total = requiredKeys.length;
    const pct = Math.round((filled / total) * 100);

    return { filled, total, pct };
  }, [safeForm, requiredKeys]);

  const checklist = useMemo(() => {
    const personalComplete =
      !!safeForm.first_name?.trim() &&
      !!safeForm.last_name?.trim() &&
      !!safeForm.phone &&
      !!safeForm.document_type &&
      !!safeForm.document_number &&
      !!safeForm.country?.trim() &&
      !!safeForm.department?.trim() &&
      !!safeForm.city?.trim();

    const professionalComplete =
      !!safeForm.headline?.trim() &&
      !!safeForm.about?.trim() &&
      !!safeForm.experience_years &&
      !!safeForm.availability;

    const academicComplete = visibleAcademicItems.some((item) => {
      try {
        validateAcademicItemComplete(item, 0);
        if (
          item.start_date &&
          item.end_date &&
          new Date(item.end_date) < new Date(item.start_date)
        ) {
          return false;
        }
        return true;
      } catch {
        return false;
      }
    });

    const workComplete = visibleWorkItems.some((item) => {
      try {
        validateWorkItemComplete(item, 0);
        if (
          item.start_date &&
          item.end_date &&
          new Date(item.end_date) < new Date(item.start_date)
        ) {
          return false;
        }
        return true;
      } catch {
        return false;
      }
    });

    const cvComplete =
      !!cvInfo?.cv?.original_name ||
      !!cvInfo?.cv?.filename ||
      !!cvInfo?.cv?.fileName ||
      !!cvInfo?.cv?.url ||
      !!cvInfo?.cv?.path;

    return [
      { label: "Información personal", done: personalComplete },
      { label: "Información profesional", done: professionalComplete },
      { label: "Información académica", done: academicComplete },
      { label: "Experiencia laboral", done: workComplete },
      { label: "CV", done: cvComplete },
    ];
  }, [safeForm, visibleAcademicItems, visibleWorkItems, cvInfo]);

  const totalProfileProgress = useMemo(() => {
    const sections = checklist.map((item) => item.done);
    const completed = sections.filter(Boolean).length;
    const pct = Math.round((completed / sections.length) * 100);

    return { pct };
  }, [checklist]);

  const fullName = useMemo(() => {
    const name = `${safeForm.first_name || ""} ${safeForm.last_name || ""}`.trim();
    return name || "Perfil pendiente";
  }, [safeForm.first_name, safeForm.last_name]);

  const avatarText = useMemo(() => {
    const a = safeForm.first_name?.trim()?.[0] || "";
    const b = safeForm.last_name?.trim()?.[0] || "";
    const initials = `${a}${b}`.toUpperCase();
    return initials || (user?.email?.[0] || "U").toUpperCase();
  }, [safeForm.first_name, safeForm.last_name, user?.email]);

  const availabilityLabel = safeForm.availability
    ? AVAILABILITY.find((x) => x.value === safeForm.availability)?.label ||
      "No especificado"
    : "No especificado";

  const currentAcademicItem = academicDraft;
  const currentWorkItem = workDraft;
  const modalForm = sectionDraft || safeForm;

  const isAnyModalOpen =
    !!activeModal ||
    academicItemModal.open ||
    workItemModal.open ||
    confirmState.open;

  useEffect(() => {
    document.body.style.overflow = isAnyModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAnyModalOpen]);

  function getSectionFields(section) {
    if (section === "personal") {
      return [
        "first_name",
        "last_name",
        "phone",
        "document_type",
        "document_number",
        "country",
        "department",
        "city",
        "birth_date",
        "gender",
        "marital_status",
      ];
    }

    if (section === "professional") {
      return ["headline", "about", "experience_years", "availability"];
    }

    if (section === "headline") {
      return ["headline"];
    }

    return [];
  }

  function openSectionModal(section, itemId = null) {
    setError("");
    setMsg("");

    if (section === "academic") {
      openAcademicItemModal("edit", itemId);
      return;
    }

    if (section === "work") {
      openWorkItemModal("edit", itemId);
      return;
    }

    setSectionDraft(cloneFormState(safeForm));
    setActiveModal(section);
  }

  function closeSectionModal() {
    if (saving) return;

    const changed =
      !!activeModal &&
      !!sectionDraft &&
      hasSectionChanges(getSectionFields(activeModal), safeForm, sectionDraft);

    if (changed) {
      openConfirm({
        title: "Descartar cambios",
        message: "¿Estás seguro de que deseas descartar los cambios realizados?",
        confirmText: "Descartar",
        cancelText: "Seguir",
        danger: true,
        onConfirm: () => {
          setSectionDraft(null);
          setActiveModal(null);
        },
      });
      return;
    }

    setSectionDraft(null);
    setActiveModal(null);
  }

  function onDocumentTypeChange(value) {
    const target = sectionDraft ? setSectionDraft : setForm;

    target((prev) => ({
      ...prev,
      document_type: value,
      document_number:
        value === "DNI"
          ? String(prev.document_number || "").replace(/\D/g, "")
          : prev.document_number,
    }));
  }

  const {
    openAcademicSectionForAdd,
    openAcademicItemModal,
    closeAcademicItemModal,
    onAcademicDraftChange,
    saveAcademicDraft,
    confirmRemoveAcademicItem,
  } = useAcademicManager({
    form: safeForm,
    setError,
    setMsg,
    openConfirm,
    academicItemModal,
    setAcademicItemModal,
    academicDraft,
    setAcademicDraft,
    persistProfile,
  });

  const {
    openWorkSectionForAdd,
    openWorkItemModal,
    closeWorkItemModal,
    onWorkDraftChange,
    saveWorkDraft,
    confirmRemoveWorkItem,
  } = useWorkManager({
    form: safeForm,
    setError,
    setMsg,
    openConfirm,
    workItemModal,
    setWorkItemModal,
    workDraft,
    setWorkDraft,
    persistProfile,
  });

  function onChange(e) {
    const { name, value } = e.target;
    const target = sectionDraft ? setSectionDraft : setForm;

    if (name === "phone") {
      const onlyDigits = value.replace(/\D/g, "");
      target((prev) => ({ ...prev, [name]: onlyDigits }));
      return;
    }

    if (
      name === "document_number" &&
      (sectionDraft ? sectionDraft.document_type : safeForm.document_type) === "DNI"
    ) {
      const onlyDigits = value.replace(/\D/g, "");
      target((prev) => ({ ...prev, [name]: onlyDigits }));
      return;
    }

    if (name === "experience_years") {
      const onlyDigits = value.replace(/\D/g, "");
      target((prev) => ({ ...prev, [name]: onlyDigits }));
      return;
    }

    target((prev) => ({ ...prev, [name]: value }));
  }

  function validateRequired() {
    validateFormForSave(sectionDraft || safeForm);
  }

  async function onSave(e) {
    e?.preventDefault?.();

    try {
      setError("");
      setMsg("");

      validateRequired();

      const modalLabels = {
        personal: "información personal",
        professional: "información profesional",
        headline: "titular profesional",
      };

      const sectionLabel = modalLabels[activeModal] || "información del perfil";

      openConfirm({
        title: "Guardar cambios",
        message: `¿Deseas guardar los cambios realizados en ${sectionLabel}?`,
        confirmText: "Guardar",
        cancelText: "Cancelar",
        onConfirm: async () => {
          await saveProfileNow(sectionDraft || safeForm);
        },
      });
    } catch (e2) {
      setError(e2.message);
    }
  }

  if (loading) {
    return (
      <div className="container py-4 py-lg-5" style={{ maxWidth: 1180 }}>
        <div className="hx-profile-shell-card text-center py-5">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <div className="py-4 py-lg-5 hx-profile-v2">
        {(error || msg) && (
          <div className="mb-3">
            {error && <div className="alert alert-danger rounded-4 mb-2">{error}</div>}
            {msg && <div className="alert alert-success rounded-4 mb-0">{msg}</div>}
          </div>
        )}

        <div className="hx-profile-layout">
          <div className="hx-profile-main">
            <ProfileHeader
              fullName={fullName}
              headline={safeForm.headline}
              openSectionModal={openSectionModal}
            />

            <ProfileContactCard
              user={user}
              form={safeForm}
              fullName={fullName}
              hasPersonalInfo={hasPersonalInfo}
              openSectionModal={openSectionModal}
            />

            <ProfileProfessionalSection
              hasProfessionalInfo={hasProfessionalInfo}
              form={safeForm}
              availabilityLabel={availabilityLabel}
              openSectionModal={openSectionModal}
            />

            <ProfileAcademicSection
              hasAcademicInfo={hasAcademicInfo}
              visibleAcademicItems={visibleAcademicItems}
              openAcademicSectionForAdd={openAcademicSectionForAdd}
              openSectionModal={openSectionModal}
              removeAcademicItem={confirmRemoveAcademicItem}
            />

            <ProfileWorkSection
              hasWorkInfo={hasWorkInfo}
              visibleWorkItems={visibleWorkItems}
              openWorkSectionForAdd={openWorkSectionForAdd}
              openSectionModal={openSectionModal}
              removeWorkItem={confirmRemoveWorkItem}
            />
          </div>

          <ProfileSidebar
            avatarText={avatarText}
            fullName={fullName}
            headline={safeForm.headline}
            totalProfileProgress={totalProfileProgress}
            checklist={checklist}
            requiredProgress={requiredProgress}
          />
        </div>
      </div>

      <PersonalInfoModal
        isOpen={activeModal === "personal"}
        closeModal={closeSectionModal}
        onSave={onSave}
        saving={saving}
        form={modalForm}
        onChange={onChange}
        onDocumentTypeChange={onDocumentTypeChange}
      />

      <HeadlineModal
        isOpen={activeModal === "headline"}
        closeModal={closeSectionModal}
        onSave={onSave}
        saving={saving}
        form={modalForm}
        onChange={onChange}
      />

      <ProfessionalInfoModal
        isOpen={activeModal === "professional"}
        closeModal={closeSectionModal}
        onSave={onSave}
        saving={saving}
        form={modalForm}
        onChange={onChange}
      />

      <AcademicItemModal
        isOpen={academicItemModal.open}
        closeModal={closeAcademicItemModal}
        item={currentAcademicItem}
        mode={academicItemModal.mode}
        onAcademicChange={onAcademicDraftChange}
        onSaveDraft={saveAcademicDraft}
        error={error}
      />

      <WorkItemModal
        isOpen={workItemModal.open}
        closeModal={closeWorkItemModal}
        item={currentWorkItem}
        mode={workItemModal.mode}
        onWorkChange={onWorkDraftChange}
        onSaveDraft={saveWorkDraft}
        error={error}
      />

      <ConfirmModal
        isOpen={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        danger={confirmState.danger}
        onConfirm={handleConfirmAccept}
        onCancel={closeConfirm}
      />
    </>
  );
}