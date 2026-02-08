import * as apiRepo from "./apiRepo";
import * as demoChatRepo from "./demoChatRepo";
import * as apiChatRepo from "./apiChatRepo";

// ✅ Groups should be API (no demo)
import {
  createGroup as apiCreateGroup,
  joinGroupByInviteCode as apiJoinGroupByInviteCode,
  fetchGroup as apiFetchGroup,
  updateGroupName as apiUpdateGroupName,
  type GroupDto,
} from "../api/groupsApi";

const USE_API_EVENTS = true;
const USE_API_GROUPS = true;
const USE_API_CHAT = true; // ✅ turn ON

export type { Event, EventTag, Message } from "./types";

// ✅ Events repo
export const repo = (USE_API_EVENTS ? apiRepo : apiRepo) as typeof apiRepo;

// ✅ Groups repo
export const groupRepo = USE_API_GROUPS
  ? {
      async createGroup(name: string) {
        const g = await apiCreateGroup({ name });
        return g as GroupDto;
      },

      async joinGroupByCode(inviteCode: string) {
        const g = await apiJoinGroupByInviteCode({ inviteCode });
        return g as GroupDto;
      },

      async fetchGroup(groupId: string) {
        return await apiFetchGroup(groupId);
      },

      async updateGroupName(groupId: string, name: string) {
        return await apiUpdateGroupName(groupId, name);
      },
    }
  : {
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
export const chatRepo = USE_API_CHAT ? apiChatRepo : demoChatRepo;