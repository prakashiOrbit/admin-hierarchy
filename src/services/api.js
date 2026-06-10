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
      if (response.status === 401 && endpoint !== '/refresh' && !options._isRetry) {
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
  // Creates Hospital and its Owner
  createHospital: (orgName, hospitalData, token) => {
    return apiRequest(`/${orgName}/hospital/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(hospitalData),
    });
  },
  listHospitals: (orgName, token, options = {}) => {
    return apiRequest(`/${orgName}/hospital/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      signal: options.signal,
    });
  },
  getHospitalByCode: (orgName, hospCode, token) => {
    return apiRequest(`/${orgName}/hospital/${hospCode}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },
  updateHospital: (orgName, hospitalData, token) =>
    apiRequest(`/${orgName}/hospital/update`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(hospitalData),
    }),
  updateJwtValidity: (orgName, payload, token) =>
    apiRequest(`/organisation/${orgName}/jwt-validity`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  updateHospitalJwtValidity: (orgName, hospCode, payload, token) =>
    apiRequest(`/${orgName}/hospital/${hospCode}/jwt-validity`, {
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

  // --- Hospital Owner ---
  listHospOwners: (orgName, token, options = {}) => {
    return apiRequest(`/${orgName}/user/hospowners`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      signal: options.signal,
    });
  },

  // --- Hospital Admin ---
  createHospAdmin: (orgName, hospCode, userData, token) => {
    return apiRequest(`/${orgName}/${hospCode}/user/createhospitaladmin`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(userData),
    });
  },
  listAllHospAdmins: (orgName, token, options = {}) => {
    return apiRequest(`/${orgName}/user/hospadmins`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      signal: options.signal,
    });
  },
  listHospAdminsByHospital: (orgName, hospCode, token) => {
    return apiRequest(`/${orgName}/${hospCode}/user/hospadmins`, {
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
  getHospitalSummary: (orgName, hospCode, token, options = {}) => {
    return apiRequest(`/${orgName}/${hospCode}/summary`, {
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
  create: (orgName, hospCode, wardData, token) =>
    apiRequest(`/${orgName}/ward/${hospCode}/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(wardData),
    }),
  listAll: (orgName, hospCode, token) =>
    apiRequest(`/${orgName}/ward/${hospCode}/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  getDetail: (orgName, hospCode, wardCode, token) =>
    apiRequest(`/${orgName}/ward/${hospCode}/${wardCode}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  update: (orgName, hospCode, wardId, wardData, token) =>
    apiRequest(`/${orgName}/ward/${hospCode}/update/${wardId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(wardData),
    }),
  delete: (orgName, hospCode, wardId, token) =>
    apiRequest(`/${orgName}/ward/${hospCode}/delete/${wardId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
};

export const nursingStationApi = {
  create: (orgName, hospCode, stationData, token) =>
    apiRequest(`/${orgName}/nursingstation/${hospCode}/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(stationData),
    }),
  listAll: (orgName, hospCode, token) =>
    apiRequest(`/${orgName}/nursingstation/${hospCode}/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  searchByNumber: (orgName, hospCode, stationNumber, token) =>
    apiRequest(`/${orgName}/nursingstation/${hospCode}/searchbyid`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ stationNumber }),
    }),
  assignWard: (orgName, hospCode, wardCode, stationNumber, token) =>
    apiRequest(`/${orgName}/nursingstation/${hospCode}/assign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ wardCode, stationNumber }),
    }),
  unassignWard: (orgName, hospCode, wardCode, stationNumber, token) =>
    apiRequest(`/${orgName}/nursingstation/${hospCode}/unassign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ wardCode, stationNumber }),
    }),
};

