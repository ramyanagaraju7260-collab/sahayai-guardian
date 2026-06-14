export const mockGuardians = [
  {
    collection: "guardians",
    document: "guardian_01",
    payload: {
      name: "Sanjay Patel",
      relation: "Brother",
      phone: "+91 91230 12345",
      notifyPreferences: ["sms", "in-app"],
      trustScore: 0.94,
    },
  },
  {
    collection: "guardians",
    document: "guardian_02",
    payload: {
      name: "Meera Iyer",
      relation: "Mother",
      phone: "+91 99870 54321",
      notifyPreferences: ["phone_call", "whatsapp"],
      trustScore: 0.99,
    },
  },
];
