// app/efficiency_dataentry.js
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';

const TITLE = 'Efficiency Of GM Detector';
const PANEL_HEIGHT = 340;

export default function DataEntryScreen() {
  const router = useRouter();
  const contentRef = useRef(null);

  const [T, setT] = useState('');
  const [Nb, setNb] = useState('');
  const [Ns, setNs] = useState('');
  const [geomFrac, setGeomFrac] = useState('');
  const [Ag, setAg] = useState('');

  const [nnsVal, setNnsVal] = useState('');
  const [regVal, setRegVal] = useState('');
  const [egVal, setEgVal] = useState('');

  // Beta source states
  const [betaTb, setBetaTb] = useState('');
  const [betaNb, setBetaNb] = useState('');
  const [betaNs, setBetaNs] = useState('');
  const [betaAb, setBetaAb] = useState('');

  const [betaCpsVal, setBetaCpsVal] = useState('');
  const [betaDpsVal, setBetaDpsVal] = useState('');
  const [betaEbVal, setBetaEbVal] = useState('');

  // Calculate only Nns (left panel)
  const handleCalculateLeft = () => {
    const t = Number(T);
    const nb = Number(Nb);
    const ns = Number(Ns);

    if (isFinite(t) && t > 0 && isFinite(nb) && isFinite(ns)) {
      const nns = (ns - nb) / t;
      setNnsVal(isFinite(nns) ? nns.toFixed(2) : '');
    } else {
      setNnsVal('');
    }
  };

  const handleClearLeft = () => {
    setT('');
    setNb('');
    setNs('');
    setNnsVal('');
  };

  // Calculate Reg and Eg (right panel)
  const handleCalculateRight = () => {
    const g = Number(geomFrac); // this is (d² / 16D²)
    const ag = Number(Ag);      // activity A

    // 🔁 CHANGED: Reg = A × (d² / 16D²)
    let reg = NaN;
    if (isFinite(g) && g > 0 && isFinite(ag) && ag > 0) {
      reg = ag * g;
    }
    setRegVal(isFinite(reg) ? reg.toFixed(2) : '');

    // same logic as before to get Nns
    let nnsNumber = null;
    if (nnsVal !== '') {
      const parsed = Number(nnsVal);
      nnsNumber = isFinite(parsed) ? parsed : null;
    } else {
      const t = Number(T);
      const nb = Number(Nb);
      const ns = Number(Ns);
      if (isFinite(t) && t > 0 && isFinite(nb) && isFinite(ns)) {
        const temp = (ns - nb) / t;
        nnsNumber = isFinite(temp) ? temp : null;
      }
    }

    // 🔁 CHANGED: Eg = [Nns / Reg] × 100
    // (numerically same as your old formula, since Reg = Ag × geomFrac now)
    if (nnsNumber != null && isFinite(reg) && reg > 0) {
      const eg = (nnsNumber / reg) * 100;
      setEgVal(isFinite(eg) ? eg.toFixed(2) : '');
    } else {
      setEgVal('');
    }
  };

  const handleClearRight = () => {
    setGeomFrac('');
    setAg('');
    setRegVal('');
    setEgVal('');
  };

  const handleClearAll = () => {
    Alert.alert('Clear All', 'This will clear all panels. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive', onPress: () => {
          setT(''); setNb(''); setNs(''); setNnsVal('');
          setGeomFrac(''); setAg(''); setRegVal(''); setEgVal('');
          setBetaTb(''); setBetaNb(''); setBetaNs(''); setBetaCpsVal('');
          setBetaAb(''); setBetaDpsVal(''); setBetaEbVal('');
        },
      },
    ]);
  };

  // Calculate CPS and Eb for beta source (left-bottom panel)
  const handleCalculateBetaLeft = () => {
    const tb = Number(betaTb);
    const nb = Number(betaNb);
    const ns = Number(betaNs);

    if (isFinite(tb) && tb > 0 && isFinite(nb) && isFinite(ns)) {
      const cps = (ns - nb) / tb;
      setBetaCpsVal(isFinite(cps) ? cps.toFixed(2) : '');
    } else {
      setBetaCpsVal('');
    }
  };

  const handleClearBetaLeft = () => {
    setBetaTb('');
    setBetaNb('');
    setBetaNs('');
    setBetaCpsVal('');
  };

  // Calculate DPS and Eb for beta source (right-bottom panel)
  const handleCalculateBetaRight = () => {
    const ab = Number(betaAb);

    // DPS = Activity in disintegrations per second
    let dps = NaN;
    if (isFinite(ab) && ab > 0) {
      dps = ab;
    }
    setBetaDpsVal(isFinite(dps) ? dps.toFixed(2) : '');

    // Get CPS (either from input or calculate)
    let cpsNumber = null;
    if (betaCpsVal !== '') {
      const parsed = Number(betaCpsVal);
      cpsNumber = isFinite(parsed) ? parsed : null;
    } else {
      const tb = Number(betaTb);
      const nb = Number(betaNb);
      const ns = Number(betaNs);
      if (isFinite(tb) && tb > 0 && isFinite(nb) && isFinite(ns)) {
        const temp = (ns - nb) / tb;
        cpsNumber = isFinite(temp) ? temp : null;
      }
    }

    // Absolute Efficiency: Eb = [CPS / DPS] × 100
    if (cpsNumber != null && isFinite(dps) && dps > 0) {
      const eb = (cpsNumber / dps) * 100;
      setBetaEbVal(isFinite(eb) ? eb.toFixed(2) : '');
    } else {
      setBetaEbVal('');
    }
  };

  const handleClearBetaRight = () => {
    setBetaAb('');
    setBetaDpsVal('');
    setBetaEbVal('');
  };

  const saveImage = async () => {
    try {
      if (!contentRef.current) {
        Alert.alert("Error", "Content not ready for capture.");
        return;
      }

      const uri = await captureRef(contentRef.current, {
        format: 'png',
        quality: 1,
      });

      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Please allow media access to save the image.");
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('GM Lab', asset, false).catch(() => null);

      Alert.alert('Saved Successfully', 'Image saved to device gallery.');
    } catch (error) {
      console.error('SAVE ERROR:', error);
      Alert.alert('Error', `Could not save image: ${error.message || error}`);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F1BE' }} ref={contentRef} collapsable={false}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.brand} onPress={() => router.push('/')}>GM LAB</Text>
          <TouchableOpacity style={styles.dataBtn} activeOpacity={0.8} onPress={() => router.push('/hub')}>
            <Text style={styles.dataBtnText}>Data Entry</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.topRight}>
          <Image source={require('../assets/images/lo.jpeg')} style={styles.logo} resizeMode="contain" />
        </View>
      </View>
      <View style={styles.topSeparator} />

      <View style={styles.captureArea}>
        {/* Two Pane Layout */}
        <View style={[styles.content, styles.gammaContent]}>
          {/* LEFT PANEL */}
          <View style={styles.pane}>
            <View style={[styles.panel, styles.gammaPanel]}>
              <Field
                label="Enter Time (of which counts are recorded), T (s)"
                value={T}
                onChangeText={setT}
                keyboardType="numeric"
              />
              <Field
                label="Enter Background counts, Nb"
                value={Nb}
                onChangeText={setNb}
                keyboardType="numeric"
              />
              <Field
                label="Enter Counts recorded due to source, Ns"
                value={Ns}
                onChangeText={setNs}
                keyboardType="numeric"
              />
              <FieldReadOnly
                label="Net count rate recorded, Nns = (Ns − Nb) / T"
                value={nnsVal}
              />

              <View style={styles.panelButtonWrap}>
                <TouchableOpacity style={[styles.btn, styles.closeBtn]} onPress={handleCalculateLeft}>
                  <Text style={styles.btnText}>Calculate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.closeBtn]} onPress={handleClearLeft}>
                  <Text style={styles.btnText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.midGap} />

          {/* RIGHT PANEL */}
          <View style={styles.pane}>
            <View style={[styles.panel, styles.gammaPanel]}>
              <Field
                label="Enter Fraction of radiation entering the detector (d² / 16D²)"
                value={geomFrac}
                onChangeText={setGeomFrac}
                keyboardType="numeric"
              />
              <Field
                label="Enter Present day activity of source, Ag"
                value={Ag}
                onChangeText={setAg}
                keyboardType="numeric"
              />
              <FieldReadOnly
                label="Disintegrations per Second, Reg = A × (d² / 16D²)"
                value={regVal}
              />
              <FieldReadOnly
                label="Efficiency, Eg = [Nns / Reg] × 100"
                value={egVal}
              />

              <View style={styles.panelButtonWrap}>
                <TouchableOpacity style={[styles.btn, styles.closeBtn]} onPress={handleCalculateRight}>
                  <Text style={styles.btnText}>Calculate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.closeBtn]} onPress={handleClearRight}>
                  <Text style={styles.btnText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* BETA SOURCE SECTION TITLE AND PANELS */}
        <View style={{ paddingHorizontal: 14, paddingTop: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 6, color: '#000' }}>
            BETA SOURCE - Intrinsic Efficiency
          </Text>
        </View>

        {/* Two Pane Layout - BETA */}
        <View style={[styles.content, styles.betaContent]} collapsable={false}>
          {/* LEFT PANEL - BETA */}
          <View style={styles.pane}>
            <View style={[styles.panel, styles.betaPanel]}>
              <Field
                label="Enter Time (of which counts are recorded), Tb (s)"
                value={betaTb}
                onChangeText={setBetaTb}
                keyboardType="numeric"
              />
              <Field
                label="Enter Background counts, Nb"
                value={betaNb}
                onChangeText={setBetaNb}
                keyboardType="numeric"
              />
              <Field
                label="Enter Counts recorded due to source, Ns"
                value={betaNs}
                onChangeText={setBetaNs}
                keyboardType="numeric"
              />
              <FieldReadOnly
                label="Net count rate, CPS = (Ns − Nb) / Tb"
                value={betaCpsVal}
              />

              <View style={styles.panelButtonWrap}>
                <TouchableOpacity style={[styles.btn, styles.closeBtn]} onPress={handleCalculateBetaLeft}>
                  <Text style={styles.btnText}>Calculate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.closeBtn]} onPress={handleClearBetaLeft}>
                  <Text style={styles.btnText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.midGap} />

          {/* RIGHT PANEL - BETA */}
          <View style={styles.pane}>
            <View style={[styles.panel, styles.betaPanel]}>
              <Field
                label="Enter Activity of Beta source, Ab (DPS)"
                value={betaAb}
                onChangeText={setBetaAb}
                keyboardType="numeric"
              />
              <FieldReadOnly
                label="Disintegrations per Second, DPS = Ab"
                value={betaDpsVal}
              />
              <FieldReadOnly
                label="Intrinsic Efficiency, Eb = [CPS / DPS] × 100"
                value={betaEbVal}
              />

              <View style={styles.panelButtonWrap}>
                <TouchableOpacity style={[styles.btn, styles.closeBtn]} onPress={handleCalculateBetaRight}>
                  <Text style={styles.btnText}>Calculate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.closeBtn]} onPress={handleClearBetaRight}>
                  <Text style={styles.btnText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <View className="actionsRow" style={styles.actionsRow}>
          <TouchableOpacity style={[styles.btn, styles.closeBtn]} onPress={handleClearAll}>
            <Text style={styles.btnText}>Clear All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.closeBtn]} onPress={saveImage}>
            <Text style={styles.btnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.closeBtn]} onPress={() => router.push('/hub')}>
            <Text style={styles.btnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ---------- Reusable field components ---------- */
function Field({ label, value, onChangeText, keyboardType = 'default' }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={styles.input}
        placeholder=""
        placeholderTextColor="#888"
      />
    </View>
  );
}

