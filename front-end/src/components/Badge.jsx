const Badge = ({ type, text }) => {
  const styles = {
    admin: "bg-blue-100 text-blue-800",
    user: "bg-green-100 text-green-800",
    active: "bg-emerald-100 text-emerald-800",
    inactive: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        styles[type] || "bg-gray-100 text-gray-800"
      }`}
    >
      {text}
    </span>
  );
};

export default Badge;