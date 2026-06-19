// app/screen6_dataentry.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as XLSX from 'xlsx';




const BOX_HEIGHT = 440;

const normalizeHeader = (value) =>
  (value ?? '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const findCountColumn = (rows) => {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] || [];
    let countIndex = -1;

    row.forEach((cell, cellIndex) => {
      const header = normalizeHeader(cell);
      if (countIndex === -1 && (header === 'count' || header === 'counts' || header === 'ni' || header === 'n')) {
        countIndex = cellIndex;
      }
    });

    if (countIndex !== -1) {
      return { headerRowIndex: rowIndex, countIndex };
    }
  }

  return null;
};

const formatCellText = (value) => {
  if (value === null || value === undefined) return '';
  return value.toString().trim();
};

// Default rows (10 rows initially, add more with Add Row button)
const initialRows = Array.from({ length: 10 }).map((_, i) => [
  String(i + 1),
  '',
  '',
  '',
  '',
]);

export default function Screen6DataEntry() {
  const router = useRouter();
  const contentRef = useRef(null);

  const [rows, setRows] = useState(initialRows);

  // Source selector + rename modal
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false);
  const [source1Name, setSource1Name] = useState('SOURCE1');
  const [source2Name, setSource2Name] = useState('SOURCE2');
  const [selectedSource, setSelectedSource] = useState('s1');

  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [pendingSourceKey, setPendingSourceKey] = useState(null);
  const [tempName, setTempName] = useState('');

  // BG (background) value displayed on top of table (used to compute Net Counts)
  const [bgCps, setBgCps] = useState('');
  // Preset time moved to top (single value)
  const [presetTime, setPresetTime] = useState('');

  const [graphBoxWidth, setGraphBoxWidth] = useState(0);

  const openNamePrompt = (key) => {
    setPendingSourceKey(key);
    setTempName(key === 's1' ? source1Name : source2Name);
    setNameModalVisible(true);
  };
  const confirmNamePrompt = () => {
    if (!pendingSourceKey) return;
    const cleaned = (tempName || '').trim() || (pendingSourceKey === 's1' ? 'SOURCE1' : 'SOURCE2');
    if (pendingSourceKey === 's1') setSource1Name(cleaned);
    else setSource2Name(cleaned);
    setSelectedSource(pendingSourceKey);
    setNameModalVisible(false);
  };

  // keep t1 and t2 in state for rightComputed (user didn't ask to remove)
  const [t1, setT1] = useState('');
  const [t2, setT2] = useState('');
  const [e0, setE0] = useState(''); // E0 still present

  const importExcelFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset) {
        Alert.alert('Import Error', 'Could not read the selected Excel file.');
        return;
      }

      const workbookFile = new File(asset);
      const base64 = await workbookFile.base64();
      const workbook = XLSX.read(base64, { type: 'base64' });
      const sheetName = workbook.SheetNames?.[0];

      if (!sheetName) {
        Alert.alert('Import Error', 'The workbook does not contain any sheets.');
        return;
      }

      const sheet = workbook.Sheets[sheetName];
      const sheetRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      const mapping = findCountColumn(sheetRows);

      if (!mapping) {
        Alert.alert('Import Error', 'Could not find a Count / Counts column in the selected sheet.');
        return;
      }

      const importedCounts = sheetRows
        .slice(mapping.headerRowIndex + 1)
        .filter((row) => (row || []).some((cell) => formatCellText(cell) !== ''))
        .map((row) => formatCellText(row[mapping.countIndex]))
        .filter((value) => value !== '');

      if (!importedCounts.length) {
        Alert.alert('Import Error', 'No count values were found below the header row.');
        return;
      }

      setRows((prev) => {
        const next = importedCounts.map((count, index) => {
          const bg = parseFloat(bgCps) || 0;
          const parsedCount = parseFloat(count);
          return [
            String(index + 1),
            '',
            '',
            count,
            Number.isFinite(parsedCount) ? String(parsedCount - bg) : '',
          ];
        });

        return next.length ? next : prev;
      });

      Alert.alert('Import Complete', `Loaded ${importedCounts.length} count value(s) from ${asset.name || 'the Excel file'}.`);
    } catch (error) {
      console.error('Excel import error:', error);
      Alert.alert('Import Error', `Could not import the Excel file: ${error.message || error}`);
    }
  };

  // ---- Update a cell
  // Column indices now:
  // 1 = Thickness (mm), 2 = Areal Density, 3 = Counts, 4 = Net Counts (auto)
  const updateCell = (text, rIdx, cIdx) => {
    setRows(prev => {
      const next = prev.map(r => [...r]);
      next[rIdx][cIdx] = text;

      // If Counts changed (col 3) → recompute Net Counts (col 4) using background (bgCps)
      if (cIdx === 3) {
        const counts = parseFloat(next[rIdx][3]);
        const bg = parseFloat(bgCps) || 0;
        if (isFinite(counts)) {
          // Net counts = counts - background (as requested)
          next[rIdx][4] = (counts - bg).toString();
        } else {
          next[rIdx][4] = '';
        }
      }

      return next;
    });
  };

  // When BG changes, refresh Net Counts for all rows (auto)
  useEffect(() => {
    setRows(prev => {
      const next = prev.map(r => [...r]);
      const bg = parseFloat(bgCps) || 0;
      for (let i = 0; i < next.length; i++) {
        const counts = parseFloat(next[i][3]);
        if (isFinite(counts)) {
          next[i][4] = (counts - bg).toString();
        } else {
          next[i][4] = '';
        }
      }
      return next;
    });
  }, [bgCps]);

  const addRow = () => {
    setRows(prev => [...prev, [String(prev.length + 1), '', '', '', '']]);
  };
  const deleteRow = () => {
    setRows(prev => {
      if (prev.length <= 1) return prev;
      const trimmed = prev.slice(0, -1).map((r, i) => {
        const c = [...r];
        c[0] = String(i + 1);
        return c;
      });
      return trimmed;
    });
  };

  const clearData = () => {
    Alert.alert('Clear All Data', 'This will reset all rows. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive', onPress: () => {
          setRows(initialRows);
          setBgCps('');
          setPresetTime('');
          setT1('');
          setT2('');
          setE0('');
        },
      },
    ]);
  };

  const saveImage = async () => {
    try {
      if (!contentRef.current) {
        Alert.alert("Error", "Content not ready for capture.");
        return;
      }

      const uri = await captureRef(contentRef.current, { format: 'png', quality: 1 });

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

  const closeToHub = () => router.push('/hub');

  // Graph: Absorber Thickness (mm) vs Net Counts
  // Build pts array with numeric x (thickness mm) and numeric y (net counts).
  // Include only rows that have both thickness and net counts non-empty and valid numbers.
  const graphData = useMemo(() => {
    const pts = rows
      .map(r => {
        const rawX = (r[1] || '').toString().trim();
        const rawY = (r[4] || '').toString().trim();
        if (rawX === '' || rawY === '') return null;
        const x = parseFloat(rawX);
        const y = parseFloat(rawY);
        if (!isFinite(x) || !isFinite(y)) return null;
        return { x, y };
      })
      .filter(p => p !== null)
      .sort((a, b) => a.x - b.x);

    return {
      labels: pts.map(p => p.x.toString()),
      values: pts.map(p => p.y),
      pts,
    };
  }, [rows]);

  // Safeguard: ensure all values are finite before rendering
  const safeGraphData = useMemo(() => {
    const validIndices = graphData.values
      .map((v, i) => Number.isFinite(v) ? i : -1)
      .filter(i => i >= 0);
    
    if (validIndices.length === 0) {
      return { labels: [], values: [], pts: [] };
    }
    
    return {
      labels: validIndices.map(i => graphData.labels[i]),
      values: validIndices.map(i => graphData.values[i]),
      pts: validIndices.map(i => graphData.pts[i]),
    };
  }, [graphData]);

  // RIGHT computed outputs (Experiment 6 formulae)
  const rightComputed = useMemo(() => {
    const T1 = parseFloat(t1);
    const T2 = parseFloat(t2);
    const E0 = parseFloat(e0);

    if (!Number.isFinite(E0) || !Number.isFinite(T1) || !Number.isFinite(T2) || T1 <= 0) {
      return { r1: '', r2: '', e2: '' };
    }

    // Eq(1): R1 = (0.52*E0 - 0.09) g/cm²
    const r1 = (0.52 * E0) - 0.09;
    // Eq(2): t1/2(first) / t1/2(second) = R1 / R2  =>  R2 = R1 * t2 / t1
    const r2 = r1 * (T2 / T1);
    // End-point energy for second source: E2 = (R2 + 0.09)/0.52
    const e2 = (r2 + 0.09) / 0.52;

    return {
      r1: r1.toFixed(5),
      r2: r2.toFixed(5),
      e2: e2.toFixed(3),
    };
  }, [e0, t1, t2]);

  const chartWidth = Math.max(240, graphBoxWidth - 24);
  const chartHeight = BOX_HEIGHT - 24;

  return (
    <View style={styles.screen} ref={contentRef} collapsable={false}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.brand}>GM LAB</Text>
          <TouchableOpacity style={styles.dataBtn} onPress={() => router.push('/hub')}>
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

      {/* Capture region */}
      <View style={styles.content}>
        {/* LEFT */}
        <View style={styles.leftPane}>
          {/* Controls row: Source, Background, Preset Time - FORCED TO ONE LINE */}
          <View style={styles.controlsTopRow}>
            <View style={styles.sourceWrap}>
              <Text style={styles.ctrlLabel}>Source</Text>
              <View style={styles.dropdown}>
                <TouchableOpacity
                  style={styles.dropdownBtn}
                  onPress={() => setSourceMenuOpen(o => !o)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dropdownText}>
                    {selectedSource === 's2' ? source2Name : source1Name}
                  </Text>
                </TouchableOpacity>
                {sourceMenuOpen && (
                  <View style={styles.dropdownMenu}>
                    <Pressable
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSourceMenuOpen(false);
                        openNamePrompt('s1');
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{source1Name}</Text>
                    </Pressable>
                    <Pressable
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSourceMenuOpen(false);
                        openNamePrompt('s2');
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{source2Name}</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.bgWrap}>
              <Text style={styles.ctrlLabel}>Background</Text>
              <TextInput
                style={styles.bgInput}
                keyboardType="numeric"
                value={bgCps}
                onChangeText={setBgCps}
                placeholder=""
              />
            </View>

            {/* Preset Time moved to top as single value input */}
            <View style={styles.bgWrap}>
              <Text style={styles.ctrlLabel}>Preset Time (s)</Text>
              <TextInput
                style={styles.bgInput}
                keyboardType="numeric"
                value={presetTime}
                onChangeText={setPresetTime}
                placeholder=""
              />
            </View>
          </View>

          {/* Table */}
          <View style={[styles.tableBox, { height: BOX_HEIGHT }]}>
            {/* Fixed Header Row */}
            <View style={[styles.row, styles.headRow]}>
              <Text style={[styles.cell, styles.headCell, styles.cellSno]}>S.No.</Text>
              <Text style={[styles.cell, styles.headCell, styles.cellData]}>Absorber Thickness (mm)</Text>
              <Text style={[styles.cell, styles.headCell, styles.cellData]}>Areal Density (mg/cm²)</Text>
              <Text style={[styles.cell, styles.headCell, styles.cellData]}>Counts</Text>
              <Text style={[styles.cell, styles.headCell, styles.cellData]}>Net Counts (auto)</Text>
            </View>

            {/* Scrollable Data Rows */}
            <ScrollView
              showsVerticalScrollIndicator={true}
              style={{ flex: 1 }}
            >
              {rows.map((r, rIdx) => (
                <View key={`r-${rIdx}`} style={styles.row}>
                  {/* S.No. */}
                  <Text style={[styles.cell, styles.readOnly, styles.cellSno]}>{r[0]}</Text>

                  {/* Thickness (mm) */}
                  <TextInput
                    style={[styles.inputCell, styles.cellData]}
                    keyboardType="numeric"
                    value={rows[rIdx][1]}
                    onChangeText={t => updateCell(t, rIdx, 1)}
                  />
                  {/* Areal Density (mg/cm²) */}
                  <TextInput
                    style={[styles.inputCell, styles.cellData]}
                    keyboardType="numeric"
                    value={rows[rIdx][2]}
                    onChangeText={t => updateCell(t, rIdx, 2)}
                  />
                  {/* Counts */}
                  <TextInput
                    style={[styles.inputCell, styles.cellData]}
                    keyboardType="numeric"
                    value={rows[rIdx][3]}
                    onChangeText={t => updateCell(t, rIdx, 3)}
                  />
                  {/* Net Counts (auto) */}
                  <TextInput
                    style={[styles.inputCell, styles.readOnly, styles.cellData]}
                    keyboardType="numeric"
                    value={rows[rIdx][4]}
                    editable={false}
                  />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* LEFT — inputs for Exp 6 formulae */}
          <View style={styles.computePanelLeft}>
            <View style={styles.compRow}>
              <Text style={styles.compLabel}>E₀ (MeV) - Source 1</Text>
              <TextInput
                style={styles.compInput}
                keyboardType="numeric"
                value={e0}
                onChangeText={setE0}
              />
            </View>
            <View style={styles.compRow}>
              <Text style={styles.compLabel}>t₁/₂ - Source 1</Text>
              <TextInput
                style={styles.compInput}
                keyboardType="numeric"
                value={t1}
                onChangeText={setT1}
              />
            </View>
            <View style={styles.compRow}>
              <Text style={styles.compLabel}>t₁/₂ - Source 2</Text>
              <TextInput
                style={styles.compInput}
                keyboardType="numeric"
                value={t2}
                onChangeText={setT2}
              />
            </View>
          </View>

          {/* Bottom buttons */}
          <View style={styles.bottomBtnRow}>
            <TouchableOpacity style={styles.bigBtn} onPress={importExcelFile}>
              <Text style={styles.bigBtnText}>Upload Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bigBtn} onPress={addRow}>
              <Text style={styles.bigBtnText}>Add Row</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bigBtn} onPress={deleteRow}>
              <Text style={styles.bigBtnText}>Delete Row</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bigBtn} onPress={clearData}>
              <Text style={styles.bigBtnText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bigBtn} onPress={saveImage}>
              <Text style={styles.bigBtnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bigBtn} onPress={closeToHub}>
              <Text style={styles.bigBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RIGHT — graph + computed outputs */}
        <View style={styles.rightPane}>
          <Text style={styles.graphTitle}>Graph — Net Counts vs Absorber Thickness (mm)</Text>
          <View
            style={[styles.graphBox, { height: BOX_HEIGHT }]}
            onLayout={e => setGraphBoxWidth(e.nativeEvent.layout.width)}
          >
            {/* Wrap chart so we can absolutely position axis labels without changing layout */}
            <View style={{ width: '100%', height: '100%', position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
              {safeGraphData.values.length === 0 ? (
                <Text>Enter data to view graph (Thickness vs Net Counts)</Text>
              ) : (
                // Single visible line with dots — underlying extra lines removed.
                <LineChart
                  data={{
                    labels: safeGraphData.labels,
                    datasets: [
                      {
                        data: safeGraphData.values,
                        strokeWidth: 2.5,
                      },
                    ],
                  }}
                  width={chartWidth}
                  height={chartHeight}
                  chartConfig={{
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 2,
                    color: () => '#000',
                    labelColor: () => '#000',
                    propsForBackgroundLines: { strokeDasharray: '' },
                    propsForDots: { r: '4', strokeWidth: '1', stroke: '#000', fill: '#000' },
                  }}
                  fromZero
                  withInnerLines
                  withOuterLines
                  bezier={false}
                  style={{ alignSelf: 'center' }}
                  withDots={true}
                />
              )}

              {/* Y-axis label (rotated) near left side of chart */}
              <Text style={styles.yAxisLabel}>counts</Text>

              {/* X-axis label centered below chart */}
              <Text style={styles.xAxisLabel}>thickness (mm)</Text>
            </View>
          </View>

          {/* RIGHT — read-only computed outputs */}
          <View style={styles.computePanelRight}>
            <View style={styles.compRow}>
              <Text style={styles.compLabel}>R₁ = (0.52E₀ - 0.09) g/cm²</Text>
              <TextInput
                style={[styles.compOutput, styles.shaded]}
                editable={false}
                value={rightComputed.r1 || '—'}
              />
            </View>
            <View style={styles.compRow}>
              <Text style={styles.compLabel}>R₂ = R₁ × (t1/2 source2 / t1/2 source1) g/cm²</Text>
              <TextInput
                style={[styles.compOutput, styles.shaded]}
                editable={false}
                value={rightComputed.r2 || '—'}
              />
            </View>
            <View style={styles.compRow}>
              <Text style={styles.compLabel}>E₂ (MeV)</Text>
              <TextInput
                style={[styles.compOutput, styles.shaded]}
                editable={false}
                value={rightComputed.e2 || '—'}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Rename Source modal */}
      <Modal
        visible={nameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNameModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Please enter source name</Text>
            <TextInput
              style={styles.modalInput}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Source name"
            />
            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#ccc' }]}
                onPress={() => setNameModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#2b78c5' }]}
                onPress={confirmNamePrompt}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F1BE' },

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

  content: { flex: 1, flexDirection: 'row' },

  /* LEFT */
  leftPane: { width: '46%', padding: 12, backgroundColor: '#F7F1BE' },

  controlsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    zIndex: 5,
    justifyContent: 'flex-start',
  },
  sourceWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ctrlLabel: { fontWeight: '800', fontSize: 13 },

  dropdown: { position: 'relative', zIndex: 10 },
  dropdownBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbb',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    minWidth: 100,
  },
  dropdownText: { fontSize: 13, fontWeight: '700' },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    left: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    overflow: 'hidden',
    zIndex: 9999,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  dropdownItem: { paddingVertical: 8, paddingHorizontal: 10 },
  dropdownItemText: { fontSize: 13 },

  bgWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bgInput: {
    width: 75,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbb',
    paddingVertical: 6,
    paddingHorizontal: 4,
    textAlign: 'center',
    borderRadius: 6,
    fontSize: 12,
  },

  tableBox: {
    borderWidth: 1,
    borderColor: '#bbb',
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 0,
    marginBottom: 10,
    zIndex: 1,
  },

  row: { flexDirection: 'row', width: '100%' },
  headRow: { backgroundColor: '#a6a6a6' },

  cell: {
    width: '22%',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 11,
  },
  cellSno: { width: '12%' },
  cellData: { width: '22%' },
  headCell: { fontSize: 12.5 },
  inputCell: {
    width: '22%',
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    textAlign: 'center',
    backgroundColor: '#fff',
    fontSize: 11,
  },
  readOnly: { backgroundColor: '#eee' },

  computePanelLeft: {
    borderWidth: 1,
    borderColor: '#bbb',
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 12,
    gap: 8,
    marginBottom: 4,
  },

  bottomBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 0,
    flexWrap: 'wrap',
  },
  bigBtn: {
    backgroundColor: '#808080',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  bigBtnText: { fontWeight: '800', color: '#fff', fontSize: 15 },

  /* RIGHT */
  rightPane: { width: '54%', padding: 12, backgroundColor: '#F7F1BE' },
  graphTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  graphBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    zIndex: 0,
  },

  // AXIS LABEL STYLES
  yAxisLabel: {
    position: 'absolute',
    left: 6,
    top: '50%',
    transform: [{ rotate: '-90deg' }, { translateY: -10 }],
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
  xAxisLabel: {
    position: 'absolute',
    bottom: 6,
    left: '50%',
    transform: [{ translateX: -50 }],
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },

  computePanelRight: {
    borderWidth: 1,
    borderColor: '#bbb',
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 12,
    gap: 8,
  },

  compRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  compLabel: { width: 200, fontWeight: '700' },
  compInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbb',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    textAlign: 'center',
  },
  compOutput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontWeight: '700',
  },
  shaded: { backgroundColor: '#f0f0f0' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    gap: 10,
  },
  modalTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  modalRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 6 },
  modalBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  modalBtnText: { fontWeight: '800' },
});
