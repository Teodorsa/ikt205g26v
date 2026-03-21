import { File } from "expo-file-system";
import { Alert } from "react-native";
import { supabase } from "./supabase";

export const ValidateImage = (asset: any) => {
    const maxBytes = 15 * 1024 * 1024; // 15MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (asset.fileSize > maxBytes) {
      return "Image size exceeds 15MB limit";
    }

    if (!allowedTypes.includes(asset.mimeType)) {
      return "Unsupported image format. Please select a JPEG, PNG, or WebP.";
    }

    return null;
}

export const UploadImage = async (asset: any, userId: string) => {
  if (!asset.uri) {
    throw new Error("No image selected")
  }

  const fileName = `${userId}/${Date.now()}_${asset.fileName}`;

  const file = new File(asset.uri);
  const arrayBuffer = await file.arrayBuffer();

  const { data, error } = await supabase.storage.from("Images").upload(fileName, arrayBuffer);

  if (error) {
    Alert.alert("Image could not be uploaded, please try again");
    throw error;
  }

  return data.path;
}

export const GetImageUrl = (path: string) => {
  return supabase.storage.from("Images").getPublicUrl(path).data.publicUrl;
}