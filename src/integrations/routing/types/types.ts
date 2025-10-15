export type Coordinate = {
  lat: number;
  long: number;
};

export type RouteEndpoints = {
  start: Coordinate | string;
  end: Coordinate | string;
};
