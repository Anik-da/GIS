import * as Cesium from 'cesium';
import type { Building, Floor } from '../types/cadastral';

export const EXPLODE_OFFSET = 4.5; // meters of gap per floor level in exploded view mode

export function footprintToCartesian(
  footprint: [number, number][],
  z: number
): Cesium.Cartesian3[] {
  return footprint.map(([lon, lat]) =>
    Cesium.Cartesian3.fromDegrees(lon, lat, z)
  );
}

export function footprintToPositions(
  footprint: [number, number][],
  zMin: number,
  zMax: number
): Cesium.Cartesian3[] {
  const bottom = footprintToCartesian(footprint, zMin);
  const top = footprintToCartesian(footprint, zMax);
  return [...bottom, ...top];
}

export function computeExplodedZ(floor: Floor, explodeFactor: number): { zMin: number; zMax: number } {
  // explodeFactor 0 = true 3D position, 1 = exploded view
  const extra = EXPLODE_OFFSET * explodeFactor;
  const shift = floor.floorNumber * extra;
  return {
    zMin: floor.zMin + shift,
    zMax: floor.zMax + shift,
  };
}

export function makeFloorLabel(
  viewer: Cesium.Viewer,
  building: Building,
  floor: Floor,
  explodeFactor: number,
  text: string
): Cesium.Entity {
  const { zMax } = computeExplodedZ(floor, explodeFactor);
  const labelZ = zMax + 0.6;
  return viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(building.center.lon, building.center.lat, labelZ),
    label: {
      text,
      font: 'bold 12px Inter, sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.fromCssColorString('#0f172a'),
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cesium.Cartesian2(0, -10),
      showBackground: true,
      backgroundColor: new Cesium.Color(0.06, 0.09, 0.16, 0.88),
      backgroundPadding: new Cesium.Cartesian2(8, 5),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
}

export function flyToBuilding(viewer: Cesium.Viewer, building: Building, duration = 2) {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(building.center.lon, building.center.lat, 130),
    orientation: {
      heading: Cesium.Math.toRadians(35),
      pitch: Cesium.Math.toRadians(-28),
      roll: 0,
    },
    duration,
  });
}

export function flyToFloor(
  viewer: Cesium.Viewer,
  building: Building,
  floor: Floor,
  explodeFactor: number,
  duration = 1.5
) {
  const { zMax } = computeExplodedZ(floor, explodeFactor);
  const targetZ = Math.max(zMax + 30, 45);
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(building.center.lon, building.center.lat, targetZ),
    orientation: {
      heading: Cesium.Math.toRadians(35),
      pitch: Cesium.Math.toRadians(-22),
      roll: 0,
    },
    duration,
  });
}

export function colorFromRgba(rgba: string): Cesium.Color {
  return Cesium.Color.fromCssColorString(rgba);
}
