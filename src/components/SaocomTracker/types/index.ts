import { SatRec } from "satellite.js";

export interface SaocomTrackerProps {
  satelliteIds: string[];
}

export type SatelliteData = {
  satRec: SatRec;
  name: string;
};
