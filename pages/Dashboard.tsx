import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storageService';
import { AppointmentTypeConfig, Appointment, WaitlistItem } from '../types';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Plus, Trash2, X, AlertCircle, Clock, CheckCircle, XCircle, UserX, CalendarPlus, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, BarChart2, SlidersHorizontal, ChevronDown, Users, Wallet, Crown } from 'lucide-react';

const COLORS = {
  teal: '#12647a',
  yellow: '#f59e0b',
  purple: '#8b5cf6',
  blue: '#0ea5e9',
  red: '#ef4444',
  slate: '#64748b',
  lightSlate: '#f1f5f9'
};

interface WaitlistItemWithPatient extends WaitlistItem {
  patientName: string;
}

const RadialProgress = ({ percentage, color, size = 120, strokeWidth = 12, children }: any) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={COLORS.lightSlate} strokeWidth={strokeWidth} fill="transparent" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
};

const TopCard = ({ title, value, subtitle, color, icon: Icon, isHighlighted = false }: any) => {
  return (
    <div className={`p-5 md:p-6 rounded-2xl md:rounded-xl shadow-sm border ${isHighlighted ? 'bg-teal-700 border-transparent shadow-md shadow-teal-700/20 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
      <div className="flex items-center space-x-3 mb-3 md:mb-2">
        <div className={`p-2 rounded-lg ${isHighlighted ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-500'}`}>
          <Icon size={20} />
        </div>
        <span className={`font-medium ${isHighlighted ? 'text-teal-50' : 'text-slate-500'}`}>{title}</span>
      </div>
      <div>
        <h3 className="text-2xl md:text-2xl font-display font-bold mb-0.5">{value}</h3>
        <p className={`text-xs font-medium ${isHighlighted ? 'text-teal-100/80' : 'text-slate-400'}`}>{subtitle}</p>
      </div>
    </div>
  );
};

const StackedCard = ({ title, value, percentage, trendData, color, reverseColor = false }: any) => {
  const isPositive = percentage >= 0;
  const isGood = reverseColor ? !isPositive : isPositive;
  const badgeColor = isGood ? 'text-teal-600 bg-teal-50' : 'text-red-600 bg-red-50';

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 flex justify-between items-center">
      <div>
        <p className="text-xs text-slate-500 font-bold mb-1">{title}</p>
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-slate-800">{value}</h3>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${badgeColor}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(percentage).toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="w-20 h-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData}>
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [waitlist, setWaitlist] = useState<WaitlistItemWithPatient[]>([]);
  const [patients, setPatients] = useState<{id: string, name: string}[]>([]);
  const [apptTypes, setApptTypes] = useState<AppointmentTypeConfig[]>([]);

  // Waitlist Form State
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistPatientId, setWaitlistPatientId] = useState('');
  const [waitlistType, setWaitlistType] = useState<string>('');
  const [waitlistNotes, setWaitlistNotes] = useState('');

  // Filter State
  const [statsPeriod, setStatsPeriod] = useState('Mensal');
  const [agendaPeriod, setAgendaPeriod] = useState('Este Mês');
  const [showStatsDropdown, setShowStatsDropdown] = useState(false);
  const [showAgendaDropdown, setShowAgendaDropdown] = useState(false);

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  useEffect(() => {
    loadMetrics();
  }, [statsPeriod, agendaPeriod, calendarDate]);

  const loadMetrics = () => {
    const allPatients = StorageService.getPatients();
    setPatients(allPatients.map(p => ({ id: p.id, name: p.name })));
    const appointments = StorageService.getAppointments();
    const transactions = StorageService.getTransactions();
    const waitlistData = StorageService.getWaitlist();
    const types = StorageService.getAppointmentTypes();
    const professionals = StorageService.getProfessionals();
    
    setApptTypes(types);
    if (types.length > 0 && !waitlistType) {
      setWaitlistType(types[0].name);
    }

    const waitlistWithPatients = waitlistData.map(item => {
      const patient = allPatients.find(p => p.id === item.patientId);
      return { ...item, patientName: patient ? patient.name : 'Desconhecido' };
    });
    setWaitlist(waitlistWithPatients);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const isToday = (dateStr: string) => {
      if(!dateStr) return false;
      const d = new Date(dateStr);
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };

    const isThisWeek = (dateStr: string) => {
      if(!dateStr) return false;
      const d = new Date(dateStr);
      const diffTime = Math.abs(now.getTime() - d.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays <= 7;
    };

    const isCurrentMonth = (dateStr: string) => {
      if(!dateStr) return false;
      const d = new Date(dateStr);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    };

    const isThisYear = (dateStr: string) => {
      if(!dateStr) return false;
      const d = new Date(dateStr);
      return d.getFullYear() === now.getFullYear();
    };

    const isLastMonth = (dateStr: string) => {
      if(!dateStr) return false;
      const d = new Date(dateStr);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
    };

    const getFilterFn = (period: string) => {
      switch(period) {
        case 'Diário': case 'Hoje': return isToday;
        case 'Semanal': case 'Esta Semana': return isThisWeek;
        case 'Mensal': case 'Este Mês': return isCurrentMonth;
        case 'Anual': case 'Este Ano': return isThisYear;
        default: return isCurrentMonth;
      }
    };

    const isYesterday = (dateStr: string) => {
      if(!dateStr) return false;
      const d = new Date(dateStr);
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear();
    };

    const isLastWeek = (dateStr: string) => {
      if(!dateStr) return false;
      const d = new Date(dateStr);
      const diffTime = Math.abs(now.getTime() - d.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays > 7 && diffDays <= 14;
    };

    const isLastYear = (dateStr: string) => {
      if(!dateStr) return false;
      const d = new Date(dateStr);
      return d.getFullYear() === now.getFullYear() - 1;
    };

    const getPrevFilterFn = (period: string) => {
      switch(period) {
        case 'Diário': case 'Hoje': return isYesterday;
        case 'Semanal': case 'Esta Semana': return isLastWeek;
        case 'Mensal': case 'Este Mês': return isLastMonth;
        case 'Anual': case 'Este Ano': return isLastYear;
        default: return isLastMonth;
      }
    };

    const statsFilter = getFilterFn(statsPeriod);
    const prevStatsFilter = getPrevFilterFn(statsPeriod);
    const agendaFilter = getFilterFn(agendaPeriod);
    const prevAgendaFilter = getPrevFilterFn(agendaPeriod);

    // --- AGENDA ---
    const currentMonthApps = appointments.filter(a => agendaFilter(a.date));
    const totalAgendados = currentMonthApps.filter(a => a.status === 'Agendado' || !a.status).length;
    const totalRealizados = currentMonthApps.filter(a => a.status === 'Realizado').length;
    const totalCancelados = currentMonthApps.filter(a => a.status === 'Cancelado').length;
    const totalFaltas = currentMonthApps.filter(a => a.status === 'Faltou').length;
    const totalEncaixes = currentMonthApps.filter(a => a.notes?.toLowerCase().includes('encaixe')).length;

    const totalCapacity = 200; // Aproximadamente 50 horas semanais * 4 semanas
    const occupiedSlots = totalAgendados + totalRealizados;
    const taxaOcupacao = totalCapacity > 0 ? (occupiedSlots / totalCapacity) * 100 : 0;
    const horariosVagos = Math.max(0, totalCapacity - occupiedSlots);

    // --- FINANCEIRO ---
    const currentMonthTrans = transactions.filter(t => statsFilter(t.date));
    const receitaTotal = currentMonthTrans.filter(t => t.type === 'Entrada').reduce((sum, t) => sum + t.amount, 0);
    const despesas = currentMonthTrans.filter(t => t.type === 'Saída').reduce((sum, t) => sum + t.amount, 0);
    const lucroLiquido = receitaTotal - despesas;

    // --- PACIENTES ---
    const novosPacientes = allPatients.filter(p => statsFilter(p.createdAt)).length;
    const patientAppCounts = appointments.reduce((acc, app) => {
      acc[app.patientId] = (acc[app.patientId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const pacientesRecorrentes = Object.values(patientAppCounts).filter(count => count > 1).length;
    const retornos = currentMonthApps.filter(a => a.type.toLowerCase().includes('retorno') || a.notes?.toLowerCase().includes('retorno')).length;
    const listaEsperaCount = waitlistData.length;

    // --- COMPARATIVOS ---
    const lastMonthTrans = transactions.filter(t => prevStatsFilter(t.date));
    const lastMonthReceita = lastMonthTrans.filter(t => t.type === 'Entrada').reduce((sum, t) => sum + t.amount, 0);
    const lastMonthDespesas = lastMonthTrans.filter(t => t.type === 'Saída').reduce((sum, t) => sum + t.amount, 0);
    const lastMonthLucro = lastMonthReceita - lastMonthDespesas;

    const crescimentoReceita = lastMonthReceita > 0 ? ((receitaTotal - lastMonthReceita) / lastMonthReceita) * 100 : 0;
    const crescimentoDespesas = lastMonthDespesas > 0 ? ((despesas - lastMonthDespesas) / lastMonthDespesas) * 100 : 0;
    const crescimentoLucro = lastMonthLucro !== 0 ? ((lucroLiquido - lastMonthLucro) / Math.abs(lastMonthLucro)) * 100 : 0;

    const lastMonthApps = appointments.filter(a => prevAgendaFilter(a.date));
    const crescimentoAtendimentos = lastMonthApps.length > 0 ? ((currentMonthApps.length - lastMonthApps.length) / lastMonthApps.length) * 100 : 0;
    
    // Mock Cancelamento growth
    const crescimentoCancelamento = -2.1; // Mock value for demo

    // --- GESTÃO ---
    const receitaPorMedico = professionals.map(p => {
      const profApps = currentMonthApps.filter(a => a.professionalId === p.id);
      const revenue = profApps.reduce((sum, a) => sum + (a.price || 0), 0);
      return { name: p.name, value: revenue, color: p.color };
    }).filter(item => item.value > 0);

    const receitaPorEspecialidadeData = professionals.reduce((acc, p) => {
      const profApps = currentMonthApps.filter(a => a.professionalId === p.id);
      const revenue = profApps.reduce((sum, a) => sum + (a.price || 0), 0);
      const spec = p.specialty || 'Geral';
      const existing = acc.find(item => item.name === spec);
      if (existing) { existing.value += revenue; } else { acc.push({ name: spec, value: revenue }); }
      return acc;
    }, [] as { name: string; value: number }[]).filter(item => item.value > 0);

    const procedimentosMaisRealizados = Object.entries(currentMonthApps.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);

    const alertas = [];
    if (taxaOcupacao < 50) alertas.push('Agenda ociosa: Taxa de ocupação abaixo de 50%.');
    if (totalCancelados > (currentMonthApps.length * 0.1)) alertas.push('Atenção: Taxa de cancelamento superior a 10%.');
    if (totalFaltas > (currentMonthApps.length * 0.05)) alertas.push('Atenção: Taxa de faltas superior a 5%.');

    // --- CALENDAR DATA ---
    const calYear = calendarDate.getFullYear();
    const calMonth = calendarDate.getMonth();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
    
    const calendarDays = [];
    // Previous month padding
    const prevMonthDays = new Date(calYear, calMonth, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      calendarDays.push({ day: prevMonthDays - i, isCurrentMonth: false, count: 0 });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const count = appointments.filter(a => a.date === dateStr && a.status !== 'Cancelado' && a.status !== 'Faltou').length;
      calendarDays.push({ day: i, isCurrentMonth: true, count });
    }
    // Next month padding
    const remainingDays = 42 - calendarDays.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push({ day: i, isCurrentMonth: false, count: 0 });
    }

    // --- MOCK TREND DATA FOR CHARTS ---
    const generateTrend = (base: number, points: number, variance: number) => 
      Array.from({ length: points }).map((_, i) => ({ name: `D${i+1}`, value: Math.max(0, base + (Math.random() * variance * 2 - variance)) }));
    
    const receitaTrend = generateTrend(receitaTotal / 30 || 500, 7, 200);
    const despesasTrend = generateTrend(despesas / 30 || 200, 7, 100);
    const lucroTrend = generateTrend(lucroLiquido / 30 || 300, 7, 150);
    const atendimentosTrend = generateTrend(currentMonthApps.length / 30 || 10, 7, 5);
    const cancelamentoTrend = generateTrend(totalCancelados || 2, 7, 1);
    
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const receitaVsDespesa = meses.map(m => ({
      name: m,
      receita: (receitaTotal || 5000) * (0.8 + Math.random() * 0.4),
      despesa: (despesas || 2000) * (0.8 + Math.random() * 0.4)
    }));

    const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const lucroDiario = diasSemana.map(d => ({
      name: d,
      lucro: (lucroLiquido / 30 || 300) * (0.5 + Math.random())
    }));

    const calcLucro = (trans: any[]) => {
      const rec = trans.filter(t => t.type === 'Entrada').reduce((sum, t) => sum + t.amount, 0);
      const des = trans.filter(t => t.type === 'Saída').reduce((sum, t) => sum + t.amount, 0);
      return rec - des;
    };

    const lucroDiarioVal = calcLucro(transactions.filter(t => isToday(t.date)));
    const lucroSemanalVal = calcLucro(transactions.filter(t => isThisWeek(t.date)));
    const lucroMensalVal = lucroLiquido;
    const lucroAnualVal = calcLucro(transactions.filter(t => isThisYear(t.date)));

    const despesasPorCategoria = currentMonthTrans.filter(t => t.type === 'Saída').reduce((acc, t) => {
      const cat = t.category || 'Outros';
      const existing = acc.find(item => item.name === cat);
      if (existing) { existing.value += t.amount; } else { acc.push({ name: cat, value: t.amount }); }
      return acc;
    }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value);

    setMetrics({
      agenda: { totalAgendados, totalRealizados, totalCancelados, totalFaltas, totalEncaixes, taxaOcupacao, horariosVagos },
      financeiro: { despesas, receitaTotal, lucroLiquido, lucroDiarioVal, lucroSemanalVal, lucroMensalVal, lucroAnualVal, despesasPorCategoria },
      pacientes: { novosPacientes, pacientesRecorrentes, retornos, listaEsperaCount },
      comparativos: { crescimentoReceita, crescimentoDespesas, crescimentoLucro, crescimentoAtendimentos, crescimentoCancelamento },
      gestao: { receitaPorMedico, receitaPorEspecialidade: receitaPorEspecialidadeData, procedimentosMaisRealizados, alertas },
      trends: { receitaTrend, despesasTrend, lucroTrend, atendimentosTrend, cancelamentoTrend, receitaVsDespesa, lucroDiario },
      calendar: calendarDays
    });
  };

  const handleAddToWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistPatientId) return;
    const newItem: WaitlistItem = {
      id: '', patientId: waitlistPatientId, type: waitlistType,
      createdAt: new Date().toISOString().split('T')[0], notes: waitlistNotes
    };
    StorageService.saveWaitlistItem(newItem);
    setShowWaitlistModal(false);
    setWaitlistPatientId(''); setWaitlistNotes('');
    loadMetrics();
  };

  const handleRemoveFromWaitlist = (id: string) => {
    StorageService.deleteWaitlistItem(id);
    loadMetrics();
  };

  if (!metrics) return <div className="p-8 text-center text-slate-500">Carregando métricas...</div>;

  const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getSubtitle = (period: string) => {
    switch(period) {
      case 'Diário': case 'Hoje': return 'Hoje';
      case 'Semanal': case 'Esta Semana': return 'Nesta semana';
      case 'Mensal': case 'Este Mês': return 'Neste mês';
      case 'Anual': case 'Este Ano': return 'Neste ano';
      default: return 'Neste mês';
    }
  };

  const getComparisonText = (period: string) => {
    switch(period) {
      case 'Diário': return 'vs ontem';
      case 'Semanal': return 'vs semana anterior';
      case 'Mensal': return 'vs mês anterior';
      case 'Anual': return 'vs ano anterior';
      default: return 'vs mês anterior';
    }
  };

  return (
    <div className="bg-[#eef2f6] min-h-screen p-4 md:p-8 font-sans -m-6 md:-m-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ROW 1: Top 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TopCard 
            title="Receita Total" 
            value={formatCurrency(metrics.financeiro.receitaTotal)} 
            subtitle={getSubtitle(statsPeriod)}
            icon={Wallet} 
            isHighlighted={true}
          />
          <TopCard 
            title="Despesas" 
            value={formatCurrency(metrics.financeiro.despesas)} 
            subtitle={getSubtitle(statsPeriod)}
            icon={TrendingDown} 
          />
          <TopCard 
            title="Lucro Líquido" 
            value={formatCurrency(metrics.financeiro.lucroLiquido)} 
            subtitle={getSubtitle(statsPeriod)}
            icon={Crown} 
          />
          <TopCard 
            title="Atendimentos" 
            value={metrics.agenda.totalRealizados + metrics.agenda.totalAgendados} 
            subtitle={getSubtitle(agendaPeriod)}
            icon={Users} 
          />
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Estatísticas */}
          <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100 col-span-1 lg:col-span-8 flex flex-col">
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <div className="flex items-center space-x-3">
                <BarChart2 className="text-slate-800" size={24} />
                <h3 className="text-lg md:text-xl font-bold text-slate-800">Estatísticas</h3>
              </div>
              <div className="flex items-center space-x-2 relative">
                <span className="px-3 md:px-4 py-1.5 md:py-2 bg-slate-50 rounded-full text-xs md:text-sm font-bold text-slate-600">{statsPeriod}</span>
                <button onClick={() => setShowStatsDropdown(!showStatsDropdown)} className="p-1.5 md:p-2 bg-slate-50 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"><SlidersHorizontal size={16} /></button>
                {showStatsDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-10">
                    {['Diário', 'Semanal', 'Mensal', 'Anual'].map(p => (
                      <button key={p} onClick={() => { setStatsPeriod(p); setShowStatsDropdown(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${statsPeriod === p ? 'font-bold text-teal-600' : 'text-slate-600'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8">
              <div>
                <p className="text-xs md:text-sm text-slate-500 font-medium mb-1">Receita</p>
                <h2 className="text-2xl md:text-4xl font-display font-bold text-slate-800 mb-1 md:mb-2">{formatCurrency(metrics.financeiro.receitaTotal)}</h2>
                <p className={`text-xs md:text-sm font-bold flex items-center ${metrics.comparativos.crescimentoReceita >= 0 ? 'text-teal-500' : 'text-red-500'}`}>
                  {metrics.comparativos.crescimentoReceita >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                  {Math.abs(metrics.comparativos.crescimentoReceita).toFixed(1)}% <span className="text-slate-400 ml-1 md:ml-2 font-medium">{getComparisonText(statsPeriod)}</span>
                </p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-slate-500 font-medium mb-1">Despesas</p>
                <h2 className="text-2xl md:text-4xl font-display font-bold text-slate-800 mb-1 md:mb-2">{formatCurrency(metrics.financeiro.despesas)}</h2>
                <p className={`text-xs md:text-sm font-bold flex items-center ${metrics.comparativos.crescimentoDespesas <= 0 ? 'text-teal-500' : 'text-red-500'}`}>
                  {metrics.comparativos.crescimentoDespesas <= 0 ? <TrendingDown size={14} className="mr-1" /> : <TrendingUp size={14} className="mr-1" />}
                  {Math.abs(metrics.comparativos.crescimentoDespesas).toFixed(1)}% <span className="text-slate-400 ml-1 md:ml-2 font-medium">{getComparisonText(statsPeriod)}</span>
                </p>
              </div>
            </div>

            <div className="flex-1 min-h-[200px] md:min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.trends.receitaVsDespesa} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.lightSlate} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: COLORS.slate, fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.slate, fontSize: 12 }} tickFormatter={(val) => `R$${val/1000}k`} />
                  <RechartsTooltip formatter={(val: number) => formatCurrency(val)} cursor={{fill: 'transparent'}} />
                  <Bar dataKey="receita" fill={COLORS.teal} radius={[6, 6, 0, 0]} barSize={24} />
                  <Bar dataKey="despesa" fill={COLORS.yellow} radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Agenda & Ocupação */}
          <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100 col-span-1 lg:col-span-4 flex flex-col">
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <div className="flex items-center space-x-3">
                <Users className="text-slate-800" size={24} />
                <h3 className="text-lg md:text-xl font-bold text-slate-800">Agenda</h3>
              </div>
              <div className="relative">
                <button onClick={() => setShowAgendaDropdown(!showAgendaDropdown)} className="text-xs md:text-sm font-bold text-slate-600 flex items-center cursor-pointer hover:text-slate-800">
                  {agendaPeriod} <ChevronDown size={16} className="ml-1"/>
                </button>
                {showAgendaDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-10">
                    {['Hoje', 'Esta Semana', 'Este Mês', 'Este Ano'].map(p => (
                      <button key={p} onClick={() => { setAgendaPeriod(p); setShowAgendaDropdown(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${agendaPeriod === p ? 'font-bold text-teal-600' : 'text-slate-600'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center mb-6 md:mb-10 w-full max-w-[220px] mx-auto min-h-[160px] md:min-h-[220px]">
              {/* Note: The Responsive Container style sizing will dynamically shrink */}
              <div className="scale-75 md:scale-100 transform origin-center">
                <RadialProgress percentage={Math.min(100, metrics.agenda.taxaOcupacao)} color={COLORS.teal} size={220} strokeWidth={24}>
                  <span className="text-4xl md:text-5xl font-display font-bold text-slate-800">{metrics.agenda.taxaOcupacao.toFixed(0)}%</span>
                  <span className="text-xs md:text-sm font-bold text-slate-400 mt-1">Ocupação</span>
                </RadialProgress>
              </div>
            </div>

            <div className="space-y-6 w-full">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-slate-600">Realizados</span>
                  <span className="font-bold text-slate-800">{metrics.agenda.totalRealizados}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-teal-500 h-3 rounded-full" style={{ width: `${(metrics.agenda.totalRealizados / Math.max(1, metrics.agenda.totalAgendados + metrics.agenda.totalRealizados)) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-slate-600">Agendados</span>
                  <span className="font-bold text-slate-800">{metrics.agenda.totalAgendados}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-blue-400 h-3 rounded-full" style={{ width: `${(metrics.agenda.totalAgendados / Math.max(1, metrics.agenda.totalAgendados + metrics.agenda.totalRealizados)) * 100}%` }}></div>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-slate-600">Cancelados</span>
                  <span className="font-bold text-slate-800">{metrics.agenda.totalCancelados}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-red-400 h-3 rounded-full" style={{ width: `${(metrics.agenda.totalCancelados / Math.max(1, metrics.agenda.totalAgendados + metrics.agenda.totalRealizados + metrics.agenda.totalCancelados + metrics.agenda.totalFaltas)) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-slate-600">Faltas</span>
                  <span className="font-bold text-slate-800">{metrics.agenda.totalFaltas}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-orange-400 h-3 rounded-full" style={{ width: `${(metrics.agenda.totalFaltas / Math.max(1, metrics.agenda.totalAgendados + metrics.agenda.totalRealizados + metrics.agenda.totalCancelados + metrics.agenda.totalFaltas)) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Bottom Left: Receita por Profissional */}
          <div className="col-span-12 md:col-span-4 bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100">
            <h3 className="text-slate-800 font-bold mb-6">Receita por Profissional</h3>
            <div className="space-y-6">
              {metrics.gestao.receitaPorMedico.length > 0 ? (
                metrics.gestao.receitaPorMedico.map((item: any, i: number) => {
                  const max = Math.max(...metrics.gestao.receitaPorMedico.map((m:any) => m.value));
                  const percentage = (item.value / max) * 100;
                  const initial = item.name.replace('Dr. ', '').replace('Dra. ', '').charAt(0).toUpperCase();
                  return (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: item.color || COLORS.teal }}>
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-slate-800 truncate">{item.name}</span>
                          <span className="text-sm font-bold text-slate-600">{formatCurrency(item.value)}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width: `${percentage}%`, backgroundColor: item.color || COLORS.teal }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-slate-400 text-sm py-4">Sem dados suficientes</div>
              )}
            </div>
          </div>

          {/* Bottom Mid: Alertas & Lista de Espera */}
          <div className="col-span-12 md:col-span-4 bg-white rounded-3xl p-5 md:p-6 shadow-sm flex flex-col border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-slate-800 font-bold">Lista de Espera</h3>
              <button onClick={() => setShowWaitlistModal(true)} className="text-teal-600 hover:bg-teal-50 p-1.5 rounded-lg transition-colors">
                <Plus size={18} />
              </button>
            </div>
            
            {metrics.gestao.alertas.length > 0 && (
              <div className="mb-4 space-y-2">
                {metrics.gestao.alertas.map((alerta: string, i: number) => (
                  <div key={i} className="bg-orange-50 text-orange-700 px-3 py-2 rounded-xl flex items-start text-xs font-medium">
                    <AlertCircle size={14} className="mr-1.5 mt-0.5 flex-shrink-0" /> {alerta}
                  </div>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-48 custom-scrollbar">
              {waitlist.length === 0 ? (
                <div className="text-center text-slate-400 text-sm py-4">Nenhum paciente na fila.</div>
              ) : (
                waitlist.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl md:rounded-3xl hover:border-slate-200 transition-colors group">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#e6f3f5] text-[#1e3a5f] flex items-center justify-center font-bold text-sm md:text-[15px]">
                        {item.patientName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm md:text-[15px] font-bold text-[#2d3748] leading-tight mb-0.5">{item.patientName}</p>
                        <p className="text-[12px] md:text-[13px] text-slate-400">{item.type}</p>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveFromWaitlist(item.id)} className="text-slate-200 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Right: Calendar */}
          <div className="col-span-12 md:col-span-4 bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-slate-800 font-bold">
                {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
              </h3>
              <div className="flex space-x-2">
                <button onClick={handlePrevMonth} className="p-1.5 bg-slate-50 text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                  <ChevronDown size={16} className="rotate-90" />
                </button>
                <button onClick={handleNextMonth} className="p-1.5 bg-slate-50 text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                  <ChevronDown size={16} className="-rotate-90" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="text-xs font-bold text-slate-400">{d}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 flex-1">
              {metrics.calendar.map((dayObj: any, i: number) => {
                let bgColor = 'bg-transparent';
                let textColor = 'text-slate-700';
                let border = 'border border-transparent';
                
                if (!dayObj.isCurrentMonth) {
                  textColor = 'text-slate-300';
                  // Add striped pattern for non-current month days if desired, or just light gray
                  bgColor = 'bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#f1f5f9_2px,#f1f5f9_4px)]';
                } else {
                  border = 'border border-slate-100';
                  const DAILY_CAPACITY = 10;
                  const occupancy = (dayObj.count / DAILY_CAPACITY) * 100;

                  if (occupancy < 50) {
                    bgColor = 'bg-teal-500';
                    textColor = 'text-white';
                  } else if (occupancy >= 50 && occupancy < 100) {
                    bgColor = 'bg-yellow-400';
                    textColor = 'text-slate-800';
                  } else if (occupancy >= 100) {
                    bgColor = 'bg-red-500';
                    textColor = 'text-white';
                  }
                }

                return (
                  <div key={i} className={`flex items-center justify-center rounded-full aspect-square text-sm font-medium ${bgColor} ${textColor} ${border}`}>
                    {dayObj.day}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Waitlist Modal */}
      {showWaitlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-teal-500 p-5 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">Adicionar à Fila</h3>
              <button onClick={() => setShowWaitlistModal(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddToWaitlist} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paciente</label>
                <select required value={waitlistPatientId} onChange={e => setWaitlistPatientId(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50">
                  <option value="">Selecione um paciente</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Atendimento</label>
                <select value={waitlistType} onChange={e => setWaitlistType(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50">
                  {apptTypes.map(type => <option key={type.id} value={type.name}>{type.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Observações</label>
                <textarea value={waitlistNotes} onChange={e => setWaitlistNotes(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 h-24 resize-none" placeholder="Ex: Prefere horários na parte da manhã..." />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowWaitlistModal(false)} className="flex-1 py-3 text-slate-600 bg-slate-100 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 text-white bg-teal-500 rounded-xl font-bold hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/30">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
