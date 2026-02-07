import * as demo from "./demoRepo";
import * as groups from "./demoGroupRepo";
import * as chat from "./demoChatRepo";
// Later: import * as api from "./apiRepo";

export const USE_DEMO = true;

export const repo = demo; // later: switch to api
export const groupRepo = groups; // later: switch to api groups
export const chatRepo = chat; // later: switch to api chat

export * from "./types";
export * from "./demoGroupRepo";
export * from "./demoChatRepo";