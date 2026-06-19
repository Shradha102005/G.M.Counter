import { useState } from 'react';

import { useNavigation } from '@react-navigation/native';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


// --- NEW HELPER COMPONENTS FOR STABILITY ---

// Component for rendering formulas (using simple text for display)
const Formula = ({ children }) => (
  <Text style={styles.formulaText}>{children}</Text>
);

// Component for displaying a graph placeholder image
const GraphImage = ({ imageId, caption }) => (
  <View style={styles.graphWrapper}>
    {/* You would replace this with a proper <Image> component
        or charting library implementation in a real app. */}
    <Text style={styles.imagePlaceholderText}>
      [Visual Representation of Graph: {caption}]
    </Text>
    <Text style={styles.imageCaption}>{caption}</Text>
  </View>
);

// Component for rendering the main section title bar
const TitleBlock = ({ title }) => (
  <View style={styles.titleWrap}>
    <Text style={styles.title}>{title}</Text>
  </View>
);

// --- END HELPER COMPONENTS ---

export default function Screen3() {
  // Set initial state to 'study' to match the first item in the new menu
  const [selectedSection, setSelectedSection] = useState('study');
  const navigation = useNavigation();

  // --- UPDATED MENU ITEMS TO MATCH IMAGES ---
  const menuItems = [
    { key: 'study', label: 'Study of Nuclear Counting Statistics' },
    { key: 'definitions', label: 'Definitions' },
    { key: 'background', label: 'Measuring Background Radiation' },
    { key: 'exp_a', label: 'Experiment (A)' },
    { key: 'analysis_result', label: 'Statistical Analysis of Result' },
    { key: 'graph_pulses', label: 'Graph: Pulses Vs. Index' },
    { key: 'graph_counts', label: 'Graph: Counts Vs Index' },
    { key: 'graph_freq', label: 'Graph: Frequency of Occurrence Vs Counts' },
    { key: 'interpretation', label: 'Interpretation of the Results' },
    { key: 'exp_b', label: 'Experiment (B)' },
    { key: 'table_a', label: 'Table: Mean, Deviation, Standard Deviation' },
    { key: 'table_b', label: 'Table: Mean, Deviation, Standard Deviation Contd...' },
    
    { key: 'exercise', label: 'Exercise' },
    { key: 'examples', label: 'Examples' },
  ];
  // --- END UPDATED MENU ITEMS ---

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F1BE' }}>
      {/* Top Bar (same across all screens) */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.brand}>GM LAB</Text>
          <TouchableOpacity
            style={styles.dataBtn}
            onPress={() => navigation.navigate('screen3_dataentry')}
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
      {/* Thin black underline */}
      <View style={styles.topSeparator} />


      {/* Two-column layout */}
      <View style={styles.container}>
        {/* Left Pane (menu) */}
        <View style={styles.leftPane}>
          {menuItems.map(({ key, label }) => (
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
          {/* --- CONTENT BLOCKS --- */}


          {selectedSection === 'study' && (
            <>
              <TitleBlock title="Study of Nuclear Counting Statistics" />
              <Text style={styles.sectionTitle}>INTRODUCTION</Text>
              <Text style={styles.paragraph}>
                Systematic errors control the accuracy of a measurement. Thus, if the systematic errors are small, or if you can mathematically correct for them, then you will obtain an accurate estimate of the "true value". The precision of the experiment, on the other hand, is related to random errors. The precision of a measurement is directly related to the uncertainty in the measurement.
              </Text>

              <Text style={styles.paragraph}>
                Random errors are the statistical fluctuations during a measurement. If these values are too close to each other, then the random errors are small. But, if the values are not too close, then random errors are large. Thus, random errors are related to the reproducibility of a measurement.
              </Text>

              <Text style={styles.sectionTitle}>STATISTICAL ANALYSIS OF DATA</Text>
              <Text style={styles.paragraph}>
                To minimize these errors, one should have good understanding on 'Statistical analysis of data'.
              </Text>

            </>
          )}



          {selectedSection === 'definitions' && (
            <>
              <TitleBlock title="Definitions" />
              <View style={styles.bulletPoint}>
                <Text style={styles.paragraph}>
                  <Text style={{ fontWeight: 'bold' }}>Mean:</Text> Mean is the average value of a set of (n) measurements in an experiment. Mathematically it is defined as:
                </Text>
                <Formula>{'N = (N1 + N2 + ... + Nn) / n'}</Formula>
                <Formula>{'N = (1/n) * Σ N_i (i=1..n)'}</Formula>
                <Text style={styles.paragraph}>
                  Mean is also called as average value.
                </Text>
              </View>

              <View style={styles.bulletPoint}>
                <Text style={styles.paragraph}>
                  <Text style={{ fontWeight: 'bold' }}>Deviation:</Text> Deviation is the difference between the actual measured values and the average value. Deviation from the mean, d_i is simply the difference between any data point N_i and the mean, N̄. We define this by:
                </Text>
                <Formula>{'d_i = N_i - N̄'}</Formula>
              </View>

              <View style={styles.bulletPoint}>
                <Text style={styles.paragraph}>
                  When we try to look at the error or average deviation, the value probably will become zero because, we may have both positive and negative values which get cancelled. Yet an average value of the error will be desirable, since it tells us how good the data is in a quantitative way. Therefore we need a different way to obtain the measure of the scatter of the data.
                </Text>
              </View>

              <View style={styles.bulletPoint}>
                <Text style={styles.paragraph}>
                  <Text style={{ fontWeight: 'bold' }}>Variance (σ²) & Standard Deviation (σ):</Text> One way is to obtain standard deviation (σ) which is defined as:
                </Text>
                <Formula>{'σ² = (d1² + d2² + ... + dn²) / n'}</Formula>
                <Formula>{'σ² = (1/n) * Σ (N_i - N̄)²'}</Formula>
                <Text style={styles.paragraph}>
                  From this σ² (or σ) we see no negative sign and indicates average error contribution. We find that all the deviations make a contribution. We call the term σ² as variance.
                </Text>
              </View>


              <Text style={styles.imageCaption}>
                [Image of Normal and Poisson distribution curves for counting statistics]
              </Text>


            </>
          )}


          {selectedSection === 'background' && (
            <>
              <TitleBlock title="Measuring Background Radiation" />

              <Text style={styles.paragraph}>
                Standard deviation (σ) is a square root of the variance, which is widely used to indicate about the spread of our data.
              </Text>

              <Text style={styles.paragraph}>
                The definition of the standard deviation differs slightly for small samples. It is defined as follows:
              </Text>

              <View style={styles.bulletPoint}>
                <Text style={styles.subHeading}>For large samples (n ≥ 30):</Text>
                <Formula>{'σ² = (1/n) * Σ d_i² (for large samples)'}</Formula>
              </View>

              <View style={styles.bulletPoint}>
                <Text style={styles.subHeading}>For small samples (n &lt; 30):</Text>
                <Formula>{'σ² = (1/(n - 1)) * Σ d_i² (for small samples)'}</Formula>
              </View>

              <Text style={styles.sectionTitle}>MEASURING BACKGROUND RADIATION</Text>

              <Text style={styles.paragraph}>
                In this section, counting experiments are described to demonstrate the stochastic nature of radioactive processes. The importance of statistical methods in analyzing data and estimating measurement uncertainties is also covered.
              </Text>

              <Text style={styles.paragraph}>
                The G.M. detector registers pulses even when not exposed to radioactive sources. These pulses are caused by natural and man-made radioactive isotopes found in our environment, and also by cosmic radiation. The background radiation varies with time and depends on the local environment, the building material shielding and even weather. Therefore, the background count rate (counts per second) should be recorded before and after carrying out measurements.
              </Text>

              <Text style={styles.paragraph}>
                In the following discussion, the total number of counts recorded for a counting period will be indicated by N (or count rate R) and background counts by B (background rate R_B). The net count rate is given by N_net = (N - B)/t (where t is the counting period in seconds).
              </Text>

            </>
          )}


          {selectedSection === 'exp_a' && (
            <>
              <TitleBlock title="Experiment (A)" />

              <Text style={styles.sectionTitle}>EXPERIMENT (A)</Text>

              <Text style={styles.paragraph}>
                Make standard set up by connecting G.M. Counting System GC 601A/602A with G.M. Detector placed in the optical bench or G.M stand as shown in Figure (2 or 3).
              </Text>

              <Text style={styles.paragraph}>
                Remove the radioactive source from the source holder and set the preset time to 10 sec and take a set of 10 readings and tabulate them as shown in table no. (3a).
              </Text>

              {/* Table 3.a Content — rewritten to a neater vertical table */}
              <View style={styles.tableContainer}>
                <Text style={styles.tableCaption}>Table 3.a: Background counts registered for 10 seconds</Text>

                {/* Vertical, readable rows */}
                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableHeader}>Index No.</Text>
                  <Text style={styles.simpleTableHeader}>BG Counts (10 s)</Text>
                </View>

                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableCell}>1</Text>
                  <Text style={styles.simpleTableCell}>6</Text>
                </View>
                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableCell}>2</Text>
                  <Text style={styles.simpleTableCell}>6</Text>
                </View>
                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableCell}>3</Text>
                  <Text style={styles.simpleTableCell}>3</Text>
                </View>
                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableCell}>4</Text>
                  <Text style={styles.simpleTableCell}>5</Text>
                </View>
                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableCell}>5</Text>
                  <Text style={styles.simpleTableCell}>10</Text>
                </View>
                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableCell}>6</Text>
                  <Text style={styles.simpleTableCell}>6</Text>
                </View>
                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableCell}>7</Text>
                  <Text style={styles.simpleTableCell}>3</Text>
                </View>
                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableCell}>8</Text>
                  <Text style={styles.simpleTableCell}>13</Text>
                </View>
                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableCell}>9</Text>
                  <Text style={styles.simpleTableCell}>6</Text>
                </View>
                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableCell}>10</Text>
                  <Text style={styles.simpleTableCell}>11</Text>
                </View>

              </View>


              <Text style={styles.paragraph}>
                Now plot a bar graph for number of counts registered versus the Index Number say for group no. (1) as shown in Figure (11).
              </Text>


              <Text style={styles.paragraph}>
                Now repeat the experiment, to have large data counts. Store the data for 100 sec & take a set of ten such measurements as shown in table (3.b) Plot this bar graph of counts Vs index no. as shown in Fig (12).
              </Text>

              {/* Table 3.b Content — rewritten similarly */}
              <View style={styles.tableContainer}>
                <Text style={styles.tableCaption}>Table 3.b: Background counts registered for 100 seconds</Text>

                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableHeader}>Index No.</Text>
                  <Text style={styles.simpleTableHeader}>BG Counts (100 s)</Text>
                </View>

                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableCell}>1</Text>
                  <Text style={styles.simpleTableCell}>69</Text>
                </View>
                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableCell}>2</Text>
                  <Text style={styles.simpleTableCell}>63</Text>
                </View>
                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableCell}>3</Text>
                  <Text style={styles.simpleTableCell}>68</Text>
                </View>
                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableCell}>4</Text>
                  <Text style={styles.simpleTableCell}>62</Text>
                </View>
                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableCell}>5</Text>
                  <Text style={styles.simpleTableCell}>63</Text>
                </View>
                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableCell}>6</Text>
                  <Text style={styles.simpleTableCell}>61</Text>
                </View>
                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableCell}>7</Text>
                  <Text style={styles.simpleTableCell}>66</Text>
                </View>
                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableCell}>8</Text>
                  <Text style={styles.simpleTableCell}>70</Text>
                </View>
                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableCell}>9</Text>
                  <Text style={styles.simpleTableCell}>61</Text>
                </View>
                <View style={styles.simpleTableRow}>
                  <Text style={styles.simpleTableCell}>10</Text>
                  <Text style={styles.simpleTableCell}>67</Text>
                </View>

              </View>


              <Text style={styles.paragraph}>
                By comparing these two figures (11 & 12) we can deduce one of the most important laws of the measurement of radiation.
              </Text>

              <Text style={styles.paragraph}>
                The spread in measured values decreases as the number of pulses registered increases.
              </Text>

            </>
          )}


          {selectedSection === 'analysis_result' && (
            <>
              <TitleBlock title="Statistical Analysis of Result" />

              <Text style={styles.sectionTitle}>STATISTICAL ANALYSIS OF RESULTS</Text>

              <Text style={styles.paragraph}>
                We have already defined mean, variance and standard deviation at the beginning of this chapter. These parameters for the above set of tabulated background readings can be calculated as follows:
              </Text>

              {/* Table of results for Experiment A */}
              <View style={styles.resultsTable}>
                <View style={styles.resultsRow}>
                  <Text style={styles.resultsLabel}>Mean Value</Text>
                  <Text style={styles.resultsValue}>N̄</Text>
                  <Text style={styles.resultsLabel}>=</Text>
                  <Text style={styles.resultsValue}>6.5</Text>
                </View>

                <View style={styles.resultsRow}>
                  <Text style={styles.resultsLabel}>Variance</Text>
                  <Text style={styles.resultsValue}>σ²</Text>
                  <Text style={styles.resultsLabel}>=</Text>
                  <Text style={styles.resultsValue}>6.53</Text>
                </View>

                <View style={styles.resultsRow}>
                  <Text style={styles.resultsLabel}>Standard Deviation</Text>
                  <Text style={styles.resultsValue}>σ</Text>
                  <Text style={styles.resultsLabel}>=</Text>
                  <Text style={styles.resultsValue}>2.55</Text>
                </View>

              </View>

              <Text style={styles.imageCaption}>Fig (11): Plot of no of pulses Vs Index Number</Text>

            </>
          )}


          {selectedSection === 'graph_pulses' && (
            <>
              <TitleBlock title="Graph: Pulses Vs. Index" />
              <Text style={styles.sectionTitle}>Measurement of the background in 10 s</Text>
              <Image
                source={require('../assets/images/fir.jpeg')}
                style={styles.graphImage}
                resizeMode="contain"
              />
            </>
          )}


          {selectedSection === 'graph_counts' && (
            <>
              <TitleBlock title="Graph: Counts Vs Index" />
              <Text style={styles.sectionTitle}>No.of Counts in T=100 sec for 10 Measurements</Text>
              <Image
                source={require('../assets/images/seco.jpeg')}
                style={styles.graphImage}
                resizeMode="contain"
              />
            </>
          )}


          {selectedSection === 'graph_freq' && (
            <>
              <TitleBlock title="Graph: Frequency of Occurrence Vs Counts" />
              <Text style={styles.sectionTitle}>FREQUENCY DISTRIBUTION</Text>
              <Image
                source={require('../assets/images/thi.jpeg')}
                style={styles.graphImage}
                resizeMode="contain"
              />
            </>
          )}


          {selectedSection === 'interpretation' && (
            <>
              <TitleBlock title="Interpretation of the Results" />
              <Text style={styles.sectionTitle}>INTERPRETATION OF THE RESULTS</Text>
              <Text style={styles.paragraph}>
                The results follow a Poisson Distribution on which practically all radioactivity measurements are based. The results show that the mean value (N̄) is equal to the variance (σ²); this is characteristic of the Poisson distribution.
              </Text>

              <Text style={styles.paragraph}>
                The variance in any measured number of counts is therefore equal to the mean value of counts (σ² = N̄).
              </Text>

              <Text style={styles.paragraph}>
                The square root of variance, the standard deviation σ, is a measure of the scatter of individual counts around the mean value. As a rule of thumb, one can say that approximately 2/3 of the results are within one standard deviation of the mean value i.e., within the interval (N̄ ± σ), where σ = √N̄.
              </Text>

              <Text style={styles.paragraph}>
                Conversely, given the result from an individual measurement, the unknown "true" count lies within the interval [N ± σ] with a probability of approximately 2/3.
              </Text>

              <View style={styles.separator} />

              <Text style={styles.paragraph}>
                The above measured results of mean, variance and standard deviation follow Poisson distribution on repeated readings that show the mean value (N̄) is almost equal to the variance (σ²), which is characteristic of the Poisson distribution.
              </Text>

              <Text style={styles.paragraph}>
                The variance in any measured number of counts is therefore equal to the mean value of counts.
              </Text>

              <Text style={styles.paragraph}>
                Standard deviation (σ) which is a measure of the scatter of individual counting results around the mean value. As a rule of thumb, one can say that approximately 2/3 of the results are within one standard deviation of the mean value i.e., within the interval N̄ ± σ where σ = √N̄. Conversely, given the result from an individual measurement, the unknown 'true' count lies within the interval (N ± σ) with a probability of 2/3 (approximate).
              </Text>

            </>
          )}


          {selectedSection === 'exp_b' && (
            <>
              <TitleBlock title="Experiment (B)" />

              <Text style={styles.sectionTitle}>EXPERIMENT (B)</Text>

              <Text style={styles.paragraph}>
                To illustrate that for number of counts recorded being high, Poisson distribution follows closely normal or Gaussian distribution.
              </Text>

              <Text style={styles.subHeading}>PROCEDURE:</Text>

              <View style={styles.bulletPoint}>
                <Text style={styles.paragraph}>
                  Make standard counting setup as shown in figure (1).
                </Text>
              </View>

              <View style={styles.bulletPoint}>
                <Text style={styles.paragraph}>
                  Place a Beta source about 3 cm from the window of the detector.
                </Text>
              </View>

              <View style={styles.bulletPoint}>
                <Text style={styles.paragraph}>
                  Record counts typically for a preset time of 25 sec, and take 50 data readings.
                </Text>
              </View>

              <View style={styles.bulletPoint}>
                <Text style={styles.paragraph}>
                  Compute Mean, Deviation and Standard Deviation and tabulate the readings. Also compute other values, as indicated in the table.
                </Text>
              </View>

            </>
          )}

          {selectedSection === 'table_a' && (
  <>
    <Text style={styles.sectionTitle}>11. Table: Mean, Deviation, Standard Deviation</Text>

    <Image
      source={require('../assets/images/tab1.jpeg')}
      style={{ width: 900, height: 600, alignSelf: 'center', marginVertical: 10 }}
      resizeMode="contain"
    />
  </>
)}


          {selectedSection === 'table_b' && (
  <>
    <Text style={styles.sectionTitle}>12. Table: Mean, Deviation, Standard Deviation Contd...</Text>

    <Image
      source={require('../assets/images/tab2.jpeg')}
      style={{ width: 900, height: 600, alignSelf: 'center', marginVertical: 10 }}
      resizeMode="contain"
    />
  </>
)}


          

          {selectedSection === 'exercise' && (
  <>
    <Text style={styles.sectionTitle}>14. Exercise</Text>

    <Image
      source={require('../assets/images/exc.jpeg')}
      style={{ width: 700, height: 500, alignSelf: 'center', marginVertical: 10 }}
      resizeMode="contain"
    />
  </>
)}


