import { api } from "./client";

export type GroupDto = {
  groupId: string;
  name: string;
  inviteCode: string;
  memberIds?: string[];
};

export async function createGroup(input: { name: string }): Promise<GroupDto> {
  const res = await api.post("/groups", input);
  return res.data as GroupDto;
}

export async function joinGroupByInviteCode(input: { inviteCode: string }): Promise<GroupDto> {
  const res = await api.post("/groups/join", input);
  return res.data as GroupDto;
}

export async function fetchGroup(groupId: string): Promise<GroupDto> {
  const res = await api.get(`/groups/${groupId}`);
  return res.data as GroupDto;
}

export async function updateGroupName(groupId: string, name: string): Promise<GroupDto> {
  const res = await api.patch(`/groups/${groupId}`, { name });
  return res.data as GroupDto;
}