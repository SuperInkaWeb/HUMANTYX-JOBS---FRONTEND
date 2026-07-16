// src/utils/profileHelpers.js
import countries from "world-countries";
export const DOC_TYPES = [
  { value: "", label: "Seleccionar..." },
  // Ecuador
  { value: "EC_CI", label: "Cédula ecuatoriana" },
  // Perú
  { value: "PE_DNI", label: "DNI peruano" },
  // Internacional
  { value: "PASSPORT", label: "Pasaporte" },
  { value: "CE", label: "Carné de extranjería" },
  { value: "OTHER", label: "Otro documento" },
];

export const COUNTRIES = [
  { value: "", label: "Seleccionar..." },
  ...countries
    .map((country) => ({
      value: country.cca2,
      label: country.translations?.spa?.common || country.name.common,
      callingCode: country.idd?.root
        ? `${country.idd.root}${country.idd.suffixes?.[0] || ""}`
        : "",
      flag: country.flag || "",
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es")),
];

export const GENDERS = [
  { value: "", label: "Seleccionar..." },
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
  { value: "X", label: "Otro" },
  { value: "NA", label: "Prefiero no decirlo" },
];

export const MARITAL = [
  { value: "", label: "Seleccionar..." },
  { value: "SINGLE", label: "Soltero/a" },
  { value: "MARRIED", label: "Casado/a" },
  { value: "DIVORCED", label: "Divorciado/a" },
  { value: "WIDOWED", label: "Viudo/a" },
  { value: "COHABITING", label: "Conviviente" },
];

export const EDUCATION = [
  { value: "", label: "Seleccionar..." },
  { value: "SECONDARY", label: "Secundaria" },
  { value: "TECHNICAL", label: "Técnico" },
  { value: "UNIVERSITY", label: "Universitario" },
  { value: "POSTGRAD", label: "Postgrado" },
];

export const ACADEMIC_STATUS = [
  { value: "", label: "Seleccionar..." },
  { value: "IN_PROGRESS", label: "En curso" },
  { value: "COMPLETED", label: "Completo" },
  { value: "INCOMPLETE", label: "Incompleto" },
];

export const AVAILABILITY = [
  { value: "", label: "Seleccionar..." },
  { value: "IMMEDIATE", label: "Inmediata" },
  { value: "15_DAYS", label: "En 15 días" },
  { value: "30_DAYS", label: "En 30 días" },
  { value: "NEGOTIABLE", label: "A convenir" },
];

export function formatDate(dateString) {
  if (!dateString) return "No especificada";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatYears(value) {
  if (value === "" || value === null || value === undefined) {
    return "No especificados";
  }

  const num = Number(value);
  if (Number.isNaN(num)) return "No especificados";

  return `${num} ${num === 1 ? "año" : "años"}`;
}

export function createAcademicItem() {
  return {
    id: Date.now() + Math.random(),
    education_level: "",
    institution: "",
    career: "",
    academic_status: "",
    start_date: "",
    end_date: "",
    location: "",
    total_years: "",
  };
}

export function createWorkItem() {
  return {
    id: Date.now() + Math.random(),
    position: "",
    company: "",
    start_date: "",
    end_date: "",
    location: "",
    total_years: "",
    description: "",
  };
}

export function isProfessionalInfoEmpty(form) {
  return !(
    form.about?.trim() ||
    form.experience_years !== "" ||
    form.availability
  );
}

export function isAcademicItemEmpty(item) {
  if (!item) return true;

  return !(
    item.education_level ||
    item.institution?.trim() ||
    item.career?.trim() ||
    item.academic_status ||
    item.start_date ||
    item.end_date ||
    item.location?.trim() ||
    item.total_years !== ""
  );
}

export function isWorkItemEmpty(item) {
  if (!item) return true;

  return !(
    item.position?.trim() ||
    item.company?.trim() ||
    item.start_date ||
    item.end_date ||
    item.location?.trim() ||
    item.total_years !== "" ||
    item.description?.trim()
  );
}

export function mapAcademicItemFromApi(item, index = 0) {
  return {
    id: item.id ?? index + 1,
    education_level: item.education_level || "",
    institution: item.institution || "",
    career: item.career || "",
    academic_status: item.academic_status || "",
    start_date: item.start_date ? String(item.start_date).slice(0, 10) : "",
    end_date: item.end_date ? String(item.end_date).slice(0, 10) : "",
    location: item.location || "",
    total_years: item.total_years ?? "",
  };
}

export function mapWorkItemFromApi(item, index = 0) {
  return {
    id: item.id ?? index + 1,
    position: item.position || "",
    company: item.company || "",
    start_date: item.start_date ? String(item.start_date).slice(0, 10) : "",
    end_date: item.end_date ? String(item.end_date).slice(0, 10) : "",
    location: item.location || "",
    total_years: item.total_years ?? "",
    description: item.description || "",
  };
}

export function cloneFormState(source) {
  return {
    ...source,
    academic_items: Array.isArray(source.academic_items)
      ? source.academic_items.map((item) => ({ ...item }))
      : [createAcademicItem()],
    work_items: Array.isArray(source.work_items)
      ? source.work_items.map((item) => ({ ...item }))
      : [createWorkItem()],
  };
}

export function mapProfileFromApi(p) {
  return {
    first_name: p.first_name || "",
    last_name: p.last_name || "",
    phone: p.phone || "",
    document_type: p.document_type || "",
    document_number: p.document_number || "",
    country: p.country || "",
    department: p.department || "",
    city: p.city || "",
    birth_date: p.birth_date ? String(p.birth_date).slice(0, 10) : "",
    gender: p.gender || "",
    marital_status: p.marital_status || "",

    headline: p.headline || "",
    about: p.about || "",
    experience_years: p.experience_years ?? "",
    availability: p.availability || "",

    academic_items:
      Array.isArray(p.academic_items) && p.academic_items.length
        ? p.academic_items.map(mapAcademicItemFromApi)
        : [createAcademicItem()],

    work_items:
      Array.isArray(p.work_items) && p.work_items.length
        ? p.work_items.map(mapWorkItemFromApi)
        : [createWorkItem()],
  };
}

export function buildProfilePayload(sourceForm) {
  const academicItemsToSave = sourceForm.academic_items.filter(
    (item) => !isAcademicItemEmpty(item)
  );

  const workItemsToSave = sourceForm.work_items.filter(
    (item) => !isWorkItemEmpty(item)
  );

  return {
    first_name: sourceForm.first_name.trim(),
    last_name: sourceForm.last_name.trim(),
    phone: sourceForm.phone,
    document_type: sourceForm.document_type,
    document_number: sourceForm.document_number.trim(),
    country: sourceForm.country.trim(),
    department: sourceForm.department.trim(),
    city: sourceForm.city.trim(),
    birth_date: sourceForm.birth_date || null,
    gender: sourceForm.gender || null,
    marital_status: sourceForm.marital_status || null,

    headline: sourceForm.headline?.trim() || null,
    about: sourceForm.about?.trim() || null,
    experience_years:
      sourceForm.experience_years === ""
        ? null
        : Number(sourceForm.experience_years),
    availability: sourceForm.availability || null,

    academic_items: academicItemsToSave.map((item) => ({
      education_level: item.education_level || null,
      institution: item.institution?.trim() || null,
      career: item.career?.trim() || null,
      academic_status: item.academic_status || null,
      start_date: item.start_date || null,
      end_date: item.end_date || null,
      location: item.location?.trim() || null,
      total_years: item.total_years === "" ? null : Number(item.total_years),
    })),

    work_items: workItemsToSave.map((item) => ({
      position: item.position?.trim() || null,
      company: item.company?.trim() || null,
      start_date: item.start_date || null,
      end_date: item.end_date || null,
      location: item.location?.trim() || null,
      total_years: item.total_years === "" ? null : Number(item.total_years),
      description: item.description?.trim() || null,
    })),
  };
}

export function isSameAcademicItem(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;

  return (
    a.education_level === b.education_level &&
    a.institution === b.institution &&
    a.career === b.career &&
    a.academic_status === b.academic_status &&
    a.start_date === b.start_date &&
    a.end_date === b.end_date &&
    a.location === b.location &&
    String(a.total_years ?? "") === String(b.total_years ?? "")
  );
}

export function isSameWorkItem(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;

  return (
    a.position === b.position &&
    a.company === b.company &&
    a.start_date === b.start_date &&
    a.end_date === b.end_date &&
    a.location === b.location &&
    String(a.total_years ?? "") === String(b.total_years ?? "") &&
    a.description === b.description
  );
}

export function hasSectionChanges(fields, baseForm, draftForm) {
  return fields.some(
    (field) => String(baseForm?.[field] ?? "") !== String(draftForm?.[field] ?? "")
  );
}