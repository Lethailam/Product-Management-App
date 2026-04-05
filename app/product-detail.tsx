import React, { useMemo } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { deleteProductById } from '../src/services/productService';
import { formatVND } from '../src/utilts/formatCurrency';

type ProductDetailType = {
  docId: string;
  idsanpham: string;
  tensp: string;
  loaisp: string;
  gia: number;
  hinhanh: string;
  description?: string;
};

export default function ProductDetailScreen() {
  const params = useLocalSearchParams();
  const product = useMemo<ProductDetailType | null>(() => {
    if (!params.product || typeof params.product !== 'string') return null;
    return JSON.parse(params.product);
  }, [params.product]);

  const handleDelete = () => {
    if (!product?.docId) return;

    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa sản phẩm này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProductById(product.docId);
            Alert.alert('Thành công', 'Đã xóa sản phẩm');
            router.replace('/products');
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Không thể xóa sản phẩm';
            Alert.alert('Lỗi', message);
          }
        },
      },
    ]);
  };

  if (!product) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text>Không tìm thấy sản phẩm</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()}>
              <Feather name="chevron-left" size={26} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/product-form',
                  params: { product: JSON.stringify(product) },
                })
              }
            >
              <Feather name="edit-2" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <Image
            source={{
              uri:
                product.hinhanh ||
                'https://via.placeholder.com/500x500.png?text=No+Image',
            }}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.content}>
          <View style={styles.infoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.brand}>{product.tensp}</Text>
              <Text style={styles.productTitle}>Mã: {product.idsanpham}</Text>
              <Text style={styles.productTitle}>Loại: {product.loaisp}</Text>
            </View>
            <Text style={styles.price}>{formatVND(product.gia)}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>
            {product.description?.trim()
              ? product.description
              : 'Chưa có mô tả cho sản phẩm này.'}
          </Text>

          <View style={styles.adminButtonRow}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                router.push({
                  pathname: '/product-form',
                  params: { product: JSON.stringify(product) },
                })
              }
            >
              <Feather name="edit-2" size={18} color="#fff" />
              <Text style={styles.editButtonText}>Sửa sản phẩm</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Feather name="trash-2" size={18} color="#D11A2A" />
              <Text style={styles.deleteButtonText}>Xóa sản phẩm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    backgroundColor: '#000',
    height: 300,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: 230,
    marginTop: 10,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
  },
  productTitle: {
    marginTop: 4,
    fontSize: 15,
    color: '#444',
    fontWeight: '500',
  },
  price: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
  },
  divider: {
    height: 1,
    backgroundColor: '#E6E6E6',
    marginVertical: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 10,
  },
  description: {
    color: '#4D4D4D',
    fontSize: 14,
    lineHeight: 22,
  },
  adminButtonRow: {
    marginTop: 28,
    gap: 12,
  },
  editButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  deleteButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FFD5D9',
  },
  deleteButtonText: {
    color: '#D11A2A',
    fontSize: 15,
    fontWeight: '800',
  },
});