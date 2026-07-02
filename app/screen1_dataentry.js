// app/screen1_dataentry.js
import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as XLSX from 'xlsx';

const BOX_HEIGHT = 440;

const parseNumericInput = (value) => {
  const text = (value ?? '').toString().trim();
  if (!text) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
};

const normalizeHeader = (value) => (value ?? '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const findImportColumns = (rows) => {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] || [];
    let ehtIndex = -1;
    let countIndex = -1;
    let backgroundIndex = -1;
    let timeIndex = -1;

    row.forEach((cell, cellIndex) => {
      const header = normalizeHeader(cell);

      if (ehtIndex === -1 && (header === 'hv' || header === 'eht' || header.includes('hv'))) {
        ehtIndex = cellIndex;
      }

      if (countIndex === -1 && (header === 'count' || header === 'counts' || header === 'countreading' || header === 'readingcount')) {
        countIndex = cellIndex;
      }

      if (backgroundIndex === -1 && (header === 'background' || header === 'bg' || header === 'bkg')) {
        backgroundIndex = cellIndex;
      }

      if (timeIndex === -1 && (header === 'time' || header === 'presettime' || header === 'presettimes' || header === 'preset' || header === 't' || header === 'ts' || header.startsWith('presettime'))) {
        timeIndex = cellIndex;
      }
    });

    if (ehtIndex !== -1 && countIndex !== -1) {
      return { headerRowIndex: rowIndex, ehtIndex, countIndex, backgroundIndex, timeIndex };
    }
  }

  return null;
};

const formatCellText = (value) => {
  if (value === null || value === undefined) return '';
  return value.toString().trim();
};

const buildRowsFromImportedSheet = (sheetRows, mapping) => {
  const dataRows = sheetRows.slice(mapping.headerRowIndex + 1).filter((row) => {
    const cells = row || [];
    return cells.some((cell) => formatCellText(cell) !== '');
  });

  if (dataRows.length === 0) {
    return { rows: [], presetTimeValue: '' };
  }

  // ── Experiment-1 new logic ──────────────────────────────────────────────
  // • Process data rows in pairs (i = 0, 2, 4...)
  // • Odd rows (index i) provide the alternative EHT and the Background counts.
  // • Even rows (index i+1) provide the Counts.
  // ────────────────────────────────────────────────────────────────────────────

  const nextRows = [];
  
  for (let i = 0; i < dataRows.length - 1; i += 2) {
    const bgRow = dataRows[i];      // Odd row (0, 2, 4...)
    const countRow = dataRows[i + 1]; // Even row (1, 3, 5...)

    // EHT from alternative HV rows (the odd row)
    const eht = formatCellText(bgRow[mapping.ehtIndex]);

    // Background from odd row counts column
    const bgCountStr = formatCellText(bgRow[mapping.countIndex]);
    const bgCountValue = parseNumericInput(bgCountStr) || 0;

    // Counts from even row counts column
    const countStr = formatCellText(countRow[mapping.countIndex]);
    const countValue = parseNumericInput(countStr);

    const corrected = countValue !== null ? String(countValue - bgCountValue) : '';

    nextRows.push([
      String(nextRows.length + 1),
      eht,
      countStr,
      String(bgCountValue),
      corrected
    ]);
  }

  // Extract preset time from the first data row if a time column exists
  const presetTimeValue =
    mapping.timeIndex >= 0 && dataRows.length > 0
      ? formatCellText(dataRows[0][mapping.timeIndex])
      : '';

  return { rows: nextRows, presetTimeValue };
};

// Default rows (10 rows initially, add more with Add Row button)
const initialRows = Array.from({ length: 10 }).map((_, i) => [
  String(i + 1),
  '',
  '',
  '',
  ''
]);

