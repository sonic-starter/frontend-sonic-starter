interface CategoryCardProps {
  title: string;
  icon: React.ReactNode; // You can use an icon library or SVGs
  onClick: () => void;
  selected: boolean; // {{ edit_1 }} Added selected prop
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ title, icon, onClick, selected }) => { // {{ edit_2 }} Updated to include selected prop
  return (
    <div 
      className={`flex flex-col items-center text-primary p-4 border transition ${selected ? 'bg-primary/10 border-borderColor hover:border-borderColor/80' : ' border-borderColor/50 hover:border-borderColor/60'} cursor-pointer rounded-lg`}
      onClick={onClick}
    >
      {icon}
      <span className="mt-2 text-lg">{title}</span>
    </div>
  );
};