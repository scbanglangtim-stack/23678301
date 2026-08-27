import React, { useState, useEffect, useMemo, useCallback, useReducer } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Modal,
  Alert,
  Pressable,
  Switch,
  ActivityIndicator,
  ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  STUDENT,
  LAST_DIGIT,
  BANNER_IMAGE_ID,
  FLASH_SECONDS,
  VARIANT,
  examStamp,
} from '@constants/student';
import { SIZES } from '@constants/theme';
import { useTheme } from '@contexts/ThemeContext';
import { useCountdown } from '@hooks/useCountdown';
import { Typography } from '@components/ui/Typography';
import { ShopInput } from '@components/ui/ShopInput';
import { ShopButton } from '@components/ui/ShopButton';
import {
  fetchProducts,
  ProductItem,
  CategoryId,
} from '@services/productApi';

// Quantity Reducer
type QuantityAction = { type: 'ADD' } | { type: 'REMOVE' } | { type: 'RESET' };

function quantityReducer(state: number, action: QuantityAction): number {
  switch (action.type) {
    case 'ADD':
      return state + 1;
    case 'REMOVE':
      return state > 1 ? state - 1 : 1;
    case 'RESET':
      return 1;
    default:
      return state;
  }
}

// Category Chip Configuration
interface CategoryChipItem {
  id: CategoryId;
  label: string;
}

const DEFAULT_CHIPS: CategoryChipItem[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'food', label: 'Đồ ăn' },
  { id: 'drink', label: 'Nước' },
  { id: 'study', label: 'Học tập' },
];

const ORDERED_CHIPS: CategoryChipItem[] = VARIANT.chipsReversed
  ? [
      { id: 'study', label: 'Học tập' },
      { id: 'drink', label: 'Nước' },
      { id: 'food', label: 'Đồ ăn' },
      { id: 'all', label: 'Tất cả' },
    ]
  : DEFAULT_CHIPS;

// Stamp and Watermark String
const STAMP_CODE = examStamp();
const WATERMARK_TEXT = `TH1 · ${STUDENT.mssv} · ${STUDENT.hoTen} · #${STAMP_CODE}`;
const BANNER_URL = `https://picsum.photos/id/${BANNER_IMAGE_ID}/800/320`;

// Product Card Component (Memoized)
interface ProductCardProps {
  item: ProductItem;
  onSelect: (item: ProductItem) => void;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ item, onSelect }) => {
  const { colors } = useTheme();

  const handlePress = useCallback(() => {
    onSelect(item);
  }, [item, onSelect]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.productCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.productImage}
        resizeMode="contain"
      />
      <View style={styles.productInfo}>
        <View style={styles.categoryBadge}>
          <Typography variant="captionBold" color={colors.primary}>
            {item.categoryName}
          </Typography>
        </View>
        <Typography
          variant="h3"
          numberOfLines={2}
          color={colors.text}
          style={styles.productTitle}
        >
          {item.title}
        </Typography>
        <Typography
          variant="h3"
          color={colors.primary}
          style={styles.productPrice}
        >
          {item.formattedPrice}
        </Typography>
      </View>
      <View style={styles.orderButtonWrapper}>
        <ShopButton
          title="Đặt"
          onPress={handlePress}
          variant="primary"
          style={styles.smallOrderBtn}
        />
      </View>
    </Pressable>
  );
});

ProductCard.displayName = 'ProductCard';

