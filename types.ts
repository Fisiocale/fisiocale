
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
}

export interface AppointmentTypeConfig {
  id: string;
  name: string;
  color?: string;
}

export interface AppointmentStatusConfig {
  id: string;
  name: string;
  color?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  professionalId?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: string;
  serviceId?: string;
  notes: string;
  price: number;
  status?: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  cpf?: string;
  profession?: string;
  attendingPhysician?: string;
  indications?: string;
  createdAt: string;
  status?: string;
}

export enum TransactionType {
  INCOME = 'Entrada',
  EXPENSE = 'Saída'
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  category: string;
  patientId?: string;
  appointmentId?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutes
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  registrationNumber: string; // CRM, CREFITO, etc.
  color?: string; // Hex color code for agenda
}

export interface Invoice {
  id: string;
  transactionId: string;
  patientId: string;
  number: string;
  date: string;
  amount: number;
  status: 'Emitida' | 'Cancelada';
}

export interface WaitlistItem {
  id: string;
  patientId: string;
  type: string;
  serviceId?: string;
  createdAt: string;
  notes?: string;
}

export interface FinancialCategory {
  id: string;
  name: string;
  type: TransactionType;
}

export interface CompanySettings {
  name: string;
  slogan: string;
  logoUrl?: string;
}

export interface DashboardMetrics {
  totalPatients: number;
  activePatients: number; // Seen in last 60 days
  lostPatients: number; // Not seen in 60+ days
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  appointmentsByType: { name: string; value: number; color?: string }[];
  revenueByMonth: { name: string; income: number; expense: number }[];
}
