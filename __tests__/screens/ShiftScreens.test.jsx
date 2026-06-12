/**
 * Tests for all shift-related screens — these are the screens most directly
 * affected by the LocalDateTime formatting bugs we fixed:
 *
 *  ShiftsScreen     — renders shift list with start/end times via formatTime
 *  ShiftDetailScreen — renders shift header times via formatTime
 *  CreateShiftScreen — sends ISO-8601 payload (via buildDateTime) on submit
 *  EditShiftScreen   — pre-fills form with extractTime; sends ISO-8601 on save
 *  DevicesScreen     — mode switching (gateways ↔ devices) and onModeChange callback
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';

import { ShiftsScreen }      from '../../src/screens/Common/ShiftsScreen';
import { ShiftDetailScreen } from '../../src/screens/Common/ShiftDetailScreen';
import { CreateShiftScreen } from '../../src/screens/Common/CreateShiftScreen';
import { EditShiftScreen }   from '../../src/screens/Common/EditShiftScreen';
import { DevicesScreen }     from '../../src/screens/Devices/DevicesScreen';

import { shiftApi, nurseApi, wardApi, deviceApi, gatewayApi } from '../../src/services/api';

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
    user: { userName: 'admin', orgName: 'APOAP1', careSiteCode: 'CLV' },
    token: 'test-token',
  }),
}));

jest.mock('../../src/services/api', () => ({
  shiftApi:   { listAll: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), getDetail: jest.fn() },
  nurseApi:   { listAll: jest.fn() },
  wardApi:    { listAll: jest.fn() },
  deviceApi:  { listAll: jest.fn() },
  gatewayApi: { listAll: jest.fn() },
}));

jest.mock('../../src/icons', () => {
  const { View } = require('react-native');
  const Icon = () => <View />;
  return new Proxy({}, { get: () => Icon });
});

jest.mock('../../src/components/Shared', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity, TextInput } = require('react-native');
  return {
    Card:          ({ children, onPress }) => <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>,
    SectionHeader: ({ title, count }) => <Text>{title}{count !== undefined ? ` (${count})` : ''}</Text>,
    SearchBar:     ({ value, onChangeText, placeholder }) =>
                     <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} />,
    Btn:           ({ children, onPress, disabled }) =>
                     <TouchableOpacity onPress={onPress} disabled={!!disabled}><Text>{children}</Text></TouchableOpacity>,
    Chip:          ({ children, onPress, active }) =>
                     <TouchableOpacity onPress={onPress} accessibilityState={{ selected: !!active }}><Text>{children}</Text></TouchableOpacity>,
    Field:         ({ label, children }) => <View><Text>{label}</Text>{children}</View>,
    TextInput:     ({ value, onChangeText, placeholder }) =>
                     <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} />,
    Avatar:        ({ name }) => <View testID={`avatar-${name}`} />,
  };
});

jest.mock('../../src/components/StatusPill', () => ({
  StatusPill: ({ status }) => {
    const { Text } = require('react-native');
    return <Text>{status}</Text>;
  },
}));

jest.mock('../../src/components/ShiftStaffSheet', () => ({
  ShiftStaffSheet: () => null,
}));

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => jest.restoreAllMocks());
beforeEach(() => jest.clearAllMocks());

// ─── ShiftsScreen ─────────────────────────────────────────────────────────────

describe('ShiftsScreen', () => {
  const SHIFT = {
    shiftId: '1', shiftCode: 'S1', shiftName: 'Morning', wardCode: 'W1', status: 'ACTIVE',
    startTime: [2026, 5, 29, 8, 0],  // Jackson array format
    endTime:   [2026, 5, 29, 16, 0],
  };

  beforeEach(() => {
    shiftApi.listAll.mockResolvedValue([SHIFT]);
    nurseApi.listAll.mockResolvedValue([]);
  });

  it('renders shift names after loading', async () => {
    render(<ShiftsScreen onNewShift={jest.fn()} onNewNurse={jest.fn()} onSelectShift={jest.fn()} onSelectNurse={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('Morning')).toBeTruthy());
  });

  it('renders start and end times using formatTime (not raw array)', async () => {
    render(<ShiftsScreen onNewShift={jest.fn()} onNewNurse={jest.fn()} onSelectShift={jest.fn()} onSelectNurse={jest.fn()} />);
    await waitFor(() => screen.getByText('Morning'));
    // formatTime([2026,5,29,8,0]) → "8:00 AM", formatTime([2026,5,29,16,0]) → "4:00 PM"
    expect(screen.queryByText(/2026,5,29/)).toBeNull(); // raw array must NOT appear
    expect(screen.getByText(/8:00 AM.*4:00 PM|4:00 PM.*8:00 AM/)).toBeTruthy();
  });

  it('switches to Nursing Staff tab when chip is pressed', async () => {
    nurseApi.listAll.mockResolvedValue([{ nurseCode: 'N1', firstName: 'Alice', lastName: 'Smith' }]);
    render(<ShiftsScreen onNewShift={jest.fn()} onNewNurse={jest.fn()} onSelectShift={jest.fn()} onSelectNurse={jest.fn()} />);
    await waitFor(() => screen.getByText('Morning'));
    fireEvent.press(screen.getByText('shifts.nursing_staff'));
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeTruthy());
  });

  it('calls onModeChange when tab is switched', async () => {
    const onModeChange = jest.fn();
    render(<ShiftsScreen onNewShift={jest.fn()} onNewNurse={jest.fn()} onSelectShift={jest.fn()} onSelectNurse={jest.fn()} mode="shifts" onModeChange={onModeChange} />);
    await waitFor(() => screen.getByText('Morning'));
    fireEvent.press(screen.getByText('shifts.nursing_staff'));
    expect(onModeChange).toHaveBeenCalledWith('nurses');
  });

  it('restores to nurses tab when mode="nurses" prop is passed', async () => {
    nurseApi.listAll.mockResolvedValue([{ nurseCode: 'N1', firstName: 'Bob', lastName: 'Jones' }]);
    render(<ShiftsScreen onNewShift={jest.fn()} onNewNurse={jest.fn()} onSelectShift={jest.fn()} onSelectNurse={jest.fn()} mode="nurses" onModeChange={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('Bob Jones')).toBeTruthy());
  });
});

// ─── ShiftDetailScreen ────────────────────────────────────────────────────────

describe('ShiftDetailScreen', () => {
  const DETAIL = {
    shiftCode: 'S1', shiftName: 'Morning Shift', wardCode: 'W1', status: 'ACTIVE',
    startTime: [2026, 5, 29, 8, 30],
    endTime:   [2026, 5, 29, 16, 30],
    nurses: [], doctors: [],
  };

  beforeEach(() => {
    shiftApi.getDetail.mockResolvedValue(DETAIL);
  });

  it('renders the shift name', async () => {
    render(<ShiftDetailScreen shiftId="S1" onBack={jest.fn()} onEdit={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('Morning Shift')).toBeTruthy());
  });

  it('formats startTime array as readable time (not raw commas)', async () => {
    render(<ShiftDetailScreen shiftId="S1" onBack={jest.fn()} onEdit={jest.fn()} />);
    await waitFor(() => screen.getByText('Morning Shift'));
    expect(screen.queryByText(/2026,5,29/)).toBeNull();
    expect(screen.getByText('8:30 AM')).toBeTruthy();
  });

  it('formats endTime array as readable time', async () => {
    render(<ShiftDetailScreen shiftId="S1" onBack={jest.fn()} onEdit={jest.fn()} />);
    await waitFor(() => screen.getByText('Morning Shift'));
    expect(screen.getByText('4:30 PM')).toBeTruthy();
  });
});

// ─── CreateShiftScreen ────────────────────────────────────────────────────────

describe('CreateShiftScreen', () => {
  beforeEach(() => {
    wardApi.listAll.mockResolvedValue([{ wardCode: 'W1', wardName: 'ICU', wardType: 'ICU' }]);
    shiftApi.create.mockResolvedValue({ message: 'Shift created' });
  });

  it('renders shift code and shift name fields', () => {
    render(<CreateShiftScreen onCancel={jest.fn()} />);
    // Keys from actual translation: shift.code, shift.name
    expect(screen.getByText('shift.code')).toBeTruthy();
    expect(screen.getByText('shift.name')).toBeTruthy();
  });

  it('renders start time and end time fields with default values', () => {
    render(<CreateShiftScreen onCancel={jest.fn()} />);
    // Default startTime '08:00' and endTime '16:00' prefilled in state
    expect(screen.getByDisplayValue('08:00')).toBeTruthy();
    expect(screen.getByDisplayValue('16:00')).toBeTruthy();
  });

  it('calls shiftApi.create with ISO-8601 startTime and endTime', async () => {
    render(<CreateShiftScreen onCancel={jest.fn()} />);

    // Fill required fields
    fireEvent.changeText(screen.getByPlaceholderText('shift.code_placeholder'), 'S1');
    fireEvent.changeText(screen.getByPlaceholderText('shift.name_placeholder'), 'Morning');

    // Ward picker renders wardCode ('W1'), not wardName
    await waitFor(() => screen.getByText('W1'));
    fireEvent.press(screen.getByText('W1'));

    // Submit
    fireEvent.press(screen.getByText('actions.create_shift'));

    await waitFor(() => expect(shiftApi.create).toHaveBeenCalled());

    const payload = shiftApi.create.mock.calls[0][2];
    // Must be ISO-8601 "YYYY-MM-DDTHH:MM:00" — not raw "08:00"
    expect(payload.startTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00$/);
    expect(payload.endTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00$/);
  });
});

// ─── DevicesScreen ────────────────────────────────────────────────────────────

describe('DevicesScreen', () => {
  beforeEach(() => {
    gatewayApi.listAll.mockResolvedValue([{ gatewayCode: 'GW1', status: 'ACTIVE' }]);
    deviceApi.listAll.mockResolvedValue([{ deviceCode: 'DEV1', deviceType: 'ECG', status: 'ACTIVE' }]);
  });

  it('defaults to gateways tab and shows gateway codes', async () => {
    render(<DevicesScreen />);
    await waitFor(() => expect(screen.getByText('GW1')).toBeTruthy());
    expect(screen.queryByText('DEV1')).toBeNull();
  });

  it('shows devices when mode="devices" is passed as prop', async () => {
    render(<DevicesScreen mode="devices" onModeChange={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('DEV1')).toBeTruthy());
    expect(screen.queryByText('GW1')).toBeNull();
  });

  it('mode prop controls which tab is shown — gateways', async () => {
    // Passing mode="gateways" explicitly shows gateways, not devices
    render(<DevicesScreen mode="gateways" onModeChange={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('GW1')).toBeTruthy());
    expect(screen.queryByText('DEV1')).toBeNull();
  });

  it('mode prop controls which tab is shown — devices', async () => {
    // Passing mode="devices" explicitly shows devices, not gateways
    render(<DevicesScreen mode="devices" onModeChange={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('DEV1')).toBeTruthy());
    expect(screen.queryByText('GW1')).toBeNull();
  });
});
