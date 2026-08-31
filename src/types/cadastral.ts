export type PropertyStatus = 'valid' | 'warning' | 'conflict';
export type PropertyType = 'Residential' | 'Commercial' | 'Mixed Use' | 'Parking' | 'Utility';
export type UserRole = 'ADMIN' | 'SURVEY_OFFICER' | 'VERIFICATION_OFFICER' | 'VIEWER';

export interface Floor {
  id: string;
  label: string;
  shortLabel: string;
  zMin: number;
  zMax: number;
  floorNumber: number;
  isUnderground: boolean;
}

export interface Building {
  id: string;
  name: string;
  parcelId: string;
  ulpin: string;
  footprint: [number, number][]; // [lon, lat] relative or absolute
  footprintArea: number; // m²
  center: { lon: number; lat: number };
  floors: Floor[];
}

export interface VerticalProperty {
  vpid: string;
  ulpin: string;
  parcelId: string;
  buildingId: string;
  floorId: string;
  floorNumber: number;
  floorLabel: string;
  propertyType: PropertyType;
  zMin: number;
  zMax: number;
  height: number;
  area: number;
  volume: number;
  confidence: number;
  status: PropertyStatus;
  isUnderground: boolean;
  ownerName?: string;
  registrationDate?: string;
  documentRef?: string;
}

export type ExplodeState = 'collapsed' | 'exploded';

export interface ValidationConflict {
  id: string;
  type: 'VOLUME_OVERLAP' | 'FLOOR_GAP' | 'INVALID_Z_RANGE' | 'PARCEL_ENCROACHMENT' | 'RESTRICTED_ZONE' | 'UNDERGROUND_COLLISION';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  vpid: string;
  buildingId: string;
  description: string;
  locationZ: { min: number; max: number };
  resolved: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userRole: UserRole;
  action: string;
  targetId: string;
  details: string;
}
