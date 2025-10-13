import Image from "next/image";
import type React from "react";

// Define the possible sizes for the avatar
type AvatarSize = "default" | "lg";

interface AvatarProps {
    seed: string;
    className?: string;
    size?: AvatarSize;
}

/**
 * Renders a unique, deterministic avatar based on a seed string.
 * Uses the DiceBear API for colorful, initial-based avatars.
 * @param {string} seed - The string to generate the avatar from.
 * @param {AvatarSize} [size='default'] - The size variant of the avatar ('default' or 'lg'). The 'lg' variant includes a shadow.
 * @param {string} [className] - Additional classes for custom styling.
 */
export const Avatar: React.FC<AvatarProps> = ({
                                                  seed,
                                                  size = "default",
                                                  className,
                                              }: AvatarProps) => {
    // Use a default seed if none is provided to avoid broken images
    const safeSeed = seed || "Anonymous";
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        safeSeed,
    )}`;

    // A map to hold the Tailwind classes for each size variant
    const sizeClasses: Record<AvatarSize, string> = {
        default: "h-10 w-10",
        lg: "h-32 w-32 shadow-lg ring-2 dark:ring-white ring-opacity-50 dark:ring-opacity-20 dark:ring-offset-2 dark:ring-offset-gray-800",
    };

    // Combine the base classes, the size-specific class, and any custom classes
    const containerClassName = `relative rounded-full overflow-hidden ${sizeClasses[size]} ${className || ''}`;

    return (
        <div className={containerClassName.trim()}>
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