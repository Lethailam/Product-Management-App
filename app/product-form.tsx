import React, { useMemo, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  addProduct,
  checkProductIdExists,
  updateProduct,
} from '../src/services/productService';
import { pickImageAsBase64 } from '../src/utilts/imageUtils';

type ProductType = {
  docId: string;
  idsanpham: string;
  tensp: string;
  loaisp: string;
  gia: number;
  hinhanh: string;
  description?: string;
};

export default function ProductFormScreen() {
  const params = useLocalSearchParams();

  const product = useMemo<ProductType | null>(() => {
    if (typeof params.product !== 'string') return null;

    try {
      return JSON.parse(params.product) as ProductType;
    } catch {
      return null;
    }
  }, [params.product]);

  const [idsanpham, setIdsanpham] = useState(product?.idsanpham || '');
  const [tensp, setTensp] = useState(product?.tensp || '');
  const [loaisp, setLoaisp] = useState(product?.loaisp || '');
  const [gia, setGia] = useState(product?.gia ? String(product.gia) : '');
  const [hinhanh, setHinhanh] = useState(product?.hinhanh || '');
  const [description, setDescription] = useState(product?.description || '');

  const handlePickImage = async () => {
    try {
      const imageData = await pickImageAsBase64();
      if (imageData) setHinhanh(imageData);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Không thể chọn ảnh';
      Alert.alert('Lỗi ảnh', message);
    }
  };

  const handleSave = async () => {
    if (!idsanpham.trim() || !tensp.trim() || !loaisp.trim() || !gia.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (isNaN(Number(gia))) {
      Alert.alert('Lỗi', 'Giá phải là số');
      return;
    }

    try {
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
        description: description.trim(),
      };

      if (product?.docId) {
        await updateProduct(product.docId, productData);
        Alert.alert('Thành công', 'Cập nhật sản phẩm thành công');
      } else {
        await addProduct(productData);
        Alert.alert('Thành công', 'Thêm sản phẩm thành công');
      }

      router.back();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Không thể lưu sản phẩm';
      Alert.alert('Lỗi', message);
    }
  };

  return (
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

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Mô tả sản phẩm"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
        <Text>Chọn ảnh</Text>
      </TouchableOpacity>

      {!!hinhanh && <Image source={{ uri: hinhanh }} style={styles.preview} />}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>
          {product ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
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
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  textArea: {
    height: 110,
    textAlignVertical: 'top',
  },
  imageButton: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  preview: {
    width: 180,
    height: 180,
    borderRadius: 10,
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
    fontWeight: 'bold',
  },
});