interface LayoutTitleProps {
  title: string;
  imgUrl?: string;
}

const LayoutTitle = ({ title, imgUrl }: LayoutTitleProps) => {
  return (
    <div className="flex items-center py-8 bg-gray-200 pl-8">
      {imgUrl && (
        <div className="w-16 h-16 mr-4">
          <img
            src={imgUrl}
            alt="Img Layout Title"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      )}
      <h1 className="font-semibold text-3xl text-gray-700">{title}</h1>
    </div>
  );
};

export default LayoutTitle;
