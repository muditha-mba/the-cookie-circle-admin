/**
 * Display titles for collection size SKUs and collection types.
 * Keep in sync with API `app/utils/collection_display_name.py`.
 */

const SIZE_NAME_TO_DISPLAY: Record<string, string> = {
  "the little circle": "Chocolate Chip Cookie Collection",
  "the family circle": "Chocolate Chip Cookie Collection",
  "the party circle": "Chocolate Chip Cookie Collection",
  "the tea circle": "The Butter Cookie Collection",
  "the warm circle": "The Butter Cookie Collection",
  "the gathering circle": "The Butter Cookie Collection",
};

const PACKAGE_CODE_TO_COLLECTION_DISPLAY: Record<string, string> = {
  MIX_AND_MATCH: "Chocolate Chip Cookie Collection",
  BUTTER_COLLECTION: "The Butter Cookie Collection",
};

const PACKAGE_CODE_TO_TYPE_DISPLAY: Record<string, string> = {
  MIX_AND_MATCH: "Favourite Cookies",
  BUTTER_COLLECTION: "Tea Time Cookies",
};

const PACKAGE_NAME_TO_TYPE_DISPLAY: Record<string, string> = {
  "mix and match": "Favourite Cookies",
  "butter collection": "Tea Time Cookies",
  "special edition": "Special Edition",
};

export function formatCollectionDisplayName(
  name: string,
  packageCode?: string | null,
): string {
  const code = (packageCode ?? "").trim().toUpperCase();
  if (code && PACKAGE_CODE_TO_COLLECTION_DISPLAY[code]) {
    return PACKAGE_CODE_TO_COLLECTION_DISPLAY[code];
  }

  return SIZE_NAME_TO_DISPLAY[name.trim().toLowerCase()] ?? name;
}

export function formatPackageTypeDisplayName(
  name: string,
  packageCode?: string | null,
): string {
  const code = (packageCode ?? "").trim().toUpperCase();
  if (code && PACKAGE_CODE_TO_TYPE_DISPLAY[code]) {
    return PACKAGE_CODE_TO_TYPE_DISPLAY[code];
  }

  return PACKAGE_NAME_TO_TYPE_DISPLAY[name.trim().toLowerCase()] ?? name;
}