export default function Screen1DataEntry() {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [, setAutoCorrected] = useState(initialRows.map(() => true));
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('');
  const [presetTime, setPresetTime] = useState('');

  // IMPORTANT FIX: collapsable={false} + valid ref
  const contentRef = useRef(null);

  const [graphBoxWidth, setGraphBoxWidth] = useState(0);

  // Update table
  const updateCell = (text, rIdx, cIdx) => {
    setRows(prev => {
      const next = prev.map(r => [...r]);
      next[rIdx][cIdx] = text;

      if (cIdx === 4) {
        setAutoCorrected(a => {
          const copy = [...a];
          copy[rIdx] = text.trim() === '' ? true : false;
          return copy;
        });
      }

      if ((cIdx === 2 || cIdx === 3)) {
        setAutoCorrected(a => {
          const copy = [...a];
          if (copy[rIdx]) {
            const n = parseInt(next[rIdx][2]) || 0;
            const b = parseInt(next[rIdx][3]) || 0;
            const corrected = n - b;
            next[rIdx][4] = corrected.toString();
          }
          return copy;
        });
      }

      return next;
    });
  };

  const addRow = () => {
    setRows(prev => [...prev, [String(prev.length + 1), '', '', '', '']]);
    setAutoCorrected(prev => [...prev, true]);
  };

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
      if (!asset?.uri) {
        Alert.alert('Import Error', 'Could not read the selected Excel file.');
        return;
      }

      const base64 = await new File(asset).base64();

      const workbook = XLSX.read(base64, { type: 'base64' });
      const sheetName = workbook.SheetNames?.[0];
      if (!sheetName) {
        Alert.alert('Import Error', 'The workbook does not contain any sheets.');
        return;
      }

      const sheet = workbook.Sheets[sheetName];
      const sheetRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      const mapping = findImportColumns(sheetRows);

      if (!mapping) {
        Alert.alert('Import Error', 'Could not find HV/EHT and Count columns in the selected sheet.');
        return;
      }

      const { rows: importedRows, presetTimeValue } = buildRowsFromImportedSheet(sheetRows, mapping);

      setRows(importedRows);
      setAutoCorrected(importedRows.map(() => true));
      if (presetTimeValue) setPresetTime(presetTimeValue);

      Alert.alert(
        'Import Complete',
        `Loaded ${importedRows.length} row(s) from ${asset.name || 'the Excel file'}.`
      );
    } catch (error) {
      console.error('Excel import error:', error);
      Alert.alert('Import Error', `Could not import the Excel file: ${error.message || error}`);
    }
  };

  const deleteRow = () => {
    setRows(prev => {
      if (prev.length <= 1) return prev;
      return prev.slice(0, -1).map((r, i) => {
        const c = [...r];
        c[0] = String(i + 1);
        return c;
      });
    });
    setAutoCorrected(prev => prev.slice(0, -1));
  };

  const clearData = () => {
    Alert.alert('Clear All Data', 'This will reset all rows. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive', onPress: () => {
          setRows(initialRows);
          setAutoCorrected(initialRows.map(() => true));
          setPresetTime('');
          setV1('');
          setV2('');
        },
      },
    ]);
  };

  // Graph
  const graphData = useMemo(() => {
    const pairs = rows
      .map(r => ({
        x: parseNumericInput(r[1]),
        y: parseNumericInput(r[4])
      }))
      .filter(p => p.x !== null && p.x > 0 && p.y !== null)
      .sort((a, b) => a.x - b.x);

    return {
      labels: pairs.map(p => p.x.toString()),
      values: pairs.map(p => p.y)
    };
  }, [rows]);

  const safeChartData = useMemo(() => {
    if (!graphData.values.length) return null;

    let values = [...graphData.values];

    // react-native-chart-kit can crash when series is empty/single-point/flat.
    if (values.length === 1) {
      values = [values[0], values[0] + 0.0001];
    }

    const allSame = values.every(v => v === values[0]);
    if (allSame) {
      values = values.map((v, i) => v + i * 0.0001);
    }

    const labels = values.map((_, i) => graphData.labels[i] ?? `${i + 1}`);

    return { labels, values };
  }, [graphData]);

  const validPoints = useMemo(() => {
    return rows
      .map(r => ({
        v: parseNumericInput(r[1]),
        n: parseNumericInput(r[4])
      }))
      .filter(p => p.v !== null && p.v > 0 && p.n !== null && p.n > 0)
      .sort((a, b) => a.v - b.v);
  }, [rows]);

  const effectiveV1 = useMemo(() => {
    const manual = parseNumericInput(v1);
    if (manual !== null) return manual;
    return validPoints.length ? validPoints[0].v : null;
  }, [v1, validPoints]);

  const effectiveV2 = useMemo(() => {
    const manual = parseNumericInput(v2);
    if (manual !== null) return manual;
    // Default: second-to-last valid point (last - 1)
    return validPoints.length >= 2 ? validPoints[validPoints.length - 2].v : null;
  }, [v2, validPoints]);

  // Computations
  const plateauLength = useMemo(() => {
    const a = effectiveV1;
    const b = effectiveV2;
    if (a === null || b === null || b <= a) return '';
    return (b - a).toFixed(1);
  }, [effectiveV1, effectiveV2]);

  const operatingVoltage = useMemo(() => {
    const a = effectiveV1;
    const b = effectiveV2;
    if (a === null || b === null || b <= a) return '';
    return ((a + b) / 2).toFixed(1);
  }, [effectiveV1, effectiveV2]);

  const slopePercent = useMemo(() => {
    const a = effectiveV1;
    const b = effectiveV2;

    if (a === null || b === null || b <= a) return '';

    const sorted = validPoints;

    if (sorted.length < 2) return '';

    const N1 = sorted.find(p => p.v >= a) ?? sorted[0];
    const N2 = [...sorted].reverse().find(p => p.v <= b) ?? sorted[sorted.length - 1];

    if (!N1 || !N2 || N1.n <= 0) return '';

    const slope = ((N2.n - N1.n) / N1.n) * (100 / (b - a)) * 100;

    return slope.toFixed(2);
  }, [validPoints, effectiveV1, effectiveV2]);

  // Save chart/table snapshot to device gallery (Expo Go compatible)
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

      Alert.alert("Saved Successfully", "Image saved to device gallery.");
    } catch (error) {
      console.error("Save image error:", error);
      Alert.alert("Error", `Could not save image: ${error.message || error}`);
    }
  };

  const chartWidth = Math.max(280, graphBoxWidth - 24);
  const chartHeight = BOX_HEIGHT - 24;
  const chartPoints = safeChartData?.labels.length ?? 1;
  const chartContentWidth = Math.max(chartWidth, chartPoints * 60);

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
          <Image source={require('../assets/images/lo.jpeg')} style={styles.logo} resizeMode="contain" />
        </View>
      </View>

      <View style={styles.topSeparator} />

      <View style={styles.content}>

        {/* LEFT SIDE*/}
        <View style={styles.leftPane}>
          <View style={styles.timeInputRow}>
            <Text style={styles.vLabel}>Preset Time (s)</Text>
            <TextInput
              style={styles.timeInput}
              keyboardType="numeric"
              value={presetTime}
              onChangeText={setPresetTime}
            />
          </View>

          <View style={[styles.tableBox, { height: BOX_HEIGHT }]}>
            {/* Fixed Header Row */}
            <View style={[styles.row, styles.headRow]}>
              {['S.No.', 'EHT', 'Counts', 'Background', 'Corrected'].map((h, i) => (
                <Text key={i} style={[styles.cell, styles.headCell]}>{h}</Text>
              ))}
            </View>

            {/* Scrollable Data Rows */}
            <ScrollView style={{ flex: 1 }} scrollEnabled={true}>
              <View style={{ width: '100%' }}>
                {rows.map((r, i) => (
                  <View key={i} style={styles.row}>
                    <Text style={[styles.cell, styles.readOnly]}>{r[0]}</Text>

                    <TextInput
                      style={styles.inputCell}
                      value={r[1]}
                      onChangeText={t => updateCell(t, i, 1)}
                      keyboardType="numeric"
                    />

                    <TextInput
                      style={styles.inputCell}
                      value={r[2]}
                      onChangeText={t => updateCell(t, i, 2)}
                      keyboardType="numeric"
                    />

                    <TextInput
                      style={styles.inputCell}
                      value={r[3]}
                      onChangeText={t => updateCell(t, i, 3)}
                      keyboardType="numeric"
                    />

                    <TextInput
                      style={[styles.inputCell, styles.readOnly]}
                      value={r[4]}
                      editable={false}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Buttons */}
          <View style={styles.controlsRow}>
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

            <TouchableOpacity style={styles.bigBtn} onPress={() => router.push('/hub')}>
              <Text style={styles.bigBtnText}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.vInputsRow}>
            <View style={styles.vBox}>
              <Text style={styles.vLabel}>V₁</Text>
              <TextInput
                style={styles.vInput}
                keyboardType="numeric"
                value={v1}
                onChangeText={setV1}
              />
            </View>

            <View style={styles.vBox}>
              <Text style={styles.vLabel}>V₂</Text>
              <TextInput
                style={styles.vInput}
                keyboardType="numeric"
                value={v2}
                onChangeText={setV2}
              />
            </View>
          </View>

        </View>

        {/* RIGHT SIDE */}
        <View style={styles.rightPane}>
          <Text style={styles.graphTitle}>GRAPH — G.M. Characteristics</Text>

          <View
            style={[styles.graphBox, { height: BOX_HEIGHT }]}
            onLayout={e => setGraphBoxWidth(e.nativeEvent.layout.width)}
          >
            <View style={styles.chartWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator>
                <ScrollView>
                  {safeChartData ? (
                    <LineChart
                      data={{
                        labels: safeChartData.labels,
                        datasets: [{ data: safeChartData.values }],
                      }}
                      width={chartContentWidth}
                      height={chartHeight}
                      chartConfig={{
                        backgroundGradientFrom: '#fff',
                        backgroundGradientTo: '#fff',
                        decimalPlaces: 0,
                        color: () => '#000',
                        labelColor: () => '#000',
                        propsForDots: { r: '3', strokeWidth: '1', stroke: '#000' }
                      }}
                      fromZero
                      withInnerLines
                      withOuterLines
                      bezier={false}
                    />
                  ) : (
                    <Text style={{ fontWeight: '700', color: '#444' }}>
                      Enter valid EHT and Corrected values to plot the graph.
                    </Text>
                  )}
                </ScrollView>
              </ScrollView>

              <Text style={styles.yAxisLabel}>counts</Text>
              <Text style={styles.xAxisLabel}>EHT</Text>
            </View>
          </View>

          {/* Computed values */}
          <View style={styles.computeWrap}>
            <View style={styles.compItem}>
              <Text style={styles.vLabel}>Plateau Length (V)</Text>
              <TextInput style={[styles.vInput, styles.readOnly]} editable={false} value={plateauLength} />
            </View>

            <View style={styles.compItem}>
              <Text style={styles.vLabel}>Slope (%/100V)</Text>
              <TextInput style={[styles.vInput, styles.readOnly]} editable={false} value={slopePercent} />
            </View>

            <View style={styles.compItem}>
              <Text style={styles.vLabel}>Operating Voltage (V)</Text>
              <TextInput style={[styles.vInput, styles.readOnly]} editable={false} value={operatingVoltage} />
            </View>
          </View>

        </View>
      </View>
    </View>
  );
}

