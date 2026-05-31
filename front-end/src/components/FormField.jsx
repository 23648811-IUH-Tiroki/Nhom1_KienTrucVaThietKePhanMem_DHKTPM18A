<<<<<<< HEAD
import { ChevronDown } from "lucide-react";
=======
import {ChevronDown} from "lucide-react";
>>>>>>> 6a3aceecc8855e0a8448360e8da860a69c238487

const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  options,
  required = true,
  error,
  disabled = false,
}) => {
  if (type === "select") {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="relative">
          <select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-3 pointer-events-none text-gray-500"
            size={16}
          />
        </div>
<<<<<<< HEAD
        {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
=======
        {error && <p className="text-xs text-rose-600">{error}</p>}
>>>>>>> 6a3aceecc8855e0a8448360e8da860a69c238487
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
<<<<<<< HEAD
      {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
=======
      {error && <p className="text-xs text-rose-600">{error}</p>}
>>>>>>> 6a3aceecc8855e0a8448360e8da860a69c238487
    </div>
  );
};

export default FormField;
