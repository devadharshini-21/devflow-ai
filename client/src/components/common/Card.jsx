const Card = ({
  children,
  className = "",
  hover = false,
  padding = "p-6",
}) => {
  return (
    <div
      className={`
        rounded-2xl
        border border-slate-200
        bg-white
        text-slate-900
        shadow-sm
        ${padding}
        ${hover ? "transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;