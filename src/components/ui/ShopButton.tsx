import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Typography } from './Typography';
import { useTheme } from '@contexts/ThemeContext';
import { SIZES } from '@constants/theme';

export interface ShopButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
}

export const ShopButton: React.FC<ShopButtonProps> = React.memo(
  ({
    title,
    onPress,
    variant = 'primary',
    isLoading = false,
    disabled = false,
    style,
    textStyle,
  }) => {
    const { colors } = useTheme();
    const isPrimary = variant === 'primary';
    const isDisabled = disabled || isLoading;

    const buttonBackground = isPrimary
      ? isDisabled
        ? colors.textLight
        : colors.primary
      : 'transparent';

    const borderColor = isPrimary ? 'transparent' : colors.primary;
    const textColor = isPrimary ? '#FFFFFF' : colors.primary;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={isDisabled}
        style={[
          styles.button,
          {
            backgroundColor: buttonBackground,
            borderColor: borderColor,
            borderWidth: isPrimary ? 0 : 1.5,
            opacity: isDisabled && !isLoading ? 0.6 : 1,
          },
          style,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={isPrimary ? '#FFFFFF' : colors.primary}
          />
        ) : (
          <Typography
            variant="button"
            color={textColor}
            align="center"
            style={textStyle}
          >
            {title}
          </Typography>
        )}
      </TouchableOpacity>
    );
  }
);

ShopButton.displayName = 'ShopButton';

const styles = StyleSheet.create({
  button: {
    height: 42,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
