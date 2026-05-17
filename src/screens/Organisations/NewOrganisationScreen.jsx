import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, Field, TextInput, Btn } from '../../components/Shared';
import { IconBuilding, IconUser, IconMail, IconLocation, IconPhone } from '../../icons';

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
    
      
        {/* Helper Banner */}
        
          
          
            Onboarding a new tenant. Configure the primary identity and contact details for the new organisation.
          </Text>
        </View>

        {/* Identity Section */}
        
          IDENTITY</Text>
          
          
             updateRoot('orgName', v.toUpperCase())}
              placeholder="e.g. APOLLO_ORG_TEST129"
            />
          </Field>

          
             updateRoot('businessName', v)}
              placeholder="e.g. Apollo Hospitals"
            />
          </Field>

          
            
              {form.orgType}</Text>
            </Card>
          </Field>
        </View>

        {/* Contact Section */}
        
          CONTACT PERSON</Text>
          
          
             updateContact('name', v)}
              placeholder="Full name"
              leading={}
            />
          </Field>

          
             updateContact('email', v)}
              placeholder="admin@organisation.com"
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
        
          OFFICE ADDRESS</Text>
          
          
             updateAddress('street1', v)}
              placeholder="123 Main St"
              leading={}
            />
          </Field>

          
            
              
                 updateAddress('city', v)}
                  placeholder="Bangalore"
                />
              </Field>
            </View>
            
              
                 updateAddress('state', v)}
                  placeholder="Karnataka"
                />
              </Field>
            </View>
          </View>

          
            
              
                 updateAddress('country', v)}
                  placeholder="India"
                />
              </Field>
            </View>
            
              
                 updateAddress('pincode', v)}
                  placeholder="560001"
                />
              </Field>
            </View>
          </View>
        </View>

        {/* Actions */}
        
          Cancel</Btn>
          
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

