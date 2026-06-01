/** OpenStreetMap Nominatim geocoding (admin-only, rate-limited). */

export type NominatimAddress = Record<string, string>;

export type NominatimSearchResult = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
};

const NOMINATIM_SEARCH = "https://nominatim.openstreetmap.org/search";
const USER_AGENT =
  process.env.NEXT_PUBLIC_NOMINATIM_USER_AGENT ??
  "TheCookieCircleAdmin/1.0 (delivery-location-picker)";

let lastRequestAt = 0;

async function waitForRateLimit() {
  const elapsed = Date.now() - lastRequestAt;
  const waitMs = Math.max(0, 1100 - elapsed);
  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  lastRequestAt = Date.now();
}

export async function searchPlaces(
  query: string,
  options?: { countryCodes?: string },
): Promise<NominatimSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) {
    return [];
  }

  await waitForRateLimit();

  const params = new URLSearchParams({
    q: trimmed,
    format: "json",
    addressdetails: "1",
    limit: "6",
  });
  if (options?.countryCodes) {
    params.set("countrycodes", options.countryCodes);
  }

  const response = await fetch(`${NOMINATIM_SEARCH}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error("Location search is temporarily unavailable.");
  }

  return (await response.json()) as NominatimSearchResult[];
}

export type ParsedDeliveryAddress = {
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  postal_code?: string;
  landmark?: string;
};

/** Map Nominatim address parts into order delivery fields. */
export function parseNominatimAddress(address: NominatimAddress): ParsedDeliveryAddress {
  const line1 = [address.house_number, address.road, address.pedestrian, address.residential]
    .filter(Boolean)
    .join(" ")
    .trim();

  const line2 = [address.suburb, address.neighbourhood, address.quarter]
    .filter(Boolean)
    .join(", ")
    .trim();

  const city =
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    address.county;

  const landmark = address.amenity ?? address.building ?? address.shop;

  return {
    address_line_1: line1 || undefined,
    address_line_2: line2 || undefined,
    city: city || undefined,
    postal_code: address.postcode || undefined,
    landmark: landmark || undefined,
  };
}
