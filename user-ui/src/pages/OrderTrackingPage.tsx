import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '../components/PageTransition';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useTrackOrder } from '../hooks/queries/useOrders';
import { getImageUrl } from '../api/config';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Package, Clock, Truck, CheckCircle, XCircle, ArrowLeft, MapPin, CreditCard, ShoppingBag, Box } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Order } from '../types/api.types';

const ORDER_STEPS = ['pending', 'processing', 'shipped', 'delivered'] as const;

function getStepIndex(status: Order['status']): number {
    if (status === 'cancelled') return -1;
    return ORDER_STEPS.indexOf(status as typeof ORDER_STEPS[number]);
}

const stepIcons = {
    pending: Clock,
    processing: Box,
    shipped: Truck,
    delivered: CheckCircle,
};

export function OrderTrackingPage() {
    const { token } = useParams<{ token: string }>();
    const { t, i18n } = useTranslation();
    const { data: orderData, isLoading, isError } = useTrackOrder(token || '');

    const order: Order | null = orderData
        ? (Array.isArray(orderData) ? orderData[0] : (orderData as unknown as Order)?.id ? orderData as unknown as Order : (orderData as any)?.data || null)
        : null;

    const locale = i18n.language === 'fr' ? fr : undefined;
    const currentStepIndex = order ? getStepIndex(order.status) : -1;
    const isCancelled = order?.status === 'cancelled';

    return (
        <PageTransition>
            <div className="min-h-screen bg-gradient-to-b from-brand-light/40 via-white to-brand-light/20">
                <Navbar />

                <main className="max-w-4xl mx-auto px-4 pt-28 pb-20">
                    {/* Back link */}
                    <Link
                        to="/profile/orders"
                        className="inline-flex items-center gap-2 text-sm font-medium text-brand-muted hover:text-brand-default transition-colors mb-8 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        {t('tracking.backToOrders')}
                    </Link>

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-32">
                            <div className="relative w-16 h-16 mb-6">
                                <div className="absolute inset-0 rounded-full border-[3px] border-brand-soft" />
                                <div className="absolute inset-0 rounded-full border-[3px] border-brand-default border-t-transparent animate-spin" />
                            </div>
                            <p className="text-brand-muted font-medium">{t('common.loading')}</p>
                        </div>
                    )}

                    {/* Error / Not Found */}
                    {!isLoading && (isError || !order) && (
                        <div className="text-center py-32">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Package className="w-10 h-10 text-red-300" />
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-brand-dark mb-2">{t('tracking.notFound')}</h2>
                            <p className="text-brand-muted mb-8">{t('tracking.notFoundDesc')}</p>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-default text-white rounded-xl font-semibold hover:bg-brand-dark transition-colors"
                            >
                                {t('tracking.backHome')}
                            </Link>
                        </div>
                    )}

                    {/* Order loaded */}
                    {!isLoading && order && (
                        <div className="space-y-6">
                            {/* Header card */}
                            <div className="relative overflow-hidden bg-white border border-gray-100 rounded-3xl p-8">
                                {/* Decorative corner accent */}
                                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-brand-default/5 to-transparent rounded-bl-[80px]" />

                                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-2xl bg-brand-default/10 flex items-center justify-center">
                                                <Package className="w-5 h-5 text-brand-default" />
                                            </div>
                                            <h1 className="text-2xl font-serif font-bold text-brand-dark">
                                                {t('tracking.orderNumber', { id: order.orderNumber })}
                                            </h1>
                                        </div>
                                        <p className="text-sm text-brand-muted ml-[52px]">
                                            {t('tracking.placedOn')} {format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm', { locale })}
                                        </p>
                                    </div>
                                    <div className="ml-[52px] sm:ml-0">
                                        <span className={cn(
                                            'inline-flex px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider',
                                            isCancelled
                                                ? 'bg-red-50 text-red-600'
                                                : order.status === 'delivered'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-brand-default/10 text-brand-default'
                                        )}>
                                            {t(`profile.orders.status.${order.status}`)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-white border border-gray-100 rounded-3xl p-8">
                                <h2 className="text-lg font-serif font-bold text-brand-dark mb-8">{t('tracking.title')}</h2>

                                {isCancelled ? (
                                    <div className="flex items-center gap-4 p-5 bg-red-50/60 rounded-2xl border border-red-100">
                                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                            <XCircle className="w-6 h-6 text-red-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-red-700">{t('tracking.timeline.cancelled')}</p>
                                            <p className="text-sm text-red-500">{t('tracking.timeline.cancelledDesc')}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        {/* Desktop horizontal timeline */}
                                        <div className="hidden sm:block">
                                            {/* Progress bar background */}
                                            <div className="absolute top-6 left-[calc(12.5%)] right-[calc(12.5%)] h-1 bg-gray-100 rounded-full" />
                                            {/* Progress bar fill */}
                                            <div
                                                className="absolute top-6 left-[calc(12.5%)] h-1 bg-brand-default rounded-full transition-all duration-700 ease-out"
                                                style={{
                                                    width: `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 75}%`,
                                                }}
                                            />

                                            <div className="relative grid grid-cols-4 gap-2">
                                                {ORDER_STEPS.map((step, idx) => {
                                                    const Icon = stepIcons[step];
                                                    const isCompleted = idx <= currentStepIndex;
                                                    const isCurrent = idx === currentStepIndex;

                                                    return (
                                                        <div key={step} className="flex flex-col items-center text-center">
                                                            <div
                                                                className={cn(
                                                                    'relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 z-10',
                                                                    isCompleted
                                                                        ? 'bg-brand-default text-white shadow-lg shadow-brand-default/20'
                                                                        : 'bg-gray-100 text-gray-300',
                                                                    isCurrent && 'ring-4 ring-brand-default/20 scale-110'
                                                                )}
                                                            >
                                                                <Icon className="w-5 h-5" />
                                                                {isCurrent && (
                                                                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-default rounded-full border-2 border-white animate-pulse" />
                                                                )}
                                                            </div>
                                                            <p className={cn(
                                                                'mt-3 text-sm font-bold',
                                                                isCompleted ? 'text-brand-dark' : 'text-gray-300'
                                                            )}>
                                                                {t(`tracking.timeline.${step}`)}
                                                            </p>
                                                            <p className={cn(
                                                                'text-xs mt-1 leading-relaxed',
                                                                isCompleted ? 'text-brand-muted' : 'text-gray-200'
                                                            )}>
                                                                {t(`tracking.timeline.${step}Desc`)}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Mobile vertical timeline */}
                                        <div className="sm:hidden space-y-0">
                                            {ORDER_STEPS.map((step, idx) => {
                                                const Icon = stepIcons[step];
                                                const isCompleted = idx <= currentStepIndex;
                                                const isCurrent = idx === currentStepIndex;
                                                const isLast = idx === ORDER_STEPS.length - 1;

                                                return (
                                                    <div key={step} className="flex gap-4">
                                                        {/* Vertical line + dot */}
                                                        <div className="flex flex-col items-center">
                                                            <div
                                                                className={cn(
                                                                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500',
                                                                    isCompleted
                                                                        ? 'bg-brand-default text-white shadow-md shadow-brand-default/20'
                                                                        : 'bg-gray-100 text-gray-300',
                                                                    isCurrent && 'ring-4 ring-brand-default/20'
                                                                )}
                                                            >
                                                                <Icon className="w-4 h-4" />
                                                            </div>
                                                            {!isLast && (
                                                                <div className={cn(
                                                                    'w-0.5 h-12 my-1',
                                                                    idx < currentStepIndex ? 'bg-brand-default' : 'bg-gray-100'
                                                                )} />
                                                            )}
                                                        </div>
                                                        {/* Text */}
                                                        <div className={cn('pb-8', isLast && 'pb-0')}>
                                                            <p className={cn(
                                                                'font-bold text-sm',
                                                                isCompleted ? 'text-brand-dark' : 'text-gray-300'
                                                            )}>
                                                                {t(`tracking.timeline.${step}`)}
                                                            </p>
                                                            <p className={cn(
                                                                'text-xs mt-0.5',
                                                                isCompleted ? 'text-brand-muted' : 'text-gray-200'
                                                            )}>
                                                                {t(`tracking.timeline.${step}Desc`)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bottom grid: Items + Shipping/Payment */}
                            <div className="grid md:grid-cols-5 gap-6">
                                {/* Order items — wider */}
                                <div className="md:col-span-3 bg-white border border-gray-100 rounded-3xl p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <ShoppingBag className="w-5 h-5 text-brand-default" />
                                        <h2 className="text-lg font-serif font-bold text-brand-dark">
                                            {t('tracking.orderSummary')}
                                        </h2>
                                        <span className="ml-auto text-xs text-brand-muted font-medium">
                                            {order.items.length} {t('tracking.items')}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 group">
                                                <div className="w-16 h-16 bg-brand-light/40 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-50">
                                                    {item.productImage ? (
                                                        <img
                                                            src={getImageUrl(item.productImage)}
                                                            alt={item.productName || ''}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-6 h-6 text-gray-200" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-brand-dark text-sm truncate">
                                                        {item.productName || 'Product'}
                                                    </p>
                                                    <p className="text-xs text-brand-muted mt-0.5">
                                                        {item.unitPrice?.toLocaleString()} {order.currency} x {item.quantity}
                                                    </p>
                                                </div>
                                                <p className="font-bold text-sm text-brand-dark whitespace-nowrap">
                                                    {item.totalPrice?.toLocaleString()} {order.currency}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Totals */}
                                    <div className="mt-6 pt-5 border-t border-gray-100 space-y-2">
                                        <div className="flex justify-between text-sm text-brand-muted">
                                            <span>{t('tracking.subtotal')}</span>
                                            <span>{order.subtotal?.toLocaleString()} {order.currency}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-brand-muted">
                                            <span>{t('tracking.shipping')}</span>
                                            <span>{order.shippingCost?.toLocaleString()} {order.currency}</span>
                                        </div>
                                        {order.taxAmount > 0 && (
                                            <div className="flex justify-between text-sm text-brand-muted">
                                                <span>{t('tracking.tax')}</span>
                                                <span>{order.taxAmount?.toLocaleString()} {order.currency}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-3 border-t border-gray-100">
                                            <span className="font-bold text-brand-dark">{t('tracking.total')}</span>
                                            <span className="font-bold text-lg text-brand-default">
                                                {order.totalAmount?.toLocaleString()} {order.currency}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar: Shipping + Payment */}
                                <div className="md:col-span-2 space-y-6">
                                    {/* Shipping Address */}
                                    <div className="bg-white border border-gray-100 rounded-3xl p-6">
                                        <div className="flex items-center gap-3 mb-5">
                                            <MapPin className="w-5 h-5 text-brand-default" />
                                            <h3 className="font-serif font-bold text-brand-dark">{t('tracking.shippingAddress')}</h3>
                                        </div>
                                        {order.shippingAddress && (
                                            <div className="text-sm text-brand-muted space-y-1.5 leading-relaxed">
                                                <p className="font-semibold text-brand-dark">
                                                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                                                </p>
                                                <p>{order.shippingAddress.addressLine1}</p>
                                                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                                                <p>{order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}</p>
                                                <p>{order.shippingAddress.country}</p>
                                                <p className="pt-1 font-medium text-brand-dark">{order.shippingAddress.phone}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Payment */}
                                    <div className="bg-white border border-gray-100 rounded-3xl p-6">
                                        <div className="flex items-center gap-3 mb-5">
                                            <CreditCard className="w-5 h-5 text-brand-default" />
                                            <h3 className="font-serif font-bold text-brand-dark">{t('tracking.paymentInfo')}</h3>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-brand-muted">{t('profile.orders.payment.' + order.paymentStatus)}</span>
                                            <span className={cn(
                                                'inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                                                order.paymentStatus === 'paid' && 'bg-emerald-50 text-emerald-600',
                                                order.paymentStatus === 'pending' && 'bg-amber-50 text-amber-600',
                                                order.paymentStatus === 'failed' && 'bg-red-50 text-red-600',
                                                order.paymentStatus === 'refunded' && 'bg-gray-100 text-gray-600',
                                            )}>
                                                {t(`profile.orders.payment.${order.paymentStatus}`)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                <Footer />
            </div>
        </PageTransition>
    );
}
