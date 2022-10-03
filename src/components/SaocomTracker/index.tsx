import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";
import { twoline2satrec } from "satellite.js";
import { OctahedronGeometry, MeshLambertMaterial, Mesh } from "three";
import { EARTH_RADIUS_KM, SAT_SIZE, TIME_STEP } from "../../constants";
import * as THREE from "three";

//stuff about the ISS model
import { buildSatellitePostion, getCorsFreeUrl } from "../../helpers";
import { getSatelliteById } from "../../services/SatelliteService";
import { SaocomTrackerProps, SatelliteData } from "./types";
import { SatelliteTLEResponse } from "../../services/types";

const colorInterpolator = (t: number) => `rgba(255,100,50,${Math.sqrt(1 - t)})`;

const SaocomTracker = ({ satelliteIds }: SaocomTrackerProps) => {
  const globeEl = useRef<GlobeMethods>();
  const [globeRadius, setGlobeRadius] = useState(0);
  const [satData, setSatData] = useState<SatelliteData[]>([]);
  const [relativeTime, setRelativeTime] = useState(new Date());

  useEffect(() => {
    if (!globeEl.current) return;

    globeEl.current.pointOfView({ altitude: 4 }, 10);
  }, []);

  useEffect(() => {
    // time ticker
    (function frameTicker() {
      requestAnimationFrame(frameTicker);
      setRelativeTime((time) => new Date(+time + TIME_STEP));
    })();
  }, []);

  useEffect(() => {
    // time ticker
    const globe = globeEl.current;
    new THREE.TextureLoader().load(
      getCorsFreeUrl(
        "https://github.com/turban/webgl-earth/blob/master/images/fair_clouds_4k.png?raw=true"
      ),
      (cloudsTexture) => {
        const CLOUDS_ALT = 0.004;
        const CLOUDS_ROTATION_SPEED = -0.006; // deg/frame
        const clouds = new THREE.Mesh(
          new THREE.SphereGeometry(
            // @ts-ignore
            globe.getGlobeRadius() * (1 + CLOUDS_ALT),
            75,
            75
          ),
          new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true })
        );
        // @ts-ignore
        globe.scene().add(clouds);

        (function rotateClouds() {
          clouds.rotation.y += (CLOUDS_ROTATION_SPEED * Math.PI) / 180;
          requestAnimationFrame(rotateClouds);
        })();
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // get satellite data
    satelliteIds.forEach((id) => {
      getSatelliteById(id).then((sat) => {
        const data = sat as unknown as SatelliteTLEResponse;
        if (data.line1) {
          const satRec = twoline2satrec(data.line1, data.line2);
          setSatData((oldData) => [...oldData!, { name: data.name, satRec }]);
        }
      });
    });
  }, [satelliteIds]);

  const satPosition = useMemo(() => {
    if (!satData) return [];
    return satData.map((sat) => ({
      ...buildSatellitePostion(sat, relativeTime),
    }));
  }, [satData, relativeTime]);

  const satObject = useMemo(() => {
    if (!globeRadius) return undefined;

    const satGeometry = new OctahedronGeometry(
      (SAT_SIZE * globeRadius) / EARTH_RADIUS_KM / 2,
      0
    );

    const satMaterial = new MeshLambertMaterial({
      color: "red",
      transparent: false,
      opacity: 1,
    });

    return new Mesh(satGeometry, satMaterial);
  }, [globeRadius]);

  useEffect(() => {
    setGlobeRadius(globeEl!.current!.getGlobeRadius());
    globeEl!.current!.pointOfView({ altitude: 3.5 });
  }, []);

  // const gData = useMemo(() => {
  //   const data = buildPathsBetweenDates(
  //     satData!,
  //     relativeTime,
  //     moment(relativeTime).add(4, "hours").toDate()
  //   );
  //   return data;
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [satData]);

  return (
    <Globe
      ref={globeEl}
      objectsData={satPosition}
      objectThreeObject={satObject}
      objectLabel="name"
      objectLat="latitude"
      objectLng="longitude"
      objectAltitude="altitude"
      globeImageUrl={getCorsFreeUrl(
        "https://github.com/turban/webgl-earth/blob/master/images/2_no_clouds_4k.jpg?raw=true"
      )}
      bumpImageUrl={getCorsFreeUrl(
        "https://github.com/turban/webgl-earth/blob/master/images/elev_bump_4k.jpg?raw=true"
      )}
      // pathsData={gData}
      atmosphereAltitude={0.3}
      // @ts-ignore
      // pathPointAlt={satPosition.altitude}
      pathColor={() => "rgba(239, 58, 31, 0.8)"}
      pathDashAnimateTime={100000}
      // ringsData={currentLocation ? [currentLocation] : []}
      ringColor={() => colorInterpolator}
      ringAltitude={0.01}
      ringMaxRadius={2}
      ringPropagationSpeed={1}
      ringRepeatPeriod={1000}
    />
  );
};

export default SaocomTracker;
