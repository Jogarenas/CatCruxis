import {
  ArrowUpRight,
  Briefcase,
  BookOpen,
  Lightbulb,
  Trophy,
  Users,
  Palette,
  Code,
  Heart,
  Sprout,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Category } from "../data/types";
const icons = [
  BookOpen,
  Briefcase,
  Code,
  Lightbulb,
  Trophy,
  Users,
  Palette,
  Sprout,
  Heart,
];
export function CategoryCard({
  category,
  count,
}: {
  category: Category;
  count: number;
}) {
  const Icon = icons[category.id - 1];
  return (
    <Link
      to={`/categories/${category.slug}`}
      className={`category-card category-${category.id}`}
    >
      <div className="category-top">
        <Icon size={27} strokeWidth={1.4} />
        <ArrowUpRight size={21} />
      </div>
      <div>
        <h3>{category.name}</h3>
        <span>{count} events to explore</span>
      </div>
    </Link>
  );
}
