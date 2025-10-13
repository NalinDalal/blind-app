import React, { type FC } from "react";

interface LoaderProps {
  errorMessage?: string;
}

const Loader: FC<LoaderProps> = ({ errorMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
      <p className="text-lg font-semibold text-red-600 dark:text-red-400">
        Something went wrong
      </p>
      <p className="mt-1 text-sm text-red-500 dark:text-red-300">
        {errorMessage || "Something went wrong. Please try again later."}
      </p>
    </div>
  );
};
export default Loader;
