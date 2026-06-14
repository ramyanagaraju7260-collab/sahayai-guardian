export const mockUsers = [
  {
    collection: "users",
    document: "user_001",
    payload: {
      uid: "user_001",
      name: "Aarav Sharma",
      role: "primary_user",
      phone: "+91 91234 56789",
      email: "aarav.sharma@example.com",
      status: "active",
      preferences: { silentSOS: true, autoAlerts: true, language: "en" },
    },
  },
  {
    collection: "users",
    document: "user_002",
    payload: {
      uid: "user_002",
      name: "Priya Menon",
      role: "guardian",
      phone: "+91 99876 54321",
      email: "priya.menon@example.com",
      status: "active",
      trustScore: 0.96,
    },
  },
];
