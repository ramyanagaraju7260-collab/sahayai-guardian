export const mockAppConfig = [
  {
    collection: "appConfig",
    document: "sahayai_settings",
    payload: {
      version: "2.0.1",
      autoSOS: true,
      silentMode: true,
      offlineMesh: true,
      evidenceRecording: true,
      emergencyProtocols: ["auto_call", "live_gps", "guardian_alert"],
      languageSupport: ["en", "hi", "kn", "ta", "te"],
    },
  },
];
