import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, Field, TextInput, Btn } from '../../components/Shared';
import { IconBuilding, IconUser, IconMail, IconLocation, IconPhone, IconShield } from '../../icons';

export const NewOrganisationScreen = ({ onCancel }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const [form, setForm] = useState({
    orgName: '',
    orgType: 'HOSPITAL',
    businessName: '',
    myContact: {
      name: '',
      email: '',
      phone: '',
    },
    myAddress: {
      street1: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
    }
  });

  const updateRoot = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateContact = (key, value) => {
    setForm(prev => ({ 
      ...prev, 
      myContact: { ...prev.myContact, [key]: value } 
    }));
  };

  const updateAddress = (key, value) => {
    setForm(prev => ({ 
      ...prev, 
      myAddress: { ...prev.myAddress, [key]: value } 
    }));
  };

  const isFormValid = form.orgName && form.businessName && form.myContact.email;

  const handleCreate = () => {
    console.log('Sending Payload:', JSON.stringify(form, null, 2));
    // Implementation for API call to /api/organisation/create goes here
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Helper Banner */}
        <View style={styles.banner}>
          <IconShield color={T.accent} size={20} />
          <Text style={styles.bannerText}>
            Onboarding a new tenant. Configure the primary identity and contact details for the new organisation.
          </Text>
        </View>

        {/* Identity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IDENTITY</Text>
          
          <Field label="Org Unique ID">
            <TextInput 
              value={form.orgName} 
              onChangeText={(v) => updateRoot('orgName', v.toUpperCase())}
              placeholder="e.g. APOLLO_ORG_TEST129"
            />
          </Field>

          <Field label="Business Name">
            <TextInput 
              value={form.businessName} 
              onChangeText={(v) => updateRoot('businessName', v)}
              placeholder="e.g. Apollo Hospitals"
            />
          </Field>

          <Field label="Org Type">
            <Card style={styles.selectCard}>
              <Text style={styles.selectText}>{form.orgType}</Text>
            </Card>
          </Field>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTACT PERSON</Text>
          
          <Field label="Contact Name">
            <TextInput 
              value={form.myContact.name} 
              onChangeText={(v) => updateContact('name', v)}
              placeholder="Full name"
              leading={<IconUser size={18} color={T.textDim} />}
            />
          </Field>

          <Field label="Email Address">
            <TextInput 
              value={form.myContact.email} 
              onChangeText={(v) => updateContact('email', v)}
              placeholder="admin@organisation.com"
              leading={<IconMail size={18} color={T.textDim} />}
            />
          </Field>

          <Field label="Phone Number">
            <TextInput 
              value={form.myContact.phone} 
              onChangeText={(v) => updateContact('phone', v)}
              placeholder="+91 98000 00000"
              leading={<IconPhone size={18} color={T.textDim} />}
            />
          </Field>
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OFFICE ADDRESS</Text>
          
          <Field label="Street Address">
            <TextInput 
              value={form.myAddress.street1} 
              onChangeText={(v) => updateAddress('street1', v)}
              placeholder="123 Main St"
              leading={<IconLocation size={18} color={T.textDim} />}
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="City">
                <TextInput 
                  value={form.myAddress.city} 
                  onChangeText={(v) => updateAddress('city', v)}
                  placeholder="Bangalore"
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="State">
                <TextInput 
                  value={form.myAddress.state} 
                  onChangeText={(v) => updateAddress('state', v)}
                  placeholder="Karnataka"
                />
              </Field>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Country">
                <TextInput 
                  value={form.myAddress.country} 
                  onChangeText={(v) => updateAddress('country', v)}
                  placeholder="India"
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Pincode">
                <TextInput 
                  value={form.myAddress.pincode} 
                  onChangeText={(v) => updateAddress('pincode', v)}
                  placeholder="560001"
                />
              </Field>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <Btn variant="ghost" full style={{ flex: 1 }} onPress={onCancel}>Cancel</Btn>
          <Btn 
            full 
            style={{ flex: 1.5 }} 
            onPress={handleCreate} 
            disabled={!isFormValid}
          >
            Create organisation
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
  selectCard: {
    height: 44,
    justifyContent: 'center',
    backgroundColor: T.surface,
  },
  selectText: {
    color: T.text,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
});
