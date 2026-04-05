import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { deleteProductById, getProducts } from '../services/productService';

export default function ProductListScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadProducts();
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = (docId) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa sản phẩm này?', [
      {
        text: 'Hủy',
        style: 'cancel',
      },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProductById(docId);
            await loadProducts();
          } catch (error) {
            Alert.alert('Lỗi', error.message);
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    }
  };

  const filteredProducts = useMemo(() => {
    const lower = keyword.trim().toLowerCase();
    if (!lower) return products;

    return products.filter(item =>
      item.tensp?.toLowerCase().includes(lower)
    );
  }, [keyword, products]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.hinhanh ? (
        <Image source={{ uri: item.hinhanh }} style={styles.image} />
      ) : (
        <View style={styles.noImage}>
          <Text>Không ảnh</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name}>{item.tensp}</Text>
        <Text>Mã: {item.idsanpham}</Text>
        <Text>Loại: {item.loaisp}</Text>
        <Text>Giá: {item.gia}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('ProductForm', { product: item })}
          >
            <Text style={styles.actionText}>Sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.docId)}
          >
            <Text style={styles.actionText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Tìm theo tên sản phẩm"
        value={keyword}
        onChangeText={setKeyword}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('ProductForm')}
      >
        <Text style={styles.whiteText}>Thêm sản phẩm</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.whiteText}>Đăng xuất</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.docId}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text>Chưa có sản phẩm</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  search: {
    borderWidth: 1,
    borderColor: '#d8d8d8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 14,
  },
  whiteText: {
    color: '#fff',
    fontWeight: '700',
  },
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 12,
  },
  noImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#d8d8d8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  editBtn: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  deleteBtn: {
    backgroundColor: '#ffd6d6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: {
    fontWeight: '600',
  },
  emptyBox: {
    marginTop: 40,
    alignItems: 'center',
  },
});