import {
  Patient,
  Appointment,
  Transaction,
  TransactionType,
  Service,
  Professional,
  Invoice,
  WaitlistItem,
  FinancialCategory,
  AppointmentTypeConfig,
  AppointmentStatusConfig,
  CompanySettings,
} from '../types';
import { supabase } from './supabaseClient';

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

const safeParse = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (error) {
    console.warn(`Erro ao ler ${key} do localStorage:`, error);
    return fallback;
  }
};

const removeUserId = <T extends Record<string, any>>(item: T): Omit<T, 'user_id'> => {
  const { user_id, ...cleanItem } = item;
  return cleanItem;
};

const cleanRowsForLocalStorage = <T extends Record<string, any>>(rows: T[]) => {
  return rows.map(removeUserId);
};

const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  name: 'Fisiocale',
  slogan: 'Software Cloud para Fisios',
  logoUrl: '',
};

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

const INITIAL_APPOINTMENT_STATUSES: AppointmentStatusConfig[] = [
  { id: 'as1', name: 'Agendado', color: '#3b82f6' },
  { id: 'as2', name: 'Realizado', color: '#10b981' },
  { id: 'as3', name: 'Cancelado', color: '#ef4444' },
  { id: 'as4', name: 'Faltou', color: '#991b1b' },
];

const INITIAL_SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Consulta Médica',
    description: 'Atendimento clínico geral',
    price: 250,
    duration: 30,
  },
  {
    id: 's2',
    name: 'Avaliação Fisioterapêutica',
    description: 'Análise inicial e diagnóstico funcional',
    price: 200,
    duration: 60,
  },
  {
    id: 's3',
    name: 'Sessão de Fisioterapia',
    description: 'Reabilitação e tratamento',
    price: 150,
    duration: 45,
  },
];

const INITIAL_PROFESSIONALS: Professional[] = [
  {
    id: 'prof1',
    name: 'Dr. Roberto Santos',
    specialty: 'Ortopedista',
    email: 'roberto@clinic.com',
    phone: '11911111111',
    registrationNumber: 'CRM 123456',
    color: '#0ea5e9',
  },
  {
    id: 'prof2',
    name: 'Dra. Camila Lima',
    specialty: 'Fisioterapeuta',
    email: 'camila@clinic.com',
    phone: '11922222222',
    registrationNumber: 'CREFITO 98765',
    color: '#8b5cf6',
  },
];

