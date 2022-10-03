import {
  eciToGeodetic,
  EciVec3,
  gstime,
  propagate,
  SatRec,
} from "satellite.js";
import { SatelliteData } from "../components/SaocomTracker/types";
import { EARTH_RADIUS_KM } from "../constants";
import { SatelliteCoordinates } from "../interfaces";

export const getCorsFreeUrl = (url: string) =>
  `https://api.allorigins.win/raw?url=${url}`;

export const radiansToDegrees = (radians: number): number => {
  var pi = Math.PI;
  return radians * (180 / pi);
};

export const buildSatellitePostion = (
  satellite: SatelliteData,
  time: Date
): SatelliteCoordinates => {
  const prop = propagate(satellite.satRec, time);
  const gtime = gstime(time);
  const coords = eciToGeodetic(prop.position as EciVec3<number>, gtime);
  const { longitude, latitude } = coords;
  return {
    name: satellite.name,
    longitude: radiansToDegrees(longitude),
    latitude: radiansToDegrees(latitude),
    altitude: coords.height / EARTH_RADIUS_KM,
  };
};
