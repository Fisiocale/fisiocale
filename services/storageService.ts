import { Patient, Appointment, Transaction, TransactionType, Service, Professional, Invoice, WaitlistItem, FinancialCategory, AppointmentTypeConfig, AppointmentStatusConfig, CompanySettings } from '../types';
import { supabase } from './supabaseClient';

// Mock Data Generators
const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_PATIENTS: Patient[] = [
  { id: 'p1', name: 'Ana Silva', email: 'ana@example.com', phone: '11999999999', birthDate: '1990-05-15', createdAt: '2023-01-10', status: 'Ativo' },
  { id: 'p2', name: 'Carlos Oliveira', email: 'carlos@example.com', phone: '11988888888', birthDate: '1985-10-20', createdAt: '2023-02-15', status: 'Ativo' },
  { id: 'p3', name: 'Maria Souza', email: 'maria@example.com', phone: '11977777777', birthDate: '1995-03-08', createdAt: '2023-03-01', status: 'Inativo' },
];

const INITIAL_APPOINTMENT_TYPES: AppointmentTypeConfig[] = [
  { id: 'at1', name: 'Tasks', color: '#e06666' },
  { id: 'at2', name: 'Atendimentos', color: '#6fa8dc' },
  { id: 'at3', name: 'Atendimentos Filantropia', color: '#f6b26b' },
  { id: 'at4', name: 'Atendimentos Fixos', color: '#4a86e8' },
  { id: 'at5', name: 'Atendimentos Luciana', color: '#8e7cc3' },
  { id: 'at6', name: 'Cancelado', color: '#cc0000' },
  { id: 'at7', name: 'Reuniões e Adm', color: '#f1c232' },
  { id: 'at8', name: 'Sedila Pessoal', color: '#93c47d' },
  { id: 'at9', name: 'Atendimento João', color: '#3f51b5' },
];
// ... other initials can be emptied out eventually, but keep them as fallback if you want
const INITIAL_APPOINTMENT_STATUSES: AppointmentStatusConfig[] = [
  { id: 'as1', name: 'Agendado', color: '#3b82f6' },
  { id: 'as2', name: 'Realizado', color: '#10b981' },
  { id: 'as3', name: 'Cancelado', color: '#ef4444' },
  { id: 'as4', name: 'Faltou', color: '#991b1b' },
];
const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 'a1', patientId: 'p1', date: '2026-04-13', time: '09:00', type: 'Avaliação', notes: 'Queixa de dores lombares.', price: 200, status: 'Realizado' },
  { id: 'a2', patientId: 'p1', date: '2026-04-14', time: '14:30', type: 'Acompanhamento', notes: 'Melhora parcial.', price: 150, status: 'Realizado' },
  { id: 'a3', patientId: 'p2', date: '2026-04-15', time: '10:00', type: 'Consulta', notes: 'Check-up geral.', price: 250, status: 'Realizado' },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', description: 'Aluguel Consultório', amount: 1500, type: TransactionType.EXPENSE, date: '2023-10-05', category: 'Fixo' },
  { id: 't2', description: 'Material de Escritório', amount: 200, type: TransactionType.EXPENSE, date: '2023-10-10', category: 'Variável' },
  { id: 't3', description: 'Consultoria Externa', amount: 500, type: TransactionType.INCOME, date: '2023-10-12', category: 'Serviços' },
];

const INITIAL_SERVICES: Service[] = [
  { id: 's1', name: 'Consulta Médica', description: 'Atendimento clínico geral', price: 250, duration: 30 },
  { id: 's2', name: 'Avaliação Fisioterapêutica', description: 'Análise inicial e diagnóstico funcional', price: 200, duration: 60 },
  { id: 's3', name: 'Sessão de Fisioterapia', description: 'Reabilitação e tratamento', price: 150, duration: 45 },
];

