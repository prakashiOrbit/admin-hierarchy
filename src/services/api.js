import i18n from '../i18n';

const BASE_URL = 'http://139.59.46.163:8080/api';

export const apiRequest = async (endpoint, options = {}) => {
  let url = `${BASE_URL}${endpoint}`;
  
  if (options.params) {
    const searchParams = new URLSearchParams(options.params);
    url += `?${searchParams.toString()}`;
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'X-Locale': i18n.language || 'en',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    console.log(`API Request: ${config.method || 'GET'} ${url}`);
    const response = await fetch(url, config);
    
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }
    
    console.log(`API Response [${response.status}]:`, data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export const authApi = {
  login: (userName, password) => {
    return apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ userName, password }),
    });
  },
  verifyEmail: (orgName, userName, otpCode) => {
    return apiRequest(`/${orgName}/user/${userName}/verification`, {
      method: 'POST',
      body: JSON.stringify({ otpCode }),
    });
  },
  verify2fa: (orgName, userName, otpCode) => {
    return apiRequest(`/${orgName}/user/${userName}/verify2fa`, {
      method: 'POST',
      body: JSON.stringify({ otpCode }),
    });
  },
};

export const organisationApi = {
  create: (orgData, token) => {
    return apiRequest('/organisation/create', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(orgData),
    });
  },
  listAll: (token) => {
    return apiRequest('/organisation/all', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
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
  listHospitals: (orgName, token) => {
    return apiRequest(`/${orgName}/hospital/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },
  getHospitalByCode: (orgName, hospCode, token) => {
    return apiRequest(`/${orgName}/hospital/${hospCode}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },
  updateHospital: (orgName, hospCode, hospitalData, token) =>
    apiRequest(`/${orgName}/hospital/${hospCode}/update`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(hospitalData),
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
  listOrgAdmins: (orgName, token) => {
    return apiRequest(`/${orgName}/user/orgadmins`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },

  // --- Hospital Owner ---
  listHospOwners: (orgName, token) => {
    return apiRequest(`/${orgName}/user/hospowners`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
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
  listAllHospAdmins: (orgName, token) => {
    return apiRequest(`/${orgName}/user/hospadmins`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
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
  updatePreferredLocale: (orgName, locale, token) => {
    return apiRequest(`/${orgName}/user/locale`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
      params: { locale }, // Note: Back-end expects this as a @RequestParam
    });
  },
};

export const summaryApi = {
  getPlatformSummary: (token) => {
    return apiRequest('/summary', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },
  getOrgSummary: (orgName, token) => {
    return apiRequest(`/${orgName}/summary`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },
  getHospitalSummary: (orgName, hospCode, token) => {
    return apiRequest(`/${orgName}/${hospCode}/summary`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
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
  updateType: (orgName, deviceTypeCode, deviceData, token) =>
    apiRequest(`/${orgName}/devicetype/${deviceTypeCode}/update`, {
      method: 'PUT',
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
  update: (orgName, hospCode, wardCode, wardData, token) =>
    apiRequest(`/${orgName}/ward/${hospCode}/${wardCode}/update`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(wardData),
    }),
  delete: (orgName, hospCode, wardCode, token) =>
    apiRequest(`/${orgName}/ward/${hospCode}/${wardCode}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
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
  assignPatient: (orgName, hospCode, bedCode, payload, token) =>
    apiRequest(`/${orgName}/bed/${hospCode}/${bedCode}/assignpatient`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  unassignPatient: (orgName, hospCode, bedCode, token) =>
    apiRequest(`/${orgName}/bed/${hospCode}/${bedCode}/unassignpatient`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  discharge: (orgName, hospCode, bedCode, token) =>
    apiRequest(`/${orgName}/bed/${hospCode}/${bedCode}/discharge`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  transferWard: (orgName, hospCode, bedCode, payload, token) =>
    apiRequest(`/${orgName}/bed/${hospCode}/${bedCode}/transfer`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  updateAlarmConfig: (orgName, hospCode, bedCode, alarmConfig, token) =>
    apiRequest(`/${orgName}/bed/${hospCode}/${bedCode}/alarmconfig`, {
      method: 'PUT',
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
  listAll: (orgName, hospCode, token) =>
    apiRequest(`/${orgName}/doctor/${hospCode}/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  getDetail: (orgName, hospCode, doctorCode, token) =>
    apiRequest(`/${orgName}/doctor/${hospCode}/${doctorCode}/doctordetail`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  update: (orgName, hospCode, doctorCode, doctorData, token) =>
    apiRequest(`/${orgName}/doctor/${hospCode}/${doctorCode}/update`, {
      method: 'PUT',
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
  getDetail: (orgName, hospCode, nurseCode, token) =>
    apiRequest(`/${orgName}/nurse/${hospCode}/${nurseCode}/nursedetail`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  update: (orgName, hospCode, nurseCode, nurseData, token) =>
    apiRequest(`/${orgName}/nurse/${hospCode}/${nurseCode}/update`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(nurseData),
    }),
  assignBed: (orgName, hospCode, nurseCode, payload, token) =>
    apiRequest(`/${orgName}/nurse/${hospCode}/${nurseCode}/assignbed`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  admitPatient: (orgName, hospCode, nurseCode, payload, token) =>
    apiRequest(`/${orgName}/nurse/${hospCode}/${nurseCode}/admitpatient`, {
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
    apiRequest(`/${orgName}/patient/${hospCode}/${patientCode}/update`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(patientData),
    }),
  discharge: (orgName, hospCode, patientCode, token) =>
    apiRequest(`/${orgName}/patient/${hospCode}/${patientCode}/discharge`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  transfer: (orgName, hospCode, patientCode, payload, token) =>
    apiRequest(`/${orgName}/patient/${hospCode}/${patientCode}/transfer`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  addInfo: (orgName, hospCode, patientCode, infoData, token) =>
    apiRequest(`/${orgName}/patient/${hospCode}/${patientCode}/addinfo`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(infoData),
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
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(shiftData),
    }),
  delete: (orgName, hospCode, shiftCode, token) =>
    apiRequest(`/${orgName}/shift/${hospCode}/${shiftCode}`, {
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
  getDetail: (orgName, gatewayCode, token) =>
    apiRequest(`/${orgName}/gateway/${gatewayCode}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
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
