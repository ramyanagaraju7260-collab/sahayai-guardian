export const mockThreatLogs = [
  {
    collection: "threat_logs",
    document: "threat_log_001",
    payload: {
      type: "voice + yolo fusion",
      score: 89,
      status: "CRITICAL",
      keywords: ["help", "fire"],
      cameraContext: ["fire", "running"],
      timestamp: 1710000310000,
      location: "Koramangala, Bengaluru",
    },
  },
  {
    collection: "threat_logs",
    document: "threat_log_002",
    payload: {
      type: "personal threat",
      score: 72,
      status: "WARNING",
      keywords: ["kidnap", "stop"],
      cameraContext: ["weapon"],
      timestamp: 1710000330000,
      location: "Jayanagar, Bengaluru",
    },
  },
];
