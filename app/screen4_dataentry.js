// app/screen4_dataentry.js
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
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
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

const initialRows = Array.from({ length: 10 }).map((_, i) => ({
  sn: String(i + 1),
  tmm: '',
  cnt1: '',
  cnt2: '',
  avg: '',
  net: '',
}));

const normalizeRows = (rowsLike) => {
  const safe = Array.isArray(rowsLike) ? rowsLike : [];
  return safe.map((row, index) => ({
    ...(row || { sn: String(index + 1), tmm: '', cnt1: '', cnt2: '', avg: '', net: '' }),
    sn: String(index + 1),
  }));
};

export default function Screen4DataEntry() {
  const router = useRouter();
  const contentRef = useRef(null);

  const [rows, setRows] = useState(initialRows);
  const [graphBoxWidth, setGraphBoxWidth] = useState(0);
  const [absorber, setAbsorber] = useState('');
  const [I0, setI0] = useState('');
  const [rho, setRho] = useState('');
  const [mu, setMu] = useState('');
  const [xhalf, setXhalf] = useState('');
  const [mumuRho, setMuMuRho] = useState('');

  // Preset time (reference only)
  const [presetTime, setPresetTime] = useState('');
  const [bgCount, setBgCount] = useState('');

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

      const rowCount = Math.ceil(importedCounts.length / 2);
      const nextRows = Array.from({ length: rowCount }).map((_, index) => {
        const count1 = importedCounts[index * 2] ?? '';
        const count2 = importedCounts[index * 2 + 1] ?? '';
        return {
          sn: String(index + 1),
          tmm: '',
          cnt1: count1,
          cnt2: count2,
          avg: '',
          net: '',
        };
      });

      const bgVal = Number(bgCount);
      setRows(normalizeRows(nextRows).map((row) => recomputeRow(row, bgVal)));

      Alert.alert('Import Complete', `Loaded ${importedCounts.length} count value(s) from ${asset.name || 'the Excel file'}.`);
    } catch (error) {
      console.error('Excel import error:', error);
      Alert.alert('Import Error', `Could not import the Excel file: ${error.message || error}`);
    }
  };

  const recomputeRow = (row, bgVal) => {
    const c1 = Number(row.cnt1);
    const c2 = Number(row.cnt2);
    const readings = [c1, c2].filter(Number.isFinite);

    if (!readings.length) {
      return { ...row, avg: '', net: '' };
    }

    const avg = readings.reduce((sum, v) => sum + v, 0) / readings.length;
    const net = avg - (Number.isFinite(bgVal) ? bgVal : 0);

    return {
      ...row,
      avg: avg.toFixed(2),
      net: net.toFixed(2),
    };
  };

  const updateCell = (text, rIdx, key) => {
    setRows(prev => {
      const bgVal = Number(bgCount);
      return prev.map((r, i) => {
        if (i !== rIdx) return r;
        return recomputeRow({ ...r, [key]: text }, bgVal);
      });
    });
  };

  useEffect(() => {
    const bgVal = Number(bgCount);
    setRows(prev => prev.map(r => recomputeRow(r, bgVal)));
  }, [bgCount]);

  const addRow = () => {
    setRows(prev => [
      ...prev,
      { sn: String(prev.length + 1), tmm: '', cnt1: '', cnt2: '', avg: '', net: '' },
    ]);
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
          setRows(initialRows);
          setBgCount('');
          setPresetTime('');
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

  const graphData = useMemo(() => {
    const pts = rows
      .map(r => ({ x: Number(r.tmm), y: Number(r.net) }))
      .filter(p => Number.isFinite(p.x) && p.x >= 0 && Number.isFinite(p.y) && p.y > 0)
      .sort((a, b) => a.x - b.x);
    if (pts.length === 0) return { labels: [''], values: [0] };
    return {
      labels: pts.map(p => p.x.toString()),
      values: pts.map(p => p.y),
    };
  }, [rows]);

  // Safeguard: ensure all values are finite before rendering
  const safeGraphData = useMemo(() => {
    const validIndices = graphData.values
      .map((v, i) => Number.isFinite(v) ? i : -1)
      .filter(i => i >= 0);
    
    if (validIndices.length === 0) {
      return { labels: [''], values: [0] };
    }
    
    return {
      labels: validIndices.map(i => graphData.labels[i]),
      values: validIndices.map(i => graphData.values[i]),
    };
  }, [graphData]);

  const chartWidth = Math.max(240, graphBoxWidth - 24);
  const chartHeight = BOX_HEIGHT - 24;

  const calculateBoth = () => {
    const IioNum = parseFloat(I0);
    const thickness = parseFloat(xhalf);
    const rhoNum = parseFloat(rho);

    if (isNaN(IioNum) || isNaN(thickness) || thickness <= 0 || IioNum <= 0 || IioNum >= 1) {
      Alert.alert('Invalid Input', 'Please enter positive values for X½ (thickness) and a value for I/I₀ between 0 and 1.');
      return;
    }

    const muVal = -Math.log(IioNum) / thickness;
    const muByRho = rhoNum > 0 ? muVal / rhoNum : 0;

    setMu(muVal.toFixed(4));
    setMuMuRho(muByRho.toFixed(4));
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
          <Image source={require('../assets/images/lo.jpeg')} style={styles.logo} resizeMode="contain" />
        </View>
      </View>
      <View style={styles.topSeparator} />

      <View style={styles.content}>
        {/* LEFT PANE */}
        <View style={styles.leftPane}>

          {/* absorber + preset time in same row */}
          <View style={styles.absorberRow}>
            <Text style={styles.absorberLabel}>Enter absorber set type</Text>
            <TextInput
              style={styles.absorberInput}
              value={absorber}
              onChangeText={setAbsorber}
              placeholder=""
            />

            <Text style={styles.presetLabel}>Background</Text>
            <TextInput
              style={styles.presetInput}
              keyboardType="numeric"
              value={bgCount}
              onChangeText={setBgCount}
              placeholder=""
            />

            <Text style={styles.presetLabel}>Preset time</Text>
            <TextInput
              style={styles.presetInput}
              keyboardType="numeric"
              value={presetTime}
              onChangeText={setPresetTime}
              placeholder=""
            />
          </View>

          <View style={[styles.tableBox, { height: BOX_HEIGHT }]}>
            {/* Fixed Header Row */}
            <View style={[styles.row, styles.headRow]}>
              <Text style={[styles.cell, styles.headCell, styles.cellSno]}>Sheet No.</Text>
              <Text style={[styles.cell, styles.headCell, styles.cellData]}>Thickness (mm)</Text>
              <Text style={[styles.cell, styles.headCell, styles.cellData]}>Counts I</Text>
              <Text style={[styles.cell, styles.headCell, styles.cellData]}>Counts II</Text>
              <Text style={[styles.cell, styles.headCell, styles.cellData]}>Average</Text>
              <Text style={[styles.cell, styles.headCell, styles.cellData]}>Net Counts</Text>
            </View>

            {/* Scrollable Data Rows */}
            <ScrollView
              showsVerticalScrollIndicator={true}
              style={{ flex: 1 }}
            >
              {rows.map((r, rIdx) => (
                <View key={`r-${rIdx}`} style={styles.row}>
                  <Text style={[styles.cell, styles.readOnly, styles.cellSno]}>{r.sn}</Text>
                  <TextInput
                    style={[styles.inputCell, styles.cellData]}
                    keyboardType="numeric"
                    value={r.tmm}
                    onChangeText={t => updateCell(t, rIdx, 'tmm')}
                  />
                  <TextInput
                    style={[styles.inputCell, styles.cellData]}
                    keyboardType="numeric"
                    value={r.cnt1}
                    onChangeText={t => updateCell(t, rIdx, 'cnt1')}
                  />
                  <TextInput
                    style={[styles.inputCell, styles.cellData]}
                    keyboardType="numeric"
                    value={r.cnt2}
                    onChangeText={t => updateCell(t, rIdx, 'cnt2')}
                  />
                  <TextInput
                    style={[styles.inputCell, styles.cellData, styles.readOnly]}
                    keyboardType="numeric"
                    value={r.avg}
                    editable={false}
                  />
                  <TextInput
                    style={[styles.inputCell, styles.cellData, styles.readOnly]}
                    keyboardType="numeric"
                    value={r.net}
                    editable={false}
                  />
                </View>
              ))}
            </ScrollView>
          </View>

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
        </View>

        {/* RIGHT PANE */}
        <View style={styles.rightPane}>
          <Text style={[styles.graphTitle, { marginTop: 10 }]}>
            Linear & Mass Attenuation Coefficient for{absorber ? ` ${absorber}` : ''}
          </Text>

          <View
            style={[styles.graphBox, { height: BOX_HEIGHT, marginTop: 8 }]}
            onLayout={e => setGraphBoxWidth(e.nativeEvent.layout.width)}
          >
            <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={styles.xAxisLabel}>Thickness (mm)</Text>
              <Text style={styles.yAxisLabel}>Net Counts</Text>

              <LineChart
                data={{
                  labels: safeGraphData.labels,
                  datasets: [{ data: safeGraphData.values, strokeWidth: 2.5 }],
                }}
                width={chartWidth}
                height={chartHeight}
                chartConfig={{
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: () => '#000',
                  labelColor: () => '#000',
                  propsForBackgroundLines: { strokeDasharray: '' },
                  propsForDots: { r: '3', strokeWidth: '1', stroke: '#000', fill: '#000' },
                }}
                fromZero
                withInnerLines
                withOuterLines
                bezier={false}
                style={{ alignSelf: 'center' }}
              />
            </View>
          </View>

          <View style={[styles.computeWrapRow, { marginTop: 6 }]}>
            <View style={styles.compCol}>
              <View style={styles.compRow}>
                <Text style={styles.compLabel}>Enter I / I₀</Text>
                <TextInput
                  style={styles.compInput}
                  keyboardType="numeric"
                  value={I0}
                  onChangeText={setI0}
                />
              </View>
              <View style={styles.compRow}>
                <Text style={styles.compLabel}>Enter X½ (cm)</Text>
                <TextInput
                  style={styles.compInput}
                  keyboardType="numeric"
                  value={xhalf}
                  onChangeText={setXhalf}
                />
              </View>
              <View style={styles.compRow}>
                <Text style={styles.compLabel}>Enter ρ (gm/cm³)</Text>
                <TextInput
                  style={styles.compInput}
                  keyboardType="numeric"
                  value={rho}
                  onChangeText={setRho}
                />
              </View>
              <TouchableOpacity style={[styles.computeBtn, { marginTop: -2 }]} onPress={calculateBoth}>
                <Text style={styles.computeBtnText}>Calculate</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.compCol}>
              <Text style={styles.resultLabel}>Linear Attenuation Coefficient (μ):</Text>
              <View style={styles.resultBox}>
                <Text style={styles.resultValue}>{mu ? `${mu} 1/cm` : '—'}</Text>
              </View>

              <Text style={[styles.resultLabel, { marginTop: 10 }]}>
                Mass Attenuation Coefficient (μ/ρ):
              </Text>
              <View style={styles.resultBox}>
                <Text style={styles.resultValue}>{mumuRho ? `${mumuRho} cm²/g` : '—'}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.note}>
            Tip: Fill inputs on the left, then tap “Calculate” to get both coefficients.
          </Text>
        </View>
      </View>
    </View>
  );
}

