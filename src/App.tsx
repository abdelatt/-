/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Buildings from './pages/Buildings';
import Accounting from './pages/Accounting';
import Contracts from './pages/Contracts';
import Notifications from './pages/Notifications';
import Tenants from './pages/Tenants';
import Maintenance from './pages/Maintenance';
import Settings from './pages/Settings';
import Reports from './pages/Reports';

export default function App() {
  // Get the repository name from the URL path if possible, or default to root
  const basename = window.location.pathname.startsWith('/-') ? '/-' : '/';

  return (
    <AppProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="buildings" element={<Buildings />} />
            <Route path="accounting" element={<Accounting />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="tenants" element={<Tenants />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="settings" element={<Settings />} />
            <Route path="reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
