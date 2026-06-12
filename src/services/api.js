import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

const BASE_URL = 'http://139.59.46.163/api';
const SESSION_KEY = '@auth:session';
const DEFAULT_TIMEOUT_MS = 15000;
const inFlightGetRequests = new Map();

let refreshPromise = null;
let onTokenRefreshed = null;

export const setTokenRefreshedCallback = (cb) => {
  onTokenRefreshed = cb;
};

export class ApiError extends Error {
  constructor(message, { status, data, code, endpoint } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.code = code;
    this.endpoint = endpoint;
  }
}

export const getApiErrorMessage = (error) => {
  if (error?.code === 'TIMEOUT') {
    return 'Unable to load data. The server is taking too long to respond.';
  }
  if (error?.status >= 500) {
    return 'Unable to load data. The server is currently unavailable.';
  }
  if (error?.status === 401) {
    return 'Session expired. Please log in again.';
  }
  if (error?.status === 403) {
    const msg = error?.message || '';
    if (msg.includes('You can only access your own organisation')) {
      return 'Access error: your session organisation does not match. Please log out and log in again.';
    }
    return 'You do not have permission to perform this action.';
  }
  if (error?.message) {
    return error.message;
  }
  return 'Unable to load data. Please try again.';
};

const normalizeMethod = (method) => (method || 'GET').toUpperCase();

const createRequestKey = (url, config) => {
  const auth = config.headers?.Authorization || '';
  const locale = config.headers?.['X-Locale'] || '';
  return `${config.method}:${url}:${auth}:${locale}`;
};

