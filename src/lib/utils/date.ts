export const getDuration = (
  startTime: Date | string,
  endTime: Date | string
) => {
  // Handle both Date objects and time strings
  let startDate: Date;
  let endDate: Date;

  if (typeof startTime === "string" && typeof endTime === "string") {
    // Legacy support for time strings (e.g., "14:30")
    startDate = new Date(`01/01/2000 ${startTime}`);
    endDate = new Date(`01/01/2000 ${endTime}`);
  } else {
    // Handle Date objects
    startDate = new Date(startTime);
    endDate = new Date(endTime);
  }

  const diff = endDate.getTime() - startDate.getTime();

  // Handle negative duration (shouldn't happen with proper validation)
  if (diff < 0) {
    return "Invalid duration";
  }

  // Convert milliseconds to days, hours, and minutes
  const totalMinutes = Math.floor(diff / (1000 * 60));
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  // Build duration string based on components
  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  // Handle edge case where duration is 0
  if (parts.length === 0) {
    return "0m";
  }

  // For multi-day events, show more readable format
  if (days > 0) {
    if (days === 1 && hours === 0 && minutes === 0) {
      return "1 day";
    }
    if (days === 1) {
      return `1 day ${hours > 0 ? hours + "h" : ""} ${
        minutes > 0 ? minutes + "m" : ""
      }`.trim();
    }
    if (hours === 0 && minutes === 0) {
      return `${days} days`;
    }
    return `${days} days ${hours > 0 ? hours + "h" : ""} ${
      minutes > 0 ? minutes + "m" : ""
    }`.trim();
  }

  return parts.join(" ");
};

export const getFormattedDate = (date: Date | string) => {
  if (typeof date === "string") date = new Date(date);

  return date.toLocaleDateString("en-UK", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const getFormattedDateWithDay = (date: Date | string) => {
  if (typeof date === "string") date = new Date(date);

  return date.toLocaleDateString("en-UK", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const getFormattedTime = (date: Date | string) => {
  if (typeof date === "string") date = new Date(date);
  return date.toLocaleTimeString("en-UK", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isoDateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d*)?$/;

function isIsoDateString(value: any): boolean {
  return value && typeof value === "string" && isoDateFormat.test(value);
}

export function handleDates(body: any) {
  if (body === null || body === undefined || typeof body !== "object")
    return body;

  for (const key of Object.keys(body)) {
    const value = body[key];

    if (isIsoDateString(value)) {
      body[key] = new Date(value);
    } else if (typeof value === "object") handleDates(value);
  }
}
