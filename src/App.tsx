import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const OnboardingPage = lazy(
  () => import("./features/onboarding/OnboardingPage"),
);
const WorkspacesPage = lazy(() => import("./features/library/WorkspacesPage"));
const WorkspacePage = lazy(() => import("./features/library/WorkspacePage"));
const LibraryPage = lazy(() => import("./features/library/LibraryPage"));
const PaperPage = lazy(() => import("./features/library/PaperPage"));
const AnalysisPage = lazy(() => import("./features/analysis/AnalysisPage"));
const NotesPage = lazy(() => import("./features/notes/NotesPage"));
const ComparePage = lazy(() => import("./features/comparison/ComparePage"));
const ConceptsPage = lazy(() => import("./features/graph/ConceptsPage"));
const AssistantPage = lazy(() => import("./features/assistant/AssistantPage"));
const ActivityPage = lazy(() => import("./features/library/ActivityPage"));
const SettingsPage = lazy(() => import("./features/settings/SettingsPage"));
const NotFoundPage = lazy(() => import("./app/NotFoundPage"));

function AppSpinner() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      Loading...
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<AppSpinner />}>
      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/workspaces" element={<WorkspacesPage />} />
        <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />
        <Route
          path="/workspace/:workspaceId/library"
          element={<LibraryPage />}
        />
        <Route
          path="/workspace/:workspaceId/paper/:paperId"
          element={<PaperPage />}
        />
        <Route
          path="/workspace/:workspaceId/paper/:paperId/analysis"
          element={<AnalysisPage />}
        />
        <Route
          path="/workspace/:workspaceId/paper/:paperId/notes"
          element={<NotesPage />}
        />
        <Route
          path="/workspace/:workspaceId/compare"
          element={<ComparePage />}
        />
        <Route
          path="/workspace/:workspaceId/concepts"
          element={<ConceptsPage />}
        />
        <Route
          path="/workspace/:workspaceId/assistant"
          element={<AssistantPage />}
        />
        <Route
          path="/workspace/:workspaceId/activity"
          element={<ActivityPage />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/ai" element={<SettingsPage />} />
        <Route path="/settings/storage" element={<SettingsPage />} />
        <Route path="/settings/privacy" element={<SettingsPage />} />
        <Route path="/settings/appearance" element={<SettingsPage />} />
        <Route path="/help" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
