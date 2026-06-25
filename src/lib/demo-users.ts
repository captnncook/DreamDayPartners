export type DemoRole =
  | "admin"
  | "planner"
  | "couple"
  | "bloemist"
  | "dj"
  | "catering"
  | "fotograaf"
  | "videograaf"
  | "haarstylist"
  | "liveband"
  | "bakker"
  | "trouwlocatie"
  | "vervoer"
  | "weddingplanner_vendor";

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
  fotograaf: {
    email: "hallo@lichtvang.nl",
    name: "Lara Vermeer",
    label: "Fotograaf",
  },
  videograaf: {
    email: "info@studioeeuwig.nl",
    name: "Tom de Wit",
    label: "Videograaf",
  },
  haarstylist: {
    email: "studio@glowbridal.nl",
    name: "Noa Pieters",
    label: "Haarstylist",
  },
  liveband: {
    email: "boekingen@velvetnotes.nl",
    name: "Daan Kroon",
    label: "Liveband",
  },
  bakker: {
    email: "sanne@zoetenzo.nl",
    name: "Sanne Bakker",
    label: "Bakker",
  },
  trouwlocatie: {
    email: "events@dehaar.nl",
    name: "Eveline Boschma",
    label: "Trouwlocatie",
  },
  vervoer: {
    email: "rijden@classiccars.nl",
    name: "Henk Visser",
    label: "Vervoer",
  },
  weddingplanner_vendor: {
    email: "hallo@foreveryours.nl",
    name: "Isa Mulder",
    label: "WP (leverancier)",
  },
};
