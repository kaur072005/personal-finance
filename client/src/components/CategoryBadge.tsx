import React from "react";
import { categoryColors } from "@/pages/TransactionsPage";

interface CategoryBadgeProps {
  category: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const colorClass = categoryColors[category] || "bg-gray-100 text-gray-600";
  
  return (
    <span className={`text-xs font-semibold inline-block py-1 px-2 rounded-full ${colorClass}`}>
      {category}
    </span>
  );
};

export default CategoryBadge;
