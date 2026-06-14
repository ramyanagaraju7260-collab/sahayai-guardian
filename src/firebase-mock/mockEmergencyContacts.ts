export const mockEmergencyContacts = [
  {
    collection: "emergencyContacts",
    document: "contact_01",
    payload: {
      userId: "user_001",
      name: "Ravi Kumar",
      relation: "Father",
      phone: "+91 90123 45678",
      priority: "primary",
      available: true,
    },
  },
  {
    collection: "emergencyContacts",
    document: "contact_02",
    payload: {
      userId: "user_001",
      name: "Nisha Gupta",
      relation: "Friend",
      phone: "+91 90987 65432",
      priority: "secondary",
      available: false,
    },
  },
];
