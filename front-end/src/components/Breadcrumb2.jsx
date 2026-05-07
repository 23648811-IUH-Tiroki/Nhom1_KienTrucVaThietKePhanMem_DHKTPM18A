import defaultBanner from "../assets/images/image1.jpg";
import { Link } from "react-router-dom";

const Breadcrumb = ({ links, banner }) => {
  const title = links?.[links.length - 1]?.label || "Trang";

  return (
    <section className="relative w-full overflow-hidden">
      <img
        src={banner || defaultBanner}
        className="h-40 w-full object-cover md:h-72"
        alt="Banner"
      />

      <div className="absolute inset-0 bg-black/45" />

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="w-full max-w-4xl rounded-2xl border border-white/30 bg-white/10 p-4 text-white backdrop-blur-sm md:p-6">
          <h1 className="text-center text-2xl font-bold md:text-4xl">
            {title}
          </h1>
          <nav className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm md:text-lg">
            {(links || []).map((link, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-white/75">›</span>}
                {index === (links || []).length - 1 ? (
                  <span className="font-semibold text-amber-300">{link.label}</span>
                ) : (
                  <Link
                    to={link.href || link.link || "/"}
                    className="text-white transition-colors hover:text-amber-200"
                  >
                    {link.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
};

export default Breadcrumb;
