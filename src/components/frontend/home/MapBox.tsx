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

// "use client";

// import * as React from "react";
// import mapboxgl from "mapbox-gl";
// import { Button } from "@/components/ui/button";

// type MapboxMapProps = {
//   lng: number;
//   lat: number;
//   zoom?: number;
//   className?: string;
//   markerLabel?: string;
//   height?: string;
// };

// <style jsx>{`
//   @keyframes markerPulse {
//     0% {
//       transform: scale(0.9);
//       opacity: 0.7;
//     }
//     70% {
//       transform: scale(1.6);
//       opacity: 0;
//     }
//     100% {
//       transform: scale(1.6);
//       opacity: 0;
//     }
//   }
// `}</style>;

// function createRestaurantMarker(label: string) {
//   const wrapper = document.createElement("div");

//   wrapper.style.position = "relative";
//   wrapper.style.width = "56px";
//   wrapper.style.height = "56px";
//   wrapper.style.cursor = "pointer";

//   // Soft glow ring
//   const glow = document.createElement("div");
//   glow.style.position = "absolute";
//   glow.style.inset = "0";
//   glow.style.borderRadius = "999px";
//   glow.style.background = "rgba(0,0,0,0.08)";
//   glow.style.filter = "blur(8px)";
//   glow.style.transform = "scale(1.2)";

//   // Pulse ring
//   const pulse = document.createElement("div");
//   pulse.style.position = "absolute";
//   pulse.style.inset = "0";
//   pulse.style.borderRadius = "999px";
//   pulse.style.background = "rgba(220,38,38,0.25)";
//   pulse.style.animation = "markerPulse 2s ease-out infinite";

//   // Main pin
//   const pin = document.createElement("div");
//   pin.style.position = "relative";
//   pin.style.width = "56px";
//   pin.style.height = "56px";
//   pin.style.borderRadius = "999px";
//   pin.style.background = "linear-gradient(135deg,#ef4444,#b91c1c)";
//   pin.style.display = "flex";
//   pin.style.alignItems = "center";
//   pin.style.justifyContent = "center";
//   pin.style.boxShadow = "0 20px 40px rgba(0,0,0,0.35)";
//   pin.style.border = "4px solid white";
//   pin.style.zIndex = "2";

//   // Inner icon (restaurant emoji — clean fallback)
//   const icon = document.createElement("div");
//   icon.innerText = "🍽";
//   icon.style.fontSize = "22px";
//   icon.style.lineHeight = "1";

//   pin.appendChild(icon);

//   wrapper.appendChild(glow);
//   wrapper.appendChild(pulse);
//   wrapper.appendChild(pin);

//   return wrapper;
// }

// export default function MapboxMap({
//   lng,
//   lat,
//   zoom = 16.5,
//   className = "",
//   markerLabel = "Restaurant",
//   height = "h-[380px] md:h-[460px]",
// }: MapboxMapProps) {
//   const containerRef = React.useRef<HTMLDivElement | null>(null);
//   const mapRef = React.useRef<mapboxgl.Map | null>(null);
//   const markerRef = React.useRef<mapboxgl.Marker | null>(null);

//   const initialViewRef = React.useRef({
//     center: [lng, lat] as [number, number],
//     zoom,
//     pitch: 55,
//     bearing: -25,
//   });

//   React.useEffect(() => {
//     initialViewRef.current = {
//       center: [lng, lat],
//       zoom,
//       pitch: 55,
//       bearing: -25,
//     };
//   }, [lng, lat, zoom]);

//   const onReset = React.useCallback(() => {
//     const map = mapRef.current;
//     if (!map) return;

//     const v = initialViewRef.current;
//     map.flyTo({
//       center: v.center,
//       zoom: v.zoom,
//       pitch: v.pitch,
//       bearing: v.bearing,
//       duration: 900,
//       essential: true,
//     });
//   }, []);

//   React.useEffect(() => {
//     if (!containerRef.current) return;

//     const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
//     if (!token) {
//
//       return;
//     }

//     mapboxgl.accessToken = token;

//     const map = new mapboxgl.Map({
//       container: containerRef.current,
//       style: "mapbox://styles/mapbox/light-v11",
//       center: [lng, lat],
//       zoom,
//       pitch: 55,
//       bearing: -25,
//       antialias: true,
//     });

//     mapRef.current = map;

//     map.addControl(
//       new mapboxgl.NavigationControl({ visualizePitch: true }),
//       "top-right",
//     );

//     const resizeObserver = new ResizeObserver(() => {
//       map.resize();
//     });

//     resizeObserver.observe(containerRef.current);

//     map.on("load", () => {
//       map.resize();

//    const markerEl = createRestaurantMarker(markerLabel);

//   const marker = new mapboxgl.Marker({
//      element: markerEl,
//      anchor: "bottom",
//    })
//      .setLngLat([lng, lat])
//      .setPopup(
//        new mapboxgl.Popup({
//          offset: 25,
//          closeButton: false,
//        }).setHTML(
//          `<div style="font-size:14px;font-weight:600;">${markerLabel}</div>`,
//        ),
//      )
//      .addTo(map);

//       markerRef.current = marker;

//       const layers = map.getStyle().layers || [];
//       const labelLayerId = layers.find(
//         (l) => l.type === "symbol" && (l.layout as any)?.["text-field"],
//       )?.id;

//       if (!map.getLayer("3d-buildings")) {
//         map.addLayer(
//           {
//             id: "3d-buildings",
//             source: "composite",
//             "source-layer": "building",
//             filter: ["==", "extrude", "true"],
//             type: "fill-extrusion",
//             minzoom: 14,
//             paint: {
//               "fill-extrusion-color": "#d1d5db",
//               "fill-extrusion-height": ["get", "height"],
//               "fill-extrusion-base": ["get", "min_height"],
//               "fill-extrusion-opacity": 0.82,
//             },
//           },
//           labelLayerId,
//         );
//       }

//       marker.togglePopup();
//     });

//     return () => {
//       resizeObserver.disconnect();

//       if (markerRef.current) {
//         markerRef.current.remove();
//         markerRef.current = null;
//       }

//       map.remove();
//       mapRef.current = null;
//     };
//   }, [lng, lat, zoom, markerLabel]);

//   return (
//     <div
//       className={[
//         "relative overflow-hidden rounded-2xl ring-1 ring-black/10",
//         className,
//       ].join(" ")}>
//       <style jsx>{`
//         @keyframes map-pulse {
//           0% {
//             transform: scale(0.9);
//             opacity: 0.9;
//           }
//           70% {
//             transform: scale(1.4);
//             opacity: 0;
//           }
//           100% {
//             transform: scale(1.4);
//             opacity: 0;
//           }
//         }
//       `}</style>

//       <div className="absolute left-3 top-3 z-10">
//         <Button
//           type="button"
//           variant="secondary"
//           size="sm"
//           onClick={onReset}
//           className="backdrop-blur supports-backdrop-filter:bg-background/70">
//           Reset view
//         </Button>
//       </div>

//       <div ref={containerRef} className={`${height} w-full`} />
//     </div>
//   );
// }
