import React, { useEffect, useRef, useState } from 'react';
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
import { File } from 'expo-file-system';
import { useRouter } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as XLSX from 'xlsx';

const normalizeHeader = (value) =>
  (value ?? '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const findCountColumn = (rows) => {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] || [];
    let countIndex = -1;

    row.forEach((cell, cellIndex) => {
      const header = normalizeHeader(cell);
      if (countIndex === -1 && (header === 'count' || header === 'counts' || header === 'npreset' || header === 'n')) {
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

const tableConfigs = {
  al_perspex: {
    label: 'For Al (0.7mm) & Perspex (1.8mm) combination',
    columns: ['S.No', 'Absorber position', 'Counts', 'Net Counts'],
    initialRows: [
      ['1', 'Without Absorber', '', ''],
      ['2', 'Perspex facing source', '', ''],
      ['3', 'Al. facing source', '', ''],
    ],
  },
  perspex_cu: {
    label: 'For Perspex (1.8mm) & Cu (0.3mm) combination',
    columns: ['S.No', 'Absorber position', 'Counts', 'Net Counts'],
    initialRows: [
      ['1', 'Without Absorber', '', ''],
      ['2', 'Cu facing source', '', ''],
      ['3', 'Perspex facing source', '', ''],
    ],
  },
  al_cu: {
    label: 'For Al (0.7mm) & Cu (0.3mm) combination',
    columns: ['S.No', 'Absorber position', 'Counts', 'Net Counts'],
    initialRows: [
      ['1', 'Without Absorber', '', ''],
      ['2', 'Al facing source', '', ''],
      ['3', 'Cu facing source', '', ''],
    ],
  },
};

const tableOrder = [
  { key: 'al_perspex', label: 'Al (0.7mm) + Perspex (1.8mm)' },
  { key: 'perspex_cu', label: 'Perspex (1.8mm) + Cu (0.3mm)' },
  { key: 'al_cu', label: 'Al (0.7mm) + Cu (0.3mm)' },
];

export default function Screen8DataEntry() {
  const router = useRouter();
  const contentRef = useRef(null);
  const [selectedTable, setSelectedTable] = useState(tableOrder[0].key);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bgCount, setBgCount] = useState('');
  const [tables, setTables] = useState(() =>
    tableOrder.reduce((accumulator, item) => {
      accumulator[item.key] = tableConfigs[item.key].initialRows.map((row) => [...row]);
      return accumulator;
    }, {})
  );

  const selectTable = (key) => {
    setSelectedTable(key);
    setDropdownOpen(false);
  };

  // Net Counts = Counts − Background
  // Formula: Net Counts = Counts (observed) − Background Count
  const recomputeNetCounts = (rows, bg) => {
    const bgVal = Number(bg);
    const bgValid = Number.isFinite(bgVal) && bg !== '';
    return rows.map((row) => {
      const count = Number(row[2]);
      if (!bgValid || row[2] === '') return [row[0], row[1], row[2], ''];
      const net = count - bgVal;
      return [row[0], row[1], row[2], net.toFixed(2)];
    });
  };

  // Recompute all tables when background count changes
  useEffect(() => {
    setTables((prev) =>
      tableOrder.reduce((acc, item) => {
        acc[item.key] = recomputeNetCounts(prev[item.key], bgCount);
        return acc;
      }, {})
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgCount]);

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

      setTables((prev) => ({
        ...prev,
        [selectedTable]: recomputeNetCounts(
          prev[selectedTable].map((row, rowIndex) => {
            const countValue = importedCounts[rowIndex] ?? '';
            return [row[0], row[1], countValue, ''];
          }),
          bgCount
        ),
      }));

      Alert.alert('Import Complete', `Loaded ${importedCounts.length} count value(s) from ${asset.name || 'the Excel file'}.`);
    } catch (error) {
      console.error('Excel import error:', error);
      Alert.alert('Import Error', `Could not import the Excel file: ${error.message || error}`);
    }
  };

  const updateCell = (tableKey, rowIndex, colIndex, text) => {
    setTables((prev) => {
      const updated = prev[tableKey].map((row, currentRowIndex) =>
        currentRowIndex === rowIndex
          ? row.map((cell, currentColIndex) => (currentColIndex === colIndex ? text : cell))
          : row,
      );
      // If Counts column (index 2) changed, recompute Net Counts for whole table
      const recomputed = colIndex === 2 ? recomputeNetCounts(updated, bgCount) : updated;
      return { ...prev, [tableKey]: recomputed };
    });
  };

  const saveImage = async () => {
    try {
      if (!contentRef.current) {
        Alert.alert('Error', 'Content not ready for capture.');
        return;
      }

      const uri = await captureRef(contentRef.current, { format: 'png', quality: 1 });
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

  const activeConfig = tableConfigs[selectedTable];
  const activeRows = tables[selectedTable];
  const activeLabel = tableOrder.find((t) => t.key === selectedTable)?.label ?? '';

  const clearData = () => {
    Alert.alert('Clear All Data', 'This will reset all three tables. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive', onPress: () => {
          setBgCount('');
          setTables(
            tableOrder.reduce((acc, item) => {
              acc[item.key] = tableConfigs[item.key].initialRows.map((row) => [...row]);
              return acc;
            }, {})
          );
        },
      },
    ]);
  };

  return (
    <View style={styles.screen} ref={contentRef} collapsable={false}>
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

      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        persistentScrollbar={true}
      >
        <Text style={styles.pageTitle}>Production and Attenuation of Bremsstrahlung</Text>

        {/* ── Background input ── */}
        <View style={styles.bgRow}>
          <Text style={styles.bgLabel}>Background</Text>
          <TextInput
            style={styles.bgInput}
            keyboardType="numeric"
            value={bgCount}
            onChangeText={setBgCount}
            placeholder="0"
          />
        </View>

        {/* ── Dropdown picker ── */}
        <View style={styles.dropdownWrapper}>
          {/* Trigger button */}
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setDropdownOpen((prev) => !prev)}
            activeOpacity={0.85}
          >
            <Text style={styles.dropdownBtnText} numberOfLines={1}>
              {activeLabel}
            </Text>
            <Text style={styles.dropdownArrow}>{dropdownOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {/* Dropdown list */}
          {dropdownOpen && (
            <View style={styles.dropdownList}>
              <ScrollView
                style={styles.dropdownScroll}
                showsVerticalScrollIndicator={true}
                persistentScrollbar={true}
                nestedScrollEnabled={true}
              >
                {tableOrder.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.dropdownItem,
                      item.key === selectedTable && styles.dropdownItemActive,
                    ]}
                    onPress={() => selectTable(item.key)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        item.key === selectedTable && styles.dropdownItemTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* ── Active table ── */}
        <View style={styles.tableSection}>
          <Text style={styles.sectionTitle}>{activeConfig.label}</Text>
          <View style={styles.tableBox}>
            {/* Header row */}
            <View style={[styles.row, styles.headRow]}>
              {activeConfig.columns.map((col, colIndex) => (
                <Text
                  key={col}
                  style={[
                    styles.cell,
                    styles.headCell,
                    colIndex === 0 && styles.colSno,
                    colIndex === 1 && styles.colAbsorber,
                    colIndex === 2 && styles.colCounts,
                    colIndex === 3 && styles.colNetCounts,
                  ]}
                >
                  {col}
                </Text>
              ))}
            </View>
            {/* Data rows */}
            {activeRows.map((row, rowIndex) => (
              <View key={row[0]} style={[styles.row, rowIndex % 2 === 1 && styles.rowAlt]}>
                {row.map((cell, colIndex) => (
                  <TextInput
                    key={`${selectedTable}-${rowIndex}-${colIndex}`}
                    style={[
                      // Net Counts (col 3) and S.No (col 0) are read-only
                      colIndex === 0 || colIndex === 3 ? styles.snoCell : styles.inputCell,
                      colIndex === 0 && styles.colSno,
                      colIndex === 1 && styles.colAbsorber,
                      colIndex === 2 && styles.colCounts,
                      colIndex === 3 && styles.colNetCounts,
                    ]}
                    value={cell}
                    editable={colIndex !== 0 && colIndex !== 3}
                    onChangeText={(text) => updateCell(selectedTable, rowIndex, colIndex, text)}
                    keyboardType={colIndex === 2 ? 'numeric' : 'default'}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* ── Action buttons ── */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.bigBtn} onPress={importExcelFile}>
            <Text style={styles.bigBtnText}>Upload Excel</Text>
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
      </ScrollView>
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
  contentScroll: { flex: 1, backgroundColor: '#F7F1BE' },
  content: { padding: 12, backgroundColor: '#F7F1BE' },
  pageTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },

  /* Dropdown */
  dropdownWrapper: {
    marginBottom: 14,
    zIndex: 100,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0efefff',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  dropdownBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 13,
    color: '#555',
    marginLeft: 8,
  },
  dropdownList: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    zIndex: 200,
  },
  dropdownScroll: {
    maxHeight: 180,
  },
  dropdownItem: {
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dropdownItemActive: {
    backgroundColor: '#dce8f7',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownItemTextActive: {
    fontWeight: '700',
    color: '#2b78c5',
  },

  /* Table */
  tableSection: { marginBottom: 14 },
  tableBox: {
    borderWidth: 1.5,
    borderColor: '#999',
    backgroundColor: '#fff',
    borderRadius: 6,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', width: '100%' },
  rowAlt: { backgroundColor: '#f9f9f9' },
  headRow: { backgroundColor: '#a6a6a6' },

  /* Column flex widths */
  colSno:       { flex: 0.55 },
  colAbsorber:  { flex: 2.4 },
  colCounts:    { flex: 1.1 },
  colNetCounts: { flex: 1.1 },

  /* Shared cell base */
  cell: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderWidth: 0.5,
    borderColor: '#ccc',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 12,
  },
  headCell: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111',
    paddingVertical: 14,
  },
  inputCell: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderWidth: 0.5,
    borderColor: '#ccc',
    textAlign: 'center',
    backgroundColor: '#fff',
    fontSize: 13,
    color: '#222',
  },
  snoCell: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderWidth: 0.5,
    borderColor: '#ccc',
    textAlign: 'center',
    backgroundColor: '#e0e0e0',
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10, color: '#1a1a1a' },

  /* Background input row */
  bgRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  bgLabel: { fontWeight: '800', fontSize: 15 },
  bgInput: {
    width: 120,
    height: 38,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  bgFormula: { fontSize: 13, fontWeight: '600', color: '#444', marginLeft: 6 },

  /* Action buttons */
  controlsRow: { flexDirection: 'row', gap: 12, marginTop: 12, marginBottom: 20 },
  bigBtn: {
    backgroundColor: '#808080',
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  bigBtnText: { fontWeight: '800', color: '#fff', fontSize: 15 },
});