const performTokenRefresh = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (!raw) throw new Error('No session found');
      const session = JSON.parse(raw);
      if (!session.refreshToken) throw new Error('No refresh token');

      console.log('Refreshing token via API...');
      const res = await fetch(`${BASE_URL}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });

      if (!res.ok) throw new Error('Refresh API call failed');
      const data = await res.json();
      const newToken = data.token;
      const newRefreshToken = data.refreshToken;

      if (newToken) {
        const updatedSession = { 
          ...session, 
          token: newToken, 
          refreshToken: newRefreshToken || session.refreshToken 
        };
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
        
        if (onTokenRefreshed) onTokenRefreshed(newToken);
        return newToken;
      }
      throw new Error('No token in refresh response');
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const apiRequest = async (endpoint, options = {}) => {
  let url = `${BASE_URL}${endpoint}`;

  if (options.params) {
    const searchParams = new URLSearchParams(options.params);
    url += `?${searchParams.toString()}`;
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Locale': (i18n.language || 'en').split('-')[0],
    ...options.headers,
  };

  const method = normalizeMethod(options.method);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  // Auto-abort if caller didn't supply a signal.
  const ownController = options.signal ? null : new AbortController();
  let timedOut = false;
  const timeoutId = ownController
    ? setTimeout(() => {
        timedOut = true;
        ownController.abort();
      }, timeoutMs)
    : null;

  const config = {
    method,
    headers,
    body: options.body,
    signal: options.signal ?? ownController?.signal,
  };

  const requestKey = !options.signal && method === 'GET' && !options.body
    ? createRequestKey(url, config)
    : null;

  if (requestKey && inFlightGetRequests.has(requestKey)) {
    return inFlightGetRequests.get(requestKey);
  }

  const requestPromise = (async () => {
    console.log(`API Request: ${config.method || 'GET'} ${url}`);
    try {
      let response = await fetch(url, config);

      // --- AUTO-REFRESH INTERCEPTOR ---
      if (response.status === 401 && !endpoint.startsWith('/login') && endpoint !== '/refresh' && !options._isRetry) {
        console.warn('401 detected, attempting auto-refresh...');
        const newToken = await performTokenRefresh();
        if (newToken) {
          console.log('Refresh successful, retrying original request...');
          config.headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, config);
        }
      }

      let data;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      console.log(`API Response [${response.status}]:`, data);

      if (!response.ok) {
        throw new ApiError(data.message || 'Something went wrong', {
          status: response.status,
          data,
          endpoint,
        });
      }

      return data;
    } catch (error) {
      const apiError = error.name === 'AbortError'
        ? new ApiError(
            timedOut ? 'Request timed out' : 'Request cancelled',
            { code: timedOut ? 'TIMEOUT' : 'ABORTED', endpoint }
          )
        : error;
      if (apiError.code !== 'ABORTED') {
        console.error('API Request Error:', apiError);
      }
      throw apiError;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      if (requestKey) inFlightGetRequests.delete(requestKey);
    }
  })();

  if (requestKey) {
    inFlightGetRequests.set(requestKey, requestPromise);
  }

  return requestPromise;
};

export const authApi = {
  login: (userName, password) =>
    apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ userName, password }),
    }),

  loginPhone: (phone, orgName) =>
    apiRequest('/login/phone', {
      method: 'POST',
      body: JSON.stringify({ phone, orgName }),
    }),

  loginGoogle: (idToken) =>
    apiRequest('/login/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }),

  logout: (token) =>
    apiRequest('/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }),

  verifyEmail: (orgName, userName, otpCode) =>
    apiRequest(`/${orgName}/user/${userName}/verification`, {
      method: 'POST',
      body: JSON.stringify({ otpCode }),
    }),

  verify2fa: (orgName, userName, otpCode) =>
    apiRequest(`/${orgName}/user/${userName}/verify2fa`, {
      method: 'POST',
      body: JSON.stringify({ otpCode }),
    }),

  resendEmailOtp: (orgName, userName) =>
    apiRequest('/organisation/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ orgName, userName }),
    }),

  refresh: (refreshToken) =>
    apiRequest('/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  requestPasswordReset: (userName) =>
    apiRequest('/user/forgot-password/request-pin', {
      method: 'POST',
      body: JSON.stringify({ userName }),
    }),

  resetPasswordWithPin: (userName, pin, newPassword, confirmPassword) =>
    apiRequest('/user/forgot-password/reset', {
      method: 'POST',
      body: JSON.stringify({ userName, pin, newPassword, confirmPassword }),
    }),
};

export const organisationApi = {
  create: (orgData, token) => {
    return apiRequest('/organisation/create', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(orgData),
    });
  },
  listAll: (token, options = {}) => {
    return apiRequest('/organisation/all', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      signal: options.signal,
    });
  },
  getByName: (orgName, token) => {
    return apiRequest(`/organisation/${orgName}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },
  // Creates CareSite and its Owner
  createCareSite: (orgName, careSiteData, token) => {
    return apiRequest(`/${orgName}/caresite/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(careSiteData),
    });
  },
  listCareSites: (orgName, token, options = {}) => {
    return apiRequest(`/${orgName}/caresite/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      signal: options.signal,
    });
  },
  getCareSiteByCode: (orgName, careSiteCode, token) => {
    return apiRequest(`/${orgName}/caresite/${careSiteCode}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },
  updateCareSite: (orgName, careSiteData, token) =>
    apiRequest(`/${orgName}/caresite/update`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(careSiteData),
    }),
  updateJwtValidity: (orgName, payload, token) =>
    apiRequest(`/organisation/${orgName}/jwt-validity`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  updateCareSiteJwtValidity: (orgName, careSiteCode, payload, token) =>
    apiRequest(`/${orgName}/caresite/${careSiteCode}/jwt-validity`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
};

export const userApi = {
  // --- Org Owner ---
  listOrgOwners: (orgName, token) => {
    return apiRequest(`/${orgName}/user/orgowners`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },

  // --- Org Admin ---
  createOrgAdmin: (orgName, userData, token) => {
    return apiRequest(`/${orgName}/user/createorgadmin`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(userData),
    });
  },
  listOrgAdmins: (orgName, token, options = {}) => {
    return apiRequest(`/${orgName}/user/orgadmins`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      signal: options.signal,
    });
  },

  // --- CareSite Owner ---
  listCareSiteOwners: (orgName, token, options = {}) => {
    return apiRequest(`/${orgName}/user/caresiteowners`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      signal: options.signal,
    });
  },

  // --- CareSite Admin ---
  createCareSiteAdmin: (orgName, careSiteCode, userData, token) => {
    return apiRequest(`/${orgName}/${careSiteCode}/user/createcareSiteadmin`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(userData),
    });
  },
  listAllCareSiteAdmins: (orgName, token, options = {}) => {
    return apiRequest(`/${orgName}/user/caresiteadmins`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      signal: options.signal,
    });
  },
  listCareSiteAdminsByCareSite: (orgName, careSiteCode, token) => {
    return apiRequest(`/${orgName}/${careSiteCode}/user/caresiteadmins`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },

  // --- General ---
  getUserDetails: (orgName, userName, token) => {
    return apiRequest(`/${orgName}/user/${userName}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },
  updateAdmin: (orgName, userName, userData, token) =>
    apiRequest(`/${orgName}/user/${userName}/update`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(userData),
    }),
  updatePreferredLocale: (orgName, locale, token, options = {}) => {
    return apiRequest(`/${orgName}/user/locale`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
      params: { locale }, // Note: Back-end expects this as a @RequestParam
      signal: options.signal,
    });
  },
};

