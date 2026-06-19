// app/hub.js
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Hub() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Select Experiment");

  const experiments = [
    { title: "GM Tube Characteristics", route: "/screen1_dataentry" },
    { title: "Inverse Square Law", route: "/screen2_dataentry" },
    { title: "Nuclear Countings Statistics", route: "/screen3_dataentry" },
    { title: "Linear & Mass Attenuation Co-Efficient", route: "/screen4_dataentry" },
    { title: "Efficiency Of GM Detector", route: "/screen5_dataentry" },
    { title: "Beta Particle Range", route: "/screen6_dataentry" },
    { title: "Measurement Of Short Half-Life", route: "/screen7_dataentry" },
    { title: "Production and Attenuation of Bremsstrahlung", route: "/screen8_dataentry" },
  ];

  const handlePick = (item) => {
    // close dropdown first
    setSelected(item.title);
    setIsOpen(false);

    // small delay to ensure dropdown unmounts/animations finish before navigation
    setTimeout(() => {
      router.push(item.route);
    }, 80);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F1BE" }}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.brand}>GM LAB</Text>

          <TouchableOpacity
            style={styles.dataBtn}
            onPress={() => router.push("/hub")}
            activeOpacity={0.8}
          >
            <Text style={styles.dataBtnText}>Data Entry</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.topRight}>
          <Image
            source={require("../assets/images/lo.jpeg")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>
      <View style={styles.topSeparator} />

      {/* Instruction */}
      <View style={styles.instructionWrapper}>
        <Text style={styles.instruction}>
          Please select the experiment for which you want to enter data and view
          corresponding results.
        </Text>
      </View>

      {/* Dropdown */}
      <View style={styles.contentArea}>
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => setIsOpen((v) => !v)}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownText}>{selected}</Text>
            <Text style={styles.dropdownArrow}>{isOpen ? "▲" : "▼"}</Text>
          </TouchableOpacity>

          {isOpen && (
            <>
              {/* Overlay to close dropdown when tapping outside.
                  pointerEvents set so it doesn't block touches to dropdown list on some platforms.
                  (kept minimal / transparent) */}
              <Pressable
                style={styles.overlay}
                onPress={() => setIsOpen(false)}
                pointerEvents="box-none"
              />

              {/* Scrollable list of experiments (nestedScrollEnabled helps on Android/tablets)
                  Make the dropdown bigger so all options are visible by sizing maxHeight dynamically. */}
              <ScrollView
                style={[styles.dropdownList, { maxHeight: experiments.length * 56 }]}
                nestedScrollEnabled={true}
              >
                {experiments.map((item) => (
                  <TouchableOpacity
                    key={item.title}
                    style={styles.dropdownItem}
                    onPress={() => handlePick(item)}
                  >
                    <Text style={styles.dropdownItemText}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </View>

      {/* Back Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/home")}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    height: 80,
    width: "100%",
  },
  topLeft: {
    flex: 1,
    backgroundColor: "#d0cfcfff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  brand: {
    fontSize: 38,
    fontWeight: "700",
    letterSpacing: 2,
  },
  dataBtn: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#f6f4f4ff",
    borderWidth: 1,
    borderColor: "#cfcfcf",
    marginLeft: 30,
  },
  dataBtnText: {
    fontWeight: "700",
  },
  topRight: {
    flex: 2.5,
    backgroundColor: "#2b78c5",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 20,
  },
  logo: {
    width: 70,
    height: 70,
  },
  topSeparator: {
    height: 2,
    backgroundColor: "#000",
    width: "100%",
  },
  instructionWrapper: {
    paddingHorizontal: 15,
    paddingTop: 20,
    alignItems: "flex-start",
  },
  instruction: { fontSize: 22, fontWeight: "500", color: "#333" },
  contentArea: { paddingHorizontal: 15, paddingTop: 20, flex: 1 },
  dropdownWrapper: {
    width: "86%",
    position: "relative",
    alignSelf: "flex-start",
    marginTop: 6,
    zIndex: 20,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 18,
    backgroundColor: "#f9f9f9",
  },
  dropdownText: { fontSize: 17 },
  dropdownArrow: { fontSize: 18 },
  overlay: {
    position: "absolute",
    top: 0,
    left: -20,
    right: -20,
    bottom: -500,
    backgroundColor: "transparent",
    zIndex: 9,
  },
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    maxHeight: 240, // default; overridden inline to experiments.length * 56
    backgroundColor: "#fff",
    zIndex: 20,
    elevation: 6,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownItemText: { fontSize: 16 },

  bottomContainer: {
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 15,
    backgroundColor: "#F7F1BE",
  },
  backButton: {
    backgroundColor: "#808080", // matched color
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
