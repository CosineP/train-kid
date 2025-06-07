import { useEffect, useState } from "react";
import { arrivalProbs } from "../../model/solver";
import DeparturePlot from "./DeparturePlot";
import { LTrip } from "../../model/trips/syntax";
import { compileTrip } from "../../model";

type DepartureData = {
  name: string;
  samples: [Date, number][];
};

function refineSamples(data: DepartureData[]): DepartureData[] {
  const maxLength = data.reduce((max, { samples }) => Math.max(max, samples.length), 0) + 1;
  return data.map(({ name, samples }) => {
    if (samples.length === 0) return { name, samples };
    const extendedSamples = [...samples];
    const lastSample = samples[samples.length - 1];
    const lastDate = lastSample[0];
    for (let i = 1; i < maxLength; i++) {
      if (i < samples.length) {
        if (samples[i][1] > samples[i - 1][1]) {
          samples[i][1] = samples[i - 1][1];
        }
      } else {
        const newDate = new Date(lastDate);
        newDate.setMinutes(newDate.getMinutes() + (i - samples.length + 1));
        extendedSamples.push([newDate, 0]);
      }
    }
    return { name, samples: extendedSamples };
  });
}

const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

const Departures = ({ trips, at }: { trips: LTrip[], at: Date }) => {
  const initDate = new Date(localStorage.getItem("arriveBy") ?? at);
  const [hour, setHour] = useState(initDate.getHours() % 12 || 12);
  const [minute, setMinute] = useState(Math.floor(initDate.getMinutes() / 5) * 5);
  const [data, setData] = useState<DepartureData[]>([]);

  const recalculate = async () => {
    const now = new Date();
    const today = new Date(now);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const toTime = (base: Date) => {
      const h24 = hour + (base.getHours() > hour ? 12 : 0);
      const candidate = new Date(base);
      candidate.setHours(h24, minute, 0, 0);
      return candidate;
    };

    let candidate = toTime(today);
    if (candidate <= now) {
      candidate = toTime(tomorrow);
    }

    if (candidate.getTime() - now.getTime() > 2 * 60 * 60 * 1000) {
      console.error("Candidate time is more than 2 hours in the future:", candidate);
      return;
    }

    localStorage.setItem("arriveBy", candidate.toString());

    const departures = await Promise.all(trips.map(async trip => {
      const compiled = await compileTrip(trip, at);
      return {
        name: trip.name,
        samples: arrivalProbs(compiled.exp, at, candidate),
      }
    }));
    setData(refineSamples(departures));
  };

  useEffect(() => {
    recalculate();
  }, [trips, at]);

  return <>
    {data.map(({ name, samples }) =>
      <div key={name}><DeparturePlot name={name} probs={samples} /></div>
    )}
    <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", pointerEvents: "auto" }}>
      <select value={hour} onChange={e => setHour(parseInt(e.target.value))}>
        {hours.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
      <select value={minute} onChange={e => setMinute(parseInt(e.target.value))}>
        {minutes.map(m => <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>)}
      </select>
      <button onClick={recalculate}>Recalculate</button>
    </div>
  </>;
};

export default Departures;
