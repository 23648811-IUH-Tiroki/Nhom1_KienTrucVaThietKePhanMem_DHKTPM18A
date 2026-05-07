
const UserAvatar = ({ src, alt, size = "md" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-32 h-32",
  };

  const convertBase64ToImage = (base64) => {
    const value = (base64 || "").toString().trim();
    if (!value || value === "undefined" || value === "null") return "/avatar.png";
    if (value.startsWith("data:image")) return value;
    return `data:image/jpeg;base64,${value}`;
  };

  return (
    <img
      src={convertBase64ToImage(src)}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full object-cover ${size === "lg" ? "border-4 border-gray-200" : ""
        }`}
    />
  );
};

export default UserAvatar