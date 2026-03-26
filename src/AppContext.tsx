import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  buildings as initialBuildings, 
  apartments as initialApartments, 
  tenants as initialTenants, 
  contracts as initialContracts, 
  invoices as initialInvoices, 
  maintenanceRequests as initialMaintenanceRequests, 
  expenses as initialExpenses, 
  notifications as initialNotifications,
  currentUser as initialUser
} from './data/mockData';
import { Building, Apartment, Tenant, Contract, Invoice, MaintenanceRequest, Expense, Notification, User } from './types';

interface AppContextType {
  buildings: Building[];
  setBuildings: React.Dispatch<React.SetStateAction<Building[]>>;
  apartments: Apartment[];
  setApartments: React.Dispatch<React.SetStateAction<Apartment[]>>;
  tenants: Tenant[];
  setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>;
  contracts: Contract[];
  setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  maintenanceRequests: MaintenanceRequest[];
  setMaintenanceRequests: React.Dispatch<React.SetStateAction<MaintenanceRequest[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);
  const [apartments, setApartments] = useState<Apartment[]>(initialApartments);
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>(initialMaintenanceRequests);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [currentUser, setCurrentUser] = useState<User>(initialUser);

  return (
    <AppContext.Provider value={{
      buildings, setBuildings,
      apartments, setApartments,
      tenants, setTenants,
      contracts, setContracts,
      invoices, setInvoices,
      maintenanceRequests, setMaintenanceRequests,
      expenses, setExpenses,
      notifications, setNotifications,
      currentUser, setCurrentUser
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
