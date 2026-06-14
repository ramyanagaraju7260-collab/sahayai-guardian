export const mockDevices = [
  {
    collection: "devices",
    document: "device_001",
    payload: {
      userId: "user_001",
      deviceType: "smartphone",
      operatingSystem: "Android",
      batteryLevel: 82,
      lastSync: 1710000120000,
      emergencySensors: ["accelerometer", "gyroscope", "microphone", "gps"],
    },
  },
  {
    collection: "devices",
    document: "device_002",
    payload: {
      userId: "user_002",
      deviceType: "smartwatch",
      operatingSystem: "WearOS",
      batteryLevel: 68,
      lastSync: 1710000110000,
      emergencySensors: ["heart_rate", "motion", "alarm"],
    },
  },
];
