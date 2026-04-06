import { useState } from "react";
import { Link } from "react-router-dom";

const HoverPopupMenu = ({ trigger, options }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="hover-popup-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="cursor-pointer">{trigger}</div>

      {isHovered && (
        <div className="hover-popup-menu" >
          <ul>
            {options.map((option, index) => (
              <li key={index}>
                {option.href ? (
                  <Link
                    to={option.href}
                    className="block w-full text-gray-700 hover:text-brown-hover"
                  >
                    {option.icon && <span className="mr-2">{option.icon}</span>}
                    <span>{option.label}</span>
                  </Link>
                ) : (
                  <button
                    onClick={option.onClick}
                    className="block w-full text-left text-gray-700 hover:text-brown-hover"
                  >
                    {option.icon && <span className="mr-2">{option.icon}</span>}
                    <span>{option.label}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HoverPopupMenu;
