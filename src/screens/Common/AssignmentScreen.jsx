import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, SearchBar, Btn, Avatar } from '../../components/Shared';
import { IconStethoscope, IconPatient, IconChevron, IconPlus, IconBack } from '../../icons';
import { DOCTORS, PATIENTS } from '../../data/mock';

export const AssignmentScreen = ({ 
  initialDoctorId, 
  initialPatientId, 
  onCancel 
}) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);

  const [step, setTab] = useState(initialDoctorId ? 'patient' : 'doctor');
  const [selectedDoctor, setSelectedDoctor] = useState(initialDoctorId ? DOCTORS.find(d => d.id === initialDoctorId) : null);
  const [selectedPatients, setSelectedPatients] = useState(initialPatientId ? [initialPatientId] : []);
  const [query, setQuery] = useState('');

  const filteredDoctors = DOCTORS.filter(d => 
    (d.firstName + d.lastName).toLowerCase().includes(query.toLowerCase()) || d.code.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPatients = PATIENTS.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || p.mrn.toLowerCase().includes(query.toLowerCase())
  );

  const togglePatient = (id) => {
    setSelectedPatients(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    if (!selectedDoctor || selectedPatients.length === 0) return;
    
    const payload = selectedPatients.map(pId => ({
      doctorCode: selectedDoctor.code,
      patientCode: PATIENTS.find(p => p.id === pId)?.mrn
    }));
    
    console.log('Assignment Payload:', JSON.stringify(payload, null, 2));
    // API call to /api/{orgName}/assignment/{hospCode}/assign
    onCancel();
  };

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.stepperHeader}>
        <View style={styles.stepInfo}>
          <Text style={styles.stepTitle}>
            {step === 'doctor' ? 'Step 1: Select Physician' : 'Step 2: Select Patients'}
          </Text>
          <Text style={styles.stepSubtitle}>
            {selectedDoctor ? `Assigned to Dr. ${selectedDoctor.lastName}` : 'Choose an attending doctor'}
            {selectedPatients.length > 0 && ` · ${selectedPatients.length} patients selected`}
          </Text>
        </View>
        
        <View style={styles.progressContainer}>
           <View style={[styles.progressDot, step === 'doctor' && styles.dotActive]} />
           <View style={[styles.progressDot, step === 'patient' && styles.dotActive]} />
        </View>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar 
          placeholder={step === 'doctor' ? "Search doctors..." : "Search patients..."} 
          value={query} 
          onChange={setQuery} 
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 'doctor' ? (
          <View style={styles.list}>
            {filteredDoctors.map(d => (
              <Card 
                key={d.id}
                style={[styles.itemCard, selectedDoctor?.id === d.id && styles.activeCard]}
                onPress={() => { setSelectedDoctor(d); setTab('patient'); setQuery(''); }}
              >
                <View style={styles.row}>
                  <Avatar initials={d.initials} color={T.accent} />
                  <View style={styles.info}>
                    <Text style={styles.name}>
                      Dr. {d.firstName} {d.lastName}
                    </Text>
                    <Text style={styles.meta}>
                      {d.code} · {d.speciality[0]}
                    </Text>
                  </View>
                  <IconChevron size={20} color={T.textDim} />
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.list}>
            {filteredPatients.map(p => {
              const isSelected = selectedPatients.includes(p.id);
              return (
                <Card 
                  key={p.id}
                  style={[styles.itemCard, isSelected && styles.activeCard]}
                  onPress={() => togglePatient(p.id)}
                >
                  <View style={styles.row}>
                    <Avatar initials={p.initials} color={T.warn} />
                    <View style={styles.info}>
                      <Text style={styles.name}>{p.name}</Text>
                      <Text style={styles.meta}>{p.mrn} · {p.status}</Text>
                    </View>
                    <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                      {isSelected && <View style={styles.checkboxInner} />}
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footer}>
        <View style={styles.actionRow}>
          <Btn 
            style={{ flex: 1 }} 
            variant="ghost" 
            onPress={step === 'patient' && !initialDoctorId ? () => setTab('doctor') : onCancel}
          >
            {step === 'patient' && !initialDoctorId ? 'Back to Doctors' : 'Cancel'}
          </Btn>
          <Btn 
            style={{ flex: 2 }} 
            onPress={handleFinish} 
            disabled={!selectedDoctor || selectedPatients.length === 0}
          >
            Assign {selectedPatients.length || ''} {selectedPatients.length === 1 ? 'Patient' : 'Patients'}
          </Btn>
        </View>
      </View>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  stepperHeader: { padding: 16, backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.borderSoft, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '700', color: T.text },
  stepSubtitle: { fontSize: 12, color: T.textDim, marginTop: 2 },
  progressContainer: { flexDirection: 'row', gap: 6 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.border },
  dotActive: { backgroundColor: T.accent },
  searchWrap: { padding: 16, paddingBottom: 8 },
  scrollContent: { padding: 16, paddingTop: 8 },
  list: { gap: 10 },
  itemCard: { backgroundColor: T.surface, borderColor: T.borderSoft },
  activeCard: { borderColor: T.accent, backgroundColor: T.accentSoft },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: T.text },
  meta: { fontSize: 11, color: T.textDim, marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: T.accent, borderColor: T.accent },
  checkboxInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  footer: { padding: 16, backgroundColor: T.bg, borderTopWidth: 1, borderTopColor: T.borderSoft },
  actionRow: { flexDirection: 'row', gap: 12 },
});
