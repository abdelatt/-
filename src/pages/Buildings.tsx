import { useState, FormEvent } from 'react';
import { useApp } from '../AppContext';
import { Building2, MapPin, Layers, CheckCircle2, XCircle, Wrench, Clock, AlertCircle, Plus, X, User, DollarSign, Calendar } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';

export default function Buildings() {
  const { buildings: allBuildings, setBuildings: setAllBuildings, apartments: allApartments, setApartments: setAllApartments, maintenanceRequests, tenants } = useApp();
  const [selectedBuilding, setSelectedBuilding] = useState(allBuildings[0]?.id);
  const [isAddBuildingModalOpen, setIsAddBuildingModalOpen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [buildingForm, setBuildingForm] = useState({
    name: '',
    address: '',
    floors: '',
    apartmentsPerFloor: ''
  });

  const building = allBuildings.find(b => b.id === selectedBuilding);
  const buildingApartments = allApartments.filter(a => a.buildingId === selectedBuilding);
  
  const totalUnits = building ? building.floors * building.apartmentsPerFloor : 0;
  const occupiedCount = buildingApartments.filter(a => a.status === 'occupied').length;
  const maintenanceCount = buildingApartments.filter(a => a.status === 'maintenance').length;
  const availableCount = totalUnits - occupiedCount - maintenanceCount;

  const buildingMaintenance = maintenanceRequests
    .filter(mr => allApartments.some(apt => apt.id === mr.apartmentId && apt.buildingId === selectedBuilding))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const activeMaintenanceCount = buildingMaintenance.filter(r => r.status === 'pending' || r.status === 'in_progress').length;

  // Group apartments by floor
  const floors = Array.from({ length: building?.floors || 0 }, (_, i) => i + 1).reverse();

  const handleAddBuilding = (e: FormEvent) => {
    e.preventDefault();
    const newId = `bld-${Date.now()}`;
    const floorsNum = parseInt(buildingForm.floors);
    const aptsPerFloorNum = parseInt(buildingForm.apartmentsPerFloor);

    const newBuilding = {
      id: newId,
      name: buildingForm.name,
      address: buildingForm.address,
      floors: floorsNum,
      apartmentsPerFloor: aptsPerFloorNum,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=400'
    };

    // Generate apartments for the new building
    const newApts: any[] = [];
    for (let f = 1; f <= floorsNum; f++) {
      for (let a = 1; a <= aptsPerFloorNum; a++) {
        newApts.push({
          id: `apt-${newId}-${f}-${a}`,
          buildingId: newId,
          apartmentNumber: `${f}0${a}`,
          floorNumber: f,
          status: 'available',
          type: 'apartment',
          price: 25000 + (f * 1000)
        });
      }
    }

    setAllBuildings([...allBuildings, newBuilding]);
    setAllApartments([...allApartments, ...newApts]);
    setSelectedBuilding(newId);
    setIsAddBuildingModalOpen(false);
    setBuildingForm({ name: '', address: '', floors: '', apartmentsPerFloor: '' });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'in_progress': return <Wrench className="w-4 h-4 text-blue-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">إدارة الأملاك</h2>
        <button 
          onClick={() => setIsAddBuildingModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة عقار جديد
        </button>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-bold">تم تنفيذ العملية بنجاح</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Building List */}
        <div className="lg:col-span-1 space-y-3">
          {allBuildings.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBuilding(b.id)}
              className={cn(
                "w-full text-right p-4 rounded-xl border transition-all duration-200",
                selectedBuilding === b.id
                  ? "bg-blue-50 border-blue-200 shadow-sm"
                  : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm"
              )}
            >
              <div className="flex items-center mb-2">
                <Building2 className={cn("w-5 h-5 ml-2", selectedBuilding === b.id ? "text-blue-600" : "text-slate-400")} />
                <h3 className={cn("font-bold", selectedBuilding === b.id ? "text-blue-900" : "text-slate-700")}>{b.name}</h3>
              </div>
              <div className="flex items-center text-xs text-slate-500 mb-1">
                <MapPin className="w-3.5 h-3.5 ml-1" />
                {b.address}
              </div>
              <div className="flex items-center text-xs text-slate-500">
                <Layers className="w-3.5 h-3.5 ml-1" />
                {b.floors} أدوار • {b.floors * b.apartmentsPerFloor} شقة
              </div>
            </button>
          ))}
        </div>

        {/* Building Details */}
        <div className="lg:col-span-3 space-y-6">
          {building && (
            <>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{building.name}</h3>
                    <p className="text-slate-500 flex items-center text-sm">
                      <MapPin className="w-4 h-4 ml-1" />
                      {building.address}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ml-2"></span>
                      <span className="text-sm font-bold text-emerald-700">{availableCount} متاح</span>
                    </div>
                    <div className="flex items-center bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 ml-2"></span>
                      <span className="text-sm font-bold text-red-700">{occupiedCount} مؤجر</span>
                    </div>
                    <div className="flex items-center bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-2"></span>
                      <span className="text-sm font-bold text-amber-700">{activeMaintenanceCount} صيانة</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                      <Layers className="w-4 h-4 ml-2 text-blue-600" />
                      إحصائيات الوحدات
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">إجمالي الوحدات</span>
                        <span className="text-sm font-bold text-slate-900">{totalUnits}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(occupiedCount / totalUnits) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>نسبة الإشغال: {Math.round((occupiedCount / totalUnits) * 100)}%</span>
                        <span>{occupiedCount} من {totalUnits}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                      <Wrench className="w-4 h-4 ml-2 text-blue-600" />
                      طلبات الصيانة الأخيرة
                    </h4>
                    <div className="space-y-3">
                      {buildingMaintenance.length > 0 ? (
                        buildingMaintenance.slice(0, 3).map(mr => {
                          const apt = buildingApartments.find(a => a.id === mr.apartmentId);
                          return (
                            <div key={mr.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100">
                              <div className="flex items-center">
                                {getStatusIcon(mr.status)}
                                <div className="mr-2">
                                  <p className="text-xs font-bold text-slate-800">{mr.title}</p>
                                  <p className="text-[10px] text-slate-500">شقة {apt?.apartmentNumber}</p>
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-400">{mr.date}</span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-400 text-center py-4 italic">لا توجد طلبات صيانة حالية</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {floors.map(floor => {
                    const floorApts = buildingApartments.filter(a => a.floorNumber === floor);
                    // Generate empty slots if no data
                    const slots = Array.from({ length: building.apartmentsPerFloor }, (_, i) => {
                      return floorApts[i] || { id: `empty-${floor}-${i}`, floorNumber: floor, apartmentNumber: `${floor}0${i+1}`, status: 'available', price: 0 };
                    });

                    return (
                      <div key={floor} className="flex items-stretch">
                        <div className="w-24 flex-shrink-0 bg-slate-100 rounded-r-lg flex items-center justify-center border border-l-0 border-slate-200">
                          <span className="font-bold text-slate-600">الدور {floor}</span>
                        </div>
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border border-slate-200 rounded-l-lg">
                          {slots.map(apt => (
                            <div 
                              key={apt.id}
                              onClick={() => setSelectedApartment(apt)}
                              className={cn(
                                "p-3 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105",
                                apt.status === 'available' && "bg-emerald-50 border-emerald-200",
                                apt.status === 'occupied' && "bg-red-50 border-red-200",
                                apt.status === 'maintenance' && "bg-amber-50 border-amber-200"
                              )}
                            >
                              <span className={cn(
                                "text-lg font-bold mb-1",
                                apt.status === 'available' && "text-emerald-700",
                                apt.status === 'occupied' && "text-red-700",
                                apt.status === 'maintenance' && "text-amber-700"
                              )}>
                                {apt.apartmentNumber}
                              </span>
                              <span className={cn(
                                "text-xs font-medium px-2 py-0.5 rounded-full",
                                apt.status === 'available' && "bg-emerald-100 text-emerald-800",
                                apt.status === 'occupied' && "bg-red-100 text-red-800",
                                apt.status === 'maintenance' && "bg-amber-100 text-amber-800"
                              )}>
                                {apt.status === 'available' ? 'متاح' : apt.status === 'occupied' ? 'مؤجر' : 'صيانة'}
                              </span>
                              {apt.price > 0 && apt.status === 'available' && (
                                <span className="text-xs text-emerald-600 mt-2 font-medium">
                                  {formatCurrency(apt.price)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Building Modal */}
      {isAddBuildingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">إضافة عقار جديد</h3>
              <button onClick={() => setIsAddBuildingModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAddBuilding} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">اسم العقار</label>
                <input 
                  type="text" 
                  required 
                  value={buildingForm.name}
                  onChange={(e) => setBuildingForm({...buildingForm, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">العنوان</label>
                <input 
                  type="text" 
                  required 
                  value={buildingForm.address}
                  onChange={(e) => setBuildingForm({...buildingForm, address: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">عدد الأدوار</label>
                  <input 
                    type="number" 
                    required 
                    value={buildingForm.floors}
                    onChange={(e) => setBuildingForm({...buildingForm, floors: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">شقق كل دور</label>
                  <input 
                    type="number" 
                    required 
                    value={buildingForm.apartmentsPerFloor}
                    onChange={(e) => setBuildingForm({...buildingForm, apartmentsPerFloor: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">إضافة العقار</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apartment Details Modal */}
      {selectedApartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  selectedApartment.status === 'available' ? "bg-emerald-100 text-emerald-600" :
                  selectedApartment.status === 'occupied' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                )}>
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">تفاصيل الشقة {selectedApartment.apartmentNumber}</h3>
              </div>
              <button onClick={() => setSelectedApartment(null)} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">الحالة</p>
                  <p className={cn(
                    "font-bold",
                    selectedApartment.status === 'available' ? "text-emerald-600" :
                    selectedApartment.status === 'occupied' ? "text-red-600" : "text-amber-600"
                  )}>
                    {selectedApartment.status === 'available' ? 'متاحة' : selectedApartment.status === 'occupied' ? 'مؤجرة' : 'صيانة'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">الدور</p>
                  <p className="font-bold text-slate-800">{selectedApartment.floorNumber}</p>
                </div>
              </div>

              {selectedApartment.status === 'occupied' && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center">
                    <User className="w-4 h-4 ml-2 text-blue-600" />
                    معلومات المستأجر
                  </h4>
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <p className="font-bold text-slate-900">{tenants.find(t => t.id === selectedApartment.tenantId)?.name || 'غير معروف'}</p>
                    <p className="text-xs text-slate-500 mt-1">{tenants.find(t => t.id === selectedApartment.tenantId)?.phone}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-700 flex items-center">
                  <DollarSign className="w-4 h-4 ml-2 text-blue-600" />
                  المالية
                </h4>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                  <span className="text-sm text-slate-600">السعر السنوي</span>
                  <span className="font-bold text-slate-900">{formatCurrency(selectedApartment.price || 25000)}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">تعديل البيانات</button>
              <button onClick={() => setSelectedApartment(null)} className="flex-1 bg-white border border-slate-200 text-slate-600 py-2 rounded-lg font-bold hover:bg-slate-50 transition-colors">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