// --- STYLES ---
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

  // preset time styles (unchanged)
  presetLabel: { fontWeight: '800' },
  presetInput: {
    width: 120,
    height: 36,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    paddingHorizontal: 8,
    textAlign: 'center',
  },

  absorberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  absorberLabel: { fontWeight: '800' },
  absorberInput: {
    width: 180,
    height: 36,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    paddingHorizontal: 8,
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
    width: '18%',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 11,
  },
  cellSno: { width: '10%' },
  cellData: { width: '18%' },
  headCell: { fontSize: 13 },
  inputCell: {
    width: '18%',
    paddingVertical: 9,
    paddingHorizontal: 4,
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
    position: 'relative',
  },
  xAxisLabel: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 12,
    color: '#555',
    zIndex: 2,
  },
  yAxisLabel: {
    position: 'absolute',
    left: -4,
    top: '45%',
    transform: [{ rotate: '-90deg' }],
    fontSize: 12,
    color: '#555',
    zIndex: 2,
  },
  computeWrapRow: {
    borderTopWidth: 1,
    borderColor: '#999',
    paddingTop: 10,
    flexDirection: 'row',
    gap: 16,
  },
  compCol: { flex: 1, gap: 10 },
  compRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  compLabel: { fontWeight: '700', width: 150 },
  compInput: {
    flex: 1,
    height: 36,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  computeBtn: {
    backgroundColor: '#808080',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  computeBtnText: { fontWeight: '800', color: '#fff' },
  resultLabel: { fontSize: 14, fontWeight: '600' },
  resultBox: {
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  resultValue: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  note: { color: '#a33', marginTop: 6 },
});
