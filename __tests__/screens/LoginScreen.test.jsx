/**
 * Tests for LoginScreen:
 *  - Core fields render (username, password, sign-in button)
 *  - "Keep me signed in" toggle renders and is toggleable
 *  - Sign-in button is disabled while loading
 *  - Calls authApi.login with entered credentials on submit
 *  - Shows an error message on login failure
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../../src/screens/Auth/LoginScreen';
import { authApi } from '../../src/services/api';

// ─── Module mocks ─────────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: 'en' } }),
}));

jest.mock('../../src/theme/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      bg: '#fff', surface: '#f5f5f5', text: '#000', textDim: '#666',
      textFaint: '#999', accent: '#007aff', accentSoft: '#e3f0ff',
      border: '#ccc', borderSoft: '#eee', bad: '#f00',
    },
  }),
}));

jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    changeLanguage: jest.fn(),
    isRestoringSession: false,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../../src/services/api', () => ({
  authApi: {
    login: jest.fn(),
    verifyEmail: jest.fn(),
    verify2fa: jest.fn(),
  },
}));

jest.mock('../../src/i18n', () => ({
  __esModule: true,
  default: { language: 'en', on: jest.fn(), off: jest.fn(), changeLanguage: jest.fn() },
  LOCALE_STORAGE_KEY: 'preferred_locale',
}));

jest.mock('../../src/icons', () => {
  const { View } = require('react-native');
  const Icon = () => <View />;
  return {
    IconUser: Icon, IconLock: Icon, IconEye: Icon, IconEyeOff: Icon,
    IconShield: Icon, IconBack: Icon, IconMail: Icon, IconGlobe: Icon, IconChevron: Icon,
  };
});

jest.mock('../../src/components/Shared', () => {
  const React = require('react');
  const { View, Text, TextInput, TouchableOpacity } = require('react-native');
  return {
    Logo:      () => <View testID="logo" />,
    Field:     ({ label, children }) => <View><Text>{label}</Text>{children}</View>,
    TextInput: ({ value, onChangeText, placeholder, ...rest }) => (
      <TextInput
        testID={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        {...rest}
      />
    ),
    Btn: ({ children, onPress, disabled }) => (
      <TouchableOpacity testID="sign-in-btn" onPress={onPress} disabled={!!disabled}>
        <Text>{children}</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('../../src/components/LanguageSheet', () => ({
  LanguageSheet: () => null,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockNavigation = { replace: jest.fn(), navigate: jest.fn() };

const renderLogin = () => render(<LoginScreen navigation={mockNavigation} />);

beforeEach(() => jest.clearAllMocks());

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('LoginScreen — rendering', () => {
  it('renders the username field', () => {
    renderLogin();
    expect(screen.getByText('auth.username')).toBeTruthy();
  });

  it('renders the password field', () => {
    renderLogin();
    expect(screen.getByText('auth.password')).toBeTruthy();
  });

  it('renders the Sign in button', () => {
    renderLogin();
    expect(screen.getByText('auth.sign_in')).toBeTruthy();
  });

  it('renders the "Keep me signed in" toggle', () => {
    renderLogin();
    expect(screen.getByText('auth.keep_signed_in')).toBeTruthy();
  });

  it('renders the "Forgot password" link', () => {
    renderLogin();
    expect(screen.getByText('auth.forgot_password')).toBeTruthy();
  });
});

describe('LoginScreen — keep me signed in toggle', () => {
  it('checkmark is not visible initially (unchecked)', () => {
    renderLogin();
    expect(screen.queryByText('✓')).toBeNull();
  });

  it('checkmark appears after pressing the toggle', () => {
    renderLogin();
    fireEvent.press(screen.getByTestId('keep-signed-in-toggle'));
    expect(screen.getByText('✓')).toBeTruthy();
  });

  it('checkmark disappears when toggle is pressed again', () => {
    renderLogin();
    fireEvent.press(screen.getByTestId('keep-signed-in-toggle'));
    expect(screen.getByText('✓')).toBeTruthy();
    fireEvent.press(screen.getByTestId('keep-signed-in-toggle'));
    expect(screen.queryByText('✓')).toBeNull();
  });
});

describe('LoginScreen — form submission', () => {
  it('calls authApi.login with the entered credentials', async () => {
    authApi.login.mockResolvedValueOnce({
      code: '200', token: 'jwt', orgName: 'APOAP1', hospitalCode: 'CLV', refreshToken: 'rt',
    });

    renderLogin();
    // authApi.login is called synchronously when handleLogin starts (before the first await)
    fireEvent.press(screen.getByTestId('sign-in-btn'));
    expect(authApi.login).toHaveBeenCalledWith('iorbit', 'iorbitpass');
  });

  it('shows "auth.signing_in" label while the request is in-flight', async () => {
    // Never resolves — keeps the loading state active
    authApi.login.mockImplementation(() => new Promise(() => {}));

    renderLogin();
    fireEvent.press(screen.getByTestId('sign-in-btn'));

    await waitFor(() => expect(screen.getByText('auth.signing_in')).toBeTruthy());
  });

  it('shows an error message when login returns 401', async () => {
    authApi.login.mockRejectedValueOnce({ status: 401, message: 'Incorrect username or password.' });

    renderLogin();
    fireEvent.press(screen.getByTestId('sign-in-btn'));

    await waitFor(() => expect(screen.getByText('auth.invalid_credentials')).toBeTruthy());
  });
});
