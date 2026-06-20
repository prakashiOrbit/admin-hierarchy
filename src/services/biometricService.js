import * as Keychain from 'react-native-keychain';

const KEYCHAIN_SERVICE = 'itouch_admin_biometric';
const BIOMETRIC_PROFILE_KEY = '@auth:biometric_profile';

import AsyncStorage from '@react-native-async-storage/async-storage';

export const getBiometricCapability = async () => {
  try {
    const type = await Keychain.getSupportedBiometryType();
    if (!type) return 'none';
    if (
      type === Keychain.BIOMETRY_TYPE.FACE_ID ||
      type === Keychain.BIOMETRY_TYPE.FACE
    ) {
      return 'face';
    }
    return 'fingerprint';
  } catch {
    return 'none';
  }
};

export const enrollBiometric = async (username, token, profile) => {
  try {
    await Keychain.setGenericPassword(username, token, {
      service: KEYCHAIN_SERVICE,
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    await AsyncStorage.setItem(BIOMETRIC_PROFILE_KEY, JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
};

export const authenticateWithBiometric = async (promptTitle, cancelLabel) => {
  try {
    const result = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
      authenticationPrompt: {
        title: promptTitle,
        cancel: cancelLabel,
      },
    });
    if (result && result.password) {
      return result.password;
    }
    return null;
  } catch {
    return null;
  }
};

export const getBiometricProfile = async () => {
  try {
    const raw = await AsyncStorage.getItem(BIOMETRIC_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isBiometricEnrolled = async () => {
  try {
    return await Keychain.hasGenericPassword({ service: KEYCHAIN_SERVICE });
  } catch {
    return false;
  }
};

export const revokeBiometric = async () => {
  try {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
    await AsyncStorage.removeItem(BIOMETRIC_PROFILE_KEY);
  } catch {
    // silently ignore
  }
};
