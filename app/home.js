// app/home.js
import React from 'react';
import { useRouter } from 'expo-router';
import {
  Text,
  View,
  Pressable,
  StyleSheet,
  Image,
} from 'react-native';

export default function Page() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      {/* ───────── Top Bar ───────── */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.brand}>GM LAB</Text>

          <Pressable
            style={styles.dataBtn}
            onPress={() => router.push('/hub')}
            android_ripple={{ color: '#d8d8d8' }}
          >
            <Text style={styles.dataBtnText}>Data Entry</Text>
          </Pressable>
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

      {/* ───────── Main Content ───────── */}
      <View style={styles.content}>
        {/* Title + Banner */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>EXPERIMENTS WITH G.M COUNTER</Text>

          <View style={styles.bannerWrapper}>
            <Image
              source={require('../assets/images/h.jpeg')}
              style={styles.bannerImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Single CTA */}
        <View style={styles.ctaWrap}>
          <Pressable
            style={styles.selectBtn}
            onPress={() => router.push('/experiment-selection')}
            android_ripple={{ color: '#9c9c9c' }}
          >
            <Text style={styles.selectBtnText}>Select Experiment</Text>
          </Pressable>
        </View>
      </View>

      {/* ───────── Footer ───────── */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>NUCLEONIX SYSTEMS PRIVATE LIMITED</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F1BE' },

  /* ───────── Top bar ───────── */
  topBar: { flexDirection: 'row', height: 80, width: '100%' },
  topLeft: {
    flex: 1,
    backgroundColor: '#d0cfcfff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  brand: {
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#000',
    fontFamily: 'sans-serif',
  },
  dataBtn: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#f6f4f4ff',
    borderWidth: 1,
    borderColor: '#cfcfcf',
    marginLeft: 30,
  },
  dataBtnText: { fontWeight: '700', color: '#111', fontFamily: 'sans-serif' },
  topRight: {
    flex: 2.5,
    backgroundColor: '#2b78c5',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  logo: { width: 70, height: 70 },
  topSeparator: { height: 2, backgroundColor: '#000', width: '100%' },

  /* ───────── Main content ───────── */
  content: { flex: 1, justifyContent: 'flex-start' },

  /* ───────── Header section ───────── */
  headerSection: { paddingTop: 14, alignItems: 'center' },
  headerTitle: {
    width: '96%',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: '#000',
    fontFamily: 'sans-serif',
  },
  bannerWrapper: {
    width: '64%',
    maxWidth: 700,
    height: 390,
    borderWidth: 2,
    borderColor: '#000',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerImage: { width: '100%', height: '100%' },

  /* ───────── CTA button ───────── */
  ctaWrap: { alignItems: 'center', zIndex: 100, elevation: 12, marginBottom: 10 },
  selectBtn: {
    backgroundColor: '#808080',
    paddingVertical: 14,
    paddingHorizontal: 34,
    borderRadius: 999,
    zIndex: 100,
    elevation: 12,
  },
  selectBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 22,
    fontFamily: 'sans-serif-medium',
  },

  /* ───────── Footer ───────── */
  footer: { alignItems: 'center', paddingVertical: 12, pointerEvents: 'none' },
  footerText: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#000',
    fontFamily: 'sans-serif',
  },
});
