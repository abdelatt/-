import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { currentUser } from '../data/mockData';
import { formatCurrency, cn } from '../lib/utils';
import { Search, Filter, Plus, AlertCircle, Clock, CheckCircle2, XCircle, Building2, Wrench, X, User as UserIcon } from 'lucide-react';

export default function Maintenance() {
  const { maintenanceRequests: requests, setMaintenanceRequests: setRequests, apartments, buildings, tenants } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    apartmentId: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  React.useEffect(() => {
    const handleClickOutside = () => setActiveDropdownId(null);
    if (activeDropdownId) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [activeDropdownId]);

  const [showSuccess, setShowSuccess] = useState(false);

  const getUnitDetails = (apartmentId: string) => {
    const apartment = apartments.find(a => a.id === apartmentId);
    const building = buildings.find(b => b.id === apartment?.buildingId);
    return { apartment, building };
  };

  const filteredRequests = requests.filter(req => {
    const matchesFilter = filter === 'all' || req.status === filter;
    const { apartment, building } = getUnitDetails(req.apartmentId);
    const searchStr = `${req.title} ${req.description} ${building?.name} ${apartment?.apartmentNumber}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-amber-600" />;
      case 'in_progress': return <Wrench className="w-5 h-5 text-blue-600" />;
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <AlertCircle className="w-5 h-5 text-slate-600" />;
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return "bg-red-100 text-red-800 border-red-200";
      case 'medium': return "bg-amber-100 text-amber-800 border-amber-200";
      case 'low': return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.title || !newRequest.apartmentId) return;

    const request = {
      id: `req-${Date.now()}`,
      ...newRequest,
      status: 'pending' as const,
      date: new Date().toISOString().split('T')[0],
    };

    setRequests([request, ...requests]);
    setIsModalOpen(false);
    setNewRequest({ title: '', description: '', apartmentId: '', priority: 'medium' });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">إدارة الصيانة</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 ml-2" />
          طلب صيانة جديد
        </button>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-bold">تم إضافة طلب الصيانة بنجاح</p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center shadow-sm">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center ml-3">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">طلبات معلقة</p>
            <p className="text-xl font-bold text-slate-900">{requests.filter(r => r.status === 'pending').length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center ml-3">
            <Wrench className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">قيد التنفيذ</p>
            <p className="text-xl font-bold text-slate-900">{requests.filter(r => r.status === 'in_progress').length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center ml-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">مكتملة</p>
            <p className="text-xl font-bold text-slate-900">{requests.filter(r => r.status === 'completed').length}</p>
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
              placeholder="ابحث في طلبات الصيانة..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            {(['all', 'pending', 'in_progress', 'completed', 'cancelled'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  filter === s ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {s === 'all' ? 'الكل' : s === 'pending' ? 'معلق' : s === 'in_progress' ? 'قيد التنفيذ' : s === 'completed' ? 'مكتمل' : 'ملغي'}
              </button>
            ))}
          </div>
        </div>

        {/* List View */}
        <div className="divide-y divide-slate-100">
          {filteredRequests.map(request => {
            const { apartment, building } = getUnitDetails(request.apartmentId);
            return (
              <div key={request.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center ml-4 shrink-0 shadow-sm">
                    {getStatusIcon(request.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-slate-900">{request.title}</h3>
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border uppercase", getPriorityClass(request.priority))}>
                        {request.priority === 'high' ? 'عالية' : request.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{request.description}</p>
                    <div className="flex items-center text-[11px] text-slate-400">
                      <Building2 className="w-3.5 h-3.5 ml-1" />
                      {building?.name} - شقة {apartment?.apartmentNumber}
                      <span className="mx-2">•</span>
                      <UserIcon className="w-3.5 h-3.5 ml-1" />
                      المالك: {currentUser.name}
                      {apartment?.tenantId && (
                        <>
                          <span className="mx-2">•</span>
                          <UserIcon className="w-3.5 h-3.5 ml-1" />
                          المستأجر: {tenants.find(t => t.id === apartment.tenantId)?.name}
                        </>
                      )}
                      <span className="mx-2">•</span>
                      <Clock className="w-3.5 h-3.5 ml-1" />
                      {request.date}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  {request.cost && (
                    <div className="text-sm font-bold text-slate-900">
                      التكلفة: {formatCurrency(request.cost)}
                    </div>
                  )}
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownId(activeDropdownId === request.id ? null : request.id);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1"
                    >
                      تحديث الحالة
                    </button>
                    {activeDropdownId === request.id && (
                      <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {(['pending', 'in_progress', 'completed', 'cancelled'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setRequests(requests.map(r => 
                                r.id === request.id ? { ...r, status } : r
                              ));
                              setActiveDropdownId(null);
                            }}
                            className="w-full text-right px-4 py-2 text-xs hover:bg-slate-50 transition-colors flex items-center justify-between"
                          >
                            <span>
                              {status === 'pending' ? 'معلق' : 
                               status === 'in_progress' ? 'قيد التنفيذ' : 
                               status === 'completed' ? 'مكتمل' : 'ملغي'}
                            </span>
                            {request.status === status && <CheckCircle2 className="w-3 h-3 text-blue-600" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredRequests.length === 0 && (
            <div className="p-12 text-center text-slate-400 italic">
              لا توجد طلبات صيانة تطابق التصفية الحالية
            </div>
          )}
        </div>
      </div>

      {/* New Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">طلب صيانة جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">عنوان الطلب</label>
                <input 
                  type="text" 
                  required
                  placeholder="مثال: تسريب مياه، عطل تكييف..."
                  value={newRequest.title}
                  onChange={e => setNewRequest({...newRequest, title: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">الوحدة العقارية</label>
                <select 
                  required
                  value={newRequest.apartmentId}
                  onChange={e => setNewRequest({...newRequest, apartmentId: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر الشقة...</option>
                  {apartments.map(apt => {
                    const b = buildings.find(b => b.id === apt.buildingId);
                    return (
                      <option key={apt.id} value={apt.id}>
                        {b?.name} - شقة {apt.apartmentNumber}
                      </option>
                    );
                  })}
                </select>
              </div>

              {newRequest.apartmentId && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">العقار:</span>
                    <span className="font-bold text-slate-700">
                      {getUnitDetails(newRequest.apartmentId).building?.name} - شقة {getUnitDetails(newRequest.apartmentId).apartment?.apartmentNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">المالك:</span>
                    <div className="flex items-center gap-1 font-bold text-slate-700">
                      <UserIcon className="w-3 h-3 text-blue-600" />
                      {currentUser.name}
                    </div>
                  </div>
                  {getUnitDetails(newRequest.apartmentId).apartment?.tenantId && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">المستأجر:</span>
                      <div className="flex items-center gap-1 font-bold text-blue-700">
                        <UserIcon className="w-3 h-3" />
                        {tenants.find(t => t.id === getUnitDetails(newRequest.apartmentId).apartment?.tenantId)?.name}
                      </div>
                    </div>
                  )}
                  {!getUnitDetails(newRequest.apartmentId).apartment?.tenantId && (
                    <div className="text-[10px] text-amber-600 italic text-center">
                      هذه الشقة غير مؤجرة حالياً
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">الأولوية</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewRequest({...newRequest, priority: p})}
                      className={cn(
                        "py-2 rounded-xl text-xs font-bold border transition-all",
                        newRequest.priority === p 
                          ? (p === 'high' ? "bg-red-50 border-red-200 text-red-700 ring-2 ring-red-500/20" : 
                             p === 'medium' ? "bg-amber-50 border-amber-200 text-amber-700 ring-2 ring-amber-500/20" : 
                             "bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-500/20")
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      {p === 'high' ? 'عالية' : p === 'medium' ? 'متوسطة' : 'منخفضة'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">الوصف</label>
                <textarea 
                  rows={3}
                  placeholder="اشرح المشكلة بالتفصيل..."
                  value={newRequest.description}
                  onChange={e => setNewRequest({...newRequest, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                  إرسال الطلب
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
