export type LayerId =
  | 'terrain'
  | 'imagery'
  | 'parcels'
  | 'buildings'
  | 'survey'
  | 'underground'
  | 'conflicts';

export interface LayerConfig {
  id: LayerId;
  label: string;
  description: string;
  visible: boolean;
  color: string;
}

export type SelectionKind =
  | 'parcel'
  | 'building'
  | 'floor'
  | 'verticalProperty'
  | 'conflict';

export interface SelectionInfo {
  kind: SelectionKind;
  id: string;
  label: string;
  data?: Record<string, unknown>;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  elevation: number;
}

export const DEMO_AREA = {
  name: 'Karnataka / Bengaluru — Demo Study Area',
  longitude: 77.5946,
  latitude: 12.9716,
  height: 4200,
};

export const DEFAULT_LAYERS: LayerConfig[] = [
  { id: 'terrain', label: 'Terrain', description: '3D terrain elevation', visible: true, color: '#8b7355' },
  { id: 'imagery', label: 'Imagery', description: 'Satellite imagery layer', visible: true, color: '#2a7fff' },
  { id: 'parcels', label: 'Parcels', description: 'Cadastral parcel polygons', visible: true, color: '#22d3ee' },
  { id: 'buildings', label: 'Buildings', description: '3D building models', visible: true, color: '#f59e0b' },
  { id: 'survey', label: 'Survey Data', description: 'Survey control points', visible: false, color: '#34d399' },
  { id: 'underground', label: 'Underground', description: 'Subsurface utility assets', visible: false, color: '#a78bfa' },
  { id: 'conflicts', label: 'Validation Conflicts', description: 'Detected spatial conflicts', visible: false, color: '#ef4444' },
];
