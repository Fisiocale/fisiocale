
import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Patient, Appointment, AppointmentTypeConfig, Service } from '../types';
import { Search, Plus, User, Calendar, FileText, ChevronRight, X, AlertCircle, CheckCircle, TrendingUp, Edit2, ChevronDown, MessageCircle } from 'lucide-react';

const getWhatsAppLink = (phone: string) => {
  if (!phone) return '#';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length >= 10 && !cleaned.startsWith('55')) {
    return `https://wa.me/55${cleaned}`;
  }
  return `https://wa.me/${cleaned}`;
};

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [apptTypes, setApptTypes] = useState<AppointmentTypeConfig[]>([]);
  const [view, setView] = useState<'list' | 'detail' | 'form'>('list'); // Renamed 'new' to 'form'
  const [searchTerm, setSearchTerm] = useState('');

  // Patient Form States
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientBirth, setPatientBirth] = useState('');
  const [patientCpf, setPatientCpf] = useState('');
  const [patientProfession, setPatientProfession] = useState('');
  const [patientAttendingPhysician, setPatientAttendingPhysician] = useState('');
  const [patientIndications, setPatientIndications] = useState('');
  const [patientStatus, setPatientStatus] = useState('Ativo');

  // Appointment Form States
  const [showApptForm, setShowApptForm] = useState(false);
  const [editingApptId, setEditingApptId] = useState<string | null>(null);
  const [apptType, setApptType] = useState<string>('');
  const [apptDate, setApptDate] = useState(new Date().toISOString().split('T')[0]);
  const [apptTime, setApptTime] = useState('09:00');
  const [apptServiceId, setApptServiceId] = useState('');
  const [apptNotes, setApptNotes] = useState('');
  const [apptPrice, setApptPrice] = useState('0');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setPatients(StorageService.getPatients());
    setAppointments(StorageService.getAppointments());
    setServices(StorageService.getServices());
    const types = StorageService.getAppointmentTypes();
    setApptTypes(types);
    if (types.length > 0 && !apptType) {
      setApptType(types[0].name);
    }
  };

  // --- PATIENT ACTIONS ---

  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    const patientData: Patient = {
      id: editingPatientId || '', // Empty ID triggers creation in StorageService, ID triggers update
      name: patientName,
      email: patientEmail,
      phone: patientPhone,
      birthDate: patientBirth,
      cpf: patientCpf,
      profession: patientProfession,
      attendingPhysician: patientAttendingPhysician,
      indications: patientIndications,
      status: patientStatus,
      createdAt: editingPatientId && selectedPatient ? selectedPatient.createdAt : new Date().toISOString()
    };
    
    StorageService.savePatient(patientData);
    
    // If editing active patient, update the selected view
    if (selectedPatient && editingPatientId === selectedPatient.id) {
        setSelectedPatient(patientData);
    }

    refreshData();
    setView('list');
    resetPatientForm();
  };

  const startNewPatient = () => {
    resetPatientForm();
    setView('form');
  };

  const startEditPatient = (patient: Patient) => {
    setEditingPatientId(patient.id);
    setPatientName(patient.name);
    setPatientEmail(patient.email);
    setPatientPhone(patient.phone);
    setPatientBirth(patient.birthDate);
    setPatientCpf(patient.cpf || '');
    setPatientProfession(patient.profession || '');
    setPatientAttendingPhysician(patient.attendingPhysician || '');
    setPatientIndications(patient.indications || '');
    setPatientStatus(patient.status || 'Ativo');
    setView('form');
  };

  const resetPatientForm = () => {
    setEditingPatientId(null);
    setPatientName('');
    setPatientEmail('');
    setPatientPhone('');
    setPatientBirth('');
    setPatientCpf('');
    setPatientProfession('');
    setPatientAttendingPhysician('');
    setPatientIndications('');
    setPatientStatus('Ativo');
  };

  // --- APPOINTMENT ACTIONS ---

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const apptData: Appointment = {
      id: editingApptId || '',
      patientId: selectedPatient.id,
      date: apptDate,
      time: apptTime,
      type: apptType,
      serviceId: apptServiceId,
      notes: apptNotes,
      price: Number(apptPrice)
    };

    StorageService.saveAppointment(apptData);
    refreshData();
    setShowApptForm(false);
    setAiSummary(''); // Clear old summary as data changed
    resetApptForm();
  };

  const startNewAppointment = () => {
    resetApptForm();
    setShowApptForm(true);
  };

  const startEditAppointment = (app: Appointment) => {
    setEditingApptId(app.id);
    setApptDate(app.date);
    setApptTime(app.time || '09:00');
    setApptType(app.type);
    setApptServiceId(app.serviceId || '');
    setApptNotes(app.notes);
    setApptPrice(app.price.toString());
    setShowApptForm(true);
  };

  const resetApptForm = () => {
    setEditingApptId(null);
    setApptDate(new Date().toISOString().split('T')[0]);
    setApptTime('09:00');
    setApptType(apptTypes.length > 0 ? apptTypes[0].name : '');
    setApptServiceId('');
    setApptNotes('');
    setApptPrice('0');
  };

  // --- VIEW LOGIC ---

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
    setView('detail');
  };

  // Helper to calculate patient status and value
  const getPatientMetrics = (patient: Patient) => {
    const pApps = appointments.filter(a => a.patientId === patient.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const totalSpent = pApps.reduce((sum, app) => sum + app.price, 0);
    
    let status = patient.status;
    
    // Fallback logic if status is not set manually
    if (!status) {
        if (pApps.length > 0) {
            const lastAppDate = new Date(pApps[0].date);
            const diffDays = Math.ceil((new Date().getTime() - lastAppDate.getTime()) / (1000 * 3600 * 24));
            
            if (diffDays > 60) {
              status = 'Inativo';
            } else {
              status = 'Ativo';
            }
        } else {
            status = 'Novo';
        }
    }

    let statusColor = 'text-blue-500 bg-blue-50';
    if (status === 'Ativo') statusColor = 'text-green-500 bg-green-50';
    else if (status === 'Inativo') statusColor = 'text-red-500 bg-red-50';

    return { totalSpent, status, statusColor, lastApp: pApps[0] };
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // VIEW: PATIENT LIST
  if (view === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou email..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={startNewPatient}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 font-medium"
          >
            <Plus size={20} />
            <span>Cadastrar Paciente</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100/50 md:border-slate-100 overflow-hidden md:p-0 p-2">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[#f8fafc] border-b border-slate-100 text-[13px] font-bold text-slate-500 uppercase">
            <div className="col-span-4">Paciente</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Serviço</div>
            <div className="col-span-2">Última Visita</div>
            <div className="col-span-2 text-right">Ação</div>
          </div>
          <div className="divide-y divide-transparent md:divide-slate-100">
            {filteredPatients.map((patient) => {
              const { status, statusColor, totalSpent, lastApp } = getPatientMetrics(patient);
              const lastServiceName = lastApp 
                ? (lastApp.serviceId && services.find(s => s.id === lastApp.serviceId)?.name) || lastApp.type
                : '-';

              return (
                <div key={patient.id} className="p-4 md:px-6 md:py-5 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center relative border border-slate-100/50 md:border-none rounded-2xl md:rounded-none mb-3 md:mb-0" onClick={() => handleSelectPatient(patient)}>
                  
                  {/* Container for Avatar + Name/Phone & Prontuario Button (Mobile Header) */}
                  <div className="flex md:col-span-4 items-center justify-between mb-4 md:mb-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#f1f5f9] text-[#475569] flex items-center justify-center font-bold text-[15px] flex-shrink-0">
                        {patient.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="block font-bold text-[#2d3748] text-[15px] truncate">{patient.name}</span>
                        <a 
                          href={getWhatsAppLink(patient.phone)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          onClick={(e) => e.stopPropagation()}
                          className="text-[13px] text-teal-600 hover:text-teal-700 flex items-center mt-0.5 transition-colors truncate"
                        >
                          <MessageCircle size={12} className="mr-1 flex-shrink-0" />
                          <span className="truncate">{patient.phone}</span>
                        </a>
                      </div>
                    </div>

                    {/* Prontuario Button in Mobile view, hidden on desktop here */}
                    <div className="md:hidden">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleSelectPatient(patient); }}
                        className="text-teal-700 bg-teal-50 hover:bg-teal-100 font-bold text-[13px] flex items-center px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Prontuário <ChevronRight size={14} className="ml-1" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex justify-between items-center md:block mb-3 md:mb-0">
                    <span className="md:hidden text-[13px] text-slate-500 font-bold">Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border-none ${statusColor}`}>
                      {status}
                    </span>
                  </div>

                  <div className="col-span-2 flex justify-between items-center md:block mb-3 md:mb-0">
                    <span className="md:hidden text-[13px] text-slate-500 font-bold">Serviço:</span>
                    <span className="text-[14px] font-bold text-slate-600 md:text-sm md:font-medium md:text-slate-600 truncate max-w-[140px] md:max-w-none text-right md:text-left">{lastServiceName}</span>
                  </div>

                  <div className="col-span-2 flex justify-between items-center md:block md:mb-0">
                    <span className="md:hidden text-[13px] text-slate-500 font-bold">Última Visita:</span>
                    <span className="text-[14px] font-bold text-slate-400 md:text-sm md:font-medium md:text-slate-500">
                      {lastApp ? lastApp.date.split('-').reverse().join('/') : 'Nunca'}
                    </span>
                  </div>

                  <div className="hidden md:flex col-span-2 justify-end">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleSelectPatient(patient); }}
                      className="text-teal-600 hover:text-teal-800 font-medium text-sm flex items-center"
                    >
                      Prontuário <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredPatients.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                <div className="flex flex-col items-center">
                  <User size={48} className="text-slate-200 mb-2"/>
                  <p>Nenhum paciente encontrado.</p>
                  <button onClick={startNewPatient} className="mt-2 text-teal-600 hover:underline">Cadastrar o primeiro?</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // VIEW: PATIENT FORM (NEW OR EDIT)
  if (view === 'form') {
    return (
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setView('list')} className="mb-4 text-slate-500 flex items-center hover:text-slate-800">
           <ChevronRight className="rotate-180 mr-1" size={20}/> Voltar para Lista
        </button>
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center space-x-3">
             <div className="bg-teal-100 p-2 rounded-lg text-teal-600"><User size={24}/></div>
             <div>
               <h2 className="text-xl font-bold text-slate-800">{editingPatientId ? 'Editar Paciente' : 'Novo Paciente'}</h2>
               <p className="text-sm text-slate-500">{editingPatientId ? 'Atualize os dados abaixo.' : 'Preencha os dados básicos para iniciar o prontuário.'}</p>
             </div>
          </div>
          <form onSubmit={handleSavePatient} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <input required type="text" placeholder="Ex: João da Silva" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" value={patientName} onChange={e => setPatientName(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input required type="email" placeholder="joao@email.com" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" value={patientEmail} onChange={e => setPatientEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
                <input required type="tel" placeholder="(11) 99999-9999" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" value={patientPhone} onChange={e => setPatientPhone(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
                <input required type="date" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" value={patientBirth} onChange={e => setPatientBirth(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                <input type="text" placeholder="000.000.000-00" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" value={patientCpf} onChange={e => setPatientCpf(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Profissão</label>
                <input type="text" placeholder="Ex: Professor" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" value={patientProfession} onChange={e => setPatientProfession(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Médico Responsável</label>
                <input type="text" placeholder="Ex: Dr. Roberto" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" value={patientAttendingPhysician} onChange={e => setPatientAttendingPhysician(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Indicações Recebidas</label>
              <textarea placeholder="Ex: Indicado pelo Dr. Roberto, Google, Amigo..." rows={2} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-none" value={patientIndications} onChange={e => setPatientIndications(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <div className="relative">
                    <select 
                        value={patientStatus} 
                        onChange={e => setPatientStatus(e.target.value)} 
                        className="w-full border border-slate-300 p-2.5 pr-8 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all appearance-none bg-white text-slate-700"
                    >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                        <option value="Novo">Novo</option>
                    </select>
                    <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                        <ChevronDown size={16} />
                    </div>
                </div>
              </div>
            </div>
            <div className="pt-6 flex justify-end space-x-3 border-t border-slate-100 mt-6">
              <button type="button" onClick={() => setView('list')} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancelar</button>
              <button type="submit" className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium shadow-md transition-colors flex items-center">
                <CheckCircle size={18} className="mr-2"/> {editingPatientId ? 'Atualizar Dados' : 'Salvar Cadastro'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // VIEW: PATIENT DETAIL
  if (view === 'detail' && selectedPatient) {
    const patientApps = appointments
      .filter(a => a.patientId === selectedPatient.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const { status, statusColor } = getPatientMetrics(selectedPatient);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div className="w-full md:w-auto">
             <button onClick={() => setView('list')} className="mb-2 text-slate-500 flex items-center hover:text-slate-800 text-sm font-medium">
               <ChevronRight className="rotate-180 mr-1" size={16}/> Voltar para lista
             </button>
             <div className="flex items-center space-x-3">
               <h2 className="text-3xl font-display font-bold text-slate-800">{selectedPatient.name}</h2>
               <span className={`px-2 py-0.5 rounded text-xs font-bold border ${statusColor.replace('bg-', 'border-')} ${statusColor}`}>{status}</span>
               <button onClick={() => startEditPatient(selectedPatient)} className="text-slate-400 hover:text-teal-600 transition-colors p-1 rounded hover:bg-slate-100">
                 <Edit2 size={18} />
               </button>
             </div>
             <p className="text-slate-500 mt-1 flex items-center space-x-2">
                <span>{selectedPatient.email}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <a 
                  href={getWhatsAppLink(selectedPatient.phone)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-teal-600 hover:text-teal-700 transition-colors"
                >
                  <MessageCircle size={14} className="mr-1" />
                  {selectedPatient.phone}
                </a>
                {selectedPatient.cpf && (
                  <>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>CPF: {selectedPatient.cpf}</span>
                  </>
                )}
             </p>
             <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
               {selectedPatient.profession && (
                 <p>Profissão: <span className="font-medium text-slate-700">{selectedPatient.profession}</span></p>
               )}
               {selectedPatient.attendingPhysician && (
                 <p>Médico: <span className="font-medium text-slate-700">{selectedPatient.attendingPhysician}</span></p>
               )}
               {selectedPatient.indications && (
                 <p className="italic text-slate-400">
                   Indicação: {selectedPatient.indications}
                 </p>
               )}
             </div>
           </div>
           <button 
             onClick={startNewAppointment}
             className="bg-teal-600 text-white px-5 py-2.5 rounded-lg hover:bg-teal-700 flex items-center space-x-2 shadow-sm font-medium transition-all transform hover:-translate-y-0.5"
           >
             <Plus size={20} /> <span>Novo Atendimento</span>
           </button>
        </div>

        {/* History Timeline */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-700 flex items-center"><FileText size={20} className="mr-2 text-slate-400"/> Histórico de Consultas</h3>
          {patientApps.length === 0 ? (
            <div className="bg-white p-12 rounded-xl text-center border-2 border-dashed border-slate-200">
              <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3">
                <Calendar size={32} />
              </div>
              <h4 className="text-slate-500 font-medium">Nenhum atendimento registrado</h4>
              <p className="text-slate-400 text-sm mt-1">Clique em "Novo Atendimento" para iniciar.</p>
            </div>
          ) : (
            patientApps.map((app) => (
              <div key={app.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="p-5">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div className="flex items-center space-x-3">
                       <div className="p-2 rounded-lg" style={{ 
                         backgroundColor: `${apptTypes.find(t => t.name === app.type)?.color || '#cbd5e1'}15`, 
                         color: apptTypes.find(t => t.name === app.type)?.color || '#64748b' 
                       }}>
                         <Calendar size={20} />
                       </div>
                       <div>
                         <h4 className="font-bold text-slate-800 text-lg">{app.type}</h4>
                         <p className="text-slate-500 text-sm">{app.date.split('-').reverse().join('/')} • {app.time || '00:00'}</p>
                         {app.serviceId && services.find(s => s.id === app.serviceId) && (
                            <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                                {services.find(s => s.id === app.serviceId)?.name}
                            </span>
                         )}
                       </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={() => startEditAppointment(app)} className="text-slate-300 hover:text-teal-600 transition-colors p-2 hover:bg-slate-50 rounded-full">
                            <Edit2 size={18} />
                        </button>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 text-sm leading-relaxed">
                    <span className="font-semibold text-slate-900 block mb-1">Anotações Clínicas:</span>
                    {app.notes}
                  </div>
                  <div className="mt-3 text-right">
                     <span className="text-xs text-slate-400 font-medium">Valor da Consulta: </span>
                     <span className="text-sm font-bold text-teal-600">R$ {app.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal for Appointment (New/Edit) */}
        {showApptForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    {editingApptId ? <Edit2 size={18} className="mr-2 text-teal-600"/> : <Plus size={18} className="mr-2 text-teal-600"/>} 
                    {editingApptId ? 'Editar Atendimento' : 'Registrar Atendimento'}
                </h3>
                <button onClick={() => setShowApptForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white p-1 rounded-full border border-slate-200 hover:bg-slate-100"><X size={20}/></button>
              </div>
              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSaveAppointment} className="space-y-5">
                  
                  {/* Service Selection */}
                  <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Serviço (Opcional)</label>
                       <div className="relative">
                         <select 
                            value={apptServiceId} 
                            onChange={(e) => {
                                const sId = e.target.value;
                                setApptServiceId(sId);
                                const s = services.find(srv => srv.id === sId);
                                if(s) setApptPrice(s.price.toString());
                            }} 
                            className="w-full border border-slate-300 p-2.5 pr-8 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white appearance-none text-slate-700"
                         >
                           <option value="">Selecione um serviço...</option>
                           {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price.toFixed(2)}</option>)}
                         </select>
                         <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                           <ChevronDown size={16} />
                         </div>
                       </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                     <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Data</label>
                       <input required type="date" value={apptDate} onChange={e => setApptDate(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-slate-700" />
                     </div>
                     <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Horário</label>
                       <input required type="time" value={apptTime} onChange={e => setApptTime(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-slate-700" />
                     </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Tipo</label>
                    <div className="relative">
                        <select 
                        value={apptType} 
                        onChange={e => setApptType(e.target.value)} 
                        className="w-full border border-slate-300 p-2.5 pr-8 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white appearance-none text-slate-700"
                        >
                        {apptTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                        <ChevronDown size={16} />
                        </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                     <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Valor (R$)</label>
                       <input required type="number" placeholder="0.00" value={apptPrice} onChange={e => setApptPrice(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-slate-700" />
                     </div>
                  </div>

                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Descrição / Evolução Clínica</label>
                     <textarea required rows={5} placeholder="Descreva os detalhes da consulta, queixas e observações..." value={apptNotes} onChange={e => setApptNotes(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none resize-none bg-white text-slate-700"></textarea>
                  </div>

                  <button type="submit" className="w-full bg-teal-600 text-white py-3.5 rounded-lg font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 flex justify-center items-center">
                    <CheckCircle size={20} className="mr-2" /> {editingApptId ? 'Atualizar Atendimento' : 'Salvar Atendimento'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default Patients;
