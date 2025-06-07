import { useState } from 'react';
import { tripsFor } from '../planning/planning';
import Trips from './Trips';
import { LTrip } from '../../model/trips/syntax';

function TripPlanner() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [trips, setTrips] = useState<LTrip[]>([]);
  const planAndCompile = async (e: Event) => {
    e.preventDefault();
    const now = new Date();
    const trips = await tripsFor(from, to, now);
    setTrips(trips);
  };
  return <>
    <form>
      <input type="text" placeholder="From" value={from} onChange={(e) => setFrom(e.target.value)} name="location" autoComplete="location search" />
      <input type="text" placeholder="To" value={to} onChange={(e) => setTo(e.target.value)} name="location" autoComplete="location search" />
      {/* @ts-ignore TODO: what */}
      <button type="submit" onClick={planAndCompile}>See Trips</button>
    </form>
    <Trips trips={trips} />
  </>;
}

export default TripPlanner;