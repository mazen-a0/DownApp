import { demoUsers } from "../data/demoUsers";

export function nameForUserId(userId: string) {
  return demoUsers[userId]?.name || userId;
}