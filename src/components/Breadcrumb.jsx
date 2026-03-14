import { Link } from "react-router-dom";
import { FaAngleRight } from "react-icons/fa6";

const Breadcrumb = ({ items }) => {
  return (
    <nav
      className="py-3 sm:py-4 w-full max-w-4xl lg:max-w-6xl mx-auto px-4"
      aria-label="breadcrumb"
    >
      <ul className="flex flex-wrap items-center text-gray-600">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {item.link ? (
              <Link
                to={item.link}
                className="text-sm sm:text-base text-gray-600 text-brown-hover transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-sm sm:text-base text-gray-600">
                {item.label}
              </span>
            )}
            {index < items.length - 1 && (
              <FaAngleRight className="mx-2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Breadcrumb;
