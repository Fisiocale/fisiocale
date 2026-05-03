
import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Appointment, Patient, Service, AppointmentTypeConfig, WaitlistItem, AppointmentStatusConfig } from '../types';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, User, CheckCircle, X, ChevronDown, Edit, Trash2, Stethoscope, AlertCircle, CalendarDays, CalendarRange, AlignJustify, UserPlus, Bell } from 'lucide-react';

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'yearly';

const Agenda: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistItem[]>([]);
  const [apptTypes, setApptTypes] = useState<AppointmentTypeConfig[]>([]);
  const [apptStatuses, setApptStatuses] = useState<AppointmentStatusConfig[]>([]);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [newApptPatientId, setNewApptPatientId] = useState('');
  const [newApptProfessionalId, setNewApptProfessionalId] = useState('');
  const [newApptServiceId, setNewApptServiceId] = useState('');
  const [newApptTime, setNewApptTime] = useState('09:00');
  const [newApptDate, setNewApptDate] = useState('');
  const [newApptType, setNewApptType] = useState<string>('');
  const [newApptStatus, setNewApptStatus] = useState<string>('Agendado');
  const [newApptPrice, setNewApptPrice] = useState('0');
  const [newApptNotes, setNewApptNotes] = useState('');

  // Quick Patient Form State
  const [showQuickPatientForm, setShowQuickPatientForm] = useState(false);
  const [quickPatientName, setQuickPatientName] = useState('');
  const [quickPatientPhone, setQuickPatientPhone] = useState('');

  useEffect(() => {
    refreshData();
  }, [currentDate]);

  const refreshData = () => {
    const allAppointments = StorageService.getAppointments();
    setAppointments(allAppointments);
    setPatients(StorageService.getPatients());
    setServices(StorageService.getServices());
    setProfessionals(StorageService.getProfessionals());
    setWaitlist(StorageService.getWaitlist());
    const types = StorageService.getAppointmentTypes();
    setApptTypes(types);
    if (types.length > 0 && !newApptType) {
      setNewApptType(types[0].name);
    }
    const statuses = StorageService.getAppointmentStatuses();
    setApptStatuses(statuses);
    if (statuses.length > 0 && !newApptStatus) {
      setNewApptStatus(statuses[0].name);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'daily') newDate.setDate(newDate.getDate() - 1);
    if (viewMode === 'weekly') newDate.setDate(newDate.getDate() - 7);
    if (viewMode === 'monthly') newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
    if (viewMode === 'daily') setSelectedDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'daily') newDate.setDate(newDate.getDate() + 1);
    if (viewMode === 'weekly') newDate.setDate(newDate.getDate() + 7);
    if (viewMode === 'monthly') newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
    if (viewMode === 'daily') setSelectedDate(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const resetSampleData = () => {
    if (window.confirm('Isso irá apagar todos os seus agendamentos atuais e carregar dados de exemplo para esta semana. Deseja continuar?')) {
      localStorage.removeItem('appointments');
      localStorage.removeItem('patients');
      localStorage.removeItem('professionals');
      localStorage.removeItem('services');
      localStorage.removeItem('appointment_types');
      window.location.reload();
    }
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return appointments
      .filter(a => a.date === dateStr)
      .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow creating appointments without a patient or professional for generic tasks

    const newAppt: Appointment = {
      id: editingAppointmentId || Math.random().toString(36).substr(2, 9),
      patientId: newApptPatientId || 'generic', // Use a placeholder or empty string
      professionalId: newApptProfessionalId || undefined,
      date: newApptDate || formatDate(selectedDate),
      time: newApptTime,
      type: newApptType,
      status: newApptStatus,
      serviceId: newApptServiceId || undefined,
      notes: newApptNotes,
      price: Number(newApptPrice) || 0
    };

    StorageService.saveAppointment(newAppt);
    refreshData();
    setShowModal(false);
    
    // Reset form
    setEditingAppointmentId(null);
    setNewApptPatientId('');
    setNewApptProfessionalId('');
    setNewApptServiceId('');
    setNewApptNotes('');
    setShowQuickPatientForm(false);
    setQuickPatientName('');
    setQuickPatientPhone('');
  };

  const openNewApptModal = () => {
    setEditingAppointmentId(null);
    setNewApptPatientId('');
    setNewApptProfessionalId('');
    setNewApptServiceId('');
    setNewApptTime('09:00');
    setNewApptDate(formatDate(selectedDate));
    setNewApptPrice('0');
    const defaultStatus = apptStatuses.find(s => s.name === 'Agendado')?.name || (apptStatuses.length > 0 ? apptStatuses[0].name : 'Agendado');
    setNewApptStatus(defaultStatus);
    setNewApptType(apptTypes.length > 0 ? apptTypes[0].name : '');
    setNewApptNotes('');
    setShowQuickPatientForm(false);
    setQuickPatientName('');
    setQuickPatientPhone('');
    setShowModal(true);
  };

  const handleQuickPatientSave = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!quickPatientName.trim()) return;

    const newPatient: Patient = {
      id: '',
      name: quickPatientName.trim(),
      phone: quickPatientPhone.trim(),
      email: '',
      birthDate: '',
      createdAt: new Date().toISOString()
    };

    const saved = StorageService.savePatient(newPatient);
    refreshData();
    setNewApptPatientId(saved.id);
    setShowQuickPatientForm(false);
    setQuickPatientName('');
    setQuickPatientPhone('');
  };

  const handleRemoveFromWaitlist = (id: string) => {
    StorageService.deleteWaitlistItem(id);
    refreshData();
  };

  const handleEncaixe = (item: WaitlistItem) => {
    setNewApptPatientId(item.patientId);
    setNewApptType(item.type);
    setNewApptStatus('Agendado');
    setNewApptNotes(item.notes || '');
    setNewApptTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    setShowWaitlistModal(false);
    setShowModal(true);
  };

  const handleSlotClick = (dateStr: string, timeStr: string) => {
    setEditingAppointmentId(null);
    setNewApptPatientId('');
    setNewApptProfessionalId('');
    setNewApptServiceId('');
    setNewApptTime(timeStr);
    setNewApptDate(dateStr);
    setNewApptPrice('0');
    const defaultStatus = apptStatuses.find(s => s.name === 'Agendado')?.name || (apptStatuses.length > 0 ? apptStatuses[0].name : 'Agendado');
    setNewApptStatus(defaultStatus);
    setNewApptType(apptTypes.length > 0 ? apptTypes[0].name : '');
    setNewApptNotes('');
    setShowQuickPatientForm(false);
    setQuickPatientName('');
    setQuickPatientPhone('');
    
    // Create Date object correctly in local timezone
    const [year, month, day] = dateStr.split('-');
    setSelectedDate(new Date(Number(year), Number(month) - 1, Number(day)));
    
    setShowModal(true);
  };

  const openEditApptModal = (app: Appointment) => {
    setEditingAppointmentId(app.id);
    setNewApptPatientId(app.patientId);
    setNewApptProfessionalId(app.professionalId || '');
    setNewApptServiceId(app.serviceId || '');
    setNewApptTime(app.time);
    setNewApptDate(app.date);
    setNewApptType(app.type);
    const defaultStatus = apptStatuses.find(s => s.name === 'Agendado')?.name || (apptStatuses.length > 0 ? apptStatuses[0].name : 'Agendado');
    setNewApptStatus(app.status || defaultStatus);
    setNewApptPrice(app.price.toString());
    setNewApptNotes(app.notes || '');
    
    // Set selected date to the appointment's date
    const [year, month, day] = app.date.split('-');
    setSelectedDate(new Date(Number(year), Number(month) - 1, Number(day)));
    
    setShowModal(true);
  };

  const handleDeleteClick = (id: string) => {
    setAppointmentToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (appointmentToDelete) {
      StorageService.deleteAppointment(appointmentToDelete);
      refreshData();
      setShowDeleteModal(false);
      setAppointmentToDelete(null);
    }
  };

  const handleQuickStatusUpdate = (app: Appointment, status: string) => {
    const updatedApp = { ...app, status };
    StorageService.saveAppointment(updatedApp);
    refreshData();
  };

  const renderAgendaDoDiaCard = (app: Appointment) => {
    const patient = patients.find(p => p.id === app.patientId);
    const service = services.find(s => s.id === app.serviceId);
    const professional = professionals.find(p => p.id === app.professionalId);
    const isCanceled = app.status?.toLowerCase() === 'cancelado';
    const typeColor = isCanceled ? '#cc0000' : (apptTypes.find(t => t.name === app.type)?.color || '#cbd5e1');
    
    return (
      <div 
        key={app.id} 
        className={`border rounded p-2 shadow-sm hover:shadow-md transition-all group relative overflow-hidden ${isCanceled ? 'opacity-60' : ''}`}
        style={{ backgroundColor: `${typeColor}10`, borderColor: `${typeColor}40`, borderLeftWidth: '3px', borderLeftColor: typeColor }}
      >
         <div className="flex justify-between items-start mb-1">
            <span className={`text-xs font-bold text-slate-800 flex items-center ${isCanceled ? 'line-through' : ''}`}>
               <Clock size={12} className="text-slate-400 mr-1"/> {app.time || '00:00'}
            </span>
            <span className="text-[8px] px-1 py-0.5 rounded font-bold uppercase truncate max-w-[80px]" style={{ 
              color: typeColor,
              backgroundColor: 'white',
              border: `1px solid ${typeColor}40`
            }}>{isCanceled ? 'Cancelado' : app.type}</span>
         </div>
         <div className="flex items-center space-x-1.5 mb-1">
            <User size={10} className="text-slate-400 min-w-max"/>
            <span className={`text-xs font-medium text-slate-700 truncate ${isCanceled ? 'line-through' : ''}`}>{patient?.name || app.type}</span>
         </div>
         {professional && (
           <div className="flex items-center space-x-1.5 mb-0.5">
              <Stethoscope size={10} className="text-slate-400 min-w-max"/>
              <span className="text-[10px] text-slate-600 truncate">{professional.name}</span>
           </div>
         )}
         {service && (
           <div className="text-[9px] text-slate-500 ml-4 bg-slate-50 inline-block px-1 py-0.5 rounded truncate max-w-[90%]">
             {service.name}
           </div>
         )}
         {app.notes && (
           <p className="text-[9px] text-slate-400 mt-1 italic border-t border-slate-50 pt-1 line-clamp-1">"{app.notes}"</p>
         )}
         <div className="absolute right-1 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-0.5">
            {(app.status === 'Agendado' || app.status === apptStatuses.find(s => s.name.toLowerCase().includes('agendado'))?.name) && (
              <>
                <button onClick={() => handleQuickStatusUpdate(app, apptStatuses.find(s => s.name.toLowerCase().includes('realizado'))?.name || 'Realizado')} className="p-1 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Marcar como Realizado">
                  <CheckCircle size={12} />
                </button>
                <button onClick={() => handleQuickStatusUpdate(app, apptStatuses.find(s => s.name.toLowerCase().includes('cancelado'))?.name || 'Cancelado')} className="p-1 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors" title="Marcar como Cancelado">
                  <X size={12} />
                </button>
              </>
            )}
            <button onClick={() => openEditApptModal(app)} className="p-1 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors">
              <Edit size={12} />
            </button>
            <button onClick={() => handleDeleteClick(app.id)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
              <Trash2 size={12} />
            </button>
         </div>
      </div>
    );
  };

  // Calendar Grid Logic
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];
  
  // Empty slots for days before start of month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 bg-slate-50/50 border border-slate-100"></div>);
  }

  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
    const dateStr = formatDate(date);
    const isToday = new Date().toDateString() === date.toDateString();
    const isSelected = selectedDate.toDateString() === date.toDateString();
    
    const dailyApps = appointments.filter(a => a.date === dateStr);
    
    days.push(
      <div 
        key={d} 
        onClick={() => {
          handleDateClick(d);
          handleSlotClick(dateStr, '08:00'); // Default time for month view clicks
        }}
        className={`h-24 border border-slate-100 p-2 cursor-pointer transition-colors relative group ${isSelected ? 'bg-teal-50 border-teal-200' : 'hover:bg-slate-50 bg-white'}`}
      >
        <div className="flex justify-between items-start">
           <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-teal-600 text-white' : 'text-slate-700'}`}>
             {d}
           </span>
           {dailyApps.length > 0 && (
             <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">
               {dailyApps.length}
             </span>
           )}
        </div>
        <div className="mt-2 space-y-1">
            {dailyApps.slice(0, 2).map((app, idx) => {
                 const patient = patients.find(p => p.id === app.patientId);
                 const typeColor = apptTypes.find(t => t.name === app.type)?.color || '#cbd5e1';
                 return (
                    <div 
                      key={idx} 
                      onClick={(e) => { e.stopPropagation(); openEditApptModal(app); }}
                      className="text-[10px] truncate rounded px-1 py-0.5 flex items-center mb-0.5 hover:opacity-80 transition-opacity" 
                      style={{ backgroundColor: `${typeColor}15`, color: typeColor }}
                    >
                       <div className="w-1.5 h-1.5 rounded-full mr-1 flex-shrink-0" style={{ backgroundColor: typeColor }}></div>
                       <span className="truncate text-slate-700">{app.time} - {patient?.name ? patient.name.split(' ')[0] : app.type}</span>
                    </div>
                 )
            })}
            {dailyApps.length > 2 && (
                <div className="text-[10px] text-slate-400 pl-1">+ {dailyApps.length - 2} mais</div>
            )}
        </div>
      </div>
    );
  }

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getWeekDays = (date: Date) => {
    const start = getStartOfWeek(date);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const getHeaderTitle = () => {
    if (viewMode === 'daily') {
      return currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (viewMode === 'weekly') {
      const weekStart = getStartOfWeek(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${weekStart.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    if (viewMode === 'monthly') {
      return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
    return '';
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const selectedDayApps = getAppointmentsForDate(selectedDate);

  return (
    <div className="flex flex-col h-full min-h-0 gap-4">
      
      {/* View Controls Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-1">
            <button onClick={handlePrev} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"><ChevronLeft size={20}/></button>
            <button onClick={handleNext} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"><ChevronRight size={20}/></button>
          </div>
          <button onClick={handleToday} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Hoje
          </button>
          <h2 className="text-xl font-bold text-slate-800 capitalize min-w-[200px]">
            {getHeaderTitle()}
          </h2>
        </div>
        
        <div className="flex flex-wrap md:flex-nowrap items-center space-x-2 md:space-x-4 w-full sm:w-auto">
          <button 
            onClick={resetSampleData}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors hidden sm:block"
            title="Resetar dados de exemplo"
          >
            <Trash2 size={18} />
          </button>
          <div className="bg-slate-100 p-1 rounded-lg flex space-x-1 flex-1 sm:flex-none justify-center">
            <button onClick={() => setViewMode('daily')} className={`px-2 md:px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all flex items-center ${viewMode === 'daily' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <AlignJustify size={16} className="md:mr-1.5" /> <span className="hidden md:inline">Dia</span>
            </button>
            <button onClick={() => setViewMode('weekly')} className={`px-2 md:px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all flex items-center ${viewMode === 'weekly' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <CalendarDays size={16} className="md:mr-1.5" /> <span className="hidden md:inline">Semana</span>
            </button>
            <button onClick={() => setViewMode('monthly')} className={`px-2 md:px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all flex items-center ${viewMode === 'monthly' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <CalendarRange size={16} className="md:mr-1.5" /> <span className="hidden md:inline">Mês</span>
            </button>
          </div>
          <button onClick={openNewApptModal} className="bg-teal-600 text-white p-2 md:px-4 md:py-2 rounded-lg hover:bg-teal-700 flex items-center space-x-2 font-medium shadow-sm transition-transform active:scale-95">
            <Plus size={20} />
            <span className="hidden md:inline">Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {viewMode === 'monthly' && (
          <div className="flex flex-col lg:flex-row h-full min-h-0 gap-6">
            {/* Left: Calendar */}
            <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-0 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto flex-1 flex flex-col">
                <div className="min-w-[600px] flex-1 flex flex-col">
                  {/* Week Days */}
                  <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
                     {weekDays.map(day => (
                       <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{day}</div>
                     ))}
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 flex-1 min-h-0 overflow-y-auto">
                     {days}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Schedule List */}
            <div className="w-full lg:w-[280px] flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col min-h-0">
               <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Agenda do Dia</h3>
                    <p className="text-[10px] text-slate-500 capitalize">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  </div>
               </div>

               <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                  {waitlist.length > 0 && selectedDayApps.length < 12 && (
                    <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 flex items-start space-x-3 mb-4 animate-pulse">
                      <div className="bg-teal-100 p-1.5 rounded-full text-teal-600">
                        <Bell size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-teal-800">Horário Disponível!</p>
                        <p className="text-[10px] text-teal-600 mt-0.5">
                          Existem {waitlist.length} {waitlist.length === 1 ? 'paciente' : 'pacientes'} na lista de espera que {waitlist.length === 1 ? 'pode' : 'podem'} ser {waitlist.length === 1 ? 'encaixado' : 'encaixados'} hoje.
                        </p>
                        <button 
                          onClick={() => setShowWaitlistModal(true)}
                          className="text-[10px] font-bold text-teal-700 hover:text-teal-900 uppercase mt-2"
                        >
                          Ver Lista
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {selectedDayApps.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <CalendarIcon size={48} className="mb-3 opacity-20"/>
                  <p className="text-sm">Nenhum agendamento para este dia.</p>
                  <button onClick={openNewApptModal} className="mt-2 text-teal-600 text-sm font-medium hover:underline">Adicionar novo?</button>
               </div>
             ) : (
               selectedDayApps.map(app => renderAgendaDoDiaCard(app))
             )}
               </div>
            </div>
          </div>
        )}

        {viewMode === 'daily' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 h-full overflow-y-auto p-6">
             <h3 className="text-lg font-bold text-slate-800 mb-6">Visão Diária</h3>
             
             {waitlist.length > 0 && getAppointmentsForDate(currentDate).length < 12 && (
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex items-center justify-between mb-8 animate-pulse shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="bg-teal-100 p-2.5 rounded-full text-teal-600">
                      <Bell size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-teal-900">Oportunidade de Encaixe</p>
                      <p className="text-sm text-teal-700">
                        Você tem {waitlist.length} {waitlist.length === 1 ? 'paciente' : 'pacientes'} na lista de espera e horários disponíveis hoje.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowWaitlistModal(true)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 uppercase tracking-wider"
                  >
                    Ver Lista
                  </button>
                </div>
             )}
             
             <div className="space-y-4">
               {/* Daily view implementation */}
               {Array.from({length: 14}, (_, i) => i + 7).map(hour => {
                 const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                 const appsInHour = getAppointmentsForDate(currentDate).filter(a => {
                   if (!a.time) return false;
                   const [h] = a.time.split(':');
                   return parseInt(h) === hour;
                 });
                 
                 return (
                   <div key={hour} className="flex border-t border-slate-100 pt-2">
                     <div className="w-16 text-right pr-4 text-sm font-medium text-slate-500">{timeStr}</div>
                     <div 
                       className="flex-1 min-h-[30px] relative cursor-pointer hover:bg-slate-50/50 rounded transition-colors"
                       onClick={() => handleSlotClick(formatDate(currentDate), timeStr)}
                     >
                       {appsInHour.map(app => {
                         const patient = patients.find(p => p.id === app.patientId);
                         const professional = professionals.find(p => p.id === app.professionalId);
                         const isCanceled = app.status?.toLowerCase() === 'cancelado';
                         const typeColor = isCanceled ? '#cc0000' : (apptTypes.find(t => t.name === app.type)?.color || '#cbd5e1');
                         return (
                           <div 
                             key={app.id} 
                             onClick={(e) => { e.stopPropagation(); openEditApptModal(app); }}
                             className={`mb-2 p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${isCanceled ? 'opacity-60' : ''}`}
                             style={{ backgroundColor: `${typeColor}10`, borderColor: `${typeColor}40`, borderLeftWidth: '4px', borderLeftColor: typeColor }}
                           >
                             <div className="flex justify-between items-start">
                               <span className={`font-bold text-slate-800 text-sm ${isCanceled ? 'line-through' : ''}`}>{patient?.name || app.type}</span>
                               <span className="text-xs font-bold px-2 py-0.5 rounded bg-white text-slate-600" style={{ color: typeColor, border: `1px solid ${typeColor}40` }}>{isCanceled ? 'CANCELADO' : app.type}</span>
                             </div>
                             <div className="text-xs text-slate-600 mt-1 flex items-center">
                               <Clock size={12} className="mr-1 text-slate-400"/> {app.time}
                               {professional && <><Stethoscope size={12} className="ml-3 mr-1 text-slate-400"/> {professional.name}</>}
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>
        )}

        {viewMode === 'weekly' && (
          <div className="flex flex-col lg:flex-row h-full min-h-0 gap-6">
            {/* Left: Calendar */}
            <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-0 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto flex-1 flex flex-col">
                <div className="min-w-[1000px] flex-1 flex flex-col">
                  {/* Week Header */}
                  <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-100 bg-slate-50 flex-shrink-0">
                    <div className="py-3 border-r border-slate-100"></div>
                    {(() => {
                      const weekDates = getWeekDays(currentDate);
                      return weekDates.map((d, i) => {
                        const isToday = new Date().toDateString() === d.toDateString();
                        const isSelected = selectedDate.toDateString() === d.toDateString();
                        return (
                          <div 
                            key={i} 
                            onClick={() => handleDateClick(d.getDate())}
                            className={`py-3 text-center border-r border-slate-100 cursor-pointer transition-colors ${isSelected ? 'bg-teal-50' : 'hover:bg-slate-50'} ${isToday && !isSelected ? 'bg-slate-50' : ''}`}
                          >
                            <div className="text-xs font-semibold text-slate-500 uppercase">{weekDays[i]}</div>
                            <div className={`text-lg font-display font-bold mt-1 ${isToday ? 'text-teal-600' : 'text-slate-800'}`}>{d.getDate()}</div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  
                  {/* Scrollable Grid */}
                  <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                    {Array.from({length: 14}, (_, i) => i + 7).map(hour => {
                       const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                       const weekDates = getWeekDays(currentDate);
                       const weekDateStrings = weekDates.map(d => formatDate(d));
                       const weekAppointments = appointments.filter(a => weekDateStrings.includes(a.date));

                       return (
                         <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-100 min-h-[60px]">
                           <div className="text-center py-2 text-xs font-medium text-slate-500 border-r border-slate-100 bg-slate-50/50">{timeStr}</div>
                           {weekDates.map((d, dayIdx) => {
                              const dateStr = formatDate(d);
                              const isSelected = selectedDate.toDateString() === d.toDateString();
                              const appsInSlot = weekAppointments.filter(a => {
                                if (!a.time) return false;
                                const [h] = a.time.split(':');
                                return a.date === dateStr && parseInt(h) === hour;
                              });
                              
                              return (
                                <div 
                                  key={dayIdx} 
                                  onClick={(e) => {
                                    handleDateClick(d.getDate());
                                    handleSlotClick(dateStr, timeStr);
                                  }}
                                  className={`border-r border-slate-100 p-1 relative cursor-pointer transition-colors flex flex-col justify-start ${isSelected ? 'bg-teal-50/30' : 'hover:bg-slate-50/50'}`}
                                >
                                  {appsInSlot.map(app => {
                                    const patient = patients.find(p => p.id === app.patientId);
                                    const professional = professionals.find(p => p.id === app.professionalId);
                                    const isCanceled = app.status?.toLowerCase() === 'cancelado';
                                    const typeColor = isCanceled ? '#cc0000' : (apptTypes.find(t => t.name === app.type)?.color || '#cbd5e1');
                                    return (
                                      <div 
                                        key={app.id} 
                                        onClick={(e) => { e.stopPropagation(); openEditApptModal(app); }}
                                        className={`mb-1 px-1.5 py-1 rounded cursor-pointer hover:shadow-md transition-all overflow-hidden flex flex-col justify-center min-h-[36px] border border-black/5 ${isCanceled ? 'opacity-60' : ''}`}
                                        style={{ backgroundColor: typeColor, color: '#ffffff' }}
                                        title={`${app.time} - ${patient?.name || app.type}`}
                                      >
                                        <div className={`font-bold text-[10px] leading-snug truncate ${isCanceled ? 'line-through' : ''}`}>{patient?.name || app.type}</div>
                                        <div className="text-[9px] leading-tight truncate mt-0.5 text-white/90">{app.time} {isCanceled ? '(Cancelado)' : (professional ? `- ${professional.name.split(' ').slice(0, 1).join(' ')}` : '')}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                           })}
                         </div>
                       );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Schedule List */}
            <div className="w-full lg:w-[280px] flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col min-h-0">
               <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Agenda do Dia</h3>
                    <p className="text-[10px] text-slate-500 capitalize">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  </div>
               </div>

               <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                  {waitlist.length > 0 && selectedDayApps.length < 12 && (
                    <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 flex items-start space-x-3 mb-4 animate-pulse">
                      <div className="bg-teal-100 p-1.5 rounded-full text-teal-600">
                        <Bell size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-teal-800">Horário Disponível!</p>
                        <p className="text-[10px] text-teal-600 mt-0.5">
                          Existem {waitlist.length} {waitlist.length === 1 ? 'paciente' : 'pacientes'} na lista de espera que {waitlist.length === 1 ? 'pode' : 'podem'} ser {waitlist.length === 1 ? 'encaixado' : 'encaixados'} hoje.
                        </p>
                        <button 
                          onClick={() => setShowWaitlistModal(true)}
                          className="text-[10px] font-bold text-teal-700 hover:text-teal-900 uppercase mt-2"
                        >
                          Ver Lista
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {selectedDayApps.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <CalendarIcon size={48} className="mb-3 opacity-20"/>
                  <p className="text-sm">Nenhum agendamento para este dia.</p>
                  <button onClick={openNewApptModal} className="mt-2 text-teal-600 text-sm font-medium hover:underline">Adicionar novo?</button>
               </div>
             ) : (
               selectedDayApps.map(app => renderAgendaDoDiaCard(app))
             )}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* New Appointment Modal (Simplified version for Agenda) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  {editingAppointmentId ? (
                    <><Edit size={18} className="mr-2 text-teal-600"/> Editar Agendamento</>
                  ) : (
                    <><Plus size={18} className="mr-2 text-teal-600"/> Novo Agendamento</>
                  )}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white p-1 rounded-full border border-slate-200 hover:bg-slate-100"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleCreateAppointment} className="space-y-5">
                
                {/* Patient Select (Crucial for Agenda view) */}
                <div>
                   <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Paciente (Opcional)</label>
                      {!editingAppointmentId && (
                        <button 
                          type="button"
                          onClick={() => setShowQuickPatientForm(!showQuickPatientForm)}
                          className="text-teal-600 text-[10px] font-bold flex items-center hover:underline"
                        >
                          {showQuickPatientForm ? (
                            <><X size={12} className="mr-1" /> Cancelar</>
                          ) : (
                            <><UserPlus size={12} className="mr-1" /> Cadastrar Novo</>
                          )}
                        </button>
                      )}
                   </div>

                   {showQuickPatientForm ? (
                     <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div>
                          <input 
                            type="text" 
                            placeholder="Nome completo do paciente" 
                            value={quickPatientName}
                            onChange={e => setQuickPatientName(e.target.value)}
                            className="w-full border border-teal-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <input 
                            type="text" 
                            placeholder="Telefone (opcional)" 
                            value={quickPatientPhone}
                            onChange={e => setQuickPatientPhone(e.target.value)}
                            className="flex-1 border border-teal-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                          />
                          <button 
                            type="button"
                            onClick={handleQuickPatientSave}
                            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors"
                          >
                            Salvar
                          </button>
                        </div>
                     </div>
                   ) : (
                     <div className="relative">
                        <select 
                          disabled={!!editingAppointmentId}
                          value={newApptPatientId} 
                          onChange={e => setNewApptPatientId(e.target.value)} 
                          className={`w-full border border-slate-300 p-2.5 pr-8 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none appearance-none text-slate-700 ${editingAppointmentId ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'}`}
                        >
                          <option value="">Nenhum (Tarefa/Reunião)</option>
                          {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                          <ChevronDown size={16} />
                        </div>
                     </div>
                   )}
                   {patients.length === 0 && !showQuickPatientForm && <p className="text-xs text-slate-500 mt-1">Nenhum paciente cadastrado.</p>}
                </div>

                {/* Professional Select */}
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Profissional (Opcional)</label>
                   <div className="relative">
                      <select 
                        value={newApptProfessionalId} 
                        onChange={e => setNewApptProfessionalId(e.target.value)} 
                        className="w-full border border-slate-300 p-2.5 pr-8 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white appearance-none text-slate-700"
                      >
                        <option value="">Nenhum</option>
                        {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                        <ChevronDown size={16} />
                      </div>
                   </div>
                   {professionals.length === 0 && <p className="text-xs text-red-500 mt-1">Cadastre um profissional primeiro na aba Serviços.</p>}
                </div>

                <div className="grid grid-cols-2 gap-5">
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Data</label>
                     <input required type="date" value={newApptDate} onChange={e => setNewApptDate(e.target.value)} className="w-full border border-slate-300 bg-white p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-700" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Horário</label>
                     <input required type="time" value={newApptTime} onChange={e => setNewApptTime(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-slate-700" />
                   </div>
                </div>

                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Serviço (Opcional)</label>
                   <div className="relative">
                     <select 
                        value={newApptServiceId} 
                        onChange={(e) => {
                            const sId = e.target.value;
                            setNewApptServiceId(sId);
                            const s = services.find(srv => srv.id === sId);
                            if(s) setNewApptPrice(s.price.toString());
                        }} 
                        className="w-full border border-slate-300 p-2.5 pr-8 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white appearance-none text-slate-700"
                     >
                       <option value="">Selecione...</option>
                       {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price.toFixed(2)}</option>)}
                     </select>
                     <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                        <ChevronDown size={16} />
                     </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Tipo</label>
                     <div className="relative">
                        <select 
                        value={newApptType} 
                        onChange={e => setNewApptType(e.target.value)} 
                        className="w-full border border-slate-300 p-2.5 pr-8 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white appearance-none text-slate-700"
                        >
                        {apptTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                           <ChevronDown size={16} />
                        </div>
                     </div>
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Status</label>
                     <div className="relative">
                        <select 
                        value={newApptStatus} 
                        onChange={e => setNewApptStatus(e.target.value)} 
                        className="w-full border border-slate-300 p-2.5 pr-8 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white appearance-none text-slate-700"
                        >
                          {apptStatuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                           <ChevronDown size={16} />
                        </div>
                     </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Valor (R$)</label>
                     <input required type="number" placeholder="0.00" value={newApptPrice} onChange={e => setNewApptPrice(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-slate-700" />
                   </div>
                </div>



                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Observações</label>
                   <textarea rows={3} placeholder="Detalhes opcionais..." value={newApptNotes} onChange={e => setNewApptNotes(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none resize-none bg-white text-slate-700"></textarea>
                </div>

                <button type="submit" className="w-full bg-teal-600 text-white py-3.5 rounded-lg font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 flex justify-center items-center">
                  <CheckCircle size={20} className="mr-2" /> {editingAppointmentId ? 'Salvar Alterações' : 'Agendar'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Waitlist Modal */}
      {showWaitlistModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <Bell size={20} className="mr-2 text-teal-600" /> Lista de Espera
              </h3>
              <button onClick={() => setShowWaitlistModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white p-1 rounded-full border border-slate-200 hover:bg-slate-100">
                <X size={20}/>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {waitlist.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <p>Nenhum paciente na lista de espera.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {waitlist.map((item) => {
                    const patient = patients.find(p => p.id === item.patientId);
                    return (
                      <div key={item.id} className="p-4 border border-slate-100 rounded-xl hover:border-teal-100 hover:bg-teal-50/30 transition-all group">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-slate-800">{patient?.name || item.type}</p>
                            <p className="text-xs text-slate-500 mt-0.5 font-medium">{item.type}</p>
                            {item.notes && <p className="text-xs text-slate-400 mt-2 italic">"{item.notes}"</p>}
                          </div>
                          <div className="flex flex-col items-end space-y-3">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
                              {item.createdAt.split('-').reverse().join('/')}
                            </span>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEncaixe(item)}
                                className="bg-teal-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm"
                              >
                                Encaixar
                              </button>
                              <button 
                                onClick={() => handleRemoveFromWaitlist(item.id)}
                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={() => setShowWaitlistModal(false)}
                className="w-full py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
             <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Agendamento?</h3>
                <p className="text-slate-500 mb-6">
                  Esta ação não poderá ser desfeita. O agendamento será removido permanentemente.
                </p>
                <div className="flex w-full space-x-3">
                   <button 
                     onClick={() => setShowDeleteModal(false)} 
                     className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                   >
                     Cancelar
                   </button>
                   <button 
                     onClick={confirmDelete} 
                     className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                   >
                     Excluir
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
