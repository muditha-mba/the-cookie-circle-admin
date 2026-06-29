/** Default map viewport (Kandy, Sri Lanka). Override via env for other regions. */

const DEFAULT_LAT = 7.2906;
const DEFAULT_LNG = 80.6337;
const DEFAULT_ZOOM = 13;

function parseCoord(value: string | undefined, fallback: number): number {
  if (!value?.trim()) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const mapConfig = {
  defaultCenter: {
    lat: parseCoord(process.env.NEXT_PUBLIC_MAP_DEFAULT_LAT, DEFAULT_LAT),
    lng: parseCoord(process.env.NEXT_PUBLIC_MAP_DEFAULT_LNG, DEFAULT_LNG),
  },
  defaultZoom: parseCoord(process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM, DEFAULT_ZOOM),
  tileAttribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
} as const;
