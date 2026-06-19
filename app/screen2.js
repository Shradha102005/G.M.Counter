// app/screen2.js (Inverse Square Law)

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';

import { Table, Row, Rows } from 'react-native-table-component';
import { useRouter } from "expo-router";   // Expo Router navigation

import Exp2Img from '../assets/images/im.jpeg';
import DistanceImg from '../assets/images/distance.jpeg';
import SqDistanceImg from '../assets/images/sqdistance.jpeg';
import LogDImg from '../assets/images/logd.jpeg';

export default function Screen2() {
  const [selectedSection, setSelectedSection] = useState('purpose');
  const router = useRouter();

  const compHead = [
    'S.No.',
    'Distance (cm)',
    'Corrected Counts (60s)',
    'Net R (1/s)',
    'C = R·d²',
    '1/d² (1/m²)',
  ];

  const compData = [
    ['1', '2.0', '13440', '224.0', '896', '2500'],
    ['2', '2.5', '9216', '153.4', '954', '1600'],
    ['3', '3.0', '6133', '102.2', '920', '1111'],
    ['4', '3.5', '4663', '77.38','952', '816'],
    ['5', '4.0', '3525', '58.75','940', '625'],
    ['6', '4.5', '2750', '45.83','929', '493'],
    ['7', '5.0', '2125', '35.42','886', '400'],
    ['8', '5.5', '1768', '29.46','891', '330'],
    ['9', '6.0', '1469', '24.83','882', '278'],
    ['10','6.5', '1194', '19.90','840', '236'],
    ['11','7.0', '1002', '16.60','851', '204'],
  ];

  const logTableData = [
    ['1', '2.0', '0.3010', '224', '2.3502'],
    ['2', '2.5', '0.3979', '153.4', '2.1858'],
    ['3', '3.0', '0.4770', '102.2', '2.0094'],
    ['4', '3.5', '0.5440', '77.38', '1.8886'],
    ['5', '4.0', '0.6020', '58.75', '1.7690'],
    ['6', '4.5', '0.6532', '45.83', '1.6611'],
    ['7', '5.0', '0.6989', '35.42', '1.5491'],
    ['8', '5.5', '0.7403', '29.46', '1.4693'],
    ['9', '6.0', '0.7781', '24.48', '1.3888'],
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F1BE' }}>

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.brand}>GM LAB</Text>

          {/* FIXED Expo Router Navigation */}
          <TouchableOpacity
            style={styles.dataBtn}
            onPress={() => router.push('/screen2_dataentry')}
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

      <View style={styles.topSeparator} />

      {/* Main Layout */}
      <View style={styles.container}>
        
        {/* LEFT MENU */}
        <View style={styles.leftPane}>
          {[
            { key: 'purpose', label: 'Inverse Square Law : Gamma Rays' },
            { key: 'computations', label: 'Computation & Analysis' },
            { key: 'graph1', label: 'Graph: R vs Distance' },
            { key: 'graph2', label: 'Graph: R vs 1/d²' },
            { key: 'graph3', label: 'Graph: Log R vs Log d' },
            { key: 'table2', label: 'Table: Log R vs Log d' },
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

        {/* RIGHT CONTENT */}
        <ScrollView style={styles.rightPane}>
          
          <View style={styles.titleWrap}>
            <Text style={styles.title}>INVERSE SQUARE LAW: Gamma Rays</Text>
          </View>

          {/* PURPOSE SECTION */}
          {selectedSection === 'purpose' && (
            <>
              <Text style={styles.sectionTitle}>PURPOSE</Text>
              <Text style={styles.paragraph}>
                The inverse square law states that gamma radiation intensity falls inversely
                as the square of distance from the source.
              </Text>

              <Image source={Exp2Img} style={styles.image} resizeMode="contain" />
            </>
          )}

          {/* COMPUTATION TABLE */}
          {selectedSection === 'computations' && (
            <>
              <Text style={styles.sectionTitle}>Computation & Analysis</Text>

              <ScrollView horizontal>
                <View style={[styles.tableWrapper, { width: 850 }]}>
                  <Table borderStyle={styles.tableBorder}>
                    <Row data={compHead} style={styles.head} textStyle={styles.text} />
                    <Rows data={compData} textStyle={styles.text} />
                  </Table>
                </View>
              </ScrollView>
            </>
          )}

          {/* Graph Images */}
          {selectedSection === 'graph1' && (
            <>
              <Text style={styles.sectionTitle}>Graph: R vs Distance</Text>
              <Image source={DistanceImg} style={[styles.image, { height: 500 }]} />
            </>
          )}

          {selectedSection === 'graph2' && (
            <>
              <Text style={styles.sectionTitle}>Graph: R vs 1/d²</Text>
              <Image source={SqDistanceImg} style={[styles.image, { height: 500 }]} />
            </>
          )}

          {selectedSection === 'graph3' && (
            <>
              <Text style={styles.sectionTitle}>Graph: Log R vs Log d</Text>
              <Image source={LogDImg} style={[styles.image, { height: 500 }]} />
            </>
          )}

          {/* WIDE LOG TABLE */}
          {selectedSection === 'table2' && (
            <>
              <Text style={styles.sectionTitle}>Table: Log R vs Log d</Text>

              <ScrollView horizontal>
                <View style={[styles.tableWrapper, { width: 950 }]}>  
                  <Table borderStyle={styles.tableBorder}>
                    <Row
                      data={['S.No.', 'd (cm)', 'Log d', 'R', 'Log R']}
                      style={[styles.head, { height: 45 }]}
                      textStyle={[styles.text, { fontSize: 15 }]}
                    />
                    <Rows
                      data={logTableData}
                      textStyle={[styles.text, { fontSize: 14 }]}
                    />
                  </Table>
                </View>
              </ScrollView>
            </>
          )}

        </ScrollView>
      </View>
    </View>
  );
}



/* ----------------- STYLES ----------------- */

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },

  leftPane: { width: '30%', backgroundColor: '#d0cfcfff' },
  tabItem: { paddingVertical: 15, paddingLeft: 10 },
  activeTabItem: { backgroundColor: '#a9a9a9' },
  subHeading: { fontSize: 16, fontWeight: 'bold' },

  rightPane: {
    width: '70%',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#F7F1BE',
  },

  titleWrap: { height: 64, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  paragraph: { fontSize: 16, marginBottom: 10, lineHeight: 22 },

  image: { width: '95%', height: 330, marginTop: 20, marginBottom: 10 },

  head: { height: 50, backgroundColor: '#bfbfbf' },
  text: { margin: 6, textAlign: 'center', fontSize: 14 },

  tableWrapper: {
    backgroundColor: '#fff',
    padding: 5,
    borderWidth: 1.5,
    borderColor: '#808080',
  },

  tableBorder: { borderWidth: 1, borderColor: '#808080' },

  /* Top Bar */
  topBar: { flexDirection: 'row', height: 80, width: '100%' },
  topLeft: {
    flex: 1,
    backgroundColor: '#d0cfcfff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
});
