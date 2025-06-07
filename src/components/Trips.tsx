import { memo, useRef, useState } from 'react';
import Arrivals from '../viz/Arrivals';
import Departures from '../viz/Departures';
import Parallax from './Parallax';
import { Exp } from '../../model/prob/syntax';
import { LTrip } from '../../model/trips/syntax';

export type Trip = { exp: Exp, name: string };

function Trips({ trips }: { trips: LTrip[] }) {
  const [departures, setDepartures] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  return <>
    <button onClick={() => setDepartures(!departures)}>
      {departures ? "Show when I'll arrive" : "Show when to leave"}
    </button>
    <div id="plots" ref={scrollRef}>
      <Parallax scrollRef={scrollRef}>
        {departures ?
          <Departures trips={trips} at={new Date()} /> :
          <Arrivals trips={trips} at={new Date()} />
        }
      </Parallax>
    </div>
  </>;

};

export default memo(Trips, (prevProps, nextProps) =>
  prevProps.trips.map(t => t.name).join("XXX") ===
    nextProps.trips.map(t => t.name).join("XXX"));
