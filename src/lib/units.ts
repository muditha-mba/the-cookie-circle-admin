export type UnitOption = {
  value: string;
  label: string;
  group: string;
};

/** Canonical measurement units used across admin forms. Values are stored lowercase. */
export const MEASUREMENT_UNITS: UnitOption[] = [
  { value: "grams", label: "Grams (g)", group: "Mass" },
  { value: "kilograms", label: "Kilograms (kg)", group: "Mass" },
  { value: "milligrams", label: "Milligrams (mg)", group: "Mass" },
  { value: "ounces", label: "Ounces (oz)", group: "Mass" },
  { value: "pounds", label: "Pounds (lb)", group: "Mass" },

  { value: "millilitres", label: "Millilitres (ml)", group: "Volume" },
  { value: "litres", label: "Litres (l)", group: "Volume" },
  { value: "teaspoons", label: "Teaspoons (tsp)", group: "Volume" },
  { value: "tablespoons", label: "Tablespoons (tbsp)", group: "Volume" },
  { value: "cups", label: "Cups", group: "Volume" },

  { value: "units", label: "Units", group: "Count & packaging" },
  { value: "pieces", label: "Pieces", group: "Count & packaging" },
  { value: "packs", label: "Packs", group: "Count & packaging" },
  { value: "boxes", label: "Boxes", group: "Count & packaging" },
  { value: "bags", label: "Bags", group: "Count & packaging" },
  { value: "bottles", label: "Bottles", group: "Count & packaging" },
  { value: "cans", label: "Cans", group: "Count & packaging" },
  { value: "trays", label: "Trays", group: "Count & packaging" },
  { value: "servings", label: "Servings", group: "Count & packaging" },
  { value: "dozen", label: "Dozen", group: "Count & packaging" },
  { value: "pairs", label: "Pairs", group: "Count & packaging" },
  { value: "rolls", label: "Rolls", group: "Count & packaging" },
  { value: "sheets", label: "Sheets", group: "Count & packaging" },

  { value: "hours", label: "Hours", group: "Time & energy" },
  { value: "minutes", label: "Minutes", group: "Time & energy" },
  { value: "days", label: "Days", group: "Time & energy" },
  { value: "kwh", label: "kWh", group: "Time & energy" },

  { value: "metres", label: "Metres (m)", group: "Length" },
  { value: "centimetres", label: "Centimetres (cm)", group: "Length" },
];

export const MEASUREMENT_UNIT_VALUES = MEASUREMENT_UNITS.map((unit) => unit.value);

const UNIT_VALUE_SET = new Set(MEASUREMENT_UNIT_VALUES);

const UNIT_GROUPS = MEASUREMENT_UNITS.reduce<Record<string, UnitOption[]>>((groups, unit) => {
  if (!groups[unit.group]) {
    groups[unit.group] = [];
  }
  groups[unit.group].push(unit);
  return groups;
}, {});

export function normalizeUnit(value: string): string {
  return value.trim().toLowerCase();
}

export function isKnownUnit(value: string): boolean {
  return UNIT_VALUE_SET.has(normalizeUnit(value));
}

export function isAllowedUnit(value: string, extraValues: string[] = []): boolean {
  const normalized = normalizeUnit(value);
  if (!normalized) {
    return false;
  }
  if (UNIT_VALUE_SET.has(normalized)) {
    return true;
  }
  return extraValues.map(normalizeUnit).includes(normalized);
}

export function getUnitGroups(extraValue?: string | null): Record<string, UnitOption[]> {
  const normalizedExtra = extraValue ? normalizeUnit(extraValue) : "";
  if (!normalizedExtra || isKnownUnit(normalizedExtra)) {
    return UNIT_GROUPS;
  }

  return {
    Other: [{ value: normalizedExtra, label: `${normalizedExtra} (existing)`, group: "Other" }],
    ...UNIT_GROUPS,
  };
}

export const DEFAULT_UNIT = "grams";

/** Use empty string in forms when reorder should follow the purchase unit. */
export function normalizeReorderUnitForForm(
  reorderUnit: string | null | undefined,
  purchaseUnit: string,
): string {
  const reorder = (reorderUnit ?? "").trim();
  if (!reorder) {
    return "";
  }
  if (normalizeUnit(reorder) === normalizeUnit(purchaseUnit)) {
    return "";
  }
  return normalizeUnit(reorder);
}
