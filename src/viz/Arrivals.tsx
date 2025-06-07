import { useEffect, useState } from "react";
import ArrivalPlots, { ArrivalsData } from "./ArrivalPlots";
import { arrivalTimes } from "../../model/solver";
import { commonPrefix, describe, dominates, sortedByArrival, tripSummary } from "../../model/analysis";
import { Exp, LTrip } from "../../model/trips/syntax";
import { compileTrip } from "../../model";
import { assert } from "../../model/util";
import { mbta } from "../../model/global";
import { wellFormed } from "../../model/trips/well-formed";
import { fromTrips } from "../../model/prob/from-trips";
import { ground } from "../../model/prob/ground-preds";

type SolvedTrip = {
  samples: Date[];
  errors: number;
  source: Exp;
  name: string; // Redundant from above, but makes compatible with ArrivalsData.
};

const Arrivals = ({ trips, at }: { trips: LTrip[], at: Date }) => {
  const [data, setData] = useState<SolvedTrip[]>([]);
  const [summary, setSummary] = useState<string>("");
  useEffect(() => { (async () => {
    if (trips.length === 0) {
      return;
    }
    const solved: SolvedTrip[] = (await Promise.all(trips.map(async source => {
      let enriched;
      let trip;
      try {
        enriched = await wellFormed(mbta, source.exp);
        const prob = fromTrips(enriched);
        trip = await ground(prob, at);
      } catch (e) {
        if (`${e}`.includes("No predictions or schedules for leg")) {
          // TODO: expose to user with the matching MBTA alerts.
          console.warn("Trip unavailable", e);
          return undefined;
        } else {
          throw e;
        }
      }
      const raw = arrivalTimes(trip, at);
      // TODO: This is of course exceedingly silly.
      // empty string in arrivalTimes, sharing a type.
      return {
        samples: raw.samples,
        errors: raw.errors,
        source: enriched,
        name: source.name
      };
    }))).filter(d => d !== undefined);
    const data = sortedByArrival(solved)
      // Filter out dominated trips
      // Accumulator avoids double-filtering
      .reduce<SolvedTrip[]>((acc, d) =>
        acc.some(t => dominates(t.samples, d.samples)) ? acc : [...acc, d],
        []);
    setData(data);
    if (data.length === 1) {
      setSummary(await tripSummary(data[0].source.steps));
    } else {
      assert(data.length > 1, "Should have at least two trips to summarize");
      const prefix = commonPrefix(data.map(d => d.source.steps));
      const few = data.length === 2 ? "couple" : "few";
      if (prefix.length === 0) {
        const part = (d: SolvedTrip) => `${d.name}, you'll arrive between ${describe(d).replace("Arrive ", "").replace(" - ", " and ")}`;
        setSummary(`There are a ${few} ways you can go and none is always faster than the others. So if you take ${part(data[0])}, but if you take ${part(data[1])}${data.length > 2 ? ", etc..." : "."} Check the deets below.`);
      } else {
        const prefixGuide = tripSummary(prefix);
        const all = data.length === 2 ? "both" : "all";
        return `So, there are a ${few} fast ways, but they ${all} start the same way. ${prefixGuide}. Then, check in with me again and I might have more precise predictions to get you the rest of the way.`
      }
    }
  })() }, [trips, at, setData]);
  
  return <>
    {summary && <div style={{ padding: "1em" }}>
      <h2>What to do</h2>
      <p>{summary}</p>
    </div>}
    <ArrivalPlots trips={data} startAt={at} />
  </>;
};

export default Arrivals;
