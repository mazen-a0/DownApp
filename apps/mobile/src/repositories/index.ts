import * as demoRepo from "./demoRepo";
import * as apiRepo from "./apiRepo";
import * as demoChatRepo from "./demoChatRepo";
import * as demoGroupRepo from "./demoGroupRepo";

// Toggle ONLY events list to API (safe)
// Everything else stays demo for now.
const USE_API_EVENTS = true;

export type { Event, EventTag } from "./types";
export type { Message } from "./demoChatRepo";

// ✅ repo keeps demo functions, but listEvents can come from API
export const repo = {
  ...demoRepo,
  ...(USE_API_EVENTS ? { listEvents: apiRepo.listEvents } : {}),
};

// ✅ chat stays demo for now
export const chatRepo = {
  ...demoChatRepo,
};

// ✅ re-export groupRepo so GroupScreen works again
export const groupRepo = {
  ...demoGroupRepo,
};