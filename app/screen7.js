// app/screen7.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function Screen7() {
  const [selectedSection, setSelectedSection] = useState('measure');
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F1BE' }}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.brand}>GM LAB</Text>
          <TouchableOpacity
            style={styles.dataBtn}
            onPress={() => router.push('/screen7_dataentry')}
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
            { key: 'measure', label: 'Measurement of Short Half-Life' },
            { key: 'table', label: 'Table: Data is taken with Thallium (²⁰⁴Tl)' },
            { key: 'observations', label: 'Observations' },
            { key: 'graph', label: 'Graph: Half-Life of Indium Foil' },
            { key: 'analysis', label: 'Analysis & Computations' },
            { key: 'determination', label: 'Half-Life Determination' },
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
            <Text style={styles.title}>Measurement Of Short Half-Life</Text>
          </View>

          {/* Section: Measurement */}
          {selectedSection === 'measure' && (
            <>
              <Text style={styles.sectionTitle}>MEASUREMENT OF SHORT HALF-LIFE</Text>

              <Text style={styles.bold}>PURPOSE</Text>
              <Text style={styles.paragraph}>
                To determine the short half-life of a given source, which can be obtained
                from a mini generator or produced with a neutron source by activation.
              </Text>

              <Text style={styles.bold}>EQUIPMENT/ACCESSORIES REQUIRED</Text>
              <Text style={styles.paragraph}>
                G.M. Counting system                     Type: GC 603T {'\n'}
                G.M. Stand                                      Type: SG 200 {'\n'}
                End window G.M detector               Type: GM 120 {'\n'}
                Short Half life source (Neutron activated Indium foil or Cs-137/Ba-137m isotope generator, flask with eluting solution for generator)
              </Text>

              <Text style={styles.bold}>PROCEDURE</Text>
              <Text style={styles.bullet}>• An Am-Be neutron source of strength of about 5Ci is in the Neutron Howitzer. The maximum thermal neutron flux produced by this neutron source is about 4 x 10⁴ n/cm²-sec.</Text>
              <Text style={styles.bullet}>• Irradiate the given indium foil for about 12 hours by placing it in appropriate position in the Neutron Howitzer (normally at the centre of the column).</Text>
              <Text style={styles.bullet}>• Apply the required operating voltage for the GM tube.</Text>
              <Text style={styles.bullet}>• Place the irradiated indium foil under the window of the GM tube at a convenient distance (1 cm) in order to get a good number of counts per second.</Text>
              <Text style={styles.bullet}>• Collect the counts for every 5 minutes for at least one hour.</Text>
              <Text style={styles.bullet}>• Note down the back ground count rate for 5 minutes, before and after the experiment in order to subtract from the observed counts and record your observations as shown in the Table 8.1.</Text>
              <Text style={styles.bullet}>• Determine the count rate (N) for each interval of 300 seconds (5 minutes).</Text>
              <Text style={styles.bullet}>• Plot graph of log of the count rate (log N) versus time (minutes). It will be a straight line as shown below.</Text>
            </>
          )}

          {/* Section: Table */}
          {selectedSection === 'table' && (
            <>
              <Text style={styles.sectionTitle}>
                Table: Data is taken with Thallium (²⁰⁴Tl)
              </Text>

              <Image
                source={require('../assets/images/123.jpeg')}
                style={styles.graphImage}
                resizeMode="contain"
              />

              <Text style={[styles.bullet, { marginTop: 14 }]}>
                • Find the slope of the straight line graph using the least square fit
                methods (use the formula)
              </Text>

              <Text style={styles.formulaLeft}>
                m = (nΣxy - ΣxΣy) / (nΣx² - (Σx)²)
              </Text>

              <Text style={[styles.paragraph, { marginTop: 10 }]}>
                to determine the slope of the graph which gives the value of the decay constant.
              </Text>

              <Text style={[styles.paragraph, { marginTop: 10 }]}>
                Where n = number of observations
              </Text>
              <Text style={[styles.paragraph, { marginTop: 8 }]}>
                x = time interval, y = Log N.
              </Text>
            </>
          )}

          {/* Section: Observations */}
          {selectedSection === 'observations' && (
            <>
              <Text style={styles.sectionTitle}>Observations</Text>
              <Image
                source={require('../assets/images/table.jpeg')}
                style={styles.tableImage}
                resizeMode="contain"
              />
            </>
          )}

          {/* Section: Graph */}
          {selectedSection === 'graph' && (
            <>
              <Text style={styles.sectionTitle}>Graph: Half-Life of Indium Foil</Text>
             <Image
  source={require('../assets/images/grr.jpeg')}
  style={styles.graphImage}
  resizeMode="contain"
/>

            </>
          )}

          {/* Section: Analysis */}
          {selectedSection === 'analysis' && (
            <>
              <Text style={styles.sectionTitle}>ANALYSIS AND COMPUTATIONS</Text>

              <Text style={styles.paragraph}>
                Intensity of radioactive source changes with time in accordance with relation
              </Text>

              <Text style={[styles.formulaLeft, { marginTop: 6 }]}>
                I = I₀ e^{'-λ t'}  —  (1)
              </Text>

              <Text style={[styles.paragraph, { marginTop: 10 }]}>
                λ is the decay constant,
              </Text>
              <Text style={styles.paragraph}>
                I is the intensity at any time t and I₀ is initial intensity.
              </Text>

              <Text style={styles.paragraph}>
                The T₁/₂ by definition is the time required for the intensity to fall to one half of its initial value.
              </Text>

              <Text style={[styles.paragraph, { marginTop: 10 }]}>
                Hence from equation (1) we have
              </Text>

              <Text style={styles.formulaLeft}>ln (I / I₀) = − λ T₁/₂</Text>
              <Text style={styles.formulaLeft}>ln (0.5) = − λ T₁/₂</Text>

              {/* 0.693 / λ = T1/2 */}
              <View style={[styles.formulaRow, { marginTop: 16 }]}>
                <Fraction top="0.693" bottom="λ" width={80} />
                <Text style={styles.equals}>=</Text>
                <Text style={styles.formulaText}>T₁/₂</Text>
              </View>

              <Text style={[styles.paragraph, { marginTop: 8 }]}>
                Where T₁/₂ is half-life.
              </Text>

              <Text style={[styles.paragraph, { marginTop: 10 }]}>
                The above equation can be written as
              </Text>

              {/* λ = 0.693 / T1/2 */}
              <View style={[styles.formulaRow, { marginTop: 8, marginBottom: 8 }]}>
                <Text style={styles.formulaText}>λ =</Text>
                <Fraction top="0.693" bottom="T₁/₂" width={90} />
              </View>

              <Text style={styles.paragraph}>
                Given the value of T₁/₂, one can calculate the value of λ.
              </Text>
            </>
          )}

          {/* Section: Determination */}
          {selectedSection === 'determination' && (
            <>
              <Text style={styles.sectionTitle}>HALF LIFE DETERMINATION</Text>

              <Text style={styles.paragraph}>
                The Log is actually a natural Log and should be denoted by In.
              </Text>

              <Text style={styles.bold}>EXERCISE</Text>
              <Text style={styles.bullet}>• Subtract the background count rate from each measured count rate.</Text>
              <Text style={styles.bullet}>• Plot a graph of In (N) vs. elapsed time (min).</Text>
              <Text style={styles.bullet}>• This should give a straight line graph.</Text>
              <Text style={styles.bullet}>• From the plotted graph extrapolate and obtain T1/2</Text>
              <Text style={styles.bullet}>• Substitute T1/2 in the above equation to calculate the decay constant λ .</Text>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

/* Simple fraction helper (same approach as screen5) */
const Fraction = ({ top, bottom, width = 60 }) => (
  <View style={{ alignItems: 'center', marginHorizontal: 6 }}>
    <Text style={styles.formulaText}>{top}</Text>
    <View style={[styles.fracLine, { width }]} />
    <Text style={styles.formulaText}>{bottom}</Text>
  </View>
);

const styles = StyleSheet.create({
  /* Frame */
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
  paragraph: { fontSize: 16, marginBottom: 10, lineHeight: 22 },
  bold: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 4 },
  bullet: { fontSize: 16, marginBottom: 8, lineHeight: 22 },

  /* Images */
  graphImage: {
    width: '100%',
    height: 450,
    marginBottom: 16,
    marginTop: 6,
  },
  tableImage: {
    width: '100%',
    height: 500,   // enlarged table size
    marginVertical: 16,
  },

  /* Formula & fraction styles (to mimic the doc look) */
  formulaLeft: {
    fontSize: 18,
    textAlign: 'left',
    marginTop: 8,
    marginBottom: 6,
    fontWeight: '400',
  },
  formulaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formulaText: { fontSize: 18 },
  equals: { fontSize: 18, marginHorizontal: 8 },
  fracLine: { height: 1, backgroundColor: '#000' },

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
