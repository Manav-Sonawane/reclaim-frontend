import { Tag, Smartphone, Briefcase, Shirt, HelpCircle, Watch } from 'lucide-react';

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export const CategoryBadge = ({ category, className = '' }: CategoryBadgeProps) => {
  const getCategoryStyles = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'electronics':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-700 dark:text-blue-300',
          icon: Smartphone
        };
      case 'clothing':
        return {
          bg: 'bg-violet-100 dark:bg-violet-900/30',
          text: 'text-violet-700 dark:text-violet-300',
          icon: Shirt
        };
      case 'documents':
        return {
          bg: 'bg-amber-100 dark:bg-amber-900/30',
          text: 'text-amber-700 dark:text-amber-300',
          icon: Briefcase
        };
      case 'accessories':
        return {
          bg: 'bg-pink-100 dark:bg-pink-900/30',
          text: 'text-pink-700 dark:text-pink-300',
          icon: Watch
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-700 dark:text-gray-300',
          icon: Tag
        };
    }
  };

  const { bg, text, icon: Icon } = getCategoryStyles(category);

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text} ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {category}
    </div>
  );
};
