import React from 'react';
import { useRouter } from 'expo-router';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';

export default function ExperimentSelection() {
  const router = useRouter();

  const buttons = [
    { label: 'General Theory', route: '/screen0' },
    { label: 'Exp 1: GM Tube Characteristics', route: '/screen1' },
    { label: 'Exp 2: Inverse Square Law For Gamma Rays', route: '/screen2' },
    { label: 'Exp 3: Nuclear Countings Statistics', route: '/screen3' },
    { label: 'Exp 4: Linear & Mass Attenuation', route: '/screen4' },
    { label: 'Exp 5: Efficiency Of GM Detector', route: '/screen5' },
    { label: 'Exp 6: Beta Particle Range', route: '/screen6' },
    { label: 'Exp 7: Measurement Of Short Half-Life', route: '/screen7' },
    { label: 'Exp 8: Production and Attenuation of Bremsstrahlung', route: '/screen8' },
  ];

  const ButtonItem = ({ label, route }) => (
    <TouchableOpacity
      style={styles.button}
      onPress={() => (route ? router.push(route) : Alert.alert('Route missing'))}
      activeOpacity={0.85}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.brand}>GM LAB</Text>

          <TouchableOpacity
            style={styles.dataBtn}
            onPress={() => router.push('/hub')}
            activeOpacity={0.85}
          >
            <Text style={styles.dataBtnText}>Data Entry</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.topRight}>
          <Image
            source={require('../assets/images/lo.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.topSeparator} />

      {/* 2x4 Grid */}
      <View style={styles.gridContainer}>
        <View style={styles.column}>
          {buttons.slice(0, 4).map((b, i) => (
            <ButtonItem key={`LEFT-${i}`} label={b.label} route={b.route} />
          ))}
        </View>

        {/* Thin vertical line */}
        <View style={styles.separator} />

        <View style={styles.column}>
          {buttons.slice(4).map((b, i) => (
            <ButtonItem key={`RIGHT-${i}`} label={b.label} route={b.route} />
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>NUCLEONIX SYSTEMS PRIVATE LIMITED</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F1BE' },

  /* Top bar */
  topBar: { flexDirection: 'row', height: 80, width: '100%' },
  topLeft: {
    flex: 1,
    backgroundColor: '#d0cfcfff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  brand: { fontSize: 38, fontWeight: '700', letterSpacing: 2 },
  dataBtn: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#f6f4f4ff',
    borderWidth: 1,
    borderColor: '#cfcfcf',
    marginLeft: 30,
  },
  dataBtnText: { fontWeight: '700' },
  topRight: {
    flex: 2.5,
    backgroundColor: '#2b78c5',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  logo: { width: 70, height: 70 },
  topSeparator: { height: 2, backgroundColor: '#000', width: '100%' },

  /* Grid section */
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 130, // moved lower down
    gap: 20,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: 30, // increased gap for more vertical spacing
  },
  separator: {
    width: 1, // thinner divider
    backgroundColor: '#000',
    marginHorizontal: 8,
  },
  button: {
    width: '60%',
    height: 70,
    backgroundColor: '#808080',
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },

  footer: { alignItems: 'center', paddingVertical: 24, marginTop: 'auto' },
  footerText: { fontSize: 16, fontWeight: '800', letterSpacing: 2 },
});
