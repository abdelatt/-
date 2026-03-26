import { Building2, Home, AlertCircle, Wallet, Wrench, Clock, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../AppContext';
import { formatCurrency, cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { subMonths, format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { useMemo, useState } from 'react';

export default function Dashboard() {
  const { buildings, apartments, invoices, maintenanceRequests, notifications } = useApp();
  const [expandedBuildings, setExpandedBuildings] = useState<Record<string, boolean>>({});

  const toggleBuilding = (id: string) => {
    setExpandedBuildings(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalBuildings = buildings.length;
  const totalCapacity = buildings.reduce((sum, b) => sum + (b.floors * b.apartmentsPerFloor), 0);
  const occupiedApartments = apartments.filter(a => a.status === 'occupied').length;
  const maintenanceApartments = apartments.filter(a => a.status === 'maintenance').length;
  const availableApartments = totalCapacity - occupiedApartments - maintenanceApartments;
  
  const totalExpected = invoices
    .filter(i => i.status !== 'paid')
    .reduce((sum, i) => sum + i.amount, 0);

  const activeMaintenance = maintenanceRequests.filter(r => r.status === 'pending' || r.status === 'in_progress').length;

  const buildingStats = useMemo(() => {
    return buildings.map(b => {
      const bApts = apartments.filter(a => a.buildingId === b.id);
      const total = b.floors * b.apartmentsPerFloor;
      const occupied = bApts.filter(a => a.status === 'occupied').length;
      const maintenance = bApts.filter(a => a.status === 'maintenance').length;
      const available = total - occupied - maintenance;
      const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

      return {
        ...b,
        total,
        occupied,
        available,
        maintenance,
        occupancyRate
      };
    });
  }, [buildings, apartments]);

  const chartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const revenue = invoices
        .filter(inv => inv.status === 'paid' && isWithinInterval(parseISO(inv.dueDate), { start, end }))
        .reduce((sum, inv) => sum + inv.amount, 0);

      return {
        name: format(date, 'MMM'),
        revenue
      };
    });
  }, [invoices]);

  const latestMaintenance = useMemo(() => {
    return [...maintenanceRequests]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [maintenanceRequests]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'in_progress': return <Wrench className="w-4 h-4 text-blue-600" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default: return <AlertCircle className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'in_progress': return 'تحت التنفيذ';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">نظرة عامة</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">إجمالي العقارات</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{totalBuildings}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">الوحدات المتاحة</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{availableApartments} <span className="text-sm font-normal text-slate-400">من {totalCapacity}</span></p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">طلبات صيانة نشطة</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{activeMaintenance}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">إجمالي المستحقات</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(totalExpected)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Building Stats Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800">إحصائيات العقارات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buildingStats.map(b => (
            <div key={b.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <button 
                onClick={() => toggleBuilding(b.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 text-blue-600 ml-3" />
                  <span className="font-bold text-slate-800">{b.name}</span>
                </div>
                {expandedBuildings[b.id] ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>
              
              {expandedBuildings[b.id] && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">إجمالي الوحدات</p>
                      <p className="text-lg font-bold text-slate-900">{b.total}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">مؤجر</p>
                      <p className="text-lg font-bold text-red-600">{b.occupied}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">متاح</p>
                      <p className="text-lg font-bold text-emerald-600">{b.available}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">نسبة الإشغال</span>
                      <span className="text-blue-600">{b.occupancyRate}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${b.occupancyRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">الإيرادات المحصلة (أخر 6 أشهر)</h3>
          <div className="h-72 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), 'الإيرادات']}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts & Maintenance */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">تنبيهات هامة</h3>
            <div className="space-y-4">
              {notifications.filter(n => !n.isRead).slice(0, 3).map(notification => (
                <div key={notification.id} className={cn(
                  "flex items-start p-3 rounded-lg border",
                  notification.type === 'rent_due' || notification.type === 'contract_expiry' 
                    ? "bg-amber-50 border-amber-100" 
                    : "bg-blue-50 border-blue-100"
                )}>
                  <AlertCircle className={cn(
                    "w-5 h-5 ml-3 shrink-0 mt-0.5",
                    notification.type === 'rent_due' || notification.type === 'contract_expiry' 
                      ? "text-amber-600" 
                      : "text-blue-600"
                  )} />
                  <div>
                    <p className={cn(
                      "text-sm font-medium",
                      notification.type === 'rent_due' || notification.type === 'contract_expiry' 
                        ? "text-amber-900" 
                        : "text-blue-900"
                    )}>{notification.title}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      notification.type === 'rent_due' || notification.type === 'contract_expiry' 
                        ? "text-amber-700" 
                        : "text-blue-700"
                    )}>{notification.message}</p>
                  </div>
                </div>
              ))}
              {notifications.filter(n => !n.isRead).length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">لا توجد تنبيهات جديدة</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">أحدث طلبات الصيانة</h3>
            <div className="space-y-4">
              {latestMaintenance.map(request => {
                const apt = apartments.find(a => a.id === request.apartmentId);
                const bld = buildings.find(b => b.id === apt?.buildingId);
                return (
                  <div key={request.id} className="flex items-start p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center ml-3 shrink-0">
                      {getStatusIcon(request.status)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-900 truncate">{request.title}</p>
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-bold mr-2",
                          request.status === 'pending' ? "bg-amber-100 text-amber-700" :
                          request.status === 'in_progress' ? "bg-blue-100 text-blue-700" :
                          "bg-emerald-100 text-emerald-700"
                        )}>
                          {getStatusText(request.status)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {bld?.name} - شقة {apt?.apartmentNumber}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
