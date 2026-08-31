import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  Cartesian3,
  Cartographic,
  Color,
  EllipsoidTerrainProvider,
  Entity,
  GeoJsonDataSource,
  HeightReference,
  HorizontalOrigin,
  Ion,
  LabelGraphics,
  LabelStyle,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Viewer,
  VerticalOrigin,
  createWorldTerrainAsync,
  createWorldImageryAsync,
  IonWorldImageryStyle,
} from 'cesium';
import type { CesiumGlobeHandle } from './cesium.types';
import { DEMO_AREA } from '../types/gis';

export const CESIUM_ION_TOKEN = import.meta.env.VITE_CESIUM_ION_TOKEN as string | undefined;
const HAS_TOKEN = Boolean(CESIUM_ION_TOKEN);

interface CesiumGlobeProps {
  onCoordinatesChange?: (coords: { latitude: number; longitude: number; elevation: number }) => void;
  onSelect?: (entity: Entity | null) => void;
  onReady?: (viewer: Viewer) => void;
}

const CesiumGlobe = forwardRef<CesiumGlobeHandle, CesiumGlobeProps>(
  ({ onCoordinatesChange, onSelect, onReady }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer | null>(null);
    const [demoMode, setDemoMode] = useState(!HAS_TOKEN);
    const handlerRef = useRef<ScreenSpaceEventHandler | null>(null);

    useImperativeHandle(ref, (): CesiumGlobeHandle => ({
      getViewer: () => viewerRef.current,
      flyToDemoArea: () => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(
            DEMO_AREA.longitude,
            DEMO_AREA.latitude,
            DEMO_AREA.height,
          ),
          orientation: {
            heading: CesiumMath.toRadians(0),
            pitch: CesiumMath.toRadians(-45),
            roll: 0,
          },
          duration: 2.5,
        });
      },
      zoomIn: () => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        viewer.camera.zoomIn(viewer.camera.positionCartographic.height * 0.3);
      },
      zoomOut: () => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        viewer.camera.zoomOut(viewer.camera.positionCartographic.height * 0.5);
      },
      resetNorth: () => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        viewer.camera.flyTo({
          destination: viewer.camera.positionWC,
          orientation: {
            heading: 0,
            pitch: viewer.camera.pitch,
            roll: 0,
          },
          duration: 1.0,
        });
      },
      goHome: () => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(78.9629, 20.5937, 15_000_000),
          orientation: {
            heading: 0,
            pitch: CesiumMath.toRadians(-90),
            roll: 0,
          },
          duration: 2.0,
        });
      },
      setMode3D: (is3D: boolean) => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        if (is3D) {
          viewer.scene.morphTo3D(1.0);
        } else {
          viewer.scene.morphTo2D(1.0);
        }
      },
      toggleFullscreen: () => {
        const container = containerRef.current;
        if (!container) return;
        if (!document.fullscreenElement) {
          container.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
      },
    }));

    useEffect(() => {
      if (!containerRef.current || viewerRef.current) return;

      let viewer: Viewer;

      if (HAS_TOKEN) {
        try {
          viewer = new Viewer(containerRef.current, {
            baseLayerPicker: false,
            geocoder: false,
            homeButton: false,
            sceneModePicker: false,
            navigationHelpButton: false,
            animation: false,
            timeline: false,
            fullscreenButton: false,
            infoBox: false,
            selectionIndicator: true,
            terrainProvider: undefined,
            baseLayer: false as unknown as undefined,
          });

          // Load real world terrain (3D elevation mountains, valleys)
          createWorldTerrainAsync().then((terrain) => {
            if (!viewer.isDestroyed()) {
              viewer.terrainProvider = terrain;
            }
          }).catch((err) => {
            console.error('Failed to load world terrain', err);
          });

          // Load real satellite imagery (Bing Maps Aerial with labels via Cesium ion)
          createWorldImageryAsync({ style: IonWorldImageryStyle.AERIAL_WITH_LABELS }).then((imagery) => {
            if (!viewer.isDestroyed()) {
              viewer.imageryLayers.addImageryProvider(imagery);
            }
          }).catch((err) => {
            console.error('Failed to load world imagery', err);
          });

          // Enable atmospheric lighting effects for realism
          viewer.scene.globe.enableLighting = true;
          if (viewer.scene.skyAtmosphere) {
            viewer.scene.skyAtmosphere.show = true;
          }
          viewer.scene.fog.enabled = true;
        } catch {
          // Fallback to demo mode if token invalid
          setDemoMode(true);
          viewer = createDemoViewer(containerRef.current);
        }
      } else {
        viewer = createDemoViewer(containerRef.current);
        setDemoMode(true);
      }

      viewerRef.current = viewer;

      // Coordinate tracking via mouse movement
      const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
      handlerRef.current = handler;
      handler.setInputAction((movement: ScreenSpaceEventHandler.MotionEvent) => {
        const cartesian = viewer.camera.pickEllipsoid(
          movement.endPosition,
          viewer.scene.globe.ellipsoid,
        );
        if (cartesian && onCoordinatesChange) {
          const carto = Cartographic.fromCartesian(cartesian);
          onCoordinatesChange({
            latitude: CesiumMath.toDegrees(carto.latitude),
            longitude: CesiumMath.toDegrees(carto.longitude),
            elevation: viewer.scene.globe.getHeight(carto) ?? 0,
          });
        }
      }, ScreenSpaceEventType.MOUSE_MOVE);

      // Selection handling
      handler.setInputAction((click: ScreenSpaceEventHandler.PositionedEvent) => {
        const picked = viewer.scene.pick(click.position);
        if (picked && picked.id instanceof Entity) {
          onSelect?.(picked.id as Entity);
        } else {
          onSelect?.(null);
        }
      }, ScreenSpaceEventType.LEFT_CLICK);

      onReady?.(viewer);

      return () => {
        handler.destroy();
        handlerRef.current = null;
        if (viewer && !viewer.isDestroyed()) {
          viewer.destroy();
        }
        viewerRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div className="relative h-full w-full">
        <div ref={containerRef} className="absolute inset-0 cesium-container" />
        {demoMode && (
          <div className="pointer-events-none absolute top-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-amber-400/40 bg-amber-500/15 px-4 py-1.5 text-xs font-medium text-amber-200 backdrop-blur-md">
            DEMO MODE — No Cesium ion token. Add VITE_CESIUM_ION_TOKEN for full imagery &amp; terrain.
          </div>
        )}
      </div>
    );
  },
);

