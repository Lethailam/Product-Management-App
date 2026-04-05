import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { File } from 'expo-file-system';

export async function pickImageAsBase64() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error('Bạn cần cấp quyền truy cập thư viện ảnh');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.7,
  });

  if (result.canceled) {
    return null;
  }

  const pickedUri = result.assets[0].uri;

  const manipulated = await manipulateAsync(
    pickedUri,
    [{ resize: { width: 400 } }],
    {
      compress: 0.5,
      format: SaveFormat.JPEG,
    }
  );

  const file = new File(manipulated.uri);
  const base64 = await file.base64();

  const dataUri = `data:image/jpeg;base64,${base64}`;

  if (dataUri.length > 700000) {
    throw new Error('Ảnh quá lớn. Hãy chọn ảnh nhỏ hơn.');
  }

  return dataUri;
}