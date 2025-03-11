interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  selected: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  icon,
  onClick,
  selected,
}) => {
  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer 
        ${selected ? "bg-primary/20 border-borderColor/50 shadow-md" : "border-borderColor/50 hover:border-borderColor/80 hover:bg-darkEnd/20"}
        hover:scale-105`}
      onClick={onClick}
    >
      <div className="text-primary text-xl">{icon}</div>
      <span className="text-sm font-medium text-white">{title}</span>
    </div>
  );
};
