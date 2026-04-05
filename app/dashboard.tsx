import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { getProducts } from '../src/services/productService';
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

export default function DashboardScreen() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data as ProductItem[]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const stats = useMemo(() => {
    const totalProducts = products.length;

    const categoriesMap: Record<string, number> = {};
    let totalInventoryValue = 0;
    let highestPrice = 0;
    let lowestPrice = 0;

    if (products.length > 0) {
      highestPrice = Number(products[0].gia) || 0;
      lowestPrice = Number(products[0].gia) || 0;
    }

    products.forEach((item) => {
      const category = item.loaisp?.trim() || 'Chưa phân loại';
      const price = Number(item.gia) || 0;

      categoriesMap[category] = (categoriesMap[category] || 0) + 1;
      totalInventoryValue += price;

      if (price > highestPrice) highestPrice = price;
      if (price < lowestPrice) lowestPrice = price;
    });

    const categoryStats = Object.entries(categoriesMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalProducts,
      totalCategories: Object.keys(categoriesMap).length,
      totalInventoryValue,
      highestPrice,
      lowestPrice,
      categoryStats,
    };
  }, [products]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#111" />
        <Text style={styles.loadingText}>Đang tải thống kê...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <MaterialIcons name="inventory-2" size={28} color="#4F46E5" />
            <Text style={styles.summaryValue}>{stats.totalProducts}</Text>
            <Text style={styles.summaryLabel}>Tổng sản phẩm</Text>
          </View>

          <View style={styles.summaryCard}>
            <MaterialIcons name="category" size={28} color="#16A34A" />
            <Text style={styles.summaryValue}>{stats.totalCategories}</Text>
            <Text style={styles.summaryLabel}>Loại sản phẩm</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <MaterialIcons name="payments" size={28} color="#EA580C" />
            <Text style={styles.summaryValueSmall}>
              {formatVND(stats.totalInventoryValue)}
            </Text>
            <Text style={styles.summaryLabel}>Tổng giá trị kho</Text>
          </View>

          <View style={styles.summaryCard}>
            <MaterialIcons name="trending-up" size={28} color="#DC2626" />
            <Text style={styles.summaryValueSmall}>
              {formatVND(stats.highestPrice)}
            </Text>
            <Text style={styles.summaryLabel}>Giá cao nhất</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCardFull}>
            <MaterialIcons name="trending-down" size={28} color="#0891B2" />
            <Text style={styles.summaryValueSmall}>
              {formatVND(stats.lowestPrice)}
            </Text>
            <Text style={styles.summaryLabel}>Giá thấp nhất</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thống kê theo loại</Text>

          {stats.categoryStats.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có dữ liệu sản phẩm</Text>
          ) : (
            stats.categoryStats.map((item) => (
              <View key={item.name} style={styles.statItem}>
                <Text style={styles.statLabel}>{item.name}</Text>
                <Text style={styles.statValue}>{item.count} sản phẩm</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tóm tắt quản trị</Text>
          <Text style={styles.noteText}>
            - Hiện có <Text style={styles.bold}>{stats.totalProducts}</Text> sản phẩm trong hệ thống.
          </Text>
          <Text style={styles.noteText}>
            - Tổng số loại sản phẩm đang quản lý là{' '}
            <Text style={styles.bold}>{stats.totalCategories}</Text>.
          </Text>
          <Text style={styles.noteText}>
            - Tổng giá trị kho hiện tại là{' '}
            <Text style={styles.bold}>{formatVND(stats.totalInventoryValue)}</Text>.
          </Text>
          <Text style={styles.noteText}>
            - Sản phẩm có giá cao nhất là{' '}
            <Text style={styles.bold}>{formatVND(stats.highestPrice)}</Text>.
          </Text>
          <Text style={styles.noteText}>
            - Sản phẩm có giá thấp nhất là{' '}
            <Text style={styles.bold}>{formatVND(stats.lowestPrice)}</Text>.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#555',
    fontSize: 14,
  },
  header: {
    height: 56,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
  },
  content: {
    padding: 18,
    paddingBottom: 30,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
  },
  summaryCardFull: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
  },
  summaryValue: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
  },
  summaryValueSmall: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
  },
  summaryLabel: {
    marginTop: 6,
    fontSize: 13,
    color: '#666',
  },
  section: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    marginBottom: 14,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  statLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 15,
    color: '#111',
    fontWeight: '700',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  noteText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 10,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
    color: '#111',
  },
});