const INITIAL_PROFESSIONALS: Professional[] = [
  { id: 'prof1', name: 'Dr. Roberto Santos', specialty: 'Ortopedista', email: 'roberto@clinic.com', phone: '11911111111', registrationNumber: 'CRM 123456', color: '#0ea5e9' },
  { id: 'prof2', name: 'Dra. Camila Lima', specialty: 'Fisioterapeuta', email: 'camila@clinic.com', phone: '11922222222', registrationNumber: 'CREFITO 98765', color: '#8b5cf6' },
];

const INITIAL_WAITLIST: WaitlistItem[] = [
  { id: 'w1', patientId: 'p1', type: 'Consulta', createdAt: '2023-10-20' },
  { id: 'w2', patientId: 'p2', type: 'Acompanhamento', createdAt: '2023-10-21' }
];

const INITIAL_CATEGORIES: FinancialCategory[] = [
  { id: 'c1', name: 'Atendimentos', type: TransactionType.INCOME },
  { id: 'c2', name: 'Serviços', type: TransactionType.INCOME },
  // Fixas RH
  { id: 'c_rh_1', name: 'Fixas RH - Adiantamento', type: TransactionType.EXPENSE },
  { id: 'c_rh_2', name: 'Fixas RH - Contabilidade Castro', type: TransactionType.EXPENSE },
  { id: 'c_rh_3', name: 'Fixas RH - D. Fátima - diárias', type: TransactionType.EXPENSE },
  { id: 'c_rh_4', name: 'Fixas RH - Honorários João', type: TransactionType.EXPENSE },
  { id: 'c_rh_5', name: 'Fixas RH - Pró-labore - Sedila', type: TransactionType.EXPENSE },
  { id: 'c_rh_6', name: 'Fixas RH - Salário Poliana', type: TransactionType.EXPENSE },
  { id: 'c_rh_7', name: 'Fixas RH - Honorários Carol', type: TransactionType.EXPENSE },
  // Fixas Estrutural
  { id: 'c_est_1', name: 'Fixas Estrutural - Aluguel', type: TransactionType.EXPENSE },
  { id: 'c_est_2', name: 'Fixas Estrutural - Condomínio', type: TransactionType.EXPENSE },
  { id: 'c_est_3', name: 'Fixas Estrutural - Enel', type: TransactionType.EXPENSE },
  { id: 'c_est_4', name: 'Fixas Estrutural - IPTU', type: TransactionType.EXPENSE },
  { id: 'c_est_5', name: 'Fixas Estrutural - Seguros', type: TransactionType.EXPENSE },
  { id: 'c_est_6', name: 'Fixas Estrutural - Sistemas', type: TransactionType.EXPENSE },
  { id: 'c_est_7', name: 'Fixas Estrutural - Telefone/ Internet', type: TransactionType.EXPENSE },
  // Fixas Impostos
  { id: 'c_imp_1', name: 'Fixas Impostos - INSS', type: TransactionType.EXPENSE },
  { id: 'c_imp_2', name: 'Fixas Impostos - IRPF', type: TransactionType.EXPENSE },
  { id: 'c_imp_3', name: 'Fixas Impostos - Receita Federal - IRPF e INSS', type: TransactionType.EXPENSE },
  { id: 'c_imp_4', name: 'Fixas Impostos - Simples Nacional', type: TransactionType.EXPENSE },
  // V. Cotidiano
  { id: 'c_cot_1', name: 'V. Cotidiano - Ambiente/ cheirinhos', type: TransactionType.EXPENSE },
  { id: 'c_cot_2', name: 'V. Cotidiano - Biscoitos e frutas secas', type: TransactionType.EXPENSE },
  { id: 'c_cot_3', name: 'V. Cotidiano - Brindes eventos', type: TransactionType.EXPENSE },
  { id: 'c_cot_4', name: 'V. Cotidiano - Café cápsulas', type: TransactionType.EXPENSE },
  { id: 'c_cot_5', name: 'V. Cotidiano - Chá cápsulas', type: TransactionType.EXPENSE },
  { id: 'c_cot_6', name: 'V. Cotidiano - Decoração', type: TransactionType.EXPENSE },
  { id: 'c_cot_7', name: 'V. Cotidiano - Equipamentos manutenção', type: TransactionType.EXPENSE },
  { id: 'c_cot_8', name: 'V. Cotidiano - Equipamentos novos', type: TransactionType.EXPENSE },
  { id: 'c_cot_9', name: 'V. Cotidiano - Estacionamento', type: TransactionType.EXPENSE },
  { id: 'c_cot_10', name: 'V. Cotidiano - Higiene/ Lavabo', type: TransactionType.EXPENSE },
  { id: 'c_cot_11', name: 'V. Cotidiano - Manutenções estrutural', type: TransactionType.EXPENSE },
  { id: 'c_cot_12', name: 'V. Cotidiano - Material de Escritório', type: TransactionType.EXPENSE },
  { id: 'c_cot_13', name: 'V. Cotidiano - Material de limpeza', type: TransactionType.EXPENSE },
  { id: 'c_cot_14', name: 'V. Cotidiano - Mesa café - outros', type: TransactionType.EXPENSE },
  { id: 'c_cot_15', name: 'V. Cotidiano - Mimos pacientes', type: TransactionType.EXPENSE },
  { id: 'c_cot_16', name: 'V. Cotidiano - Papel de maca', type: TransactionType.EXPENSE },
  { id: 'c_cot_17', name: 'V. Cotidiano - Sala de evento', type: TransactionType.EXPENSE },
  // V. Cursos Técnicos
  { id: 'c_cur_1', name: 'V. Cursos Técnicos - Congresso', type: TransactionType.EXPENSE },
  { id: 'c_cur_2', name: 'V. Cursos Técnicos - Curso', type: TransactionType.EXPENSE },
  { id: 'c_cur_3', name: 'V. Cursos Técnicos - Eventos', type: TransactionType.EXPENSE },
  { id: 'c_cur_4', name: 'V. Cursos Técnicos - Mentoria', type: TransactionType.EXPENSE },
  // V. Marketing
  { id: 'c_mkt_1', name: 'V. Marketing - Eletromídia', type: TransactionType.EXPENSE },
  { id: 'c_mkt_2', name: 'V. Marketing - Eventos Fisiocale', type: TransactionType.EXPENSE },
  { id: 'c_mkt_3', name: 'V. Marketing - Google', type: TransactionType.EXPENSE },
  { id: 'c_mkt_4', name: 'V. Marketing - Instagram', type: TransactionType.EXPENSE },
  { id: 'c_mkt_5', name: 'V. Marketing - Networking almoço/ café', type: TransactionType.EXPENSE },
  // V. Funcionários
  { id: 'c_fun_1', name: 'V. Funcionários - Almoço', type: TransactionType.EXPENSE },
  { id: 'c_fun_2', name: 'V. Funcionários - Gratificações funcionários', type: TransactionType.EXPENSE },
  { id: 'c_fun_3', name: 'V. Funcionários - Reunião Fora', type: TransactionType.EXPENSE },
  // V. Impostos Taxas
  { id: 'c_tax_1', name: 'V. Impostos Taxas - Crefito', type: TransactionType.EXPENSE },
  { id: 'c_tax_2', name: 'V. Impostos Taxas - Domínio/sítio web', type: TransactionType.EXPENSE },
  { id: 'c_tax_3', name: 'V. Impostos Taxas - Juros', type: TransactionType.EXPENSE },
  { id: 'c_tax_4', name: 'V. Impostos Taxas - Taxa de funcionamento de estabelecimento', type: TransactionType.EXPENSE },
  { id: 'c_tax_5', name: 'V. Impostos Taxas - Taxas Bancárias', type: TransactionType.EXPENSE },
  { id: 'c_tax_6', name: 'V. Impostos Taxas - Taxas da Maquininha', type: TransactionType.EXPENSE },
  { id: 'c_tax_7', name: 'V. Impostos Taxas - Taxas diversas', type: TransactionType.EXPENSE },
];

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