export const HomeScreen: React.FC = () => {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const countdown = useCountdown(FLASH_SECONDS);

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(
    ORDERED_CHIPS[0].id
  );

  const [bannerError, setBannerError] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const [quantity, dispatchQuantity] = useReducer(quantityReducer, 1);

  // Fetch Products API
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    let isAlive = true;

    try {
      const data = await fetchProducts();
      if (isAlive) {
        setProducts(data);
      }
    } catch (err: any) {
      if (isAlive) {
        setError(`${STUDENT.mssv} — Không tải được dữ liệu món.`);
      }
    } finally {
      if (isAlive) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Filtered Products (useMemo)
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchSearch = item.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());
      const matchCategory =
        selectedCategory === 'all' ? true : item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Handle Open Modal
  const handleOpenModal = useCallback((item: ProductItem) => {
    setSelectedProduct(item);
    dispatchQuantity({ type: 'RESET' });
    setModalVisible(true);
  }, []);

  // Handle Close Modal
  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedProduct(null);
    dispatchQuantity({ type: 'RESET' });
  }, []);

  // Handle Confirm Order
  const handleConfirmOrder = useCallback(() => {
    if (!selectedProduct) return;

    if (countdown.isExpired) {
      Alert.alert('Thông báo', 'Hết giờ flash-sale! Không thể đặt món.');
      return;
    }

    Alert.alert(
      `CampusMart · ${STUDENT.mssv}`,
      `${STUDENT.hoTen} (#${STAMP_CODE}) đã ghi nhận: ${selectedProduct.title} × ${quantity}. Nhận tại quầy KTX.`,
      [
        {
          text: 'OK',
          onPress: () => {
            handleCloseModal();
          },
        },
      ]
    );
  }, [selectedProduct, quantity, countdown.isExpired, handleCloseModal]);

  // Render Watermark
  const renderWatermark = () => (
    <View
      style={[
        styles.watermarkContainer,
        {
          backgroundColor: isDarkMode ? '#0B4F4A' : '#CCFBF1',
          borderColor: colors.border,
        },
      ]}
    >
      <Typography
        variant="captionBold"
        color={colors.primary}
        align="center"
      >
        {WATERMARK_TEXT}
      </Typography>
    </View>
  );

  // Render Header (0) & (A)
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTopRow}>
        <View>
          <Typography variant="h1" color={colors.primary} style={styles.brandTitle}>
            CAMPUSMART
          </Typography>
          <Typography variant="caption" color={colors.textLight}>
            Cửa hàng tiện lợi KTX 24/7
          </Typography>
        </View>

        <View style={styles.headerControls}>
          {VARIANT.themeControl === 'switch' ? (
            <View style={styles.switchWrapper}>
              <Typography variant="captionBold" color={colors.text}>
                {isDarkMode ? 'Tối' : 'Sáng'}
              </Typography>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#CCFBF1', true: colors.primary }}
                thumbColor={isDarkMode ? '#FFFFFF' : colors.primary}
              />
            </View>
          ) : (
            <Pressable
              onPress={toggleTheme}
              style={[
                styles.themeBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Typography variant="captionBold" color={colors.primary}>
                {isDarkMode ? '☀️ Sáng' : '🌙 Tối'}
              </Typography>
            </Pressable>
          )}
        </View>
      </View>

      {/* Flash Sale Countdown */}
      <View
        style={[
          styles.flashBadge,
          {
            backgroundColor: isDarkMode ? '#134E4A' : '#FEF3C7',
            borderColor: colors.secondary,
          },
        ]}
      >
        <Typography variant="captionBold" color={colors.secondary}>
          ⚡ Flash: {countdown.formattedTime}
        </Typography>
        {countdown.isExpired ? (
          <Typography variant="captionBold" color={colors.error}>
            {' '}(Hết giờ)
          </Typography>
        ) : null}
      </View>
    </View>
  );

  // Render Search Box (B)
  const renderSearch = () => (
    <View style={styles.searchContainer}>
      <ShopInput
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder={`Tìm món nhanh (${STUDENT.mssv})...`}
      />
    </View>
  );

  // Render Banner (C)
  const renderBanner = () => (
    <View style={[styles.bannerContainer, { borderColor: colors.border }]}>
      {bannerError ? (
        <View style={[styles.bannerFallback, { backgroundColor: colors.surface }]}>
          <Typography variant="h3" color={colors.primary}>
            CampusMart KTX
          </Typography>
          <Typography variant="caption" color={colors.textLight}>
            Đặt nhanh · Nhận tại quầy
          </Typography>
        </View>
      ) : (
        <>
          <Image
            source={{ uri: BANNER_URL }}
            style={styles.bannerImage}
            resizeMode="cover"
            onError={() => setBannerError(true)}
          />
          <View style={styles.bannerOverlay}>
            <Typography variant="h2" color="#FFFFFF" style={styles.bannerTitle}>
              Đặt nhanh · Nhận tại quầy
            </Typography>
            <Typography variant="caption" color="#FFFFFF">
              Tiện lợi · Nhanh chóng · 24/7 KTX
            </Typography>
          </View>
        </>
      )}
    </View>
  );

  // Render Category Chips (D)
  const renderChips = () => (
    <View style={styles.chipsContainer}>
      {ORDERED_CHIPS.map((chip) => {
        const isSelected = selectedCategory === chip.id;
        return (
          <Pressable
            key={chip.id}
            onPress={() => setSelectedCategory(chip.id)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? colors.primary : colors.surface,
                borderColor: isSelected ? colors.primary : colors.border,
              },
            ]}
          >
            <Typography
              variant="captionBold"
              color={isSelected ? '#FFFFFF' : colors.text}
            >
              {chip.label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );

  // List Empty Component
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Typography variant="body" color={colors.textLight} align="center">
        Không có món phù hợp
      </Typography>
    </View>
  );

  // Render Product Item
  const renderProductItem = useCallback(
    ({ item }: ListRenderItemInfo<ProductItem>) => {
      return <ProductCard item={item} onSelect={handleOpenModal} />;
    },
    [handleOpenModal]
  );

  // Key Extractor
  const keyExtractor = useCallback((item: ProductItem) => item.itemKey, []);

  // Modal Animation Type based on VARIANT
  const modalAnimationType = VARIANT.modalAnimation;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* Watermark at Top if VARIANT.watermarkAtTop is true */}
      {VARIANT.watermarkAtTop ? renderWatermark() : null}

      {/* Main List & Header */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Typography
            variant="body"
            color={colors.textLight}
            style={styles.loadingText}
          >
            Đang tải món…
          </Typography>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Typography
            variant="h3"
            color={colors.error}
            align="center"
            style={styles.errorText}
          >
            {error}
          </Typography>
          <ShopButton
            title="Thử lại"
            onPress={loadProducts}
            variant="primary"
            style={styles.retryBtn}
          />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={keyExtractor}
          renderItem={renderProductItem}
          ListHeaderComponent={
            <View>
              {renderHeader()}
              {renderSearch()}
              {renderBanner()}
              {renderChips()}
            </View>
          }
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Watermark at Bottom if VARIANT.watermarkAtTop is false */}
      {!VARIANT.watermarkAtTop ? renderWatermark() : null}

      {/* Order Modal (Câu 3a) */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType={modalAnimationType}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Modal Watermark */}
            <View
              style={[
                styles.modalWatermark,
                {
                  backgroundColor: isDarkMode ? '#0B4F4A' : '#CCFBF1',
                  borderColor: colors.border,
                },
              ]}
            >
              <Typography
                variant="captionBold"
                color={colors.primary}
                align="center"
              >
                {WATERMARK_TEXT}
              </Typography>
            </View>

            {selectedProduct ? (
              <>
                {/* Product Image & Info */}
                <Image
                  source={{ uri: selectedProduct.image }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />

                <View style={styles.modalCategoryBadge}>
                  <Typography variant="captionBold" color={colors.primary}>
                    {selectedProduct.categoryName}
                  </Typography>
                </View>

                <Typography
                  variant="h2"
                  color={colors.text}
                  align="center"
                  style={styles.modalTitle}
                >
                  {selectedProduct.title}
                </Typography>

                <Typography
                  variant="h2"
                  color={colors.primary}
                  align="center"
                  style={styles.modalPrice}
                >
                  {selectedProduct.formattedPrice}
                </Typography>

                <Typography
                  variant="caption"
                  numberOfLines={2}
                  color={colors.textLight}
                  align="center"
                  style={styles.modalDesc}
                >
                  {selectedProduct.description}
                </Typography>

                {/* Quantity Controls (useReducer) */}
                <View style={styles.quantityContainer}>
                  <Pressable
                    onPress={() => dispatchQuantity({ type: 'REMOVE' })}
                    style={[
                      styles.qtyBtn,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Typography variant="h2" color={colors.primary}>
                      −
                    </Typography>
                  </Pressable>

                  <Typography
                    variant="h2"
                    color={colors.text}
                    style={styles.qtyText}
                  >
                    {quantity}
                  </Typography>

                  <Pressable
                    onPress={() => dispatchQuantity({ type: 'ADD' })}
                    style={[
                      styles.qtyBtn,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Typography variant="h2" color={colors.primary}>
                      +
                    </Typography>
                  </Pressable>
                </View>

                {/* Flash Expiration Warning */}
                {countdown.isExpired ? (
                  <Typography
                    variant="captionBold"
                    color={colors.error}
                    align="center"
                    style={styles.expiredNotice}
                  >
                    Hết giờ flash-sale
                  </Typography>
                ) : null}

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <ShopButton
                    title="Xác nhận đặt"
                    onPress={handleConfirmOrder}
                    variant="primary"
                    disabled={countdown.isExpired}
                    style={styles.modalBtn}
                  />

                  <ShopButton
                    title="Đóng"
                    onPress={handleCloseModal}
                    variant="outline"
                    style={styles.modalBtn}
                  />
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  watermarkContainer: {
    paddingVertical: SIZES.xs + 2,
    paddingHorizontal: SIZES.md,
    borderBottomWidth: 1,
    borderTopWidth: 1,
  },
  listContent: {
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.xxl,
  },
  headerContainer: {
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.sm,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: {
    letterSpacing: 1,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  themeBtn: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs + 2,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
  },
  flashBadge: {
    marginTop: SIZES.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    marginVertical: SIZES.sm,
  },
  bannerContainer: {
    height: 130,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: SIZES.md,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 118, 110, 0.85)',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  bannerTitle: {
    fontWeight: '700',
  },
  bannerFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
    gap: SIZES.xs,
  },
  chip: {
    flex: 1,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCard: {
    flexDirection: 'row',
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1.5,
    marginBottom: SIZES.md,
    alignItems: 'center',
  },
  productImage: {
    width: 68,
    height: 68,
    borderRadius: SIZES.radiusSm,
  },
  productInfo: {
    flex: 1,
    marginLeft: SIZES.md,
    marginRight: SIZES.sm,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    marginBottom: SIZES.xs,
  },
  productTitle: {
    marginBottom: SIZES.xs,
  },
  productPrice: {
    fontWeight: '700',
  },
  orderButtonWrapper: {
    justifyContent: 'center',
  },
  smallOrderBtn: {
    height: 36,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusSm,
  },
  emptyContainer: {
    paddingVertical: SIZES.xxl,
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  loadingText: {
    marginTop: SIZES.md,
  },
  errorText: {
    marginBottom: SIZES.md,
  },
  retryBtn: {
    width: 140,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.lg,
  },
  modalBox: {
    width: '100%',
    borderRadius: SIZES.radiusLg,
    borderWidth: 1.5,
    padding: SIZES.lg,
    alignItems: 'center',
  },
  modalWatermark: {
    width: '100%',
    paddingVertical: SIZES.xs + 2,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    marginBottom: SIZES.md,
  },
  modalImage: {
    width: 110,
    height: 110,
    marginBottom: SIZES.sm,
  },
  modalCategoryBadge: {
    marginBottom: SIZES.xs,
  },
  modalTitle: {
    marginBottom: SIZES.xs,
  },
  modalPrice: {
    marginBottom: SIZES.sm,
  },
  modalDesc: {
    marginBottom: SIZES.md,
    paddingHorizontal: SIZES.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
    gap: SIZES.lg,
  },
  qtyBtn: {
    width: 42,
    height: 42,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    minWidth: 32,
    textAlign: 'center',
  },
  expiredNotice: {
    marginBottom: SIZES.sm,
  },
  modalActions: {
    width: '100%',
    gap: SIZES.sm,
  },
  modalBtn: {
    width: '100%',
  },
});
