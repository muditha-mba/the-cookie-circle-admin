/** Packaging product item type used for collection item lines. */
export const PACKAGING_ITEM_TYPE_NAME = "Packaging";

export function isPackagingItemType(typeName: string): boolean {
  return typeName.trim().toLowerCase() === PACKAGING_ITEM_TYPE_NAME.toLowerCase();
}
