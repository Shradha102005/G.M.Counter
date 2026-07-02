// app/screen0.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from "expo-router";

export default function Screen0() {
  const [selectedSection, setSelectedSection] = useState('intro');
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F1BE' }}>
      {/* Top Bar (same across all screens) */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.brand}>GM LAB</Text>
          <TouchableOpacity
            style={styles.dataBtn}
            onPress={() => router.push("/hub")}
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
        {/* Left Pane (menu) now scrollable */}
        <ScrollView style={styles.leftPane}>
          {[
            { key: 'intro', label: 'Introduction for G.M. Tubes' },
            { key: 'operating', label: 'Operating Characteristics' },
            { key: 'notes', label: 'Notes' },
            { key: 'graph', label: 'Graph: Voltage Vs Counts' },
            { key: 'notes2', label: 'Notes contd..' },
            { key: 'life', label: 'Life' },
            { key: 'def1', label: 'Important Definitions' },
            { key: 'def2', label: 'Important Definitions – contd...' },
            { key: 'def3', label: 'Important Definitions – contd...' },
            { key: 'gc603t', label: 'Description on G.M. Counting system GC603T' },
            { key: 'features', label: 'Important features' },

            { key: 'stand', label: 'Stand for G.M. Detector' },
            { key: 'slidingBench', label: 'G.M. Detector Sliding Bench' },
            { key: 'sourceKit', label: 'Source Kit & Aluminium Absorber Set' },
            { key: 'leadCastle', label: 'Lead Castle' },
            { key: 'betaSources', label: 'Beta Sources' },
            { key: 'gammaSources', label: 'Gamma Sources' },
          ].map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setSelectedSection(key)}
              style={[styles.tabItem, selectedSection === key && styles.activeTabItem]}
            >
              <Text style={styles.subHeading}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Right Pane (content) */}
        <ScrollView style={styles.rightPane}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}> GENERAL THEORY</Text>
          </View>

          {/* INTRODUCTION */}
          {selectedSection === 'intro' && (
            <>
              <Text style={styles.sectionTitle}>INTRODUCTION</Text>

              <Text style={styles.paragraph}>
                Geiger-Muller radiation counter tubes (G.M.Tubes) are intended to detect alpha particles,
                beta particles, gamma or X-radiation.
              </Text>

              <Text style={styles.paragraph}>
                A G.M. Tube is a gas-filled device which reacts to individual ionizing events, thus enabling
                them to be counted.
              </Text>

              <Text style={styles.paragraph}>
                A G.M. Tube consists of basically an electrode at a positive potential (anode) surrounded by
                a metal cylinder at a negative potential (cathode). The cathode forms part of the envelope or
                is enclosed in a glass envelope. Ionizing events are initiated by quanta or particles, entering
                the tube either through the window or through the cathode and colliding with the gas
                molecules.
              </Text>

              <Text style={styles.paragraph}>
                The gas filling consists of a mixture of one or more rare gases and a quenching agent.
              </Text>

              <Text style={styles.paragraph}>
                Quenching is the termination of the ionization current pulse in a G.M. tube. Effective
                quenching in G.M. Tube is determined by the combination of the quenching gas properties
                and the value of the anode resistor.
              </Text>

              <Text style={styles.paragraph}>{'\u2022'} The capacitance of a G.M. Tube is between anode and cathode, ignoring the
                capacitive effects of general connections.
              </Text>
            </>
          )}

          {/* OPERATING CHARACTERISTICS */}
          {selectedSection === 'operating' && (
            <>
              <Text style={styles.sectionTitle}>OPERATING CHARACTERISTICS:</Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Starting Voltage (Vs):</Text>
              <Text style={styles.paragraph}>
                This is the lowest voltage applied to a G.M. Tube at which pulses just appear across the
                anode resistor (see Fig. 4) and unit starts counting.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Plateau:</Text>
              <Text style={styles.paragraph}>
                This is the section of the GM characteristic curve constructed with counting rate versus
                applied voltage (with constant irradiation) over which the counting rate is substantially
                independent of the applied voltage. Unless otherwise stated, the plateau is measured at a
                counting rate of approximately 200 counts. (i.e. 200 CPS)
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Plateau Threshold Voltage (V1):</Text>
              <Text style={styles.paragraph}>
                This is the lowest applied voltage which corresponds to the start of the plateau for the stated
                sensitivity of the measuring circuit. See Fig. 4. {'\n'}
                <Text style={{fontWeight:'700'}}>Plateau Length:</Text> This is the range of applied voltage over which the plateau region
                extends. See Fig. 4.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Upper Threshold Voltage (V2):</Text>
              <Text style={styles.paragraph}>
                This is the higher voltage up to which plateau extends, beyond which count rate increases
                with increase in applied voltage.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Plateau Slope:</Text>
              <Text style={styles.paragraph}>
                This is the change in counting rate over the plateau length, expressed in % per volt. See Fig. 4.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Recommended Supply Voltage (Vo): (Operating Voltage)</Text>
              <Text style={styles.paragraph}>
                This is the supply voltage at which the G.M. Tube should preferably be used. This voltage is
                normally chosen to be in the middle of the plateau. See Fig. 4.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Background (BG):</Text>
              <Text style={styles.paragraph}>
                This is the counting rate measured in the absence of the radiation source. The BG is due to
                cosmic rays and any active sources in the experimental room.
              </Text>
            </>
          )}

          {/* NOTES */}
          {selectedSection === 'notes' && (
            <>
              <Text style={styles.sectionTitle}>NOTES :</Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Dead Time (Td):</Text>
              <Text style={styles.paragraph}>
                This is the time interval, after the initiation of a discharge resulting in a normal pulse, during
                which the G.M. Tube is insensitive to further ionizing events. See Fig. 5.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Resolution (resolving) time (TR):</Text>
              <Text style={styles.paragraph}>
                This is the minimum time interval between two distinct ionizing events which enables both to
                be counted independently or separately. See Fig. 5.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Recovery Time (Tre):</Text>
              <Text style={styles.paragraph}>
                This is the minimum time interval between the initiation of a normal size pulse and the
                initiation of the next pulse of normal size. See Fig. 5.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Anode resistor:</Text>
              <Text style={styles.paragraph}>
                Normally the tube should be operated with an anode resistor of the value indicated in the
                measuring circuit, or higher. Decreasing the value of the anode resistor not only decreases
                the dead time but also the plateau length. A decrease in resistance below the limiting value
                may affect tube life and lead to its early destruction.
              </Text>

              <Text style={styles.paragraph}>
                The anode resistor should be connected directly to the anode connector of the tube to ensure
                that parasitic capacitances of leads will not excessively increase the capacitive load on the
                tube. An increase in capacitive load may increase the pulse amplitude, the pulse duration,
                the dead time and plateau slope. In addition, the plateau will be shortened appreciably.
                Shunt capacitances as high as 20 pF may destroy the tube, but lower values are also
                dangerous.
              </Text>
            </>
          )}

          {/* GRAPH: Voltage Vs Counts */}
          {selectedSection === 'graph' && (
            <>
              <Text style={styles.sectionTitle}>Graph: Voltage Vs Counts</Text>
              <Image
                source={require('../assets/images/ggg.jpeg')}
                style={{
                  width: 1200,
                  height: 700,
                  alignSelf: 'center',
                  marginVertical: 10,
                  resizeMode: 'contain',
                }}
              />
            </>
          )}

          {/* NOTES CONTINUED */}
          {selectedSection === 'notes2' && (
            <>
              <Text style={styles.sectionTitle}>Notes contd..</Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>
                Maximum Counting Rate
              </Text>
              <Text style={styles.paragraph}>
                The maximum counting rate is approximately 1/Td (Td = dead time).
                For continuous stable operation, adjust the counting rate to a value
                in the linear part of the counting rate/dose rate curve.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>
                Tube sensitivity at extremely high dose rates
              </Text>
              <Text style={styles.paragraph}>
                At dose rates exceeding the recommended maximum, a G.M. Tube will
                produce the maximum number of counting pulses per second, limited by its
                dead time and the circuit in which it is incorporated. Due to specific
                circuit characteristics, the indicated counting rate may fall appreciably,
                even to zero. If dose rates exceeding 10× the recommended maximum for
                window tubes (or 100× for cylinder tubes) are likely, use a circuit that
                continuously indicates saturation.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>
                Dead Time Losses
              </Text>
              <Text style={styles.paragraph}>
                After every pulse, the tube is temporarily insensitive during the dead
                time (Td). Pulses occurring in this period are not counted. At a counting
                rate of N counts/s, the tube will be dead during N × Td of the time so
                approximately N × N × Td of the counts will be lost.
              </Text>
              <Text style={styles.paragraph}>
                For inaccuracy due to dead time to be &lt; 1%, N should be less than
                1/(100 × Td). Example: If Td = 20 μsec, 1% inaccuracy occurs at about
                500 counts/s.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>
                Background
              </Text>
              <Text style={styles.paragraph}>
                The most important sources of background are:
              </Text>
              <Text style={styles.paragraph}>a. Gamma radiation from the environment and cosmic radiation.</Text>
              <Text style={styles.paragraph}>b. Mesons from cosmic radiation.</Text>
              <Text style={styles.paragraph}>
                c. Beta particles from contamination and impurities of materials from which the detector is made.
              </Text>
              <Text style={styles.paragraph}>
                d. Spontaneous discharge or pulses in the detector and counting circuit that do not originate from radiation (electronic noise).
              </Text>
              <Text style={styles.paragraph}>
                From published data, the gamma contribution accounts for ~70% of
                background and a further ~25% is due to cosmic mesons. For most G.M.
                tube applications, background can be reduced to acceptable levels by
                shielding with lead or steel; thus most gamma contribution is eliminated.
                The values given in data (counts per minute) are averages over long duration.
              </Text>
            </>
          )}

          {/* LIFE */}
          {selectedSection === 'life' && (
            <>
              <Text style={styles.sectionTitle}>Life</Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Storage life</Text>
              <Text style={styles.paragraph}>
                If stored in a cool dry place, free from continuous or severe vibration,
                there is hardly any deterioration in tube characteristics. A storage life
                of years is not unusual.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Warning</Text>
              <Text style={styles.paragraph}>
                Generally, life end of a G.M. tube is indicated by an increasing slope
                and a shorter plateau. For older tubes, operation is recommended at the
                first third of the plateau.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Operational life</Text>
              <Text style={styles.paragraph}>
                The operational life is expressed in total counts (discharges). The
                quenching gas, ionized during discharge, should recombine; however,
                minute quantities become chemically bound and no longer take part in
                quenching. This gradually reduces the plateau length and, for a given
                working voltage, increases the counting rate—culminating in continuous
                discharge rendering the tube useless.
              </Text>
              <Text style={styles.paragraph}>
                Ambient temperature during operation importantly affects tube life.
                Above 50°C, gas mixture changes may reduce attainable counts. Short
                periods of operation (≤1 h) up to ~70°C should not prove harmful, but
                life decreases with increasing temperature.
              </Text>
              <Text style={styles.paragraph}>
                Depending on application and circumstances, the quenching gas may get
                exhausted in hours or may last for many years. For these reasons, G.M.
                tubes cannot be guaranteed unconditionally for a specified period.
              </Text>
            </>
          )}

          {/* IMPORTANT DEFINITIONS */}
          {selectedSection === 'def1' && (
            <>
              <Text style={styles.sectionTitle}>Important Definitions</Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Absorbed dose</Text>
              <Text style={styles.paragraph}>
                Energy transferred to a material by ionising radiation per unit mass.
                Unit: J·kg⁻¹; Name of unit: Gray (see also Rad).
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Activity</Text>
              <Text style={styles.paragraph}>
                Measurement of quantity of radioactive material (transformations per
                unit time). Unit: s⁻¹; Name of unit: Becquerel (see also Curie).
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Alpha decay</Text>
              <Text style={styles.paragraph}>
                Radioactive conversion with emission of an alpha particle, reducing Z by 2
                and A by 4; occurs primarily for heavy nuclides (Z &gt; 82).
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Alpha radiation</Text>
              <Text style={styles.paragraph}>
                High-energy helium (⁴He) nuclei emitted during alpha disintegration;
                discrete initial energies characteristic of the nuclide.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Becquerel (Bq)</Text>
              <Text style={styles.paragraph}>
                SI unit of activity: one disintegration per second.
              </Text>
              <Text style={styles.paragraph}>1 Bq = 27×10⁻¹² Ci  = 27 pCi</Text>
              <Text style={styles.paragraph}>1 kBq = 27×10⁻⁹ Ci = 27 nCi</Text>
              <Text style={styles.paragraph}>1 MBq = 27×10⁻⁶ Ci = 27 μCi</Text>
              <Text style={styles.paragraph}>1 GBq = 27×10⁻³ Ci = 27 mCi</Text>
              <Text style={styles.paragraph}>1 TBq = 27 Ci      = 27 Ci</Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Beta decay</Text>
              <Text style={styles.paragraph}>
                Conversion with emission of β⁻ (electron) or β⁺ (positron).
                β⁻: n → p + e⁻ + ν̄; β⁺: p → n + e⁺ + ν.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Beta Radiation</Text>
              <Text style={styles.paragraph}>
                Radiation of electrons (negative or positive) from nuclei; spectrum is
                continuous up to a maximum (beta end-point energy).
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Bremsstrahlung</Text>
              <Text style={styles.paragraph}>
                Radiation due to acceleration/deceleration of charged particles in
                atomic Coulomb fields.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Curie (Ci)</Text>
              <Text style={styles.paragraph}>
                Derived unit of activity. 1 Ci = 3.7 × 10¹⁰ disintegrations per second.
              </Text>
              <Text style={styles.paragraph}>1 Ci = 37 GBq</Text>
              <Text style={styles.paragraph}>1 mCi = 37 MBq</Text>
              <Text style={styles.paragraph}>1 μCi = 37 kBq</Text>
              <Text style={styles.paragraph}>1 nCi = 37 Bq</Text>
              <Text style={styles.paragraph}>1 pCi = 37 mBq</Text>
            </>
          )}

          {/* IMPORTANT DEFINITIONS – CONTINUATION */}
          {selectedSection === 'def2' && (
            <>
              <Text style={styles.sectionTitle}>Important Definitions – contd...</Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Dose</Text>
              <Text style={styles.paragraph}>
                See absorbed dose, exposure dose, and dose equivalent.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Dose equivalent</Text>
              <Text style={styles.paragraph}>
                Radiation protection term: absorbed dose × quality factor.
                Unit: J·kg⁻¹; Name of unit: Sievert (see also Rem).
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Dose rate</Text>
              <Text style={styles.paragraph}>Dose absorbed per unit time.</Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Electron radiation</Text>
              <Text style={styles.paragraph}>
                Emission consisting of negatively or positively charged electrons.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Exposure dose</Text>
              <Text style={styles.paragraph}>
                Ratio of electric charge of ions (of one polarity) formed in air to mass of
                air. Unit: C·kg⁻¹ (see also Roentgen).
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Gamma Radiation</Text>
              <Text style={styles.paragraph}>
                Photon radiation emitted by excited atomic nuclei; gamma and X-rays are
                both electromagnetic, distinguished by mode of generation.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Gray (Gy)</Text>
              <Text style={styles.paragraph}>
                SI unit of absorbed dose. 1 Gy = 1 J·kg⁻¹ = 100 Rad.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Half–thickness</Text>
              <Text style={styles.paragraph}>
                Thickness of material that reduces intensity of initial radiation by a factor
                of two.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Ionising radiation</Text>
              <Text style={styles.paragraph}>
                Radiation consisting of particles capable of ionising a gas.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Isotopes</Text>
              <Text style={styles.paragraph}>
                Nuclides with the same atomic number but different atomic weights.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Mass per unit area</Text>
              <Text style={styles.paragraph}>
                Product of density of a material and its thickness.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Nuclide</Text>
              <Text style={styles.paragraph}>
                Neutral atoms characterized by specific numbers of protons (Z) and
                neutrons (N) in the nucleus.
              </Text>
            </>
          )}

          {/* IMPORTANT DEFINITIONS – CONTINUATION 2 */}
          {selectedSection === 'def3' && (
            <>
              <Text style={styles.sectionTitle}>Important Definitions – contd...</Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Quality factor</Text>
              <Text style={styles.paragraph}>
                Factor allowing for different biological effects of various radiations and energies.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Rad (Radiation Absorbed Dose)</Text>
              <Text style={styles.paragraph}>
                Old unit of absorbed dose. 1 Rad = 0.01 J·kg⁻¹ (= 100 ergs/g).
                All absorbed-dose measurements depend on medium and radiation level.
                1 R ≈ 0.871 Rad in air.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>RBE (Relative Biological Effectiveness)</Text>
              <Text style={styles.paragraph}>
                Biological effect depends on energy absorbed and radiation type. RBE is a
                weighting factor: (dose of 200 keV γ-rays giving a given effect) ÷ (dose of
                radiation of energy E giving the same effect).
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Radioactivity</Text>
              <Text style={styles.paragraph}>
                Property of certain nuclides to emit radiation due to spontaneous transitions.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Rem (Roentgen Equivalent Man)</Text>
              <Text style={styles.paragraph}>
                Early unit for biological effect on living tissue, accounting for radiation type.
                Rem dose = Rad dose × RBE.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Roentgen-R</Text>
              <Text style={styles.paragraph}>
                Old unit measuring radiation by its ability to ionise air. One Roentgen
                releases a charge of 258 μC per kilogram of air.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>Sievert (Sv)</Text>
              <Text style={styles.paragraph}>
                SI unit for biological effect on living tissue; 1 Sv = 100 Rem.
              </Text>

              <Text style={[styles.paragraph, {fontWeight: '700'}]}>H*(10)</Text>
              <Text style={styles.paragraph}>
                “H-Star-Ten”: Ambient Dose Equivalent, applicable to strongly penetrating
                radiation in environmental/area monitoring; relates to dose at 10 mm
                depth in human tissue (ICRU Report 39).
              </Text>
            </>
          )}

          {/* GC603T DESCRIPTION */}
{selectedSection === 'gc603t' && (
  <>
    <Text style={styles.sectionTitle}>Description on G.M. Counting system GC603T</Text>

    <Text style={styles.paragraph}>
      The GM Counter Smart Card with Tablet is a microcontroller-based radiation counting system designed for accurate and reliable measurement of radiation events. The unit incorporates a built-in adjustable high-voltage supply for connecting to a variety of Geiger-Müller (G.M.) detectors.
    </Text>
    <Text style={styles.paragraph}>
      The system features integrated ADC (Analog-to-Digital Converter) and DAC (Digital-to-Analog Converter) functions, enabling precise signal processing, measurement, and control. It also includes built-in counting, timing, data storage, detector monitoring, and calibration functions. The high-voltage output can be conveniently adjusted and controlled through commands from the Android tablet application.
    </Text>
    <Text style={styles.paragraph}>
      Measuring parameters include preset count values, count rate, high-voltage settings, and system status are displayed and controlled through the Android tablet application.
    </Text>
    <Text style={styles.paragraph}>
      Wireless communication between the GM Counter and the Android tablet is established through Bluetooth technology, allowing real-time data transfer, monitoring, configuration, and high-voltage adjustment without the need for physical cables.
    </Text>
    <Text style={styles.paragraph}>
      The compact design, advanced electronics, built-in processing capabilities, and user-friendly tablet interface make the system suitable for laboratory experiments, educational purposes, and advanced nuclear radiation monitoring applications in a nuclear plants or environmental survey labs etc.. with appropriate detectors
    </Text>

    <Text style={[styles.paragraph, { fontWeight: '700', marginTop: 8 }]}>Important Features of GM Counter smart card with Android Tablet</Text>
    <Text style={styles.paragraph}>{'\u2022'} Compact, reliable, and suitable for laboratory experiments involving radiation detection and counting.</Text>
    <Text style={styles.paragraph}>{'\u2022'} Android tablet-based display for monitoring high voltage, preset time, count value, count rate, and other operating parameters.</Text>
    <Text style={styles.paragraph}>{'\u2022'} User-friendly Android tablet application for system operation, parameter configuration, data acquisition, and real-time monitoring of measurement results.</Text>
    <Text style={styles.paragraph}>{'\u2022'} Adjustable high-voltage supply from 0 to 1200 V DC with a maximum current of 0.5 mA and ripple less than 20 mV.</Text>
    <Text style={styles.paragraph}>{'\u2022'} Maximum counting capacity of 999,999 counts.</Text>
    <Text style={styles.paragraph}>{'\u2022'} Programmable timer with a preset range of 1 to 9,999 seconds.</Text>
    <Text style={styles.paragraph}>{'\u2022'} MHV connector for connecting to the G.M. detector for obtaining pulse output.</Text>
    <Text style={styles.paragraph}>{'\u2022'} Data can be transferred to a PC through a USB Type-C interface for storage, analysis, and report generation.</Text>
    <Text style={styles.paragraph}>{'\u2022'} Supports communication with Android applications for data viewing, logging, and management.</Text>
    <Text style={styles.paragraph}>{'\u2022'} Both GM counter smart card & Android tab work on 5volts power supply</Text>

    {/* GC603T front & rear panel image */}
    <Image
      source={require('../assets/images/602.jpeg')}
      style={{
        width: 900,
        height: 300,
        alignSelf: 'center',
        marginVertical: 10,
        resizeMode: 'contain',
      }}
    />
  </>
)}

          {/* IMPORTANT FEATURES */}
          {selectedSection === 'features' && (
            <>
              <Text style={styles.sectionTitle}>Important Features of GM Counter smart card with Android Tablet</Text>
              <Text style={styles.paragraph}>{'\u2022'} Compact, reliable, and suitable for laboratory experiments involving radiation detection and counting.</Text>
              <Text style={styles.paragraph}>{'\u2022'} Android tablet-based display for monitoring high voltage, preset time, count value, count rate, and other operating parameters.</Text>
              <Text style={styles.paragraph}>{'\u2022'} User-friendly Android tablet application for system operation, parameter configuration, data acquisition, and real-time monitoring of measurement results.</Text>
              <Text style={styles.paragraph}>{'\u2022'} Adjustable high-voltage supply from 0 to 1200 V DC with a maximum current of 0.5 mA and ripple less than 20 mV.</Text>
              <Text style={styles.paragraph}>{'\u2022'} Maximum counting capacity of 999,999 counts.</Text>
              <Text style={styles.paragraph}>{'\u2022'} Programmable timer with a preset range of 1 to 9,999 seconds.</Text>
              <Text style={styles.paragraph}>{'\u2022'} MHV connector for connecting to the G.M. detector for obtaining pulse output.</Text>
              <Text style={styles.paragraph}>{'\u2022'} Data can be transferred to a PC through a USB Type-C interface for storage, analysis, and report generation.</Text>
              <Text style={styles.paragraph}>{'\u2022'} Supports communication with Android applications for data viewing, logging, and management.</Text>
              <Text style={styles.paragraph}>{'\u2022'} Both GM counter smart card & Android tab work on 5volts power supply</Text>
            </>
          )}

          {/* STAND FOR G.M. DETECTOR */}
{selectedSection === 'stand' && (
  <>
    <Text style={styles.sectionTitle}>Stand for G.M. Detector</Text>

    {/* Stand photo */}
    <Image
      source={require('../assets/images/stand.jpeg')}
      style={{
        width: 450,
        height: 300,
        alignSelf: 'center',
        marginVertical: 10,
        resizeMode: 'contain',
      }}
    />

    <Text style={styles.paragraph}>
      Stand for G.M. tube type SG200 has been designed to hold PVC-enclosed End Window G.M.
      tube, as shown in the picture. This stand can be housed inside lead shielding if required. It
      has both sample and absorber trays. The position of these trays can be adjusted from the end
      window of the detector. The stand, made of acrylic sheet, is precisely milled for sliding-in of
      sample and absorber trays.
    </Text>
    <Text style={styles.paragraph}>
      The sample tray is designed to hold planchets or disc-type radioactive standard sources
      (Beta or Gamma). Aluminium absorber discs can be interposed between the source and the
      detector to attenuate the radiation as seen by the detector.
    </Text>
    <Text style={styles.paragraph}>
      A captive screw holds the detector PVC tube at any height. To increase the distance between
      the end window and source, one can lift the PVC tube further up, which can be held by the
      captive screw.
    </Text>
  </>
)}


          {/* SLIDING BENCH */}
{selectedSection === 'slidingBench' && (
  <>
    

    {/* Sliding bench photo */}
    <Image
      source={require('../assets/images/bench.jpeg')}
      style={{
        width: 900,
        height: 400,
        alignSelf: 'center',
        marginVertical: 10,
        resizeMode: 'contain',
      }}
    />

    <Text style={styles.paragraph}>
      Sliding Bench for G.M. experiments (Type: SB201) consists of a bench with sliding grooves
      and a graduated S.S. scale fixed on one side. The scale has graduations in cm and inches up
      to 50 cm / 20 inches. There are three vertical sliding mounts for mounting an End Window
      G.M. detector horizontally facing the absorber and source mounts.
    </Text>
    <Text style={styles.paragraph}>
      Each of these mounts can be positioned along the slide scale to set the required distance
      between the end window and the source with the absorber mount interposed between them.
      The End Window detector is housed in a PVC enclosure with an MHV socket fixed onto it.
    </Text>
  </>
)}


          {selectedSection === "sourceKit" && (
  <>
    

    {/* TOP IMAGE — fo.jpg */}
    <Image
      source={require("../assets/images/fo.jpeg")}
      style={{
        width: "100%",
        height: 700,
        resizeMode: "contain",
        marginTop: 10,
        marginBottom: 25,   // extra spacing after image
      }}
    />

    {/* TEXT WITH BIGGER HEADING */}
    <Text style={[styles.paragraph, { marginVertical: 20 }]}>
      <Text style={{ fontSize: 20, fontWeight: "800" }}>
        Accessories for Geiger Counting System:
      </Text>{" "}
      GM120 is a Halogen-quenched End Window G.M. detector supplied by
      Nucleonix. It is suitable for general-purpose GM counting applications
      and all G.M. experiments. Its operating voltage is approximately 500 V.
      It has a very wide plateau length and a plateau slope better than 6% per
      100 V. The detector is supplied in a cylindrical PVC enclosure with MHV
      socket arrangement for applying HV bias.
    </Text>

    {/* BOTTOM IMAGE — tin.jpg */}
    <Image
      source={require("../assets/images/tin.jpeg")}
      style={{
        width: "100%",
        height: 300,
        resizeMode: "contain",
        marginTop: 10,
        marginBottom: 30,   // extra spacing after image
      }}
    />
  </>
)}


          {/* LEAD CASTLE – IMAGE ONLY, BIGGER */}
          {selectedSection === 'leadCastle' && (
            <>
              
              <Image
                source={require('../assets/images/leadcastle.jpeg')}
                style={{
                  width: 950,
                  height: 700,
                  alignSelf: 'center',
                  marginVertical: 12,
                  resizeMode: 'contain',
                }}
              />
            </>
          )}

          {/* BETA SOURCES */}
          {selectedSection === 'betaSources' && (
            <>
              <Text style={styles.sectionTitle}>
                TYPICAL CALCULATION OF ACTIVITY FOR TWO BETA AND TWO GAMMA SOURCES
              </Text>

              <Text style={[styles.paragraph, { fontWeight: '700' }]}>
                Beta Sources :
              </Text>

              <Text style={[styles.paragraph, { fontWeight: '700' }]}>
                1. Sr-90/Y-90 :
              </Text>
              <Text style={styles.paragraph}>
                Half-Life (T½) = 28.5 Years
              </Text>
              <Text style={styles.paragraph}>
                Activity (A₀) as on 31-01-2016 = 3.7 KBq. = 3700 Bq.
              </Text>
              <Text style={styles.paragraph}>
                Suppose, we want to find out Activity (A) as on 31-01-2021, then,
              </Text>
              <Text style={styles.paragraph}>
                Elapsed Time (t) = 5 Years
              </Text>
              <Text style={styles.paragraph}>
                By using the formula, A = A₀ × e⁻ˡᵗ  =  A₀ × e^(0.693 / T½ × t)
              </Text>
              <Text style={styles.paragraph}>
                Activity (A) as on 31-01-2021 = 3700 × e^((0.693 / 28.5) × 5){'\n'}
                = 3700 × e⁻⁰·¹²¹⁵⁸{'\n'}
                = 3700 × 0.8855{'\n'}
                = 3276 Bq.{'\n'}
                = 3.276 KBq.
              </Text>

              <Text style={[styles.paragraph, { fontWeight: '700', marginTop: 12 }]}>
                2. Tl-204 :
              </Text>
              <Text style={styles.paragraph}>
                Half-Life (T½) = 4 Years
              </Text>
              <Text style={styles.paragraph}>
                Activity (A₀) as on 31-07-2018 = 10 KBq. = 10000 Bq.
              </Text>
              <Text style={styles.paragraph}>
                Suppose, we want to find out Activity (A) as on 31-01-2021, then,
              </Text>
              <Text style={styles.paragraph}>
                Elapsed Time (t) = 2 Years 6 Months = 2.5 Years
              </Text>
              <Text style={styles.paragraph}>
                By using the formula, A = A₀ × e⁻ˡᵗ  =  A₀ × e^(0.693 / T½ × t)
              </Text>
              <Text style={styles.paragraph}>
                Activity (A) as on 31-01-2021 = A₀ × e^((0.693 / 4) × 2.5){'\n'}
                = 10000 × e⁻⁰·⁴³³¹³{'\n'}
                = 10000 × 0.6485{'\n'}
                = 6485 Bq.{'\n'}
                = 6.485 KBq.
              </Text>
            </>
          )}

          {/* GAMMA SOURCES */}
          {selectedSection === 'gammaSources' && (
            <>
              <Text style={styles.sectionTitle}>Gamma Sources :</Text>

              <Text style={[styles.paragraph, { fontWeight: '700' }]}>
                1. Cs-137 :
              </Text>
              <Text style={styles.paragraph}>
                Half-Life (T½) = 30 Years
              </Text>
              <Text style={styles.paragraph}>
                Activity (A₀) as on 31-08-2017 = 111 KBq. = 111000 Bq.
              </Text>
              <Text style={styles.paragraph}>
                Suppose, we want to find out Activity (A) as on 31-01-2021, then,
              </Text>
              <Text style={styles.paragraph}>
                Elapsed Time (t) = 3 Years 5 Months = 3.4167 Years
              </Text>
              <Text style={styles.paragraph}>
                By using the formula, A = A₀ × e⁻ˡᵗ  =  A₀ × e^(0.693 / T½ × t)
              </Text>
              <Text style={styles.paragraph}>
                Activity (A) as on 31-01-2021 = A₀ × e^((0.693 / 30) × 3.4167){'\n'}
                = 111000 × e⁻⁰·⁰⁷⁸⁹³{'\n'}
                = 111000 × 0.9241{'\n'}
                = 102575 Bq.{'\n'}
                = 102.575 KBq.
              </Text>

              <Text style={[styles.paragraph, { fontWeight: '700', marginTop: 12 }]}>
                2. Co-60 :
              </Text>
              <Text style={styles.paragraph}>
                Half-Life (T½) = 5.3 Years
              </Text>
              <Text style={styles.paragraph}>
                Activity (A₀) as on 30-04-2019 = 133.2 KBq. = 133200 Bq.
              </Text>
              <Text style={styles.paragraph}>
                Suppose, we want to find out Activity (A) as on 31-01-2021, then,
              </Text>
              <Text style={styles.paragraph}>
                Elapsed Time (t) = 1 Year 9 Months = 1.75 Years
              </Text>
              <Text style={styles.paragraph}>
                By using the formula, A = A₀ × e⁻ˡᵗ  =  A₀ × e^(0.693 / T½ × t)
              </Text>
              <Text style={styles.paragraph}>
                Activity (A) as on 31-01-2021 = A₀ × e^((0.693 / 5.3) × 1.75){'\n'}
                = 133200 × e⁻⁰·²²⁸⁸{'\n'}
                = 133200 × 0.7955{'\n'}
                = 105961 Bq.{'\n'}
                = 105.961 KBq.
              </Text>

              <Text style={[styles.paragraph, { fontWeight: '700', marginTop: 14 }]}>
                3. DOSE RATE CALCULATION
              </Text>
              <Text style={styles.paragraph}>
                Dose rate can be calculated by using the following formula:
              </Text>
              <Text style={styles.paragraph}>
                Dose rate = (Source Activity × gamma constant){'\n'}
                {'           '}/ (Distance)²
              </Text>
              <Text style={styles.paragraph}>
                where{'\n'}
                • Dose rate is in mR (milli Roentgen){'\n'}
                • Source Activity is in mCi (milli Curies){'\n'}
                • Distance is in cm (Centimeters){'\n'}
                • Gamma constant for Cs-137 is 3300{'\n'}
                • and gamma constant for Co-60 is 13200
              </Text>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* Frame */
  container: { flex: 1, flexDirection: 'row' },

  /* Left column */
  leftPane: {
    width: '29.75%',
    backgroundColor: '#d0cfcfff',
  },
  tabItem: { paddingVertical: 15, paddingLeft: 10 },
  activeTabItem: { backgroundColor: '#a9a9a9' },
  subHeading: { fontSize: 16, fontWeight: 'bold' },

  /* Right column */
  rightPane: {
    width: '70.25%',
    paddingHorizontal: 20,
    paddingBottom: 20,
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
