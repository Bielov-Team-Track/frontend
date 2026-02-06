import type { FeedbackSubmission } from "@/components/features/feedback/types";

export interface FeedbackResponse {
  success: boolean;
  issueUrl?: string;
  error?: string;
}

export async function submitFeedback(submission: FeedbackSubmission): Promise<FeedbackResponse> {
  console.log("[Feedback] Submitting:", {
    category: submission.category,
    title: submission.title,
    hasScreenshot: !!submission.screenshot,
    screenshotLength: submission.screenshot?.length || 0,
    consoleLogs: submission.metadata.consoleLogs?.length || 0,
    networkErrors: submission.metadata.networkErrors?.length || 0,
  });

  const response = await fetch("/api/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to submit feedback" }));
    return { success: false, error: error.error || "Failed to submit feedback" };
  }

  return response.json();
}
