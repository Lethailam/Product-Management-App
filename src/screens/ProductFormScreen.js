import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {
  addProduct,
  checkProductIdExists,
  updateProduct,
} from '../services/productService';
import { pickImageAsBase64 } from '../utilts/imageUtils';

export default function ProductFormScreen({ navigation, route }) {
  const product = route.params?.product;

  const [idsanpham, setIdsanpham] = useState(product?.idsanpham || '');
  const [tensp, setTensp] = useState(product?.tensp || '');
  const [loaisp, setLoaisp] = useState(product?.loaisp || '');
  const [gia, setGia] = useState(product?.gia ? String(product.gia) : '');
  const [hinhanh, setHinhanh] = useState(product?.hinhanh || '');
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      setImageLoading(true);
      const dataUri = await pickImageAsBase64();
      if (dataUri) {
        setHinhanh(dataUri);
      }
    } catch (error) {
      Alert.alert('Lỗi ảnh', error.message);
    } finally {
      setImageLoading(false);
    }
  };

  const validateForm = () => {
    if (!idsanpham.trim() || !tensp.trim() || !loaisp.trim() || !gia.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return false;
    }

    if (isNaN(Number(gia))) {
      Alert.alert('Lỗi', 'Giá phải là số');
      return false;
    }

    if (Number(gia) < 0) {
      Alert.alert('Lỗi', 'Giá phải lớn hơn hoặc bằng 0');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (!product) {
        const existed = await checkProductIdExists(idsanpham.trim());
        if (existed) {
          Alert.alert('Lỗi', 'Mã sản phẩm đã tồn tại');
          return;
        }
      }

      const productData = {
        idsanpham: idsanpham.trim(),
        tensp: tensp.trim(),
        loaisp: loaisp.trim(),
        gia: Number(gia),
        hinhanh: hinhanh || '',
      };

      if (product?.docId) {
        await updateProduct(product.docId, productData);
        Alert.alert('Thành công', 'Cập nhật sản phẩm thành công');
      } else {
        await addProduct(productData);
        Alert.alert('Thành công', 'Thêm sản phẩm thành công');
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Mã sản phẩm"
          value={idsanpham}
          onChangeText={setIdsanpham}
          editable={!product}
        />

        <TextInput
          style={styles.input}
          placeholder="Tên sản phẩm"
          value={tensp}
          onChangeText={setTensp}
        />

        <TextInput
          style={styles.input}
          placeholder="Loại sản phẩm"
          value={loaisp}
          onChangeText={setLoaisp}
        />

        <TextInput
          style={styles.input}
          placeholder="Giá"
          value={gia}
          onChangeText={setGia}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
          {imageLoading ? (
            <ActivityIndicator color="#333" />
          ) : (
            <Text style={styles.imageButtonText}>Chọn ảnh</Text>
          )}
        </TouchableOpacity>

        {!!hinhanh && (
          <Image source={{ uri: hinhanh }} style={styles.preview} />
        )}

        <TouchableOpacity
          style={[styles.saveButton, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>
              {product ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d8d8d8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  imageButton: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  imageButtonText: {
    fontWeight: '600',
  },
  preview: {
    width: 180,
    height: 180,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 18,
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
  },
});