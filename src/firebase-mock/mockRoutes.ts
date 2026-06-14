export const mockRoutes = [
  {
    collection: "routes",
    document: "route_001",
    payload: {
      name: "Ambulance Green Corridor",
      start: "Koramangala",
      end: "Apollo Hospital",
      status: "active",
      etaMinutes: 6,
      safetyScore: 94,
    },
  },
  {
    collection: "routes",
    document: "route_002",
    payload: {
      name: "Evacuation Path",
      start: "Jayanagar Park",
      end: "Open Ground",
      status: "recommended",
      crowdDensity: "low",
      guidance: "Follow blue markers and avoid narrow lanes.",
    },
  },
];
