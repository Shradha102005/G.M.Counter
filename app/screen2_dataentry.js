// app/screen2_dataentry.js

import * as MediaLibrary from 'expo-media-library';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { captureRef } from 'react-native-view-shot';
import * as XLSX from 'xlsx';

const BOX_HEIGHT = 440;
const GRAPH_TOP_OFFSET = 47;
const FIXED_ROW_COUNT = 10;

const normalizeHeader = (value) =>
  (value ?? '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const findCountColumn = (rows) => {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] || [];
    let countIndex = -1;
    let timeIndex = -1;

    row.forEach((cell, cellIndex) => {
      const header = normalizeHeader(cell);
      if (countIndex === -1 && (header === 'count' || header === 'counts' || header === 'correctedcount' || header === 'correctedcounts' || header === 'npreset')) {
        countIndex = cellIndex;
      }
      if (timeIndex === -1 && (header === 'time' || header === 'presettime' || header === 'presettimes' || header === 'preset' || header === 't' || header === 'ts' || header.startsWith('presettime'))) {
        timeIndex = cellIndex;
      }
    });

    if (countIndex !== -1) {
      return { headerRowIndex: rowIndex, countIndex, timeIndex };
    }
  }

  return null;
};

const formatCellText = (value) => {
  if (value === null || value === undefined) return '';
  return value.toString().trim();
};

// Default distances: 2.0, 2.5, 3.0 … 6.5 (step 0.5, 10 rows)
const DEFAULT_DISTANCES = Array.from({ length: FIXED_ROW_COUNT }, (_, i) =>
  (2.0 + i * 0.5).toFixed(1)
);

const initialRows = Array.from({ length: FIXED_ROW_COUNT }).map((_, i) => ({
  sn: String(i + 1),
  d: DEFAULT_DISTANCES[i],
  N: '',
  R: '',
  C: '',
  invd2: '',
  logd: '',
  logR: '',
  manualR: false,
}));

const normalizeRows = (rowsLike) => {
  const safe = Array.isArray(rowsLike) ? rowsLike : [];

  // Preserve all rows (allow unlimited additions)
  const processed = safe.map((r, i) => ({
    ...(r || { sn: String(i + 1), d: DEFAULT_DISTANCES[i] ?? '', N: '', R: '', C: '', invd2: '', logd: '', logR: '', manualR: false }),
    sn: String(i + 1),
  }));

  // Ensure at least 10 rows exist, with default distances pre-filled
  while (processed.length < FIXED_ROW_COUNT) {
    const i = processed.length;
    processed.push({ sn: String(i + 1), d: DEFAULT_DISTANCES[i] ?? '', N: '', R: '', C: '', invd2: '', logd: '', logR: '', manualR: false });
  }

  return processed;
};

