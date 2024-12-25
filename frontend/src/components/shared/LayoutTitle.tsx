interface LayoutTitleProps {
  title: string;
}

const LayoutTitle = ({ title }: LayoutTitleProps) => {
  return (
    <div className="flex items-center py-8 bg-gray-200 pl-8">
      <h1 className="font-semibold text-3xl text-gray-700">{title}</h1>
    </div>
  );
};

export default LayoutTitle;
