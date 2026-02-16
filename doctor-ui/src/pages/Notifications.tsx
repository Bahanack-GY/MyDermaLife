import { Bell, AlertTriangle, Calendar, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

export function Notifications() {
  const { t } = useTranslation();
  
  const notifications = [
    {
      id: 1,
      type: 'critical',
      title: 'Critical Lab Result',
      message: 'Urgent pathology report for patient Sophie Miller requiring immediate review.',
      time: '10 mins ago',
      read: false,
    },
    {
      id: 2,
      type: 'warning',
      title: 'Appointment Conflict',
      message: 'Double booking detected for tomorrow at 14:00.',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 3,
      type: 'info',
      title: 'System Update',
      message: 'System maintenance scheduled for Saturday at 23:00.',
      time: '3 hours ago',
      read: true,
    },
    {
      id: 4,
      type: 'success',
      title: 'Consultation Completed',
      message: 'Automatically billed appointment for John Doe.',
      time: 'Yesterday',
      read: true,
    },
     {
      id: 5,
      type: 'info',
      title: 'New Policy Update',
      message: 'Updated guidelines for telemedicine prescriptions are now available.',
      time: '2 days ago',
      read: true,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-6 h-6 text-white" />;
      case 'warning': return <AlertTriangle className="w-6 h-6 text-white" />;
      case 'success': return <CheckCircle2 className="w-6 h-6 text-white" />;
      default: return <Info className="w-6 h-6 text-brand-default" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-400 border-red-400 shadow-md shadow-red-100';
      case 'warning': return 'bg-brand-default border-brand-default shadow-md shadow-brand-default/20';
      case 'success': return 'bg-green-400 border-green-400 shadow-md shadow-green-100';
      default: return 'bg-white border-brand-soft';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-serif font-bold text-brand-dark flex items-center gap-3">
               <div className="p-2 bg-brand-light rounded-lg">
                   <Bell className="w-6 h-6 text-brand-default" />
               </div>
               {t('notifications.title')}
           </h1>
           <p className="text-brand-muted mt-1">{t('notifications.subtitle')}</p>
        </div>
        <button className="text-sm font-medium text-brand-default hover:text-brand-dark transition-colors">
            {t('notifications.markAllRead')}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-brand-soft/50 overflow-hidden">
          <div className="divide-y divide-brand-soft/50">
              {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={cn(
                        "p-6 flex gap-4 transition-all hover:bg-brand-light/10 relative",
                        !notification.read ? "bg-brand-light/5" : ""
                    )}
                  >
                      {!notification.read && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-default"></div>
                      )}
                      
                      <div className={cn("p-4 rounded-full h-14 w-14 flex items-center justify-center flex-shrink-0 border", getBgColor(notification.type))}>
                          {getIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1">
                          <div className="flex justify-between items-start">
                              <h3 className={cn("font-medium text-brand-dark", !notification.read && "font-bold")}>
                                  {notification.title}
                              </h3>
                              <span className="text-xs text-brand-muted flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {notification.time}
                              </span>
                          </div>
                          <p className="text-sm text-brand-text mt-1 leading-relaxed">
                              {notification.message}
                          </p>
                          
                          {notification.type === 'critical' && (
                              <button className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors">
                                  {t('notifications.reviewImmediately')}
                              </button>
                          )}
                      </div>
                  </div>
              ))}
          </div>
          <div className="p-4 bg-brand-light/20 border-t border-brand-soft text-center">
              <button className="text-sm text-brand-muted hover:text-brand-dark font-medium transition-colors">
                  {t('notifications.viewEarlier')}
              </button>
          </div>
      </div>
    </div>
  );
}
