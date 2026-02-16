import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Agenda } from './pages/Agenda';
import { Availability } from './pages/Availability';
import { Consultation } from './pages/Consultation';
import { Telemedicine } from './pages/Telemedicine';
import { Notifications } from './pages/Notifications';
import { Reports } from './pages/Reports';

import { Patients } from './pages/Patients';
import { PatientProfile } from './pages/PatientProfile';
import { Profile } from './pages/Profile';
import { LoginPage } from './pages/LoginPage';
// Consultation imported above already

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="availability" element={<Availability />} />
            <Route path="patients" element={<Patients />} />
            <Route path="patients/:id" element={<PatientProfile />} />
            <Route path="consultation" element={<Consultation />} />
            <Route path="telemedicine" element={<Telemedicine />} />
            <Route path="telemedicine/:consultationId" element={<Telemedicine />} />
            <Route path="reports" element={<Reports />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Route>
      </Routes>
      <Toaster 
        position="top-right" 
        richColors 
        toastOptions={{
          className: 'font-sans',
          classNames: {
            toast: 'bg-brand-light border-brand-soft text-brand-text shadow-lg',
            title: 'font-serif font-bold text-brand-dark text-base',
            description: 'text-brand-text/90 text-sm',
            actionButton: 'bg-brand-default text-white hover:bg-brand-dark transition-colors',
            cancelButton: 'bg-brand-soft text-brand-dark hover:bg-brand-light transition-colors',
            error: 'bg-red-50 text-red-900 border-red-200',
            success: 'bg-green-50 text-green-900 border-green-200',
            warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
            info: 'bg-blue-50 text-blue-900 border-blue-200',
          },
        }}
      />
    </>
  );
}

export default App;