{selectedSection === 'examples' && (
  <>
    <Text style={styles.sectionTitle}>15. Examples</Text>

    <Text style={styles.paragraph}>
      If a measurement of 10s duration yields 3 pulses, the result is correctly expressed as
      N = 3 ± 1.7 in 10s or Z = (0.3 ± 0.17) 1/s as √3 = 1.7.
    </Text>

    <Text style={styles.paragraph}>
      In experiment 1 in the first 10 measurements, i.e., after 100 s, 30 pulses were counted.
      The result would be N = 30 ± 5.5 in 100 s or Z = (0.30 ± 0.055) 1/s.
    </Text>

    <Text style={styles.paragraph}>
      After 100 measurements in Experiment 1, i.e., 1000 s, 286 pulses were counted.
      The result would be N = 286 ± 17 in 1000 s or Z = (0.286 ± 0.017) 1/s.
    </Text>

    <Text style={styles.paragraph}>
      If you compare the errors indicated for the count rate Z in the examples 1 and 3,
      you can see that a counting period which is 100 times longer (or 100 measurements)
      leads to a result where the measurement uncertainty is 10 times smaller.
    </Text>

    <Text style={styles.paragraph}>
      If the result is divided by the count time T:
    </Text>

    <Formula>{'N/T ± √N / T = Z ± √Z / √T'}</Formula>

    <Text style={styles.paragraph}>
      The uncertainty in the count rate Z is therefore proportional to one over the square root
      of the counting period T (or, equivalently, to the square root of the number of readings taken).
    </Text>
  </>
)}



          {/* Fallback to original content for completeness if old key is somehow selected */}

          {selectedSection === 'purpose' && (
            <Text style={styles.paragraph}>Error: Content not mapped to new menu key 'study'.</Text>
          )}

        </ScrollView>

      </View>

    </View>
  );
}