export const bedApi = {
  create: (orgName, hospCode, bedData, token) =>
    apiRequest(`/${orgName}/bed/${hospCode}/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(bedData),
    }),
  listAll: (orgName, hospCode, token) =>
    apiRequest(`/${orgName}/bed/${hospCode}/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  getAllBedsByWard: (orgName, hospCode, wardCode, token) =>
    apiRequest(`/${orgName}/bed/${hospCode}/getAllBeds/${wardCode}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  getAssignedDevices: (orgName, hospCode, bedCode, token) =>
    apiRequest(`/${orgName}/bed/${hospCode}/${bedCode}/devicesassigned`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  assignPatient: (orgName, hospCode, bedCode, payload, token) =>
    apiRequest(`/${orgName}/bed/${hospCode}/assign/patient`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ bedCode, ...payload }),
    }),
  unassignPatient: (orgName, hospCode, bedCode, token) =>
    apiRequest(`/${orgName}/bed/${hospCode}/patient/unassign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ bedCode }),
    }),
  discharge: (orgName, hospCode, bedCode, token) =>
    apiRequest(`/${orgName}/bed/${hospCode}/patient/discharge`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ bedCode }),
    }),
  transferWard: (orgName, hospCode, bedCode, payload, token) =>
    apiRequest(`/${orgName}/bed/${hospCode}/patient/wardTransfer`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ bedCode, ...payload }),
    }),
  updateAlarmConfig: (orgName, hospCode, bedCode, alarmConfig, token) =>
    apiRequest(`/${orgName}/bed/${hospCode}/${bedCode}/alarmconfig/save`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(alarmConfig),
    }),
};

