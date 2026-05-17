import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card, SectionHeader, SearchBar, Avatar, RoleBadge, Btn } from '../../components/Shared';
import { StatusPill } from '../../components/StatusPill';
import { IconPlus, IconChevron } from '../../icons';
import { USERS, ROLES } from '../../data/mock';

export const OrgAdminsScreen = ({ onSelectUser, onInvite }) => {
  const { theme: T } = useTheme();
  const styles = createStyles(T);
  const [query, setQuery] = useState('');

  const admins = USERS.filter(u => 
    u.role === 'ORG_ADMIN' &&
    u.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    
      
        
          
        </View>

        
          
          
             Create Org Admin
          </Btn>
        </View>

        
          {admins.map(u => (
             onSelectUser(u.id)}
            >
              
                
                
                  
                    {u.name}</Text>
                    
                  </View>
                  {u.email}</Text>
                  
                    
                  </View>
                </View>
                
              </View>
            </Card>
          ))}
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newBtn: {
    flexDirection: 'row',
    gap: 4,
    height: 32,
    paddingHorizontal: 10,
  },
  list: {
    gap: 10,
  },
  userRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
  },
  userEmail: {
    fontSize: 11,
    color: T.textFaint,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  badgesRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
});
