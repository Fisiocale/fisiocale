import { Patient, Appointment, Transaction, TransactionType, Service, Professional, Invoice, WaitlistItem, FinancialCategory, AppointmentTypeConfig, AppointmentStatusConfig, CompanySettings } from '../types';
import { supabase } from './supabaseClient';

// Mock Data Generators
const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_PATIENTS: Patient[] = [];
const INITIAL_APPOINTMENT_TYPES: AppointmentTypeConfig[] = [];
// ... other initials can be emptied out eventually, but keep them as fallback if you want
const INITIAL_APPOINTMENT_STATUSES: AppointmentStatusConfig[] = [
  { id: 'as1', name: 'Agendado', color: '#3b82f6' },
  { id: 'as2', name: 'Realizado', color: '#10b981' },
  { id: 'as3', name: 'Cancelado', color: '#ef4444' },
  { id: 'as4', name: 'Faltou', color: '#991b1b' },
];
const INITIAL_APPOINTMENTS: Appointment[] = [];
const INITIAL_TRANSACTIONS: Transaction[] = [];
const INITIAL_SERVICES: Service[] = [];
const INITIAL_PROFESSIONALS: Professional[] = [];
const INITIAL_WAITLIST: WaitlistItem[] = [];
const INITIAL_CATEGORIES: FinancialCategory[] = [];

// Helper to push to Supabase asynchronously without blocking UI
const pushToSupabase = async (table: string, data: any) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;
  
  try {
    const payload = { ...data, user_id: session.user.id };
    await supabase.from(table).upsert(payload);
  } catch (err) {
    console.error(`Failed to sync ${table} to Supabase:`, err);
  }
};

const deleteFromSupabase = async (table: string, id: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;
  
  try {
    await supabase.from(table).delete().eq('id', id).eq('user_id', session.user.id);
  } catch (err) {
    console.error(`Failed to delete ${table} from Supabase:`, err);
  }
};

