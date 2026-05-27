import { Link } from "react-router-dom";

const baseClass =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition duration-200";

const ReviewButton = ({ to, onClick, children, variant = "primary", disabled = false }) => {
  const variants = {
    primary: "bg-amber-500 text-white hover:bg-amber-600 hover:-translate-y-0.5 shadow-sm",
    secondary:
      "border border-amber-200 bg-white text-amber-700 hover:border-amber-300 hover:bg-amber-50",
    muted:
      "border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100",
  };

  const className = `${baseClass} ${variants[variant] || variants.primary} ${
    disabled ? "cursor-not-allowed opacity-60 hover:translate-y-0" : ""
  }`;

  if (to) {
    return (
      <Link to={to} className={className} onClick={onClick} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  );
};

export default ReviewButton;