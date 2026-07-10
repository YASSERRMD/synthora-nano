import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { workspaceRepository } from "../../db/repositories";
import type { Workspace } from "../../db/schemas";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { Dialog } from "../../components/Dialog";
import "./WorkspacesPage.css";

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const navigate = useNavigate();

  const loadWorkspaces = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await workspaceRepository.getAll();
      setWorkspaces(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load workspaces",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  const handleCreate = async () => {
    if (!newName.trim()) return;

    try {
      const workspace = await workspaceRepository.create({
        name: newName.trim(),
        description: newDescription.trim() || undefined,
      });
      setNewName("");
      setNewDescription("");
      setIsCreateOpen(false);
      navigate(`/workspace/${workspace.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create workspace",
      );
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Delete "${name}"? This will remove all papers, notes, and analyses.`,
      )
    ) {
      return;
    }

    try {
      await workspaceRepository.delete(id);
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete workspace",
      );
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading workspaces..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadWorkspaces} />;
  }

  return (
    <div className="workspaces-page">
      <div className="workspaces-page__header">
        <h1>Workspaces</h1>
        <Button onClick={() => setIsCreateOpen(true)}>New Workspace</Button>
      </div>

      {workspaces.length === 0 ? (
        <EmptyState
          title="No workspaces yet"
          description="Create a workspace to start organizing your research papers."
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              Create Workspace
            </Button>
          }
        />
      ) : (
        <div className="workspaces-page__grid">
          {workspaces.map((workspace) => (
            <div key={workspace.id} className="workspace-card">
              <div
                className="workspace-card__content"
                onClick={() => navigate(`/workspace/${workspace.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/workspace/${workspace.id}`);
                  }
                }}
              >
                <h3 className="workspace-card__name">{workspace.name}</h3>
                {workspace.description && (
                  <p className="workspace-card__description">
                    {workspace.description}
                  </p>
                )}
                <p className="workspace-card__date">
                  Updated {new Date(workspace.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                className="workspace-card__delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(workspace.id, workspace.name);
                }}
                aria-label={`Delete ${workspace.name}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Workspace"
      >
        <div className="create-workspace-form">
          <label htmlFor="workspace-name">Name</label>
          <input
            id="workspace-name"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="My Research Project"
            autoFocus
          />
          <label htmlFor="workspace-description">Description (optional)</label>
          <textarea
            id="workspace-description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Papers about..."
            rows={3}
          />
          <div className="create-workspace-form__actions">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              Create
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
