import { ArrowUpRight, Users, Calendar, Stethoscope, DollarSign, FileText, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats, useDashboardVisits, useDashboardUpcoming, useDashboardPathologies, useDashboardRevenue } from '../api/features/dashboard';
import { useProfile } from '../api/features/auth';
import { useState } from 'react';
import { format, startOfWeek, endOfWeek, subDays, startOfMonth, subMonths, endOfMonth } from 'date-fns';

const COLORS = ['#d4a373', '#8d6e63', '#e9edc9', '#fefae0'];

export function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: doctor, isLoading: profileLoading } = useProfile();
  
  const [dateRange, setDateRange] = useState<{ startDate: string, endDate: string } | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setDateRange(prev => ({
          startDate: name === 'startDate' ? value : (prev?.startDate || ''),
          endDate: name === 'endDate' ? value : (prev?.endDate || '')
      }));
  };

  const applyPreset = (preset: string) => {
      const today = new Date();
      let start: Date;
      let end: Date = today;

      switch(preset) {
          case 'today':
              start = today;
              end = today;
              break;
          case 'yesterday':
              start = subDays(today, 1);
              end = subDays(today, 1);
              break;
          case 'thisWeek':
              start = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
              end = endOfWeek(today, { weekStartsOn: 1 });
              break;
          case 'last7Days':
              start = subDays(today, 6);
              end = today;
              break;
          case 'thisMonth':
              start = startOfMonth(today);
              end = endOfMonth(today); // or today? Usually month view is whole month
              break;
          case 'lastMonth':
              start = startOfMonth(subMonths(today, 1));
              end = endOfMonth(subMonths(today, 1));
              break;
          case 'last30Days':
              start = subDays(today, 29);
              end = today;
              break;
          default:
              return;
      }

      setDateRange({
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(end, 'yyyy-MM-dd')
      });
      setShowDatePicker(false);
  };

  const clearFilter = () => {
      setDateRange(undefined);
      setShowDatePicker(false);
  }

  const firstName = doctor?.user?.profile?.firstName || '';
  const lastName = doctor?.user?.profile?.lastName || '';
  const doctorName = profileLoading ? '...' : (firstName ? `Dr. ${firstName} ${lastName}` : t('dashboard.greetingName'));
  
  const { data: stats, isLoading: statsLoading } = useDashboardStats(dateRange);
  const { data: visits, isLoading: visitsLoading } = useDashboardVisits(dateRange);
  const { data: upcoming, isLoading: upcomingLoading } = useDashboardUpcoming();
  const { data: pathologies, isLoading: pathologiesLoading } = useDashboardPathologies();
  const { data: revenue, isLoading: revenueLoading } = useDashboardRevenue();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-dark">{t('common.greeting', { name: doctorName })}</h1>
          <p className="text-brand-muted">{t('dashboard.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3">
             <div className="relative">
                 <button 
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-brand-soft rounded-lg text-sm text-brand-dark hover:bg-brand-light/30 transition-colors shadow-sm"
                 >
                     <Calendar className="w-4 h-4 text-brand-default" />
                     {dateRange && dateRange.startDate && dateRange.endDate 
                        ? `${format(new Date(dateRange.startDate), 'MMM d, yyyy')} - ${format(new Date(dateRange.endDate), 'MMM d, yyyy')}`
                        : t('common.filter') //"Filter by Period"
                     }
                     <ChevronDown className="w-4 h-4 ml-1 text-brand-muted" />
                 </button>

                 {showDatePicker && (
                     <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-brand-soft p-0 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden flex flex-col md:flex-row">
                         {/* Presets Sidebar */}
                         <div className="bg-brand-light/20 p-2 md:w-32 border-b md:border-b-0 md:border-r border-brand-soft flex flex-col gap-1">
                             {[
                                 'today', 'yesterday', 'thisWeek', 'last7Days', 'thisMonth', 'lastMonth', 'last30Days'
                             ].map(preset => (
                                 <button
                                     key={preset}
                                     onClick={() => applyPreset(preset)}
                                     className="text-left px-3 py-1.5 text-xs font-medium text-brand-dark hover:bg-brand-light/50 rounded-md transition-colors w-full"
                                 >
                                     {t(`dashboard.presets.${preset}`)}
                                 </button>
                             ))}
                         </div>
                         
                         {/* Custom Range */}
                         <div className="p-4 flex-1 space-y-3">
                             <p className="text-xs font-semibold text-brand-muted uppercase mb-2">{t('dashboard.presets.custom')}</p>
                             <div>
                                 <label className="text-xs font-semibold text-brand-dark mb-1 block">Start Date</label>
                                 <input 
                                    type="date" 
                                    name="startDate"
                                    value={dateRange?.startDate || ''}
                                    onChange={handleDateChange}
                                    className="w-full px-3 py-2 border border-brand-soft rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-default/20"
                                 />
                             </div>
                             <div>
                                 <label className="text-xs font-semibold text-brand-dark mb-1 block">End Date</label>
                                 <input 
                                    type="date" 
                                    name="endDate"
                                    value={dateRange?.endDate || ''}
                                    onChange={handleDateChange}
                                    className="w-full px-3 py-2 border border-brand-soft rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-default/20"
                                 />
                             </div>
                             <div className="flex justify-end pt-2 gap-2">
                                 <button onClick={clearFilter} className="text-xs text-brand-muted hover:text-brand-dark px-3 py-1.5">{t('common.cancel')}</button>
                                 <button onClick={() => setShowDatePicker(false)} className="text-xs bg-brand-default text-white px-3 py-1.5 rounded-lg hover:bg-brand-dark transition-colors">{t('common.confirm')}</button>
                             </div>
                         </div>
                     </div>
                 )}
             </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: dateRange ? "Patients (In Period)" : t('dashboard.totalPatients'), 
            value: statsLoading ? '...' : stats?.totalPatients || 0, 
            icon: Users, 
            trend: statsLoading ? '...' : `${(stats?.patientsChange ?? 0) >= 0 ? '+' : ''}${stats?.patientsChange || 0}%`, 
            color: 'text-brand-dark', 
            bgColor: 'bg-brand-soft/50', 
            cardBg: 'bg-brand-default/10',
            vsLabel: dateRange ? "vs Prev Period" : t('dashboard.vsLastMonth')
          },
          { 
            label: dateRange ? "Appointments (In Period)" : t('dashboard.appointments'), 
            value: statsLoading ? '...' : stats?.todaysAppointments || 0, 
            icon: Calendar, 
            trend: statsLoading ? '...' : `${(stats?.appointmentsChange ?? 0) >= 0 ? '+' : ''}${stats?.appointmentsChange || 0}%`, 
            color: 'text-brand-default', 
            bgColor: 'bg-brand-light', 
            cardBg: 'bg-brand-default/5',
            vsLabel: dateRange ? "vs Prev Period" : 'vs Yesterday' 
          },
          { 
            label: t('dashboard.totalRevenue'), 
            value: statsLoading ? '...' : `${stats?.totalRevenue || 0} FCFA`, 
            icon: DollarSign, 
            trend: statsLoading ? '...' : `${(stats?.revenueChange ?? 0) >= 0 ? '+' : ''}${stats?.revenueChange || 0}%`, 
            color: 'text-brand-text', 
            bgColor: 'bg-brand-soft', 
            cardBg: 'bg-brand-default/15',
            vsLabel: dateRange ? "vs Prev Period" : t('dashboard.vsLastMonth')
          },
          { 
            label: t('dashboard.totalConsultations'), 
            value: statsLoading ? '...' : stats?.totalConsultations || 0, 
            icon: Stethoscope, 
            trend: statsLoading ? '...' : `${(stats?.consultationsChange ?? 0) >= 0 ? '+' : ''}${stats?.consultationsChange || 0}%`, 
            color: 'text-brand-muted', 
            bgColor: 'bg-brand-light/50', 
            cardBg: 'bg-brand-default/20',
            vsLabel: dateRange ? "vs Prev Period" : t('dashboard.vsLastMonth')
          },
        ].map((stat, i) => (
          <div key={i} className={cn("p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group", stat.cardBg)}>
             {/* Background Icon */}
             <div className={cn("absolute -top-6 -right-6 opacity-10 transition-transform group-hover:scale-110 duration-500", stat.color)}>
                 <stat.icon className="w-32 h-32" />
             </div>
             
             <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-brand-muted">{stat.label}</p>
                    <h3 className="text-2xl font-serif font-bold text-brand-dark mt-2 tracking-tight">{stat.value}</h3>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                    <span className={cn("flex items-center font-medium px-2 py-0.5 rounded-full text-xs", stat.bgColor, stat.color)}>
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        {stat.trend}
                    </span>
                    <span className="text-brand-muted ml-2 text-xs">{stat.vsLabel}</span>
                </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Rest of dashboard components (Charts, etc) - Unchanged for now, though charts could also filter by date if needed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-brand-default/50">
            <h3 className="text-lg font-serif font-semibold text-brand-dark mb-6">{t('dashboard.patientVisitsOverview')}</h3>
            <div className="h-[300px]">
                {visitsLoading ? (
                    <div className="h-full flex items-center justify-center text-brand-muted">Loading chart...</div>
                ) : !visits || visits.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-brand-muted">No visit data available</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={visits}>
                            <defs>
                                <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#d4a373" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#d4a373" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                            <Tooltip />
                            <Area type="monotone" dataKey="patients" stroke="#d4a373" strokeWidth={3} fillOpacity={1} fill="url(#colorPatients)" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>

        {/* Upcoming Schedule */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-default/50">
           <h3 className="text-lg font-serif font-semibold text-brand-dark mb-4">{t('dashboard.upcomingSchedule')}</h3>
           <div className="space-y-4">
               {upcomingLoading ? (
                   <div className="text-center py-4 text-brand-muted">{t('common.loading')}</div>
               ) : upcoming?.length === 0 ? (
                   <div className="text-center py-4 text-brand-muted">{t('dashboard.noUpcomingAppointments')}</div>
               ) : (
                   upcoming?.map((apt, i) => (
                       <div key={i} onClick={() => navigate('/agenda')} className="flex items-center p-3 hover:bg-brand-light/30 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-brand-soft/50">
                           <div className="p-3 bg-brand-light rounded-lg text-brand-dark font-medium text-sm min-w-[65px] text-center">
                               {apt.time}
                           </div>
                           <div className="ml-4 flex-1">
                               <h4 className="text-sm font-semibold text-brand-dark">{apt.patient}</h4>
                               <p className="text-xs text-brand-muted">{apt.type}</p>
                           </div>
                           <div>
                               <span className={cn(
                                   "text-xs px-2 py-1 rounded-full font-medium border",
                                   apt.status === 'in_progress' ? "bg-brand-soft/50 text-brand-dark border-brand-soft" :
                                   apt.status === 'scheduled' ? "bg-brand-light text-brand-text border-brand-default/30" :
                                   "bg-brand-default/10 text-brand-default border-brand-default/20"
                               )}>
                                   {apt.status}
                               </span>
                           </div>
                       </div>
                   ))
               )}
           </div>
           <button onClick={() => navigate('/agenda')} className="w-full mt-6 py-2.5 text-sm font-medium text-brand-default border border-brand-default/30 rounded-lg hover:bg-brand-default hover:text-white transition-all">
               {t('dashboard.viewFullSchedule')}
           </button>
        </div>
      </div>
      
      {/* Analytics & EMR Section */}
      <h2 className="text-xl font-serif font-bold text-brand-dark pt-4">{t('dashboard.analyticsAndEMR')}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Pathology Distribution */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-soft/50">
               <h3 className="text-lg font-serif font-semibold text-brand-dark mb-6">{t('dashboard.commonPathologies')}</h3>
               <div className="h-[300px] flex items-center justify-center">
                 {pathologiesLoading ? (
                     <div className="text-brand-muted">{t('common.loading')}</div>
                 ) : !pathologies || pathologies.length === 0 ? (
                     <div className="text-brand-muted">No data available</div>
                 ) : (
                   <div style={{ width: '100%', height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pathologies}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pathologies?.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                   </div>
                 )}
                 {!pathologiesLoading && pathologies && pathologies.length > 0 && (
                     <div className="space-y-2 ml-4">
                             {pathologies?.map((d, i) => (
                                 <div key={i} className="flex items-center gap-2">
                                     <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                                     <span className="text-sm text-brand-dark">{d.name}</span>
                                 </div>
                             ))}
                     </div>
                 )}
               </div>
           </div>

           {/* Revenue Chart */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-soft/50">
               <h3 className="text-lg font-serif font-semibold text-brand-dark mb-6">{t('dashboard.revenueMonthly')}</h3>
               <div className="h-[300px]">
                 {revenueLoading ? (
                      <div className="h-full flex items-center justify-center text-brand-muted">{t('common.loading')}</div>
                 ) : !revenue || revenue.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-brand-muted">No revenue data available</div>
                 ) : (
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={revenue}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                           <Tooltip cursor={{fill: 'transparent'}} />
                           <Bar dataKey="amount" fill="#d4a373" radius={[4, 4, 0, 0]} barSize={30} />
                       </BarChart>
                   </ResponsiveContainer>
                 )}
               </div>
           </div>
       </div>

       {/* Recent Reports Table */}
       <div className="bg-white rounded-2xl shadow-sm border border-brand-soft/50 overflow-hidden">
           <div className="p-4 border-b border-brand-soft/50 flex justify-between items-center bg-brand-light/20">
               <h3 className="font-serif font-semibold text-brand-dark">{t('dashboard.recentConsultationReports')}</h3>
               <button className="text-sm text-brand-default font-medium hover:underline">{t('dashboard.viewAll')}</button>
           </div>
           
           <div className="divide-y divide-brand-soft/50">
               {[1,2,3,4].map((i) => (
                   <div key={i} className="p-4 flex items-center justify-between hover:bg-brand-light/30 transition-colors">
                       <div className="flex items-center gap-3">
                           <div className="p-2 bg-brand-light rounded-lg text-brand-dark">
                               <FileText className="w-5 h-5" />
                           </div>
                           <div>
                               <p className="text-sm font-medium text-brand-dark">Consultation Report - Sophie Miller</p>
                               <p className="text-xs text-brand-muted">25 Jan 2026 • Dermatoscopy</p>
                           </div>
                       </div>
                       <button className="px-3 py-1 text-xs border border-brand-soft rounded-full text-brand-dark hover:bg-brand-light">
                           {t('common.view')}
                       </button>
                   </div>
               ))}
           </div>
       </div>
    </div>
  );
}
