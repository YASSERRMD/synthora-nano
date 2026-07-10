export type {
  LibraryView,
  LibraryFilters,
  LibrarySort,
} from "./library-service";
export { libraryService } from "./library-service";

export type { BatchOperation, BatchResult } from "./batch-service";
export { batchService } from "./batch-service";

export { storageService } from "./storage-service";
export type { StorageEstimate } from "./storage-service";

export type {
  IngestionStatus,
  IngestionProgress,
  IngestionResult,
} from "../ingestion/ingestion-service";
export { ingestDocument } from "../ingestion/ingestion-service";

export { notesService } from "../notes/notes-service";

export type { ActivityItem } from "../activity/activity-service";
export { activityService } from "../activity/activity-service";
