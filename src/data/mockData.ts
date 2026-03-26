import { Building, Apartment, Tenant, Contract, Invoice, User, Notification, NotificationSettings, MaintenanceRequest, Expense, SystemSettings } from '../types';
import { addDays, subDays, format, subMonths } from 'date-fns';

export const currentUser: User = {
  id: 'u1',
  name: 'منصور العبداللطيف',
  role: 'owner',
  email: 'abdelatty.mansour1980@gmail.com'
};

export const buildings: Building[] = [
  { id: 'b1', name: 'عمارة الياسمين', address: 'حي الياسمين، الرياض', floors: 4, apartmentsPerFloor: 4 },
  { id: 'b2', name: 'برج العليا', address: 'شارع العليا، الرياض', floors: 6, apartmentsPerFloor: 2 },
];

export const apartments: Apartment[] = [
  // Building 1, Floor 1
  { id: 'a1', buildingId: 'b1', floorNumber: 1, apartmentNumber: '101', status: 'occupied', price: 35000, tenantId: 't1' },
  { id: 'a2', buildingId: 'b1', floorNumber: 1, apartmentNumber: '102', status: 'available', price: 35000 },
  { id: 'a3', buildingId: 'b1', floorNumber: 1, apartmentNumber: '103', status: 'occupied', price: 35000, tenantId: 't2' },
  { id: 'a4', buildingId: 'b1', floorNumber: 1, apartmentNumber: '104', status: 'maintenance', price: 35000 },
  // Building 1, Floor 2
  { id: 'a5', buildingId: 'b1', floorNumber: 2, apartmentNumber: '201', status: 'available', price: 36000 },
  { id: 'a6', buildingId: 'b1', floorNumber: 2, apartmentNumber: '202', status: 'occupied', price: 36000, tenantId: 't3' },
  { id: 'a7', buildingId: 'b1', floorNumber: 2, apartmentNumber: '203', status: 'available', price: 36000 },
  { id: 'a8', buildingId: 'b1', floorNumber: 2, apartmentNumber: '204', status: 'available', price: 36000 },
  // Building 2, Floor 1
  { id: 'a9', buildingId: 'b2', floorNumber: 1, apartmentNumber: '11', status: 'occupied', price: 55000, tenantId: 't4' },
  { id: 'a10', buildingId: 'b2', floorNumber: 1, apartmentNumber: '12', status: 'occupied', price: 55000, tenantId: 't5' },
];

export const tenants: Tenant[] = [
  { id: 't1', name: 'أحمد عبدالله', phone: '0501234567', idNumber: '1000000001', email: 'ahmed@example.com' },
  { id: 't2', name: 'محمد خالد', phone: '0559876543', idNumber: '1000000002', email: 'mohammed@example.com' },
  { id: 't3', name: 'سارة فهد', phone: '0541112223', idNumber: '1000000003', email: 'sarah@example.com' },
  { id: 't4', name: 'شركة التقنية الحديثة', phone: '0112345678', idNumber: '7000000001', email: 'info@tech.com' },
  { id: 't5', name: 'عمر عبدالرحمن', phone: '0567778889', idNumber: '1000000004', email: 'omar@example.com' },
];

const today = new Date();

export const contracts: Contract[] = [
  { id: 'c1', apartmentId: 'a1', tenantId: 't1', startDate: '2023-01-01', endDate: format(addDays(today, 15), 'yyyy-MM-dd'), annualRent: 35000, paymentFrequency: 'semi-annually', status: 'active', renewalReminderDays: 30 },
  { id: 'c2', apartmentId: 'a3', tenantId: 't2', startDate: '2023-06-01', endDate: format(addDays(today, 60), 'yyyy-MM-dd'), annualRent: 35000, paymentFrequency: 'monthly', status: 'active', renewalReminderDays: 30 },
  { id: 'c3', apartmentId: 'a6', tenantId: 't3', startDate: '2023-09-01', endDate: format(addDays(today, 120), 'yyyy-MM-dd'), annualRent: 36000, paymentFrequency: 'quarterly', status: 'active', renewalReminderDays: 30 },
  { id: 'c4', apartmentId: 'a9', tenantId: 't4', startDate: '2022-02-01', endDate: format(subDays(today, 10), 'yyyy-MM-dd'), annualRent: 55000, paymentFrequency: 'annually', status: 'expired' },
  { id: 'c5', apartmentId: 'a10', tenantId: 't5', startDate: '2023-11-01', endDate: format(addDays(today, 200), 'yyyy-MM-dd'), annualRent: 55000, paymentFrequency: 'semi-annually', status: 'active', renewalReminderDays: 30 },
];

