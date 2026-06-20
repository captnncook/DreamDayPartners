export type DemoRole = "admin" | "planner" | "couple" | "bloemist" | "dj" | "catering";

export const DEMO_USERS: Record<DemoRole, { email: string; name: string; label: string }> = {
  admin: {
    email: "admin@dreamday.nl",
    name: "Platform Admin",
    label: "Admin",
  },
  planner: {
    email: "planner@dreamday.nl",
    name: "Sophie van der Berg",
    label: "Weddingplanner",
  },
  couple: {
    email: "emma@example.nl",
    name: "Emma de Vries",
    label: "Bruidspaar",
  },
  bloemist: {
    email: "bloemen@roos.nl",
    name: "Roos Janssen",
    label: "Bloemist",
  },
  dj: {
    email: "dj@beats.nl",
    name: "DJ Marco",
    label: "DJ",
  },
  catering: {
    email: "info@tasty.nl",
    name: "Tasty Events Catering",
    label: "Catering",
  },
};
