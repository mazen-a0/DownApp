import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

function getExtFromUri(uri: string) {
  const m = uri.match(/\.(\w+)(\?.*)?$/);
  return m?.[1]?.toLowerCase() ?? "jpg";
}

function getBaseDir(): string | null {
  // Some installs have broken TS types; runtime still has these.
  const fs: any = FileSystem as any;
  return fs.documentDirectory ?? fs.cacheDirectory ?? null;
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

  const asset = result.assets[0];

  const baseDir = getBaseDir();
  if (!baseDir) throw new Error("No writable directory available on this device.");

  const folder = baseDir + "images/";
  const info = await (FileSystem as any).getInfoAsync(folder);
  if (!info.exists) {
    await (FileSystem as any).makeDirectoryAsync(folder, { intermediates: true });
  }

  const ext = getExtFromUri(asset.uri);
  const dest = folder + `${prefix}-${Date.now()}.${ext}`;

  await (FileSystem as any).copyAsync({ from: asset.uri, to: dest });
  return dest;
}