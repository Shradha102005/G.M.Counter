// app/screen5.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Screen5() {
  const [selectedSection, setSelectedSection] = useState('overview');
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F1BE' }}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.brand}>GM LAB</Text>
          <TouchableOpacity
            style={styles.dataBtn}
            onPress={() => navigation.navigate('screen5_dataentry')}
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

      {/* Two-column layout */}
      <View style={styles.container}>
        {/* Left Pane */}
        <View style={styles.leftPane}>
          {[
            { key: 'overview', label: 'Estimation of Efficiency of the G.M. Detector' },
            { key: 'comp1', label: 'Computations & Analysis' },
            { key: 'comp2', label: 'Computations & Analysis (contd.)' },
            { key: 'beta', label: 'Estimate Efficiency for a Beta Source' },
            { key: 'betaComp', label: 'Computations & Analysis — Beta' },
            { key: 'exercise', label: 'Exercise' },
          ].map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setSelectedSection(key)}
              style={[styles.tabItem, selectedSection === key && styles.activeTabItem]}
            >
              <Text style={styles.subHeading}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Right Pane */}
        <ScrollView style={styles.rightPane}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Efficiency of GM Detector</Text>
          </View>

          {/* -------- Overview -------- */}
          {selectedSection === 'overview' && (
            <>
              <Text style={styles.sectionTitle}>
                EXPERIMENT TO ESTIMATE EFFICIENCY FOR A GAMMA SOURCE
              </Text>

              <Text style={styles.sectionSubtitle}>INTRODUCTION</Text>
              <Text style={styles.paragraph}>
                By knowing the activity of a gamma source, it is possible to record
                counts with the source for a known preset time & estimate the efficiency
                of the G.M. detector.
              </Text>

              <Text style={styles.sectionSubtitle}>EQUIPMENT / ACCESSORIES REQUIRED</Text>
              <Text style={styles.paragraph}>{"\u2022"} G.M. Counting System GC 601A/ GC602A</Text>
              <Text style={styles.paragraph}>{"\u2022"} G.M. Detector / source holder stand (SG200) or bench (SB201)</Text>
              <Text style={styles.paragraph}>{"\u2022"} Radioactive source kit (SK210)</Text>
              <Text style={styles.paragraph}>{"\u2022"} G.M. detector in cylindrical enclosure (GM120)</Text>
              <Text style={styles.paragraph}>{"\u2022"} Necessary connecting cables</Text>

              <Text style={styles.sectionSubtitle}>PROCEDURE</Text>
              <Text style={styles.paragraph}>
                {"\u2022"} Make interconnections such as mains power cord to GC601A/602A unit
                and connection between G.M. detector holder mount to rear panel of
                GC601/602, through HV cable.
              </Text>
              <Text style={styles.paragraph}>
                {"\u2022"} Place a gamma source in the source holder facing the end window
                detector. Typically the distance between the source to end window of G.M.
                tube can be 10 cm.
              </Text>
              <Text style={styles.paragraph}>
                {"\u2022"} Now record counts for about 100 sec., both background and counts
                with source and make the following calculations and analysis.
              </Text>
            </>
          )}

          {/* -------- Computations & Analysis (Gamma) -------- */}
          {selectedSection === 'comp1' && (
            <>
              <Text style={styles.sectionTitle}>ANALYSIS AND COMPUTATIONS</Text>

              <Text style={styles.paragraph}>
                Let D be the distance from source to the end window.{"\n"}
                Let d be the diameter of the end window.{"\n"}
                Let Nₛ = Counts recorded with source.{"\n"}
                Let Nᵦ = Counts recorded due to background.
              </Text>

              <Text style={styles.paragraph}>Now make the following measurements:</Text>

              <Text style={styles.paragraph}>
                {"\u2022"} Background counts in 100 sec: <Text style={{ fontWeight: '700' }}>Nᵦ = 71</Text>{"\n"}
                {"     "} (Average of three readings)
              </Text>

              <Text style={styles.paragraph}>
                {"\u2022"} Distance from source holder to end window: <Text style={{ fontWeight: '700' }}>D = 10 cm</Text>
              </Text>

              <Text style={styles.paragraph}>
                {"\u2022"} Diameter of end window: <Text style={{ fontWeight: '700' }}>d = 1.5 cm</Text>
              </Text>

              <Text style={styles.paragraph}>
                {"\u2022"} No. of counts recorded in 100 sec with the source: <Text style={{ fontWeight: '700' }}>Nₛ = 432</Text>
              </Text>

              <Text style={styles.paragraph}>
                From the above data, the net count rate recorded:{"\n"}
                N = (Nₛ − Nᵦ) / 100 CPS = <Text style={{ fontWeight: '700' }}>3.61 CPS</Text>
              </Text>

              <Image
                source={require('../assets/images/screen5img.jpeg')}
                style={styles.image}
                resizeMode="contain"
              />
              <Text style={styles.imageCaption}>
                Fig. 14: Detector source arrangement for efficiency calculation for a gamma source
              </Text>
            </>
          )}

          {/* -------- Computations & Analysis (Gamma) — contd. -------- */}
          {selectedSection === 'comp2' && (
            <>
              <Text style={styles.sectionTitle}>Computations & Analysis (contd.)</Text>

              <Text style={styles.paragraph}>
                Gamma source emits radiation isotropically in all directions (4π geometry).
                However only a fraction of it is received by the end window detector. This fraction is given by
              </Text>

              <View style={{ marginVertical: 20 }}>
                <View style={styles.formulaRow}>
                  <Text style={styles.equals}>=</Text>
                  <View style={styles.bigFracWrap}>
                    <View style={styles.fracWrap}>
                      <Text style={styles.formulaText}>(π d²)</Text>
                      <View style={[styles.fracLine, { width: 70 }]} />
                      <Text style={styles.formulaText}>4</Text>
                    </View>
                    <View style={[styles.fracLine, { width: 120 }]} />
                    <Text style={styles.formulaText}>4πD²</Text>
                  </View>
                  <Text style={styles.equals}>=</Text>
                  <Fraction top="d²" bottom="16D²" />
                </View>
              </View>

              <Text style={styles.paragraph}>
                The present activity (A) of the gamma source used for this experiment is 111 kBq.
                This gamma source is radiating isotropically in all directions. A fraction of this only is
                entering the G.M. Tube, which is given by
              </Text>

              <Text style={styles.formulaBig}>
                R = A × d² / 16D²  =  111000 × 0.001406  =  156.066
              </Text>

              <Text style={[styles.paragraph, { marginTop: 20 }]}>
                This is the fractional radiation entering the detector.{"\n"}
                Hence intrinsic efficiency of the detector for the gamma source at a
                distance (D = 10 cm)
              </Text>

              <View style={{ alignItems: 'center', marginVertical: 12 }}>
                <Text style={[styles.formulaText, { marginBottom: 6 }]}>
                  Intrinsic Efficiency (E) =
                </Text>
                <View style={styles.formulaRow}>
                  <Fraction top="CPS" bottom="DPS" />
                  <Text style={styles.equals}>=</Text>
                  <Fraction top="N" bottom="R" />
                </View>
                <View style={[styles.formulaRow, { marginTop: 12 }]}>
                  <Fraction top="3.61" bottom="156.066" width={110} />
                  <Text style={styles.equals}>=</Text>
                  <Text style={styles.formulaText}>0.0231 = 2.31%</Text>
                </View>
              </View>

              <Text style={[styles.paragraph, { marginTop: 10 }]}>
                Note: CPS = Counts per Second{"\n"}
                DPS = Disintegrations per Second falling on the window of the detector.
              </Text>
            </>
          )}

          {/* -------- Estimate Efficiency for a Beta Source -------- */}
          {selectedSection === 'beta' && (
            <>
              <Text style={styles.sectionTitle}>
                EXPERIMENT TO ESTIMATE EFFICIENCY FOR A BETA SOURCE
              </Text>

              <Text style={styles.sectionSubtitle}>INTRODUCTION:</Text>
              <Text style={styles.paragraph}>
                Equipment required & procedure remains the same as detailed under 5.2 & 5.3.
              </Text>
              <Text style={styles.paragraph}>
                The only difference is, here we place Beta source about 2 cm close to the end window & calculate
                'Absolute Efficiency', (which do not take geometry factor into consideration)
              </Text>

              <Text style={styles.sectionSubtitle}>PROCEDURE:</Text>
              <Text style={styles.paragraph}>{"\u2022"} Make standard arrangement & interconnections for G.M counting system, detector,G.M stand.</Text>
              <Text style={styles.paragraph}>{"\u2022"} Place Beta source close to End Window (approx 2cm from end window). Record counts for a minute with and without source.Take three readings; take average of them and tabulate.</Text>
              <Text style={styles.paragraph}>{"\u2022"} Record distance of the source from end window.</Text>
              <Text style={styles.paragraph}>{"\u2022"} Calculate the present day activity in DPS of the source (refer to procedure given at the end of the manual).</Text>
              <Text style={styles.paragraph}>{"\u2022"} Calculate net CPM/CPS counted.</Text>
              <Text style={styles.paragraph}>{"\u2022"} Absolute efficiency can be calculated as the ratio between (CPM/DPM) x 100 or (CPS/DPS) x 100. This will be efficiency of the end window detector for the given Beta Source at that distance.</Text>
            </>
          )}

          {/* -------- Computations & Analysis — Beta (UPDATED to match your image) -------- */}
          {selectedSection === 'betaComp' && (
            <>
              <Text style={styles.sectionTitle}>DATA COMPUTATION & ANALYSIS:</Text>

              <DataRow label="Beta source used" value="Sr-90" />
              <DataRow label="Activity (A0)" value="5.55 KBq (as on Aug 2006)" />
              <DataRow label="Activity (A)" value="5.373 KBq (as on Dec 2007)" />

              <Text style={[styles.paragraph, { marginTop: 6, fontStyle: 'italic' }]}>
                (use procedure given on pages 13 & 14)
              </Text>

              <DataRow label="Background count rate" value="57 CPM" />
              <DataRow label="Counts recorded with source (Average)" value="14427 CPM" />
              <DataRow label="Corrected counts" value="14370 CPM" />
              <DataRow label="Net count rate" value="239.5 CPS" />

              <Text style={[styles.paragraph, { marginTop: 10 }]}>
                Efficiency (E) of the End window detector with Beta source (Sr-90) at 2.0 cm distance
              </Text>

              <View style={{ alignItems: 'center', marginTop: 12 }}>
                <View style={styles.absEffRow}>
                  <Text style={[styles.absEffLabel, { fontWeight: '700' }]}>Absolute Efficiency</Text>
                  <Text style={styles.absEffLabel}>  E = </Text>
                  <Fraction top="CPS" bottom="DPS" width={70} />
                  <Text style={styles.absEffLabel}>  =  0.0446  =  4.46%</Text>
                </View>
              </View>
            </>
          )}

          {/* -------- Exercise -------- */}
          {selectedSection === 'exercise' && (
            <>
              <Text style={styles.sectionTitle}>EXERCISE</Text>
              <Text style={[styles.paragraph, styles.exercisePoint]}>
                {"\u2022"} By knowing the efficiency of the G.M. detector for a particular Gamma energy (at a specified distance & geometry), one can further calculate the following parameters, namely activity of the source as on the day of experimentation (of course it is assumed that activity of the standard is known as on the date of manufacture).
              </Text>
              <Text style={[styles.paragraph, styles.exercisePoint]}>
                {"\u2022"} It can be noticed that the End Window detector will have much better efficiency for Beta Source compared to a gamma source.
              </Text>
              <Text style={[styles.paragraph, styles.exercisePoint, { marginBottom: 22 }]}>
                {"\u2022"} By knowing efficiency for a Beta source , if an unknown activity Beta source of the same isotope is kept for counting, one can calculate and find out its activity.
              </Text>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

/* Helpers */
const Fraction = ({ top, bottom, width = 60 }) => (
  <View style={{ alignItems: 'center', marginHorizontal: 6 }}>
    <Text style={styles.formulaText}>{top}</Text>
    <View style={[styles.fracLine, { width }]} />
    <Text style={styles.formulaText}>{bottom}</Text>
  </View>
);

const DataRow = ({ label, value }) => (
  <View style={styles.dataRow}>
    <Text style={styles.dataLabel}>{label}</Text>
    <Text style={styles.dataColon}> :</Text>
    <Text style={styles.dataValue}> {value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },

  /* Left column */
  leftPane: {
    width: '29.75%',
    backgroundColor: '#d0cfcfff',
    paddingTop: 0,
  },
  tabItem: { paddingVertical: 15, paddingLeft: 10 },
  activeTabItem: { backgroundColor: '#a9a9a9' },
  subHeading: { fontSize: 16, fontWeight: 'bold' },

  /* Right column */
  rightPane: {
    width: '70.25%',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 0,
    backgroundColor: '#F7F1BE',
  },

  /* Title block */
  titleWrap: { height: 64, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginBottom: 10,
  },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 10, marginBottom: 10 },
  sectionSubtitle: { fontSize: 18, fontWeight: '600', marginTop: 10, marginBottom: 6 },
  paragraph: { fontSize: 16, marginBottom: 10, lineHeight: 22 },

  /* Image */
  image: {
    width: '60%',
    height: 300,
    marginTop: 25,
    marginBottom: 8,
    alignSelf: 'center',
  },
  imageCaption: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },

  /* Formula & fractions */
  formulaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  fracWrap: { alignItems: 'center', marginHorizontal: 6 },
  bigFracWrap: { alignItems: 'center', marginHorizontal: 6 },
  fracLine: { height: 1, backgroundColor: '#000' },
  formulaText: { fontSize: 16 },
  equals: { fontSize: 18, marginHorizontal: 6 },
  formulaBig: {
    fontSize: 22,
    textAlign: 'center',
    marginVertical: 14,
  },

  /* Data rows (for the screenshot layout) */
  dataRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dataLabel: {
    flexShrink: 0,
    width: 250,          // fixed width to align the colons like in the image
    fontSize: 16,
  },
  dataColon: {
    width: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  dataValue: {
    flex: 1,
    fontSize: 16,
  },

  /* Absolute efficiency line */
  absEffRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  absEffLabel: { fontSize: 16 },

  /* Top bar */
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
});
