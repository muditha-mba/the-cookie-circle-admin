"use client";

import "leaflet/dist/leaflet.css";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import { formInputClassName } from "@/components/forms/FormField";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { mapConfig } from "@/lib/map/config";
import {
  parseNominatimAddress,
  searchPlaces,
  type NominatimSearchResult,
  type ParsedDeliveryAddress,
} from "@/lib/map/nominatim";
import { deliveryMarkerIcon } from "@/lib/map/marker-icon";
import { cn } from "@/lib/utils";

export type DeliveryLocationPickerProps = {
  latitude: string;
  longitude: string;
  onChange: (latitude: string, longitude: string) => void;
  onAddressSelect?: (address: ParsedDeliveryAddress) => void;
  readOnly?: boolean;
  className?: string;
};

function parseCoordinate(value: string): number | null {
  if (!value.trim()) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatCoordinate(value: number): string {
  return value.toFixed(7);
}

function MapViewportSync({ lat, lng, zoom }: { lat: number; lng: number; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom ?? map.getZoom(), { animate: true });
  }, [lat, lng, zoom, map]);
  return null;
}

function MapClickHandler({
  disabled,
  onPick,
}: {
  disabled: boolean;
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      if (disabled) {
        return;
      }
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export function DeliveryLocationPicker({
  latitude,
  longitude,
  onChange,
  onAddressSelect,
  readOnly = false,
  className,
}: DeliveryLocationPickerProps) {
  const lat = parseCoordinate(latitude);
  const lng = parseCoordinate(longitude);
  const hasPosition = lat != null && lng != null;

  const initialCenter = useMemo(
    () =>
      hasPosition
        ? ([lat, lng] as [number, number])
        : ([mapConfig.defaultCenter.lat, mapConfig.defaultCenter.lng] as [number, number]),
    [hasPosition, lat, lng],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<NominatimSearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const debouncedSearch = useDebouncedValue(searchQuery, 700);

  useEffect(() => {
    setMapReady(true);
  }, []);

  const setPosition = useCallback(
    (nextLat: number, nextLng: number, zoom?: number) => {
      onChange(formatCoordinate(nextLat), formatCoordinate(nextLng));
      setFlyTo({ lat: nextLat, lng: nextLng, zoom: zoom ?? 15 });
    },
    [onChange],
  );

  const clearPosition = () => {
    onChange("", "");
    setFlyTo(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  useEffect(() => {
    if (readOnly || debouncedSearch.trim().length < 3) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await searchPlaces(debouncedSearch, { countryCodes: "lk" });
        if (!cancelled) {
          setSearchResults(results);
        }
      } catch (error) {
        if (!cancelled) {
          setSearchResults([]);
          setSearchError(
            error instanceof Error ? error.message : "Unable to search locations.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, readOnly]);

  const handleSelectResult = (result: NominatimSearchResult) => {
    const nextLat = Number(result.lat);
    const nextLng = Number(result.lon);
    if (!Number.isFinite(nextLat) || !Number.isFinite(nextLng)) {
      return;
    }
    setPosition(nextLat, nextLng, 16);
    setSearchQuery(result.display_name);
    setSearchOpen(false);
    setSearchResults([]);
    if (result.address && onAddressSelect) {
      onAddressSelect(parseNominatimAddress(result.address));
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {!readOnly ? (
        <div className="relative">
          <label className="mb-1 block text-xs font-medium text-text-secondary">
            Search location
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search address or place (Sri Lanka)"
              className={cn(formInputClassName, "pl-9 pr-10")}
              autoComplete="off"
            />
            {isSearching ? (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-muted" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          {searchOpen && (searchResults.length > 0 || searchError || isSearching) ? (
            <ul
              role="listbox"
              className="absolute z-30 mt-1 max-h-52 w-full overflow-auto rounded-md border border-border bg-surface py-1 shadow-lg"
            >
              {isSearching ? (
                <li className="px-3 py-2 text-sm text-text-muted">Searching…</li>
              ) : searchError ? (
                <li className="px-3 py-2 text-sm text-danger">{searchError}</li>
              ) : (
                searchResults.map((result) => (
                  <li key={result.place_id}>
                    <button
                      type="button"
                      role="option"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-surface-hover"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelectResult(result)}
                    >
                      <span className="block text-text-primary">{result.display_name}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : null}
          <p className="mt-1 text-xs text-text-muted">
            Or click the map to drop a pin. Search powered by OpenStreetMap Nominatim.
          </p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border">
        {mapReady ? (
          <MapContainer
            center={initialCenter}
            zoom={hasPosition ? 15 : mapConfig.defaultZoom}
            className="z-0 h-[280px] w-full"
            scrollWheelZoom={!readOnly}
          >
            <TileLayer attribution={mapConfig.tileAttribution} url={mapConfig.tileUrl} />
            {flyTo ? (
              <MapViewportSync lat={flyTo.lat} lng={flyTo.lng} zoom={flyTo.zoom} />
            ) : null}
            {!readOnly ? (
              <MapClickHandler
                disabled={readOnly}
                onPick={(nextLat, nextLng) => setPosition(nextLat, nextLng)}
              />
            ) : null}
            {hasPosition ? (
              <Marker
                key={`${lat}-${lng}`}
                position={[lat, lng]}
                icon={deliveryMarkerIcon}
                zIndexOffset={1000}
                draggable={!readOnly}
                eventHandlers={
                  readOnly
                    ? undefined
                    : {
                        dragend: (event) => {
                          const { lat: nextLat, lng: nextLng } = event.target.getLatLng();
                          setPosition(nextLat, nextLng);
                        },
                      }
                }
              />
            ) : null}
          </MapContainer>
        ) : (
          <div className="flex h-[280px] items-center justify-center bg-surface-hover text-sm text-text-muted">
            Loading map…
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {hasPosition ? (
            <>
              {formatCoordinate(lat)}, {formatCoordinate(lng)}
            </>
          ) : (
            "No delivery pin set"
          )}
        </span>
        {!readOnly && hasPosition ? (
          <button
            type="button"
            onClick={clearPosition}
            className="text-danger hover:underline"
          >
            Clear pin
          </button>
        ) : null}
      </div>
    </div>
  );
}
