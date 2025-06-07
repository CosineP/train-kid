import React from 'react';
import QDP from './QDP.tsx';
import { msRoundedToMin, memo, minsRange, timeOnly } from '../../model/util';
import { describe } from '../../model/analysis/index.ts';

export type ArrivalsData = { samples: Date[], errors: number, name: string }
interface PlotsProps {
  trips: ArrivalsData[]; // Array of time values
  startAt: Date; // Start the plot further to the left. This is usually "now"
}

// For some reason this is CRAZY slow.
// Rather than accepting a date, I accept a number to memoize more work.
const formatTime12Hour = memo((time: number): string =>
  timeOnly(new Date(time)));

function bucketTimesByMinute(startTime: Date, endTime: Date, times: Date[]): [string, number][] {
  // Prepare buckets
  const buckets = new Map<number, number>();
  
  for (const time of minsRange(startTime, endTime)) {
    buckets.set(time.getTime(), 0);
  }

  // Populate the buckets
  for (const time of times) {
    const min = msRoundedToMin(time);
    if (buckets.has(min)) {
      buckets.set(min, buckets.get(min)! + 1);
    }
  }

  // Format the keys
  return Array.from(buckets.entries()).map(([k, v]) =>
    [formatTime12Hour(k), v]);
}

const ArrivalPlots: React.FC<PlotsProps> = ({ trips, startAt }) => {
  // Prepare data by bucketing times by minute
  const allSamples = trips.flatMap((t: ArrivalsData) => t.samples);
  // Bro... IDK why I need to add the minute, but NaN is happening :(
  const endTime = new Date(Math.max(...allSamples.map(t => t.getTime())) + 60 * 1000);
  const bucketed = trips.map((trip) => ({
    ...trip,
    buckets: bucketTimesByMinute(startAt, endTime, trip.samples) }));
  const highestDots = Math.max(
    ...bucketed.flatMap(({ buckets }) =>
        buckets.map(([_, count]) => count)));
  const errorMessage = (trip: ArrivalsData) =>
    `${Math.floor(trip.errors * 50)} dots are missing because of a hard-to-predict connection :(`;
  return bucketed.map((trip) =>
    <div className="plot" key={trip.name}>
      <div>
        <h2 className="floating">{trip.name}</h2>
      </div>
      <QDP
        scale={highestDots}
        buckets={trip.buckets} />
      {/* TODO: QDP should accept data, not strings. Ew. And then,
      I would like the description to be rendered in the svg, in the right
      position, with a little line indicating it. */}
      <div>
        <p className="floating">{describe(trip)}</p>
      </div>
      {/* Would prefer to not have such errors, and if they are
      inevitable, would prefer to viz them */}
      {trip.errors >= .04 ? <pre>{errorMessage(trip)}</pre> : null}
    </div>);
};

export default ArrivalPlots;

