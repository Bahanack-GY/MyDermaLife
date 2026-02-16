import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, ThumbsUp, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductReviews, useCreateReview } from '../hooks/queries/useReviews';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';
import { format } from 'date-fns';
import type { CreateReviewPayload } from '../types/api.types';

interface ReviewsSectionProps {
  productId: string;
  productName: string;
}

function StarRating({ rating, onChange, readonly = false }: { rating: number; onChange?: (rating: number) => void; readonly?: boolean }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          className={`transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              star <= (hoverRating || rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection({ productId, productName }: ReviewsSectionProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [formData, setFormData] = useState<CreateReviewPayload>({
    rating: 5,
    title: '',
    reviewText: '',
  });

  const { data: reviewsData, isLoading } = useProductReviews(productId, { page, limit: 10 });
  const createReview = useCreateReview(productId);

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowForm(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.rating) {
      return;
    }

    try {
      await createReview.mutateAsync(formData);
      setFormData({ rating: 5, title: '', reviewText: '' });
      setShowForm(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const reviews = reviewsData?.data || [];
  const totalReviews = reviewsData?.total || 0;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-brand-text">
            {t('productPage.customerReviews') || 'Customer Reviews'} ({totalReviews})
          </h2>
          {!showForm && (
            <button
              onClick={handleWriteReviewClick}
              className="px-6 py-2.5 bg-brand-default text-white rounded-full font-medium hover:bg-brand-dark transition-colors"
            >
              {t('productPage.writeReview') || 'Write a Review'}
            </button>
          )}
        </div>

        {/* Review Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-brand-text mb-4">
                  {t('productPage.writeReviewFor') || 'Write a review for'} {productName}
                </h3>

                {/* Rating */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-brand-text mb-2">
                    {t('productPage.yourRating') || 'Your Rating'} *
                  </label>
                  <StarRating rating={formData.rating} onChange={(rating) => setFormData({ ...formData, rating })} />
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-brand-text mb-2">
                    {t('productPage.reviewTitle') || 'Review Title'} ({t('common.optional') || 'Optional'})
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={t('productPage.reviewTitlePlaceholder') || 'Summarize your experience'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-default focus:ring-2 focus:ring-brand-default/20 outline-none transition-all"
                  />
                </div>

                {/* Review Text */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-brand-text mb-2">
                    {t('productPage.reviewComment') || 'Your Review'} ({t('common.optional') || 'Optional'})
                  </label>
                  <textarea
                    value={formData.reviewText}
                    onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                    placeholder={t('productPage.reviewCommentPlaceholder') || 'Share your thoughts about this product...'}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-default focus:ring-2 focus:ring-brand-default/20 outline-none transition-all resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={createReview.isPending}
                    className="px-6 py-3 bg-brand-default text-white rounded-xl font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
                  >
                    {createReview.isPending ? (t('common.submitting') || 'Submitting...') : (t('common.submit') || 'Submit Review')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ rating: 5, title: '', reviewText: '' });
                    }}
                    className="px-6 py-3 border border-gray-200 text-brand-text rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    {t('common.cancel') || 'Cancel'}
                  </button>
                </div>

                <p className="text-sm text-brand-muted mt-4">
                  {t('productPage.reviewNote') || 'Your review will be visible after approval by our team.'}
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reviews List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-brand-muted">{t('common.loading') || 'Loading reviews...'}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-brand-muted text-lg mb-2">
              {t('productPage.noReviews') || 'No reviews yet'}
            </p>
            <p className="text-brand-muted text-sm">
              {t('productPage.beFirst') || 'Be the first to review this product!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand-default">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-brand-text">
                          {review.user?.email?.split('@')[0] || t('productPage.anonymousUser') || 'Anonymous'}
                        </p>
                        {review.isVerifiedPurchase && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            {t('productPage.verifiedPurchase') || 'Verified Purchase'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-brand-muted">
                        {format(new Date(review.createdAt), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} readonly />
                </div>

                {/* Review Title */}
                {review.title && (
                  <h4 className="font-bold text-brand-text mb-2">{review.title}</h4>
                )}

                {/* Review Text */}
                {review.reviewText && (
                  <p className="text-brand-muted leading-relaxed">{review.reviewText}</p>
                )}

                {/* Helpful Button */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand-default transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{t('productPage.helpful') || 'Helpful'}</span>
                    {review.helpfulCount > 0 && (
                      <span className="font-medium">({review.helpfulCount})</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {reviewsData && reviewsData.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: reviewsData.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  page === pageNum
                    ? 'bg-brand-default text-white'
                    : 'bg-white border border-gray-200 text-brand-text hover:border-brand-default'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          setShowForm(true);
        }}
      />
    </section>
  );
}
