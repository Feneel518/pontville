"use client";

import * as React from "react";
import mapboxgl from "mapbox-gl";
import { Button } from "@/components/ui/button";

type MapboxMapProps = {
  lng: number;
  lat: number;
  zoom?: number;
  className?: string;
  markerLabel?: string;
  height?: string; // add this
};

export default function MapboxMap({
  lng,
  lat,
  zoom = 16.5,
  className = "",
  markerLabel = "Location",
  height = "h-[380px] md:h-[460px]",
}: MapboxMapProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);

  // keep defaults stable for reset
  const initialViewRef = React.useRef({
    center: [lng, lat] as [number, number],
    zoom,
    pitch: 55,
    bearing: -25,
  });

  // Update initial view if props change (e.g. navigating to another location)
  React.useEffect(() => {
    initialViewRef.current = {
      center: [lng, lat],
      zoom,
      pitch: 55,
      bearing: -25,
    };
  }, [lng, lat, zoom]);

  const onReset = React.useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const v = initialViewRef.current;
    map.flyTo({
      center: v.center,
      zoom: v.zoom,
      pitch: v.pitch,
      bearing: v.bearing,
      duration: 900,
      essential: true,
    });
  }, []);

  React.useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("Missing NEXT_PUBLIC_MAPBOX_TOKEN");
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [lng, lat],
      zoom,
      pitch: 55,
      bearing: -25,
      antialias: true,
    });

    mapRef.current = map;

    map.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "top-right",
    );

    // ✅ ensure correct sizing once style is ready
    map.on("load", () => {
      map.resize();
    });

    // ✅ ensure correct sizing on any container resize
    const ro = new ResizeObserver(() => {
      map.resize();
    });
    ro.observe(containerRef.current);
    // ----- Pointer Marker (Pin) -----
    const pin = document.createElement("div");
    pin.innerHTML = `
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" fill="#111827"/>
        <circle cx="12" cy="10" r="2.6" fill="#ffffff"/>
      </svg>
    `;
    pin.style.transform = "translateY(-16px)";

    new mapboxgl.Marker({ element: pin, anchor: "bottom" })
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 18 }).setHTML(
          `<div style="font-size:14px;font-weight:600;">${markerLabel}</div>`,
        ),
      )
      .addTo(map);

    // ----- 3D Buildings -----
    map.on("load", () => {
      const layers = map.getStyle().layers || [];
      const labelLayerId = layers.find(
        (l) => l.type === "symbol" && (l.layout as any)?.["text-field"],
      )?.id;

      map.addLayer(
        {
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 14,
          paint: {
            "fill-extrusion-color": "#d1d5db",
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": ["get", "min_height"],
            "fill-extrusion-opacity": 0.92,
          },
        },
        labelLayerId,
      );
    });

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [lng, lat, zoom, markerLabel]);

  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl ring-1 ring-black/10",
        className,
      ].join(" ")}>
      {/* Reset button overlay */}
      <div className="absolute left-3 top-3 z-10">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onReset}
          className="backdrop-blur supports-backdrop-filter:bg-background/70">
          Reset view
        </Button>
      </div>

      <div ref={containerRef} className={`${height} w-full`} />
    </div>
  );
}
