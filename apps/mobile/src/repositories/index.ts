import * as demoRepo from "./demoRepo";
import * as apiRepo from "./apiRepo";
import * as demoChatRepo from "./demoChatRepo";
import * as demoGroupRepo from "./demoGroupRepo";

// ✅ Toggle all EVENT actions (list/create/join/leave/checkin/checkout) to API
// Chat + Group stay demo for now.
const USE_API_EVENTS = true;

export type { Event, EventTag } from "./types";
export type { Message } from "./demoChatRepo";

// ✅ If API is on, use apiRepo entirely for events.
// Otherwise, use demoRepo.
export const repo = (USE_API_EVENTS ? apiRepo : demoRepo) as typeof apiRepo;

// ✅ chat stays demo for now
export const chatRepo = demoChatRepo;

// ✅ group stays demo for now (so GroupScreen works)
export const groupRepo = demoGroupRepo;