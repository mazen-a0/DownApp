import AsyncStorage from "@react-native-async-storage/async-storage";

const DEVICE_ID_KEY = "deviceId"; // IMPORTANT: not in KEYS, so clearSession won't delete it

function makeId() {
  return "dev-" + Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const created = makeId();
  await AsyncStorage.setItem(DEVICE_ID_KEY, created);
  return created;
}