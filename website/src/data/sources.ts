import type { Source } from "./types";
export const sources: Source[] = [
  "WildcatSync",
  "Handshake",
  "Hurt Hub",
  "Department Email",
  "Student Submission",
].map((name, i) => ({
  id: i + 1,
  name,
  url: `https://example.com/mock-events/${name.toLowerCase().replace(/ /g, "-")}`,
}));
