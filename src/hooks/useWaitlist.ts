"use client";

import { useState, useEffect, useCallback } from "react";
import {
  joinWaitlist as joinWaitlistRequest,
  leaveWaitlist as leaveWaitlistRequest,
  loadWaitlist as loadWaitlistRequest,
} from "@/lib/requests/waitlist";
import { WaitlistEntry } from "@/lib/models/Position";

export function useWaitlist(positionId: string, shouldLoad: boolean = true) {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[] | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadWaitlist = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const waitlistEntries = await loadWaitlistRequest(positionId);
      setWaitlist(waitlistEntries);
    } finally {
      setIsLoading(false);
    }
  }, [positionId]);

  const joinWaitlist = async () => {
    setIsLoading(true);
    try {
      await joinWaitlistRequest(positionId);
      await loadWaitlist();
    } finally {
      setIsLoading(false);
    }
  };

  const leaveWaitlist = async () => {
    setIsLoading(true);
    try {
      await leaveWaitlistRequest(positionId);
      await loadWaitlist();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (shouldLoad) {
      loadWaitlist();
    }
  }, [loadWaitlist, shouldLoad]);

  return {
    waitlist,
    isLoading,
    loadWaitlist,
    joinWaitlist,
    leaveWaitlist,
  };
}
