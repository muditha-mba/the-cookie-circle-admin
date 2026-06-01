import L from "leaflet";

/** Served from /public — stable URL in Next.js (no bundler path issues). */
export const DELIVERY_MARKER_ICON_URL = "/map-location-pointer-icon.png";

/** Display size on map (source asset is 350×350). */
const ICON_WIDTH = 44;
const ICON_HEIGHT = 44;

/**
 * Tip of the pin sits at the bottom center of the image.
 * iconAnchor is the pixel offset from the top-left that aligns with lat/lng.
 */
export const deliveryMarkerIcon = L.icon({
  iconUrl: DELIVERY_MARKER_ICON_URL,
  iconSize: [ICON_WIDTH, ICON_HEIGHT],
  iconAnchor: [ICON_WIDTH / 2, ICON_HEIGHT],
  popupAnchor: [0, -ICON_HEIGHT + 4],
  className: "delivery-location-marker",
});
