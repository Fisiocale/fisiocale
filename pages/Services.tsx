
import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Service, Professional } from '../types';
import { Plus, Edit2, Trash2, Clock, DollarSign, User, Mail, Phone, BadgeCheck, AlertCircle } from 'lucide-react';

const Services: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'services' | 'professionals'>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Form States
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Service Form Fields
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');

  // Professional Form Fields
  const [profName, setProfName] = useState('');
  const [profSpecialty, setProfSpecialty] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [profReg, setProfReg] = useState('');
  const [profColor, setProfColor] = useState('#0ea5e9');

  const PROF_COLORS = [
    '#0ea5e9', // sky-500
    '#8b5cf6', // violet-500
    '#f43f5e', // rose-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#64748b', // slate-500
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setServices(StorageService.getServices());
    setProfessionals(StorageService.getProfessionals());
  };

  const openModal = (item?: Service | Professional) => {
    setEditingId(item ? item.id : null);
    if (activeTab === 'services') {
      const s = item as Service;
      setServiceName(s ? s.name : '');
      setServiceDesc(s ? s.description : '');
      setServicePrice(s ? s.price.toString() : '');
      setServiceDuration(s ? s.duration.toString() : '');
    } else {
      const p = item as Professional;
      setProfName(p ? p.name : '');
      setProfSpecialty(p ? p.specialty : '');
      setProfEmail(p ? p.email : '');
      setProfPhone(p ? p.phone : '');
      setProfReg(p ? p.registrationNumber : '');
      setProfColor(p && p.color ? p.color : '#0ea5e9');
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'services') {
      const newService: Service = {
        id: editingId || '',
        name: serviceName,
        description: serviceDesc,
        price: Number(servicePrice),
        duration: Number(serviceDuration)
      };
      StorageService.saveService(newService);
    } else {
      const newProf: Professional = {
        id: editingId || '',
        name: profName,
        specialty: profSpecialty,
        email: profEmail,
        phone: profPhone,
        registrationNumber: profReg,
        color: profColor
      };
      StorageService.saveProfessional(newProf);
    }
    setShowModal(false);
    loadData();
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      if (activeTab === 'services') {
        StorageService.deleteService(itemToDelete);
      } else {
        StorageService.deleteProfessional(itemToDelete);
      }
      loadData();
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 bg-slate-100 p-1 rounded-xl w-full sm:w-fit overflow-x-auto">
        <button 
          onClick={() => setActiveTab('services')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'services' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Serviços & Valores
        </button>
        <button 
          onClick={() => setActiveTab('professionals')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'professionals' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Profissionais
        </button>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
        <div>
           <h2 className="text-lg font-bold text-slate-700">
             {activeTab === 'services' ? 'Gestão de Serviços' : 'Gestão de Profissionais'}
           </h2>
           <p className="text-slate-500 text-sm hidden sm:block">Gerencie os tratamentos oferecidos e a equipe da clínica.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="w-full sm:w-auto bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center justify-center space-x-2 text-sm font-medium shadow-lg shadow-teal-600/20"
        >
          <Plus size={18} />
          <span>{activeTab === 'services' ? 'Novo Serviço' : 'Novo Profissional'}</span>
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {activeTab === 'services' ? (
          <>
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[#f8fafc] border-b border-slate-100 text-[13px] font-bold text-slate-500 uppercase">
              <div className="col-span-3">Serviço</div>
              <div className="col-span-4">Descrição</div>
              <div className="col-span-2">Duração</div>
              <div className="col-span-2">Valor</div>
              <div className="col-span-1 text-right">Ações</div>
            </div>
            <div className="divide-y divide-transparent md:divide-slate-100 p-2 md:p-0">
              {services.map(s => (
                <div key={s.id} className="p-4 md:px-6 md:py-5 hover:bg-slate-50 transition-colors flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center relative border border-slate-100/50 md:border-none rounded-2xl md:rounded-none mb-3 md:mb-0">
                  
                  {/* Action buttons (Mobile: Top Right absolute, Desktop: normal col) */}
                  <div className="absolute top-4 right-4 md:static md:col-span-1 flex justify-end md:justify-end md:order-last">
                    <div className="flex items-center space-x-1 bg-slate-50 md:bg-transparent px-2 py-1 md:p-0 rounded-lg md:rounded-none">
                      <button onClick={() => openModal(s)} className="p-1.5 text-slate-400 hover:text-teal-600 transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteClick(s.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  <div className="col-span-3 flex flex-col md:block mb-3 md:mb-0 pr-16 md:pr-0">
                    <span className="md:hidden text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Serviço</span>
                    <span className="font-bold text-[#2d3748] text-[15px]">{s.name}</span>
                  </div>
                  
                  <div className="col-span-4 flex flex-col md:block mb-3 md:mb-0">
                    <span className="md:hidden text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Descrição</span>
                    <span className="text-slate-500 text-[14px] md:text-[15px] font-medium md:truncate block leading-snug">{s.description}</span>
                  </div>

                  <div className="col-span-2 flex justify-between items-center md:block mb-2 md:mb-0">
                    <span className="md:hidden text-[13px] text-slate-500 font-bold">Duração:</span>
                    <div className="flex items-center text-slate-500 font-medium text-[14px] md:text-[15px]">
                      <Clock size={14} className="mr-1.5 text-slate-400"/> {s.duration} min
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-between items-center md:block md:mb-0">
                    <span className="md:hidden text-[13px] text-slate-500 font-bold">Valor:</span>
                    <span className="text-teal-600 font-bold text-[15px]">
                       R$ {s.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <div className="p-8 text-center text-slate-400">Nenhum serviço cadastrado.</div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase">
              <div className="col-span-3">Profissional</div>
              <div className="col-span-3">Especialidade</div>
              <div className="col-span-2">Registro</div>
              <div className="col-span-3">Contato</div>
              <div className="col-span-1 text-right">Ações</div>
            </div>
            <div className="divide-y divide-transparent md:divide-slate-100 p-2 md:p-0">
              {professionals.map(p => (
                <div key={p.id} className="p-4 md:px-6 md:py-5 hover:bg-slate-50 transition-colors flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center relative border border-slate-100/50 md:border-none rounded-2xl md:rounded-none mb-3 md:mb-0">
                  
                  {/* Action buttons (Mobile: Top Right absolute, Desktop: normal col) */}
                  <div className="absolute top-4 right-4 md:static md:col-span-1 flex justify-end md:justify-end md:order-last">
                    <div className="flex items-center space-x-1 bg-slate-50 md:bg-transparent px-2 py-1 md:p-0 rounded-lg md:rounded-none">
                      <button onClick={() => openModal(p)} className="p-1.5 text-slate-400 hover:text-teal-600 transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteClick(p.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  <div className="col-span-3 flex items-center space-x-3 mb-4 md:mb-0 pr-16 md:pr-0">
                    <div 
                      className="w-10 h-10 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white font-bold text-[15px] md:text-xs flex-shrink-0"
                      style={{ backgroundColor: p.color || '#cbd5e1' }}
                    >
                      {p.name.charAt(0)}
                    </div>
                    <span className="font-bold text-[#2d3748] text-[15px] truncate">{p.name}</span>
                  </div>
                  
                  <div className="col-span-3 flex justify-between items-center md:block mb-2 md:mb-0">
                    <span className="md:hidden text-[13px] text-slate-500 font-bold">Especialidade:</span>
                    <span className="text-[14px] md:text-sm text-slate-600 font-medium truncate">{p.specialty}</span>
                  </div>

                  <div className="col-span-2 flex justify-between items-center md:block mb-2 md:mb-0">
                    <span className="md:hidden text-[13px] text-slate-500 font-bold">Registro:</span>
                    <span className="text-[13px] md:text-sm text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded inline-block">{p.registrationNumber}</span>
                  </div>

                  <div className="col-span-3 flex justify-between items-center md:block md:mb-0">
                    <span className="md:hidden text-[13px] text-slate-500 font-bold">Contato:</span>
                    <div className="flex flex-col items-end md:items-start text-[13px] md:text-xs text-slate-500 space-y-1">
                      <span className="flex items-center"><Mail size={12} className="mr-1.5 flex-shrink-0"/> <span className="truncate">{p.email}</span></span>
                      <span className="flex items-center"><Phone size={12} className="mr-1.5 flex-shrink-0"/> <span className="truncate">{p.phone}</span></span>
                    </div>
                  </div>
                </div>
              ))}
              {professionals.length === 0 && (
                <div className="p-8 text-center text-slate-400">Nenhum profissional cadastrado.</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Main Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? 'Editar' : 'Novo'} {activeTab === 'services' ? 'Serviço' : 'Profissional'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:bg-slate-200 rounded-full p-1"><Trash2 size={0} /><span className="text-xl font-bold">&times;</span></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {activeTab === 'services' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Serviço</label>
                    <input required type="text" value={serviceName} onChange={e => setServiceName(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Ex: Consulta Geral" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                    <textarea value={serviceDesc} onChange={e => setServiceDesc(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={3} placeholder="Detalhes do serviço..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preço (R$)</label>
                       <div className="relative">
                         <DollarSign size={16} className="absolute left-3 top-3 text-slate-400"/>
                         <input required type="number" step="0.01" value={servicePrice} onChange={e => setServicePrice(e.target.value)} className="w-full border border-slate-300 p-2.5 pl-9 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                       </div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duração (min)</label>
                       <div className="relative">
                         <Clock size={16} className="absolute left-3 top-3 text-slate-400"/>
                         <input required type="number" value={serviceDuration} onChange={e => setServiceDuration(e.target.value)} className="w-full border border-slate-300 p-2.5 pl-9 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                       </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                    <div className="relative">
                        <User size={18} className="absolute left-3 top-2.5 text-slate-400"/>
                        <input required type="text" value={profName} onChange={e => setProfName(e.target.value)} className="w-full border border-slate-300 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Dr. Nome Sobrenome" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Especialidade</label>
                        <input required type="text" value={profSpecialty} onChange={e => setProfSpecialty(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Ex: Fisioterapeuta" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Registro (CRM/Outro)</label>
                        <input required type="text" value={profReg} onChange={e => setProfReg(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="12345/UF" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                    <div className="relative">
                        <Mail size={18} className="absolute left-3 top-2.5 text-slate-400"/>
                        <input required type="email" value={profEmail} onChange={e => setProfEmail(e.target.value)} className="w-full border border-slate-300 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone</label>
                    <div className="relative">
                        <Phone size={18} className="absolute left-3 top-2.5 text-slate-400"/>
                        <input required type="tel" value={profPhone} onChange={e => setProfPhone(e.target.value)} className="w-full border border-slate-300 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cor na Agenda</label>
                    <div className="flex space-x-3">
                      {PROF_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setProfColor(color)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${profColor === color ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'}`}
                          style={{ backgroundColor: color }}
                        >
                          {profColor === color && <div className="w-3 h-3 bg-white rounded-full"></div>}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-slate-600 bg-slate-100 rounded-lg font-medium hover:bg-slate-200">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 shadow-md">Salvar</button>
              </div>
            </form>
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
                <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Item?</h3>
                <p className="text-slate-500 mb-6">
                  Esta ação não poderá ser desfeita. O item será removido permanentemente.
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

export default Services;
