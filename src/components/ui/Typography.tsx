import React from 'react';
import { Text, TextStyle, StyleSheet, TextProps } from 'react-native';
import { FONTS, FontVariant } from '@constants/theme';
import { useTheme } from '@contexts/ThemeContext';

export interface TypographyProps extends TextProps {
  variant?: FontVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  numberOfLines?: number;
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = React.memo(
  ({
    variant = 'body',
    color,
    align,
    numberOfLines,
    style,
    children,
    ...rest
  }) => {
    const { colors } = useTheme();

    const textStyle: TextStyle = {
      ...FONTS[variant],
      color: color || colors.text,
      textAlign: align || 'left',
    };

    return (
      <Text
        style={[styles.baseText, textStyle, style]}
        numberOfLines={numberOfLines}
        {...rest}
      >
        {children}
      </Text>
    );
  }
);

Typography.displayName = 'Typography';

const styles = StyleSheet.create({
  baseText: {
    includeFontPadding: false,
  },
});