export const invoices: Invoice[] = [
  { id: 'inv1', contractId: 'c1', amount: 17500, dueDate: format(subDays(today, 10), 'yyyy-MM-dd'), status: 'overdue', description: 'إيجار النصف الثاني' },
  { id: 'inv2', contractId: 'c2', amount: 2916.67, dueDate: format(addDays(today, 5), 'yyyy-MM-dd'), status: 'unpaid', description: 'إيجار شهر أكتوبر' },
  { id: 'inv3', contractId: 'c3', amount: 9000, dueDate: format(subDays(today, 30), 'yyyy-MM-dd'), status: 'paid', description: 'إيجار الربع الأول' },
  { id: 'inv4', contractId: 'c4', amount: 55000, dueDate: format(addDays(today, 60), 'yyyy-MM-dd'), status: 'unpaid', description: 'إيجار السنة الثانية' },
  { id: 'inv5', contractId: 'c5', amount: 27500, dueDate: format(subDays(today, 2), 'yyyy-MM-dd'), status: 'overdue', description: 'إيجار النصف الأول' },
];

export const notifications: Notification[] = [
  { id: 'n1', type: 'contract_expiry', title: 'عقد قارب على الانتهاء', message: 'عقد شقة 101 ينتهي خلال 15 يوماً.', date: format(today, 'yyyy-MM-dd'), isRead: false, relatedId: 'c1' },
  { id: 'n2', type: 'rent_due', title: 'موعد استحقاق إيجار', message: 'فاتورة شقة 103 مستحقة خلال 5 أيام.', date: format(today, 'yyyy-MM-dd'), isRead: false, relatedId: 'inv2' },
  { id: 'n3', type: 'maintenance', title: 'طلب صيانة جديد', message: 'تم تقديم طلب صيانة سباكة في شقة 104.', date: format(subDays(today, 1), 'yyyy-MM-dd'), isRead: true },
];

export const maintenanceRequests: MaintenanceRequest[] = [
  { id: 'm1', apartmentId: 'a4', title: 'تسريب مياه', description: 'تسريب في حمام الشقة الرئيسية', status: 'pending', priority: 'high', date: format(subDays(today, 2), 'yyyy-MM-dd') },
  { id: 'm2', apartmentId: 'a1', title: 'إصلاح تكييف', description: 'التكييف لا يبرد بشكل جيد', status: 'in_progress', priority: 'medium', date: format(subDays(today, 5), 'yyyy-MM-dd') },
  { id: 'm3', apartmentId: 'a6', title: 'كهرباء', description: 'تغيير مفاتيح الإضاءة', status: 'completed', priority: 'low', cost: 150, date: format(subDays(today, 15), 'yyyy-MM-dd') },
];

export const expenses: Expense[] = [
  { id: 'e1', category: 'maintenance', amount: 150, date: format(subDays(today, 15), 'yyyy-MM-dd'), description: 'تغيير مفاتيح إضاءة شقة 202', relatedId: 'm3', buildingId: 'b1', apartmentId: 'a6' },
  { id: 'e2', category: 'utilities', amount: 1200, date: format(subDays(today, 20), 'yyyy-MM-dd'), description: 'فاتورة كهرباء عمارة الياسمين', buildingId: 'b1' },
  { id: 'e3', category: 'salaries', amount: 5000, date: format(subDays(today, 25), 'yyyy-MM-dd'), description: 'راتب حارس عمارة الياسمين', buildingId: 'b1' },
];

export const systemSettings: SystemSettings = {
  companyName: 'مؤسسة منصور العقارية',
  vatNumber: '300012345600003',
  vatRate: 15,
  currency: 'SAR'
};

export const defaultNotificationSettings: NotificationSettings = {
  contractExpiry: true,
  rentDue: true,
  maintenance: true,
  expiryReminderDays: 30
};