const INITIAL_CATEGORIES: FinancialCategory[] = [
  { id: 'c1', name: 'Atendimentos', type: TransactionType.INCOME },
  { id: 'c2', name: 'Serviços', type: TransactionType.INCOME },

  { id: 'c_rh_1', name: 'Fixas RH - Adiantamento', type: TransactionType.EXPENSE },
  { id: 'c_rh_2', name: 'Fixas RH - Contabilidade Castro', type: TransactionType.EXPENSE },
  { id: 'c_rh_3', name: 'Fixas RH - D. Fátima - diárias', type: TransactionType.EXPENSE },
  { id: 'c_rh_4', name: 'Fixas RH - Honorários João', type: TransactionType.EXPENSE },
  { id: 'c_rh_5', name: 'Fixas RH - Pró-labore - Sedila', type: TransactionType.EXPENSE },
  { id: 'c_rh_6', name: 'Fixas RH - Salário Poliana', type: TransactionType.EXPENSE },
  { id: 'c_rh_7', name: 'Fixas RH - Honorários Carol', type: TransactionType.EXPENSE },

  { id: 'c_est_1', name: 'Fixas Estrutural - Aluguel', type: TransactionType.EXPENSE },
  { id: 'c_est_2', name: 'Fixas Estrutural - Condomínio', type: TransactionType.EXPENSE },
  { id: 'c_est_3', name: 'Fixas Estrutural - Enel', type: TransactionType.EXPENSE },
  { id: 'c_est_4', name: 'Fixas Estrutural - IPTU', type: TransactionType.EXPENSE },
  { id: 'c_est_5', name: 'Fixas Estrutural - Seguros', type: TransactionType.EXPENSE },
  { id: 'c_est_6', name: 'Fixas Estrutural - Sistemas', type: TransactionType.EXPENSE },
  { id: 'c_est_7', name: 'Fixas Estrutural - Telefone/ Internet', type: TransactionType.EXPENSE },

  { id: 'c_imp_1', name: 'Fixas Impostos - INSS', type: TransactionType.EXPENSE },
  { id: 'c_imp_2', name: 'Fixas Impostos - IRPF', type: TransactionType.EXPENSE },
  { id: 'c_imp_3', name: 'Fixas Impostos - Receita Federal - IRPF e INSS', type: TransactionType.EXPENSE },
  { id: 'c_imp_4', name: 'Fixas Impostos - Simples Nacional', type: TransactionType.EXPENSE },

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

  { id: 'c_cur_1', name: 'V. Cursos Técnicos - Congresso', type: TransactionType.EXPENSE },
  { id: 'c_cur_2', name: 'V. Cursos Técnicos - Curso', type: TransactionType.EXPENSE },
  { id: 'c_cur_3', name: 'V. Cursos Técnicos - Eventos', type: TransactionType.EXPENSE },
  { id: 'c_cur_4', name: 'V. Cursos Técnicos - Mentoria', type: TransactionType.EXPENSE },

  { id: 'c_mkt_1', name: 'V. Marketing - Eletromídia', type: TransactionType.EXPENSE },
  { id: 'c_mkt_2', name: 'V. Marketing - Eventos Fisiocale', type: TransactionType.EXPENSE },
  { id: 'c_mkt_3', name: 'V. Marketing - Google', type: TransactionType.EXPENSE },
  { id: 'c_mkt_4', name: 'V. Marketing - Instagram', type: TransactionType.EXPENSE },
  { id: 'c_mkt_5', name: 'V. Marketing - Networking almoço/ café', type: TransactionType.EXPENSE },

  { id: 'c_fun_1', name: 'V. Funcionários - Almoço', type: TransactionType.EXPENSE },
  { id: 'c_fun_2', name: 'V. Funcionários - Gratificações funcionários', type: TransactionType.EXPENSE },
  { id: 'c_fun_3', name: 'V. Funcionários - Reunião Fora', type: TransactionType.EXPENSE },

  { id: 'c_tax_1', name: 'V. Impostos Taxas - Crefito', type: TransactionType.EXPENSE },
  { id: 'c_tax_2', name: 'V. Impostos Taxas - Domínio/sítio web', type: TransactionType.EXPENSE },
  { id: 'c_tax_3', name: 'V. Impostos Taxas - Juros', type: TransactionType.EXPENSE },
  { id: 'c_tax_4', name: 'V. Impostos Taxas - Taxa de funcionamento de estabelecimento', type: TransactionType.EXPENSE },
  { id: 'c_tax_5', name: 'V. Impostos Taxas - Taxas Bancárias', type: TransactionType.EXPENSE },
  { id: 'c_tax_6', name: 'V. Impostos Taxas - Taxas da Maquininha', type: TransactionType.EXPENSE },
  { id: 'c_tax_7', name: 'V. Impostos Taxas - Taxas diversas', type: TransactionType.EXPENSE },
];

const getCurrentUserId = async (): Promise<string | null> => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Erro ao buscar sessão do Supabase:', error.message);
    return null;
  }

  return session?.user?.id ?? null;
};

const getConflictKey = (table: string) => {
  return table === 'company_settings' ? 'user_id' : 'id';
};

const pushToSupabase = async (table: string, data: Record<string, any>) => {
  const userId = await getCurrentUserId();

  if (!userId) {
    console.warn(`Sync ignorado para ${table}: usuário não autenticado.`);
    return;
  }

  const payload = {
    ...data,
    user_id: userId,
  };

  const { error } = await supabase
    .from(table)
    .upsert(payload, { onConflict: getConflictKey(table) });

  if (error) {
    console.error(`Erro ao sincronizar ${table} com Supabase:`, error.message, payload);
  }
};

