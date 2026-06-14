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

export const mockFirebaseData = [
  ...mockUsers,
  ...mockGuardians,
  ...mockDevices,
  ...mockRoutes,
  ...mockEvidence,
  ...mockAnalytics,
  ...mockTelemetry,
  ...mockNotifications,
  ...mockAppConfig,
  ...mockAgents,
  ...mockIncidents,
  ...mockEmergencyContacts,
  ...mockDeviceHealth,
  ...mockResponseTeams,
  ...mockDispatchLogs,
  ...mockVoiceAlerts,
  ...mockThreatLogs,
  ...mockEmergencyEvents,
];

// NOTE:
// This file combines all mock Firebase fixture modules into a single demo dataset.
// It remains completely offline and does not connect to any live Firebase project.
