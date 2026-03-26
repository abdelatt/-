export type UserRole = 'owner' | 'manager' | 'accountant';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export type ApartmentStatus = 'available' | 'occupied' | 'maintenance';

export interface Apartment {
  id: string;
  buildingId: string;
  floorNumber: number;
  apartmentNumber: string;
  status: ApartmentStatus;
  price: number;
  tenantId?: string;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  floors: number;
  apartmentsPerFloor: number;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  idNumber: string;
  email?: string;
}

export interface Contract {
  id: string;
  apartmentId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  annualRent: number;
  paymentFrequency: 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
  status: 'active' | 'expired' | 'terminated';
  renewalReminderDays?: number;
}

export type NotificationType = 'contract_expiry' | 'rent_due' | 'maintenance' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  relatedId?: string; // e.g., contractId or invoiceId
}

export interface NotificationSettings {
  contractExpiry: boolean;
  rentDue: boolean;
  maintenance: boolean;
  expiryReminderDays: number;
}

export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue';

export interface Invoice {
  id: string;
  contractId: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  description: string;
}

export interface MaintenanceRequest {
  id: string;
  apartmentId: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  cost?: number;
  date: string;
}

export interface Expense {
  id: string;
  category: 'maintenance' | 'utilities' | 'salaries' | 'other';
  amount: number;
  date: string;
  description: string;
  relatedId?: string; // e.g., maintenanceRequestId
  buildingId?: string;
  apartmentId?: string;
}

export interface SystemSettings {
  companyName: string;
  vatNumber: string;
  vatRate: number;
  currency: string;
}
