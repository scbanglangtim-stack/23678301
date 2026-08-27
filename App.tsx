// TH1 | 23678301 | NGUYEN HUYNH TAN PHAT | #355913
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@contexts/ThemeContext';
import { HomeScreen } from '@screens/HomeScreen';

const MainApp: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <HomeScreen />
    </>
  );
};

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
