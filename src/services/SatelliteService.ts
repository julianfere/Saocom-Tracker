import axios from "axios";
import { getCorsFreeUrl } from "../helpers";
import { SatelliteTLEResponse } from "./types";

const axiosInstance = axios.create({
  timeout: 5000,
});

const getSatelliteById = async (id: string) => {
  try {
    const url = getCorsFreeUrl(
      `http://celestrak.org/NORAD/elements/gp.php?CATNR=${id}&FORMAT=tle`
    );
    const response = await axiosInstance.get(url);
    const rawData = response.data;
    const tleData = rawData
      .replace(/\r/g, "")
      .split(/\n(?=[^12])/)
      .filter((d: string) => d)
      .map((tle: string) => tle.split("\n"));

    const sat: SatelliteTLEResponse = {
      satelliteId: id,
      name: tleData[0][0],
      line1: tleData[0][1],
      line2: tleData[0][2],
      date: new Date().getTime().toString(),
    };

    return sat;
  } catch (error) {
    console.log(error);
    const emptySat: SatelliteTLEResponse = {
      satelliteId: id,
      name: "",
      line1: "",
      line2: "",
      date: new Date().getTime().toString(),
    };

    return emptySat;
  }
};

export { getSatelliteById };
