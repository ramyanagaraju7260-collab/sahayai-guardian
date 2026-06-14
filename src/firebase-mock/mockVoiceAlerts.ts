export const mockVoiceAlerts = [
  {
    collection: "voice_alerts",
    document: "voice_alert_001",
    payload: {
      event: "HELP FIRE HELP",
      confidence: 92,
      severity: "CRITICAL",
      transcript: "help fire help",
      timestamp: 1710000300000,
      location: "Koramangala, Bengaluru",
    },
  },
  {
    collection: "voice_alerts",
    document: "voice_alert_002",
    payload: {
      event: "KIDNAP STOP",
      confidence: 88,
      severity: "WARNING",
      transcript: "kidnap stop please help",
      timestamp: 1710000320000,
      location: "Indiranagar, Bengaluru",
    },
  },
];
