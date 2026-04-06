import { useState, useEffect } from "react";

const LoadingSpinner = ({ size = "medium", className = "" }) => {
  // Size variants
  const sizeClasses = {
    small: "h-5 w-5 border-2",
    medium: "h-8 w-8 border-3",
    large: "h-12 w-12 border-4",
  };

  // Color variants
  const colorClasses = "border-blue-500 border-t-transparent";

  return (
    <div
      className={`inline-block animate-spin rounded-full ${sizeClasses[size]} ${colorClasses} ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
