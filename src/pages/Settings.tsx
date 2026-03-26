import React, { useState } from 'react';
import { systemSettings } from '../data/mockData';
import { Save, Building2, Globe, Percent, Coins, Bell, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Settings() {
  const [settings, setSettings] = useState(systemSettings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'vatRate' ? parseFloat(value) : value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">إعدادات النظام</h2>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm">
          <Save className="w-4 h-4 ml-2" />
          حفظ التغييرات
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold border border-blue-100">
            <Building2 className="w-4 h-4 ml-3" />
            معلومات الشركة
          </button>
          <button className="w-full flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors">
            <Percent className="w-4 h-4 ml-3" />
            الضرائب والرسوم
          </button>
          <button className="w-full flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors">
            <Coins className="w-4 h-4 ml-3" />
            العملة واللغة
          </button>
          <button className="w-full flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors">
            <Bell className="w-4 h-4 ml-3" />
            التنبيهات التلقائية
          </button>
          <button className="w-full flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors">
            <Shield className="w-4 h-4 ml-3" />
            الأمان والصلاحيات
          </button>
        </div>

        {/* Settings Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">معلومات الشركة</h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم الشركة</label>
                <input 
                  type="text" 
                  name="companyName"
                  value={settings.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">العملة</label>
                  <select 
                    name="currency"
                    value={settings.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="AED">درهم إماراتي (AED)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">نسبة ضريبة القيمة المضافة (%)</label>
                  <input 
                    type="number" 
                    name="vatRate"
                    value={settings.vatRate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اللغة الافتراضية</label>
                <select 
                  name="language"
                  value={settings.language}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">إعدادات التنبيهات</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-800">تنبيهات انتهاء العقود</p>
                  <p className="text-xs text-slate-500">إرسال تنبيه قبل انتهاء العقد بمدة محددة</p>
                </div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-800">تنبيهات سداد الإيجار</p>
                  <p className="text-xs text-slate-500">تذكير الساكن بموعد السداد القادم</p>
                </div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
