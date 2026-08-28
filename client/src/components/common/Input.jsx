const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  error,
  helperText,
  icon: Icon,
  disabled = false,
  required = false,
  className = "",
}) => {
  return (
    <div className="space-y-1.5 w-full text-left">
      {label && (
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Icon size={16} />
          </div>
        )}

        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full
            rounded-xl
            border
            bg-white
            py-2.5
            text-sm
            text-slate-900
            placeholder:text-slate-400
            transition-all duration-150
            outline-none
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            ${Icon ? "pl-10 pr-4" : "px-4"}
            ${error ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20" : "border-slate-200"}
            ${className}
          `}
        />
      </div>

      {error ? (
        <p className="text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;