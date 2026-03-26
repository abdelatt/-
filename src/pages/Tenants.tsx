import { useState, FormEvent } from 'react';
import { useApp } from '../AppContext';
import { Search, User, Phone, CreditCard, Building2, MoreVertical, Plus, History, X, Calendar, DollarSign, Wrench, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { Tenant, Contract, Invoice, MaintenanceRequest } from '../types';

export default function Tenants() {
  const { tenants: allTenants, setTenants: setAllTenants, contracts, apartments, buildings, invoices, maintenanceRequests } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: '', phone: '', idNumber: '' });
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredTenants = allTenants.filter(t => 
    t.name.includes(searchTerm) || t.phone.includes(searchTerm) || t.idNumber.includes(searchTerm)
  );

  const handleAddTenant = (e: FormEvent) => {
    e.preventDefault();
    const tenant: Tenant = {
      id: `t-${Date.now()}`,
      name: newTenant.name,
      phone: newTenant.phone,
      idNumber: newTenant.idNumber,
      email: `${newTenant.name.replace(/\s+/g, '.').toLowerCase()}@example.com`
    };
    setAllTenants([tenant, ...allTenants]);
    setIsAddModalOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setNewTenant({ name: '', phone: '', idNumber: '' });
  };

  const getTenantUnit = (tenantId: string) => {
    const activeContract = contracts.find(c => c.tenantId === tenantId && c.status === 'active');
    if (!activeContract) return null;
    const apartment = apartments.find(a => a.id === activeContract.apartmentId);
    const building = buildings.find(b => b.id === apartment?.buildingId);
    return { apartment, building };
  };

  const getTenantHistory = (tenantId: string) => {
    const tenantContracts = contracts.filter(c => c.tenantId === tenantId);
    const tenantInvoices = invoices.filter(inv => 
      tenantContracts.some(c => c.id === inv.contractId)
    );
    
    // Find maintenance requests for apartments this tenant has lived in
    const tenantMaintenance = maintenanceRequests.filter(req => 
      tenantContracts.some(c => c.apartmentId === req.apartmentId && 
        new Date(req.date) >= new Date(c.startDate) && 
        (c.status === 'active' || new Date(req.date) <= new Date(c.endDate))
      )
    );

    return {
      contracts: tenantContracts.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
      invoices: tenantInvoices.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()),
      maintenance: tenantMaintenance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">إدارة السكان</h2>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة ساكن جديد
        </button>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-bold">تم إضافة الساكن بنجاح</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث بالاسم، رقم الجوال، أو رقم الهوية..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">الساكن</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">معلومات الاتصال</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">رقم الهوية</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">الوحدة الحالية</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTenants.map(tenant => {
                const unit = getTenantUnit(tenant.id);
                return (
                  <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center ml-3">
                          <User className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="text-sm font-bold text-slate-900">{tenant.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-600">
                        <Phone className="w-4 h-4 ml-2 text-slate-400" />
                        {tenant.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-600">
                        <CreditCard className="w-4 h-4 ml-2 text-slate-400" />
                        {tenant.idNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {unit ? (
                        <div className="flex items-center text-sm text-slate-900">
                          <Building2 className="w-4 h-4 ml-2 text-blue-500" />
                          {unit.building?.name} - شقة {unit.apartment?.apartmentNumber}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">لا يوجد عقد نشط</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedTenant(tenant)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                          title="عرض السجل التاريخي"
                        >
                          <History className="w-4 h-4" />
                          <span>السجل</span>
                        </button>
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedTenant.name}</h3>
                  <p className="text-sm text-slate-500">السجل التاريخي للساكن</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTenant(null)}
                className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Contracts Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold">العقود</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getTenantHistory(selectedTenant.id).contracts.map(contract => {
                    const apt = apartments.find(a => a.id === contract.apartmentId);
                    const bld = buildings.find(b => b.id === apt?.buildingId);
                    return (
                      <div key={contract.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-bold text-slate-900">{bld?.name} - شقة {apt?.apartmentNumber}</span>
                          </div>
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                            contract.status === 'active' ? "bg-emerald-100 text-emerald-700" :
                            contract.status === 'expired' ? "bg-slate-100 text-slate-600" :
                            "bg-red-100 text-red-700"
                          )}>
                            {contract.status === 'active' ? 'نشط' : contract.status === 'expired' ? 'منتهي' : 'ملغي'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-slate-500 mb-1">تاريخ البدء</p>
                            <p className="font-bold text-slate-700">{contract.startDate}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 mb-1">تاريخ الانتهاء</p>
                            <p className="font-bold text-slate-700">{contract.endDate}</p>
                          </div>
                          <div className="col-span-2 pt-2 border-t border-slate-50">
                            <p className="text-slate-500 mb-1">الإيجار السنوي</p>
                            <p className="text-lg font-bold text-blue-600">{formatCurrency(contract.annualRent)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Payments Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold">سجل المدفوعات</h4>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-bold text-slate-600">الوصف</th>
                        <th className="px-4 py-3 font-bold text-slate-600">المبلغ</th>
                        <th className="px-4 py-3 font-bold text-slate-600">تاريخ الاستحقاق</th>
                        <th className="px-4 py-3 font-bold text-slate-600">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {getTenantHistory(selectedTenant.id).invoices.map(invoice => (
                        <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-700">{invoice.description}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(invoice.amount)}</td>
                          <td className="px-4 py-3 text-slate-500">{invoice.dueDate}</td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold",
                              invoice.status === 'paid' ? "bg-emerald-100 text-emerald-700" :
                              invoice.status === 'overdue' ? "bg-red-100 text-red-700" :
                              "bg-amber-100 text-amber-700"
                            )}>
                              {invoice.status === 'paid' ? 'مدفوع' : invoice.status === 'overdue' ? 'متأخر' : 'غير مدفوع'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {getTenantHistory(selectedTenant.id).invoices.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">لا يوجد سجل مدفوعات</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Maintenance Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800">
                  <Wrench className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold">طلبات الصيانة</h4>
                </div>
                <div className="space-y-3">
                  {getTenantHistory(selectedTenant.id).maintenance.map(request => {
                    const apt = apartments.find(a => a.id === request.apartmentId);
                    return (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-amber-200 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            {request.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> :
                             request.status === 'in_progress' ? <Wrench className="w-5 h-5 text-blue-600" /> :
                             request.status === 'pending' ? <Clock className="w-5 h-5 text-amber-600" /> :
                             <AlertCircle className="w-5 h-5 text-slate-400" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{request.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{request.description}</p>
                            <p className="text-[10px] text-slate-400 mt-1">شقة {apt?.apartmentNumber} • {request.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-bold",
                            request.priority === 'high' ? "bg-red-100 text-red-700" :
                            request.priority === 'medium' ? "bg-amber-100 text-amber-700" :
                            "bg-blue-100 text-blue-700"
                          )}>
                            {request.priority === 'high' ? 'عالية' : request.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                          </span>
                          {request.cost && (
                            <p className="text-xs font-bold text-slate-900 mt-2">{formatCurrency(request.cost)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {getTenantHistory(selectedTenant.id).maintenance.length === 0 && (
                    <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl italic">
                      لا توجد طلبات صيانة مسجلة
                    </div>
                  )}
                </div>
              </section>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedTenant(null)}
                className="px-6 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tenant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">إضافة ساكن جديد</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleAddTenant} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">الاسم الكامل</label>
                <input 
                  type="text" 
                  required
                  value={newTenant.name}
                  onChange={e => setNewTenant({...newTenant, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">رقم الجوال</label>
                <input 
                  type="tel" 
                  required
                  value={newTenant.phone}
                  onChange={e => setNewTenant({...newTenant, phone: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">رقم الهوية / الإقامة</label>
                <input 
                  type="text" 
                  required
                  value={newTenant.idNumber}
                  onChange={e => setNewTenant({...newTenant, idNumber: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                  إضافة الساكن
                </button>
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
