import { ThemeProvider, DefaultTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#ffffff",
    background: "#000000",
    card: "#000000",
    text: "#ffffff",
    border: "#222222",
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={MyTheme}>
      {/* makes time/battery visible on dark bg */}
      <StatusBar style="light" backgroundColor="#fff" />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
