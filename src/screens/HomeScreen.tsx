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

  // Dynamic image background based on category
  const imgBg =
    item.category === 'drink'
      ? '#E0F2FE'
      : item.category === 'study'
      ? '#F3F4F6'
      : '#FEF3C7';

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
      <View style={[styles.productImageWrapper, { backgroundColor: imgBg }]}>
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.productInfo}>
        <Typography
          variant="h3"
          numberOfLines={1}
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
        <Typography
          variant="caption"
          color={colors.textLight}
          style={styles.productCategory}
        >
          {item.categoryName}
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
        setError(`${STUDENT.mssv}\nKhông tải được dữ liệu món.`);
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

  // Render Header Block (A) - Solid Teal Banner matching Hình 1
  const renderHeader = () => (
    <View style={[styles.headerBanner, { backgroundColor: colors.primary }]}>
      <View style={styles.headerTopRow}>
        <View>
          <Typography variant="h1" color="#FFFFFF" style={styles.brandTitle}>
            CAMPUSMART
          </Typography>
          <Typography variant="caption" color="#CCFBF1">
            Tiện lợi KTX
          </Typography>
        </View>

        <View style={styles.headerRightCol}>
          {VARIANT.themeControl === 'switch' ? (
            <View style={styles.switchWrapper}>
              <Typography variant="captionBold" color="#FFFFFF">
                {isDarkMode ? 'Tối' : 'Sáng'}
              </Typography>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#CCFBF1', true: '#042F2E' }}
                thumbColor={isDarkMode ? '#FFFFFF' : '#F0FDFA'}
              />
            </View>
          ) : (
            <Pressable
              onPress={toggleTheme}
              style={[
                styles.themePillBtn,
                {
                  borderColor: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                },
              ]}
            >
              <Typography variant="captionBold" color="#FFFFFF">
                {isDarkMode ? '🌙 Tối' : 'Sáng / Tối'}
              </Typography>
            </Pressable>
          )}

          <Typography variant="captionBold" color={colors.secondary} style={styles.flashText}>
            Flash {countdown.formattedTime}
            {countdown.isExpired ? ' (Hết giờ)' : ''}
          </Typography>
        </View>
      </View>
    </View>
  );

  // Render Search Box (B)
  const renderSearch = () => (
    <View style={styles.searchContainer}>
      <ShopInput
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder={`Tìm món, nước, đồ dùng — ${STUDENT.mssv}`}
        style={styles.searchInputCustom}
        containerStyle={styles.searchInputWrapper}
      />
    </View>
  );

  // Render Banner (C)
  const renderBanner = () => (
    <View style={[styles.bannerCard, { backgroundColor: isDarkMode ? '#0B4F4A' : '#0F766E' }]}>
      {bannerError ? (
        <View style={styles.bannerContent}>
          <Typography variant="h2" color="#FFFFFF" style={styles.bannerMainTitle}>
            Đặt nhanh · Nhận tại quầy
          </Typography>
          <Typography variant="caption" color="#CCFBF1">
            Cửa hàng tiện lợi ký túc xá 24/7
          </Typography>
        </View>
      ) : (
        <View style={styles.bannerImageContainer}>
          <Image
            source={{ uri: BANNER_URL }}
            style={styles.bannerImage}
            resizeMode="cover"
            onError={() => setBannerError(true)}
          />
          <View style={styles.bannerOverlay}>
            <Typography variant="h2" color="#FFFFFF" align="center" style={styles.bannerMainTitle}>
              Đặt nhanh · Nhận tại quầy
            </Typography>
            <Typography variant="caption" color="#CCFBF1" align="center">
              Cửa hàng tiện lợi ký túc xá 24/7
            </Typography>
          </View>
        </View>
      )}
    </View>
  );

  // Render Category Chips (D)
  const renderChips = () => (
    <View style={styles.chipsRow}>
      {ORDERED_CHIPS.map((chip) => {
        const isSelected = selectedCategory === chip.id;
        return (
          <Pressable
            key={chip.id}
            onPress={() => setSelectedCategory(chip.id)}
            style={[
              styles.chipPill,
              {
                backgroundColor: isSelected ? colors.primary : colors.surface,
                borderColor: colors.primary,
              },
            ]}
          >
            <Typography
              variant="captionBold"
              color={isSelected ? '#FFFFFF' : colors.primary}
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
      edges={['top', 'left', 'right', 'bottom']}
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
            variant="h2"
            color={colors.error}
            align="center"
            style={styles.errorText}
          >
            {error}
          </Typography>
          <ShopButton
            title="Thử lại"
            onPress={loadProducts}
            variant="danger"
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
              <View style={styles.mainPadding}>
                {renderSearch()}
                {renderBanner()}
                {renderChips()}
              </View>
            </View>
          }
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Watermark at Bottom if VARIANT.watermarkAtTop is false (Odd Last Digit) */}
      {!VARIANT.watermarkAtTop ? renderWatermark() : null}

      {/* Order Modal (Câu 3a - Giao diện 2) */}
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
            {/* Modal Top Watermark Bar */}
            <View
              style={[
                styles.modalWatermarkBar,
                {
                  backgroundColor: isDarkMode ? '#0B4F4A' : '#CCFBF1',
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
              <View style={styles.modalBody}>
                {/* Product Image Box */}
                <View
                  style={[
                    styles.modalImageBox,
                    {
                      backgroundColor:
                        selectedProduct.category === 'drink'
                          ? '#E0F2FE'
                          : selectedProduct.category === 'study'
                          ? '#F3F4F6'
                          : '#FEF3C7',
                    },
                  ]}
                >
                  <Image
                    source={{ uri: selectedProduct.image }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                </View>

                {/* Product Name */}
                <Typography
                  variant="h2"
                  color={colors.text}
                  align="center"
                  style={styles.modalTitle}
                >
                  {selectedProduct.title}
                </Typography>

                {/* Price */}
                <Typography
                  variant="h2"
                  color={colors.primary}
                  align="center"
                  style={styles.modalPrice}
                >
                  {selectedProduct.formattedPrice}
                </Typography>

                {/* Category Label */}
                <Typography
                  variant="caption"
                  color={colors.textLight}
                  align="center"
                  style={styles.modalCategory}
                >
                  Danh mục: {selectedProduct.categoryName}
                </Typography>

                {/* Description (max 2 lines) */}
                <Typography
                  variant="caption"
                  numberOfLines={2}
                  color={colors.textLight}
                  align="center"
                  style={styles.modalDesc}
                >
                  {selectedProduct.description || 'Mô tả ngắn, tối đa 2 dòng...'}
                </Typography>

                {/* Quantity Controls (useReducer) */}
                <View style={styles.quantityRow}>
                  <Pressable
                    onPress={() => dispatchQuantity({ type: 'REMOVE' })}
                    style={[
                      styles.qtyBtnMinus,
                      {
                        borderColor: colors.primary,
                        backgroundColor: colors.surface,
                      },
                    ]}
                  >
                    <Typography variant="h3" color={colors.primary}>
                      −
                    </Typography>
                  </Pressable>

                  <Typography
                    variant="h3"
                    color={colors.text}
                    style={styles.qtyNumber}
                  >
                    {quantity}
                  </Typography>

                  <Pressable
                    onPress={() => dispatchQuantity({ type: 'ADD' })}
                    style={[
                      styles.qtyBtnPlus,
                      {
                        backgroundColor: colors.primary,
                      },
                    ]}
                  >
                    <Typography variant="h3" color="#FFFFFF">
                      +
                    </Typography>
                  </Pressable>
                </View>

                {/* Flash Expiration Notice */}
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
                    style={styles.modalConfirmBtn}
                  />

                  <ShopButton
                    title="Đóng"
                    onPress={handleCloseModal}
                    variant="outline"
                    style={styles.modalCloseBtn}
                  />
                </View>
              </View>
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
    paddingVertical: 8,
    paddingHorizontal: SIZES.md,
    borderBottomWidth: 1,
    borderTopWidth: 1,
  },
  listContent: {
    paddingBottom: SIZES.xxl,
  },
  mainPadding: {
    paddingHorizontal: SIZES.md,
  },
  headerBanner: {
    paddingHorizontal: SIZES.md,
    paddingTop: SIZES.md,
    paddingBottom: SIZES.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerRightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  themePillBtn: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1.5,
  },
  flashText: {
    marginTop: 2,
  },
  searchContainer: {
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  searchInputWrapper: {
    width: '100%',
  },
  searchInputCustom: {
    height: 42,
  },
  bannerCard: {
    height: 125,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    marginBottom: SIZES.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 118, 110, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
  },
  bannerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.md,
  },
  bannerMainTitle: {
    fontWeight: '800',
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
    gap: 6,
  },
  chipPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCard: {
    flexDirection: 'row',
    padding: SIZES.md,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    marginHorizontal: SIZES.md,
    marginBottom: SIZES.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  productImageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
    marginLeft: SIZES.md,
    marginRight: SIZES.sm,
  },
  productTitle: {
    fontWeight: '700',
    marginBottom: 2,
  },
  productPrice: {
    fontWeight: '700',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
  },
  orderButtonWrapper: {
    justifyContent: 'center',
  },
  smallOrderBtn: {
    height: 34,
    width: 68,
    paddingHorizontal: 0,
    borderRadius: 10,
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
    marginBottom: SIZES.lg,
    fontWeight: '700',
    lineHeight: 26,
  },
  retryBtn: {
    width: 140,
    borderRadius: SIZES.radiusFull,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.lg,
  },
  modalBox: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  modalWatermarkBar: {
    paddingVertical: 8,
    paddingHorizontal: SIZES.sm,
    width: '100%',
  },
  modalBody: {
    padding: SIZES.lg,
    alignItems: 'center',
  },
  modalImageBox: {
    width: 140,
    height: 110,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.sm,
    marginBottom: SIZES.md,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  modalPrice: {
    fontWeight: '700',
    marginBottom: 4,
  },
  modalCategory: {
    marginBottom: 6,
  },
  modalDesc: {
    marginBottom: SIZES.md,
    paddingHorizontal: SIZES.sm,
    lineHeight: 18,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
    gap: SIZES.md,
  },
  qtyBtnMinus: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnPlus: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyNumber: {
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
  },
  expiredNotice: {
    marginBottom: SIZES.sm,
  },
  modalActions: {
    width: '100%',
    gap: SIZES.sm,
  },
  modalConfirmBtn: {
    width: '100%',
    height: 42,
    borderRadius: 12,
  },
  modalCloseBtn: {
    width: '100%',
    height: 42,
    borderRadius: 12,
  },
});
