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
  PolygonHierarchy,
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
import type { Building, VerticalProperty, ExplodeState, Floor } from '../types/cadastral';
import {
  footprintToCartesian,
  computeExplodedZ,
  makeFloorLabel,
  colorFromRgba,
} from '../utils/cesium3dHelpers';
import { STATUS_COLORS, SELECTED_COLOR, UNDERGROUND_COLOR, PARCEL_COLOR } from '../data/colors';

export const CESIUM_ION_TOKEN = import.meta.env.VITE_CESIUM_ION_TOKEN as string | undefined;
const HAS_TOKEN = Boolean(CESIUM_ION_TOKEN);

interface CesiumGlobeProps {
  building?: Building;
  properties?: VerticalProperty[];
  selectedFloorId?: string | null;
  explodeState?: ExplodeState;
  showUnderground?: boolean;
  onCoordinatesChange?: (coords: { latitude: number; longitude: number; elevation: number }) => void;
  onSelect?: (entity: Entity | null) => void;
  onSelectFloor?: (floorId: string) => void;
  onReady?: (viewer: Viewer) => void;
}

const CesiumGlobe = forwardRef<CesiumGlobeHandle, CesiumGlobeProps>(
  (
    {
      building,
      properties = [],
      selectedFloorId,
      explodeState = 'collapsed',
      showUnderground = true,
      onCoordinatesChange,
      onSelect,
      onSelectFloor,
      onReady,
    },
    ref
  ) => {
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
            DEMO_AREA.height
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

    // Viewer Initialization
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

          createWorldTerrainAsync()
            .then((terrain) => {
              if (!viewer.isDestroyed()) {
                viewer.terrainProvider = terrain;
              }
            })
            .catch((err) => console.error('Failed to load world terrain', err));

          createWorldImageryAsync({ style: IonWorldImageryStyle.AERIAL_WITH_LABELS })
            .then((imagery) => {
              if (!viewer.isDestroyed()) {
                viewer.imageryLayers.addImageryProvider(imagery);
              }
            })
            .catch((err) => console.error('Failed to load world imagery', err));

          viewer.scene.globe.enableLighting = true;
          if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = true;
          viewer.scene.fog.enabled = true;
        } catch {
          setDemoMode(true);
          viewer = createDemoViewer(containerRef.current);
        }
      } else {
        viewer = createDemoViewer(containerRef.current);
        setDemoMode(true);
      }

      viewerRef.current = viewer;

      // Enable depth testing for 3D floors
      viewer.scene.globe.depthTestAgainstTerrain = true;

      // Coordinate tracking via mouse movement
      const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
      handlerRef.current = handler;

      handler.setInputAction((movement: ScreenSpaceEventHandler.MotionEvent) => {
        const cartesian = viewer.camera.pickEllipsoid(
          movement.endPosition,
          viewer.scene.globe.ellipsoid
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

      // Unified Click Handling: floor selection or parcel selection
      handler.setInputAction((click: ScreenSpaceEventHandler.PositionedEvent) => {
        const picked = viewer.scene.pick(click.position);
        if (picked && picked.id) {
          const entity = picked.id;
          if (typeof entity.id === 'string' && entity.id.startsWith('floor-')) {
            const floorId = entity.id.replace('floor-', '');
            onSelectFloor?.(floorId);
          } else if (entity instanceof Entity) {
            onSelect?.(entity);
          }
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

    // Render 3D Exploded Floor Volumes
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer || !building) return;

      // Remove existing custom 3D floor entities
      const toRemove = viewer.entities.values.filter(
        (e) => e.id.startsWith('floor-') || e.id.startsWith('parcel-outline')
      );
      toRemove.forEach((e) => viewer.entities.remove(e));

      // 1. Parcel 2D Ground Footprint Outline
      const parcelPositions = footprintToCartesian(building.footprint, 0);
      viewer.entities.add({
        id: 'parcel-outline',
        polygon: {
          hierarchy: new PolygonHierarchy(parcelPositions),
          material: colorFromRgba(PARCEL_COLOR.cesium),
          outline: true,
          outlineColor: Color.fromCssColorString('#38bdf8'),
          outlineWidth: 2,
        },
      });

      // 2. 3D Floor Extruded Volumes
      const explodeFactor = explodeState === 'exploded' ? 1 : 0;

      building.floors.forEach((floor: Floor) => {
        const prop = properties.find((p) => p.floorId === floor.id);
        if (!prop) return;
        if (floor.isUnderground && !showUnderground) return;

        const { zMin, zMax } = computeExplodedZ(floor, explodeFactor);
        const positions = [
          ...footprintToCartesian(building.footprint, zMin),
          ...footprintToCartesian(building.footprint, zMax),
        ];

        let color: Color;
        if (selectedFloorId === floor.id) {
          color = colorFromRgba(SELECTED_COLOR.cesium);
        } else if (floor.isUnderground) {
          color = colorFromRgba(UNDERGROUND_COLOR.cesium);
        } else {
          color = colorFromRgba(STATUS_COLORS[prop.status].cesium);
        }

        const isSelected = selectedFloorId === floor.id;

        viewer.entities.add({
          id: `floor-${floor.id}`,
          polygon: {
            hierarchy: new PolygonHierarchy(positions),
            material: color,
            outline: true,
            outlineColor: isSelected
              ? Color.fromCssColorString('#38bdf8')
              : Color.fromCssColorString('#cbd5e1'),
            outlineWidth: isSelected ? 3 : 1,
            perPositionHeight: true,
          },
        });

        makeFloorLabel(
          viewer,
          building,
          floor,
          explodeFactor,
          `${floor.label}\n${prop.vpid}`
        );
      });
    }, [building, properties, explodeState, selectedFloorId, showUnderground]);

    // Handle Sub-surface Ground Translucency (Underground Mode)
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer) return;
      if (showUnderground) {
        viewer.scene.globe.translucency.enabled = true;
        viewer.scene.globe.translucency.frontFaceAlpha = 0.45;
        viewer.scene.globe.translucency.backFaceAlpha = 0.45;
      } else {
        viewer.scene.globe.translucency.enabled = false;
        viewer.scene.globe.translucency.frontFaceAlpha = 1.0;
        viewer.scene.globe.translucency.backFaceAlpha = 1.0;
      }
    }, [showUnderground]);

    return (
      <div className="relative h-full w-full">
        <div ref={containerRef} className="absolute inset-0 cesium-container" />
        {demoMode && (
          <div className="pointer-events-none absolute top-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-amber-400/40 bg-amber-500/15 px-4 py-1.5 text-xs font-medium text-amber-200 backdrop-blur-md">
            DEMO MODE — High-fidelity 3D Cadastral &amp; Subsurface Mapping Active.
          </div>
        )}
      </div>
    );
  }
);