export default function Screen2DataEntry() {
  const router = useRouter();
  const contentRef = useRef(null);

  const [rows, setRows] = useState(() => normalizeRows(initialRows));
  const [graphType, setGraphType] = useState('R_vs_d');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [presetTime, setPresetTime] = useState('60');
  const [graphBoxWidth, setGraphBoxWidth] = useState(0);

  const recomputeRow = (row) => {
    const d = parseFloat(row.d);
    const N = parseFloat(row.N);
    const T = parseFloat(presetTime);

    let Rval = NaN;
    const manualRnum = parseFloat(row.R);

    // If we're in loglog mode OR the row is marked manualR, take typed R.
    if ((graphType === 'loglog' || row.manualR) && Number.isFinite(manualRnum)) {
      Rval = manualRnum;
    } else if (Number.isFinite(N) && Number.isFinite(T) && T > 0) {
      Rval = N / T;
    }

    // Product C = R * d^2
    const C = Number.isFinite(Rval) && Number.isFinite(d) ? Rval * d * d : NaN;

    // Transformation = (1 / d^2) * 10000, rounded to whole number
    const transformScaled =
      Number.isFinite(d) && d !== 0 ? Math.round((1 / (d * d)) * 10000) : NaN;

    const logd = Number.isFinite(d) && d > 0 ? Math.log10(d) : NaN;
    const logR = Number.isFinite(Rval) && Rval > 0 ? Math.log10(Rval) : NaN;

    return {
      ...row,
      // R: one decimal place
      R: Number.isFinite(Rval) ? Rval.toFixed(1) : row.R || '',
      // C: nearest integer
      C: Number.isFinite(C) ? String(Math.round(C)) : '',
      // Transformation (scaled 1/d^2): integer
      invd2: Number.isFinite(transformScaled) ? String(transformScaled) : '',
      // logs auto-computed
      logd: Number.isFinite(logd) ? logd.toFixed(4) : row.logd || '',
      logR: Number.isFinite(logR) ? logR.toFixed(4) : row.logR || '',
    };
  };

  const updateCell = (text, rIdx, key) => {
    setRows((prev) =>
      prev.map((r, i) => (i !== rIdx ? r : recomputeRow({ ...r, [key]: text })))
    );
  };

  const updateManualR = (text, rIdx) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== rIdx) return r;
        const willBeManual = text !== '';
        return recomputeRow({ ...r, R: text, manualR: willBeManual });
      })
    );
  };

  const onChangePreset = (t) => {
    setPresetTime(t);
    // Always recompute so R, C, Transformation update instantly
    setRows((prev) => prev.map(recomputeRow));
  };

  const addRow = () => {
    setRows(prev => [...prev, { 
      sn: String(prev.length + 1), 
      d: '', 
      N: '', 
      R: '', 
      C: '', 
      invd2: '', 
      logd: '', 
      logR: '', 
      manualR: false 
    }]);
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
      const mapping = findCountColumn(sheetRows);

      if (!mapping) {
        Alert.alert('Import Error', 'Could not find a Count / Counts / N(preset) column in the selected sheet.');
        return;
      }

      const dataRows = sheetRows
        .slice(mapping.headerRowIndex + 1)
        .filter((row) => (row || []).some((cell) => formatCellText(cell) !== ''));

      // Extract preset time from the first data row if a time column was found
      const presetTimeValue =
        mapping.timeIndex >= 0 && dataRows.length > 0
          ? formatCellText(dataRows[0][mapping.timeIndex])
          : '';

      setRows((prevRows) => {
        const importedRows = dataRows.map((row, index) => {
          const countValue = formatCellText(row[mapping.countIndex]);
          const existingD = prevRows[index]?.d ?? DEFAULT_DISTANCES[index] ?? '';

          return recomputeRow({
            sn: String(index + 1),
            d: existingD,
            N: countValue,
            R: '',
            C: '',
            invd2: '',
            logd: '',
            logR: '',
            manualR: false,
          });
        });
        return importedRows;
      });

      if (presetTimeValue) setPresetTime(presetTimeValue);

      Alert.alert(
        'Import Complete',
        `Loaded ${dataRows.length} row(s) from ${asset.name || 'the Excel file'}.`
      );
    } catch (error) {
      console.error('Excel import error:', error);
      Alert.alert('Import Error', `Could not import the Excel file: ${error.message || error}`);
    }
  };

  const deleteRow = () => {
    setRows(prev => {
      if (prev.length <= 1) return prev;
      return prev.slice(0, -1).map((r, i) => ({ ...r, sn: String(i + 1) }));
    });
  };

  const clearData = () => {
    Alert.alert('Clear All Data', 'This will reset all rows. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive', onPress: () => {
          setRows(normalizeRows(initialRows));
          setPresetTime('60');
        },
      },
    ]);
  };

  // Save image directly to gallery
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

  const closeToHub = () => router.push('/hub');

  const tableHead = useMemo(() => {
    if (graphType === 'loglog') {
      return ['S.No.', 'Distance d (cm)', 'Net Count Rate R (1/s)', 'Log d', 'Log R'];
    }
    return [
      'S.No.',
      'Distance d (cm)',
      'Corrected Counts N (preset)',
      'Net Count Rate R (1/s)',
      'C = R·d²',
      'Transformation', // scaled 1/d²
    ];
  }, [graphType]);

  const graphData = useMemo(() => {
    const pts = rows
      .map((r) => {
        const d = parseFloat(r.d);
        const invd2Scaled = parseFloat(r.invd2); // using scaled transformation for X
        const R = parseFloat(r.R);
        const logd = parseFloat(r.logd);
        const logR = parseFloat(r.logR);

        if (graphType === 'R_vs_d') {
          if (Number.isFinite(d) && Number.isFinite(R)) return { x: d, y: R };
        } else if (graphType === 'R_vs_inv_d2') {
          if (Number.isFinite(invd2Scaled) && Number.isFinite(R)) return { x: invd2Scaled, y: R };
        } else if (graphType === 'loglog') {
          if (Number.isFinite(logd) && Number.isFinite(logR)) return { x: logd, y: logR };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.x - b.x);

    return {
      labels: pts.map((p) => String(p.x)),
      values: pts.map((p) => p.y),
    };
  }, [rows, graphType]);

  const safeGraphData = useMemo(() => {
    if (!graphType || !graphData.values.length) return null;

    let values = [...graphData.values];

    // react-native-chart-kit can throw on single-point or perfectly flat datasets.
    if (values.length === 1) {
      values = [values[0], values[0] + 0.0001];
    }

    const allSame = values.every((v) => v === values[0]);
    if (allSame) {
      values = values.map((v, i) => v + i * 0.0001);
    }

    const labels = values.map((_, i) => graphData.labels[i] ?? String(i + 1));
    return { labels, values };
  }, [graphType, graphData]);

  const chartWidth = Math.max(220, graphBoxWidth - 92);
  const chartHeight = BOX_HEIGHT - 120;

  const graphOptions = [
    { key: 'R_vs_d', label: 'Net Count Rate (R) vs Distance (d)' },
    { key: 'R_vs_inv_d2', label: 'Net Count Rate (R) vs Inverse Square (1/d²)' },
    { key: 'loglog', label: 'Log R vs Log d' },
  ];
  const currentGraphLabel =
    graphOptions.find((o) => o.key === graphType)?.label || 'Select Graph';

  const currentGraphTitle =
    graphType === 'R_vs_d'
      ? 'Graph - Plot of Net Count Rate (R) Vs Distance (d)'
      : graphType === 'R_vs_inv_d2'
      ? 'Graph - Plot of Net Count Rate (R) Vs Inverse Square of Distance (1/d²)'
      : 'Graph - Plot of Log R Vs Log d';

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
        {/* LEFT pane */}
        <View style={styles.leftPane}>
          {/* Controls row */}
          <View style={styles.controlsTopRow}>
            <View style={styles.dropdownWrap}>
              <TouchableOpacity
                onPress={() => setDropdownOpen((v) => !v)}
                activeOpacity={0.7}
                style={styles.dropdownButton}
              >
                <Text style={styles.dropdownButtonText}>{currentGraphLabel}</Text>
                <Text style={styles.dropdownCaret}>▾</Text>
              </TouchableOpacity>

              {dropdownOpen && (
                <View style={styles.dropdownMenu}>
                  {graphOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt.key}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setGraphType(opt.key);
                        setDropdownOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.presetWrap}>
              <Text style={styles.presetLabel}>Preset Time (s)</Text>
              <TextInput
                style={styles.presetInput}
                keyboardType="numeric"
                value={presetTime}
                onChangeText={onChangePreset}
              />
            </View>
          </View>

          {/* Table */}
          <View style={[styles.tableBox, { height: BOX_HEIGHT }]}>
            {/* Fixed Header */}
            <View style={[styles.row, styles.headRow]}>
              {tableHead.map((h, i) => (
                <Text key={i} style={[styles.cell, styles.headCell]}>
                  {h}
                </Text>
              ))}
            </View>

            {/* 10 rows initially, add more with Add Row button */}
            <View style={{ flex: 1 }}>
              <ScrollView showsVerticalScrollIndicator={true} style={{ flex: 1 }}>
                {rows.map((r, idx) => (
                  <View key={`r-${idx}`} style={styles.row}>
                  {/* S.No. */}
                  <Text style={[styles.cell, styles.readOnly]}>{r.sn}</Text>

                  {/* Distance (editable) */}
                  <TextInput
                    style={styles.inputCell}
                    keyboardType="numeric"
                    value={r.d}
                    onChangeText={(t) => updateCell(t, idx, 'd')}
                  />

                  {graphType === 'loglog' ? (
                    <>
                      <TextInput
                        style={styles.inputCell}
                        keyboardType="numeric"
                        value={r.R}
                        onChangeText={(t) => updateCell(t, idx, 'R')}
                      />
                      <Text style={[styles.cell, styles.readOnly]}>{r.logd}</Text>
                      <Text style={[styles.cell, styles.readOnly]}>{r.logR}</Text>
                    </>
                  ) : (
                    <>
                      {/* N editable; R auto-computed from N / T — read-only */}
                      <TextInput
                        style={styles.inputCell}
                        keyboardType="numeric"
                        value={r.N}
                        onChangeText={(t) => updateCell(t, idx, 'N')}
                      />

                      <Text style={[styles.cell, styles.readOnly]}>{r.R}</Text>

                      <Text style={[styles.cell, styles.readOnly]}>{r.C}</Text>
                      <Text style={[styles.cell, styles.readOnly]}>{r.invd2}</Text>
                    </>
                  )}
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Bottom buttons */}
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
            <TouchableOpacity style={styles.bigBtn} onPress={closeToHub}>
              <Text style={styles.bigBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RIGHT pane — graph */}
        <View style={styles.rightPane}>
          <Text style={styles.graphTitle}>{currentGraphTitle}</Text>
          <View
            style={[styles.graphBox, { height: BOX_HEIGHT, marginTop: GRAPH_TOP_OFFSET }]}
            onLayout={(e) => setGraphBoxWidth(e.nativeEvent.layout.width)}
          >
            <View style={styles.graphInner}>
              <View style={styles.yAxisWrap}>
                <Text style={styles.yAxisLabel}>
                  {graphType === 'loglog' ? 'LOG R' : 'NET COUNT RATE'}
                </Text>
              </View>

              <View style={styles.chartAlignWrap}>
              <LineChart
                key={graphType + JSON.stringify(safeGraphData)} // force live re-render
                data={{
                  labels: safeGraphData?.labels ?? [''],
                  datasets: [{ data: safeGraphData?.values ?? [0], strokeWidth: 2.5 }],
                }}
                width={chartWidth}
                height={chartHeight}
                chartConfig={{
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: graphType === 'loglog' ? 4 : 1,
                  color: () => '#000',
                  labelColor: () => '#000',
                  propsForBackgroundLines: { strokeDasharray: '' },
                  propsForDots: { r: '3', strokeWidth: '1', stroke: '#000', fill: '#000' },
                }}
                fromZero={graphType !== 'loglog'}
                withInnerLines
                withOuterLines
                bezier={false}
                style={styles.chartCanvas}
              />
              </View>

              {!safeGraphData && (
                <Text style={{ marginTop: 8, fontSize: 13, color: '#444' }}>
                  Enter valid values to plot the graph.
                </Text>
              )}

              <Text style={styles.xAxisLabel}>
                {graphType === 'R_vs_d'
                  ? 'DISTANCE d'
                  : graphType === 'R_vs_inv_d2'
                  ? '1/d²'
                  : 'LOG d'}
              </Text>
            </View>
          </View>
        </View>
      </View>
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

  leftPane: { width: '46%', padding: 12, backgroundColor: '#F7F1BE' },

controlsTopRow: {
flexDirection: 'row',
alignItems: 'center',
gap: 12,
marginBottom: 8,
zIndex: 5,
},

dropdownWrap: { position: 'relative' },
dropdownButton: {
minWidth: 165,
height: 36,
paddingHorizontal: 10,
backgroundColor: '#f6f4f4ff',
borderWidth: 1,
borderColor: '#cfcfcf',
borderRadius: 8,
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
},
dropdownButtonText: { fontWeight: '700', fontSize: 14, color: '#000' },
dropdownCaret: { fontSize: 16, marginLeft: 8 },
dropdownMenu: {
position: 'absolute',
top: 40,
left: 0,
backgroundColor: '#fff',
borderWidth: 1,
borderColor: '#cfcfcf',
borderRadius: 8,
overflow: 'hidden',
zIndex: 10,
},
dropdownItem: { paddingVertical: 10, paddingHorizontal: 12 },
dropdownItemText: { fontSize: 14 },

presetWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
presetLabel: { fontWeight: '800', fontSize: 14 },
presetInput: {
width: 90,
height: 36,
backgroundColor: '#fff',
borderWidth: 1,
borderColor: '#bbb',
paddingVertical: 6,
paddingHorizontal: 8,
textAlign: 'center',
borderRadius: 6,
},

tableBox: {
borderWidth: 1,
borderColor: '#bbb',
backgroundColor: '#fff',
borderRadius: 6,
paddingVertical: 6,
paddingHorizontal: 0,
marginBottom: 10,
overflow: 'hidden',
},

row: { flexDirection: 'row', width: '100%' },
headRow: { backgroundColor: '#a6a6a6' },

cell: {
flex: 1,
minWidth: 0,
paddingVertical: 9,
paddingHorizontal: 6,
borderWidth: 1,
borderColor: '#dcdcdc',
textAlign: 'center',
fontWeight: '700',
fontSize: 11,
},
headCell: { fontSize: 11 },
inputCell: {
flex: 1,
minWidth: 0,
paddingVertical: 8,
paddingHorizontal: 6,
borderWidth: 1,
borderColor: '#dcdcdc',
textAlign: 'center',
backgroundColor: '#fff',
fontSize: 11,
},
readOnly: { backgroundColor: '#eee' },

controlsRow: {
flexDirection: 'row',
gap: 12,
marginTop: 12,
flexWrap: 'wrap',
},
bigBtn: {
backgroundColor: '#808080',
paddingVertical: 13,
paddingHorizontal: 18,
borderRadius: 10,
},
bigBtnText: { fontWeight: '800', color: '#fff', fontSize: 15 },

rightPane: { width: '54%', padding: 12, backgroundColor: '#F7F1BE' },
graphTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
graphBox: {
backgroundColor: '#fff',
borderWidth: 1,
borderColor: '#000',
borderRadius: 6,
paddingVertical: 10,
paddingHorizontal: 10,
alignItems: 'center',
justifyContent: 'flex-start',
marginBottom: 14,
position: 'relative', // needed for absolute Y-axis label
},
graphInner: {
width: '100%',
height: '100%',
position: 'relative',
alignItems: 'center',
justifyContent: 'center',
paddingLeft: 34,
paddingTop: 8,
paddingBottom: 20,
},
yAxisWrap: {
position: 'absolute',
left: -10,
top: 8,
bottom: 20,
width: 30,
alignItems: 'center',
justifyContent: 'center',
zIndex: 3,
elevation: 3,
},
yAxisLabel: {
transform: [{ rotate: '-90deg' }],
fontWeight: '700',
fontSize: 11,
color: '#000',
width: 130,
textAlign: 'center',
},
xAxisLabel: {
position: 'absolute',
bottom: 2,
fontWeight: '700',
fontSize: 12,
},
chartAlignWrap: {
width: '100%',
alignItems: 'center',
paddingLeft: 0,
paddingRight: 0,
},
chartCanvas: {
alignSelf: 'center',
marginRight: 0,
},
});
