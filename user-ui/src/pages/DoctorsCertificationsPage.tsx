import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PageTransition } from '../components/PageTransition';
import { ShieldCheck, Award, GraduationCap, Scale, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DoctorsCertificationsPage() {
    return (
        <PageTransition>
            <div className="min-h-screen bg-white">
                <Navbar />

                <main className="pt-24 md:pt-32 pb-16">
                    {/* Hero */}
                    <div className="container mx-auto px-4 md:px-6 mb-20 text-center max-w-4xl">
                        <span className="text-brand-default text-sm font-bold uppercase tracking-widest mb-4 block">Confiance & Transparence</span>
                        <h1 className="text-4xl md:text-5xl font-serif font-medium text-brand-text mb-6">
                            Nos Dermatologues Certifiés
                        </h1>
                        <p className="text-brand-muted text-xl leading-relaxed">
                            Votre santé mérite l'excellence. Nous sélectionnons nos spécialistes selon les critères les plus stricts.
                        </p>
                    </div>

                    {/* Trust Grid */}
                    <div className="container mx-auto px-4 md:px-6 mb-24">
                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            <div className="bg-brand-light/10 p-8 rounded-3xl border border-brand-light/20 text-center">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
                                    <GraduationCap className="w-8 h-8 text-brand-default" />
                                </div>
                                <h3 className="text-xl font-serif font-bold text-brand-text mb-4">Diplômes Vérifiés</h3>
                                <p className="text-brand-muted">
                                    Chaque médecin a obtenu son Doctorat d'État en Médecine et son DES en Dermatologie. Nous vérifions systématiquement chaque diplôme auprès des universités.
                                </p>
                            </div>

                            <div className="bg-brand-light/10 p-8 rounded-3xl border border-brand-light/20 text-center">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
                                    <Award className="w-8 h-8 text-brand-default" />
                                </div>
                                <h3 className="text-xl font-serif font-bold text-brand-text mb-4">Inscription Ordinale</h3>
                                <p className="text-brand-muted">
                                    Tous nos praticiens sont inscrits à l'Ordre National des Médecins du Cameroun (ONMC) et sont autorisés à pratiquer la télémédecine.
                                </p>
                            </div>

                            <div className="bg-brand-light/10 p-8 rounded-3xl border border-brand-light/20 text-center">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
                                    <Scale className="w-8 h-8 text-brand-default" />
                                </div>
                                <h3 className="text-xl font-serif font-bold text-brand-text mb-4">Déontologie Médicale</h3>
                                <p className="text-brand-muted">
                                    Nos médecins s'engagent à respecter le code de déontologie médicale : secret professionnel, indépendance et bienveillance sont garantis.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Documents Section */}
                    <section className="bg-gray-50 py-20">
                        <div className="container mx-auto px-4 md:px-6">
                            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
                                <div className="flex-1">
                                    <h2 className="text-3xl font-serif font-medium text-brand-text mb-6">Un Cadre Légal Strict</h2>
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                            <div>
                                                <h4 className="font-bold text-brand-text">Conformité RGPD & Données de Santé</h4>
                                                <p className="text-sm text-brand-muted">Vos données médicales sont hébergées sur des serveurs certifiés HDS (Hébergeur de Données de Santé).</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                            <div>
                                                <h4 className="font-bold text-brand-text">Assurance Responsabilité Civile</h4>
                                                <p className="text-sm text-brand-muted">Tous nos médecins sont couverts par une assurance professionnelle spécifique.</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <ShieldCheck className="w-64 h-64 text-brand-default/20" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA */}
                    <div className="container mx-auto px-4 md:px-6 pt-20 text-center">
                        <Link to="/doctors" className="inline-flex items-center justify-center bg-brand-default text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-dark transition-colors shadow-lg hover:shadow-xl">
                            Voir notre équipe médicale
                        </Link>
                    </div>

                </main>
                <Footer />
            </div>
        </PageTransition>
    );
}
