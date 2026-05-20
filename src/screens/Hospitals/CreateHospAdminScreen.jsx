import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../services/api';
import { Card, Field, TextInput, Btn } from '../../components/Shared';
import { IconUser, IconMail, IconBuilding, IconShield } from '../../icons';

export const CreateHospAdminScreen = ({ onCancel }) => {
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(T);
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    userName: '',
    firstName: '',
    lastName: '',
    orgName: user?.orgName || '',
    contactEmail: ''
  });

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = form.userName && form.firstName && form.lastName && form.contactEmail;

  const handleCreate = async () => {
    if (!user?.orgName) {
      Alert.alert('Error', 'Organisation name not found');
      return;
    }

    setLoading(true);
    try {
      await userApi.createHospAdmin(user.orgName, user.hospitalCode, form, token);
      Alert.alert('Success', 'Hospital Administrator created successfully', [
        { text: 'OK', onPress: onCancel }
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create hospital administrator');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Helper Banner */}
        <View style={styles.banner}>
          <IconShield color={T.accent} size={20} />
          <Text style={styles.bannerText}>
            Inviting a new Hospital Administrator for {user?.hospitalCode}. They will manage wards, devices, and clinical staff for this unit.
          </Text>
        </View>

        {/* User Identity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>USER IDENTITY</Text>
          
          <Field label="Username">
            <TextInput 
              value={form.userName} 
              onChangeText={(v) => updateForm('userName', v.toLowerCase())}
              placeholder="e.g. apollo_admin121"
              leading={<IconUser size={18} color={T.textDim} />}
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="First Name">
                <TextInput 
                  value={form.firstName} 
                  onChangeText={(v) => updateForm('firstName', v)}
                  placeholder="Apollo"
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Last Name">
                <TextInput 
                  value={form.lastName} 
                  onChangeText={(v) => updateForm('lastName', v)}
                  placeholder="Admin"
                />
              </Field>
            </View>
          </View>

          <Field label="Organization">
            <Card style={styles.disabledCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconBuilding size={16} color={T.textFaint} />
                <Text style={styles.disabledText}>{form.orgName}</Text>
              </View>
            </Card>
          </Field>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTACT DETAILS</Text>
          
          <Field label="Contact Email">
            <TextInput 
              value={form.contactEmail} 
              onChangeText={(v) => updateForm('contactEmail', v.toLowerCase())}
              placeholder="e.g. apollo_admin121@mailinator.com"
              leading={<IconMail size={18} color={T.textDim} />}
            />
          </Field>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            The new Hospital Administrator will have full control over {user?.hospitalCode} and will be able to manage clinical workflows.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <Btn variant="ghost" full style={{ flex: 1 }} onPress={onCancel} disabled={loading}>Cancel</Btn>
          <Btn 
            full 
            style={{ flex: 1.5 }} 
            onPress={handleCreate} 
            disabled={!isFormValid || loading}
          >
            {loading ? <ActivityIndicator color="#FFF" size="small" /> : 'Create Hosp Admin'}
          </Btn>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  banner: {
    flexDirection: 'row',
    backgroundColor: T.accentSoft,
    padding: 14,
    borderRadius: 12,
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: T.text,
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: T.textDim,
    letterSpacing: 1,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  disabledCard: {
    height: 44,
    justifyContent: 'center',
    backgroundColor: T.surface2,
    borderColor: T.borderSoft,
  },
  disabledText: {
    color: T.textDim,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoBox: {
    padding: 12,
    backgroundColor: T.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: T.border,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 11.5,
    color: T.textDim,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
});
