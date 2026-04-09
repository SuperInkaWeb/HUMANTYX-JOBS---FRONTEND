// src/utils/profileValidation.js

export function validateAcademicDraft(item) {
  if (!item.education_level) {
    throw new Error("Completa el nivel de estudios.");
  }

  if (!item.institution?.trim()) {
    throw new Error("Completa la institución educativa.");
  }

  if (!item.career?.trim()) {
    throw new Error("Completa la carrera o especialidad.");
  }

  if (!item.academic_status) {
    throw new Error("Completa el estado académico.");
  }

  if (!item.start_date) {
    throw new Error("Completa la fecha de inicio.");
  }

  if (!item.end_date) {
    throw new Error("Completa la fecha de fin.");
  }

  if (!item.location?.trim()) {
    throw new Error("Completa la ubicación.");
  }

  if (
    item.total_years === "" ||
    item.total_years === null ||
    item.total_years === undefined
  ) {
    throw new Error("Completa los años totales.");
  }

  if (
    item.start_date &&
    item.end_date &&
    new Date(item.end_date) < new Date(item.start_date)
  ) {
    throw new Error("La fecha de fin no puede ser menor que la fecha de inicio.");
  }
}

export function validateWorkDraft(item) {
  if (!item.position?.trim()) {
    throw new Error("Completa el cargo.");
  }

  if (!item.company?.trim()) {
    throw new Error("Completa la empresa.");
  }

  if (!item.start_date) {
    throw new Error("Completa la fecha de inicio.");
  }

  if (!item.end_date) {
    throw new Error("Completa la fecha de fin.");
  }

  if (!item.location?.trim()) {
    throw new Error("Completa la ubicación.");
  }

  if (
    item.total_years === "" ||
    item.total_years === null ||
    item.total_years === undefined
  ) {
    throw new Error("Completa los años totales.");
  }

  if (!item.description?.trim()) {
    throw new Error("Completa la descripción.");
  }

  if (
    item.start_date &&
    item.end_date &&
    new Date(item.end_date) < new Date(item.start_date)
  ) {
    throw new Error("La fecha de fin no puede ser menor que la fecha de inicio.");
  }
}

export function validateAcademicItemComplete(item, index = 0) {
  if (!item.education_level) {
    throw new Error(`Completa el nivel de estudios en la formación #${index + 1}.`);
  }
  if (!item.institution?.trim()) {
    throw new Error(`Completa la institución educativa en la formación #${index + 1}.`);
  }
  if (!item.career?.trim()) {
    throw new Error(`Completa la carrera/especialidad en la formación #${index + 1}.`);
  }
  if (!item.academic_status) {
    throw new Error(`Completa el estado académico en la formación #${index + 1}.`);
  }
  if (!item.start_date) {
    throw new Error(`Completa la fecha de inicio en la formación #${index + 1}.`);
  }
  if (!item.end_date) {
    throw new Error(`Completa la fecha de fin en la formación #${index + 1}.`);
  }
  if (!item.location?.trim()) {
    throw new Error(`Completa la ubicación en la formación #${index + 1}.`);
  }
  if (
    item.total_years === "" ||
    item.total_years === null ||
    item.total_years === undefined
  ) {
    throw new Error(`Completa los años totales en la formación #${index + 1}.`);
  }
}

export function validateWorkItemComplete(item, index = 0) {
  if (!item.position?.trim()) {
    throw new Error(`Completa el cargo en la experiencia #${index + 1}.`);
  }
  if (!item.company?.trim()) {
    throw new Error(`Completa la empresa en la experiencia #${index + 1}.`);
  }
  if (!item.start_date) {
    throw new Error(`Completa la fecha de inicio en la experiencia #${index + 1}.`);
  }
  if (!item.end_date) {
    throw new Error(`Completa la fecha de fin en la experiencia #${index + 1}.`);
  }
  if (!item.location?.trim()) {
    throw new Error(`Completa la ubicación en la experiencia #${index + 1}.`);
  }
  if (
    item.total_years === "" ||
    item.total_years === null ||
    item.total_years === undefined
  ) {
    throw new Error(`Completa los años totales en la experiencia #${index + 1}.`);
  }
  if (!item.description?.trim()) {
    throw new Error(`Completa la descripción en la experiencia #${index + 1}.`);
  }
}

export function validateRequiredForForm(
  sourceForm,
  {
    isAcademicItemEmpty,
    isWorkItemEmpty,
    validateAcademicItemComplete,
    validateWorkItemComplete,
  }
) {
  if (!sourceForm.first_name.trim()) throw new Error("Nombres es obligatorio.");
  if (!sourceForm.last_name.trim()) throw new Error("Apellidos es obligatorio.");

  if (!sourceForm.phone || sourceForm.phone.length !== 9) {
    throw new Error("El teléfono debe tener 9 dígitos.");
  }

  if (!sourceForm.document_type) throw new Error("Tipo de documento es obligatorio.");
  if (!sourceForm.document_number.trim()) {
    throw new Error("Número de documento es obligatorio.");
  }

  if (
    sourceForm.document_type === "DNI" &&
    sourceForm.document_number.length !== 8
  ) {
    throw new Error("El DNI debe tener 8 dígitos.");
  }

  if (!sourceForm.country.trim()) throw new Error("País es obligatorio.");
  if (!sourceForm.department.trim()) {
    throw new Error("Departamento/Estado es obligatorio.");
  }
  if (!sourceForm.city.trim()) throw new Error("Ciudad es obligatorio.");

  if (!sourceForm.birth_date) {
  throw new Error("Fecha de nacimiento es obligatoria.");
}

if (!sourceForm.gender) {
  throw new Error("Género es obligatorio.");
}

if (!sourceForm.marital_status) {
  throw new Error("Estado civil es obligatorio.");
}

  const academicItemsToValidate = sourceForm.academic_items.filter(
    (x) => !isAcademicItemEmpty(x)
  );
  const workItemsToValidate = sourceForm.work_items.filter(
    (x) => !isWorkItemEmpty(x)
  );

  academicItemsToValidate.forEach((item, index) => {
    validateAcademicItemComplete(item, index);

    if (
      item.start_date &&
      item.end_date &&
      new Date(item.end_date) < new Date(item.start_date)
    ) {
      throw new Error(
        `La fecha de fin no puede ser menor que la fecha de inicio en la formación #${index + 1}.`
      );
    }
  });

  workItemsToValidate.forEach((item, index) => {
    validateWorkItemComplete(item, index);

    if (
      item.start_date &&
      item.end_date &&
      new Date(item.end_date) < new Date(item.start_date)
    ) {
      throw new Error(
        `La fecha de fin no puede ser menor que la fecha de inicio en la experiencia #${index + 1}.`
      );
    }
  });
}