import { useState, type ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/client';
import { cn } from '../lib/utils';

export function RateConsultationPage() {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error(t('consultation.rating.error', 'Please select a rating'));
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/doctor/consultations/${consultationId}/rate`, {
        rating,
        review,
      });

      toast.success(t('consultation.rating.success', 'Thank you for your feedback!'));
      navigate('/booking-success'); // Or home, but booking success feels like a "Mission Complete" page? Maybe just home.
      // Re-use booking success or create a "Consultation Complete" variant?
      // For MVP, Home or Consultations list is safer.
      navigate('/profile/prescriptions'); 
    } catch (error) {
      console.error('Failed to submit rating:', error);
      toast.error(t('consultation.rating.failure', 'Failed to submit rating'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg p-6 md:p-8 space-y-6 bg-white shadow-xl rounded-2xl border border-gray-100">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{t('consultation.rating.title', 'Rate your Consultation')}</h1>
          <p className="text-gray-500">{t('consultation.rating.subtitle', 'How was your experience with the doctor?')}</p>
        </div>

        {/* Star Rating */}
        <div className="flex justify-center gap-2 py-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-transform hover:scale-110"
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={cn(
                  "w-10 h-10 md:w-12 md:h-12 transition-colors",
                  (hoveredStar || rating) >= star
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-100 text-gray-300"
                )}
              />
            </button>
          ))}
        </div>

        <div className="text-center text-sm font-medium text-brand-default h-6">
          {rating > 0 && (
            <span>
              {rating === 5 && t('consultation.rating.amazing', 'Amazing!')}
              {rating === 4 && t('consultation.rating.good', 'Good')}
              {rating === 3 && t('consultation.rating.average', 'Average')}
              {rating === 2 && t('consultation.rating.poor', 'Poor')}
              {rating === 1 && t('consultation.rating.terrible', 'Terrible')}
            </span>
          )}
        </div>

        {/* Review Text */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {t('consultation.rating.comment', 'Add a comment (optional)')}
          </label>
          <textarea
            value={review}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setReview(e.target.value)}
            placeholder={t('consultation.rating.placeholder', 'Share your experience...')}
            className="w-full min-h-[120px] rounded-lg border-gray-300 shadow-sm focus:border-brand-default focus:ring-brand-default resize-none p-3 border"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4">
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting || rating === 0}
            className={cn(
              "w-full h-12 flex items-center justify-center rounded-lg font-medium text-white transition-colors",
              isSubmitting || rating === 0 
                ? "bg-gray-300 cursor-not-allowed" 
                : "bg-brand-default hover:bg-brand-dark"
            )}
          >
            {isSubmitting ? t('common.submitting', 'Submitting...') : t('common.submit', 'Submit Feedback')}
          </button>
          
          <button
            onClick={() => navigate('/consultations')}
            className="w-full h-10 flex items-center justify-center rounded-lg font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            {t('common.skip', 'Skip')}
          </button>
        </div>
      </div>
    </div>
  );
}
