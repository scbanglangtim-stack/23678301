import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Typography } from '@components/ui/Typography';
import { useTheme } from '@contexts/ThemeContext';
import { SIZES } from '@constants/theme';

export interface ShopButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
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
    const isDisabled = disabled || isLoading;

    let buttonBackground = colors.primary;
    let borderColor = colors.primary;
    let textColor = '#FFFFFF';
    let borderWidth = 0;

    if (variant === 'outline') {
      buttonBackground = colors.surface;
      borderColor = colors.primary;
      borderWidth = 1.5;
      textColor = colors.primary;
    } else if (variant === 'danger') {
      buttonBackground = colors.error;
      borderColor = colors.error;
      borderWidth = 0;
      textColor = '#FFFFFF';
    } else {
      buttonBackground = isDisabled ? colors.textLight : colors.primary;
      borderColor = buttonBackground;
      borderWidth = 0;
      textColor = '#FFFFFF';
    }

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
            borderWidth: borderWidth,
            opacity: isDisabled && !isLoading ? 0.6 : 1,
          },
          style,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' ? colors.primary : '#FFFFFF'}
          />
        ) : (
          <Typography
            variant="button"
            color={textColor}
            align="center"
            style={styles.btnText}
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
    height: 40,
    borderRadius: 12,
    paddingHorizontal: SIZES.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  btnText: {
    fontWeight: '700',
  },
});
