// app/screen6.js
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

export default function Screen6() {
  const [selectedSection, setSelectedSection] = useState('determine');
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F1BE' }}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.brand}>GM LAB</Text>
          <TouchableOpacity
            style={styles.dataBtn}
            onPress={() => navigation.navigate('screen6_dataentry')}
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

      {/* Thin underline */}
      <View style={styles.topSeparator} />

      {/* Two-column layout */}
      <View style={styles.container}>
        {/* Left Pane */}
        <View style={styles.leftPane}>
          {[
            {
              key: 'determine',
              label:
                'Determination of Beta Particle Range and Maximum energy (By Half Thickness Method)',
            },
            { key: 'tableTl', label: 'Table: Data is taken with Thallium (²⁰⁴Tl)' },
            { key: 'tableSr', label: 'Table: Data is taken with Strontium (Sr⁹⁰–Y⁹⁰)' },
            { key: 'graphTl', label: 'Graph: Thallium 204' },
            { key: 'graphSr', label: 'Graph: Strontium 90' },
            { key: 'analysis', label: 'Analysis & Computations' },
            { key: 'results', label: 'Results' },
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
            <Text style={styles.title}>Beta Particle Range</Text>
          </View>

          {selectedSection === 'determine' && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>
                Determination of Beta Particle Range and Maximum energy (By Half Thickness Method)
              </Text>

              {/* Purpose */}
              <Text style={styles.boldHeading}>PURPOSE</Text>
              <Text style={styles.paragraph}>
                To carry out the absorption studies on β-rays with the aid of a GM Counter, and hence to determine the end point energy of β-rays emitted from a radioactive source.
              </Text>

              {/* Equipment */}
              <Text style={styles.boldHeading}>EQUIPMENT/ACCESSORIES REQUIRED</Text>
              <Text style={styles.paragraph}>{`\u2022`} G.M Counting System GC601A / GC602A.</Text>
              <Text style={styles.paragraph}>{`\u2022`} G.M Detector (End window) stand (or) G.M Detector/source holder bench</Text>
              <Text style={styles.paragraph}>{`\u2022`} Radioactive source kit</Text>
              <Text style={styles.paragraph}>{`\u2022`} Aluminium absorber set</Text>

              {/* Procedure */}
              <Text style={styles.boldHeading}>PROCEDURE</Text>
              <Text style={styles.paragraph}>{`\u2022`} Make standard connections and arrangements between G.M. Counting system, detector, absorber and source.</Text>
              <Text style={styles.paragraph}>{`\u2022`} Set the GM voltage at the operating voltage of the GM tube.</Text>
              <Text style={styles.paragraph}>{`\u2022`} Without source, make a few (about 5 readings) background measurements and take an average of them for a preset time of say 60 sec.</Text>
              <Text style={styles.paragraph}>{`\u2022`} Compute Average background counts in 60 sec (Ba = (b1 + b2 + b3 + b4 + b5) / 5).</Text>
              <Text style={styles.paragraph}>{`\u2022`} Compute Background rate = Ba/t (t = 60 sec).</Text>
              <Text style={styles.paragraph}>{`\u2022`} Place a Beta source in the source tray at about 3 cm from the end window of the GM tube.</Text>
              <Text style={styles.paragraph}>{`\u2022`} Take the Aluminium absorber set, place an aluminium absorber of zero thickness in the absorber holder at about 2 cm from the end window of the GM tube and record the counts.</Text>
              <Text style={styles.paragraph}>{`\u2022`} The absorber thickness is increased in steps of 0.05 mm and every time counts are recorded.</Text>
              <Text style={styles.paragraph}>{`\u2022`} This process is repeated until the count rate becomes less than half the count rate with zero absorber thickness.</Text>
              <Text style={styles.paragraph}>{`\u2022`} Data is to be collected for the standard source and the second source. Here in this case, the standard source is Tl-204 and the second source is Sr-90.</Text>
              <Text style={styles.paragraph}>{`\u2022`} Tabulate the data as shown in table 5.1 and 5.2.</Text>
              <Text style={styles.paragraph}>{`\u2022`} Density of Aluminium = 2.71 g/cm³.</Text>
              <Text style={styles.paragraph}>{`\u2022`} The below data is taken with Thallium (Tl-204).</Text>
            </View>
          )}

          {selectedSection === 'tableTl' && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>
                Table: Data is taken with Thallium (²⁰⁴Tl)
              </Text>
              <Image
                source={require('../assets/images/tableth.jpeg')}
                style={{ width: '100%', height: 480, resizeMode: 'contain', marginTop: 10 }}
              />
            </View>
          )}

          {selectedSection === 'tableSr' && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>
                Table: Data is taken with Strontium (Sr⁹⁰–Y⁹⁰)
              </Text>
              <Image
                source={require('../assets/images/tablest.jpeg')}
                style={{ width: '100%', height: 700, resizeMode: 'contain', marginTop: 10 }}
              />
            </View>
          )}

          {selectedSection === 'graphTl' && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Graph: Thallium 204</Text>
              <Image
                source={require('../assets/images/grth.jpeg')}
                style={{ width: '100%', height: 480, resizeMode: 'contain', marginTop: 10 }}
              />
            </View>
          )}

          {selectedSection === 'graphSr' && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Graph: Strontium 90</Text>
              <Image
                source={require('../assets/images/grst.jpeg')}
                style={{ width: '100%', height: 480, resizeMode: 'contain', marginTop: 10 }}
              />
            </View>
          )}

          {selectedSection === 'analysis' && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Analysis & Computations</Text>

              {/* PRINCIPLE */}
              <Text style={styles.boldHeading}>PRINCIPLE</Text>
              <Text style={styles.paragraph}>
                The range of Beta particles is given by
              </Text>

              {/* R0 = (0.52 E0 - 0.09) g/cm²  -- (1) */}
              <Text style={[styles.paragraph, { marginTop: 4 }]}>
                R₀ = (0.52 E₀ − 0.09) g/cm²  — (1)
              </Text>

              <Text style={styles.paragraph}>
                Where E₀ is the end point energy of Beta rays from the radioactive source in MeV.
              </Text>

              <Text style={styles.paragraph}>
                We have the ratio of thickness required to reduce the counts of Beta rays from one source
                to half to the thickness required for the other source is given by
              </Text>

              {/* Fraction: t1½ / t2½ = Range(first) / Range(second) */}
              <View style={{ alignItems: 'center', marginVertical: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  {/* left fraction */}
                  <View style={{ alignItems: 'center', marginHorizontal: 10 }}>
                    <Text>t₁½</Text>
                    <View style={{ height: 1, backgroundColor: '#000', width: 50 }} />
                    <Text>t₂½</Text>
                  </View>
                  <Text style={{ marginHorizontal: 8 }}>=</Text>
                  {/* right fraction */}
                  <View style={{ alignItems: 'center', marginHorizontal: 10 }}>
                    <Text>Range of  Beta rays from first source</Text>
                    <View style={{ height: 1, backgroundColor: '#000', width: 260 }} />
                    <Text>Range of  Beta rays from second source</Text>
                  </View>
                </View>
              </View>

              {/* Fraction: t1½/t2½ = R1/R2  -- (2) */}
              <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ alignItems: 'center', marginHorizontal: 10 }}>
                    <Text>t₁½</Text>
                    <View style={{ height: 1, backgroundColor: '#000', width: 50 }} />
                    <Text>t₂½</Text>
                  </View>
                  <Text style={{ marginHorizontal: 8 }}>=</Text>
                  <View style={{ alignItems: 'center', marginHorizontal: 10 }}>
                    <Text>R₁</Text>
                    <View style={{ height: 1, backgroundColor: '#000', width: 40 }} />
                    <Text>R₂</Text>
                  </View>
                  <Text style={{ marginLeft: 10 }}> — (2)</Text>
                </View>
              </View>

              {/* EXERCISE */}
              <Text style={styles.boldHeading}>EXERCISE</Text>
              <Text style={styles.paragraph}>{'\u25AA'} Subtract the background count rate from each measured count rate.</Text>
              <Text style={styles.paragraph}>{'\u25AA'} Plot a graph of Net counts versus absorber thickness (mg/cm²) for both sources.</Text>
              <Text style={styles.paragraph}>{'\u25AA'} Draw the curve through these points as shown in Figures 15 & 16.</Text>
              <Text style={styles.paragraph}>
                {'\u25AA'} From the plotted graph, interpolate and obtain thickness of aluminium absorber required to reduce the count
                rate of Thallium and Strontium Beta rays by half (t1½ and t2½).
              </Text>
              <Text style={styles.paragraph}>
                {'\u25AA'} In this exercise, Tl-204 is a known standard source, which emits Beta Rays with end-point energy 0.764 MeV.
                Substituting this end-point energy, in equation (1) above, we can find out the Range (R₁) of Tl-204 Beta rays in Aluminium Absorber.
              </Text>
              <Text style={styles.paragraph}>
                {'\u25AA'} Substitute t1½ and t2½ and R₁ in the above equation (2) and calculate the range (R₂) of Beta Rays from Sr-90 source.
              </Text>
              <Text style={styles.paragraph}>
                {'\u25AA'} Once we know the R₂, we can find out the energy (E₂) of Sr-90 from equation-1.
              </Text>
            </View>
          )}

          {selectedSection === 'results' && (
            <View style={styles.sectionBlock}>
              

              {/* 5.4.3 For Thallium-204 */}
              <Text style={[styles.boldHeading, { marginTop: 6 }]}>5.4.3   For Thallium-204</Text>

              <Text style={styles.paragraph}>End point energy of Tl-204     = 0.764 MeV</Text>

              <Text style={styles.paragraph}>{'\u2234'}  Range of ²⁰⁴Tl     = R₁  = (0.52 E₀  − 0.09) g/cm²</Text>
              <Text style={styles.paragraph}>{"                        "}= (0.52 × 0.764 Mev − 0.09) g/cm²</Text>
              <Text style={styles.paragraph}>{"                        "}= 0.30728 g/cm²</Text>

              <Text style={[styles.paragraph, { marginTop: 8 }]}>{'\u25AA'}  Thickness of Al absorber required to reduce the count rate of ²⁰⁴Tl by half,</Text>
              <Text style={[styles.paragraph, { marginTop: -6 }]}>{"   "}t₁½  = 34mg/cm square</Text>

              <Text style={[styles.paragraph, { marginTop: 6 }]}>{'\u25AA'}  Thickness of Al absorber required to reduce the count rate of Sr-90 by half</Text>
              <Text style={[styles.paragraph, { marginTop: -6 }]}>{"   "}t₂½  = 121mg/cm²</Text>

              <Text style={[styles.paragraph, { marginTop: 10 }]}>From Equation (2).</Text>

              {/* t1/2 / t2/2 = R1 / R2 */}
              <View style={{ alignItems: 'center', marginTop: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ alignItems: 'center', marginHorizontal: 12 }}>
                    <Text>t₁½</Text>
                    <View style={{ height: 1, backgroundColor: '#000', width: 60 }} />
                    <Text>t₂½</Text>
                  </View>
                  <Text style={{ marginHorizontal: 10 }}>=</Text>
                  <View style={{ alignItems: 'center', marginHorizontal: 12 }}>
                    <Text>R₁</Text>
                    <View style={{ height: 1, backgroundColor: '#000', width: 60 }} />
                    <Text>R₂</Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.paragraph, { marginTop: 10 }]}>
                ⇒   R₂  =   R₁  ×  
              </Text>
              {/* (t2/2)/(t1/2) = (0.30728 × 121 × 10^-3) / (34 × 10^-3) */}
              <View style={{ alignItems: 'center', marginTop: -8 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text>t₂½</Text>
                  <View style={{ height: 1, backgroundColor: '#000', width: 80 }} />
                  <Text>t₁½</Text>
                </View>

                <Text style={{ marginTop: 12 }}>
                  =   <Text>0.30728 × 121 × 10⁻³</Text>
                </Text>
                <View style={{ height: 1, backgroundColor: '#000', width: 220 }} />
                <Text>34 × 10⁻³</Text>
              </View>

              <View style={{ alignItems: 'center', marginTop: 10 }}>
                <Text>R₂  =</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Text>0.30728 × 121</Text>
                  <Text>{"     "}</Text>
                  <Text>——————</Text>
                  <Text>{"     "}</Text>
                  <Text>34</Text>
                  <Text style={{ marginLeft: 8 }}>  =  1.09355 gm/cm²</Text>
                </View>
              </View>

              <Text style={[styles.paragraph, { marginTop: 12 }]}>
                {'\u2234'}  End point energy of ⁹⁰Sr/ ⁹⁰Y
              </Text>

              {/* E2 = (R2 + 0.09)/0.52 = (1.09355 + 0.09)/0.52 */}
              <View style={{ alignItems: 'center', marginTop: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text>E₂  =   </Text>
                  <View style={{ alignItems: 'center', marginRight: 10 }}>
                    <Text>R₂ + 0.09</Text>
                    <View style={{ height: 1, backgroundColor: '#000', width: 100 }} />
                    <Text>0.52</Text>
                  </View>
                  <Text>   =   </Text>
                  <View style={{ alignItems: 'center' }}>
                    <Text>1.09355 + 0.09</Text>
                    <View style={{ height: 1, backgroundColor: '#000', width: 130 }} />
                    <Text>0.52</Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.paragraph, { marginTop: 10 }]}>E₂   =  2.276 Mev</Text>

              {/* 5.4.4 RESULT */}
              <Text style={[styles.boldHeading, { marginTop: 16 }]}>5.4.4 RESULT</Text>
              <Text style={styles.paragraph}>
                End point energy of β-rays from ⁹⁰Sr = 2.28 MeV.
              </Text>
            </View>
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
    backgroundColor: '#F7F1BE',
  },

  /* Title block */
  titleWrap: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },

  sectionBlock: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  boldHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
  },
  paragraph: { fontSize: 16, marginBottom: 10, lineHeight: 22 },

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