const styles = StyleSheet.create({
  /* Frame */
  container: { flex: 1, flexDirection: 'row' },

  /* Left column — match Screen1/2 */
  leftPane: {
    width: '29.75%',
    backgroundColor: '#d0cfcfff',
    paddingTop: 0,
  },
  tabItem: { paddingVertical: 15, paddingLeft: 10 },
  activeTabItem: { backgroundColor: '#a9a9a9' },
  subHeading: { fontSize: 16, fontWeight: 'bold' },

  /* Right column — match Screen1/2 */
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
    borderBottomWidth: 3,
    borderBottomColor: '#8E8E8E',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 10, marginBottom: 10 },
  paragraph: { fontSize: 16, marginBottom: 10, lineHeight: 22 },
  bulletPoint: { marginLeft: 10, marginBottom: 5 },
  separator: { height: 1, backgroundColor: '#ccc', marginVertical: 10 },

  // Styling for Formulas (to render LaTeX)
  formulaText: {
    fontSize: 16,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginVertical: 10,
    lineHeight: 25,
  },

  // Styling for Tables
  tableContainer: {
    borderWidth: 1,
    borderColor: '#000',
    marginVertical: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  tableCaption: {
    fontSize: 13,
    fontWeight: 'bold',
    backgroundColor: '#ccc',
    padding: 4,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderColor: '#000'
  },
  tableRow: { flexDirection: 'row', justifyContent: 'space-around' },
  tableCellHeader: {
    flex: 1,
    padding: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#e6e6e6',
    borderRightWidth: 1,
    borderColor: '#000',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    textAlign: 'center',
    borderRightWidth: 1,
    borderColor: '#ccc',
  },

  // Simple vertical table styles (used in Experiment A) – MADE SMALLER
  simpleTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,          // smaller height
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff'
  },
  simpleTableHeader: {
    flex: 1,
    fontWeight: '700',
    textAlign: 'left',
    fontSize: 14,                // slightly smaller font
  },
  simpleTableCell: {
    flex: 1,
    textAlign: 'left',
    fontSize: 14,                // slightly smaller font
  },

  // Statistical Results Table
  resultsTable: {
    marginVertical: 15,
    alignSelf: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000'
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 4
  },
  resultsLabel: {
    fontSize: 16,
    fontWeight: '600',
    width: 150,
    textAlign: 'left'
  },
  resultsValue: {
    fontSize: 16,
    fontWeight: '600',
    width: 50,
    textAlign: 'center'
  },
  imageCaption: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 5,
    marginBottom: 10
  },

  // Graph image style for fir / seco / thi
  graphImage: {
    width: 700,
    height: 500,
    alignSelf: 'center',
    marginVertical: 10,
  },

  graphWrapper: {
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    padding: 50,
    backgroundColor: '#fff',
    minHeight: 200,
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    color: '#888',
    fontStyle: 'italic',
  },


  /* Top bar styles (from original code) */
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
