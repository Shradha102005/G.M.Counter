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
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import * as XLSX from 'xlsx';

const TITLE = 'Efficiency Of GM Detector';
const PANEL_HEIGHT = 340;

// ── Excel helpers ──────────────────────────────────────────────────────────
const normalizeHeader = (value) =>
  (value ?? '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Scan the sheet for a header row that contains a "time" column AND/OR
 * a "counts" column.  Returns { headerRowIndex, timeIndex, countIndex }.
 * Either timeIndex or countIndex may be -1 if not found.
 */
const findColumns = (sheetRows) => {
  for (let rowIndex = 0; rowIndex < sheetRows.length; rowIndex += 1) {
    const row = sheetRows[rowIndex] || [];
    let timeIndex = -1;
    let countIndex = -1;

    row.forEach((cell, cellIndex) => {
      const h = normalizeHeader(cell);
      if (timeIndex === -1 && (h === 'time' || h === 'presettime' || h === 'presettimes' || h === 'preset' || h === 't' || h === 'ts')) {
        timeIndex = cellIndex;
      }
      if (
        countIndex === -1 &&
        (h === 'count' || h === 'counts' || h === 'countreading' || h === 'n' || h === 'npreset')
      ) {
        countIndex = cellIndex;
      }
    });

    if (timeIndex !== -1 || countIndex !== -1) {
      return { headerRowIndex: rowIndex, timeIndex, countIndex };
    }
  }
  return null;
};

const formatCell = (value) =>
  value === null || value === undefined ? '' : value.toString().trim();

/**
 * Open an Excel file and extract values from the first two data rows.
 * Returns { row1Time, row1Count, row2Count } – any may be '' if not found.
 */
const pickExcelValues = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled) return null;

  const asset = result.assets?.[0];
  if (!asset) {
    Alert.alert('Import Error', 'Could not read the selected Excel file.');
    return null;
  }

  const workbookFile = new File(asset);
  const base64 = await workbookFile.base64();
  const workbook = XLSX.read(base64, { type: 'base64' });
  const sheetName = workbook.SheetNames?.[0];

  if (!sheetName) {
    Alert.alert('Import Error', 'The workbook does not contain any sheets.');
    return null;
  }

  const sheet = workbook.Sheets[sheetName];
  const sheetRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const mapping = findColumns(sheetRows);

  if (!mapping) {
    Alert.alert(
      'Import Error',
      'Could not find a Time / Counts column in the selected sheet.'
    );
    return null;
  }

  const dataRows = sheetRows
    .slice(mapping.headerRowIndex + 1)
    .filter((row) => (row || []).some((cell) => formatCell(cell) !== ''));

  const row1 = dataRows[0] || [];
  const row2 = dataRows[1] || [];

  return {
    row1Time: mapping.timeIndex !== -1 ? formatCell(row1[mapping.timeIndex]) : '',
    row1Count: mapping.countIndex !== -1 ? formatCell(row1[mapping.countIndex]) : '',
    row2Count: mapping.countIndex !== -1 ? formatCell(row2[mapping.countIndex]) : '',
  };
};

