
export type ProjectStatus = "New" | "Reviewing" | "Completed";

export interface ProjectSubmission {
  id: string;
  name: string;
  email: string;
  company: string;
  service: string;
  description: string;
  audience: string;
  budget: string;
  timeframe: string;
  additional: string;
  brief: string;
  status: ProjectStatus;
  createdAt: string;
}

const STORAGE_KEY = "onboardflow_submissions";

export function getSubmissions(): ProjectSubmission[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is ProjectSubmission =>
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.email === "string" &&
        typeof item.brief === "string"
    );
  } catch {
    return [];
  }
}

function writeSubmissions(items: ProjectSubmission[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function saveSubmission(
  submission: ProjectSubmission
): void {
  const current = getSubmissions();
  writeSubmissions([submission, ...current]);
}

export function updateSubmissionStatus(
  id: string,
  status: ProjectStatus
): void {
  const updated = getSubmissions().map((item) =>
    item.id === id ? { ...item, status } : item
  );

  writeSubmissions(updated);
}

export function deleteSubmission(id: string): void {
  writeSubmissions(
    getSubmissions().filter((item) => item.id !== id)
  );
}

export function clearSubmissions(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