export const doctorApi = {
  create: (orgName, hospCode, doctorData, token) =>
    apiRequest(`/${orgName}/doctor/${hospCode}/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(doctorData),
    }),
  listAll: (orgName, hospCode, token, options = {}) =>
    apiRequest(`/${orgName}/doctor/${hospCode}/all`, {
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
  getDetail: (orgName, hospCode, doctorCode, token) =>
    apiRequest(`/${orgName}/doctor/${hospCode}/${doctorCode}/doctordetail`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  update: (orgName, hospCode, doctorCode, doctorData, token) =>
    apiRequest(`/${orgName}/doctor/${hospCode}/${doctorCode}/update`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(doctorData),
    }),
};

export const nurseApi = {
  create: (orgName, hospCode, nurseData, token) =>
    apiRequest(`/${orgName}/nurse/${hospCode}/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(nurseData),
    }),
  listAll: (orgName, hospCode, token) =>
    apiRequest(`/${orgName}/nurse/${hospCode}/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  listAllOrg: (orgName, token, options = {}) =>
    apiRequest(`/${orgName}/nurse/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      signal: options.signal,
    }),
  getDetail: (orgName, hospCode, nurseCode, token) =>
    apiRequest(`/${orgName}/nurse/${hospCode}/${nurseCode}/nursedetail`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  update: (orgName, hospCode, nurseCode, nurseData, token) =>
    apiRequest(`/${orgName}/nurse/${hospCode}/${nurseCode}/update`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(nurseData),
    }),
  assignBed: (orgName, hospCode, payload, token) =>
    apiRequest(`/${orgName}/nurse/${hospCode}/assigntobed`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  admitPatient: (orgName, hospCode, payload, token) =>
    apiRequest(`/${orgName}/nurse/${hospCode}/admit`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
};

export const patientApi = {
  create: (orgName, hospCode, patientData, token) =>
    apiRequest(`/${orgName}/patient/${hospCode}/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(patientData),
    }),
  listAll: (orgName, hospCode, token) =>
    apiRequest(`/${orgName}/patient/${hospCode}/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  getDetail: (orgName, hospCode, patientCode, token) =>
    apiRequest(`/${orgName}/patient/${hospCode}/${patientCode}/patientdetail`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  update: (orgName, hospCode, patientCode, patientData, token) =>
    apiRequest(`/${orgName}/patient/${hospCode}/update`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(patientData),
    }),
  discharge: (orgName, hospCode, patientCode, token) =>
    apiRequest(`/${orgName}/patient/${hospCode}/initiateDischarge`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ patientCode }),
    }),
  transfer: (orgName, hospCode, patientCode, payload, token) =>
    apiRequest(`/${orgName}/patient/${hospCode}/initiateTransfer`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ patientCode, ...payload }),
    }),
  addInfo: (orgName, hospCode, patientCode, infoData, token) =>
    apiRequest(`/${orgName}/patient/${hospCode}/${patientCode}/addinfo`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(infoData),
    }),
  anonymize: (orgName, hospCode, patientCode, token, gdprRef) =>
    apiRequest(`/${orgName}/patient/${hospCode}/${patientCode}/anonymize`, {
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
  close: (orgName, hospCode, patientCode, token) =>
    apiRequest(`/${orgName}/admission/${hospCode}/${patientCode}/close`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
};

export const shiftApi = {
  create: (orgName, hospCode, shiftData, token) =>
    apiRequest(`/${orgName}/shift/${hospCode}/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(shiftData),
    }),
  listAll: (orgName, hospCode, token) =>
    apiRequest(`/${orgName}/shift/${hospCode}/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  assignNurse: (orgName, hospCode, assignData, token) =>
    apiRequest(`/${orgName}/shift/${hospCode}/nurse/assign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(assignData),
    }),
  unassignNurse: (orgName, hospCode, assignData, token) =>
    apiRequest(`/${orgName}/shift/${hospCode}/nurse/unassign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(assignData),
    }),
  assignDoctor: (orgName, hospCode, assignData, token) =>
    apiRequest(`/${orgName}/shift/${hospCode}/doctor/assign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(assignData),
    }),
  unassignDoctor: (orgName, hospCode, assignData, token) =>
    apiRequest(`/${orgName}/shift/${hospCode}/doctor/unassign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(assignData),
    }),
  getDetail: (orgName, hospCode, shiftCode, token) =>
    apiRequest(`/${orgName}/shift/${hospCode}/${shiftCode}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  update: (orgName, hospCode, shiftCode, shiftData, token) =>
    apiRequest(`/${orgName}/shift/${hospCode}/${shiftCode}/update`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(shiftData),
    }),
  delete: (orgName, hospCode, shiftCode, token) =>
    apiRequest(`/${orgName}/shift/${hospCode}/${shiftCode}/delete`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
};

export const gatewayApi = {
  listAll: (orgName, hospCode, token) =>
    apiRequest(`/${orgName}/gateway/${hospCode}/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  create: (orgName, hospCode, gatewayData, token) =>
    apiRequest(`/${orgName}/gateway/${hospCode}/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(gatewayData),
    }),
  getDetail: (orgName, hospCode, gatewayCode, token) =>
    apiRequest(`/${orgName}/gateway/${hospCode}/${gatewayCode}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  assignToBed: (orgName, hospCode, payload, token) =>
    apiRequest(`/${orgName}/gateway/${hospCode}/assign/bed`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
};

export const deviceApi = {
  listAll: (orgName, hospCode, token) =>
    apiRequest(`/${orgName}/device/${hospCode}/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  create: (orgName, hospCode, deviceData, token) =>
    apiRequest(`/${orgName}/device/${hospCode}/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(deviceData),
    }),
  getDetail: (orgName, deviceCode, token) =>
    apiRequest(`/${orgName}/device/${deviceCode}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  listUnassigned: (orgName, hospCode, token) =>
    apiRequest(`/${orgName}/device/${hospCode}/unassigneddevices`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  addConfig: (orgName, hospCode, deviceCode, configs, token) =>
    apiRequest(`/${orgName}/device/${hospCode}/${deviceCode}/config`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(configs),
    }),
  assign: (orgName, hospCode, payload, token) =>
    apiRequest(`/${orgName}/device/${hospCode}/assign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  endAssignment: (orgName, hospCode, device, token) =>
    apiRequest(`/${orgName}/device/${hospCode}/endAssignment`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(device),
    }),
};

export const assignmentApi = {
  assign: (orgName, hospCode, payload, token) =>
    apiRequest(`/${orgName}/assignment/${hospCode}/assign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  unassign: (orgName, hospCode, payload, token) =>
    apiRequest(`/${orgName}/assignment/${hospCode}/unassign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  getByPatient: (orgName, hospCode, patientCode, token) =>
    apiRequest(`/${orgName}/assignment/${hospCode}/patient/${patientCode}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  getByDoctor: (orgName, hospCode, doctorCode, token) =>
    apiRequest(`/${orgName}/assignment/${hospCode}/doctor/${doctorCode}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  deactivateDevices: (orgName, hospCode, patientCode, token) =>
    apiRequest(`/${orgName}/assignment/${hospCode}/${patientCode}/devices`, {
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
