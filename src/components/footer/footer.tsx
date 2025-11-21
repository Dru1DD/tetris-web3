interface FooterProps {
  handleLeftButtonClicked: () => void;
  handleRightButtonClicked: () => void;
  handleUpButtonClicked: () => void;
  handleDownButtonClicked: () => void;
}

const Footer = ({
  handleLeftButtonClicked,
  handleRightButtonClicked,
  handleDownButtonClicked,
  handleUpButtonClicked,
}: FooterProps) => {
  return (
    <div className="w-full p-4 bottom-0 flex justify-evenly bg-accent-blue border-t-2 border-black">
      <button
        onClick={handleLeftButtonClicked}
        className="bg-white hover:bg-gray-200 text-black w-16 h-16 sprite sprite-shadows cursor-pointer"
      >
        ←
      </button>

      <button
        onClick={handleUpButtonClicked}
        className="bg-white hover:bg-gray-200 text-black w-16 h-16 sprite sprite-shadows cursor-pointer"
      >
        ↑
      </button>
      <button
        onClick={handleDownButtonClicked}
        className="bg-white hover:bg-gray-200 text-black w-16 h-16 sprite sprite-shadows cursor-pointer"
      >
        ↓
      </button>

      <button
        onClick={handleRightButtonClicked}
        className="bg-white hover:bg-gray-200 text-black w-16 h-16 sprite sprite-shadows cursor-pointer"
      >
        →
      </button>
    </div>
  );
};

export default Footer;
