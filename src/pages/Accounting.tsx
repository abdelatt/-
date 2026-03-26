import { useState } from 'react';
import { useApp } from '../AppContext';
import { systemSettings } from '../data/mockData';
import { formatCurrency, cn } from '../lib/utils';
import { Search, Filter, Download, Wallet, CreditCard, TrendingDown, TrendingUp, Receipt, X, Building2, Home, CheckCircle2, AlertCircle, Clock, FileText, User, Calendar, DollarSign, Printer } from 'lucide-react';

export default function Accounting() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'expenses'>('invoices');
  const { invoices: allInvoices, setInvoices: setAllInvoices, expenses: allExpenses, setExpenses: setAllExpenses, contracts, tenants, apartments, buildings } = useApp();
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid' | 'overdue'>('all');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: 'other' as any,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    buildingId: '',
    apartmentId: ''
  });
  const [newInvoice, setNewInvoice] = useState({
    contractId: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  const filteredInvoices = allInvoices.filter(inv => filter === 'all' || inv.status === filter);

  const totalRevenue = allInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalVAT = totalRevenue * (systemSettings.vatRate / 100);

  const getInvoiceDetails = (invoice: typeof allInvoices[0]) => {
    const contract = contracts.find(c => c.id === invoice.contractId);
    const tenant = tenants.find(t => t.id === contract?.tenantId);
    const apartment = apartments.find(a => a.id === contract?.apartmentId);
    const building = buildings.find(b => b.id === apartment?.buildingId);

    return { contract, tenant, apartment, building };
  };

  const getExpenseDetails = (expense: typeof allExpenses[0]) => {
    const building = buildings.find(b => b.id === expense.buildingId);
    const apartment = apartments.find(a => a.id === expense.apartmentId);
    return { building, apartment };
  };

  const handleAddExpense = () => {
    const expense: typeof allExpenses[0] = {
      id: `exp-${Date.now()}`,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      date: newExpense.date,
      description: newExpense.description,
      buildingId: newExpense.buildingId || undefined,
      apartmentId: newExpense.apartmentId || undefined
    };

    setAllExpenses([expense, ...allExpenses]);
    setIsExpenseModalOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setNewExpense({
      category: 'other',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      buildingId: '',
      apartmentId: ''
    });
  };

  const handleAddInvoice = () => {
    const invoice: typeof allInvoices[0] = {
      id: `inv-${Date.now()}`,
      contractId: newInvoice.contractId,
      amount: parseFloat(newInvoice.amount),
      dueDate: newInvoice.dueDate,
      status: 'unpaid',
      description: newInvoice.description
    };

    setAllInvoices([invoice, ...allInvoices]);
    setIsInvoiceModalOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setNewInvoice({
      contractId: '',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">المالية والحسابات</h2>
        <div className="flex space-x-3 space-x-reverse">
          <button className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Download className="w-4 h-4 ml-2" />
            تصدير التقرير
          </button>
          <button 
            onClick={() => activeTab === 'invoices' ? setIsInvoiceModalOpen(true) : setIsExpenseModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {activeTab === 'invoices' ? 'إصدار فاتورة' : 'إضافة مصروف'}
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-bold">تم تنفيذ العملية بنجاح</p>
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-sm font-medium text-slate-500">إجمالي الإيرادات (المحصلة)</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalRevenue)}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">-5%</span>
          </div>
          <p className="text-sm font-medium text-slate-500">إجمالي المصروفات</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalExpenses)}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{systemSettings.vatRate}%</span>
          </div>
          <p className="text-sm font-medium text-slate-500">ضريبة القيمة المضافة المستحقة</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalVAT)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('invoices')}
            className={cn(
              "px-6 py-4 text-sm font-bold transition-colors border-b-2",
              activeTab === 'invoices' ? "border-blue-600 text-blue-600 bg-blue-50/30" : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            الفواتير (الإيرادات)
          </button>
          <button 
            onClick={() => setActiveTab('expenses')}
            className={cn(
              "px-6 py-4 text-sm font-bold transition-colors border-b-2",
              activeTab === 'expenses' ? "border-blue-600 text-blue-600 bg-blue-50/30" : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            المصروفات
          </button>
        </div>

        {activeTab === 'invoices' ? (
          <>
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ابحث برقم الفاتورة أو اسم الساكن..." 
                  className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                <Filter className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
                <span className="text-sm text-slate-500 ml-2 shrink-0">تصفية:</span>
                {(['all', 'paid', 'unpaid', 'overdue'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                      filter === status 
                        ? "bg-slate-800 text-white" 
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {status === 'all' ? 'الكل' : 
                     status === 'paid' ? 'مدفوع' : 
                     status === 'unpaid' ? 'غير مدفوع' : 'متأخر'}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">رقم الفاتورة</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">الساكن</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">الوصف</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">تاريخ الاستحقاق</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">المبلغ</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredInvoices.map(invoice => {
                    const { tenant, apartment, building } = getInvoiceDetails(invoice);
                    return (
                      <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          #{invoice.id.toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">{tenant?.name}</div>
                          <div className="text-xs text-slate-500">{building?.name} - شقة {apartment?.apartmentNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {invoice.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {invoice.dueDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            "px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
                            invoice.status === 'paid' && "bg-emerald-100 text-emerald-800",
                            invoice.status === 'unpaid' && "bg-slate-100 text-slate-800",
                            invoice.status === 'overdue' && "bg-red-100 text-red-800"
                          )}>
                            {invoice.status === 'paid' ? 'مدفوع' : invoice.status === 'unpaid' ? 'غير مدفوع' : 'متأخر'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          <button 
                            onClick={() => setSelectedInvoice(invoice)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            عرض
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">التاريخ</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">الفئة</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">المرتبط بـ</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">الوصف</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">المبلغ</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {allExpenses.map(expense => {
                  const { building, apartment } = getExpenseDetails(expense);
                  return (
                    <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {expense.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
                          expense.category === 'maintenance' && "bg-amber-100 text-amber-800",
                          expense.category === 'utilities' && "bg-blue-100 text-blue-800",
                          expense.category === 'salaries' && "bg-emerald-100 text-emerald-800",
                          expense.category === 'other' && "bg-slate-100 text-slate-800"
                        )}>
                          {expense.category === 'maintenance' ? 'صيانة' : 
                           expense.category === 'utilities' ? 'خدمات' : 
                           expense.category === 'salaries' ? 'رواتب' : 'أخرى'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {building ? (
                          <div className="text-xs text-slate-600">
                            <div className="flex items-center">
                              <Building2 className="w-3 h-3 ml-1 text-slate-400" />
                              {building.name}
                            </div>
                            {apartment && (
                              <div className="flex items-center mt-0.5">
                                <Home className="w-3 h-3 ml-1 text-slate-400" />
                                شقة {apartment.apartmentNumber}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">غير مرتبط</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <button className="text-blue-600 hover:text-blue-900 font-medium">عرض</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">إضافة مصروف جديد</h3>
              <button 
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الفئة</label>
                  <select 
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value as any})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="maintenance">صيانة</option>
                    <option value="utilities">خدمات</option>
                    <option value="salaries">رواتب</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">المبلغ</label>
                  <input 
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">التاريخ</label>
                <input 
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">العقار (اختياري)</label>
                  <select 
                    value={newExpense.buildingId}
                    onChange={(e) => setNewExpense({...newExpense, buildingId: e.target.value, apartmentId: ''})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">غير مرتبط بعقار</option>
                    {buildings.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الشقة (اختياري)</label>
                  <select 
                    value={newExpense.apartmentId}
                    onChange={(e) => setNewExpense({...newExpense, apartmentId: e.target.value})}
                    disabled={!newExpense.buildingId}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">غير مرتبط بشقة</option>
                    {apartments
                      .filter(a => a.buildingId === newExpense.buildingId)
                      .map(a => (
                        <option key={a.id} value={a.id}>شقة {a.apartmentNumber}</option>
                      ))
                    }
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الوصف</label>
                <textarea 
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  placeholder="أدخل وصف المصروف..."
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex space-x-3 space-x-reverse">
              <button 
                onClick={handleAddExpense}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                حفظ المصروف
              </button>
              <button 
                onClick={() => setIsExpenseModalOpen(false)}
                className="flex-1 bg-white border border-slate-200 text-slate-600 py-2 rounded-lg font-bold hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">إصدار فاتورة جديدة</h3>
              <button 
                onClick={() => setIsInvoiceModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddInvoice(); }} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">عقد الإيجار</label>
                <select 
                  required 
                  value={newInvoice.contractId}
                  onChange={(e) => setNewInvoice({...newInvoice, contractId: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر العقد</option>
                  {contracts.filter(c => c.status === 'active').map(c => (
                    <option key={c.id} value={c.id}>
                      عقد #{c.id} - {tenants.find(t => t.id === c.tenantId)?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">المبلغ</label>
                  <input 
                    type="number" 
                    required 
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                    placeholder="0.00" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">تاريخ الاستحقاق</label>
                  <input 
                    type="date" 
                    required 
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الوصف</label>
                <input 
                  type="text" 
                  required 
                  value={newInvoice.description}
                  onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                  placeholder="مثال: إيجار شهر مارس 2024" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div className="pt-4 flex space-x-3 space-x-reverse">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">إصدار الفاتورة</button>
                <button type="button" onClick={() => setIsInvoiceModalOpen(false)} className="flex-1 bg-white border border-slate-200 text-slate-600 py-2 rounded-lg font-bold hover:bg-slate-50 transition-colors">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">فاتورة #{selectedInvoice.id.toUpperCase()}</h3>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                    selectedInvoice.status === 'paid' && "bg-emerald-100 text-emerald-700",
                    selectedInvoice.status === 'unpaid' && "bg-slate-100 text-slate-700",
                    selectedInvoice.status === 'overdue' && "bg-red-100 text-red-700"
                  )}>
                    {selectedInvoice.status === 'paid' ? 'مدفوعة' : selectedInvoice.status === 'unpaid' ? 'غير مدفوعة' : 'متأخرة'}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1 flex items-center"><User className="w-3 h-3 ml-1" /> الساكن</p>
                    <p className="font-bold text-slate-900">{getInvoiceDetails(selectedInvoice).tenant?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1 flex items-center"><Building2 className="w-3 h-3 ml-1" /> العقار / الشقة</p>
                    <p className="font-bold text-slate-900">
                      {getInvoiceDetails(selectedInvoice).building?.name} - شقة {getInvoiceDetails(selectedInvoice).apartment?.apartmentNumber}
                    </p>
                  </div>
                </div>
                <div className="space-y-4 text-left">
                  <div>
                    <p className="text-xs text-slate-500 mb-1 flex items-center justify-end">تاريخ الاستحقاق <Calendar className="w-3 h-3 mr-1" /></p>
                    <p className="font-bold text-slate-900">{selectedInvoice.dueDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1 flex items-center justify-end">المبلغ الإجمالي <DollarSign className="w-3 h-3 mr-1" /></p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(selectedInvoice.amount)}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">الوصف</p>
                <p className="text-sm text-slate-700">{selectedInvoice.description}</p>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> تحميل PDF
                </button>
                <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  <Printer className="w-4 h-4" /> طباعة
                </button>
                {selectedInvoice.status !== 'paid' && (
                  <button className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                    تسجيل دفع
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
