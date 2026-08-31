import type { Building, VerticalProperty, Floor, PropertyType, PropertyStatus, ValidationConflict, AuditLogEntry } from '../types/cadastral';

const PARCEL_CENTER = { lon: 77.5946, lat: 12.9716 };

const LAT_M = 111320;
const LON_M = 111320 * Math.cos((PARCEL_CENTER.lat * Math.PI) / 180);

const HALF_W = 15; // 30m wide
const HALF_H = 12; // 24m deep

export const footprint: [number, number][] = [
  [PARCEL_CENTER.lon - (HALF_W / LON_M), PARCEL_CENTER.lat - (HALF_H / LAT_M)],
  [PARCEL_CENTER.lon + (HALF_W / LON_M), PARCEL_CENTER.lat - (HALF_H / LAT_M)],
  [PARCEL_CENTER.lon + (HALF_W / LON_M), PARCEL_CENTER.lat + (HALF_H / LAT_M)],
  [PARCEL_CENTER.lon - (HALF_W / LON_M), PARCEL_CENTER.lat + (HALF_H / LAT_M)],
];

export const footprintArea = 30 * 24; // 720 m²

const floorDefs: Omit<Floor, 'id'>[] = [
  { label: 'Sub-Basement Utility', shortLabel: 'B2', zMin: -6, zMax: -3, floorNumber: -2, isUnderground: true },
  { label: 'Basement Parking', shortLabel: 'B1', zMin: -3, zMax: 0, floorNumber: -1, isUnderground: true },
  { label: 'Ground Floor Commercial', shortLabel: 'GF', zMin: 0, zMax: 3.5, floorNumber: 0, isUnderground: false },
  { label: 'Floor 1 — Retail Mall', shortLabel: 'F1', zMin: 3.5, zMax: 7, floorNumber: 1, isUnderground: false },
  { label: 'Floor 2 — Office Suites', shortLabel: 'F2', zMin: 7, zMax: 10.5, floorNumber: 2, isUnderground: false },
  { label: 'Floor 3 — Tech Hub', shortLabel: 'F3', zMin: 10.5, zMax: 14, floorNumber: 3, isUnderground: false },
  { label: 'Floor 4 — Residential West', shortLabel: 'F4', zMin: 14, zMax: 17.5, floorNumber: 4, isUnderground: false },
  { label: 'Floor 5 — Penthouse Suite', shortLabel: 'F5', zMin: 17.5, zMax: 21, floorNumber: 5, isUnderground: false },
];

const floors: Floor[] = floorDefs.map((f) => ({
  ...f,
  id: `B-001-${f.shortLabel}`,
}));

export const demoBuilding: Building = {
  id: 'B-001',
  name: 'VOLU Tower A1 (Commercial & Residential)',
  parcelId: 'PARCEL-KA-BLR-8942',
  ulpin: 'ULPIN-IN-MH-2026-89421',
  footprint,
  footprintArea,
  center: PARCEL_CENTER,
  floors,
};

const propertyTypes: Record<number, PropertyType> = {
  [-2]: 'Utility',
  [-1]: 'Parking',
  0: 'Commercial',
  1: 'Commercial',
  2: 'Office' as PropertyType,
  3: 'Mixed Use',
  4: 'Residential',
  5: 'Residential',
};

const statusByFloor: Record<number, PropertyStatus> = {
  [-2]: 'valid',
  [-1]: 'valid',
  0: 'valid',
  1: 'valid',
  2: 'warning',
  3: 'valid',
  4: 'conflict',
  5: 'valid',
};

const confidenceByFloor: Record<number, number> = {
  [-2]: 0.96,
  [-1]: 0.99,
  0: 0.98,
  1: 0.95,
  2: 0.81,
  3: 0.94,
  4: 0.62,
  5: 0.91,
};

const ownersByFloor: Record<number, string> = {
  [-2]: 'Bengaluru Municipal Subsurface Corp',
  [-1]: 'VOLU Tower Management Society',
  0: 'NEXUS Retail Ventures Ltd.',
  1: 'Apex Commercial Properties',
  2: 'Vertex Tech Solutions',
  3: 'SIH Innovation Labs',
  4: 'Rajesh & Sunita Sharma',
  5: 'Ananya Deshmukh',
};

