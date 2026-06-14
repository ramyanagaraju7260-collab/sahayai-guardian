export const mockAnalytics = [
  {
    collection: "analytics",
    document: "analytics_001",
    payload: {
      metric: "incident_rate",
      window: "1h",
      value: 12,
      trend: "up",
      region: "Bengaluru",
    },
  },
  {
    collection: "analytics",
    document: "analytics_002",
    payload: {
      metric: "silent_distress_events",
      window: "24h",
      value: 4,
      trend: "stable",
      region: "Bengaluru",
    },
  },
];
