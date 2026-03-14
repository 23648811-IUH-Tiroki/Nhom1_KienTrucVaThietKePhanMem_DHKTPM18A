import { FaBell } from "react-icons/fa";
import { CiMenuFries } from "react-icons/ci";

const TopNavigation = ({ setMobileSidebarOpen, currentUser }) => {
  const convertBase64ToImage = (base64) => {
    if (!base64) return "/avarar.png";
    return `data:image/jpeg;base64,${base64}`;
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            className="md:hidden mr-2 text-gray-500"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <CiMenuFries size={24} />
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer">
            <FaBell size={20} />
          </button>
          <div className="flex items-center">
            <img
              src={convertBase64ToImage(currentUser?.avatar)}
              alt={currentUser?.fullName || "User"}
              className="w-8 h-8 rounded-full mr-2"
            />
            <span className="hidden md:inline text-lg font-medium">
              {currentUser?.fullName || "Admin"}{" "}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
