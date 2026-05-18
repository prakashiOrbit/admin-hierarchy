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
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orgData),
    });
  },
  listAll: (token) => {
    return apiRequest('/organisation/all', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

export const userApi = {
  createOrgAdmin: (userData, token) => {
    return apiRequest('/user/createorgadmin', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
  },
};
