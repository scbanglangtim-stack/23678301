import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Typography } from '@components/ui/Typography';
import { useTheme } from '@contexts/ThemeContext';
import { SIZES } from '@constants/theme';

export interface ShopInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const ShopInput: React.FC<ShopInputProps> = React.memo(
  ({
    label,
    error,
    value,
    onChangeText,
    placeholder,
    containerStyle,
    style,
    ...rest
  }) => {
    const { colors } = useTheme();

    return (
      <View style={[styles.container, containerStyle]}>
        {label ? (
          <Typography
            variant="captionBold"
            color={colors.text}
            style={styles.label}
          >
            {label}
          </Typography>
        ) : null}

        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.surface,
              borderColor: error ? colors.error : colors.border,
            },
          ]}
        >
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textLight}
            style={[
              styles.input,
              {
                color: colors.text,
              },
              style,
            ]}
            {...rest}
          />
        </View>

        {error ? (
          <Typography
            variant="caption"
            color={colors.error}
            style={styles.errorText}
          >
            {error}
          </Typography>
        ) : null}
      </View>
    );
  }
);

ShopInput.displayName = 'ShopInput';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: SIZES.xs,
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md,
    height: 46,
    justifyContent: 'center',
  },
  input: {
    fontSize: 14,
    padding: 0,
    margin: 0,
  },
  errorText: {
    marginTop: SIZES.xs,
  },
});
