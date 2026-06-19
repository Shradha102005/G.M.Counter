// app/screen3_dataentry.js
import * as MediaLibrary from 'expo-media-library';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
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
import { File } from 'expo-file-system';
import * as XLSX from 'xlsx';

const DEFAULT_ROW_COUNT = 10;
const BOX_HEIGHT = 440;
const CELL_W = 107;
const SNO_W = 50;
const SIDE_GAP = 14;

const normalizeHeader = (value) =>
  (value ?? '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const findNiColumn = (rows) => {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] || [];
    let niIndex = -1;

    row.forEach((cell, cellIndex) => {
      const header = normalizeHeader(cell);
      if (
        niIndex === -1 &&
        (header === 'count' || header === 'counts' || header === 'ni' || header === 'n' || header === 'n1')
      ) {
        niIndex = cellIndex;
      }
    });

    if (niIndex !== -1) {
      return { headerRowIndex: rowIndex, niIndex };
    }
  }

  return null;
};

const formatCellText = (value) => {
  if (value === null || value === undefined) return '';
  return value.toString().trim();
};

const getRowCount = (rawN) => {
  const digitsOnly = (rawN ?? '').toString().replace(/\D/g, '');
  if (!digitsOnly) return DEFAULT_ROW_COUNT;
  const parsed = parseInt(digitsOnly, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_ROW_COUNT;
  return Math.max(1, Math.min(50, parsed));
};

export default function Screen3DataEntry() {
  const router = useRouter();
  const contentRef = useRef(null);

  // number of readings (controls table rows)
  const [n, setN] = useState(String(DEFAULT_ROW_COUNT));

  // rows: Ni column is editable; other columns are derived
  const rows = useMemo(() => {
    const count = getRowCount(n);
    return Array.from({ length: count }).map((_, i) => ({
      sno: String(i + 1),
      Ni: '',
    }));
  }, [n]);

  const [NiValues, setNiValues] = useState({}); // { rowIndex: "value" }
  const setNiAt = (idx, val) => setNiValues(prev => ({ ...prev, [idx]: val }));

  const clearData = () => {
    Alert.alert('Clear All Data', 'This will reset all readings. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive', onPress: () => {
          setNiValues({});
          setN(String(DEFAULT_ROW_COUNT));
        },
      },
    ]);
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
      const mapping = findNiColumn(sheetRows);

      if (!mapping) {
        Alert.alert('Import Error', 'Could not find a Count / Ni column in the selected sheet.');
        return;
      }

      const imported = sheetRows
        .slice(mapping.headerRowIndex + 1)
        .filter((row) => (row || []).some((cell) => formatCellText(cell) !== ''))
        .map((row) => formatCellText(row[mapping.niIndex]))
        .filter((value) => value !== '');

      if (!imported.length) {
        Alert.alert('Import Error', 'No Ni values were found below the header row.');
        return;
      }

      const nextValues = {};
      imported.forEach((value, index) => {
        nextValues[index] = value;
      });

      setN(String(imported.length));
      setNiValues(nextValues);

      Alert.alert('Import Complete', `Loaded ${imported.length} Ni value(s) from ${asset.name || 'the Excel file'}.`);
    } catch (error) {
      console.error('Excel import error:', error);
      Alert.alert('Import Error', `Could not import the Excel file: ${error.message || error}`);
    }
  };

  // TEMP store for computed N (average) so it's accessible if you wish to read it imperatively
  const computedNARef = useRef(null);

  // Compute N = average of Ni (only over rows present and numeric)
  const N = useMemo(() => {
    const count = getRowCount(n);
    const vals = [];
    for (let i = 0; i < count; i++) {
      const raw = (NiValues[i] ?? '').toString().trim();
      if (raw === '') continue;
      const v = parseFloat(raw);
      if (isFinite(v)) vals.push(v);
    }
    if (vals.length === 0) {
      computedNARef.current = NaN;
      return NaN;
    }
    const sum = vals.reduce((s, x) => s + x, 0);
    const avg = sum / vals.length;
    computedNARef.current = avg;
    return avg;
  }, [NiValues, n]);

  // Compute derived values for each row based on N
  // di = Ni - N
  // sigma = sqrt(N)
  // z = (Ni - N) / sigma
  // zRound = Math.round(z)   (we show rounded integer)
  // NOTE: all table values (di, sigma, z and displayed N above) must show 1 decimal place
  const derived = useMemo(() => {
    const count = getRowCount(n);
    const sigmaVal = Number.isFinite(N) && N > 0 ? Math.sqrt(N) : NaN;
    const out = [];
    for (let i = 0; i < count; i++) {
      const raw = (NiValues[i] ?? '').toString().trim();
      const Ni = raw === '' ? NaN : parseFloat(raw);
      const di = Number.isFinite(Ni) && Number.isFinite(N) ? Ni - N : NaN;
      const sig = Number.isFinite(sigmaVal) ? sigmaVal : NaN;
      const z = Number.isFinite(di) && Number.isFinite(sig) && sig !== 0 ? di / sig : NaN;
      const zRnd = Number.isFinite(z) ? Math.round(z) : NaN;
      // Format to 1 decimal place where requested
      const diFmt = Number.isFinite(di) ? Number(di.toFixed(1)) : '';
      const sigmaFmt = Number.isFinite(sig) ? Number(sig.toFixed(1)) : '';
      const zFmt = Number.isFinite(z) ? Number(z.toFixed(1)) : '';
      const zRoundStr = Number.isFinite(zRnd) ? String(zRnd) : '';
      out.push({
        Ni: Number.isFinite(Ni) ? Ni : '',
        di: diFmt,
        sigma: sigmaFmt,
        z: zFmt,
        zRound: zRoundStr,
      });
    }
    return out;
  }, [NiValues, N, n]);

  // build distribution plot over frequency of rounded z (use derived zRound values)
  const chartData = useMemo(() => {
    // Gather rounded z values from derived array
    const allXVals = derived
      .map(d => {
        const v = d.zRound;
        return v === '' ? NaN : Number(v);
      })
      .filter(v => !isNaN(v));
    
    if (allXVals.length === 0) {
      // Must return valid structure even if empty
      return { labels: ['0'], datasets: [{ data: [0] }] };
    }
    
    // 1. Frequency map: { roundedValue: frequencyCount }
    const freqMap = {};
    allXVals.forEach(x => { freqMap[x] = (freqMap[x] || 0) + 1; });
    
    // 2. Extract unique rounded values and sort them (Labels/X-axis)
    const xs = Object.keys(freqMap).map(Number).sort((a, b) => a - b);
    
    // 3. Extract the corresponding frequencies (Data/Y-axis)
    const ys = xs.map(x => freqMap[x]);

    // Format for LineChart component
    return {
      // Use the actual rounded values as labels for the X-axis
      labels: xs.map(x => x.toString()),
      // Datasets now contains the actual frequencies (Y-values)
      datasets: [{ data: ys, strokeWidth: 2 }],
    };
  }, [derived]);

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

  // layout math to give panels equal width
  const screenW = Dimensions.get('window').width;
  const innerPad = 14 * 2; // panel horizontal padding
  const available = screenW - 14 * 2 - SIDE_GAP - 2; // content padding + gap + tiny fudge
  const panelWidth = Math.floor(available / 2);       // equal width for left & right

  // ✅ FIXED: chart height no longer grows with number of rows
  const scaledChartHeight = BOX_HEIGHT - 40;

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
        {/* Enter n */}
        <View style={styles.nRow}>
          <Text style={styles.nLabel}>Enter No of Readings, n</Text>
          <TextInput
            value={n}
            onChangeText={(t) => setN((t || '').replace(/\D/g, ''))}
            keyboardType="numeric"
            style={styles.nInput}
          />
          {/* Show computed N for user visibility (1 decimal place) */}
          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontWeight: '800' }}>N (avg)</Text>
            <Text style={{ fontSize: 16, marginTop: 4 }}>
              {Number.isFinite(N) ? Number(N.toFixed(1)) : '—'}
            </Text>
          </View>
        </View>

        {/* Equal panels */}
        <View style={styles.content}>
        {/* LEFT: Table (styled like screen1 table) */}
        <View style={[styles.panel, { height: BOX_HEIGHT, width: panelWidth }]}>
          <View style={styles.tableBox}>
            {/* 1. Horizontal Scroll for the entire column structure */}
            <ScrollView
              horizontal
              style={styles.tableScrollX}
              contentContainerStyle={{ paddingRight: 0 }}
              showsHorizontalScrollIndicator={true}
            >
              <View style={{ alignSelf: 'flex-start' }}>
                {/* Header (measures height, moves horizontally) */}
                <View style={[styles.row, styles.headRow]}>
                  {['S.No.', 'Ni', 'di=(Ni−N)', '√N or σ', '(Ni−N)/σ', '(Ni−N)/σ (Rnd)'].map((h, idx) => (
                    <Text
                      key={idx}
                      style={[
                        styles.cell,
                        styles.headCell,
                        { width: idx === 0 ? SNO_W : CELL_W },
                      ]}
                    >
                      {h}
                    </Text>
                  ))}
                </View>

                {/* 2. Vertical Scroll for data rows only */}
                <ScrollView 
                  showsVerticalScrollIndicator={true}
                  style={{ flex: 1 }}
                  contentContainerStyle={{ flexDirection: 'column' }} 
                >
                  {rows.map((r, i) => {
                    const d = derived[i] || { Ni: '', di: '', sigma: '', z: '', zRound: '' };
                    return (
                      <View key={i} style={styles.row}>
                        {/* S.No. */}
                        <Text style={[styles.cell, styles.readOnly, { width: SNO_W }]}>{r.sno}</Text>
                        {/* Ni (editable) */}
                        <TextInput
                          value={NiValues[i] ?? ''}
                          onChangeText={t => setNiAt(i, t)}
                          keyboardType="numeric"
                          style={[styles.inputCell, { width: CELL_W }]}
                        />
                        {/* di (computed, 1 decimal) - auto colored */}
                        <TextInput
                          value={d.di === '' ? '' : String(d.di)}
                          editable={false}
                          style={[styles.inputCell, styles.autoCell, { width: CELL_W }]}
                        />
                        {/* sigma (computed, 1 decimal) - auto colored */}
                        <TextInput
                          value={d.sigma === '' ? '' : String(d.sigma)}
                          editable={false}
                          style={[styles.inputCell, styles.autoCell, { width: CELL_W }]}
                        />
                        {/* z (computed, 1 decimal) - auto colored */}
                        <TextInput
                          value={d.z === '' ? '' : String(d.z)}
                          editable={false}
                          style={[styles.inputCell, styles.autoCell, { width: CELL_W }]}
                        />
                        {/* z rounded (computed, integer) - auto colored */}
                        <TextInput
                          value={d.zRound === '' ? '' : d.zRound}
                          editable={false}
                          style={[styles.inputCell, styles.autoCell, { width: CELL_W }]}
                        />
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Gap */}
        <View style={{ width: SIDE_GAP }} />

        {/* RIGHT: Graph (equal size, chart height fixed) */}
        <View style={[styles.panel, { height: BOX_HEIGHT, width: panelWidth }]}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.chartContainer}
            showsVerticalScrollIndicator
          >
            {/* Y-Axis Label: FREQUENCY OF OCCURRANCE (NOW IN ALL CAPS) */}
            <Text style={styles.yAxisLabel}>FREQUENCY OF OCCURRANCE</Text>
            
            <LineChart
              data={{
                labels: chartData.labels,
                datasets: chartData.datasets,
              }}
              width={panelWidth - innerPad}
              height={scaledChartHeight}
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: () => '#000',
                labelColor: () => '#000',
                propsForDots: { r: '3', strokeWidth: '1', stroke: '#000', fill: '#000' },
                propsForBackgroundLines: { strokeDasharray: '' },
              }}
              withInnerLines
              withOuterLines
              bezier={false}
              style={styles.chart}
              fromZero
            />

            {/* X-Axis Label: ROUNDED OF VALUES */}
            <Text style={styles.xAxisLabel}>ROUNDED OF VALUES</Text>
          </ScrollView>
        </View>
        </View>

        {/* Bottom actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.btn, styles.greyBtn]} onPress={importExcelFile}>
            <Text style={styles.btnText}>Upload Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.greyBtn]} onPress={clearData}>
            <Text style={styles.btnText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.greyBtn]} onPress={saveImage}>
            <Text style={styles.btnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.greyBtn]} onPress={() => router.push('/hub')}>
            <Text style={styles.btnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* --------------- Styles --------------- */
const styles = StyleSheet.create({
  // Top bar
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
  topRight: {
    flex: 2.5, backgroundColor: '#2b78c5',
    justifyContent: 'center', alignItems: 'flex-end', paddingRight: 20,
  },
  logo: { width: 70, height: 70 },
  topSeparator: { height: 2, backgroundColor: '#000', width: '100%' },

  captureArea: { flex: 1 },

  // n row
  nRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  nLabel: { fontWeight: '800', fontSize: 16 },
  nInput: {
    width: 110,
    height: 40,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    paddingHorizontal: 10,
    textAlign: 'center',
    fontSize: 16,
  },

  // panels
  content: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  panel: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#9e9e9e',
    borderRadius: 12,
    padding: 14,
  },

  /* ====== TABLE STYLES matching screen1 ====== */
  tableBox: {
    borderWidth: 1,
    borderColor: '#bbb',
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 0,
    marginBottom: 0,
    overflow: 'hidden',
    height: '100%',
  },
  tableScrollX: {},
  row: { flexDirection: 'row' },
  headRow: { backgroundColor: '#a6a6a6' },
  cell: {
    width: CELL_W,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 12,
  },
  headCell: { fontSize: 13 },
  inputCell: {
    width: CELL_W,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    textAlign: 'center',
    backgroundColor: '#fff',
    fontSize: 12,
  },
  // Slightly darker shade for auto-calculated/uneditable cells
  autoCell: {
    backgroundColor: '#f0f0f0',
  },
  readOnly: { backgroundColor: '#eee' },

  // actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 9,
  },
  greyBtn: { backgroundColor: '#808080' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  // CHART LABEL STYLES
  chartContainer: { 
    alignItems: 'center', 
    paddingVertical: 6,
    position: 'relative',
  },
  chart: { 
    alignSelf: 'center',
    marginLeft: 25,
  },
  yAxisLabel: {
    transform: [{ rotate: '-90deg' }],
    position: 'absolute',
    // ADJUSTED: Moved further left and added zIndex for visibility
    left: -45, 
    top: '50%',
    marginTop: -50,
    fontWeight: '700',
    fontSize: 11,
    color: '#000',
    zIndex: 10, 
  },
  xAxisLabel: {
    fontWeight: '700',
    fontSize: 11,
    marginTop: 5, 
    color: '#000',
  },
});