export default function DataEntryScreen() {
  const router = useRouter();
  const contentRef = useRef(null);

  // ── Gamma left-panel state ────────────────────────────────────────────────
  const [T, setT] = useState('');
  const [Nb, setNb] = useState('');
  const [Ns, setNs] = useState('');
  const [nnsVal, setNnsVal] = useState('');

  // ── Gamma right-panel state (eta / fraction) ──────────────────────────────
  const [geomFrac, setGeomFrac] = useState('');
  const [Ag, setAg] = useState('');
  const [regVal, setRegVal] = useState('');
  const [egVal, setEgVal] = useState('');

  // ── Beta left-panel state ─────────────────────────────────────────────────
  const [betaTb, setBetaTb] = useState('');
  const [betaNb, setBetaNb] = useState('');
  const [betaNs, setBetaNs] = useState('');
  const [betaCpsVal, setBetaCpsVal] = useState('');

  // ── Beta right-panel state ────────────────────────────────────────────────
  const [betaAb, setBetaAb] = useState('');
  const [betaDpsVal, setBetaDpsVal] = useState('');
  const [betaEbVal, setBetaEbVal] = useState('');

  // ── Excel imports ─────────────────────────────────────────────────────────

  /** Upload Excel for the GAMMA measurement panel */
  const importGammaExcel = async () => {
    try {
      const vals = await pickExcelValues();
      if (!vals) return;

      // Row 1 → preset time (T) + background counts (Nb)
      if (vals.row1Time) setT(vals.row1Time);
      if (vals.row1Count) setNb(vals.row1Count);
      // Row 2 → source counts (Ns)
      if (vals.row2Count) setNs(vals.row2Count);

      Alert.alert('Gamma Import', 'Time, background counts, and source counts loaded from Excel.');
    } catch (error) {
      console.error('Gamma Excel import error:', error);
      Alert.alert('Import Error', `Could not import: ${error.message || error}`);
    }
  };

  /** Upload Excel for the BETA measurement panel */
  const importBetaExcel = async () => {
    try {
      const vals = await pickExcelValues();
      if (!vals) return;

      // Row 1 → preset time (Tb) + background counts (betaNb)
      if (vals.row1Time) setBetaTb(vals.row1Time);
      if (vals.row1Count) setBetaNb(vals.row1Count);
      // Row 2 → source counts (betaNs)
      if (vals.row2Count) setBetaNs(vals.row2Count);

      Alert.alert('Beta Import', 'Time, background counts, and source counts loaded from Excel.');
    } catch (error) {
      console.error('Beta Excel import error:', error);
      Alert.alert('Import Error', `Could not import: ${error.message || error}`);
    }
  };


  // ── Calculations ──────────────────────────────────────────────────────────

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
    setT(''); setNb(''); setNs(''); setNnsVal('');
  };

  const handleCalculateRight = () => {
    const g = Number(geomFrac);
    const ag = Number(Ag);

    let reg = NaN;
    if (isFinite(g) && g > 0 && isFinite(ag) && ag > 0) {
      reg = ag * g;
    }
    setRegVal(isFinite(reg) ? reg.toFixed(2) : '');

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

    if (nnsNumber != null && isFinite(reg) && reg > 0) {
      const eg = (nnsNumber / reg) * 100;
      setEgVal(isFinite(eg) ? eg.toFixed(2) : '');
    } else {
      setEgVal('');
    }
  };

  const handleClearRight = () => {
    setGeomFrac(''); setAg(''); setRegVal(''); setEgVal('');
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
    setBetaTb(''); setBetaNb(''); setBetaNs(''); setBetaCpsVal('');
  };

  const handleCalculateBetaRight = () => {
    const ab = Number(betaAb);

    let dps = NaN;
    if (isFinite(ab) && ab > 0) dps = ab;
    setBetaDpsVal(isFinite(dps) ? dps.toFixed(2) : '');

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

    if (cpsNumber != null && isFinite(dps) && dps > 0) {
      const eb = (cpsNumber / dps) * 100;
      setBetaEbVal(isFinite(eb) ? eb.toFixed(2) : '');
    } else {
      setBetaEbVal('');
    }
  };

  const handleClearBetaRight = () => {
    setBetaAb(''); setBetaDpsVal(''); setBetaEbVal('');
  };

  const saveImage = async () => {
    try {
      if (!contentRef.current) {
        Alert.alert('Error', 'Content not ready for capture.');
        return;
      }

      const uri = await captureRef(contentRef.current, {
        format: 'png',
        quality: 1,
      });

      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow media access to save the image.');
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
        {/* ── GAMMA SOURCE SECTION ─────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>GAMMA SOURCE - Intrinsic Efficiency</Text>
        </View>

        <View style={[styles.content, styles.gammaContent]}>
          {/* LEFT PANEL – Gamma measurements */}
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
                <TouchableOpacity style={[styles.btn, styles.closeBtn]} onPress={importGammaExcel}>
                  <Text style={styles.btnText}>Upload Excel</Text>
                </TouchableOpacity>
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

          {/* RIGHT PANEL – Gamma eta / efficiency */}
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

        {/* ── BETA SOURCE SECTION ──────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>BETA SOURCE - Intrinsic Efficiency</Text>
        </View>

        <View style={[styles.content, styles.betaContent]} collapsable={false}>
          {/* LEFT PANEL – Beta measurements */}
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
                <TouchableOpacity style={[styles.btn, styles.closeBtn]} onPress={importBetaExcel}>
                  <Text style={styles.btnText}>Upload Excel</Text>
                </TouchableOpacity>
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

          {/* RIGHT PANEL – Beta eta / efficiency */}
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

        {/* ── Bottom action row ─────────────────────────────────────────── */}
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

  sectionHeader: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },

  content: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  captureArea: { paddingBottom: 4 },
  gammaContent: { flexShrink: 0 },
  betaContent: { flexShrink: 0 },
  pane: { flex: 1 },
  panel: {
    height: PANEL_HEIGHT,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#9e9e9e',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  gammaPanel: { height: 268 },
  betaPanel: { height: 258 },
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
    flexWrap: 'wrap',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    paddingTop: 8,
    paddingBottom: 8,
    marginTop: 0,
  },
  btn: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 9 },
  closeBtn: { backgroundColor: '#808080' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});