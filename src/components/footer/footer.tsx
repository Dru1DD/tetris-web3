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
    <div className="w-full p-4 bottom-0 flex justify-center items-center bg-accent-blue border-t-2 border-black">
      <div className="w-full max-w-lg flex justify-evenly">
        <button
          onClick={handleLeftButtonClicked}
          className="bg-white hover:bg-gray-200 text-black w-16 h-16 sprite sprite-shadows cursor-pointer"
        >
          ←
        </button>

        <button
          onClick={handleDownButtonClicked}
          className="bg-accent-green hover:bg-green-700 text-black w-16 h-16 sprite sprite-shadows cursor-pointer"
        >
          Yes
        </button>

        <button
          onClick={handleUpButtonClicked}
          className="bg-accent-red hover:bg-red-700 text-black w-16 h-16 sprite sprite-shadows cursor-pointer"
        >
          No
        </button>
        <button
          onClick={handleRightButtonClicked}
          className="bg-white hover:bg-gray-200 text-black w-16 h-16 sprite sprite-shadows cursor-pointer"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default Footer;
