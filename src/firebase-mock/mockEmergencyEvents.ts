export const mockEmergencyEvents = [
  {
    collection: "emergency_events",
    document: "emergency_event_001",
    payload: {
      eventType: "voice_alert",
      eventName: "Fire alarm triggered",
      threatScore: 92,
      recordedAt: 1710000340000,
      response: "Dispatching fire unit",
      location: "MG Road, Bengaluru",
    },
  },
  {
    collection: "emergency_events",
    document: "emergency_event_002",
    payload: {
      eventType: "stealth_sos",
      eventName: "Possible kidnap threat",
      threatScore: 77,
      recordedAt: 1710000350000,
      response: "Guardian alert and silent recording",
      location: "HSR Layout, Bengaluru",
    },
  },
];
