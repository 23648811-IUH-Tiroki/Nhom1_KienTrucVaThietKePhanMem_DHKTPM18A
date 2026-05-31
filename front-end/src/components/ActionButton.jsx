
const ActionButton = ({ icon: Icon, onClick, color }) => {
  const colorStyles = {
    blue: "text-blue-600 hover:text-blue-900 hover:bg-blue-50",
    yellow: "text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50",
    red: "text-red-600 hover:text-red-900 hover:bg-red-50",
    gray: "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
  };

  return (
    <button
      onClick={onClick}
      className={`cursor-pointer p-2 rounded-full transition-colors ${
        colorStyles[color] || colorStyles.gray
      }`}
    >
      <Icon size={16} />
    </button>
  );
};

export default ActionButton;