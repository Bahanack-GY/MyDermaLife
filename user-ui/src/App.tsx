import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { ProductsPage } from './pages/ProductsPage';
import { SearchPage } from './pages/SearchPage';
import { CategoryPage } from './pages/CategoryPage';
import { CollectionPage } from './pages/CollectionPage';
import { BenefitsPage } from './pages/BenefitsPage';
import { DoctorsCertificationsPage } from './pages/DoctorsCertificationsPage';
import { MedicalSpecialtiesPage } from './pages/MedicalSpecialtiesPage';
import { PatientJourneyPage } from './pages/PatientJourneyPage';
import { OnlineConsultationInfoPage } from './pages/OnlineConsultationInfoPage';
import { SecurityPrivacyPage } from './pages/SecurityPrivacyPage';
import { PricingReimbursementPage } from './pages/PricingReimbursementPage';
import { DoctorSearchPage } from './pages/DoctorSearchPage';
import { DoctorProfilePage } from './pages/DoctorProfilePage';
import { BookingSuccessPage } from './pages/BookingSuccessPage';
import { PreConsultationForm } from './pages/PreConsultationForm';
import { UserProfilePage } from './pages/UserProfilePage';
import { CartPage } from './pages/CartPage';
import { SharedCartPage } from './pages/SharedCartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CartFAB } from './components/CartFAB';
import { LoginPage } from './pages/LoginPage';
import { ConsultationsPage } from './pages/ConsultationsPage';
import { ConsultationDetailPage } from './pages/ConsultationDetailPage';
import { WaitingRoomPage } from './pages/WaitingRoomPage';
import { TeleconsultationPage } from './pages/TeleconsultationPage';
import { RateConsultationPage } from './pages/RateConsultationPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'sonner';
import { CountryGate } from './components/CountryGate';

import { ConsultationPage } from './pages/ConsultationPage';
import { PrescriptionVerificationPage } from './pages/PrescriptionVerificationPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';

function App() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <CartFAB />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/consultation" element={<ConsultationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/consultations" element={
            <ProtectedRoute>
              <ConsultationsPage />
            </ProtectedRoute>
          } />
          <Route path="/consultations/:id" element={
            <ProtectedRoute>
              <ConsultationDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/waiting-room/:id" element={
            <ProtectedRoute>
              <WaitingRoomPage />
            </ProtectedRoute>
          } />
          <Route path="/teleconsultation/:consultationId" element={
            <ProtectedRoute>
              <TeleconsultationPage />
            </ProtectedRoute>
          } />
          <Route path="/consultations/:consultationId/rate" element={
            <ProtectedRoute>
              <RateConsultationPage />
            </ProtectedRoute>
          } />
          <Route path="/products" element={<CountryGate><ProductsPage /></CountryGate>} />
          <Route path="/products/:slug" element={<CountryGate><ProductPage /></CountryGate>} />
          <Route path="/search" element={<CountryGate><SearchPage /></CountryGate>} />
          <Route path="/category/:categoryId" element={<CountryGate><CategoryPage /></CountryGate>} />
          <Route path="/collection/:collectionId" element={<CountryGate><CollectionPage /></CountryGate>} />
          <Route path="/cart" element={<CountryGate><CartPage /></CountryGate>} />
          <Route path="/cart/shared/:shareToken" element={<CountryGate><SharedCartPage /></CountryGate>} />
          <Route path="/checkout" element={<CountryGate><CheckoutPage /></CountryGate>} />
          <Route path="/benefits" element={<BenefitsPage />} />
          <Route path="/how-it-works/patient-journey" element={<PatientJourneyPage />} />
          <Route path="/how-it-works/online-consultation" element={<OnlineConsultationInfoPage />} />
          <Route path="/how-it-works/security" element={<SecurityPrivacyPage />} />
          <Route path="/how-it-works/pricing" element={<PricingReimbursementPage />} />
          <Route path="/doctors" element={<DoctorSearchPage />} />
          <Route path="/doctors/certifications" element={<DoctorsCertificationsPage />} />
          <Route path="/doctors/specialties" element={<MedicalSpecialtiesPage />} />
          <Route path="/doctors/:id" element={<DoctorProfilePage />} />
          <Route path="/booking-success" element={<BookingSuccessPage />} />
          <Route path="/pre-consultation" element={
            <ProtectedRoute>
              <PreConsultationForm />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/profile/:section" element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/track/:token" element={<OrderTrackingPage />} />
          <Route path="/verify-prescription/:id" element={<PrescriptionVerificationPage />} />
        </Routes>
      </AnimatePresence>
      <Toaster position="top-right" expand={true} richColors />
    </QueryClientProvider>
  );
}

export default App;
