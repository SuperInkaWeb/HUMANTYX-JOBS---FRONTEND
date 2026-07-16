export const COUNTRY_RULES = {
  EC: {
    defaultDocumentType: "EC_CI",
    phoneMinLength: 9,
    phoneMaxLength: 9,
    documentRegex: /^\d{10}$/,
    documentMessage: "La cédula ecuatoriana debe tener 10 dígitos.",
    documentExample: "0102030405",
  },

  PE: {
    defaultDocumentType: "PE_DNI",
    phoneMinLength: 9,
    phoneMaxLength: 9,
    documentRegex: /^\d{8}$/,
    documentMessage: "El DNI peruano debe tener 8 dígitos.",
    documentExample: "12345678",
  },
};

export const DEFAULT_COUNTRY_RULE = {
  defaultDocumentType: "",
  phoneMinLength: 6,
  phoneMaxLength: 15,
  documentRegex: /^[A-Za-z0-9\-./ ]{3,30}$/,
  documentMessage:
    "El número de documento debe tener entre 3 y 30 caracteres válidos.",
  documentExample: "AB1234567",
};

export function getCountryRule(countryCode) {
  return COUNTRY_RULES[countryCode] || DEFAULT_COUNTRY_RULE;
}