const deleteFromSupabase = async (table: string, id: string) => {
  const userId = await getCurrentUserId();

  if (!userId) {
    console.warn(`Delete ignorado para ${table}: usuário não autenticado.`);
    return;
  }

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error(`Erro ao deletar ${table} no Supabase:`, error.message);
  }
};

const pullTable = async <T extends Record<string, any>>(
  table: string,
  userId: string,
  localStorageKey: string
): Promise<T[]> => {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error(`Erro ao carregar ${table} do Supabase:`, error.message);
    return [];
  }

  const cleanData = cleanRowsForLocalStorage((data ?? []) as T[]);
  localStorage.setItem(localStorageKey, JSON.stringify(cleanData));

  return cleanData as T[];
};

const seedTableIfEmpty = async <T extends { id: string } & Record<string, any>>(
  table: string,
  userId: string,
  localStorageKey: string,
  defaultRows: T[]
): Promise<T[]> => {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error(`Erro ao carregar ${table} para seed:`, error.message);
    return safeParse<T[]>(localStorageKey, defaultRows);
  }

  if (data && data.length > 0) {
    const cleanData = cleanRowsForLocalStorage(data as Record<string, any>[]) as T[];
    localStorage.setItem(localStorageKey, JSON.stringify(cleanData));
    return cleanData;
  }

  const rowsToCreate = defaultRows.map((row) => ({
    ...row,
    id: generateId(),
    user_id: userId,
  }));

  const { data: createdRows, error: seedError } = await supabase
    .from(table)
    .insert(rowsToCreate)
    .select('*');

  if (seedError) {
    console.error(`Erro ao criar parâmetros padrão em ${table}:`, seedError.message, rowsToCreate);
    localStorage.setItem(localStorageKey, JSON.stringify(defaultRows));
    return defaultRows;
  }

  const cleanCreatedRows = cleanRowsForLocalStorage(
    (createdRows ?? rowsToCreate) as Record<string, any>[]
  ) as T[];

  localStorage.setItem(localStorageKey, JSON.stringify(cleanCreatedRows));
  return cleanCreatedRows;
};

const syncCompanySettings = async (userId: string) => {
  const { data, error } = await supabase
    .from('company_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Erro ao carregar company_settings:', error.message);
    localStorage.setItem('companySettings', JSON.stringify(DEFAULT_COMPANY_SETTINGS));
    return;
  }

  if (data) {
    const cleanSettings = removeUserId(data) as CompanySettings;
    localStorage.setItem('companySettings', JSON.stringify(cleanSettings));
    return;
  }

  const { data: createdSettings, error: seedError } = await supabase
    .from('company_settings')
    .upsert(
      {
        ...DEFAULT_COMPANY_SETTINGS,
        user_id: userId,
      },
      { onConflict: 'user_id' }
    )
    .select('*')
    .maybeSingle();

  if (seedError) {
    console.error('Erro ao criar company_settings padrão:', seedError.message);
    localStorage.setItem('companySettings', JSON.stringify(DEFAULT_COMPANY_SETTINGS));
    return;
  }

  const cleanSettings = createdSettings
    ? (removeUserId(createdSettings) as CompanySettings)
    : DEFAULT_COMPANY_SETTINGS;

  localStorage.setItem('companySettings', JSON.stringify(cleanSettings));
};

const saveArrayItem = <T extends { id: string }>(
  key: string,
  items: T[],
  item: T
) => {
  const index = items.findIndex((currentItem) => currentItem.id === item.id);

  if (index >= 0) {
    items[index] = item;
  } else {
    items.push(item);
  }

  localStorage.setItem(key, JSON.stringify(items));
};