export const StorageService = {
  // --- Sync System ---
  syncFromSupabase: async (userId: string) => {
    try {
      // Patients
      const { data: patients } = await supabase.from('patients').select('*').eq('user_id', userId);
      if (patients) localStorage.setItem('patients', JSON.stringify(patients));

      // Appointments
      const { data: appointments } = await supabase.from('appointments').select('*').eq('user_id', userId);
      if (appointments) localStorage.setItem('appointments', JSON.stringify(appointments));

      // Transactions
      const { data: transactions } = await supabase.from('transactions').select('*').eq('user_id', userId);
      if (transactions) localStorage.setItem('transactions', JSON.stringify(transactions));

      // Services
      const { data: services } = await supabase.from('services').select('*').eq('user_id', userId);
      if (services) localStorage.setItem('services', JSON.stringify(services));

      // Professionals
      const { data: professionals } = await supabase.from('professionals').select('*').eq('user_id', userId);
      if (professionals) localStorage.setItem('professionals', JSON.stringify(professionals));

      // Waitlist
      const { data: waitlist } = await supabase.from('waitlist').select('*').eq('user_id', userId);
      if (waitlist) localStorage.setItem('waitlist', JSON.stringify(waitlist));

      // Categories
      const { data: categories } = await supabase.from('categories').select('*').eq('user_id', userId);
      if (categories) localStorage.setItem('financial_categories', JSON.stringify(categories));

      // Appointment Types
      const { data: apptTypes } = await supabase.from('appointment_types').select('*').eq('user_id', userId);
      if (apptTypes) localStorage.setItem('appointment_types', JSON.stringify(apptTypes));

      // Appointment Statuses
      const { data: apptStatuses } = await supabase.from('appointment_statuses').select('*').eq('user_id', userId);
      if (apptStatuses) localStorage.setItem('appointment_statuses', JSON.stringify(apptStatuses));

      // Company Settings (pk is user_id)
      const { data: companySettings } = await supabase.from('company_settings').select('*').eq('user_id', userId).single();
      if (companySettings) localStorage.setItem('companySettings', JSON.stringify(companySettings));
      
      // Dispatch event so components can refresh
      window.dispatchEvent(new Event('supabase_sync_complete'));
    } catch (err) {
      console.error('Error syncing from Supabase:', err);
    }
  },

  // --- Company Settings ---
  getCompanySettings: (): CompanySettings => {
    const data = localStorage.getItem('companySettings');
    return data ? JSON.parse(data) : { name: 'fisiocale', slogan: 'Software Cloud para Fisios', logoUrl: '' };
  },
  saveCompanySettings: (settings: CompanySettings) => {
    localStorage.setItem('companySettings', JSON.stringify(settings));
    pushToSupabase('company_settings', settings);
  },

  // --- Patients ---
  getPatients: (): Patient[] => {
    const data = localStorage.getItem('patients');
    return data ? JSON.parse(data) : [...INITIAL_PATIENTS];
  },

  savePatient: (patient: Patient): Patient => {
    const patients = StorageService.getPatients();
    const index = patients.findIndex(p => p.id === patient.id);
    let savedPatient = { ...patient };
    if (index >= 0) {
      patients[index] = savedPatient;
    } else {
      savedPatient = { 
        ...patient, 
        id: patient.id || generateId(), 
        createdAt: patient.createdAt || new Date().toISOString() 
      };
      patients.push(savedPatient);
    }
    localStorage.setItem('patients', JSON.stringify(patients));
    pushToSupabase('patients', savedPatient);
    return savedPatient;
  },

  // --- Appointments ---
  getAppointments: (): Appointment[] => {
    const data = localStorage.getItem('appointments');
    return data ? JSON.parse(data) : [...INITIAL_APPOINTMENTS];
  },

  saveAppointment: (appointment: Appointment) => {
    const apps = StorageService.getAppointments();
    const apptId = appointment.id || generateId();
    const finalAppointment = { ...appointment, id: apptId };

    const index = apps.findIndex(a => a.id === apptId);
    if (index >= 0) {
      apps[index] = finalAppointment;
    } else {
      apps.push(finalAppointment);
    }
    localStorage.setItem('appointments', JSON.stringify(apps));
    pushToSupabase('appointments', finalAppointment);

    // Handle Transaction Logic based on status
    const isCancelled = finalAppointment.status?.toLowerCase() === 'cancelado';
    const trans = StorageService.getTransactions();
    const existingTransIndex = trans.findIndex(t => t.appointmentId === apptId);

    if (isCancelled) {
      // Remove transaction if exists
      if (existingTransIndex >= 0) {
        StorageService.deleteTransaction(trans[existingTransIndex].id);
      }
    } else {
      // Add or update transaction
      const transData = {
        description: finalAppointment.type,
        amount: finalAppointment.price,
        type: TransactionType.INCOME,
        date: finalAppointment.date,
        category: 'Atendimentos',
        patientId: finalAppointment.patientId,
        appointmentId: apptId
      };
      
      if (existingTransIndex >= 0) {
        StorageService.saveTransaction({
          ...trans[existingTransIndex],
          ...transData
        });
      } else {
        StorageService.saveTransaction({
          id: generateId(),
          ...transData
        });
      }
    }
  },

  deleteAppointment: (id: string) => {
    const apps = StorageService.getAppointments().filter(a => a.id !== id);
    localStorage.setItem('appointments', JSON.stringify(apps));
    deleteFromSupabase('appointments', id);
    
    // Also delete associated transaction
    const trans = StorageService.getTransactions();
    const existingTrans = trans.find(t => t.appointmentId === id);
    if (existingTrans) {
      StorageService.deleteTransaction(existingTrans.id);
    }
  },

  // --- Transactions ---
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem('transactions');
    return data ? JSON.parse(data) : [...INITIAL_TRANSACTIONS];
  },

  saveTransaction: (transaction: Transaction) => {
    const trans = StorageService.getTransactions();
    const index = trans.findIndex(t => t.id === transaction.id);
    if (index >= 0) {
      trans[index] = transaction;
    } else {
      trans.push({ ...transaction, id: transaction.id || generateId() });
    }
    localStorage.setItem('transactions', JSON.stringify(trans));
    pushToSupabase('transactions', transaction);
  },

  deleteTransaction: (id: string) => {
    const trans = StorageService.getTransactions().filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(trans));
    deleteFromSupabase('transactions', id);
  },

  // --- Services ---
  getServices: (): Service[] => {
    const data = localStorage.getItem('services');
    return data ? JSON.parse(data) : [...INITIAL_SERVICES];
  },

  saveService: (service: Service) => {
    const items = StorageService.getServices();
    const index = items.findIndex(s => s.id === service.id);
    if (index >= 0) {
      items[index] = service;
    } else {
      items.push({ ...service, id: service.id || generateId() });
    }
    localStorage.setItem('services', JSON.stringify(items));
    pushToSupabase('services', service);
  },

  deleteService: (id: string) => {
    const items = StorageService.getServices().filter(s => s.id !== id);
    localStorage.setItem('services', JSON.stringify(items));
    deleteFromSupabase('services', id);
  },

  // --- Professionals ---
  getProfessionals: (): Professional[] => {
    const data = localStorage.getItem('professionals');
    return data ? JSON.parse(data) : [...INITIAL_PROFESSIONALS];
  },

  saveProfessional: (professional: Professional) => {
    const items = StorageService.getProfessionals();
    const index = items.findIndex(p => p.id === professional.id);
    if (index >= 0) {
      items[index] = professional;
    } else {
      items.push({ ...professional, id: professional.id || generateId() });
    }
    localStorage.setItem('professionals', JSON.stringify(items));
    pushToSupabase('professionals', professional);
  },

  deleteProfessional: (id: string) => {
    const items = StorageService.getProfessionals().filter(p => p.id !== id);
    localStorage.setItem('professionals', JSON.stringify(items));
    deleteFromSupabase('professionals', id);
  },
  
  // --- Waitlist ---
  getWaitlist: (): WaitlistItem[] => {
    const data = localStorage.getItem('waitlist');
    return data ? JSON.parse(data) : [...INITIAL_WAITLIST];
  },

  saveWaitlistItem: (item: WaitlistItem) => {
    const items = StorageService.getWaitlist();
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push({ ...item, id: item.id || generateId() });
    }
    localStorage.setItem('waitlist', JSON.stringify(items));
    pushToSupabase('waitlist', item);
  },

  deleteWaitlistItem: (id: string) => {
    const items = StorageService.getWaitlist().filter(i => i.id !== id);
    localStorage.setItem('waitlist', JSON.stringify(items));
    deleteFromSupabase('waitlist', id);
  },

  // --- Invoices ---
  getInvoices: (): Invoice[] => {
    const data = localStorage.getItem('invoices');
    return data ? JSON.parse(data) : [];
  },

  saveInvoice: (invoice: Invoice) => {
    const items = StorageService.getInvoices();
    const index = items.findIndex(i => i.id === invoice.id);
    if (index >= 0) {
      items[index] = invoice;
    } else {
      items.push({ ...invoice, id: invoice.id || generateId() });
    }
    localStorage.setItem('invoices', JSON.stringify(items));
    pushToSupabase('invoices', invoice);
  },

  // --- Financial Categories ---
  getCategories: (): FinancialCategory[] => {
    const data = localStorage.getItem('financial_categories');
    return data ? JSON.parse(data) : [...INITIAL_CATEGORIES];
  },

  saveCategory: (category: FinancialCategory) => {
    const items = StorageService.getCategories();
    const index = items.findIndex(c => c.id === category.id);
    if (index >= 0) {
      items[index] = category;
    } else {
      items.push({ ...category, id: category.id || generateId() });
    }
    localStorage.setItem('financial_categories', JSON.stringify(items));
    pushToSupabase('categories', category);
  },

  deleteCategory: (id: string) => {
    const items = StorageService.getCategories().filter(c => c.id !== id);
    localStorage.setItem('financial_categories', JSON.stringify(items));
    deleteFromSupabase('categories', id);
  },

  // --- Appointment Types ---
  getAppointmentTypes: (): AppointmentTypeConfig[] => {
    const data = localStorage.getItem('appointment_types');
    return data ? JSON.parse(data) : [...INITIAL_APPOINTMENT_TYPES];
  },

  saveAppointmentType: (type: AppointmentTypeConfig) => {
    const items = StorageService.getAppointmentTypes();
    const index = items.findIndex(t => t.id === type.id);
    if (index >= 0) {
      items[index] = type;
    } else {
      items.push({ ...type, id: type.id || generateId() });
    }
    localStorage.setItem('appointment_types', JSON.stringify(items));
    pushToSupabase('appointment_types', type);
  },

  deleteAppointmentType: (id: string) => {
    const items = StorageService.getAppointmentTypes().filter(t => t.id !== id);
    localStorage.setItem('appointment_types', JSON.stringify(items));
    deleteFromSupabase('appointment_types', id);
  },

  // --- Appointment Statuses ---
  getAppointmentStatuses: (): AppointmentStatusConfig[] => {
    const data = localStorage.getItem('appointment_statuses');
    return data ? JSON.parse(data) : [...INITIAL_APPOINTMENT_STATUSES];
  },

  saveAppointmentStatus: (status: AppointmentStatusConfig) => {
    const items = StorageService.getAppointmentStatuses();
    const index = items.findIndex(s => s.id === status.id);
    if (index >= 0) {
      items[index] = status;
    } else {
      items.push({ ...status, id: status.id || generateId() });
    }
    localStorage.setItem('appointment_statuses', JSON.stringify(items));
    pushToSupabase('appointment_statuses', status);
  },

  deleteAppointmentStatus: (id: string) => {
    const items = StorageService.getAppointmentStatuses().filter(s => s.id !== id);
    localStorage.setItem('appointment_statuses', JSON.stringify(items));
    deleteFromSupabase('appointment_statuses', id);
  }
};
