import AsyncStorage from "@react-native-async-storage/async-storage";

const DEVICE_ID_KEY = "down_device_id";

function makeId() {
  // plenty unique for hackathon use
  return "dev-" + Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const created = makeId();
  await AsyncStorage.setItem(DEVICE_ID_KEY, created);
  return created;
}

// Optional: only if you ever want a "fresh user" on the same phone
export async function resetDeviceId(): Promise<void> {
  await AsyncStorage.removeItem(DEVICE_ID_KEY);
}