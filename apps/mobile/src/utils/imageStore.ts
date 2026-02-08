import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

function getExtFromUri(uri: string) {
  const m = uri.match(/\.(\w+)(\?.*)?$/);
  return m?.[1]?.toLowerCase() ?? "jpg";
}

export async function pickAndPersistImage(prefix: string): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) return null;

  const asset = result.assets?.[0];
  if (!asset?.uri) return null;

const baseDir = FileSystem.cacheDirectory;
if (!baseDir) {
  if (Platform.OS === "web") {
    // fallback: return original URI or upload immediately
    return asset.uri;
  }
  throw new Error("FileSystem.cacheDirectory is unavailable; rebuild app or use a fallback.");
}

  const folder = baseDir + "images/";
  const info = await FileSystem.getInfoAsync(folder);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
  }

  const ext = getExtFromUri(asset.uri);
  const dest = folder + `${prefix}-${Date.now()}.${ext}`;

  await FileSystem.copyAsync({ from: asset.uri, to: dest });
  return dest;
}