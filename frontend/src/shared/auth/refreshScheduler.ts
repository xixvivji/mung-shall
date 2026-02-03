import { refreshAccessToken } from "@/shared/api/client";

const INTERVAL_MS = 25 * 60 * 1000;

type RefreshSchedulerOptions = {
  onFailure?: (error: unknown) => void;
};

export function createRefreshScheduler(options: RefreshSchedulerOptions = {}) {
  let intervalId: number | null = null;
  let enabled = false;

  const runRefresh = async () => {
    try {
      await refreshAccessToken("proactive");
    } catch (error) {
      stop();
      options.onFailure?.(error);
    }
  };

  const startInterval = () => {
    if (intervalId) return;
    intervalId = window.setInterval(() => {
      void runRefresh();
    }, INTERVAL_MS);
  };

  const stopInterval = () => {
    if (!intervalId) return;
    window.clearInterval(intervalId);
    intervalId = null;
  };

  const handleVisibility = () => {
    if (!enabled) return;
    if (document.hidden) {
      stopInterval();
      return;
    }
    void runRefresh();
    startInterval();
  };

  const start = () => {
    if (enabled) return;
    enabled = true;
    startInterval();
    document.addEventListener("visibilitychange", handleVisibility);
  };

  const stop = () => {
    enabled = false;
    stopInterval();
    document.removeEventListener("visibilitychange", handleVisibility);
  };

  const isRunning = () => enabled;

  return { start, stop, isRunning };
}
