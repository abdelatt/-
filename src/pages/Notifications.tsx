import { useState } from 'react';
import { useApp } from '../AppContext';
import { Bell, Settings, CheckCircle2, AlertCircle, Calendar, Info, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Notifications() {
  const { notifications, setNotifications } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');
  const [settings, setSettings] = useState({
    contractExpiry: true,
    rentDue: true,
    maintenance: true,
    expiryReminderDays: 30
  });

  const filteredNotifications = notifications.filter(n => activeTab === 'all' || !n.isRead);

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'contract_expiry': return <Calendar className="w-5 h-5 text-amber-600" />;
      case 'rent_due': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'maintenance': return <Info className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">التنبيهات والإشعارات</h2>
        <div className="flex space-x-2 space-x-reverse">
          <button 
            onClick={() => setActiveTab('all')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === 'all' ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            الكل
          </button>
          <button 
            onClick={() => setActiveTab('unread')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === 'unread' ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            غير مقروء
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === 'settings' ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            <Settings className="w-4 h-4 ml-2 inline" />
            الإعدادات
          </button>
        </div>
      </div>

      {activeTab !== 'settings' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(n => (
              <div key={n.id} className={cn("p-5 flex items-start group relative transition-colors", !n.isRead && "bg-blue-50/30")}>
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center ml-4 shrink-0 shadow-sm">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={cn("text-sm font-bold", !n.isRead ? "text-slate-900" : "text-slate-600")}>{n.title}</h3>
                    <span className="text-xs text-slate-400">{n.date}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{n.message}</p>
                </div>
                <div className="flex space-x-2 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity mr-4">
                  {!n.isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(n.id)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg" 
                      title="تحديد كمقروء"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(n.id)}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg" 
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>لا توجد تنبيهات حالياً</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">تخصيص التنبيهات</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-blue-600 ml-3" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">انتهاء العقود</p>
                    <p className="text-xs text-slate-500">تلقي تنبيهات عند اقتراب انتهاء عقود الإيجار</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.contractExpiry} 
                  onChange={(e) => setSettings({...settings, contractExpiry: e.target.checked})}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 ml-3" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">استحقاق الإيجار</p>
                    <p className="text-xs text-slate-500">تلقي تنبيهات بمواعيد استحقاق الدفعات المالية</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.rentDue} 
                  onChange={(e) => setSettings({...settings, rentDue: e.target.checked})}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center">
                  <Info className="w-5 h-5 text-emerald-600 ml-3" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">طلبات الصيانة</p>
                    <p className="text-xs text-slate-500">تلقي تنبيهات عند تقديم طلبات صيانة جديدة</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.maintenance} 
                  onChange={(e) => setSettings({...settings, maintenance: e.target.checked})}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">فترة التنبيه المسبق</h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-2">تنبيه قبل انتهاء العقد بـ (يوم):</label>
              <div className="flex items-center space-x-4 space-x-reverse">
                <input 
                  type="range" 
                  min="7" 
                  max="90" 
                  step="1" 
                  value={settings.expiryReminderDays}
                  onChange={(e) => setSettings({...settings, expiryReminderDays: parseInt(e.target.value)})}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                />
                <span className="w-12 text-center font-bold text-blue-600">{settings.expiryReminderDays}</span>
              </div>
              <p className="text-xs text-slate-500 mt-3 italic">سيتم إرسال تنبيهات استباقية لتجديد العقود بناءً على هذه الفترة.</p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
              حفظ الإعدادات
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
