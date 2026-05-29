/**
 * Tests for AssignDeviceScreen (3-step flow: Device → Bed → Patient):
 *  - Shows loading indicator while data fetches
 *  - Initial step is "Select Device"
 *  - "Assign" button is absent on step 1 (device) and step 2 (bed)
 *  - Pressing a device card advances to step 2 ("Select Bed")
 *  - Pressing a bed card advances to step 3 ("Select Patient")
 *  - "Assign" button appears on step 3 and is disabled until a patient is selected
 *  - Pressing a patient card enables the Assign button
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AssignDeviceScreen } from '../../src/screens/Devices/AssignDeviceScreen';
import { deviceApi, bedApi, patientApi } from '../../src/services/api';

// ─── Module mocks ─────────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: 'en' } }),
}));

jest.mock('../../src/theme/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      bg: '#fff', surface: '#f5f5f5', surface2: '#eee',
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

jest.mock('../../src/services/api', () => ({
  deviceApi:  { listUnassigned: jest.fn() },
  bedApi:     { listAll: jest.fn(), assignPatient: jest.fn() },
  patientApi: { listAll: jest.fn() },
}));

jest.mock('../../src/icons', () => {
  const { View } = require('react-native');
  const Icon = () => <View />;
  return { IconGateway: Icon, IconPatient: Icon, IconPulse: Icon, IconChevron: Icon };
});

jest.mock('../../src/components/Shared', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity, TextInput } = require('react-native');
  return {
    Card:      ({ children, onPress, style }) => (
      <TouchableOpacity onPress={onPress} style={style}>{children}</TouchableOpacity>
    ),
    SearchBar: ({ placeholder, value, onChangeText }) => (
      <TextInput placeholder={placeholder} value={value} onChangeText={onChangeText} />
    ),
    // testID is derived from children string so we can find buttons by name
    Btn: ({ children, onPress, disabled, style }) => {
      const id = `btn-${typeof children === 'string' ? children.trim().replace(/\s+/g, '-') : 'generic'}`;
      return (
        <TouchableOpacity testID={id} onPress={onPress} disabled={!!disabled} style={style}>
          <Text>{children}</Text>
        </TouchableOpacity>
      );
    },
    Avatar: ({ name }) => <View testID={`avatar-${name}`} />,
  };
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const DEVICES  = [{ deviceCode: 'DEV001', deviceType: 'ECG',      protocol: 'BLE' }];
const BEDS     = [{ bedCode: 'B-01', wardCode: 'WARD-A', gatewayCode: 'GW-01', patientCode: null, bedStatus: 'ACTIVE' }];
const PATIENTS = [{ patientCode: 'PAT001', firstName: 'Alice', lastName: 'Smith', mrNumber: 'MR001' }];

const setupMocks = ({ devicesPending = false } = {}) => {
  deviceApi.listUnassigned.mockReturnValue(
    devicesPending ? new Promise(() => {}) : Promise.resolve(DEVICES),
  );
  bedApi.listAll.mockResolvedValue(BEDS);
  patientApi.listAll.mockResolvedValue(PATIENTS);
};

const renderScreen = () =>
  render(
    <AssignDeviceScreen onCancel={jest.fn()} onSuccess={jest.fn()} />,
  );

beforeEach(() => jest.clearAllMocks());

// ─── Loading state ────────────────────────────────────────────────────────────

describe('loading state', () => {
  it('shows ActivityIndicator while data is loading', () => {
    setupMocks({ devicesPending: true });
    renderScreen();
    const { ActivityIndicator } = require('react-native');
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });
});

// ─── Step 1: Select Device ────────────────────────────────────────────────────

describe('step 1 — Select Device', () => {
  it('shows "Select Device" title after data loads', async () => {
    setupMocks();
    renderScreen();
    await waitFor(() => expect(screen.getByText('Select Device')).toBeTruthy());
  });

  it('renders each unassigned device in the list', async () => {
    setupMocks();
    renderScreen();
    await waitFor(() => expect(screen.getByText('DEV001')).toBeTruthy());
  });

  it('does NOT show the Assign button on the device step', async () => {
    setupMocks();
    renderScreen();
    await waitFor(() => screen.getByText('Select Device'));
    expect(screen.queryByText('Assign')).toBeNull();
  });
});

// ─── Step 2: Select Bed ───────────────────────────────────────────────────────

describe('step 2 — Select Bed', () => {
  const advanceToBedStep = async () => {
    setupMocks();
    renderScreen();
    await waitFor(() => screen.getByText('DEV001'));
    fireEvent.press(screen.getByText('DEV001'));
    await waitFor(() => screen.getByText('Select Bed'));
  };

  it('advances to "Select Bed" after pressing a device', async () => {
    await advanceToBedStep();
    expect(screen.getByText('Select Bed')).toBeTruthy();
  });

  it('renders available beds', async () => {
    await advanceToBedStep();
    expect(screen.getByText('B-01')).toBeTruthy();
  });

  it('does NOT show the Assign button on the bed step', async () => {
    await advanceToBedStep();
    expect(screen.queryByText('Assign')).toBeNull();
  });
});

// ─── Step 3: Select Patient ───────────────────────────────────────────────────

describe('step 3 — Select Patient', () => {
  const advanceToPatientStep = async () => {
    setupMocks();
    renderScreen();
    await waitFor(() => screen.getByText('DEV001'));
    fireEvent.press(screen.getByText('DEV001'));
    await waitFor(() => screen.getByText('B-01'));
    fireEvent.press(screen.getByText('B-01'));
    await waitFor(() => screen.getByText('Select Patient'));
  };

  it('advances to "Select Patient" after pressing a bed', async () => {
    await advanceToPatientStep();
    expect(screen.getByText('Select Patient')).toBeTruthy();
  });

  it('renders unassigned patients', async () => {
    await advanceToPatientStep();
    expect(screen.getByText('Alice Smith')).toBeTruthy();
  });

  it('shows the Assign button on the patient step', async () => {
    await advanceToPatientStep();
    expect(screen.getByText('Assign')).toBeTruthy();
  });

  it('pressing Assign before selecting a patient does NOT call the API', async () => {
    await advanceToPatientStep();
    // Button is disabled — pressing it should NOT invoke handleFinish/assignPatient
    fireEvent.press(screen.getByTestId('btn-Assign'));
    expect(bedApi.assignPatient).not.toHaveBeenCalled();
  });

  it('pressing Assign after selecting a patient DOES call the API', async () => {
    bedApi.assignPatient.mockResolvedValueOnce({ message: 'Patient assigned' });
    await advanceToPatientStep();
    fireEvent.press(screen.getByText('Alice Smith'));   // select patient
    fireEvent.press(screen.getByTestId('btn-Assign')); // now press Assign
    await waitFor(() => expect(bedApi.assignPatient).toHaveBeenCalledTimes(1));
  });
});

// ─── Back navigation ─────────────────────────────────────────────────────────

describe('back navigation', () => {
  it('pressing ← Back on bed step returns to device step', async () => {
    setupMocks();
    renderScreen();
    await waitFor(() => screen.getByText('DEV001'));
    fireEvent.press(screen.getByText('DEV001'));
    await waitFor(() => screen.getByText('Select Bed'));

    fireEvent.press(screen.getByText('← Back'));

    await waitFor(() => expect(screen.getByText('Select Device')).toBeTruthy());
  });
});
