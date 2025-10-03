import { cookies } from "next/headers";
import { EVENTS_API_V1 } from "../constants";
import { AccountBalance, AccountPayoutInfo } from "../models/Payment";

export const getAccountBalance = async (): Promise<AccountBalance | null> => {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if (!token) {
    console.log("getAccountBalance - no token found");
    return null;
  }

  const backendUrl = `${EVENTS_API_V1}/payments/account/balance`;

  const fetchOptions: RequestInit = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  };

  try {
    const response = await fetch(backendUrl, fetchOptions);

    if (response.ok) {
      const data = await response.json();
      return data;
    } else if (response.status === 401 || response.status === 403) {
      console.log("getAccountBalance - unauthorized");
      return null;
    } else {
      console.error("Error fetching account balance:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching account balance:", error);
    return null;
  }
};

export const getAccountPayoutInfo = async (): Promise<AccountPayoutInfo | null> => {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if (!token) {
    console.log("getAccountPayoutInfo - no token found");
    return null;
  }

  const backendUrl = `${EVENTS_API_V1}/payments/account/payout-info`;

  const fetchOptions: RequestInit = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  };

  try {
    const response = await fetch(backendUrl, fetchOptions);

    if (response.ok) {
      const data = await response.json();
      return data;
    } else if (response.status === 401 || response.status === 403) {
      console.log("getAccountPayoutInfo - unauthorized");
      return null;
    } else {
      console.error("Error fetching account payout info:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching account payout info:", error);
    return null;
  }
};
