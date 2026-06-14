export const mockIncidents = [
  {
    collection: "incidents",
    document: "incident_1001",
    payload: {
      type: "fire",
      severity: "CRITICAL",
      location: "MG Road, Bengaluru",
      status: "RESPONDING",
      reportedBy: "user_001",
      timestamp: 1710000010000,
    },
  },
  {
    collection: "incidents",
    document: "incident_1002",
    payload: {
      type: "silent_distress",
      severity: "HIGH",
      location: "Jayanagar, Bengaluru",
      status: "ACTIVE",
      reportedBy: "user_001",
      timestamp: 1710000050000,
    },
  },
];
