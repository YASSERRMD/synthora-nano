import "./LoadingState.css";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-state__spinner" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            strokeDasharray="31.42"
            strokeDashoffset="10"
          />
        </svg>
      </div>
      <p className="loading-state__message">{message}</p>
    </div>
  );
}
