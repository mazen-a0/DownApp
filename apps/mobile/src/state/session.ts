import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  userId: "userId",
  name: "name",
  groupId: "groupId",
  groupName: "groupName",
  inviteCode: "inviteCode",
  pushToken: "pushToken",
  userPhotoUri: "userPhotoUri",
  groupPhotoUri: "groupPhotoUri",
} as const;

export type Session = {
  userId: string | null;
  name: string | null;
  groupId: string | null;
  groupName: string | null;
  inviteCode: string | null;
  pushToken: string | null;
  userPhotoUri: string | null;
  groupPhotoUri: string | null;
};

export async function loadSession(): Promise<Session> {
  const [
    userId,
    name,
    groupId,
    groupName,
    inviteCode,
    pushToken,
    userPhotoUri,
    groupPhotoUri,
  ] = await Promise.all([
    AsyncStorage.getItem(KEYS.userId),
    AsyncStorage.getItem(KEYS.name),
    AsyncStorage.getItem(KEYS.groupId),
    AsyncStorage.getItem(KEYS.groupName),
    AsyncStorage.getItem(KEYS.inviteCode),
    AsyncStorage.getItem(KEYS.pushToken),
    AsyncStorage.getItem(KEYS.userPhotoUri),
    AsyncStorage.getItem(KEYS.groupPhotoUri),
  ]);

  return { userId, name, groupId, groupName, inviteCode, pushToken, userPhotoUri, groupPhotoUri };
}

export async function saveSession(partial: Partial<Session>) {
  const entries: Array<[string, string]> = [];

  if (partial.userId !== undefined && partial.userId !== null)
    entries.push([KEYS.userId, partial.userId]);

  if (partial.name !== undefined && partial.name !== null)
    entries.push([KEYS.name, partial.name]);

  if (partial.groupId !== undefined && partial.groupId !== null)
    entries.push([KEYS.groupId, partial.groupId]);

  if (partial.groupName !== undefined && partial.groupName !== null)
    entries.push([KEYS.groupName, partial.groupName]);

  if (partial.inviteCode !== undefined && partial.inviteCode !== null)
    entries.push([KEYS.inviteCode, partial.inviteCode]);

  if (partial.pushToken !== undefined && partial.pushToken !== null)
    entries.push([KEYS.pushToken, partial.pushToken]);

  if (partial.userPhotoUri !== undefined && partial.userPhotoUri !== null)
    entries.push([KEYS.userPhotoUri, partial.userPhotoUri]);

  if (partial.groupPhotoUri !== undefined && partial.groupPhotoUri !== null)
    entries.push([KEYS.groupPhotoUri, partial.groupPhotoUri]);

  if (entries.length > 0) await AsyncStorage.multiSet(entries);
}

export async function clearSession() {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}