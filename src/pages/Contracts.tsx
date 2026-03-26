import { useState, FormEvent } from 'react';
import { useApp } from '../AppContext';
import { formatCurrency, cn } from '../lib/utils';
import { Search, Filter, Calendar, User, Building2, AlertCircle, CheckCircle2, XCircle, Plus, X, FileText, DollarSign, Download, Printer, Clock } from 'lucide-react';

export default function Contracts() {
  const { contracts: allContracts, setContracts: setAllContracts, tenants, apartments, buildings } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'terminated'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [isAddContractModalOpen, setIsAddContractModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [contractForm, setContractForm] = useState({
    tenantId: '',
    apartmentId: '',
    startDate: '',
    endDate: '',
    annualRent: '',
    paymentMethod: 'monthly'
  });

  const getContractDetails = (contract: any) => {
    const tenant = tenants.find(t => t.id === contract.tenantId);
    const apartment = apartments.find(a => a.id === contract.apartmentId);
    const building = buildings.find(b => b.id === apartment?.buildingId);
    return { tenant, apartment, building };
  };

  const filteredContracts = allContracts.filter(c => {
    const { tenant } = getContractDetails(c);
    const matchesFilter = filter === 'all' || c.status === filter;
    const matchesSearch = tenant?.name.includes(searchTerm) || c.id.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const activeContractsList = allContracts.filter(c => c.status === 'active');

  const sortedActiveContracts = [...activeContractsList].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let aValue: any;
    let bValue: any;

    if (key === 'tenantName') {
      aValue = tenants.find(t => t.id === a.tenantId)?.name || '';
      bValue = tenants.find(t => t.id === b.tenantId)?.name || '';
    } else if (key === 'apartmentNumber') {
      aValue = apartments.find(ap => ap.id === a.apartmentId)?.apartmentNumber || '';
      bValue = apartments.find(ap => ap.id === b.apartmentId)?.apartmentNumber || '';
    } else {
      aValue = (a as any)[key];
      bValue = (b as any)[key];
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleAddContract = (e: FormEvent) => {
    e.preventDefault();
    const newContract = {
      id: `cnt-${Date.now()}`,
      tenantId: contractForm.tenantId,
      apartmentId: contractForm.apartmentId,
      startDate: contractForm.startDate,
      endDate: contractForm.endDate,
      annualRent: parseInt(contractForm.annualRent),
      status: 'active',
      paymentMethod: contractForm.paymentMethod,
      renewalReminderDays: 30
    };
    setAllContracts([newContract, ...allContracts]);
    setIsAddContractModalOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setContractForm({ tenantId: '', apartmentId: '', startDate: '', endDate: '', annualRent: '', paymentMethod: 'monthly' });
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            نشط
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 ml-1" />
            منتهي
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 ml-1" />
            قيد الانتظار
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">عقود الإيجار</h2>
        <button 
          onClick={() => setIsAddContractModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 ml-2" />
          إنشاء عقد جديد
        </button>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-bold">تم إنشاء العقد بنجاح</p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center ml-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">عقود نشطة</p>
            <p className="text-xl font-bold text-slate-900">{allContracts.filter(c => c.status === 'active').length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center">
          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center ml-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">عقود منتهية</p>
            <p className="text-xl font-bold text-slate-900">{allContracts.filter(c => c.status === 'expired').length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center ml-3">
            <Calendar className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">تجديدات قريبة</p>
            <p className="text-xl font-bold text-slate-900">2</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث باسم الساكن أو رقم العقد..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            {(['all', 'active', 'expired', 'terminated'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  filter === s ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {s === 'all' ? 'الكل' : s === 'active' ? 'نشط' : s === 'expired' ? 'منتهي' : 'ملغى'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredContracts.map(contract => {
            const { tenant, apartment, building } = getContractDetails(contract);
            return (
              <div key={contract.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow relative overflow-hidden">
                <div className={cn(
                  "absolute top-0 left-0 w-1.5 h-full",
                  contract.status === 'active' ? "bg-emerald-500" : 
                  contract.status === 'expired' ? "bg-red-500" : "bg-slate-400"
                )}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">رقم العقد #{contract.id.toUpperCase()}</span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{tenant?.name}</h3>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase",
                    contract.status === 'active' ? "bg-emerald-100 text-emerald-700" : 
                    contract.status === 'expired' ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
                  )}>
                    {contract.status === 'active' ? 'نشط' : contract.status === 'expired' ? 'منتهي' : 'ملغى'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-slate-600">
                    <Building2 className="w-4 h-4 ml-2 text-slate-400" />
                    {building?.name} - شقة {apartment?.apartmentNumber}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="w-4 h-4 ml-2 text-slate-400" />
                    {contract.startDate} إلى {contract.endDate}
                  </div>
                  <div className="flex items-center text-sm font-bold text-blue-600">
                    الإيجار السنوي: {formatCurrency(contract.annualRent)}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="text-xs text-slate-500">
                    تنبيه التجديد: {contract.renewalReminderDays || 0} يوم
                  </div>
                  <button 
                    onClick={() => setSelectedContract(contract)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                  >
                    التفاصيل
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Section: Active Contracts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">جدول العقود النشطة</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th 
                  className="px-6 py-4 font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('tenantName')}
                >
                  اسم الساكن {sortConfig?.key === 'tenantName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-4 font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('apartmentNumber')}
                >
                  رقم الشقة {sortConfig?.key === 'apartmentNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-4 font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('startDate')}
                >
                  تاريخ البدء {sortConfig?.key === 'startDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-4 font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('endDate')}
                >
                  تاريخ الانتهاء {sortConfig?.key === 'endDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-4 font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('annualRent')}
                >
                  الإيجار السنوي {sortConfig?.key === 'annualRent' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedActiveContracts.map((contract) => {
                const { tenant, apartment } = getContractDetails(contract);
                return (
                  <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{tenant?.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{apartment?.apartmentNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{contract.startDate}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{contract.endDate}</td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-600">{formatCurrency(contract.annualRent)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contract Modal */}
      {isAddContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">إنشاء عقد إيجار جديد</h3>
              <button onClick={() => setIsAddContractModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAddContract} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">المستأجر</label>
                  <select 
                    required 
                    value={contractForm.tenantId}
                    onChange={(e) => setContractForm({...contractForm, tenantId: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر المستأجر</option>
                    {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">العقار والشقة</label>
                  <select 
                    required 
                    value={contractForm.apartmentId}
                    onChange={(e) => setContractForm({...contractForm, apartmentId: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر الشقة</option>
                    {apartments.filter(a => a.status === 'available').map(a => (
                      <option key={a.id} value={a.id}>
                        {buildings.find(b => b.id === a.buildingId)?.name} - شقة {a.apartmentNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">تاريخ البدء</label>
                  <input 
                    type="date" 
                    required 
                    value={contractForm.startDate}
                    onChange={(e) => setContractForm({...contractForm, startDate: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">تاريخ الانتهاء</label>
                  <input 
                    type="date" 
                    required 
                    value={contractForm.endDate}
                    onChange={(e) => setContractForm({...contractForm, endDate: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">قيمة الإيجار السنوي</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      required 
                      value={contractForm.annualRent}
                      onChange={(e) => setContractForm({...contractForm, annualRent: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">ريال</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">طريقة الدفع</label>
                  <select 
                    required 
                    value={contractForm.paymentMethod}
                    onChange={(e) => setContractForm({...contractForm, paymentMethod: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">شهري</option>
                    <option value="quarterly">ربع سنوي</option>
                    <option value="semi-annual">نصف سنوي</option>
                    <option value="annual">سنوي</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">إنشاء العقد</button>
                <button type="button" onClick={() => setIsAddContractModalOpen(false)} className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contract Details Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">تفاصيل العقد #{selectedContract.id}</h3>
                  <div className="mt-1">{getStatusBadge(selectedContract.status)}</div>
                </div>
              </div>
              <button onClick={() => setSelectedContract(null)} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1 flex items-center">
                      <User className="w-3 h-3 ml-1" /> المستأجر
                    </p>
                    <p className="font-bold text-slate-900">{tenants.find(t => t.id === selectedContract.tenantId)?.name}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1 flex items-center">
                      <Building2 className="w-3 h-3 ml-1" /> العقار / الشقة
                    </p>
                    <p className="font-bold text-slate-900">
                      {buildings.find(b => b.id === apartments.find(a => a.id === selectedContract.apartmentId)?.buildingId)?.name} - 
                      شقة {apartments.find(a => a.id === selectedContract.apartmentId)?.apartmentNumber}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1 flex items-center">
                      <Calendar className="w-3 h-3 ml-1" /> تاريخ البدء
                    </p>
                    <p className="font-bold text-slate-900">{selectedContract.startDate}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1 flex items-center">
                      <Calendar className="w-3 h-3 ml-1" /> تاريخ الانتهاء
                    </p>
                    <p className="font-bold text-slate-900">{selectedContract.endDate}</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 ml-2" /> التفاصيل المالية
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-blue-600 mb-1">الإيجار السنوي</p>
                      <p className="text-lg font-bold text-blue-900">{formatCurrency(selectedContract.annualRent)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 mb-1">مبلغ التأمين</p>
                      <p className="text-lg font-bold text-blue-900">{formatCurrency(2000)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700">إجراءات العقد</h4>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4" /> تحميل العقد (PDF)
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                  <Printer className="w-4 h-4" /> طباعة العقد
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                  تجديد العقد
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors">
                  إنهاء العقد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