function vpidFor(floor: Floor): string {
  return `VP-001-B01-${floor.shortLabel}`;
}

export const demoProperties: VerticalProperty[] = demoBuilding.floors.map((floor: Floor) => {
  const height = floor.zMax - floor.zMin;
  const volume = footprintArea * height;
  return {
    vpid: vpidFor(floor),
    ulpin: demoBuilding.ulpin,
    parcelId: demoBuilding.parcelId,
    buildingId: demoBuilding.id,
    floorId: floor.id,
    floorNumber: floor.floorNumber,
    floorLabel: floor.label,
    propertyType: propertyTypes[floor.floorNumber] ?? 'Residential',
    zMin: floor.zMin,
    zMax: floor.zMax,
    height,
    area: footprintArea,
    volume,
    confidence: confidenceByFloor[floor.floorNumber] ?? 0.9,
    status: statusByFloor[floor.floorNumber] ?? 'valid',
    isUnderground: floor.isUnderground,
    ownerName: ownersByFloor[floor.floorNumber] ?? 'Registered Owner',
    registrationDate: '2025-11-14',
    documentRef: `DOC-2026-VP-${floor.shortLabel}`,
  };
});

export const demoConflicts: ValidationConflict[] = [
  {
    id: 'CONF-001',
    type: 'VOLUME_OVERLAP',
    severity: 'HIGH',
    vpid: 'VP-001-B01-F4',
    buildingId: 'B-001',
    description: 'Volumetric overlap detected between Floor 4 (F4) and adjacent high-rise balcony volume overhang.',
    locationZ: { min: 14, max: 17.5 },
    resolved: false,
  },
  {
    id: 'CONF-002',
    type: 'FLOOR_GAP',
    severity: 'MEDIUM',
    vpid: 'VP-001-B01-F2',
    buildingId: 'B-001',
    description: 'Unmapped spatial Z-gap (0.4m) identified between Floor 2 ceiling and Floor 3 floor slab.',
    locationZ: { min: 7, max: 10.5 },
    resolved: false,
  },
  {
    id: 'CONF-003',
    type: 'UNDERGROUND_COLLISION',
    severity: 'HIGH',
    vpid: 'VP-001-B01-B2',
    buildingId: 'B-001',
    description: 'Sub-surface Z-Min (-6.0m) encroaches upon municipal high-voltage power conduit zone.',
    locationZ: { min: -6.0, max: -3.0 },
    resolved: false,
  },
];

export const demoAuditLogs: AuditLogEntry[] = [
  {
    id: 'LOG-1092',
    timestamp: '2026-08-31 18:42:10',
    userRole: 'ADMIN',
    action: 'SYSTEM_INITIALIZATION',
    targetId: 'SYSTEM',
    details: 'VOLU-CAD 3D Cadastral Spatial Engine initialized with Cesium globe.',
  },
  {
    id: 'LOG-1093',
    timestamp: '2026-08-31 19:15:33',
    userRole: 'SURVEY_OFFICER',
    action: 'VPID_GENERATION',
    targetId: 'VP-001-B01-F4',
    details: 'Generated prototype 3D Vertical Property ID for Floor 4.',
  },
  {
    id: 'LOG-1094',
    timestamp: '2026-08-31 20:02:44',
    userRole: 'VERIFICATION_OFFICER',
    action: '3D_TOPOLOGY_VALIDATION',
    targetId: 'PARCEL-KA-BLR-8942',
    details: 'Ran 3D spatial topology rules: 1 Overlap conflict, 1 Underground collision identified.',
  },
  {
    id: 'LOG-1095',
    timestamp: '2026-08-31 21:30:00',
    userRole: 'VIEWER',
    action: 'PASSPORT_QUERY',
    targetId: 'VP-001-B01-GF',
    details: 'Public Digital Property Passport queried for Ground Floor Commercial.',
  },
];