// ----------------- STYLES (UNCHANGED) -----------------
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F1BE' },

  topBar: { flexDirection: 'row', height: 80, width: '100%' },
  topLeft: {
    flex: 1,
    backgroundColor: '#d0cfcfff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10
  },
  brand: { fontSize: 38, fontWeight: '700', letterSpacing: 2 },
  dataBtn: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#f6f4f4ff',
    borderWidth: 1,
    borderColor: '#cfcfcf',
    marginLeft: 30
  },
  dataBtnText: { fontWeight: '700' },
  topRight: {
    flex: 2.5,
    backgroundColor: '#2b78c5',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20
  },
  logo: { width: 70, height: 70 },
  topSeparator: { height: 2, backgroundColor: '#000', width: '100%' },

  content: { flex: 1, flexDirection: 'row' },
  leftPane: { width: '46%', padding: 12 },

  timeInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  timeInput: {
    width: 110,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbb',
    paddingVertical: 6,
    paddingHorizontal: 8,
    textAlign: 'center',
    borderRadius: 6
  },

  tableBox: {
    borderWidth: 1,
    borderColor: '#bbb',
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 0,
    marginBottom: 10,
    overflow: 'hidden'
  },

  tableScrollX: {},
  row: { flexDirection: 'row', width: '100%' },
  headRow: { backgroundColor: '#a6a6a6' },

  cell: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 12
  },
  headCell: { fontSize: 13 },
  inputCell: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    textAlign: 'center',
    backgroundColor: '#fff',
    fontSize: 12
  },
  readOnly: { backgroundColor: '#eee' },

  controlsRow: { flexDirection: 'row', gap: 12, marginTop: 12, flexWrap: 'wrap' },
  bigBtn: {
    backgroundColor: '#808080',
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 10
  },
  bigBtnText: { fontWeight: '800', color: '#fff', fontSize: 15 },

  vInputsRow: { flexDirection: 'row', gap: 14, marginTop: 12, alignItems: 'center' },
  vBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  vLabel: { fontWeight: '800', fontSize: 16 },
  vInput: {
    width: 110,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbb',
    paddingVertical: 6,
    paddingHorizontal: 8,
    textAlign: 'center',
    borderRadius: 6
  },

  rightPane: { width: '54%', padding: 12 },
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
    marginBottom: 14,
    overflow: 'hidden'
  },
  chartWrap: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yAxisLabel: {
    position: 'absolute',
    left: 4,
    top: '50%',
    transform: [{ rotate: '-90deg' }, { translateY: -8 }],
    fontWeight: '700',
    fontSize: 13,
  },
  xAxisLabel: {
    position: 'absolute',
    bottom: 4,
    left: '50%',
    transform: [{ translateX: -18 }],
    fontWeight: '700',
    fontSize: 13,
  },

  computeWrap: { borderTopWidth: 1, borderColor: '#999', paddingTop: 10, gap: 10 },
  compItem: { flexDirection: 'row', alignItems: 'center', gap: 8 }
});
