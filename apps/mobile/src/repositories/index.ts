import * as apiRepo from "./apiRepo";

// ⚠️ Temporary: keep demo chat until backend endpoints exist
import * as demoChatRepo from "./demoChatRepo";

// ✅ Groups should be API (no demo)
import {
  createGroup as apiCreateGroup,
  joinGroupByInviteCode as apiJoinGroupByInviteCode,
  fetchGroup as apiFetchGroup,
  updateGroupName as apiUpdateGroupName,
  type GroupDto,
} from "../api/groupsApi";

/**
 * Toggle flags
 * - Events: already working on API
 * - Groups: move to API now (recommended)
 * - Chat: only flip to API once backend has chat endpoints
 */
const USE_API_EVENTS = true;
const USE_API_GROUPS = true;
const USE_API_CHAT = false; // flip to true once you have chat API endpoints

export type { Event, EventTag } from "./types";

// ✅ IMPORTANT: Stop exporting Message type from demo repo long-term.
// For now we keep it so the app compiles.
// Once chat API exists, move Message into ./types or an api/messagesApi.ts type.
export type { Message } from "./demoChatRepo";

// ✅ Events repo
export const repo = (USE_API_EVENTS ? apiRepo : apiRepo) as typeof apiRepo; // no demo fallback now

// ✅ Groups repo (API wrapper that matches the old demoGroupRepo interface)
export const groupRepo = USE_API_GROUPS
  ? {
      // Old call: groupRepo.createGroup(name)
      async createGroup(name: string) {
        const g = await apiCreateGroup({ name });
        return g as GroupDto;
      },

      // Old call: groupRepo.joinGroupByCode(code)
      async joinGroupByCode(inviteCode: string) {
        const g = await apiJoinGroupByInviteCode({ inviteCode });
        return g as GroupDto;
      },

      // Extra helpers (useful for GroupProfile + switching UI)
      async fetchGroup(groupId: string) {
        return await apiFetchGroup(groupId);
      },

      async updateGroupName(groupId: string, name: string) {
        return await apiUpdateGroupName(groupId, name);
      },
    }
  : {
      // If someone tries to use demo groups by accident, fail loudly
      async createGroup() {
        throw new Error("Groups are API-only now.");
      },
      async joinGroupByCode() {
        throw new Error("Groups are API-only now.");
      },
      async fetchGroup() {
        throw new Error("Groups are API-only now.");
      },
      async updateGroupName() {
        throw new Error("Groups are API-only now.");
      },
    };

// ✅ Chat repo
// Right now: demo, so the app keeps working.
// Later: swap to apiChatRepo when your backend has endpoints.
export const chatRepo = USE_API_CHAT
  ? (() => {
      throw new Error(
        "Chat API not wired yet. Create apiChatRepo + endpoints, then flip USE_API_CHAT=true."
      );
    })()
  : demoChatRepo;