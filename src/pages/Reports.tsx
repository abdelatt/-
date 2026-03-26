import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Line, Area
} from 'recharts';
import { useApp } from '../AppContext';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, Building2, Calendar, Filter, PieChart as PieChartIcon } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

export default function Reports() {
  const { buildings, invoices, expenses, contracts, apartments } = useApp();
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [dateRange, setDateRange] = useState<number>(6); // Last 6 months

  const reportData = useMemo(() => {
    const months = Array.from({ length: dateRange }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        month: format(date, 'yyyy-MM'),
        label: format(date, 'MMM yyyy'),
        income: 0,
        expenses: 0,
        profit: 0
      };
    }).reverse();

    // Filter invoices and expenses by building if selected
    const filteredInvoices = selectedBuilding === 'all' 
      ? invoices 
      : invoices.filter(inv => {
          const contract = contracts.find(c => c.id === inv.contractId);
          const apartment = apartments.find(a => a.id === contract?.apartmentId);
          return apartment?.buildingId === selectedBuilding;
        });

    const filteredExpenses = selectedBuilding === 'all'
      ? expenses
      : expenses.filter(exp => {
          // Expenses in mockData don't have buildingId directly, but some have relatedId (maintenance)
          // For simplicity in this mock, we'll assume expenses with building names in description belong to them
          // or just filter maintenance expenses by apartment building
          if (exp.category === 'maintenance' && exp.relatedId) {
            // maintenanceRequests have apartmentId
            // but expenses.relatedId points to maintenanceRequest.id
            // This is getting complex for mock data, let's use a simpler heuristic for the demo
            return exp.description.includes(buildings.find(b => b.id === selectedBuilding)?.name || '');
          }
          return exp.description.includes(buildings.find(b => b.id === selectedBuilding)?.name || '');
        });

    months.forEach(m => {
      const start = startOfMonth(parseISO(m.month + '-01'));
      const end = endOfMonth(start);

      // Income (Paid invoices)
      const monthlyIncome = filteredInvoices
        .filter(inv => inv.status === 'paid' && isWithinInterval(parseISO(inv.dueDate), { start, end }))
        .reduce((sum, inv) => sum + inv.amount, 0);

      // Expenses
      const monthlyExpenses = filteredExpenses
        .filter(exp => isWithinInterval(parseISO(exp.date), { start, end }))
        .reduce((sum, exp) => sum + exp.amount, 0);

      m.income = monthlyIncome;
      m.expenses = monthlyExpenses;
      m.profit = monthlyIncome - monthlyExpenses;
    });

    return months;
  }, [selectedBuilding, dateRange, invoices, expenses, contracts, apartments, buildings]);

  const totalIncome = reportData.reduce((sum, d) => sum + d.income, 0);
  const totalExpenses = reportData.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">التقارير المالية</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
            <Building2 className="w-4 h-4 ml-2 text-slate-400" />
            <select 
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="text-sm font-medium text-slate-700 focus:outline-none bg-transparent"
            >
              <option value="all">كل العقارات</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
            <Calendar className="w-4 h-4 ml-2 text-slate-400" />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(Number(e.target.value))}
              className="text-sm font-medium text-slate-700 focus:outline-none bg-transparent"
            >
              <option value={3}>آخر 3 أشهر</option>
              <option value={6}>آخر 6 أشهر</option>
              <option value={12}>آخر سنة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-1">إجمالي الإيرادات</p>
          <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalIncome)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
              +5%
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-1">إجمالي المصروفات</p>
          <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalExpenses)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <span className={cn(
              "text-xs font-bold px-2 py-1 rounded-full",
              totalProfit >= 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
            )}>
              {totalProfit >= 0 ? 'ربح' : 'خسارة'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-1">صافي الربح</p>
          <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalProfit)}</h3>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">مقارنة الإيرادات والمصروفات</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                <Bar dataKey="income" name="الإيرادات" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expenses" name="المصروفات" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">صافي الربح الشهري</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), 'صافي الربح']}
                />
                <Area type="monotone" dataKey="profit" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">تفاصيل البيانات</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">الشهر</th>
                <th className="px-6 py-4 font-bold">الإيرادات</th>
                <th className="px-6 py-4 font-bold">المصروفات</th>
                <th className="px-6 py-4 font-bold">صافي الربح</th>
                <th className="px-6 py-4 font-bold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">{row.label}</td>
                  <td className="px-6 py-4 text-sm text-emerald-600 font-medium">{formatCurrency(row.income)}</td>
                  <td className="px-6 py-4 text-sm text-red-600 font-medium">{formatCurrency(row.expenses)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatCurrency(row.profit)}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold",
                      row.profit >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    )}>
                      {row.profit >= 0 ? 'إيجابي' : 'سلبي'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
