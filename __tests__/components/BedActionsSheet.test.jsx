/**
 * Tests for BedActionsSheet:
 *  - "Assign to Patient" action has been removed — must NOT appear
 *  - The 4 remaining actions DO appear: Unassign, Discharge, Transfer, Alarm Config
 *  - Exactly 4 actions total (not 5)
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { BedActionsSheet } from '../../src/components/BedActionsSheet';

// ─── Module mocks ─────────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: 'en' } }),
}));

jest.mock('../../src/theme/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      bg: '#fff', surface: '#f5f5f5', surface2: '#eeeeee',
      text: '#000', textDim: '#666', textFaint: '#999',
      accent: '#007aff', accentSoft: '#e3f0ff',
      border: '#ccc', borderSoft: '#eee', bad: '#f00',
    },
  }),
}));

jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: { userName: 'admin', orgName: 'APOAP1', hospitalCode: 'CLV' },
    token: 'test-token',
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../../src/services/api', () => ({
  bedApi:  { unassignPatient: jest.fn(), discharge: jest.fn(), transferWard: jest.fn(), updateAlarmConfig: jest.fn() },
  wardApi: { listAll: jest.fn().mockResolvedValue([]) },
}));

// Mock icons to avoid react-native-svg complexity in this test
jest.mock('../../src/icons', () => {
  const { View } = require('react-native');
  const Icon = () => <View />;
  return {
    IconBed: Icon, IconPatient: Icon, IconDoor: Icon,
    IconAlert: Icon, IconCheck: Icon, IconChevron: Icon,
  };
});

jest.mock('../../src/components/Shared', () => {
  const { View } = require('react-native');
  return { Avatar: ({ name }) => <View testID={`avatar-${name}`} /> };
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const BED = {
  bedCode: 'B-01',
  bedStatus: 'ASSIGNED',
  gatewayCode: 'GW-01',
  patientCode: 'PAT001',
};

const renderSheet = (overrides = {}) =>
  render(
    <BedActionsSheet
      bed={BED}
      wardCode="WARD-A"
      visible={true}
      onClose={jest.fn()}
      {...overrides}
    />,
  );

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('BedActionsSheet — action list', () => {
  it('does NOT render an "Assign to Patient" action', () => {
    renderSheet();
    expect(screen.queryByText('actions.assign_patient')).toBeNull();
  });

  it('renders the "Unassign Patient" action', () => {
    renderSheet();
    expect(screen.getByText('actions.unassign_patient')).toBeTruthy();
  });

  it('renders the "Discharge Patient" action', () => {
    renderSheet();
    expect(screen.getByText('actions.discharge_patient')).toBeTruthy();
  });

  it('renders the "Transfer Ward" action', () => {
    renderSheet();
    expect(screen.getByText('actions.transfer_ward')).toBeTruthy();
  });

  it('renders the "Alarm Config" action', () => {
    renderSheet();
    expect(screen.getByText('actions.alarm_config')).toBeTruthy();
  });

  it('renders exactly 4 actions', () => {
    renderSheet();
    const actionKeys = [
      'actions.unassign_patient',
      'actions.discharge_patient',
      'actions.transfer_ward',
      'actions.alarm_config',
    ];
    actionKeys.forEach((key) => {
      expect(screen.getAllByText(key)).toHaveLength(1);
    });
    // The removed action must not be there
    expect(screen.queryByText('actions.assign_patient')).toBeNull();
  });

  it('renders the bed code in the sheet header', () => {
    renderSheet();
    expect(screen.getByText('B-01')).toBeTruthy();
  });
});
