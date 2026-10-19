import type { Category } from "./types";
export const categories: Category[] = [
  "Academic",
  "Career",
  "Technology",
  "Entrepreneurship",
  "Sports",
  "Social",
  "Arts & Culture",
  "Community",
  "Wellness",
].map((name, i) => ({
  id: i + 1,
  name,
  slug: name.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-"),
}));
