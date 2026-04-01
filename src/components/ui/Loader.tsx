import type { FC } from "react";

interface LoaderProps {
  text?: string;
}

const Loader: FC<LoaderProps> = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 border-2 border-subtle rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-[rgb(var(--accent))] rounded-full animate-spin" />
      </div>
      <p className="mt-4 text-sm font-medium text-muted animate-pulse">
        {text}
      </p>
    </div>
  );
};
export default Loader;
