import { z } from "zod";

import { isKnownUnit, normalizeUnit } from "@/lib/units";

export const requiredUnitSchema = z
  .string()
  .trim()
  .min(1, "Unit is required")
  .transform(normalizeUnit)
  .refine(isKnownUnit, { message: "Select a unit from the list" });

export const optionalUnitSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? "" : normalizeUnit(value)))
  .refine((value) => value === "" || isKnownUnit(value), {
    message: "Select a unit from the list",
  });
