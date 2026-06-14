export const mockNotifications = [
  {
    collection: "notifications",
    document: "notification_01",
    payload: {
      userId: "user_002",
      type: "guardian_alert",
      title: "Emergency alert received",
      body: "A critical incident has been detected near Koramangala.",
      read: false,
      timestamp: 1710000060000,
    },
  },
  {
    collection: "notifications",
    document: "notification_02",
    payload: {
      userId: "user_001",
      type: "status_update",
      title: "Rescue team inbound",
      body: "Ambulance ETA is 3 minutes away.",
      read: false,
      timestamp: 1710000100000,
    },
  },
];
