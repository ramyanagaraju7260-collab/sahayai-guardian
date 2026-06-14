export const mockTelemetry = [
  {
    collection: "telemetry",
    document: "telemetry_001",
    payload: {
      deviceId: "device_001",
      readingType: "accelerometer",
      value: { x: 0.08, y: -0.03, z: 9.72 },
      recordedAt: 1710000150000,
      incidentPrediction: "low",
    },
  },
  {
    collection: "telemetry",
    document: "telemetry_002",
    payload: {
      deviceId: "device_002",
      readingType: "heart_rate",
      value: 112,
      recordedAt: 1710000160000,
      incidentPrediction: "medium",
    },
  },
];
