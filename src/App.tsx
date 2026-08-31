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

import { VerticalPropertyPanel } from './components/cadastral/VerticalPropertyPanel';
import { VerticalFloorSlider } from './components/cadastral/VerticalFloorSlider';
import { TopologyValidationModal } from './components/cadastral/TopologyValidationModal';
import { PropertyPassportModal } from './components/cadastral/PropertyPassportModal';
import { EmergencyPlanningModal } from './components/cadastral/EmergencyPlanningModal';
import { AuditLogDrawer } from './components/cadastral/AuditLogDrawer';

import { DEFAULT_LAYERS, DEMO_AREA } from './types/gis';
import type { Coordinates, LayerConfig, SelectionInfo } from './types/gis';
import type { UserRole, ExplodeState, ValidationConflict, AuditLogEntry } from './types/cadastral';
import { demoBuilding, demoProperties, demoConflicts, demoAuditLogs } from './data/cadastralDemoData';
import { flyToBuilding, flyToFloor } from './utils/cesium3dHelpers';

function App() {
  const globeRef = useRef<CesiumGlobeHandle>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const measureHandlerRef = useRef<ScreenSpaceEventHandler | null>(null);
  const measureEntityRef = useRef<Entity | null>(null);
  const measurePointsRef = useRef<Cartesian3[]>([]);

  // Base GIS State
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [layers, setLayers] = useState<LayerConfig[]>(DEFAULT_LAYERS);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [is3D, setIs3D] = useState(true);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measureInfo, setMeasureInfo] = useState<string | null>(null);

  // Cadastral 3D State
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>('B-001-F3');
  const [explodeState, setExplodeState] = useState<ExplodeState>('collapsed');
  const [showUnderground, setShowUnderground] = useState(true);

  // Modals & Drawers State
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  const [conflicts, setConflicts] = useState<ValidationConflict[]>(demoConflicts);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(demoAuditLogs);

  const selectedProperty =
    demoProperties.find((p) => p.floorId === selectedFloorId) ?? null;

  const handleReady = useCallback((viewer: Viewer) => {
    viewerRef.current = viewer;
  }, []);

  const handleCoordinates = useCallback((coords: Coordinates) => {
    setCoordinates(coords);
  }, []);

  // Floor Selection handler
  const handleSelectFloor = useCallback((floorId: string) => {
    setSelectedFloorId(floorId);
    const viewer = viewerRef.current;
    const floor = demoBuilding.floors.find((f) => f.id === floorId);
    if (viewer && floor) {
      flyToFloor(viewer, demoBuilding, floor, explodeState === 'exploded' ? 1 : 0);
    }
  }, [explodeState]);

  // Parcel / Entity Selection handler
  const handleSelectEntity = useCallback((entity: Entity | null) => {
    if (!entity) {
      setSelection(null);
      return;
    }
    const props = entity.properties;
    const kind = props?.get('type')?.getValue() ?? 'parcel';
    const ulpin = props?.get('ulpin')?.getValue() ?? entity.name ?? demoBuilding.ulpin;
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

    // Automatically focus camera on 3D building tower when demo parcel selected
    const viewer = viewerRef.current;
    if (viewer) {
      flyToBuilding(viewer, demoBuilding);
    }
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

  // ── Demo area & camera fly to target building ───────────────────────────
  const handleGoToDemo = useCallback(() => {
    const viewer = viewerRef.current;
    if (viewer) {
      flyToBuilding(viewer, demoBuilding);
    } else {
      globeRef.current?.flyToDemoArea();
    }
  }, []);

  const handleResetView = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.scene.morphTo3D(1.0);
    setIs3D(true);
    globeRef.current?.goHome();
    setSelectedFloorId(null);
    setExplodeState('collapsed');
  }, []);

  // ── Layer toggling ──────────────────────────────────────────────────────
  const handleToggleLayer = useCallback((id: string) => {
    setLayers((prev) => {
      const updated = prev.map((l) =>
        l.id === id ? { ...l, visible: !l.visible } : l
      );

      const viewer = viewerRef.current;
      if (!viewer) return updated;

      const layer = updated.find((l) => l.id === id);
      if (!layer) return updated;

      if (id === 'terrain') {
        viewer.scene.globe.show = layer.visible;
      }

      if (id === 'imagery') {
        const layerCount = viewer.imageryLayers.length;
        for (let i = 0; i < layerCount; i++) {
          viewer.imageryLayers.get(i).show = layer.visible;
        }
      }

      if (id === 'parcels') {
        for (let i = 0; i < viewer.dataSources.length; i++) {
          const ds: DataSource = viewer.dataSources.get(i);
          if (ds.name === 'Demo Parcels') {
            ds.show = layer.visible;
          }
        }
      }

      if (id === 'underground') {
        setShowUnderground(layer.visible);
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
    setSelectedFloorId(null);
  }, []);

  // ── Measurement tool ────────────────────────────────────────────────────
  const handleToggleMeasure = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const turningOff = isMeasuring;
    setIsMeasuring(!isMeasuring);
    setMeasureInfo(null);

    if (turningOff) {
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

    measurePointsRef.current = [];
    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    measureHandlerRef.current = handler;

    handler.setInputAction((click: ScreenSpaceEventHandler.PositionedEvent) => {
      const cartesian = viewer.scene.pickPosition(click.position);
      if (!cartesian) return;

      measurePointsRef.current.push(cartesian.clone());

      if (measurePointsRef.current.length >= 2) {
        const points = measurePointsRef.current;
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
      if (measureEntityRef.current) {
        viewer.entities.remove(measureEntityRef.current);
        measureEntityRef.current = null;
      }
      measurePointsRef.current = [];
      setMeasureInfo(null);
    }, ScreenSpaceEventType.RIGHT_CLICK);
  }, [isMeasuring]);

  // Conflict Resolution Action
  const handleResolveConflict = useCallback((id: string) => {
    setConflicts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolved: true } : c))
    );
    setAuditLogs((prev) => [
      {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userRole,
        action: 'CONFLICT_RESOLVED',
        targetId: id,
        details: `Conflict ${id} resolved by ${userRole}.`,
      },
      ...prev,
    ]);
  }, [userRole]);

  const activeConflictCount = conflicts.filter((c) => !c.resolved).length;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Integrated App Header */}
      <AppHeader
        userRole={userRole}
        explodeState={explodeState}
        showUnderground={showUnderground}
        activeConflictCount={activeConflictCount}
        onRoleChange={setUserRole}
        onToggleExplode={() => setExplodeState((prev) => (prev === 'exploded' ? 'collapsed' : 'exploded'))}
        onToggleUnderground={() => setShowUnderground((prev) => !prev)}
        onOpenValidation={() => setIsValidationOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenAudit={() => setIsAuditOpen(true)}
      />

      {/* Main 3D GIS & Cadastral Area */}
      <div className="relative flex-1 overflow-hidden">
        <CesiumGlobe
          ref={globeRef}
          building={demoBuilding}
          properties={demoProperties}
          selectedFloorId={selectedFloorId}
          explodeState={explodeState}
          showUnderground={showUnderground}
          onCoordinatesChange={handleCoordinates}
          onSelect={handleSelectEntity}
          onSelectFloor={handleSelectFloor}
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

        {/* Left side: Vertical Floor Selector */}
        <VerticalFloorSlider
          floors={demoBuilding.floors}
          selectedFloorId={selectedFloorId}
          showUnderground={showUnderground}
          onSelect={handleSelectFloor}
        />

        {/* Right side: Layer Manager + Selection */}
        <div className="absolute right-4 top-4 z-10 flex flex-col gap-3">
          <LayerManager layers={layers} onToggle={handleToggleLayer} />
          <SelectionManager selection={selection} onClear={handleClearSelection} />
        </div>

        {/* Right side: Vertical Property Details Panel */}
        <VerticalPropertyPanel
          property={selectedProperty}
          onClose={() => setSelectedFloorId(null)}
          onRunValidation={() => setIsValidationOpen(true)}
          onOpenPassport={() => setIsPassportOpen(true)}
        />

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

        {/* Bottom-right: SIH Disclaimer */}
        <div className="pointer-events-none absolute bottom-4 right-4 z-10 max-w-xs text-right">
          <p className="text-[10px] text-slate-500">
            SIH26011 — VOLU-CAD 3D Vertical Cadastre System.
            <br />
            Study area: {DEMO_AREA.name}
          </p>
        </div>
      </div>

      {/* Modals & Drawers */}
      <TopologyValidationModal
        isOpen={isValidationOpen}
        conflicts={conflicts}
        onClose={() => setIsValidationOpen(false)}
        onResolveConflict={handleResolveConflict}
      />

      <PropertyPassportModal
        property={selectedProperty}
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
      />

      <EmergencyPlanningModal
        building={demoBuilding}
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      <AuditLogDrawer
        isOpen={isAuditOpen}
        logs={auditLogs}
        currentRole={userRole}
        onClose={() => setIsAuditOpen(false)}
      />
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function calculateDistance(points: Cartesian3[], viewer: Viewer): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const c1 = viewer.scene.globe.ellipsoid.cartesianToCartographic(points[i - 1]);
    const c2 = viewer.scene.globe.ellipsoid.cartesianToCartographic(points[i]);
    if (c1 && c2) {
      const dLat = CesiumMath.toRadians(c2.latitude - c1.latitude);
      const dLon = CesiumMath.toRadians(c2.longitude - c1.longitude);
      const lat1 = CesiumMath.toRadians(c1.latitude);
      const lat2 = CesiumMath.toRadians(c2.latitude);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      total += 6371000 * c;
    }
  }
  return total;
}

export default App;
