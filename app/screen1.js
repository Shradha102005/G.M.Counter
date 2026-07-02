// app/screen1.js
import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Table, Row } from 'react-native-table-component';
import { LineChart } from 'react-native-chart-kit';

// ✅ FIXED: Use Expo Router (NOT React Navigation)
import { useRouter } from "expo-router";

export default function Screen1() {
  const [selectedSection, setSelectedSection] = useState('study');
  const [graphBoxWidth, setGraphBoxWidth] = useState(0);
  const [tableData, setTableData] = useState([
    ['1', '330', '0', '0', '0'],
    ['2', '360', '1710', '35', '1675'],
    ['3', '390', '1728', '35', '1693'],
    ['4', '420', '1743', '35', '1708'],
    ['5', '450', '1784', '36', '1748'],
    ['6', '480', '1792', '36', '1756'],
    ['7', '510', '1802', '37', '1765'],
    ['8', '540', '1818', '39', '1779'],
    ['9', '570', '1821', '40', '1781'],
    ['10', '600', '2607', '76', '2531'],
    ['11', '630', '3475', '76', '3399'],
  ]);

  const router = useRouter();   // ← FIXED

  const tableHead = [
    'S.No.',
    'EHT (Volts)',
    'Counts N\n(30 sec)',
    'Background Counts Nᵦ\n(30 sec)',
    'Corrected Counts N꜀\n(30 sec)',
  ];

  const updateCell = (text, rowIndex, colIndex) => {
    const updated = [...tableData];
    updated[rowIndex][colIndex] = text;

    if (colIndex === 2 || colIndex === 3) {
      const counts = parseInt(updated[rowIndex][2]) || 0;
      const background = parseInt(updated[rowIndex][3]) || 0;
      updated[rowIndex][4] = (counts - background).toString();
    }

    setTableData(updated);
  };

  const xValues = tableData.map((row) => parseInt(row[1]) || 0);
  const yValues = tableData.map((row) => parseInt(row[4]) || 0);
  const chartWidth = Math.max(280, graphBoxWidth - 24);
  const chartContentWidth = Math.max(chartWidth, xValues.length * 60);

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F1BE' }}>
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.brand}>GM LAB</Text>

          {/* ✅ FIXED NAVIGATION */}
          <TouchableOpacity
            style={styles.dataBtn}
            onPress={() => router.push('/screen1_dataentry')}
          >
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

      <View style={styles.separator} />

      {/* Main layout */}
      <View style={styles.container}>

        {/* Left Pane */}
        <View style={styles.leftPane}>
          {[
            { key: 'study', label: 'GM Characteristics' },
            { key: 'table', label: 'Table : EHT vs Counts' },
            { key: 'analysis', label: 'Graph : Counts vs EHT' },
            { key: 'conclusion', label: 'Conclusion' },
          ].map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setSelectedSection(key)}
              style={[
                styles.tabItem,
                selectedSection === key && styles.activeTabItem,
              ]}
            >
              <Text style={styles.subHeading}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Right Pane */}
        <ScrollView style={styles.rightPane}>

          <View style={styles.titleWrap}>
            <Text style={styles.title}>Characteristics of a GM Tube</Text>
          </View>

          {/* STUDY SECTION */}
          {selectedSection === 'study' && (
            <>
              <Text style={styles.sectionTitle}>PURPOSE</Text>
              <Text style={styles.paragraph}>
                To study the variations of countrate with applied voltage...
              </Text>

              <Text style={styles.sectionTitle}>EQUIPMENT REQUIRED</Text>
              <Text style={styles.paragraph}>• G.M. Counting System GC603T</Text>

              <Text style={styles.sectionTitle}>PROCEDURE</Text>
              <Text style={styles.paragraph}>• Make the connection between the counting system...</Text>
            </>
          )}

          {/* TABLE SECTION */}
          {selectedSection === 'table' && (
            <>
              <ScrollView horizontal>
                <View style={{ marginBottom: 20, borderWidth: 1.5, borderColor: '#808080', backgroundColor: '#fff' }}>
                  <Table borderStyle={{ borderWidth: 0, borderColor: '#808080' }}>
                    <Row
                      data={tableHead}
                      style={{ height: 65, backgroundColor: '#d9d9d9' }}
                      textStyle={{ textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#000' }}
                    />

                    {tableData.map((row, rowIndex) => (
                      <View key={rowIndex} style={{ flexDirection: 'row' }}>
                        {row.map((cell, colIndex) => (
                          <View
                            key={colIndex}
                            style={{
                              flex: 1,
                              minWidth: 120,
                              borderWidth: 0.7,
                              borderColor: '#808080',
                              justifyContent: 'center',
                              paddingVertical: 9,
                              backgroundColor: '#fff',
                            }}
                          >
                            <Text style={{ textAlign: 'center', fontSize: 14.5, fontWeight: '600', color: '#000' }}>
                              {cell.toString()}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ))}
                  </Table>
                </View>
              </ScrollView>
            </>
          )}

          {/* GRAPH SECTION */}
          {selectedSection === 'analysis' && (
            <>
              <Text style={styles.sectionTitle}>Analysis & Computation</Text>

              <View style={styles.chartBox} onLayout={(event) => setGraphBoxWidth(event.nativeEvent.layout.width)}>
                <Text style={styles.chartTitle}>G.M. Characteristics</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator>
                  <LineChart
                    data={{
                      labels: xValues.map(String),
                      datasets: [{ data: yValues }],
                    }}
                    width={chartContentWidth}
                    height={350}
                    chartConfig={{
                      backgroundGradientFrom: '#fff',
                      backgroundGradientTo: '#fff',
                      decimalPlaces: 0,
                      color: () => '#000',
                      labelColor: () => '#000',
                      propsForDots: { r: '3', strokeWidth: '1', stroke: '#000', fill: '#000' },
                    }}
                    withShadow={false}
                    withInnerLines={false}
                    withOuterLines
                    bezier={false}
                    style={{ alignSelf: 'center' }}
                  />
                </ScrollView>

                <View style={styles.axisLabels}>
                  <Text style={styles.yLabel}>Corrected Counts (30 s)</Text>
                  <Text style={styles.xLabel}>EHT (Volts)</Text>
                </View>
              </View>
            </>
          )}

          {/* CONCLUSION SECTION */}
          {selectedSection === 'conclusion' && (
            <>
              <Text style={styles.sectionTitle}>CONCLUSIONS</Text>
              <Text style={styles.paragraph}>
                The mid point of the plateau is defined as the operating voltage...
              </Text>
            </>
          )}

        </ScrollView>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  leftPane: { width: '30%', backgroundColor: '#d0cfcfff' },
  tabItem: { paddingVertical: 15, paddingLeft: 10 },
  activeTabItem: { backgroundColor: '#a9a9a9' },
  subHeading: { fontSize: 16, fontWeight: 'bold' },
  rightPane: { width: '70%', paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#F7F1BE' },
  titleWrap: { height: 64, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', textDecorationLine: 'underline' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 10, marginBottom: 10 },
  paragraph: { fontSize: 16, marginBottom: 10 },
  chartBox: { marginTop: 20, padding: 10, borderWidth: 1, borderColor: '#000', backgroundColor: '#fff' },
  chartTitle: { textAlign: 'center', fontWeight: 'bold', marginBottom: 10, fontSize: 16 },
  axisLabels: { marginTop: 8, alignItems: 'center' },
  xLabel: { fontSize: 14, fontWeight: 'bold' },
  yLabel: { position: 'absolute', left: -150, top: 100, transform: [{ rotate: '-90deg' }], fontSize: 14, fontWeight: 'bold' },
  topBar: { flexDirection: 'row', height: 80, width: '100%' },
  topLeft: { flex: 1, backgroundColor: '#d0cfcfff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  brand: { fontSize: 38, fontWeight: '700' },
  dataBtn: { paddingVertical: 11, paddingHorizontal: 18, borderRadius: 10, backgroundColor: '#f6f4f4ff', borderWidth: 1, borderColor: '#cfcfcf', marginLeft: 30 },
  dataBtnText: { fontWeight: '700' },
  topRight: { flex: 2.5, backgroundColor: '#2b78c5', justifyContent: 'center', alignItems: 'flex-end', paddingRight: 20 },
  logo: { width: 70, height: 70 },
  separator: { height: 1, backgroundColor: '#000', width: '100%' },
});
