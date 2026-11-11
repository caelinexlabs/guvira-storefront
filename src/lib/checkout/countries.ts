// Where Guvira ships, and how an address looks in each place. One registry
// drives the address form, its validation and the currency suggestion.
import type { Currency } from "@/lib/commerce/types";

export type Country = {
  code: string;
  name: string;
  currency: Currency;
  /** Label for the region field, when the country uses one. */
  regionLabel?: string;
  regions?: string[];
  postal?: { label: string; pattern: RegExp; example: string };
  dialCode: string;
};

const IN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];
const CA_PROVINCES = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
];
const AE_EMIRATES = [
  "Abu Dhabi",
  "Ajman",
  "Dubai",
  "Fujairah",
  "Ras Al Khaimah",
  "Sharjah",
  "Umm Al Quwain",
];

// EU member states. Which European countries Guvira ships to is still to be confirmed.
const EU: [string, string, string][] = [
  ["AT", "Austria", "+43"],
  ["BE", "Belgium", "+32"],
  ["BG", "Bulgaria", "+359"],
  ["HR", "Croatia", "+385"],
  ["CY", "Cyprus", "+357"],
  ["CZ", "Czechia", "+420"],
  ["DK", "Denmark", "+45"],
  ["EE", "Estonia", "+372"],
  ["FI", "Finland", "+358"],
  ["FR", "France", "+33"],
  ["DE", "Germany", "+49"],
  ["GR", "Greece", "+30"],
  ["HU", "Hungary", "+36"],
  ["IE", "Ireland", "+353"],
  ["IT", "Italy", "+39"],
  ["LV", "Latvia", "+371"],
  ["LT", "Lithuania", "+370"],
  ["LU", "Luxembourg", "+352"],
  ["MT", "Malta", "+356"],
  ["NL", "Netherlands", "+31"],
  ["PL", "Poland", "+48"],
  ["PT", "Portugal", "+351"],
  ["RO", "Romania", "+40"],
  ["SK", "Slovakia", "+421"],
  ["SI", "Slovenia", "+386"],
  ["ES", "Spain", "+34"],
  ["SE", "Sweden", "+46"],
];

export const COUNTRIES: Country[] = [
  {
    code: "IN",
    name: "India",
    currency: "INR",
    regionLabel: "State",
    regions: IN_STATES,
    postal: { label: "PIN code", pattern: /^[1-9]\d{5}$/, example: "560001" },
    dialCode: "+91",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    currency: "AED",
    regionLabel: "Emirate",
    regions: AE_EMIRATES,
    dialCode: "+971",
  },
  {
    code: "CA",
    name: "Canada",
    currency: "CAD",
    regionLabel: "Province or territory",
    regions: CA_PROVINCES,
    postal: {
      label: "Postal code",
      pattern: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
      example: "M5V 2T6",
    },
    dialCode: "+1",
  },
  ...EU.map(([code, name, dialCode]) => ({
    code,
    name,
    currency: "EUR" as const,
    postal: {
      label: "Postcode",
      pattern: /^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/,
      example: "",
    },
    dialCode,
  })),
];

export const countryByCode = (code: string) =>
  COUNTRIES.find((c) => c.code === code);
