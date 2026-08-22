/**
 * API Service Layer
 * Interacts with the backend via the Next.js proxy configured in next.config.ts
 * (/api/ routes to http://localhost:5000/api/v1/)
 */

const BASE_URL = '/api';

/**
 * Helper function for handling JSON fetches
 */
async function fetchApi(endpoint: string, options: RequestInit = {}) {
  // Try to get token from localStorage for authenticated requests
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('authToken') || '';
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred during the API request');
  }
  
  return data;
}

// ----------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------

export async function loginApi(employeeId: string, password: string) {
  return fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ employeeId, password }),
  });
}

export async function signupApi(employeeId: string, email: string, password: string, role?: string) {
  return fetchApi('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ employeeId, email, password, role }),
  });
}

// ----------------------------------------------------
// ATTENDANCE
// ----------------------------------------------------

export async function checkInApi(employeeId: string, password: string) {
  return fetchApi('/attendance/check-in', {
    method: 'POST',
    body: JSON.stringify({ employeeId, password }),
  });
}

export async function checkOutApi(employeeId: string, password: string) {
  return fetchApi('/attendance/check-out', {
    method: 'POST',
    body: JSON.stringify({ employeeId, password }),
  });
}

export async function getAttendanceHistoryApi(userId: number) {
  // If the backend relies on JWT, userId isn't strictly needed in query if using `req.user.id`
  // but it's supported by the API.
  return fetchApi(`/attendance/history?userId=${userId}`, {
    method: 'GET',
  });
}

// ----------------------------------------------------
// DASHBOARD
// ----------------------------------------------------

export async function getEmployeeDashboardApi() {
  return fetchApi('/dashboard/me', {
    method: 'GET',
  });
}

export async function getAdminDashboardApi() {
  return fetchApi('/dashboard/admin', {
    method: 'GET',
  });
}

// ----------------------------------------------------
// PROFILE
// ----------------------------------------------------

export async function getProfileApi() {
  return fetchApi('/profile', {
    method: 'GET',
  });
}

export async function updateProfileApi(data: any) {
  return fetchApi('/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ----------------------------------------------------
// LEAVE
// ----------------------------------------------------

export async function applyLeaveApi(data: { type: string; startDate: string; endDate: string; remarks: string }) {
  return fetchApi('/leave', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLeaveStatusApi(id: string, status: 'APPROVED' | 'REJECTED', approvalComment?: string) {
  return fetchApi(`/leave/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, approvalComment }),
  });
}
