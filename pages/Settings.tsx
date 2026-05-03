
import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { FinancialCategory, TransactionType, AppointmentTypeConfig, AppointmentStatusConfig, CompanySettings } from '../types';
import { Settings as SettingsIcon, Plus, Edit2, Trash2, X, Save, AlertCircle, TrendingUp, TrendingDown, Calendar, CheckCircle, Building2 } from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'company' | 'financial' | 'appointments' | 'statuses'>('company');
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [apptTypes, setApptTypes] = useState<AppointmentTypeConfig[]>([]);
  const [apptStatuses, setApptStatuses] = useState<AppointmentStatusConfig[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings>({ name: '', slogan: '', logoUrl: '' });
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [financialType, setFinancialType] = useState<TransactionType>(TransactionType.INCOME);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCategories(StorageService.getCategories());
    setApptTypes(StorageService.getAppointmentTypes());
    setApptStatuses(StorageService.getAppointmentStatuses());
    setCompanySettings(StorageService.getCompanySettings());
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveCompanySettings(companySettings);
    // Force a small reload for the layout headers or just show success
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      window.location.reload(); // Simple way to let layout get updated changes immediately
    }, 1500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (activeTab === 'financial') {
      const category: FinancialCategory = {
        id: editingId || '',
        name: name.trim(),
        type: financialType
      };
      StorageService.saveCategory(category);
    } else if (activeTab === 'appointments') {
      const type: AppointmentTypeConfig = {
        id: editingId || '',
        name: name.trim(),
        color: color
      };
      StorageService.saveAppointmentType(type);
    } else {
      const status: AppointmentStatusConfig = {
        id: editingId || '',
        name: name.trim(),
        color: color
      };
      StorageService.saveAppointmentStatus(status);
    }

    setShowModal(false);
    resetForm();
    loadData();
  };

  const handleEdit = (item: FinancialCategory | AppointmentTypeConfig) => {
    setEditingId(item.id);
    setName(item.name);
    if ('type' in item) {
      setFinancialType(item.type);
    } else if ('color' in item) {
      setColor(item.color || '#3b82f6');
    }
    setShowModal(true);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      if (activeTab === 'financial') {
        StorageService.deleteCategory(itemToDelete);
      } else if (activeTab === 'appointments') {
        StorageService.deleteAppointmentType(itemToDelete);
      } else {
        StorageService.deleteAppointmentStatus(itemToDelete);
      }
      loadData();
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setColor('#3b82f6');
    setFinancialType(TransactionType.INCOME);
  };

  const openNewModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 bg-slate-100 p-1 rounded-xl w-full sm:w-fit overflow-x-auto">
        <button 
          onClick={() => setActiveTab('company')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'company' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Minha Clínica
        </button>
        <button 
          onClick={() => setActiveTab('financial')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'financial' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Categorias Financeiras
        </button>
        <button 
          onClick={() => setActiveTab('appointments')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'appointments' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Tipos de Agendamento
        </button>
        <button 
          onClick={() => setActiveTab('statuses')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'statuses' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Status de Agendamento
        </button>
      </div>

      {activeTab !== 'company' && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
          <h2 className="text-lg font-bold text-slate-700">
            {activeTab === 'financial' ? 'Gestão de Categorias' : activeTab === 'appointments' ? 'Tipos de Agendamento' : 'Status de Agendamento'}
          </h2>
          <button 
            onClick={openNewModal}
            className="w-full sm:w-auto bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center justify-center space-x-2 text-sm font-medium shadow-lg shadow-teal-600/20"
          >
            <Plus size={18} /> <span>{activeTab === 'financial' ? 'Nova Categoria' : activeTab === 'appointments' ? 'Novo Tipo' : 'Novo Status'}</span>
          </button>
        </div>
      )}

      {activeTab === 'company' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden max-w-2xl">
          <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-700 flex items-center">
              <Building2 size={18} className="text-teal-600 mr-2" />
              Configurações da Empresa
            </h3>
            {savedSuccess && (
              <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center">
                <CheckCircle size={14} className="mr-1" /> Salvo com sucesso
              </span>
            )}
          </div>
          <form onSubmit={handleSaveCompany} className="p-6 space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Nome da Clínica / Profissional</label>
              <input 
                required 
                type="text" 
                value={companySettings.name} 
                onChange={e => setCompanySettings({...companySettings, name: e.target.value})}
                className="w-full border border-slate-200 p-2.5 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-700"
                placeholder="Ex: FisioCale ou Dra. Julia"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Slogan ou Subtítulo</label>
              <input 
                type="text" 
                value={companySettings.slogan} 
                onChange={e => setCompanySettings({...companySettings, slogan: e.target.value})}
                className="w-full border border-slate-200 p-2.5 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-teal-500 text-slate-600"
                placeholder="Ex: Saúde e Bem-estar"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">URL do Logotipo (Opcional)</label>
              <input 
                type="url" 
                value={companySettings.logoUrl} 
                onChange={e => setCompanySettings({...companySettings, logoUrl: e.target.value})}
                className="w-full border border-slate-200 p-2.5 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-teal-500 text-slate-600"
                placeholder="https://exemplo.com/logo.png"
              />
              <p className="text-xs text-slate-400 mt-1 italic">
                Deixe em branco para usar o logotipo texto padrão. Você pode hospedar sua imagem em sites como Imgur e colar o link direto aqui.
              </p>
            </div>
            
            {(companySettings.logoUrl || '') !== '' && (
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Preview do Logo:</p>
                <div className="p-3 border rounded-lg bg-slate-50 inline-block">
                  <img src={companySettings.logoUrl} alt="Logo preview" className="max-h-12 object-contain" onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-off"><line x1="2" x2="22" y1="2" y2="22"/><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/><line x1="13.5" x2="6" y1="13.5" y2="21"/><line x1="18" x2="21" y1="12" y2="15"/><path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.05-.22 1.41-.59"/><path d="M21 15V5a2 2 0 0 0-2-2H9"/></svg>' }} />
                </div>
              </div>
            )}
            
            <div className="pt-4 flex justify-end">
              <button 
                type="submit"
                className="bg-teal-600 text-white px-6 py-2.5 rounded-lg hover:bg-teal-700 flex items-center justify-center space-x-2 text-sm font-bold shadow-lg shadow-teal-600/20 transition-all active:scale-95"
              >
                <Save size={18} /> <span>Salvar Configurações</span>
              </button>
            </div>
          </form>
        </div>
      ) : activeTab === 'financial' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Income Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-700 flex items-center">
                <TrendingUp size={18} className="text-green-500 mr-2" />
                Entradas
              </h3>
              <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100">
                {categories.filter(c => c.type === TransactionType.INCOME).length}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {categories.filter(c => c.type === TransactionType.INCOME).map(category => (
                <div key={category.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <span className="font-bold text-[14px] text-[#2d3748]">{category.name}</span>
                  <div className="flex items-center space-x-1">
                    <button onClick={() => handleEdit(category)} className="p-1.5 text-slate-300 hover:text-teal-600 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDeleteClick(category.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expense Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-700 flex items-center">
                <TrendingDown size={18} className="text-red-500 mr-2" />
                Saídas
              </h3>
              <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100">
                {categories.filter(c => c.type === TransactionType.EXPENSE).length}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {categories.filter(c => c.type === TransactionType.EXPENSE).map(category => (
                <div key={category.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <span className="font-bold text-[14px] text-[#2d3748]">{category.name}</span>
                  <div className="flex items-center space-x-1">
                    <button onClick={() => handleEdit(category)} className="p-1.5 text-slate-300 hover:text-teal-600 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDeleteClick(category.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'appointments' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden max-w-2xl">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-700 flex items-center">
              <Calendar size={18} className="text-teal-500 mr-2" />
              Tipos de Agendamento
            </h3>
            <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100">
              {apptTypes.length}
            </span>
          </div>
            <div className="divide-y divide-slate-100">
            {apptTypes.map(type => (
              <div key={type.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className="w-3.5 h-3.5 rounded-md shadow-sm border border-white" style={{ backgroundColor: type.color || '#cbd5e1' }}></div>
                  <span className="font-bold text-[14px] text-[#2d3748]">{type.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button onClick={() => handleEdit(type)} className="p-1.5 text-slate-300 hover:text-teal-600 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDeleteClick(type.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {apptTypes.length === 0 && (
              <div className="px-6 py-10 text-center text-slate-400 italic text-sm">
                Nenhum tipo de agendamento cadastrado.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden max-w-2xl">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-700 flex items-center">
              <CheckCircle size={18} className="text-teal-500 mr-2" />
              Status de Agendamento
            </h3>
            <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100">
              {apptStatuses.length}
            </span>
          </div>
            <div className="divide-y divide-slate-100">
            {apptStatuses.map(status => (
              <div key={status.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className="w-3.5 h-3.5 rounded-md shadow-sm border border-white" style={{ backgroundColor: status.color || '#cbd5e1' }}></div>
                  <span className="font-bold text-[14px] text-[#2d3748]">{status.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button onClick={() => handleEdit(status)} className="p-1.5 text-slate-300 hover:text-teal-600 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDeleteClick(status.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {apptStatuses.length === 0 && (
              <div className="px-6 py-10 text-center text-slate-400 italic text-sm">
                Nenhum status de agendamento cadastrado.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              {editingId ? 'Editar' : 'Novo'} {activeTab === 'financial' ? 'Categoria' : activeTab === 'appointments' ? 'Tipo de Agendamento' : 'Status de Agendamento'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Nome</label>
                <input 
                  required 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full border p-2 rounded mt-1 outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder={activeTab === 'financial' ? "Ex: Aluguel, Marketing..." : activeTab === 'appointments' ? "Ex: Consulta, Avaliação..." : "Ex: Agendado, Confirmado..."}
                />
              </div>
              
              {(activeTab === 'appointments' || activeTab === 'statuses') && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Cor</label>
                  <div className="flex items-center space-x-3 mt-1">
                    <input 
                      type="color" 
                      value={color} 
                      onChange={e => setColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-none p-0 bg-transparent"
                    />
                    <span className="text-sm text-slate-500 font-mono uppercase">{color}</span>
                  </div>
                </div>
              )}
              
              {activeTab === 'financial' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Movimentação</label>
                  <select 
                    value={financialType} 
                    onChange={e => setFinancialType(e.target.value as TransactionType)}
                    className="w-full border p-2 rounded mt-1 bg-white outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value={TransactionType.INCOME}>Entrada</option>
                    <option value={TransactionType.EXPENSE}>Saída</option>
                  </select>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 flex items-center justify-center"
                >
                  <Save size={18} className="mr-2" /> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
             <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Item?</h3>
                <p className="text-slate-500 mb-6">
                  Esta ação não poderá ser desfeita.
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
                     Sim, Excluir
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
