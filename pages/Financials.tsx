import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Transaction, TransactionType, Patient, FinancialCategory } from '../types';
import { Plus, Trash2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Edit2, AlertCircle, User, Search, Filter } from 'lucide-react';

const Financials: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [showFilters, setShowFilters] = useState(false);
  
  // Delete Confirmation State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [patientId, setPatientId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const t = StorageService.getTransactions();
    const p = StorageService.getPatients();
    const c = StorageService.getCategories();
    // Sort by date desc
    t.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(t);
    setPatients(p);
    setCategories(c);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newT: Transaction = {
      id: editingId || '', // If ID exists, StorageService updates; if empty, it creates.
      description: desc,
      amount: Number(amount),
      type,
      date,
      category,
      patientId: patientId || undefined
    };
    StorageService.saveTransaction(newT);
    setShowModal(false);
    resetForm();
    loadData();
  };

  const handleEdit = (t: Transaction) => {
    setEditingId(t.id);
    setDesc(t.description);
    setAmount(t.amount.toString());
    setType(t.type);
    setDate(t.date);
    setCategory(t.category);
    setPatientId(t.patientId || '');
    setShowModal(true);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      StorageService.deleteTransaction(itemToDelete);
      loadData();
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const startNew = () => {
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setDesc('');
    setAmount('');
    setType(TransactionType.EXPENSE);
    setCategory('');
    setPatientId('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const getPatientName = (id?: string) => {
    if (!id) return '-';
    return patients.find(p => p.id === id)?.name || '-';
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         getPatientName(t.patientId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesMonth = filterMonth === 'all' || t.date.startsWith(filterMonth);
    
    return matchesSearch && matchesType && matchesCategory && matchesMonth;
  });

  const totalIncome = filteredTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center space-x-3 mb-3 md:mb-2">
             <div className="p-2 bg-green-100 rounded-lg text-green-600"><TrendingUp size={20}/></div>
             <span className="text-slate-500 font-medium">Entradas</span>
           </div>
           <h3 className="text-2xl md:text-2xl font-display font-bold text-slate-800">R$ {totalIncome.toFixed(2)}</h3>
        </div>
        <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center space-x-3 mb-3 md:mb-2">
             <div className="p-2 bg-red-100 rounded-lg text-red-600"><TrendingDown size={20}/></div>
             <span className="text-slate-500 font-medium">Despesas</span>
           </div>
           <h3 className="text-2xl md:text-2xl font-display font-bold text-slate-800">R$ {totalExpense.toFixed(2)}</h3>
        </div>
        <div className="bg-slate-800 p-5 md:p-6 rounded-2xl md:rounded-xl shadow-lg text-white">
           <div className="flex items-center space-x-3 mb-3 md:mb-2">
             <div className="p-2 bg-white/10 rounded-lg text-teal-400"><TrendingUp size={20}/></div>
             <span className="text-slate-300 font-medium">Saldo Atual</span>
           </div>
           <h3 className="text-2xl md:text-2xl font-display font-bold">R$ {balance.toFixed(2)}</h3>
        </div>
      </div>

      {/* Action Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
          <div className="flex items-center flex-1 w-full sm:max-w-md relative">
            <Search className="absolute left-3 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por descrição ou paciente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border transition-all flex items-center justify-center space-x-2 text-sm font-medium ${
                showFilters ? 'bg-teal-50 border-teal-200 text-teal-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter size={18} />
              <span>Filtros</span>
            </button>
            <button 
              onClick={startNew}
              className="w-full sm:w-auto bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center justify-center space-x-2 text-sm font-medium shadow-lg shadow-teal-600/20"
            >
              <Plus size={18} /> <span>Novo Lançamento</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">Todos os tipos</option>
                <option value={TransactionType.INCOME}>Entradas</option>
                <option value={TransactionType.EXPENSE}>Saídas</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria</label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">Todas as categorias</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mês de Referência</label>
              <div className="flex space-x-2">
                <input 
                  type="month" 
                  value={filterMonth === 'all' ? '' : filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value || 'all')}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button 
                  onClick={() => {
                    setFilterType('all');
                    setFilterCategory('all');
                    setFilterMonth('all');
                    setSearchTerm('');
                  }}
                  className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* List View */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[#f8fafc] border-b border-slate-100 text-[13px] font-bold text-slate-500 uppercase">
          <div className="col-span-2">Data</div>
          <div className="col-span-3">Paciente</div>
          <div className="col-span-3">Descrição</div>
          <div className="col-span-2">Categoria</div>
          <div className="col-span-1 text-right">Valor</div>
          <div className="col-span-1 text-right">Ações</div>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredTransactions.map(t => (
            <div key={t.id} className="px-6 py-5 hover:bg-slate-50 transition-colors flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center">
              <div className="col-span-2 flex justify-between md:block mb-1 md:mb-0">
                <span className="md:hidden text-xs text-slate-500 font-medium">Data:</span>
                <span className="text-slate-500 text-[15px] font-medium">{t.date.split('-').reverse().join('/')}</span>
              </div>
              
              <div className="col-span-3 flex justify-between md:block mb-1 md:mb-0">
                <span className="md:hidden text-xs text-slate-500 font-medium">Paciente:</span>
                <div className="flex items-center text-[15px] font-medium text-slate-500 truncate">
                  <span className="truncate">{getPatientName(t.patientId)}</span>
                </div>
              </div>

              <div className="col-span-3 flex justify-between md:block mb-1 md:mb-0">
                <span className="md:hidden text-xs text-slate-500 font-medium">Descrição:</span>
                <span className="font-bold text-[#2d3748] text-[15px] truncate">
                  {t.description.replace(/^Atendimento:\s*/, '').replace(/\s*-\s*\d{2}\/\d{2}\/\d{4}$/, '')}
                </span>
              </div>

              <div className="col-span-2 flex justify-between md:block mb-3 md:mb-0">
                <span className="md:hidden text-xs text-slate-500 font-medium">Categoria:</span>
                <span className="text-slate-500 text-[15px] font-medium truncate">{t.category}</span>
              </div>

              <div className="col-span-1 flex justify-between md:block mb-3 md:mb-0">
                <span className="md:hidden text-xs text-slate-500 font-medium">Valor:</span>
                <span className={t.type === TransactionType.INCOME ? 'text-green-600 flex items-center md:justify-end font-bold text-[15px]' : 'text-red-600 flex items-center md:justify-end font-bold text-[15px]'}>
                  {t.type === TransactionType.INCOME ? <ArrowUpRight size={16} className="mr-1"/> : <ArrowDownRight size={16} className="mr-1"/>}
                  R$ {t.amount.toFixed(2)}
                </span>
              </div>

              <div className="col-span-1 flex justify-end md:justify-end">
                <div className="flex items-center space-x-2 bg-slate-50 md:bg-transparent px-3 py-1.5 md:p-0 rounded-lg md:rounded-none">
                  <button onClick={() => handleEdit(t)} className="text-slate-400 hover:text-teal-600 transition-colors p-1">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDeleteClick(t.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <div className="flex flex-col items-center">
                <Search size={32} className="mb-2 opacity-20" />
                <p>Nenhum lançamento encontrado com os filtros aplicados.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">{editingId ? 'Editar Movimentação' : 'Adicionar Movimentação'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                   <select value={type} onChange={e => setType(e.target.value as TransactionType)} className="w-full border p-2 rounded mt-1">
                     <option value={TransactionType.INCOME}>Entrada</option>
                     <option value={TransactionType.EXPENSE}>Saída</option>
                   </select>
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Valor</label>
                   <input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border p-2 rounded mt-1" />
                 </div>
              </div>
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                 <input required type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full border p-2 rounded mt-1" placeholder="Ex: Pagamento Consulta" />
              </div>
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase">Paciente (Opcional)</label>
                 <select value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full border p-2 rounded mt-1 bg-white">
                   <option value="">Nenhum</option>
                   {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                 </select>
              </div>
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase">Categoria</label>
                 <select 
                   required 
                   value={category} 
                   onChange={e => setCategory(e.target.value)} 
                   className="w-full border p-2 rounded mt-1 bg-white"
                 >
                   <option value="">Selecione uma categoria</option>
                   {categories
                     .filter(c => c.type === type)
                     .map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                   }
                 </select>
              </div>
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
                 <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border p-2 rounded mt-1" />
              </div>
              <div className="pt-2 flex space-x-3">
                 <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">Cancelar</button>
                 <button type="submit" className="flex-1 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700">{editingId ? 'Atualizar' : 'Salvar'}</button>
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
                <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Lançamento?</h3>
                <p className="text-slate-500 mb-6">
                  Esta ação não poderá ser desfeita. O lançamento será removido permanentemente do histórico financeiro.
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

export default Financials;