import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import { checkDeviceAuthorization } from "../services/deviceAuthService";

export default function Index() {
  const router = useRouter();
  const [statusText, setStatusText] = useState("Initializing...");

  useEffect(() => {
    let cancelled = false;

    async function runAuthCheck() {
      // Give the splash a brief moment to render before starting the check
      await new Promise((resolve) => setTimeout(resolve, 600));

      setStatusText("Verifying device authorization...");

      const { authorized, deviceId, error: authError } = await checkDeviceAuthorization();

      if (cancelled) return;

      if (authorized) {
        // Brief pause so user sees the splash, then go to home
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (!cancelled) router.replace("/home");
      } else {
        // Route to the unauthorized screen
        await new Promise((resolve) => setTimeout(resolve, 400));
        if (!cancelled) {
          router.replace({
            pathname: "/unauthorized",
            params: { 
              deviceId: deviceId || 'unknown',
              error: authError || 'Not found in database'
            }
          });
        }
      }
    }

    runAuthCheck();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/lo.jpeg")}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator
        size="small"
        color="#2b78c5"
        style={styles.spinner}
      />
      <Text style={styles.statusText}>{statusText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F1BE",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 140,
    height: 140,
  },
  spinner: {
    marginTop: 28,
  },
  statusText: {
    marginTop: 12,
    fontSize: 13,
    color: "#555",
    fontFamily: "sans-serif",
    letterSpacing: 0.3,
  },
});