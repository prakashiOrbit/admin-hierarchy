const BASE_URL = 'http://139.59.46.163:8080/api';

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
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
};

export const userApi = {
  // --- Org Owner ---
  createOrgOwner: (userData, token) => {
    return apiRequest('/user/createorgowner', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(userData),
    });
  },
  listOrgOwners: (orgName, token) => {
    return apiRequest(`/${orgName}/user/orgowners`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },

  // --- Org Admin ---
  createOrgAdmin: (userData, token) => {
    return apiRequest('/user/createorgadmin', {
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
};

export const summaryApi = {
  getPlatformSummary: (token) => {
    return apiRequest('/summary', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },
  getOrgSummary: (token) => {
    // Both Org Owner and Org Admin use /api/summary
    return apiRequest('/summary', {
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

export const deviceApi = {
  createType: (orgName, deviceData, token) => {
    return apiRequest(`/${orgName}/devicetype/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(deviceData),
    });
  },
  listTypes: (orgName, token) => {
    return apiRequest(`/${orgName}/devicetype/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};
