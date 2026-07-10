import { Button } from "../../components/Button";
import "./OnboardingPage.css";

export default function OnboardingPage() {
  return (
    <div className="onboarding">
      <div className="onboarding__content">
        <div className="onboarding__logo">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            width="48"
            height="48"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 className="onboarding__title">Synthora Nano</h1>
        <p className="onboarding__tagline">
          Private research synthesis, directly in your browser.
        </p>
        <div className="onboarding__features">
          <div className="onboarding__feature">
            <div className="onboarding__feature-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3>Privacy First</h3>
            <p>
              Your research stays on your device. No cloud uploads, no accounts
              required.
            </p>
          </div>
          <div className="onboarding__feature">
            <div className="onboarding__feature-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>AI-Powered Analysis</h3>
            <p>
              Extract insights from papers using Chrome's built-in Gemini Nano
              capabilities.
            </p>
          </div>
          <div className="onboarding__feature">
            <div className="onboarding__feature-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h3>Research Organization</h3>
            <p>
              Organize papers, take notes, compare findings, and build knowledge
              connections.
            </p>
          </div>
        </div>
        <div className="onboarding__actions">
          <Button size="lg">Get Started</Button>
          <Button variant="secondary" size="lg">
            I have a workspace
          </Button>
        </div>
      </div>
    </div>
  );
}
