import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebase';
import { getProducts, deleteProductById } from '../src/services/productService';
import { formatVND } from '../src/utilts/formatCurrency';

type ProductItem = {
  docId: string;
  idsanpham: string;
  tensp: string;
  loaisp: string;
  gia: number;
  hinhanh: string;
  description?: string;
};

const CATEGORY_OPTIONS = [
  'Tất cả',
  'Điện tử',
  'Thời trang',
  'Mô hình',
  'Phụ kiện',
  'Gia dụng',
];

const SORT_OPTIONS = [
  { label: 'Mặc định', value: 'default' },
  { label: 'Giá tăng dần', value: 'price-asc' },
  { label: 'Giá giảm dần', value: 'price-desc' },
  { label: 'Tên A-Z', value: 'name-asc' },
  { label: 'Tên Z-A', value: 'name-desc' },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export default function ProductsScreen() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [sortBy, setSortBy] = useState<SortValue>('default');
  const [menuVisible, setMenuVisible] = useState(false);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data as ProductItem[]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Không thể tải sản phẩm';
      Alert.alert('Lỗi', message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const handleDelete = (docId: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa sản phẩm này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProductById(docId);
            await loadProducts();
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Không thể xóa sản phẩm';
            Alert.alert('Lỗi', message);
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    try {
      setMenuVisible(false);
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Không thể đăng xuất';
      Alert.alert('Lỗi', message);
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    const lowerKeyword = keyword.trim().toLowerCase();

    if (lowerKeyword) {
      result = result.filter((item) =>
        item.tensp?.toLowerCase().includes(lowerKeyword)
      );
    }

    if (selectedCategory !== 'Tất cả') {
      result = result.filter(
        (item) =>
          (item.loaisp?.trim().toLowerCase() || '') ===
          selectedCategory.toLowerCase()
      );
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => Number(a.gia) - Number(b.gia));
        break;
      case 'price-desc':
        result.sort((a, b) => Number(b.gia) - Number(a.gia));
        break;
      case 'name-asc':
        result.sort((a, b) => a.tensp.localeCompare(b.tensp));
        break;
      case 'name-desc':
        result.sort((a, b) => b.tensp.localeCompare(a.tensp));
        break;
      default:
        break;
    }

    return result;
  }, [products, keyword, selectedCategory, sortBy]);

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sideMenu}>
            <Text style={styles.menuTitle}>Menu quản trị</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.replace('/products');
              }}
            >
              <MaterialIcons name="inventory-2" size={22} color="#111" />
              <Text style={styles.menuText}>Sản phẩm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push('/dashboard');
              }}
            >
              <MaterialIcons name="dashboard" size={22} color="#111" />
              <Text style={styles.menuText}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <MaterialIcons name="logout" size={22} color="#111" />
              <Text style={styles.menuText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>

          <Pressable
            style={styles.overlayArea}
            onPress={() => setMenuVisible(false)}
          />
        </View>
      </Modal>

      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setMenuVisible(true)}
        >
          <Feather name="menu" size={24} color="#111" />
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <Feather name="search" size={18} color="#999" />
          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder="Tìm sản phẩm"
            placeholderTextColor="#999"
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Quản lý sản phẩm</Text>
          <Text style={styles.subTitle}>
            {filteredAndSortedProducts.length} sản phẩm
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addTopButton}
          onPress={() => router.push('/product-form')}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Lọc theo loại</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
        contentContainerStyle={styles.categoryRow}
      >
        {CATEGORY_OPTIONS.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <TouchableOpacity
              key={category}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  isActive && styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionLabel}>Sắp xếp</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
        contentContainerStyle={styles.sortRow}
      >
        {SORT_OPTIONS.map((option) => {
          const isActive = sortBy === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.sortChip, isActive && styles.sortChipActive]}
              onPress={() => setSortBy(option.value)}
            >
              <Text
                style={[
                  styles.sortChipText,
                  isActive && styles.sortChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filteredAndSortedProducts}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.docId}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: '/product-detail',
                  params: { product: JSON.stringify(item) },
                })
              }
            >
              <View style={styles.imageWrapper}>
                <Image
                  source={{
                    uri:
                      item.hinhanh ||
                      'https://via.placeholder.com/300x300.png?text=No+Image',
                  }}
                  style={styles.cardImage}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.brand} numberOfLines={2}>
                {item.tensp}
              </Text>
              <Text style={styles.productName} numberOfLines={1}>
                {item.loaisp}
              </Text>
              <Text style={styles.price}>{formatVND(item.gia)}</Text>
            </TouchableOpacity>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() =>
                  router.push({
                    pathname: '/product-form',
                    params: { product: JSON.stringify(item) },
                  })
                }
              >
                <Feather name="edit-2" size={14} color="#111" />
                <Text style={styles.actionText}>Sửa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.docId)}
              >
                <Feather name="trash-2" size={14} color="#D11A2A" />
                <Text style={styles.deleteText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  sideMenu: {
    width: 260,
    backgroundColor: '#fff',
    paddingTop: 70,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 2, height: 0 },
    elevation: 10,
  },
  overlayArea: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginBottom: 22,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuText: {
    fontSize: 16,
    color: '#111',
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  searchBox: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#111',
    fontSize: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
  },
  subTitle: {
    marginTop: 4,
    color: '#555',
    fontSize: 14,
  },
  addTopButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  horizontalScroll: {
    marginBottom: 12,
  },
  categoryRow: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 8,
    gap: 10,
  },
  sortRow: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 8,
    gap: 10,
  },
  categoryChip: {
    minHeight: 42,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    lineHeight: 18,
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  sortChip: {
    minHeight: 42,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  sortChipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    lineHeight: 18,
  },
  sortChipTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  card: {
    width: '48.2%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#F1F1F1',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  cardImage: {
    width: '92%',
    height: '92%',
  },
  brand: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
    minHeight: 40,
  },
  productName: {
    fontSize: 13,
    color: '#7A7A7A',
    lineHeight: 18,
    minHeight: 20,
  },
  price: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  editBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3F3F3',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  deleteBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF0F1',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D11A2A',
  },
});