import type { Metadata } from "next";

import { RecipeCalculatorPage } from "@/components/tools/RecipeCalculatorPage";

export const metadata: Metadata = {
  title: "Recipe Calculator",
};

export default function RecipeCalculatorRoute() {
  return <RecipeCalculatorPage />;
}
