import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../services/api';
import { Card, Field, TextInput, Btn } from '../../components/Shared';
import { IconUser, IconMail, IconBuilding, IconShield } from '../../icons';

export const CreateOrgOwnerScreen = ({ onCancel, presetOrgName }) => {
  const { theme: T } = useTheme();
  const { token } = useAuth();
  const styles = createStyles(T);
  
  const [form, setForm] = useState({
    userName: '',
    firstName: '',
    lastName: '',
    orgName: presetOrgName || '',
    contactEmail: ''
  });

  const [loading, setLoading] = useState(false);

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = form.userName && form.firstName && form.lastName && form.contactEmail && form.orgName;

  const handleCreate = async () => {
    setLoading(true);
    try {
      await userApi.createOrgOwner(form, token);
      Alert.alert('Success', 'Organisation Owner invited successfully', [
        { text: 'OK', onPress: onCancel }
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to invite organisation owner');
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
            Inviting a new Organisation Owner. They will have primary administrative control over the selected organisation.
          </Text>
        </View>

        {/* User Identity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OWNER IDENTITY</Text>
          
          <Field label="Username">
            <TextInput 
              value={form.userName} 
              onChangeText={(v) => updateForm('userName', v.toLowerCase())}
              placeholder="e.g. j.doe"
              leading={<IconUser size={18} color={T.textDim} />}
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="First Name">
                <TextInput 
                  value={form.firstName} 
                  onChangeText={(v) => updateForm('firstName', v)}
                  placeholder="First name"
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Last Name">
                <TextInput 
                  value={form.lastName} 
                  onChangeText={(v) => updateForm('lastName', v)}
                  placeholder="Last name"
                />
              </Field>
            </View>
          </View>

          <Field label="Organisation Name">
            {presetOrgName ? (
              <Card style={styles.disabledCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <IconBuilding size={16} color={T.textFaint} />
                  <Text style={styles.disabledText}>{form.orgName}</Text>
                </View>
              </Card>
            ) : (
              <TextInput 
                value={form.orgName} 
                onChangeText={(v) => updateForm('orgName', v.toUpperCase())}
                placeholder="ORG_UNIQUE_ID"
                leading={<IconBuilding size={18} color={T.textDim} />}
              />
            )}
          </Field>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTACT DETAILS</Text>
          
          <Field label="Contact Email">
            <TextInput 
              value={form.contactEmail} 
              onChangeText={(v) => updateForm('contactEmail', v.toLowerCase())}
              placeholder="owner@organisation.com"
              leading={<IconMail size={18} color={T.textDim} />}
            />
          </Field>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            The new owner will receive an invitation email to set their password and complete their profile.
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
            {loading ? 'Inviting...' : 'Send invitation'}
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