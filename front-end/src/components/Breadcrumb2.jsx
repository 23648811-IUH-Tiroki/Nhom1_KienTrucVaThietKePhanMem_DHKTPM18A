import defaultBanner from "../assets/images/image1.jpg";
import { Link } from "react-router-dom";

const Breadcrumb = ({ links, banner }) => {
  return (
    <div className="relative w-full h-72">
      {/* Banner */}
      <img
        src={banner || defaultBanner}
        className="h-32 md:w-full md:h-full object-cover"
        alt="Banner"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-opacity-50 flex flex-col justify-center items-center text-white">
        <h1 className="text-3xl font-bold text-brown">
          {links[links.length - 1].label}
        </h1>
        <nav className="mt-2 space-x-2 text-lg">
          {links.map((link, index) => (
            <span key={index}>
              {index > 0 && <span className="text-white"> &gt; </span>}
              {index === links.length - 1 ? (
                <span className="text-brown font-semibold">
                  {link.label}
                </span>
              ) : (
                <Link
                  to={link.href}
                  className="text-white text-brown-hover transition-colors"
                >
                  {link.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;
