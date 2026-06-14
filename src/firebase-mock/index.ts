import { mockFirebaseData } from "./mockFirebaseData";
import { mockAnalytics } from "./mockAnalytics";
import { mockAppConfig } from "./mockAppConfig";
import { mockAgents } from "./mockAgents";
import { mockDevices } from "./mockDevices";
import { mockEvidence } from "./mockEvidence";
import { mockGuardians } from "./mockGuardians";
import { mockIncidents } from "./mockIncidents";
import { mockNotifications } from "./mockNotifications";
import { mockRoutes } from "./mockRoutes";
import { mockTelemetry } from "./mockTelemetry";
import { mockUsers } from "./mockUsers";
import { mockEmergencyContacts } from "./mockEmergencyContacts";
import { mockDeviceHealth } from "./mockDeviceHealth";
import { mockResponseTeams } from "./mockResponseTeams";
import { mockDispatchLogs } from "./mockDispatchLogs";
import { mockVoiceAlerts } from "./mockVoiceAlerts";
import { mockThreatLogs } from "./mockThreatLogs";
import { mockEmergencyEvents } from "./mockEmergencyEvents";

export {
  mockFirebaseData,
  mockAnalytics,
  mockAppConfig,
  mockAgents,
  mockDevices,
  mockEvidence,
  mockGuardians,
  mockIncidents,
  mockNotifications,
  mockRoutes,
  mockTelemetry,
  mockUsers,
  mockEmergencyContacts,
  mockDeviceHealth,
  mockResponseTeams,
  mockDispatchLogs,
  mockVoiceAlerts,
  mockThreatLogs,
  mockEmergencyEvents,
};

export const fakeFirebaseClient = {
  getMockData: () => mockFirebaseData,
  getCollection: (collectionName: string) => mockFirebaseData.filter((doc) => doc.collection === collectionName),
};

// NOTE:
// This module is for demo presentation only. It does not connect to any live Firebase project.
