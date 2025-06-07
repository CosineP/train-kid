declare module "mbta-client" {
  
  // Utility functions (assuming they're imported)
  type BuildUrlFunction = (path: string) => string;
  type FetchServiceFunction = (url: string, options?: RequestInit) => Promise<any>;
  type Relationship = { data: { id: string } };

  export type MBTAResponse<T> = { data: T[] };

  export type Options = {
    stop?: string,
    id?: string,
    sort?: "arrival_time" | "departure_time";
    descending?: boolean;
  };

  // Types for API responses (placeholders, should be refined with actual API response types)
  export interface Stop {
    id: string;
    attributes: {
      name: string;
      description?: string;
      at_street?: string;
      latitude: number;
      longitude: number;
    };
  }

  export interface Trip {
    id: string;
    relationships: {
      route: Relationship;
    };
    attributes: {
      name: string;
      direction_id: number;
    };
  }

  export interface Line {
    id: string;
    attributes: {
      name: string;
      color: string;
    };
  }

  export interface Alert {
    id: string;
    attributes: {
      header: string;
      description: string;
    };
  }

  export interface Shape {
    id: string;
    attributes: {
      polyline: string;
    };
  }

  export interface Route {
    id: string;
    attributes: {
      long_name: string;
      short_name: string;
    };
  }

  export interface Service {
    id: string;
    attributes: {
      service_type: string;
    };
  }

  export interface Vehicle {
    id: string;
    attributes: {
      label: string;
      latitude: number;
      longitude: number;
    };
  }

  export interface Schedule {
    id: string;
    relationships: {
      route: Relationship;
      trip: Relationship;
    }
    attributes: {
      departure_time: string;
    };
  }

  export interface Prediction {
    id: string;
    relationships: {
      route: Relationship;
      trip: Relationship;
      stop: Relationship;
    }
    attributes: {
      departure_time?: string;
      arrival_time?: string;
    };
  }

  // Constants
  export interface Pagination {
    limit: number;
    offset: number;
  }

  // Main class declaration
  class MBTA {
    constructor(apiKey: string, fetch?: FetchServiceFunction, logger?: Logger);

    private _fetch(path: string): () => Promise<any>;

    fetchStops: (options?: Options) => Promise<MBTAResponse<Stop>>;
    fetchTrips: (options: Options) => Promise<MBTAResponse<Trip>>;
    fetchLines: (options: Options) => Promise<MBTAResponse<Line>>;
    fetchAlerts: (options: Options) => Promise<MBTAResponse<Alert>>;
    fetchShapes: (options: Options) => Promise<MBTAResponse<Shape>>;
    fetchRoutes: (options: Options) => Promise<MBTAResponse<Route>>;
    fetchServices: (options: Options) => Promise<MBTAResponse<Service>>;
    fetchVehicles: (options: Options) => Promise<MBTAResponse<Vehicle>>;
    fetchSchedules: (options: Options) => Promise<MBTAResponse<Schedule>>;
    fetchPredictions: (options: Options) => Promise<MBTAResponse<Prediction>>;
  }

  export = MBTA;
}
