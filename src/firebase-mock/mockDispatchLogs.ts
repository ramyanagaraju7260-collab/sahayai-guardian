export const mockDispatchLogs = [
  {
    collection: "dispatchLogs",
    document: "dispatch_001",
    payload: {
      incidentId: "incident_1001",
      dispatcher: "dispatcher_01",
      action: "ambulance_dispatched",
      timestamp: 1710000210000,
      status: "confirmed",
    },
  },
  {
    collection: "dispatchLogs",
    document: "dispatch_002",
    payload: {
      incidentId: "incident_1002",
      dispatcher: "dispatcher_02",
      action: "guardian_alert_sent",
      timestamp: 1710000220000,
      status: "delivered",
    },
  },
];
