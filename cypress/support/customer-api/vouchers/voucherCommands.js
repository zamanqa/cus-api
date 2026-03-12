import { apiRequest } from '../_shared/apiClient';

// ── API calls ─────────────────────────────────────────────

// Fetch all vouchers: Test 1, beforeEach
export function getAllVouchers() {
  return apiRequest('GET', '/vouchers');
}

// Fetch voucher by code: Test 2, Test 4
export function getVoucherByCode(voucherCode) {
  return apiRequest('GET', `/vouchers/${voucherCode}`);
}

// Create a new voucher: Test 3
export function createVoucher(voucherData) {
  return apiRequest('POST', '/vouchers', {
    body: voucherData,
  });
}

// Update a voucher: Test 5
export function updateVoucher(voucherId, updateData) {
  return apiRequest('PUT', `/vouchers/${voucherId}`, {
    body: updateData,
  });
}
