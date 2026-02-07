export type Group = {
  groupId: string;
  name: string;
  inviteCode: string;
};

let GROUPS: Group[] = [
  { groupId: "g1", name: "McGill Squad", inviteCode: "BOUTH3" },
];

function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function createGroup(name: string): Promise<Group> {
  const group: Group = {
    groupId: "g" + Math.floor(Math.random() * 1000000),
    name,
    inviteCode: makeCode(),
  };
  GROUPS = [group, ...GROUPS];
  return group;
}

export async function joinGroupByCode(inviteCode: string): Promise<Group | null> {
  const found = GROUPS.find((g) => g.inviteCode.toUpperCase() === inviteCode.toUpperCase());
  return found || null;
}