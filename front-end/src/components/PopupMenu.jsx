import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaAngleRight } from "react-icons/fa6";

const PopupMenu = ({ trigger, options, menuType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (onClick) => {
    setIsOpen(false);
    if (onClick) {
      onClick();
    }
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger element */}
      <div onClick={toggleMenu} className="cursor-pointer">
        {trigger}
      </div>

      {/* Popup menu */}
      <div
        className={`popup-menu absolute left-0 ${
          menuType === "menuOptionsCategories" ? "w-65" : "w-55"
        } mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 ${
          isOpen ? "open" : ""
        }`}
      >
        <ul className="py-2">
          {options.map((option, index) => (
            <li key={index}>
              {menuType === "menuOptionsCategories" ? (
                <Link
                  to={option.href}
                  className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 text-brown-hover flex items-center border-brown-hover text-white-hover"
                  onClick={() => handleItemClick(option.onClick)}
                >
                  <FaAngleRight className="mr-3 text-white-hover" />
                  <span style={{ fontSize: "15px" }}>{option.label}</span>
                </Link>
              ) : (
                <Link
                  to={option.href}
                  onClick={() => handleItemClick(option.onClick)}
                  className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 text-brown-hover flex items-center"
                >
                  {option.icon}
                  <span className="ml-1" style={{ fontSize: "15px" }}>
                    {option.label}
                  </span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PopupMenu;
