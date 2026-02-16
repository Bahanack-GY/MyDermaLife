import { useState } from 'react';
import { FileText, Search, Download, Eye, Calendar, User, X, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useReports, reportsApi } from '../api/features/reports';

interface ReportItem {
  id: string;
  patientName: string;
  consultationId: string;
  consultationDate: string;
  generatedAt: string;
  type: string;
  status: string;
  // Structured consultation data
  chiefComplaint?: string | null;
  symptoms?: any | null;
  diagnosis?: string | null;
  treatmentPlan?: string | null;
  notes?: string | null;
  durationMinutes?: number | null;
  followUpRequired?: boolean;
  followUpDate?: string | null;
  transcription?: string | null;
  transcriptionStatus?: string;
}

function ReportSection({ title, content, className }: { title: string; content: string; className?: string }) {
  return (
    <div>
      <h4 className="font-medium text-brand-dark mb-2">{title}</h4>
      <div className={cn("text-gray-600 leading-relaxed bg-white p-4 border border-brand-soft rounded-lg whitespace-pre-line", className)}>
        {content}
      </div>
    </div>
  );
}

export function Reports() {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [page, setPage] = useState(1);

  const statusParam = filterStatus === 'All' ? undefined
    : filterStatus === 'Finalized' ? 'Finalized'
    : filterStatus === 'Pending Review' ? 'PendingReview'
    : undefined;

  const { data: reportsData, isLoading, isError } = useReports({
    page,
    limit: 20,
    status: statusParam as any,
  });

  const reports: ReportItem[] = (reportsData?.data || []) as any;
  const meta = reportsData?.meta;

  // Get the appropriate locale based on current language
  const dateLocale = i18n.language === 'fr' ? fr : enUS;

  // Helper function to format dates with locale
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: dateLocale });
    } catch {
      return dateString;
    }
  };

  // Helper function to translate status values
  const getStatusTranslation = (status: string) => {
    const statusMap: Record<string, string> = {
      'Finalized': t('reports.finalized'),
      'PendingReview': t('reports.pendingReview'),
      'Archived': t('reports.archived')
    };
    return statusMap[status] || status;
  };

  // Client-side search filtering (patient name & consultation number)
  const filteredReports = reports.filter(report => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return report.patientName?.toLowerCase().includes(term) ||
           report.consultationId?.toLowerCase().includes(term);
  });

  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleViewReport = (report: ReportItem) => {
    setSelectedReport(report);
  };

  const handleDownloadPdf = async (reportId: string) => {
    setDownloading(true);
    try {
      const blob = await reportsApi.downloadReport(reportId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-${reportId.substring(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-dark">{t('reports.title')}</h1>
          <p className="text-brand-muted">{t('reports.subtitle')}</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-soft/50 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted" />
            <input
                type="text"
                placeholder={t('reports.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 border border-brand-soft rounded-lg focus:outline-none focus:border-brand-default focus:ring-1 focus:ring-brand-default transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
             {['All', 'Finalized', 'Pending Review'].map(status => (
                 <button
                    key={status}
                    onClick={() => { setFilterStatus(status); setPage(1); }}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                        filterStatus === status
                            ? "bg-brand-dark text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                 >
                     {status === 'All' ? t('common.all', 'All') : status === 'Finalized' ? t('reports.finalized') : t('reports.pendingReview')}
                 </button>
             ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-2xl shadow-sm border border-brand-soft/50 overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-brand-default" />
              <span className="ml-3 text-brand-muted">{t('common.loading', 'Chargement...')}</span>
            </div>
          ) : isError ? (
            <div className="p-12 text-center text-red-500">
              {t('common.error', 'Une erreur est survenue.')}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="bg-brand-light/30 border-b border-brand-soft/50">
                              <th className="p-4 font-serif font-semibold text-brand-dark">{t('reports.reportDetails')}</th>
                              <th className="p-4 font-serif font-semibold text-brand-dark">{t('reports.patient')}</th>
                              <th className="p-4 font-serif font-semibold text-brand-dark">{t('reports.relatedConsultation')}</th>
                              <th className="p-4 font-serif font-semibold text-brand-dark">{t('reports.status')}</th>
                              <th className="p-4 font-serif font-semibold text-brand-dark text-right">{t('reports.actions')}</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-soft/50">
                          {filteredReports.length > 0 ? (
                              filteredReports.map((report) => (
                                  <tr key={report.id} className="hover:bg-brand-light/10 transition-colors group">
                                      <td className="p-4">
                                          <div className="flex items-start gap-3">
                                              <div className="p-2 bg-brand-light rounded-lg text-brand-default mt-1">
                                                  <FileText className="w-5 h-5" />
                                              </div>
                                              <div>
                                                  <p className="font-medium text-brand-dark">{report.type}</p>
                                                  <p className="text-xs text-brand-muted mt-1">{formatDate(report.generatedAt)}</p>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="p-4">
                                          <div className="flex items-center gap-2">
                                              <User className="w-4 h-4 text-brand-muted" />
                                              <span className="text-brand-dark font-medium">{report.patientName}</span>
                                          </div>
                                      </td>
                                      <td className="p-4">
                                          <div className="space-y-1">
                                              <div className="flex items-center gap-1.5">
                                                  <span className="px-2 py-0.5 bg-brand-light/50 border border-brand-soft rounded text-xs font-mono text-brand-dark">
                                                      {report.consultationId}
                                                  </span>
                                              </div>
                                              <div className="flex items-center gap-2 text-xs text-brand-muted">
                                                  <Calendar className="w-3 h-3" />
                                                  {formatDate(report.consultationDate)}
                                              </div>
                                          </div>
                                      </td>
                                      <td className="p-4">
                                          <span className={cn(
                                              "px-2.5 py-1 text-sm font-medium",
                                              report.status === 'Finalized' && "text-green-700",
                                              report.status === 'PendingReview' && "text-amber-700",
                                          )}>
                                              {getStatusTranslation(report.status)}
                                          </span>
                                      </td>
                                      <td className="p-4 text-right">
                                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button
                                                onClick={() => handleViewReport(report)}
                                                className="p-2 hover:bg-brand-light rounded-lg text-brand-muted hover:text-brand-dark transition-colors"
                                                title={t('reports.viewReport', 'Voir le rapport')}
                                              >
                                                  <Eye className="w-4 h-4" />
                                              </button>
                                          </div>
                                      </td>
                                  </tr>
                              ))
                          ) : (
                              <tr>
                                  <td colSpan={5} className="p-8 text-center text-brand-muted">
                                      {t('reports.noReports')}
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>

              {meta && (
                <div className="p-4 border-t border-brand-soft/50 bg-gray-50 flex justify-between items-center text-sm text-brand-muted">
                    <span>{meta.total} {t('reports.total', 'rapport(s)')}</span>
                    <div className="flex gap-2">
                        <button
                          className="px-3 py-1 border border-brand-soft rounded bg-white disabled:opacity-50"
                          disabled={page <= 1}
                          onClick={() => setPage(p => p - 1)}
                        >
                          {t('common.previous', 'Precedent')}
                        </button>
                        <span className="px-3 py-1 text-brand-dark">{page} / {meta.totalPages || 1}</span>
                        <button
                          className="px-3 py-1 border border-brand-soft rounded bg-white disabled:opacity-50"
                          disabled={page >= (meta.totalPages || 1)}
                          onClick={() => setPage(p => p + 1)}
                        >
                          {t('common.next', 'Suivant')}
                        </button>
                    </div>
                </div>
              )}
            </>
          )}
      </div>

        {/* View Modal */}
        {selectedReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-brand-light/30">
                        <h3 className="text-lg font-serif font-semibold text-brand-dark flex items-center gap-2">
                            <FileText className="w-5 h-5 text-brand-default" />
                            {t('reports.reportPreview')}
                        </h3>
                        <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6 space-y-6 overflow-y-auto">
                        <div className="flex justify-between items-start">
                             <div>
                                 <h2 className="text-xl font-bold text-gray-900">{selectedReport.patientName}</h2>
                                 <p className="text-sm text-gray-500">{selectedReport.consultationId}</p>
                             </div>
                             <div className={cn(
                                "px-3 py-1 text-sm font-medium",
                                selectedReport.status === 'Finalized' && "text-green-700",
                                selectedReport.status === 'PendingReview' && "text-amber-700",
                             )}>
                                 {getStatusTranslation(selectedReport.status)}
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('reports.consultation')}</p>
                                <p className="font-medium text-gray-900 mt-1">{selectedReport.consultationId}</p>
                                <p className="text-sm text-gray-500">{formatDate(selectedReport.consultationDate)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('reports.reportGenerated')}</p>
                                <p className="font-medium text-gray-900 mt-1">{formatDate(selectedReport.generatedAt)}</p>
                                <p className="text-sm text-gray-500">{selectedReport.type}</p>
                            </div>
                        </div>

                        {/* Motif de consultation */}
                        {selectedReport.chiefComplaint && (
                            <ReportSection
                                title={t('reports.chiefComplaint', 'Motif de consultation')}
                                content={selectedReport.chiefComplaint}
                            />
                        )}

                        {/* Diagnostic */}
                        {selectedReport.diagnosis && (
                            <ReportSection
                                title={t('reports.diagnosis', 'Diagnostic')}
                                content={selectedReport.diagnosis}
                            />
                        )}

                        {/* Plan de traitement */}
                        {selectedReport.treatmentPlan && (
                            <ReportSection
                                title={t('reports.treatmentPlan', 'Plan de traitement')}
                                content={selectedReport.treatmentPlan}
                            />
                        )}

                        {/* Notes cliniques */}
                        {selectedReport.notes && (
                            <ReportSection
                                title={t('reports.clinicalNotes', 'Notes cliniques')}
                                content={selectedReport.notes}
                            />
                        )}

                        {/* Suivi */}
                        {selectedReport.followUpRequired && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm font-medium text-amber-800">
                                    {t('reports.followUpRequired', 'Suivi requis')}
                                    {selectedReport.followUpDate && (
                                        <span className="ml-2 font-normal">— {formatDate(selectedReport.followUpDate)}</span>
                                    )}
                                </p>
                            </div>
                        )}

                        {/* Transcription */}
                        {selectedReport.transcription && (
                            <ReportSection
                                title={t('reports.transcription', 'Transcription de la consultation')}
                                content={selectedReport.transcription}
                                className="bg-gray-50 max-h-60 overflow-y-auto text-sm"
                            />
                        )}
                        {selectedReport.transcriptionStatus === 'processing' && (
                            <div className="flex items-center gap-2 text-amber-600 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t('reports.transcriptionProcessing', 'Transcription en cours...')}
                            </div>
                        )}

                        {/* Empty state if nothing filled in */}
                        {!selectedReport.chiefComplaint && !selectedReport.diagnosis && !selectedReport.treatmentPlan && !selectedReport.notes && !selectedReport.transcription && (
                            <div className="p-6 text-center text-brand-muted">
                                {t('reports.noContent', 'Aucun contenu renseigné pour cette consultation.')}
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                         <button
                            onClick={() => setSelectedReport(null)}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                         >
                             {t('common.close')}
                         </button>
                         <button
                            onClick={() => selectedReport && handleDownloadPdf(selectedReport.id)}
                            disabled={downloading}
                            className="px-4 py-2 bg-brand-default text-white rounded-lg font-medium hover:bg-brand-dark transition-colors flex items-center gap-2 disabled:opacity-50"
                         >
                             {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                             {downloading ? t('common.loading', 'Chargement...') : t('reports.downloadPDF')}
                         </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
