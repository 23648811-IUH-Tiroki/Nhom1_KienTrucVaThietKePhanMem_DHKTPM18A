import defaultBanner from "../assets/images/image1.jpg";
import { Link } from "react-router-dom";

const Breadcrumb = ({ links, banner }) => {
  return (
    <div className="relative w-full h-40 md:h-56">
      {/* Banner */}
      <img
        src={banner || defaultBanner}
        className="h-full w-full object-cover"
        alt="Banner"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white">
        <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow">
          {links[links.length - 1].label}
        </h1>
        <nav className="mt-2 space-x-2 text-sm md:text-lg">
          {links.map((link, index) => (
            <span key={index}>
              {index > 0 && <span className="text-white"> &gt; </span>}
              {index === links.length - 1 ? (
                <span className="text-amber-200 font-semibold">
                  {link.label}
                </span>
              ) : (
                <Link
                  to={link.href}
                  className="text-white hover:text-amber-200 transition-colors"
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
