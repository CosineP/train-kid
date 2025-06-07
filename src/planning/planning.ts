import { LTrip, Step } from "../../model/trips/syntax";
import { Itinerary, Leg, LegRoute, Stop } from "@opentripplanner/types";
import { memo } from "../../model/util";

const NOMINATIM = "https://nominatim.openstreetmap.org/search";

const OTP: string = import.meta.env.VITE_OTP_URL ?? "/otp/gtfs/v1";

const geocode = memo(async (q: string) => {
  const url = `${NOMINATIM}?format=jsonv2&q=${encodeURIComponent(q)},ma`;
  const res = await fetch(url, { headers: { "User-Agent": "Train Kid" } });
  const [first] = (await res.json()) as { lat: string; lon: string; display_name: string }[];
  if (!first) throw new Error(`No geocode for ${q}`);
  return {
    lat: parseFloat(first.lat),
    lon: parseFloat(first.lon),
    name: first.display_name,
  };
});

const plan = async (from: { lat: number; lon: number }, to: { lat: number; lon: number }, start: Date): Promise<Itinerary[]> => {
  const query = `
  {
    planConnection(
      origin: {
        location: { coordinate: {
          latitude: ${from.lat},
          longitude: ${from.lon}
        } }
      }
      destination: {
        location: { coordinate: {
          latitude: ${to.lat},
          longitude: ${to.lon}
        } }
      }
      dateTime: { earliestDeparture: "${start.toISOString()}" }
    ) {
      edges {
        node {
          legs {
            mode
            duration
            from { name lat lon stop { gtfsId name } }
            to { name lat lon stop { gtfsId name } }
            route { gtfsId shortName longName }
          }
        }
      }
    }
  }`;
  console.log(query);
  const res = await fetch(OTP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });

  const { data, errors } = await res.json();
  if (errors) throw new Error(JSON.stringify(errors));

  const edges = data.planConnection.edges;
  const itineraries = edges.map((e: any) => e.node);

  return itineraries;
};

export const tripsFor = memo(async (from: string, to: string, start: Date): Promise<LTrip[]> => {
  const f = await geocode(from);
  const t = await geocode(to);
  const itins = await plan(f, t, start);
  const allTrips: LTrip[] = itins
    // Get rid of this silly just-walk leg
    .filter(i => i.legs.some(l => l.mode !== "WALK"))
    .map((itin: Itinerary) => {
      const stop = (stop: Stop) =>
        ({ id: stop.gtfsId.split(":")[1], name: stop.name });
      const steps = itin.legs.map<Step>((l: Leg) =>
        l.mode === "WALK"
          ? { kind: "walk", for: Math.round(l.duration / 60) }
          : {
              kind: "leg",
              from: stop(l.from.stop!),
              to: stop(l.to.stop!),
              marginalMinutes: Math.round(l.duration / 60)
            });
      const shortRoute = (r: string | LegRoute | undefined): string =>
        typeof r === "string" ? r : r?.shortName ?? r?.longName ?? "";
      const part = (l: Leg) => l.mode === "WALK" ?
        l.duration / 60 > 10 ? `Walk` : "" : shortRoute(l.route);
      const summary = itin.legs.map(part)
        .filter((s: string) => s !== "")
        .join(", ");
      return { name: summary, exp: { kind: "seq", steps } };
    });
  if (allTrips.length === 0)
    throw new Error(`No trips found from ${from} to ${to} at ${start}`);
  const deduped = [...new Map(
    allTrips.map(i => [JSON.stringify(i), i])).values()];
  return deduped;
});

