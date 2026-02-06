"use client";

import { useEffect, useRef, useCallback } from "react";
import type { ConsoleEntry, NetworkEntry } from "./types";

const MAX_CONSOLE_ENTRIES = 50;
const MAX_NETWORK_ENTRIES = 20;

// Global storage for diagnostics (persists across re-renders)
let consoleLogs: ConsoleEntry[] = [];
let networkErrors: NetworkEntry[] = [];
let isInitialized = false;

function initDiagnostics() {
  if (isInitialized || typeof window === "undefined") return;
  isInitialized = true;

  // Debug: Log initialization
  console.log("[Diagnostics] Initializing console/network capture...");

  // Capture console logs
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
  };

  const captureConsole = (level: ConsoleEntry["level"]) => {
    return (...args: unknown[]) => {
      // Call original
      originalConsole[level](...args);

      // Store entry
      const message = args
        .map((arg) => {
          if (typeof arg === "string") return arg;
          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        })
        .join(" ");

      consoleLogs.push({
        level,
        message: message.slice(0, 500), // Limit message length
        timestamp: new Date().toISOString(),
      });

      // Keep only recent entries
      if (consoleLogs.length > MAX_CONSOLE_ENTRIES) {
        consoleLogs = consoleLogs.slice(-MAX_CONSOLE_ENTRIES);
      }
    };
  };

  console.log = captureConsole("log");
  console.warn = captureConsole("warn");
  console.error = captureConsole("error");
  console.info = captureConsole("info");

  console.log("[Diagnostics] Console capture ready");

  // Capture failed network requests by intercepting fetch
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const startTime = Date.now();
    const url = typeof args[0] === "string" ? args[0] : args[0] instanceof Request ? args[0].url : String(args[0]);
    const method = (typeof args[1]?.method === "string" ? args[1].method : "GET").toUpperCase();

    try {
      const response = await originalFetch(...args);
      const duration = Date.now() - startTime;

      // Only capture errors (4xx, 5xx)
      if (!response.ok) {
        networkErrors.push({
          method,
          url: url.slice(0, 200),
          status: response.status,
          statusText: response.statusText,
          duration,
          timestamp: new Date().toISOString(),
        });

        if (networkErrors.length > MAX_NETWORK_ENTRIES) {
          networkErrors = networkErrors.slice(-MAX_NETWORK_ENTRIES);
        }
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      networkErrors.push({
        method,
        url: url.slice(0, 200),
        status: 0,
        statusText: error instanceof Error ? error.message : "Network Error",
        duration,
        timestamp: new Date().toISOString(),
      });

      if (networkErrors.length > MAX_NETWORK_ENTRIES) {
        networkErrors = networkErrors.slice(-MAX_NETWORK_ENTRIES);
      }

      throw error;
    }
  };
}

export function useDiagnostics() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initDiagnostics();
    }
  }, []);

  const getDiagnostics = useCallback(() => {
    return {
      consoleLogs: [...consoleLogs],
      networkErrors: [...networkErrors],
    };
  }, []);

  const clearDiagnostics = useCallback(() => {
    consoleLogs = [];
    networkErrors = [];
  }, []);

  return { getDiagnostics, clearDiagnostics };
}
