// Use the address the POS was opened from. This lets a phone on the same Wi-Fi
// reach the API running on the computer instead of trying to use the phone's
// own localhost. Set VITE_API_URL when the API is hosted elsewhere.
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
  || `${window.location.protocol}//${window.location.hostname}:3001/api`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CustomerRecord {
  id: number;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export interface MenuItemRecord {
  id: number;
  name: string;
  marathiName: string;
  price: number;
  category: string;
  image: string;
  imageCrop: string;
}

export interface CreateBillPayload {
  billNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerId?: number;      // if a stored customer was selected
  subtotal: number;
  discount: number;
  total: number;
  sendEmail: boolean;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface BillResponse {
  id: number;
  billNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  subtotal: number;
  discount: number;
  total: number;
  emailSent: boolean;
  createdAt: string;
  items: Array<{
    id: number;
    itemName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export interface DailyReportResponse {
  date: string;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalDiscount: number;
    averageOrderValue: number;
  };
  topItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  hourlyBreakdown: Array<{
    hour: number;
    orders: number;
    revenue: number;
  }>;
  bills: Array<{
    id: number;
    billNumber: string;
    customerName: string;
    customerPhone: string;
    total: number;
    createdAt: string;
  }>;
}

export interface SummaryReportResponse {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  dailyRevenue: Array<{ date: string; revenue: number }>;
}

// ─── API Functions ────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// Create a new bill (optionally sends email)
export async function createBill(payload: CreateBillPayload): Promise<BillResponse> {
  return apiFetch<BillResponse>('/bills', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Re-send email for an existing bill
export async function sendBillEmail(billId: number): Promise<{ success: boolean; message: string }> {
  return apiFetch(`/bills/${billId}/send-email`, { method: 'POST' });
}

// Get all bills
export async function getBills(): Promise<BillResponse[]> {
  return apiFetch<BillResponse[]>('/bills');
}

export async function getMenuItems(): Promise<MenuItemRecord[]> {
  return apiFetch<MenuItemRecord[]>('/menu-items');
}

export async function createMenuItem(data: Omit<MenuItemRecord, 'id'>): Promise<MenuItemRecord> {
  return apiFetch<MenuItemRecord>('/menu-items', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateMenuItem(id: number, data: Omit<MenuItemRecord, 'id'>): Promise<MenuItemRecord> {
  return apiFetch<MenuItemRecord>(`/menu-items/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteMenuItem(id: number): Promise<void> {
  return apiFetch(`/menu-items/${id}`, { method: 'DELETE' });
}

// Get daily report
export async function getDailyReport(date?: string): Promise<DailyReportResponse> {
  const query = date ? `?date=${date}` : '';
  return apiFetch<DailyReportResponse>(`/reports/daily${query}`);
}

// Get 30-day summary
export async function getSummaryReport(): Promise<SummaryReportResponse> {
  return apiFetch<SummaryReportResponse>('/reports/summary');
}

// ─── Customer API ─────────────────────────────────────────────────────────────

// Search / list customers
export async function getCustomers(query?: string): Promise<CustomerRecord[]> {
  const q = query ? `?q=${encodeURIComponent(query)}` : '';
  return apiFetch<CustomerRecord[]>(`/customers${q}`);
}

// Create a new stored customer
export async function createCustomer(data: {
  name: string;
  phone: string;
  email?: string;
}): Promise<CustomerRecord> {
  return apiFetch<CustomerRecord>('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Update an existing customer
export async function updateCustomer(
  id: number,
  data: Partial<{ name: string; phone: string; email: string }>
): Promise<CustomerRecord> {
  return apiFetch<CustomerRecord>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Delete a customer
export async function deleteCustomer(id: number): Promise<void> {
  return apiFetch(`/customers/${id}`, { method: 'DELETE' });
}