export const summaryApi = {
  getPlatformSummary: (token, options = {}) => {
    return apiRequest('/summary', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      signal: options.signal,
    });
  },
  getOrgSummary: (orgName, token, options = {}) => {
    return apiRequest(`/${orgName}/summary`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      signal: options.signal,
    });
  },
  getCareSiteSummary: (orgName, careSiteCode, token, options = {}) => {
    return apiRequest(`/${orgName}/${careSiteCode}/summary`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      signal: options.signal,
    });
  },
};

export const deviceTypeApi = {
  createType: (orgName, deviceData, token) =>
    apiRequest(`/${orgName}/devicetype/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(deviceData),
    }),
  listTypes: (orgName, token) =>
    apiRequest(`/${orgName}/devicetype/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  listProfiles: (orgName, token) =>
    apiRequest(`/${orgName}/devicetype/profiles`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  updateType: (orgName, deviceTypeCode, deviceData, token) =>
    apiRequest(`/${orgName}/devicetype/${deviceTypeCode}/update`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(deviceData),
    }),
};

export const wardApi = {
  create: (orgName, careSiteCode, wardData, token) =>
    apiRequest(`/${orgName}/ward/${careSiteCode}/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(wardData),
    }),
  listAll: (orgName, careSiteCode, token) =>
    apiRequest(`/${orgName}/ward/${careSiteCode}/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  getDetail: (orgName, careSiteCode, wardCode, token) =>
    apiRequest(`/${orgName}/ward/${careSiteCode}/${wardCode}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  update: (orgName, careSiteCode, wardId, wardData, token) =>
    apiRequest(`/${orgName}/ward/${careSiteCode}/update/${wardId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(wardData),
    }),
  delete: (orgName, careSiteCode, wardId, token) =>
    apiRequest(`/${orgName}/ward/${careSiteCode}/delete/${wardId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
};

export const nursingStationApi = {
  create: (orgName, careSiteCode, stationData, token) =>
    apiRequest(`/${orgName}/nursingstation/${careSiteCode}/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(stationData),
    }),
  listAll: (orgName, careSiteCode, token) =>
    apiRequest(`/${orgName}/nursingstation/${careSiteCode}/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  searchByNumber: (orgName, careSiteCode, stationNumber, token) =>
    apiRequest(`/${orgName}/nursingstation/${careSiteCode}/searchbyid`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ stationNumber }),
    }),
  assignWard: (orgName, careSiteCode, wardCode, stationNumber, token) =>
    apiRequest(`/${orgName}/nursingstation/${careSiteCode}/assign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ wardCode, stationNumber }),
    }),
  unassignWard: (orgName, careSiteCode, wardCode, stationNumber, token) =>
    apiRequest(`/${orgName}/nursingstation/${careSiteCode}/unassign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ wardCode, stationNumber }),
    }),
};

export const bedApi = {
  create: (orgName, careSiteCode, bedData, token) =>
    apiRequest(`/${orgName}/bed/${careSiteCode}/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(bedData),
    }),
  listAll: (orgName, careSiteCode, token) =>
    apiRequest(`/${orgName}/bed/${careSiteCode}/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  getAllBedsByWard: (orgName, careSiteCode, wardCode, token) =>
    apiRequest(`/${orgName}/bed/${careSiteCode}/getAllBeds/${wardCode}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  getAssignedDevices: (orgName, careSiteCode, bedCode, token) =>
    apiRequest(`/${orgName}/bed/${careSiteCode}/${bedCode}/devicesassigned`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  assignPatient: (orgName, careSiteCode, bedCode, payload, token) =>
    apiRequest(`/${orgName}/bed/${careSiteCode}/assign/patient`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ bedCode, ...payload }),
    }),
  unassignPatient: (orgName, careSiteCode, bedCode, token) =>
    apiRequest(`/${orgName}/bed/${careSiteCode}/patient/unassign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ bedCode }),
    }),
  discharge: (orgName, careSiteCode, bedCode, token) =>
    apiRequest(`/${orgName}/bed/${careSiteCode}/patient/discharge`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ bedCode }),
    }),
  transferWard: (orgName, careSiteCode, bedCode, payload, token) =>
    apiRequest(`/${orgName}/bed/${careSiteCode}/patient/wardTransfer`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ bedCode, ...payload }),
    }),
  updateAlarmConfig: (orgName, careSiteCode, bedCode, alarmConfig, token) =>
    apiRequest(`/${orgName}/bed/${careSiteCode}/${bedCode}/alarmconfig/save`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(alarmConfig),
    }),
};

export const doctorApi = {
  create: (orgName, careSiteCode, doctorData, token) =>
    apiRequest(`/${orgName}/doctor/${careSiteCode}/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(doctorData),
    }),
  listAll: (orgName, careSiteCode, token, options = {}) =>
    apiRequest(`/${orgName}/doctor/${careSiteCode}/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      signal: options.signal,
    }),
  listAllOrg: (orgName, token, options = {}) =>
    apiRequest(`/${orgName}/doctor/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      signal: options.signal,
    }),
  getDetail: (orgName, careSiteCode, doctorCode, token) =>
    apiRequest(`/${orgName}/doctor/${careSiteCode}/${doctorCode}/doctordetail`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  update: (orgName, careSiteCode, doctorCode, doctorData, token) =>
    apiRequest(`/${orgName}/doctor/${careSiteCode}/${doctorCode}/update`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(doctorData),
    }),
};

