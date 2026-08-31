import { useCallback, useRef, useState } from 'react';
import {
  Cartesian3,
  Color,
  Math as CesiumMath,
  Entity,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Viewer,
} from 'cesium';
import type { DataSource, PolylineGraphics } from 'cesium';
import CesiumGlobe from './components/CesiumGlobe';
import type { CesiumGlobeHandle } from './components/cesium.types';
import MapToolbar from './components/MapToolbar';
import LayerManager from './components/LayerManager';
import MapLegend from './components/MapLegend';
import CoordinateDisplay from './components/CoordinateDisplay';
import CameraControls from './components/CameraControls';
import SelectionManager from './components/SelectionManager';
import AppHeader from './components/AppHeader';
import { DEFAULT_LAYERS, DEMO_AREA } from './types/gis';
import type { Coordinates, LayerConfig, SelectionInfo } from './types/gis';

function App() {
  const globeRef = useRef<CesiumGlobeHandle>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const measureHandlerRef = useRef<ScreenSpaceEventHandler | null>(null);
  const measureEntityRef = useRef<Entity | null>(null);
  const measurePointsRef = useRef<Cartesian3[]>([]);

  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [layers, setLayers] = useState<LayerConfig[]>(DEFAULT_LAYERS);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [is3D, setIs3D] = useState(true);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measureInfo, setMeasureInfo] = useState<string | null>(null);

  const handleReady = useCallback((viewer: Viewer) => {
    viewerRef.current = viewer;
  }, []);

  const handleCoordinates = useCallback((coords: Coordinates) => {
    setCoordinates(coords);
  }, []);

  const handleSelect = useCallback((entity: Entity | null) => {
    if (!entity) {
      setSelection(null);
      return;
    }
    const props = entity.properties;
    const kind = props?.get('type')?.getValue() ?? 'parcel';
    const ulpin = props?.get('ulpin')?.getValue() ?? entity.name ?? 'Unknown';
    const data: Record<string, unknown> = {};
    if (props) {
      props.propertyNames.forEach((name: string) => {
        if (name !== 'type' && name !== 'ulpin') {
          data[name] = props.get(name)?.getValue();
        }
      });
    }
    data['ulpin'] = ulpin;
    setSelection({
      kind: kind as SelectionInfo['kind'],
      id: ulpin,
      label: ulpin,
      data,
    });
  }, []);

  // ── Toolbar actions ────────────────────────────────────────────────────
  const handleHome = useCallback(() => globeRef.current?.goHome(), []);
  const handleZoomIn = useCallback(() => globeRef.current?.zoomIn(), []);
  const handleZoomOut = useCallback(() => globeRef.current?.zoomOut(), []);
  const handleResetNorth = useCallback(() => globeRef.current?.resetNorth(), []);
  const handleFullscreen = useCallback(() => globeRef.current?.toggleFullscreen(), []);

  const handleToggle2D3D = useCallback(() => {
    const newMode = !is3D;
    setIs3D(newMode);
    globeRef.current?.setMode3D(newMode);
  }, [is3D]);

  // ── Demo area & reset ───────────────────────────────────────────────────
  const handleGoToDemo = useCallback(() => {
    globeRef.current?.flyToDemoArea();
  }, []);

  const handleResetView = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.scene.morphTo3D(1.0);
    setIs3D(true);
    globeRef.current?.goHome();
  }, []);

  // ── Layer toggling ──────────────────────────────────────────────────────
  const handleToggleLayer = useCallback((id: string) => {
    setLayers((prev) => {
      const updated = prev.map((l) =>
        l.id === id ? { ...l, visible: !l.visible } : l,
      );

      const viewer = viewerRef.current;
      if (!viewer) return updated;

      const layer = updated.find((l) => l.id === id);
      if (!layer) return updated;

      // Terrain toggle
      if (id === 'terrain') {
        if (layer.visible) {
          viewer.scene.globe.show = true;
        } else {
          viewer.scene.globe.show = false;
        }
      }

      // Imagery toggle
      if (id === 'imagery') {
        const layerCount = viewer.imageryLayers.length;
        for (let i = 0; i < layerCount; i++) {
          viewer.imageryLayers.get(i).show = layer.visible;
        }
      }

      // Parcels toggle (demo data sources)
      if (id === 'parcels') {
        for (let i = 0; i < viewer.dataSources.length; i++) {
          const ds: DataSource = viewer.dataSources.get(i);
          if (ds.name === 'Demo Parcels') {
            ds.show = layer.visible;
          }
        }
      }

      return updated;
    });
  }, []);

  // ── Clear selection ─────────────────────────────────────────────────────
  const handleClearSelection = useCallback(() => {
    const viewer = viewerRef.current;
    if (viewer) {
      viewer.selectedEntity = undefined;
    }
    setSelection(null);
  }, []);

  // ── Measurement tool ────────────────────────────────────────────────────
  const handleToggleMeasure = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const turningOff = isMeasuring;
    setIsMeasuring(!isMeasuring);
    setMeasureInfo(null);

    if (turningOff) {
      // Cleanup
      if (measureHandlerRef.current) {
        measureHandlerRef.current.destroy();
        measureHandlerRef.current = null;
      }
      if (measureEntityRef.current) {
        viewer.entities.remove(measureEntityRef.current);
        measureEntityRef.current = null;
      }
      measurePointsRef.current = [];
      return;
    }

    // Start measuring
    measurePointsRef.current = [];
    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    measureHandlerRef.current = handler;

    handler.setInputAction((click: ScreenSpaceEventHandler.PositionedEvent) => {
      const cartesian = viewer.scene.pickPosition(click.position);
      if (!cartesian) return;

      measurePointsRef.current.push(cartesian.clone());

      if (measurePointsRef.current.length >= 2) {
        const points = measurePointsRef.current;
        // Remove previous entity
        if (measureEntityRef.current) {
          viewer.entities.remove(measureEntityRef.current);
        }

        const distance = calculateDistance(points, viewer);

        measureEntityRef.current = viewer.entities.add({
          name: 'Measure',
          polyline: {
            positions: points,
            width: 2,
            material: Color.fromCssColorString('#22d3ee'),
            clampToGround: false,
          } as unknown as PolylineGraphics,
        });

        setMeasureInfo(`${distance.toFixed(2)} m`);
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction(() => {
      // Right click resets current measurement
      if (measureEntityRef.current) {
        viewer.entities.remove(measureEntityRef.current);
        measureEntityRef.current = null;
      }
      measurePointsRef.current = [];
      setMeasureInfo(null);
    }, ScreenSpaceEventType.RIGHT_CLICK);
  }, [isMeasuring]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <AppHeader />

      {/* Main map area — globe occupies ~80% */}
      <div className="relative flex-1 overflow-hidden">
        <CesiumGlobe
          ref={globeRef}
          onCoordinatesChange={handleCoordinates}
          onSelect={handleSelect}
          onReady={handleReady}
        />

        {/* Left side: Toolbar */}
        <div className="absolute left-4 top-4 z-10">
          <MapToolbar
            onHome={handleHome}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetNorth={handleResetNorth}
            onToggleFullscreen={handleFullscreen}
            is3D={is3D}
            onToggle2D3D={handleToggle2D3D}
            isMeasuring={isMeasuring}
            onToggleMeasure={handleToggleMeasure}
          />
        </div>

        {/* Right side: Layer Manager + Selection */}
        <div className="absolute right-4 top-4 z-10 flex flex-col gap-3">
          <LayerManager layers={layers} onToggle={handleToggleLayer} />
          <SelectionManager selection={selection} onClear={handleClearSelection} />
        </div>

        {/* Bottom-left: Legend */}
        <div className="absolute bottom-4 left-4 z-10">
          <MapLegend />
        </div>

        {/* Bottom-center: Camera Controls + Coordinates */}
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
          <CameraControls onGoToDemo={handleGoToDemo} onResetView={handleResetView} />
          <CoordinateDisplay coordinates={coordinates} />
          {isMeasuring && (
            <div className="pointer-events-auto rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-4 py-2 text-xs font-medium text-cyan-200 backdrop-blur-md">
              {measureInfo ? `Distance: ${measureInfo}` : 'Click two points to measure · Right-click to reset'}
            </div>
          )}
        </div>

        {/* Attribution / data disclaimer */}
        <div className="pointer-events-none absolute bottom-4 right-4 z-10 max-w-xs text-right">
          <p className="text-[10px] text-slate-500">
            Demo data only — does not represent official cadastral records.
            <br />
            Study area: {DEMO_AREA.name}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function calculateDistance(points: Cartesian3[], viewer: Viewer): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    // Use ellipsoid geodesic distance via cartographic conversion
    const c1 = viewer.scene.globe.ellipsoid.cartesianToCartographic(points[i - 1]);
    const c2 = viewer.scene.globe.ellipsoid.cartesianToCartographic(points[i]);
    if (c1 && c2) {
      // Simple great-circle distance approximation
      const dLat = CesiumMath.toRadians(c2.latitude - c1.latitude);
      const dLon = CesiumMath.toRadians(c2.longitude - c1.longitude);
      const lat1 = CesiumMath.toRadians(c1.latitude);
      const lat2 = CesiumMath.toRadians(c2.latitude);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      total += 6371000 * c; // Earth radius in meters
    }
  }
  return total;
}

export default App;
