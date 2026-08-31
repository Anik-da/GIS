import type { Viewer, Entity } from 'cesium';

export interface CesiumGlobeHandle {
  getViewer: () => Viewer | null;
  flyToDemoArea: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetNorth: () => void;
  goHome: () => void;
  setMode3D: (is3D: boolean) => void;
  toggleFullscreen: () => void;
}

export type { Viewer, Entity };
