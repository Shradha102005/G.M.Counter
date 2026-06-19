// app/screen4.js
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

function Row({ cells, header }) {
  return (
    <View style={[styles.tr, header && styles.trHead]}>
      {cells.map((c, i) => (
        <View key={i} style={[styles.td, header && styles.th]}>
          <Text style={[styles.tdText, header && styles.thText]}>{c}</Text>
        </View>
      ))}
    </View>
  );
}

export default function Screen4() {
  const [selectedSection, setSelectedSection] = useState('intro');
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F1BE' }}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.brand}>GM LAB</Text>
          <TouchableOpacity
            style={styles.dataBtn}
            onPress={() => navigation.navigate('screen4_dataentry')}
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
        {/* Left Pane (menu) — match screenshots */}
        <View style={styles.leftPane}>
          {[
            { key: 'intro', label: 'Linear & Mass Attenuation Coefficient' },
            { key: 'table', label: 'Table: Aluminium, Lead and Copper' },
            { key: 'comp', label: 'Computations & Analysis' },
            { key: 'graph_lead', label: 'Graph: Counts Vs Thickness of Lead' },
            { key: 'graph_copper', label: 'Graph: Counts Vs Thickness of Copper' },
            { key: 'graph_al', label: 'Graph: Counts Vs Thickness of Aluminium' },
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

        {/* Right Pane (content) */}
        <ScrollView style={styles.rightPane}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Linear & Mass Attenuation Co-Efficient</Text>
          </View>

          {/* 1. INTRO (Purpose, Equipment, Procedure) */}
          {selectedSection === 'intro' && (
            <>
              <Text style={styles.sectionTitle}>Purpose</Text>
              <Text style={styles.paragraph}>
                The purpose of this experiment is to show how gamma-radiation is absorbed
                in matter. These properties are used in practice for designing shielding
                for radioactive sources, and for many applications of radioactivity in
                industries such as thickness measurement and reactor shields gauging.
              </Text>

              <Text style={styles.sectionTitle}>Equipment / Accessories Required</Text>
              <Text style={styles.paragraph}>• G.M Counting System 601A/602A with A.C main chord{'\n'}
                • G.M Detector (End window) stand (or) G.M Detector / source holder bench{'\n'}
                • Radioactive source kit{'\n'}
                • Aluminium, Copper & Lead Absorber sets
              </Text>

              <Text style={styles.sectionTitle}>Procedure</Text>
              <Text style={styles.paragraph}>
                • Make standard connections & arrangement between G.M Counting System,
                detector, absorber & source (refer to Fig 2 & 3).{'\n'}
                • Place a gamma source in the source tray at about 4 cm from the end window of the G.M tube.{'\n'}
                • Set the GM voltage at the operating voltage of the G.M tube.{'\n'}
                • Choose one of the absorber sets below and interpose it between the end-window detector and source holder:{'\n'}
                &nbsp;&nbsp;a) Aluminium absorber set (TEN absorbers, thickness 0.056 mm to 0.56 mm){'\n'}
                &nbsp;&nbsp;b) Copper absorber set (FIVE absorbers, thickness 0.07 mm to 0.35 mm){'\n'}
                &nbsp;&nbsp;c) Lead absorber set (FIVE absorbers, thickness 0.180 mm to 0.90 mm){'\n'}
                • Take reading for a preset time of 60 sec without any absorber and tabulate.{'\n'}
                • Repeat the experiment for the same preset time for different absorber thicknesses in increasing order.{'\n'}
                • Tabulate the data as shown in Tables for Aluminium, Copper and Lead.
              </Text>
            </>
          )}

          {/* 2. TABLES */}
          {selectedSection === 'table' && (
            <>
              <Text style={styles.sectionTitle}>Table: Aluminium, Lead and Copper</Text>

              <Text style={[styles.subheadInline]}>For Aluminium</Text>
              <View style={styles.table}>
                <Row header cells={['Sheet No.', 'Thickness (mm)', 'Counts in 30 sec.']} />
                <Row cells={['01', '0.000', '687']} />
                <Row cells={['02', '0.056', '350']} />
                <Row cells={['03', '0.112', '180']} />
                <Row cells={['04', '0.168', '151']} />
                <Row cells={['05', '0.224', '142']} />
              </View>

              <Text style={[styles.subheadInline]}>For Lead</Text>
              <View style={styles.table}>
                <Row header cells={['Sheet No.', 'Thickness (mm)', 'Counts in 30 sec.']} />
                <Row cells={['01', '0.00', '721']} />
                <Row cells={['02', '0.18', '201']} />
                <Row cells={['03', '0.36', '125']} />
                <Row cells={['04', '0.54', '116']} />
                <Row cells={['05', '0.72', '102']} />
              </View>

              <Text style={[styles.subheadInline]}>For Copper</Text>
              <View style={styles.table}>
                <Row header cells={['Sheet No.', 'Thickness (mm)', 'Counts in 30 sec.']} />
                <Row cells={['01', '0.00', '721']} />
                <Row cells={['02', '0.07', '201']} />
                <Row cells={['03', '0.14', '135']} />
                <Row cells={['04', '0.21', '132']} />
                <Row cells={['05', '0.28', '120']} />
              </View>

              <Text style={styles.paragraph}>
                Now plot the graphs for each type of absorber: counts/30 s vs thickness of
                the absorber as shown in figures. These illustrate the exponential
                reduction in count rate as thickness increases.
              </Text>
            </>
          )}

          {/* 3. COMPUTATIONS & ANALYSIS */}
          {selectedSection === 'comp' && (
            <>
              <Text style={styles.sectionTitle}>Computations & Analysis</Text>
              <Text style={styles.paragraph}>
                When gamma radiation passes through matter it undergoes absorption
                primarily by Compton scattering, photoelectric effect and pair production.
                The transmitted intensity decreases exponentially with material thickness x:
              </Text>
              <Text style={styles.equation}>I(x) = I₀ · e^(−μx)</Text>
              <Text style={styles.paragraph}>
                where I₀ is the incident intensity and μ is the linear attenuation
                coefficient of the medium.
              </Text>
              <Text style={styles.paragraph}>
                The Half Value Layer (HVL), denoted X¹⁄₂, is the absorber thickness
                that reduces the intensity to half: I/I₀ = 0.5. Taking natural logs:
              </Text>
              <Text style={styles.equation}>ln(0.5) = −μ · X¹⁄₂  →  μ = 0.693 / X¹⁄₂</Text>
              <Text style={styles.paragraph}>
                Given X¹⁄₂ from the plotted graph (by extrapolating to I/I₀ = 0.5), compute μ.
                The mass attenuation coefficient is:
              </Text>
              <Text style={styles.equation}>μₘ = μ / ρ</Text>
              <Text style={styles.paragraph}>
                where ρ is the density of the material (g/cm³).
              </Text>
            </>
          )}

          {/* 4–6. GRAPH NOTES (now with images) */}
          {selectedSection === 'graph_lead' && (
            <>
              
              <Image
                source={require('../assets/images/lead.jpeg')}
                style={styles.graphImage}
                resizeMode="contain"
              />
              <Text style={styles.paragraph}>
                Plot counts/30 s on the y-axis vs thickness (cm or mm) on the x-axis and
                draw a smooth curve. From the curve, obtain the half-value layer X¹⁄₂ by
                extrapolating at I/I₀ = 0.5. (Example shown: AT360, X¹⁄₂ ≈ 0.11 mm.)
              </Text>
            </>
          )}

          {selectedSection === 'graph_copper' && (
            <>
             
              <Image
                source={require('../assets/images/copper.jpeg')}
                style={styles.graphImage}
                resizeMode="contain"
              />
              <Text style={styles.paragraph}>
                Plot counts/30 s vs thickness and obtain X¹⁄₂ from the curve. (Example
                shown: AT360, X¹⁄₂ ≈ 0.043 mm.)
              </Text>
            </>
          )}

          {selectedSection === 'graph_al' && (
            <>
             
              <Image
                source={require('../assets/images/alum.jpeg')}
                style={styles.graphImage}
                resizeMode="contain"
              />
              <Text style={styles.paragraph}>
                Plot counts/30 s vs thickness and obtain X¹⁄₂ from the curve. (Example
                shown: AT343, X¹⁄₂ ≈ 0.060 mm.)
              </Text>
            </>
          )}

          {/* 7. EXERCISE */}
          {selectedSection === 'exercise' && (
            <>
              <Text style={styles.sectionTitle}>Exercise</Text>
              <Text style={styles.paragraph}>
                • Subtract the background count rate from each measured count rate.{'\n'}
                • Plot a graph of corrected counts (I) vs absorber thickness (cm).{'\n'}
                • Draw the curve through these points as shown in the figures.{'\n'}
                • Find I₀ for x = 0 by extrapolation of the curve for I/I₀ = 0.5 and obtain X¹⁄₂.{'\n'}
                • Substitute X¹⁄₂ in μ = 0.693 / X¹⁄₂ to calculate the linear absorption coefficient.{'\n'}
                • Once μ is known, compute the mass attenuation coefficient μₘ = μ / ρ for the absorber material.
              </Text>

              <Text style={styles.subheadInline}>For Aluminium</Text>
              <Text style={styles.paragraph}>
                X¹⁄₂ = 0.006 cm → μ = 0.693 / 0.006 = 115.5 cm⁻¹{'\n'}
                ρ = 2.7 g/cm³ → μₘ = 115.5 / 2.7 = 42.7 cm²/g
              </Text>

              <Text style={styles.subheadInline}>For Lead</Text>
              <Text style={styles.paragraph}>
                X¹⁄₂ = 0.011 cm → μ = 0.693 / 0.011 = 63.0 cm⁻¹{'\n'}
                ρ = 11.34 g/cm³ → μₘ = 63 / 11.34 = 5.56 cm²/g
              </Text>

              <Text style={styles.subheadInline}>For Copper</Text>
              <Text style={styles.paragraph}>
                X¹⁄₂ = 0.0043 cm → μ = 0.693 / 0.0043 = 161.16 cm⁻¹{'\n'}
                ρ = 8.93 g/cm³ → μₘ = 161.16 / 8.93 = 18.04 cm²/g
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
    marginTop: -20,
    backgroundColor: '#F7F1BE',
  },

  titleWrap: { height: 64, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginBottom: 10,
  },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 10, marginBottom: 10 },
  subheadInline: { fontSize: 17, fontWeight: 'bold', marginTop: 8, marginBottom: 6 },
  paragraph: { fontSize: 16, marginBottom: 10, lineHeight: 22 },

  /* Simple table styles */
  table: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  tr: { flexDirection: 'row' },
  trHead: { backgroundColor: '#a6a6a6' },
  td: { flex: 1, borderRightWidth: 1, borderRightColor: '#dcdcdc', padding: 8 },
  th: { borderRightColor: '#c0c0c0' },
  tdText: { fontSize: 14 },
  thText: { fontWeight: '700', textAlign: 'center' },

  /* Top bar (unchanged) */
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

  /* New graph image style */
  graphImage: {
    width: 700,
    height: 700,
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 6,
  },
});
