import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { Svg, Circle } from 'react-native-svg';
import { File } from 'expo-file-system';
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
      if (countIndex === -1 && (header === 'count' || header === 'counts' || header === 'countreading')) {
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

const initialRows = Array.from({ length: 10 }).map((_, i) => [
  String(i + 1), // 0: S.No.
  '',            // 1: Elapsed Time (s)
  '',            // 2: Duration (min) - AUTO from elapsed
  '',            // 3: Counts Reading
  '',            // 4: Corrected Counts / min (Computed)
  '',            // 5: Log N (Computed)
]);

export default function Screen7DataEntry() {
  const router = useRouter();
  const contentRef = useRef(null);
  
  const [rows, setRows] = useState(initialRows);
  const [bgPerMin, setBgPerMin] = useState('');
  const [graphBoxWidth, setGraphBoxWidth] = useState(0);

  const [iOverIo, setIOverIo] = useState('');
  const [halfLife, setHalfLife] = useState('');
  const [decayConstant, setDecayConstant] = useState('');

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

      const nextRows = importedCounts.map((count, index) => [
        String(index + 1),
        '',
        '',
        count,
        '',
        '',
      ]);

      setRows(nextRows);
      Alert.alert('Import Complete', `Loaded ${importedCounts.length} count value(s) from ${asset.name || 'the Excel file'}.`);
    } catch (error) {
      console.error('Excel import error:', error);
      Alert.alert('Import Error', `Could not import the Excel file: ${error.message || error}`);
    }
  };

  const handleDecimalInput = (setter, next, maxDecimals = 4) => {
    const normalized = (next || '').replace(',', '.').trim();
    // Allow only compact positive decimal values to keep fixed-width inputs stable.
    const rx = new RegExp(`^\\d{0,4}(?:\\.\\d{0,${maxDecimals}})?$`);
    if (normalized === '' || rx.test(normalized)) {
      setter(normalized);
    }
  };

  // 🔧 UPDATED: auto-calc Duration(min) from Elapsed Time (s)
  const updateCell = (text, rIdx, cIdx) => {
    setRows(prev => {
      const next = prev.map(r => [...r]);
      next[rIdx][cIdx] = text;

      // If elapsed time (seconds) changed, recompute duration in minutes
      if (cIdx === 1) {
        const tSec = parseFloat(text);
        if (Number.isFinite(tSec) && tSec >= 0) {
          const durMin = tSec / 60;
          next[rIdx][2] = durMin.toFixed(2); // e.g. 300 -> "5.00"
        } else {
          next[rIdx][2] = '';
        }
      }

      return next;
    });
  };

  const addRow = () =>
    setRows(prev => [...prev, [String(prev.length + 1), '', '', '', '', '']]);

  const deleteRow = () => {
    setRows(prev => {
      if (prev.length <= 1) return prev;
      return prev.slice(0, -1).map((r, i) => {
        const c = [...r];
        c[0] = String(i + 1); // Re-index S.No.
        return c;
      });
    });
  };

  const closeToHub = () => router.push('/hub');

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

  const numericBG = useMemo(() => parseFloat(bgPerMin) || 0, [bgPerMin]);

  // Compute Corrected = Counts Reading - Background, and Log N
  const computedRows = useMemo(() => {
    return rows.map(r => {
      const tSec = parseFloat(r[1]);
      const countsReading = parseFloat(r[3]);
      
      let corrected = r[4];
      let lnN = r[5];
      
      const durationMin = parseFloat(r[2]);
      
      if (Number.isFinite(countsReading)) {
        const cpsPerMin = Number.isFinite(durationMin) && durationMin > 0
          ? countsReading / durationMin
          : countsReading;

        const correctedVal = cpsPerMin - numericBG;
        
        corrected = Number.isFinite(correctedVal) ? correctedVal.toFixed(2) : r[4];
        
        if (correctedVal > 0) {
          lnN = Math.log(correctedVal).toFixed(2);
        } else {
          lnN = '';
        }
      }

      return [r[0], r[1], r[2], r[3], corrected, lnN, tSec];
    });
  }, [rows, numericBG]);

  const graphData = useMemo(() => {
    const pts = computedRows
      .map(r => {
        const tMin = Number.isFinite(r[6]) ? r[6] / 60 : NaN;
        const lnVal = parseFloat(r[5]);
        return { tMin, lnVal };
      })
      .filter(p => Number.isFinite(p.tMin) && Number.isFinite(p.lnVal))
      .sort((a, b) => a.tMin - b.tMin);

    if (pts.length === 0) return { labels: [], values: [], lineYs: [], pts: [] };

    let lineYs = [];
    if (pts.length >= 2) {
      const n = pts.length;
      const sumX = pts.reduce((s, p) => s + p.tMin, 0);
      const sumY = pts.reduce((s, p) => s + p.lnVal, 0);
      const sumXX = pts.reduce((s, p) => s + p.tMin * p.tMin, 0);
      const sumXY = pts.reduce((s, p) => s + p.tMin * p.lnVal, 0);
      const denom = n * sumXX - sumX * sumX;
      if (denom !== 0) {
        const m = (n * sumXY - sumX * sumY) / denom;
        const a = (sumY - m * sumX) / n;
        lineYs = pts.map(p => a + m * p.tMin);
      } else {
        const meanY = sumY / n;
        lineYs = pts.map(() => meanY);
      }
    } else {
      lineYs = pts.map(p => p.lnVal);
    }

    return {
      labels: pts.map(p => p.tMin.toFixed(2)),
      values: pts.map(p => p.lnVal),
      lineYs,
      pts,
    };
  }, [computedRows]);

  // Safeguard against non-finite values that cause SVG path errors
  const safeGraphData = useMemo(() => {
    if (!graphData.values.length) return { labels: [], values: [], lineYs: [] };
    
    // Filter out any non-finite values
    const validIndices = graphData.values
      .map((v, i) => Number.isFinite(v) && Number.isFinite(graphData.lineYs[i]) ? i : -1)
      .filter(i => i >= 0);
    
    if (validIndices.length === 0) {
      return { labels: ['1'], values: [0], lineYs: [0] };
    }
    
    return {
      labels: validIndices.map(i => graphData.labels[i]),
      values: validIndices.map(i => graphData.values[i]),
      lineYs: validIndices.map(i => graphData.lineYs[i]),
    };
  }, [graphData]);

  const chartWidth = Math.max(200, graphBoxWidth - 80);
  const chartHeight = BOX_HEIGHT - 90;

  const computeDecay = () => {
    const t = parseFloat(halfLife);
    if (!Number.isFinite(t) || t <= 0) {
      Alert.alert('Error', 'Enter a valid positive Half-life (T½).');
      return;
    }
    const lambda = 0.693 / t; 
    setDecayConstant(lambda.toFixed(4));
  };

  const clearDecayConstant = () => {
    setDecayConstant('');
  };

  const clearTable = () => {
    Alert.alert('Clear Table', 'This will reset all rows. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive', onPress: () => {
          setRows(initialRows);
          setBgPerMin('');
          setIOverIo('');
          setHalfLife('');
          setDecayConstant('');
        },
      },
    ]);
  };

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

      <View style={styles.content}>
        {/* LEFT PANE */}
        <View style={styles.leftPane}>
          <View style={styles.bgRow}>
            <Text style={styles.bgLabel}>Background (per minute):</Text>
            <TextInput
              style={styles.bgInput}
              keyboardType="numeric"
              value={bgPerMin}
              onChangeText={setBgPerMin}
            />
          </View>

          <View style={[styles.tableBox, { height: BOX_HEIGHT, marginTop: 8 }]}>
            {/* Fixed Header Row */}
            <View style={[styles.row, styles.headRow]}>
              {[
                'S.No.',
                'Elapsed Time (s)',
                'Duration (min)',
                'Counts Reading',
                'Corrected Counts / min',
                'Log N',
              ].map((h, i) => (
                <Text key={i} style={[styles.cell, styles.headCell]}>
                  {h}
                </Text>
              ))}
            </View>

            {/* Scrollable Data Rows */}
            <ScrollView
              showsVerticalScrollIndicator
              style={{ flex: 1 }}
            >
              {rows.map((r, rIdx) => (
                <View key={rIdx} style={styles.row}>
                  {/* S.No. */}
                  <Text style={[styles.cell, styles.readOnly]}>
                    {computedRows[rIdx][0]}
                  </Text>

                  {/* Elapsed Time (s) - editable */}
                  <TextInput
                    style={styles.inputCell}
                    keyboardType="numeric"
                    value={rows[rIdx][1]}
                    onChangeText={t => updateCell(t, rIdx, 1)}
                  />

                  {/* Duration (min) - AUTO, read-only */}
                  <TextInput
                    style={[styles.inputCell, styles.readOnly]}
                    keyboardType="numeric"
                    value={rows[rIdx][2]}
                    editable={false}
                  />

                  {/* Counts Reading */}
                  <TextInput
                    style={styles.inputCell}
                    keyboardType="numeric"
                    value={rows[rIdx][3]}
                    onChangeText={t => updateCell(t, rIdx, 3)}
                  />

                  {/* Corrected Counts / min - Computed */}
                  <TextInput
                    style={[styles.inputCell, styles.readOnly]}
                    keyboardType="numeric"
                    value={computedRows[rIdx][4]}
                    editable={false}
                  />

                  {/* Log N - Computed */}
                  <TextInput
                    style={[styles.inputCell, styles.readOnly]}
                    keyboardType="numeric"
                    value={computedRows[rIdx][5]}
                    editable={false}
                  />
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.controlsRow}>
            {[
              ['Upload Excel', importExcelFile],
              ['Add Row', addRow],
              ['Delete Row', deleteRow],
              ['Clear', clearTable],
              ['Save', saveImage],
              ['Close', closeToHub],
            ].map(([txt, fn]) => (
              <TouchableOpacity key={txt} style={styles.bigBtn} onPress={fn}>
                <Text style={styles.bigBtnText}>{txt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* RIGHT PANE */}
        <View style={styles.rightPane}>
          <View
            style={[styles.graphBox, { height: BOX_HEIGHT, marginTop: 8 }]}
            onLayout={e => setGraphBoxWidth(e.nativeEvent.layout.width)}
          >
            <View style={styles.graphInnerRow}>
              <Text style={styles.yLabel}>logN</Text>

              <View style={styles.chartColumn}>
                <LineChart
                  data={{
                    labels: safeGraphData.labels,
                    datasets: [
                      { data: safeGraphData.values, strokeWidth: 0, color: () => 'rgba(0,0,0,0)' },
                      safeGraphData.lineYs.length
                        ? {
                            data: safeGraphData.lineYs,
                            strokeWidth: 2.5,
                            color: () => 'rgba(0,0,0,1)',
                          }
                        : { data: [], color: () => 'rgba(0,0,0,0)' },
                    ],
                  }}
                  width={chartWidth}
                  height={chartHeight}
                  chartConfig={{
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                    propsForDots: { r: '0' },
                    propsForBackgroundLines: { strokeDasharray: '' },
                  }}
                  withShadow={false}
                  withInnerLines
                  withOuterLines
                  bezier={false}
                  withDots={false}
                  style={{ alignSelf: 'center' }}
                  decorator={({ x, y }) => (
                    <Svg
                      style={{ position: 'absolute', left: 0, top: 0 }}
                      width={chartWidth}
                      height={chartHeight}
                    >
                      {safeGraphData.values.map((val, i) => {
                        if (!Number.isFinite(val)) return null;
                        try {
                          const cx = x(i);
                          const cy = y(val);
                          return (
                            <Circle
                              key={`dot-${i}`}
                              cx={cx}
                              cy={cy}
                              r={4}
                              fill="#000"
                              stroke="#000"
                            />
                          );
                        } catch {
                          return null;
                        }
                      })}
                    </Svg>
                  )}
                />
                <Text style={styles.xLabel}>time (min)</Text>
              </View>
            </View>
          </View>

          <View style={styles.decayPanel}>
            <View style={styles.compRow}>
              <Text style={styles.compLabel}>Enter I/Io:</Text>
              <TextInput
                style={styles.compInput}
                keyboardType="numeric"
                value={iOverIo}
                onChangeText={t => handleDecimalInput(setIOverIo, t, 4)}
                scrollEnabled={false}
                maxLength={9}
                placeholder="e.g. 0.85"
                placeholderTextColor="#8a8a8a"
                multiline={false}
              />
            </View>

            <View style={styles.compRow}>
              <Text style={styles.compLabel}>Enter Half-life (T½):</Text>
              <TextInput
                style={styles.compInput}
                keyboardType="numeric"
                value={halfLife}
                onChangeText={t => handleDecimalInput(setHalfLife, t, 2)}
                scrollEnabled={false}
                maxLength={7}
                placeholder="Enter T½"
                placeholderTextColor="#8a8a8a"
                multiline={false}
              />
            </View>

            <View style={styles.compRow}>
              <Text style={styles.compLabel}>Decay Constant (λ):</Text>
              <View style={[styles.compInput, styles.compInputReadOnly, styles.grayBox, styles.compOutputBox]}>
                <Text style={styles.compOutputText}>{decayConstant || '—'}</Text>
              </View>
              <Text style={styles.unitText}>/ unit T</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
              <TouchableOpacity style={styles.smallCalcBtn} onPress={computeDecay} activeOpacity={0.7}>
                <Text style={styles.bigBtnText}>Calculate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallCalcBtn} onPress={clearDecayConstant} activeOpacity={0.7}>
                <Text style={styles.bigBtnText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F1BE' },
  topBar: { flexDirection: 'row', height: 80 },
  topLeft: {
    flex: 1,
    backgroundColor: '#d0cfcfff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  brand: { fontSize: 38, fontWeight: '700' },
  dataBtn: {
    marginLeft: 30,
    backgroundColor: '#f6f4f4ff',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#cfcfcf',
  },
  dataBtnText: { fontWeight: '700' },
  topRight: {
    flex: 2.5,
    backgroundColor: '#2b78c5',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 20,
  },
  logo: { width: 70, height: 70 },
  topSeparator: { height: 2, backgroundColor: '#000' },
  content: { flex: 1, flexDirection: 'row' },
  leftPane: { width: '46%', padding: 10, backgroundColor: '#F7F1BE' },
  bgRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  bgLabel: { fontWeight: '800', fontSize: 14 },
  bgInput: {
    width: 110,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbb',
    textAlign: 'center',
    borderRadius: 6,
    height: 35,
    fontSize: 11,
  },
  tableBox: {
    borderWidth: 1,
    borderColor: '#bbb',
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row' },
  headRow: { backgroundColor: '#a6a6a6' },
  cell: {
    width: 95,
    paddingVertical: 10,
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 10,
  },
  headCell: { fontSize: 10 },
  inputCell: {
    width: 95,
    paddingVertical: 10,
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    textAlign: 'center',
    backgroundColor: '#fff',
    fontSize: 10,
  },
  readOnly: { backgroundColor: '#eee' },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  bigBtn: {
    backgroundColor: '#808080',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  smallCalcBtn: {
    backgroundColor: '#808080',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  bigBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  rightPane: { width: '54%', padding: 10, backgroundColor: '#F7F1BE' },
  graphBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  graphInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    width: '100%',
  },
  yLabel: {
    width: 24,
    textAlign: 'center',
    fontWeight: '700',
    transform: [{ rotate: '-90deg' }],
    marginRight: 4,
  },
  chartColumn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  xLabel: { marginTop: 2, fontWeight: '700', textAlign: 'center' },
  decayPanel: {
    marginTop: 8,
    padding: 6,
    borderTopWidth: 1,
    borderColor: '#999',
    flexShrink: 0,
  },
  compRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  compLabel: { width: 180, fontSize: 14, fontWeight: '700' },
  compInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbb',
    width: 180,
    height: 45,
    borderRadius: 6,
    textAlign: 'center',
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  compInputReadOnly: { textAlign: 'center', paddingHorizontal: 0 },
  compOutputBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  compOutputText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
  },
  unitText: { marginLeft: 8, fontSize: 12, fontWeight: '700', color: '#333' },
  grayBox: { backgroundColor: '#eee' },
});