export const StorageService = {
  // --- Sync System ---
  syncFromSupabase: async (userId: string) => {
    try {
      // Dados operacionais: nunca criar mocks/fakes automaticamente.
      await pullTable<Patient>('patients', userId, 'patients');
      await pullTable<Appointment>('appointments', userId, 'appointments');
      await pullTable<Transaction>('transactions', userId, 'transactions');
      await pullTable<WaitlistItem>('waitlist', userId, 'waitlist');
      await pullTable<Invoice>('invoices', userId, 'invoices');

      // Parâmetros: criar padrões automaticamente para usuário novo.
      await seedTableIfEmpty<Service>('services', userId, 'services', INITIAL_SERVICES);
      await seedTableIfEmpty<Professional>('professionals', userId, 'professionals', INITIAL_PROFESSIONALS);
      await seedTableIfEmpty<FinancialCategory>('categories', userId, 'financial_categories', INITIAL_CATEGORIES);
      await seedTableIfEmpty<AppointmentTypeConfig>('appointment_types', userId, 'appointment_types', INITIAL_APPOINTMENT_TYPES);
      await seedTableIfEmpty<AppointmentStatusConfig>('appointment_statuses', userId, 'appointment_statuses', INITIAL_APPOINTMENT_STATUSES);

      await syncCompanySettings(userId);

      window.dispatchEvent(new Event('supabase_sync_complete'));
    } catch (err) {
      console.error('Erro geral ao sincronizar dados do Supabase:', err);
    }
  },

  // --- Company Settings ---
  getCompanySettings: (): CompanySettings => {
    return safeParse<CompanySettings>('companySettings', DEFAULT_COMPANY_SETTINGS);
  },

  saveCompanySettings: (settings: CompanySettings) => {
    const finalSettings: CompanySettings = {
      name: settings.name || DEFAULT_COMPANY_SETTINGS.name,
      slogan: settings.slogan || '',
      logoUrl: settings.logoUrl || '',
    };

    localStorage.setItem('companySettings', JSON.stringify(finalSettings));
    void pushToSupabase('company_settings', finalSettings);
  },

  // --- Patients ---
  getPatients: (): Patient[] => {
    return safeParse<Patient[]>('patients', []);
  },

  savePatient: (patient: Patient): Patient => {
    const patients = StorageService.getPatients();

    const savedPatient: Patient = {
      ...patient,
      id: patient.id || generateId(),
      createdAt: patient.createdAt || new Date().toISOString(),
      status: patient.status || 'Ativo',
    };

    saveArrayItem('patients', patients, savedPatient);
    void pushToSupabase('patients', savedPatient);

    return savedPatient;
  },

  deletePatient: (id: string) => {
    const patients = StorageService.getPatients().filter((patient) => patient.id !== id);
    localStorage.setItem('patients', JSON.stringify(patients));
    void deleteFromSupabase('patients', id);
  },

  // --- Appointments ---
  getAppointments: (): Appointment[] => {
    return safeParse<Appointment[]>('appointments', []);
  },

  saveAppointment: (appointment: Appointment) => {
    const appointments = StorageService.getAppointments();

    const finalAppointment: Appointment = {
      ...appointment,
      id: appointment.id || generateId(),
      notes: appointment.notes || '',
      price: Number(appointment.price || 0),
      status: appointment.status || 'Agendado',
      type: appointment.type || 'Atendimento',
    };

    saveArrayItem('appointments', appointments, finalAppointment);
    void pushToSupabase('appointments', finalAppointment);

    const isCancelled = finalAppointment.status?.toLowerCase() === 'cancelado';
    const transactions = StorageService.getTransactions();
    const existingTransaction = transactions.find(
      (transaction) => transaction.appointmentId === finalAppointment.id
    );

    if (isCancelled) {
      if (existingTransaction) {
        StorageService.deleteTransaction(existingTransaction.id);
      }

      return;
    }

    const transactionData = {
      description: finalAppointment.type || 'Atendimento',
      amount: Number(finalAppointment.price || 0),
      type: TransactionType.INCOME,
      date: finalAppointment.date,
      category: 'Atendimentos',
      patientId: finalAppointment.patientId,
      appointmentId: finalAppointment.id,
    };

    if (existingTransaction) {
      StorageService.saveTransaction({
        ...existingTransaction,
        ...transactionData,
      });
    } else {
      StorageService.saveTransaction({
        id: generateId(),
        ...transactionData,
      });
    }
  },

  deleteAppointment: (id: string) => {
    const appointments = StorageService.getAppointments().filter(
      (appointment) => appointment.id !== id
    );

    localStorage.setItem('appointments', JSON.stringify(appointments));
    void deleteFromSupabase('appointments', id);

    const transactions = StorageService.getTransactions();
    const existingTransaction = transactions.find(
      (transaction) => transaction.appointmentId === id
    );

    if (existingTransaction) {
      StorageService.deleteTransaction(existingTransaction.id);
    }
  },

  // --- Transactions ---
  getTransactions: (): Transaction[] => {
    return safeParse<Transaction[]>('transactions', []);
  },

  saveTransaction: (transaction: Transaction) => {
    const transactions = StorageService.getTransactions();

    const finalTransaction: Transaction = {
      ...transaction,
      id: transaction.id || generateId(),
      description: transaction.description || '',
      amount: Number(transaction.amount || 0),
      date: transaction.date || new Date().toISOString().slice(0, 10),
      category: transaction.category || 'Sem categoria',
    };

    saveArrayItem('transactions', transactions, finalTransaction);
    void pushToSupabase('transactions', finalTransaction);

    return finalTransaction;
  },

  deleteTransaction: (id: string) => {
    const transactions = StorageService.getTransactions().filter(
      (transaction) => transaction.id !== id
    );

    localStorage.setItem('transactions', JSON.stringify(transactions));
    void deleteFromSupabase('transactions', id);
  },

  // --- Services ---
  getServices: (): Service[] => {
    return safeParse<Service[]>('services', INITIAL_SERVICES);
  },

  saveService: (service: Service) => {
    const services = StorageService.getServices();

    const finalService: Service = {
      ...service,
      id: service.id || generateId(),
      description: service.description || '',
      price: Number(service.price || 0),
      duration: Number(service.duration || 0),
    };

    saveArrayItem('services', services, finalService);
    void pushToSupabase('services', finalService);

    return finalService;
  },

  deleteService: (id: string) => {
    const services = StorageService.getServices().filter((service) => service.id !== id);
    localStorage.setItem('services', JSON.stringify(services));
    void deleteFromSupabase('services', id);
  },

  // --- Professionals ---
  getProfessionals: (): Professional[] => {
    return safeParse<Professional[]>('professionals', INITIAL_PROFESSIONALS);
  },

  saveProfessional: (professional: Professional) => {
    const professionals = StorageService.getProfessionals();

    const finalProfessional: Professional = {
      ...professional,
      id: professional.id || generateId(),
      specialty: professional.specialty || '',
      email: professional.email || '',
      phone: professional.phone || '',
      registrationNumber: professional.registrationNumber || '',
      color: professional.color || '#0ea5e9',
    };

    saveArrayItem('professionals', professionals, finalProfessional);
    void pushToSupabase('professionals', finalProfessional);

    return finalProfessional;
  },

  deleteProfessional: (id: string) => {
    const professionals = StorageService.getProfessionals().filter(
      (professional) => professional.id !== id
    );

    localStorage.setItem('professionals', JSON.stringify(professionals));
    void deleteFromSupabase('professionals', id);
  },

  // --- Waitlist ---
  getWaitlist: (): WaitlistItem[] => {
    return safeParse<WaitlistItem[]>('waitlist', []);
  },

  saveWaitlistItem: (item: WaitlistItem) => {
    const waitlist = StorageService.getWaitlist();

    const finalWaitlistItem: WaitlistItem = {
      ...item,
      id: item.id || generateId(),
      createdAt: item.createdAt || new Date().toISOString(),
    };

    saveArrayItem('waitlist', waitlist, finalWaitlistItem);
    void pushToSupabase('waitlist', finalWaitlistItem);

    return finalWaitlistItem;
  },

  deleteWaitlistItem: (id: string) => {
    const waitlist = StorageService.getWaitlist().filter((item) => item.id !== id);
    localStorage.setItem('waitlist', JSON.stringify(waitlist));
    void deleteFromSupabase('waitlist', id);
  },

  // --- Invoices ---
  getInvoices: (): Invoice[] => {
    return safeParse<Invoice[]>('invoices', []);
  },

  saveInvoice: (invoice: Invoice) => {
    const invoices = StorageService.getInvoices();

    const finalInvoice: Invoice = {
      ...invoice,
      id: invoice.id || generateId(),
      amount: Number(invoice.amount || 0),
      date: invoice.date || new Date().toISOString().slice(0, 10),
      status: invoice.status || 'Emitida',
    };

    saveArrayItem('invoices', invoices, finalInvoice);
    void pushToSupabase('invoices', finalInvoice);

    return finalInvoice;
  },

  deleteInvoice: (id: string) => {
    const invoices = StorageService.getInvoices().filter((invoice) => invoice.id !== id);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    void deleteFromSupabase('invoices', id);
  },

  // --- Financial Categories ---
  getCategories: (): FinancialCategory[] => {
    return safeParse<FinancialCategory[]>('financial_categories', INITIAL_CATEGORIES);
  },

  saveCategory: (category: FinancialCategory) => {
    const categories = StorageService.getCategories();

    const finalCategory: FinancialCategory = {
      ...category,
      id: category.id || generateId(),
    };

    saveArrayItem('financial_categories', categories, finalCategory);
    void pushToSupabase('categories', finalCategory);

    return finalCategory;
  },

  deleteCategory: (id: string) => {
    const categories = StorageService.getCategories().filter(
      (category) => category.id !== id
    );

    localStorage.setItem('financial_categories', JSON.stringify(categories));
    void deleteFromSupabase('categories', id);
  },

  // --- Appointment Types ---
  getAppointmentTypes: (): AppointmentTypeConfig[] => {
    return safeParse<AppointmentTypeConfig[]>('appointment_types', INITIAL_APPOINTMENT_TYPES);
  },

  saveAppointmentType: (type: AppointmentTypeConfig) => {
    const appointmentTypes = StorageService.getAppointmentTypes();

    const finalType: AppointmentTypeConfig = {
      ...type,
      id: type.id || generateId(),
    };

    saveArrayItem('appointment_types', appointmentTypes, finalType);
    void pushToSupabase('appointment_types', finalType);

    return finalType;
  },

  deleteAppointmentType: (id: string) => {
    const appointmentTypes = StorageService.getAppointmentTypes().filter(
      (type) => type.id !== id
    );

    localStorage.setItem('appointment_types', JSON.stringify(appointmentTypes));
    void deleteFromSupabase('appointment_types', id);
  },

  // --- Appointment Statuses ---
  getAppointmentStatuses: (): AppointmentStatusConfig[] => {
    return safeParse<AppointmentStatusConfig[]>(
      'appointment_statuses',
      INITIAL_APPOINTMENT_STATUSES
    );
  },

  saveAppointmentStatus: (status: AppointmentStatusConfig) => {
    const appointmentStatuses = StorageService.getAppointmentStatuses();

    const finalStatus: AppointmentStatusConfig = {
      ...status,
      id: status.id || generateId(),
    };

    saveArrayItem('appointment_statuses', appointmentStatuses, finalStatus);
    void pushToSupabase('appointment_statuses', finalStatus);

    return finalStatus;
  },

  deleteAppointmentStatus: (id: string) => {
    const appointmentStatuses = StorageService.getAppointmentStatuses().filter(
      (status) => status.id !== id
    );

    localStorage.setItem('appointment_statuses', JSON.stringify(appointmentStatuses));
    void deleteFromSupabase('appointment_statuses', id);
  },
};