import Image from "next/image";
import type React from "react";

interface AvatarProps {
  seed: string;
  className?: string;
}

/**
 * Renders a unique, deterministic avatar based on a seed string.
 * Uses the DiceBear API for colorful, initial-based avatars.
 */
export const Avatar: React.FC<AvatarProps> = ({
  seed,
  className = "h-10 w-10",
}) => {
  // Use a default seed if none is provided to avoid broken images
  const safeSeed = seed || "Anonymous";
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    safeSeed,
  )}`;

  return (
    <div className={`relative rounded-full overflow-hidden ${className}`}>
      <Image
        src={avatarUrl}
        alt={`${safeSeed}'s avatar`}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        unoptimized
      />
    </div>
  );
};