export const nurseApi = {
  create: (orgName, careSiteCode, nurseData, token) =>
    apiRequest(`/${orgName}/nurse/${careSiteCode}/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(nurseData),
    }),
  listAll: (orgName, careSiteCode, token) =>
    apiRequest(`/${orgName}/nurse/${careSiteCode}/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  listAllOrg: (orgName, token, options = {}) =>
    apiRequest(`/${orgName}/nurse/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      signal: options.signal,
    }),
  getDetail: (orgName, careSiteCode, nurseCode, token) =>
    apiRequest(`/${orgName}/nurse/${careSiteCode}/${nurseCode}/nursedetail`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  update: (orgName, careSiteCode, nurseCode, nurseData, token) =>
    apiRequest(`/${orgName}/nurse/${careSiteCode}/${nurseCode}/update`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(nurseData),
    }),
  assignBed: (orgName, careSiteCode, payload, token) =>
    apiRequest(`/${orgName}/nurse/${careSiteCode}/assigntobed`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  admitPatient: (orgName, careSiteCode, payload, token) =>
    apiRequest(`/${orgName}/nurse/${careSiteCode}/admit`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
};

export const patientApi = {
  create: (orgName, careSiteCode, patientData, token) =>
    apiRequest(`/${orgName}/patient/${careSiteCode}/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(patientData),
    }),
  listAll: (orgName, careSiteCode, token) =>
    apiRequest(`/${orgName}/patient/${careSiteCode}/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  getDetail: (orgName, careSiteCode, patientCode, token) =>
    apiRequest(`/${orgName}/patient/${careSiteCode}/${patientCode}/patientdetail`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  update: (orgName, careSiteCode, patientCode, patientData, token) =>
    apiRequest(`/${orgName}/patient/${careSiteCode}/update`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(patientData),
    }),
  discharge: (orgName, careSiteCode, patientCode, token) =>
    apiRequest(`/${orgName}/patient/${careSiteCode}/initiateDischarge`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ patientCode }),
    }),
  transfer: (orgName, careSiteCode, patientCode, payload, token) =>
    apiRequest(`/${orgName}/patient/${careSiteCode}/initiateTransfer`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ patientCode, ...payload }),
    }),
  addInfo: (orgName, careSiteCode, patientCode, infoData, token) =>
    apiRequest(`/${orgName}/patient/${careSiteCode}/${patientCode}/addinfo`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(infoData),
    }),
  anonymize: (orgName, careSiteCode, patientCode, token, gdprRef) =>
    apiRequest(`/${orgName}/patient/${careSiteCode}/${patientCode}/anonymize`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
      ...(gdprRef ? { params: { gdprRef } } : {}),
    }),
  getGdprStatus: (orgName, requestId, token) =>
    apiRequest(`/${orgName}/patient/gdpr/request/${requestId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
};

export const admissionApi = {
  close: (orgName, careSiteCode, patientCode, token) =>
    apiRequest(`/${orgName}/admission/${careSiteCode}/${patientCode}/close`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
};

export const shiftApi = {
  create: (orgName, careSiteCode, shiftData, token) =>
    apiRequest(`/${orgName}/shift/${careSiteCode}/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(shiftData),
    }),
  listAll: (orgName, careSiteCode, token) =>
    apiRequest(`/${orgName}/shift/${careSiteCode}/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  assignNurse: (orgName, careSiteCode, assignData, token) =>
    apiRequest(`/${orgName}/shift/${careSiteCode}/nurse/assign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(assignData),
    }),
  unassignNurse: (orgName, careSiteCode, assignData, token) =>
    apiRequest(`/${orgName}/shift/${careSiteCode}/nurse/unassign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(assignData),
    }),
  assignDoctor: (orgName, careSiteCode, assignData, token) =>
    apiRequest(`/${orgName}/shift/${careSiteCode}/doctor/assign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(assignData),
    }),
  unassignDoctor: (orgName, careSiteCode, assignData, token) =>
    apiRequest(`/${orgName}/shift/${careSiteCode}/doctor/unassign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(assignData),
    }),
  getDetail: (orgName, careSiteCode, shiftCode, token) =>
    apiRequest(`/${orgName}/shift/${careSiteCode}/${shiftCode}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  update: (orgName, careSiteCode, shiftCode, shiftData, token) =>
    apiRequest(`/${orgName}/shift/${careSiteCode}/${shiftCode}/update`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(shiftData),
    }),
  delete: (orgName, careSiteCode, shiftCode, token) =>
    apiRequest(`/${orgName}/shift/${careSiteCode}/${shiftCode}/delete`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
};

export const gatewayApi = {
  listAll: (orgName, careSiteCode, token) =>
    apiRequest(`/${orgName}/gateway/${careSiteCode}/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  create: (orgName, careSiteCode, gatewayData, token) =>
    apiRequest(`/${orgName}/gateway/${careSiteCode}/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(gatewayData),
    }),
  getDetail: (orgName, careSiteCode, gatewayCode, token) =>
    apiRequest(`/${orgName}/gateway/${careSiteCode}/${gatewayCode}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  assignToBed: (orgName, careSiteCode, payload, token) =>
    apiRequest(`/${orgName}/gateway/${careSiteCode}/assign/bed`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
};

export const deviceApi = {
  listAll: (orgName, careSiteCode, token) =>
    apiRequest(`/${orgName}/device/${careSiteCode}/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  create: (orgName, careSiteCode, deviceData, token) =>
    apiRequest(`/${orgName}/device/${careSiteCode}/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(deviceData),
    }),
  getDetail: (orgName, deviceCode, token) =>
    apiRequest(`/${orgName}/device/${deviceCode}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  listUnassigned: (orgName, careSiteCode, token) =>
    apiRequest(`/${orgName}/device/${careSiteCode}/unassigneddevices`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  addConfig: (orgName, careSiteCode, deviceCode, configs, token) =>
    apiRequest(`/${orgName}/device/${careSiteCode}/${deviceCode}/config`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(configs),
    }),
  assign: (orgName, careSiteCode, payload, token) =>
    apiRequest(`/${orgName}/device/${careSiteCode}/assign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  endAssignment: (orgName, careSiteCode, device, token) =>
    apiRequest(`/${orgName}/device/${careSiteCode}/endAssignment`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(device),
    }),
};

export const assignmentApi = {
  assign: (orgName, careSiteCode, payload, token) =>
    apiRequest(`/${orgName}/assignment/${careSiteCode}/assign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  unassign: (orgName, careSiteCode, payload, token) =>
    apiRequest(`/${orgName}/assignment/${careSiteCode}/unassign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  getByPatient: (orgName, careSiteCode, patientCode, token) =>
    apiRequest(`/${orgName}/assignment/${careSiteCode}/patient/${patientCode}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  getByDoctor: (orgName, careSiteCode, doctorCode, token) =>
    apiRequest(`/${orgName}/assignment/${careSiteCode}/doctor/${doctorCode}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  deactivateDevices: (orgName, careSiteCode, patientCode, token) =>
    apiRequest(`/${orgName}/assignment/${careSiteCode}/${patientCode}/devices`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
};

export const consentApi = {
  getTypes: (orgName, token) =>
    apiRequest(`/${orgName}/consent/types`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  getPatientConsents: (orgName, patientCode, orgId, patientId, token) =>
    apiRequest(`/${orgName}/patients/${patientCode}/consents`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      params: { orgId, patientId },
    }),
  record: (orgName, patientCode, payload, token) =>
    apiRequest(`/${orgName}/patients/${patientCode}/consents`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
};

export const rolesApi = {
  listAll: (orgName, token) =>
    apiRequest(`/${orgName}/roles/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  getByName: (orgName, roleName, token) =>
    apiRequest(`/${orgName}/roles/${roleName}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  create: (orgName, roleData, token) =>
    apiRequest(`/${orgName}/roles/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(roleData),
    }),
  update: (orgName, roleData, token) =>
    apiRequest(`/${orgName}/roles/update`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(roleData),
    }),
};

// Multipart upload helper — does NOT set Content-Type so React Native can
// attach the correct multipart/form-data boundary automatically.
export const apiUpload = async (endpoint, formData, token, method = 'POST') => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'X-Locale': (i18n.language || 'en').split('-')[0],
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    let response = await fetch(url, { method, headers, body: formData, signal: controller.signal });

    if (response.status === 401 && endpoint !== '/refresh') {
      const newToken = await performTokenRefresh();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, { method, headers, body: formData });
      }
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new ApiError(text || `HTTP ${response.status}`, { status: response.status, endpoint });
    }

    const ct = response.headers.get('content-type');
    return ct && ct.includes('application/json') ? response.json() : response.text();
  } catch (e) {
    if (e.name === 'AbortError') throw new ApiError('Request timed out', { code: 'TIMEOUT', endpoint });
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const svgApi = {
  get: (orgName, careSiteCode, wardCode, token) =>
    apiRequest(`/${orgName}/svg/${careSiteCode}/${wardCode}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),

  upload: (orgName, careSiteCode, wardCode, fileUri, fileName, token) => {
    const fd = new FormData();
    fd.append('file', { uri: fileUri, type: 'text/plain', name: fileName || 'floor_plan.svg' });
    return apiUpload(`/${orgName}/svg/${careSiteCode}/upload/${wardCode}`, fd, token, 'POST');
  },

  replace: (orgName, careSiteCode, wardCode, fileUri, fileName, token) => {
    const fd = new FormData();
    fd.append('file', { uri: fileUri, type: 'text/plain', name: fileName || 'floor_plan.svg' });
    return apiUpload(`/${orgName}/svg/${careSiteCode}/upload/${wardCode}`, fd, token, 'PUT');
  },
};
