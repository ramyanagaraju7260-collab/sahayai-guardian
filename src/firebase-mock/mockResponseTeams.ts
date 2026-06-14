export const mockResponseTeams = [
  {
    collection: "responseTeams",
    document: "team_ambulance_01",
    payload: {
      name: "Central Ambulance Squad",
      type: "ambulance",
      status: "en route",
      assignedTo: "incident_1001",
      etaMinutes: 3,
    },
  },
  {
    collection: "responseTeams",
    document: "team_fire_01",
    payload: {
      name: "Bengaluru Fire Unit 7",
      type: "fire",
      status: "standby",
      assignedTo: "incident_1002",
      etaMinutes: 8,
    },
  },
];
