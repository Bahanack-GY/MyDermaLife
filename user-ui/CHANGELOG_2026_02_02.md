# Changelog - February 2, 2026

## Summary
Today's updates focused on consolidating the consultation pricing, enhancing the navigation structure, expanding the informational pages under "How it Works" (Comment ça marche), ensuring full internationalization (English/French) for new content, and refining the Home Page.

## 1. Consultation Pricing Standardization
- **Standardized Price**: Updated all dermatologist consultation fees to **25,000 FCFA**.
- **Data Update**: Modified `src/data/doctors.ts` to reflect the fixed price for Dr. Jean-Paul Mbarga.
- **UI Update**: Removed the "Fee" (Prix) filter from `DoctorSearchPage.tsx` as pricing is now uniform.
- **Consultation Page**: Simplified the pricing section to display the single flat rate.

## 2. Navigation Enhancements
- **Navbar Update**: Renamed "Notre Approche" to "**Comment ça marche**" ("How it works").
- **New Dropdowns**:
  - **"Comment ça marche"**: Links to Patient Journey, Online Consultation, Security, and Pricing.
  - **"Dermatologues"**: Links to Medical Team, Certifications, and Treated Specialties.
- **Technical**: Fixed state management issues in `Navbar.tsx` for dropdowns.

## 3. New Pages Created
### "Comment ça marche" (How it Works)
- **Patient Journey (`/how-it-works/patient-journey`)**: Explains the 3-step process (Booking, Consultation, Care).
- **Online Consultation (`/how-it-works/online-consultation`)**: Details the video consultation process, requirements, and post-appointment steps.
- **Security & Privacy (`/how-it-works/security`)**: improving trust by detailing HDS hosting, encryption, and medical secrecy.
- **Pricing & Reimbursement (`/how-it-works/pricing`)**: Transparency page showing the 25,000 FCFA fee, payment methods (Mobile Money, Card), and insurance info.

### "Dermatologues" (Doctors)
- **Medical Specialties**: Lists skin conditions treated (Acne, Anti-aging, etc.).
- **Doctor Certifications**: Highlights the qualifications and board certifications of the medical team.

## 4. Internationalization (I18n)
- **English Support**: Added full English translations for all new pages in `src/i18n/locales/en.json`.
- **French Support**: Structured French translations in `src/i18n/locales/fr.json` to match the new schema.
- **Implementation**: Refactored the following pages to use the `useTranslation` hook instead of hardcoded text:
  - `PatientJourneyPage`
  - `OnlineConsultationInfoPage`
  - `SecurityPrivacyPage`
  - `PricingReimbursementPage`

## 5. Home Page Updates
- **Content Removal**: Removed the "Traitements Médicaux" (`TrustSection`) from the Home Page per user request.

## 6. Code Cleanup
- **Linting**: Removed unused imports across multiple files (`DoctorSearchPage`, `PatientJourneyPage`, etc.) to clear build warnings.
- **Routing**: Registered all new routes in `App.tsx`.
