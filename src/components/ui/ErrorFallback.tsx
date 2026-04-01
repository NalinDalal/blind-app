import type { FC } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface LoaderProps {
  errorMessage?: string;
}

const ErrorFallback: FC<LoaderProps> = ({ errorMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 mx-4 my-8 rounded-2xl bg-surface border border-subtle">
      <div className="w-12 h-12 rounded-xl bg-[rgb(var(--destructive))]/10 flex items-center justify-center mb-4">
        <AlertTriangle size={24} className="text-[rgb(var(--destructive))]" />
      </div>
      <p className="text-base font-semibold text-foreground mb-1">
        Something went wrong
      </p>
      <p className="text-sm text-muted text-center max-w-xs">
        {errorMessage || "Something went wrong. Please try again later."}
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-elevated text-foreground font-medium text-sm hover:bg-border transition-colors"
      >
        <RefreshCw size={16} />
        Retry
      </button>
    </div>
  );
};
export default ErrorFallback;
