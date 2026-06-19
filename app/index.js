import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/home"); // move to renamed home.js
    }, 2800); // show for 2.8 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/lo.jpeg")} // your logo
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F1BE", // changed to match home.js
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 140,
    height: 140,
  },
});