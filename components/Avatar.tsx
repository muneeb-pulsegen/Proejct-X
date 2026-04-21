type AvatarProps = {
  imageData?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
};

const sizeClassMap = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-base",
  lg: "h-20 w-20 text-xl"
};

export default function Avatar({ imageData, name, size = "md" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-full border border-white/70 bg-blue-100 font-semibold text-blue-700 ${sizeClassMap[size]}`}
    >
      {imageData ? (
        <img alt={name} className="h-full w-full object-cover" src={imageData} />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
