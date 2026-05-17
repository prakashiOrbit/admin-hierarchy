import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, Field, TextInput, Btn } from '../../components/Shared';
import { IconUser, IconMail, IconBuilding } from '../../icons';

export const InviteOrgAdminScreen = ({ onCancel }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  
  const [form, setForm] = useState({
    userName: '',
    firstName: '',
    lastName: '',
    orgName: 'APOLLO_ORG_TEST129',
    contactEmail: ''
  });

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = form.userName && form.firstName && form.lastName && form.contactEmail;

  const handleCreate = () => {
    console.log('Invite Payload:', JSON.stringify(form, null, 2));
    // Implementation for API call to /api/user/create-org-admin goes here
  };

  return (
    
      
        {/* Helper Banner */}
        
          
          
            Inviting a new Organisation Administrator. They will have full administrative control over this organisation's resources.
          </Text>
        </View>

        {/* User Identity Section */}
        
          USER IDENTITY</Text>
          
          
             updateForm('userName', v.toLowerCase())}
              placeholder="e.g. apollo_admin129@apollo.com"
              leading={}
            />
          </Field>

          
            
              
                 updateForm('firstName', v)}
                  placeholder="Apollo"
                />
              </Field>
            </View>
            
              
                 updateForm('lastName', v)}
                  placeholder="Admin"
                />
              </Field>
            </View>
          </View>

          
            
              
                
                {form.orgName}</Text>
              </View>
            </Card>
          </Field>
        </View>

        {/* Contact Section */}
        
          CONTACT DETAILS</Text>
          
          
             updateForm('contactEmail', v.toLowerCase())}
              placeholder="e.g. apollo_admin129@apollo.com"
              leading={}
            />
          </Field>
        </View>

        
          
            Invite link is one-time use, valid 7 days. The new user sets their own password and configures 2FA on first sign-in.
          </Text>
        </View>

        {/* Actions */}
        
          Cancel</Btn>
          
            Send invitation
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
    background: T.surface,
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