CesiumGlobe.displayName = 'CesiumGlobe';
export default CesiumGlobe;

// Demo Viewer Builder
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

  viewer.imageryLayers.removeAll(true);
  loadDemoParcels(viewer);

  viewer.camera.setView({
    destination: Cartesian3.fromDegrees(77.5946, 12.9716, 800),
    orientation: {
      heading: CesiumMath.toRadians(35),
      pitch: CesiumMath.toRadians(-30),
      roll: 0,
    },
  });

  return viewer;
}

async function loadDemoParcels(viewer: Viewer) {
  const parcelsGeoJSON = {
    type: 'FeatureCollection',
    features: [
      makeParcel(77.5910, 12.9680, 'ULPIN-IN-MH-2026-89420'),
      makeParcel(77.5960, 12.9680, 'ULPIN-IN-MH-2026-89422'),
      makeParcel(77.5910, 12.9720, 'ULPIN-IN-MH-2026-89423'),
      makeParcel(77.5946, 12.9716, 'ULPIN-IN-MH-2026-89421'),
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

    dataSource.entities.values.forEach((entity) => {
      if (entity.position) {
        const labelText = entity.properties?.get('ulpin')?.getValue() ?? '';
        entity.label = new LabelGraphics({
          text: labelText,
          font: '11px Inter, sans-serif',
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 2,
          style: LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: VerticalOrigin.BOTTOM,
          horizontalOrigin: HorizontalOrigin.CENTER,
          heightReference: HeightReference.CLAMP_TO_GROUND,
          showBackground: true,
          backgroundColor: Color.fromCssColorString('#0f172a').withAlpha(0.75),
        });
      }
    });
  } catch (err) {
    console.error('Failed to load demo parcels', err);
  }
}

function makeParcel(centerLng: number, centerLat: number, ulpin: string) {
  const size = 0.0004;
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

if (CESIUM_ION_TOKEN) {
  Ion.defaultAccessToken = CESIUM_ION_TOKEN;
}
