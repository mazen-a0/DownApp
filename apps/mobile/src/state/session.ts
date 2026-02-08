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

/**
 * Save parts of session.
 * - undefined => do nothing
 * - string => set key
 * - null => remove key (IMPORTANT for switching groups cleanly)
 */
export async function saveSession(partial: Partial<Session>) {
  const toSet: Array<[string, string]> = [];
  const toRemove: string[] = [];

  const handle = (key: string, value: string | null | undefined) => {
    if (value === undefined) return;      // leave unchanged
    if (value === null) toRemove.push(key); // clear
    else toSet.push([key, value]);        // set
  };

  handle(KEYS.userId, partial.userId);
  handle(KEYS.name, partial.name);
  handle(KEYS.groupId, partial.groupId);
  handle(KEYS.groupName, partial.groupName);
  handle(KEYS.inviteCode, partial.inviteCode);
  handle(KEYS.pushToken, partial.pushToken);
  handle(KEYS.userPhotoUri, partial.userPhotoUri);
  handle(KEYS.groupPhotoUri, partial.groupPhotoUri);

  if (toSet.length) await AsyncStorage.multiSet(toSet);
  if (toRemove.length) await AsyncStorage.multiRemove(toRemove);
}

export async function clearSession() {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}