function FieldReadOnly({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
      <TextInput
        value={value}
        editable={false}
        style={[styles.input, styles.readonly, styles.valueInput]}
      />
    </View>
  );
}

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', height: 80, width: '100%' },
  topLeft: {
    flex: 1, backgroundColor: '#d0cfcfff', flexDirection: 'row',
    alignItems: 'center', paddingHorizontal: 16, gap: 10,
  },
  brand: { fontSize: 38, fontWeight: '700', letterSpacing: 2 },
  dataBtn: {
    paddingVertical: 11, paddingHorizontal: 18, borderRadius: 10,
    backgroundColor: '#f6f4f4ff', borderWidth: 1, borderColor: '#cfcfcf', marginLeft: 30,
  },
  dataBtnText: { fontWeight: '700' },
  topRight: { flex: 2.5, backgroundColor: '#2b78c5', justifyContent: 'center', alignItems: 'flex-end', paddingRight: 20 },
  logo: { width: 70, height: 70 },
  topSeparator: { height: 2, backgroundColor: '#000', width: '100%' },

  content: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  captureArea: { paddingBottom: 4 },
  gammaContent: { flexShrink: 0 },
  betaContent: { flexShrink: 0 },
  pane: { flex: 1 },
  panelWrap: { paddingBottom: 8 },
  panel: {
    height: PANEL_HEIGHT,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#9e9e9e',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  gammaPanel: { height: 285 },
  betaPanel: { height: 268 },
  midGap: { width: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  label: { flex: 1, fontSize: 13, fontWeight: '600', color: '#000', paddingRight: 4 },
  input: {
    width: 160,
    height: 42,
    borderWidth: 1,
    borderColor: '#bdbdbd',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 9,
    fontSize: 15,
    textAlignVertical: 'center',
  },
  readonly: { backgroundColor: '#e9e9e9', color: '#000' },
  valueInput: { textAlign: 'center', fontWeight: '700' },
  panelButtonWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 6,
    flexDirection: 'row',
    gap: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    paddingTop: 8,
    paddingBottom: 8,
    marginTop: 0,
  },
  btn: { paddingVertical: 7, paddingHorizontal: 16, borderRadius: 9 },
  closeBtn: { backgroundColor: '#808080' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});