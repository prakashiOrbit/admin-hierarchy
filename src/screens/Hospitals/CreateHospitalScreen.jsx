import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, Field, TextInput, Btn } from '../../components/Shared';
import { IconHospital, IconUser, IconMail, IconLocation, IconPhone } from '../../icons';

export const CreateHospitalScreen = ({ onCancel }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  
  const [form, setForm] = useState({
    hospitalName: '',
    hospitalCode: '',
    description: '',
    myAddress: {
      street1: '',
      city: '',
      pincode: '',
      state: '',
      country: 'India',
    },
    myContact: {
      name: '',
      email: '',
      phone: '',
    }
  });

  const updateRoot = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateAddress = (key, value) => {
    setForm(prev => ({ 
      ...prev, 
      myAddress: { ...prev.myAddress, [key]: value } 
    }));
  };

  const updateContact = (key, value) => {
    setForm(prev => ({ 
      ...prev, 
      myContact: { ...prev.myContact, [key]: value } 
    }));
  };

  const isFormValid = form.hospitalName && form.hospitalCode && form.myContact.email;

  const handleCreate = () => {
    console.log('Create Hospital Payload:', JSON.stringify(form, null, 2));
    // Implementation for API call to /api/{orgName}/hospital/create
  };

  return (
    
      
        
          
          
            Provisioning a new hospital. The primary contact will be invited Hospital Owner (HOSP_OWNER).
          </Text>
        </View>

        {/* Identity Section */}
        
          HOSPITAL IDENTITY</Text>
          
          
             updateRoot('hospitalCode', v.toUpperCase())}
              placeholder="e.g. CLV-MAIN"
            />
          </Field>

          
             updateRoot('hospitalName', v)}
              placeholder="e.g. City General Hospital"
            />
          </Field>

          
             updateRoot('description', v)}
              placeholder="e.g. Main city branch"
            />
          </Field>
        </View>

        {/* Contact Section */}
        
          PRIMARY CONTACT (OWNER)</Text>
          
          
             updateContact('name', v)}
              placeholder="Full name"
              leading={}
            />
          </Field>

          
             updateContact('email', v.toLowerCase())}
              placeholder="owner@hospital.com"
              leading={}
            />
          </Field>

          
             updateContact('phone', v)}
              placeholder="+91 98000 00000"
              leading={}
            />
          </Field>
        </View>

        {/* Address Section */}
        
          PHYSICAL ADDRESS</Text>
          
          
             updateAddress('street1', v)}
              placeholder="123 Health Ave"
              leading={}
            />
          </Field>

          
            
              
                 updateAddress('city', v)}
                  placeholder="Metropolis"
                />
              </Field>
            </View>
            
              
                 updateAddress('state', v)}
                  placeholder="NY"
                />
              </Field>
            </View>
          </View>

          
            
              
                 updateAddress('country', v)}
                  placeholder="USA"
                />
              </Field>
            </View>
            
              
                 updateAddress('pincode', v)}
                  placeholder="10001"
                />
              </Field>
            </View>
          </View>
        </View>

        {/* Actions */}
        
          Cancel</Btn>
          
            Create Hospital
          </Btn>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  banner: {
    flexDirection: 'row',
    backgroundColor: T.accentSoft,
    padding: 14,
    borderRadius: 12,
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  bannerText: { flex: 1, fontSize: 13, color: T.text, lineHeight: 18 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: T.textDim, letterSpacing: 1, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
