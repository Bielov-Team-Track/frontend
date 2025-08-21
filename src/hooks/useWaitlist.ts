"use client";

import { useState, useEffect } from "react";
import {
  joinWaitlist as joinWaitlistRequest,
  leaveWaitlist as leaveWaitlistRequest,
  loadWaitlist as loadWaitlistRequest,
} from "@/lib/requests/waitlist";
import { UserProfile } from "@/lib/models/User";

export function useWaitlist(positionId: string, userId: string) {
  const [waitlist, setWaitlist] = useState<UserProfile[] | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadWaitlist = async () => {
    setIsLoading(true);
    try {
      const users = await loadWaitlistRequest(positionId);
      setWaitlist(users);
    } finally {
      setIsLoading(false);
    }
  };

  const joinWaitlist = async () => {
    setIsLoading(true);
    try {
      await joinWaitlistRequest(positionId, userId);
      await loadWaitlist();
    } finally {
      setIsLoading(false);
    }
  };

  const leaveWaitlist = async () => {
    setIsLoading(true);
    try {
      await leaveWaitlistRequest(positionId, userId);
      await loadWaitlist();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWaitlist();
  }, [positionId]);

  return {
    waitlist,
    isLoading,
    loadWaitlist,
    joinWaitlist,
    leaveWaitlist,
  };
}
