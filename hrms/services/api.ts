import { applyLeaveApi, checkInApi, checkOutApi, generatePayrollApi, getAdminDashboardApi, getAttendanceHistoryApi, getEmployeeDashboardApi, getMyPayrollApi, getProfileApi, loginApi, signupApi, updateLeaveStatusApi, updateProfileApi, updateSalaryStructureApi } from './api';

// Re-export existing API methods
export {
  applyLeaveApi,
  checkInApi,
  checkOutApi,
  generatePayrollApi,
  getAdminDashboardApi,
  getAttendanceHistoryApi,
  getEmployeeDashboardApi,
  getMyPayrollApi,
  getProfileApi,
  loginApi,
  signupApi,
  updateLeaveStatusApi,
  updateProfileApi,
  updateSalaryStructureApi
};

const BASE_URL = '/api';

async function fetchApi(endpoint: string, options: RequestInit = {}) {
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
// PROMOTION ENGINE (Steps 9 & 10)
// ----------------------------------------------------

export async function runPromotionAnalysisApi(employeeId: number, evaluationPeriod: string) {
  return fetchApi('/promotion/analysis/run', {
    method: 'POST',
    body: JSON.stringify({ employeeId, evaluationPeriod }),
  });
}

export async function getAllAnalysesApi(period?: string, status?: string) {
  let url = '/promotion/analysis';
  const params = new URLSearchParams();
  if (period) params.append('period', period);
  if (status) params.append('status', status);
  if (params.toString()) url += `?${params.toString()}`;
  
  return fetchApi(url, { method: 'GET' });
}

export async function getAnalysisByIdApi(id: number) {
  return fetchApi(`/promotion/analysis/${id}`, { method: 'GET' });
}

export async function updateHrDecisionApi(id: number, hrDecision: 'PENDING' | 'APPROVED' | 'DEFERRED' | 'REJECTED', hrComments: string) {
  return fetchApi(`/promotion/analysis/${id}/decision`, {
    method: 'PATCH',
    body: JSON.stringify({ hrDecision, hrComments }),
  });
}
