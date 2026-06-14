export const mockDeviceHealth = [
  {
    collection: "deviceHealth",
    document: "deviceHealth_01",
    payload: {
      deviceId: "device_001",
      batteryStatus: "good",
      signalStrength: "4G",
      lastChecked: 1710000190000,
      systemAlerts: [],
    },
  },
  {
    collection: "deviceHealth",
    document: "deviceHealth_02",
    payload: {
      deviceId: "device_002",
      batteryStatus: "low",
      signalStrength: "3G",
      lastChecked: 1710000200000,
      systemAlerts: ["update_required"],
    },
  },
];
