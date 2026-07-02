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

export default function Screen8() {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState('overview');

  const sections = [
    { key: 'overview', label: 'Overview' },
    { key: 'equipment', label: 'Equipment / Accessories Required' },
    { key: 'procedure', label: 'Procedure' },
    { key: 'experimental-data-results', label: 'Experimental Data and Results' },
    { key: 'results', label: 'Result & Conclusions' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F1BE' }}>
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.brand}>GM LAB</Text>
          <TouchableOpacity
            style={styles.dataBtn}
            onPress={() => router.push('/screen8_dataentry')}
            activeOpacity={0.8}
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

      <View style={styles.container}>
        <View style={styles.leftPane}>
          {sections.map((section) => (
            <TouchableOpacity
              key={section.key}
              onPress={() => setSelectedSection(section.key)}
              style={[styles.tabItem, selectedSection === section.key && styles.activeTabItem]}
            >
              <Text style={styles.subHeading}>{section.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.rightPane}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Production and Attenuation of Bremsstrahlung</Text>
          </View>

          {selectedSection === 'overview' && (
            <>
              <Text style={styles.sectionTitle}>INTRODUCTION</Text>
              <Text style={styles.paragraph}>
                Bremsstrahlung is electromagnetic radiation produced by the deceleration of a charged particle
                when deflected by another charged particle, typically an electron by an atomic nucleus.
              </Text>
              <Text style={styles.paragraph}>
                The moving particle loses kinetic energy, which is converted into a photon because energy is conserved.
                The term is also used to refer to the process of producing the radiation.
              </Text>
              <Text style={styles.paragraph}>
                Bremsstrahlung has a continuous spectrum which becomes more intense and whose intensity shifts toward
                higher frequencies as the change of the energy of the accelerated particles increases.
              </Text>
              <Text style={styles.paragraph}>
                Beta-particle emitting substances sometimes exhibit a weak radiation with continuous spectrum that is due
                to bremsstrahlung. It is a secondary radiation produced as a result of stopping or slowing the primary
                radiation (beta particles).
              </Text>
              <Text style={styles.paragraph}>
                The amount of bremsstrahlung increases as the atomic number or density of the absorbing material goes up.
                If the mass per unit area of the absorber is such that beta particles are completely absorbed, then higher
                atomic number or density materials correspond to higher bremsstrahlung count rates.
              </Text>
            </>
          )}

          {selectedSection === 'equipment' && (
            <>
              <Text style={styles.sectionTitle}>EQUIPMENT AND ACCESSORIES REQUIRED</Text>
              <Text style={styles.paragraph}>• Electronic Unit (GC 603T)</Text>
              <Text style={styles.paragraph}>• G.M Detector (GM125)</Text>
              <Text style={styles.paragraph}>• G.M. Detector Holder</Text>
              <Text style={styles.paragraph}>• Sliding Bench</Text>
              <Text style={styles.paragraph}>• Source Holder</Text>
              <Text style={styles.paragraph}>• Absorber Holder for Bremsstrahlung experiment</Text>
              <Text style={styles.paragraph}>• Beta Source (Sr-90)</Text>
              <Text style={styles.paragraph}>• Al (0.7mm), Cu (0.3mm) and Perspex (1.8mm) absorber set</Text>
            </>
          )}

          {selectedSection === 'procedure' && (
            <>
              <Text style={styles.sectionTitle}>PROCEDURE</Text>
              <Text style={styles.paragraph}>
                Make a standard setup by connecting the GM counting system GC603T with the GM detector (GM125) placed
                in the optical bench as shown in the experiment setup.
              </Text>
              <Text style={styles.paragraph}>
                Switch ON the unit and set the operating high voltage at 500V.
              </Text>
              <Text style={styles.paragraph}>
                Use absorber combinations made of different atomic numbers such as Perspex, Aluminium and Copper, and
                measure the count rate for the absorber combinations shown in the tables.
              </Text>
              <Text style={styles.paragraph}>
                Repeat the experiment for the three combinations:
              </Text>
              <Text style={styles.paragraph}>• Al (0.7mm) & Perspex (1.8mm)</Text>
              <Text style={styles.paragraph}>• Perspex (1.8mm) & Cu (0.3mm)</Text>
              <Text style={styles.paragraph}>• Al (0.7mm) & Cu (0.3mm)</Text>
              <Text style={styles.paragraph}>
                The absorber thickness should be such that each sheet of absorbent material has about the same mass per
                unit area.
              </Text>
            </>
          )}

          {selectedSection === 'experimental-data-results' && (
            <>
              <Text style={styles.sectionTitle}>EXPERIMENTAL DATA AND RESULTS</Text>
              <Text style={styles.paragraph}>
                Record the count rates for each absorber combination and compare how the bremsstrahlung output changes
                with the order of the materials.
              </Text>
              <Text style={styles.paragraph}>
                The data table and plotted results are used to observe the dependence of bremsstrahlung on absorber
                arrangement and material atomic number.
              </Text>
              <Image
                source={require('../assets/images/results.jpeg')}
                style={styles.resultsImage}
                resizeMode="contain"
              />
            </>
          )}

          {selectedSection === 'results' && (
            <>
              <Text style={styles.sectionTitle}>RESULT & CONCLUSIONS</Text>
              <Text style={styles.paragraph}>
                The count rate for the bremsstrahlung produced depends on the order in which the absorber materials are
                arranged.
              </Text>
              <Text style={styles.paragraph}>
                If, first, the sheet of metal faces toward the source, then a higher count rate is measured since
                bremsstrahlung is generated in the aluminium but is absorbed to a very small extent in the sheet of
                Perspex which follows.
              </Text>
              <Text style={styles.paragraph}>
                If, however, the beta rays first strike the sheet of plastic, then the bremsstrahlung generated is of low
                energy and a large proportion of it is absorbed in the sheet of metal which follows.
              </Text>
              <Text style={styles.paragraph}>
                These conclusions can be extended to other combinations of materials also.
              </Text>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  container: { flex: 1, flexDirection: 'row' },
  leftPane: { width: '29.75%', backgroundColor: '#d0cfcfff', paddingTop: 0 },
  rightPane: { width: '70.25%', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 0, backgroundColor: '#F7F1BE' },
  tabItem: {
    paddingVertical: 15,
    paddingLeft: 10,
  },
  activeTabItem: { backgroundColor: '#a9a9a9' },
  subHeading: { fontSize: 16, fontWeight: 'bold' },
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
  resultsImage: {
    width: '100%',
    height: 520,
    marginTop: 10,
    marginBottom: 16,
  },
});