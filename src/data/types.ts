export interface Category {
  id: number;
  name: string;
  slug: string;
}
export interface Organizer {
  id: number;
  name: string;
  type: string;
}
export interface Source {
  id: number;
  name: string;
  url?: string;
}
export interface CampusEvent {
  id: number;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  startDateTime: string;
  endDateTime?: string;
  location: { id: number; name: string; building?: string; room?: string };
  organizers: Organizer[];
  categories: Category[];
  sources: Source[];
  officialStatus: "official" | "student-organized";
  image: string;
  imageAlt: string;
  featured: boolean;
}
export interface EventFilters {
  search: string;
  date: string;
  category: string;
  organizer: string;
  location: string;
  source: string;
  status: string;
}