CesiumGlobe.displayName = 'CesiumGlobe';
export default CesiumGlobe;

// ─── Demo Viewer (no ion token) ──────────────────────────────────────────────

function createDemoViewer(container: HTMLElement): Viewer {
  const viewer = new Viewer(container, {
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    infoBox: false,
    selectionIndicator: true,
    terrainProvider: new EllipsoidTerrainProvider(),
    baseLayer: false as unknown as undefined,
  });

  // Remove default imagery layers for demo mode
  viewer.imageryLayers.removeAll(true);

  // Add demo parcels as GeoJSON around Bengaluru
  loadDemoParcels(viewer);

  // Set initial camera over India
  viewer.camera.setView({
    destination: Cartesian3.fromDegrees(78.9629, 20.5937, 15_000_000),
    orientation: {
      heading: 0,
      pitch: CesiumMath.toRadians(-90),
      roll: 0,
    },
  });

  return viewer;
}

async function loadDemoParcels(viewer: Viewer) {
  const parcelsGeoJSON = {
    type: 'FeatureCollection',
    features: [
      makeParcel(77.5910, 12.9680, 'ULPIN-KAR-001'),
      makeParcel(77.5960, 12.9680, 'ULPIN-KAR-002'),
      makeParcel(77.5910, 12.9720, 'ULPIN-KAR-003'),
      makeParcel(77.5960, 12.9720, 'ULPIN-KAR-004'),
      makeParcel(77.5946, 12.9716, 'ULPIN-KAR-005'),
    ],
  };

  try {
    const dataSource = await GeoJsonDataSource.load(parcelsGeoJSON, {
      stroke: Color.fromCssColorString('#22d3ee'),
      fill: Color.fromCssColorString('#22d3ee').withAlpha(0.15),
      strokeWidth: 2,
      clampToGround: true,
    });
    dataSource.name = 'Demo Parcels';
    viewer.dataSources.add(dataSource);

    // Add labels for each entity
    dataSource.entities.values.forEach((entity) => {
      if (entity.position) {
        const labelText = entity.properties?.get('ulpin')?.getValue() ?? '';
        entity.label = new LabelGraphics({
          text: labelText,
          font: '12px sans-serif',
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 2,
          style: LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: VerticalOrigin.BOTTOM,
          horizontalOrigin: HorizontalOrigin.CENTER,
          heightReference: HeightReference.CLAMP_TO_GROUND,
          showBackground: true,
          backgroundColor: Color.fromCssColorString('#0f172a').withAlpha(0.7),
        });
      }
    });
  } catch (err) {
    console.error('Failed to load demo parcels', err);
  }
}

function makeParcel(centerLng: number, centerLat: number, ulpin: string) {
  const size = 0.003;
  const coords = [
    [centerLng - size, centerLat - size],
    [centerLng + size, centerLat - size],
    [centerLng + size, centerLat + size],
    [centerLng - size, centerLat + size],
    [centerLng - size, centerLat - size],
  ];
  return {
    type: 'Feature',
    properties: { ulpin, type: 'parcel' },
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
  };
}

// ─── Cesium ion token setup ──────────────────────────────────────────────────
if (CESIUM_ION_TOKEN) {
  Ion.defaultAccessToken = CESIUM_ION_TOKEN;
}
