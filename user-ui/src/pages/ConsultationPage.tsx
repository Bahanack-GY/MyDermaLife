import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PageTransition } from '../components/PageTransition';
import { Video, CheckCircle2, MapPin, Search, ArrowRight, FileText, ShoppingBag, ShieldCheck, RefreshCcw, FileHeart } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

import acneImg from '../assets/images/problem-acne.png';
import hyperpigmentationImg from '../assets/images/problem-hyperpigmentation.png';
import sensitiveImg from '../assets/images/problem-sensitive.png';
import eczemaImg from '../assets/images/problem-eczema.png';
import antiAgingImg from '../assets/images/problem-anti-aging.png';
import otherImg from '../assets/images/problem-other.png';

export function ConsultationPage() {
    const navigate = useNavigate();
    const { hash } = useLocation();
    const [location, setLocation] = useState('');

    useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash.replace('#', ''));
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [hash]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        navigate(`/doctors?location=${encodeURIComponent(location)}`);
    };

    const problems = [
        {
            title: "Acné",
            image: acneImg
        },
        {
            title: "Taches & Hyperpigmentation",
            image: hyperpigmentationImg
        },
        {
            title: "Peaux sensibles",
            image: sensitiveImg
        },
        {
            title: "Eczéma / Psoriasis",
            image: eczemaImg
        },
        {
            title: "Anti-âge",
            image: antiAgingImg
        },
        {
            title: "Autres problèmes",
            image: otherImg
        }
    ];

    const steps = [
        {
            phase: "Avant la consultation",
            title: "Préparation du dossier",
            description: "Remplissez un questionnaire médical simple et téléchargez des photos de votre peau via notre interface sécurisée.",
            icon: FileText
        },
        {
            phase: "Pendant la consultation",
            title: "Diagnostic en Visio",
            description: "Échangez avec votre dermatologue qui analyse votre peau, vous explique les causes et définit votre plan de traitement.",
            icon: Video
        },
        {
            phase: "Après la consultation",
            title: "Ordonnance & Routine",
            description: "Recevez votre ordonnance médicale et une sélection personnalisée de soins à commander directement sur notre boutique.",
            icon: ShoppingBag
        }
    ];

    const prices = [
        {
            type: "Consultation Vidéo",
            price: "25 000 FCFA",
            features: ["Consultation (20 min)", "Diagnostic complet", "Ordonnance digitale", "Recommandation produits", "Suivi post-consultation"]
        }
    ];

    return (
        <PageTransition>
            <div className="min-h-screen bg-white">
                <Navbar />

                <main className="pt-24 md:pt-32 pb-16">
                    {/* Hero Section */}
                    <div className="container mx-auto px-4 md:px-6 mb-20 text-center max-w-4xl">
                        <span className="text-brand-default text-sm font-bold uppercase tracking-widest mb-4 block">Téléconsultation</span>
                        <h1 className="text-4xl md:text-6xl font-serif font-medium text-brand-text mb-6">
                            Consulter un Dermatologue en Ligne
                        </h1>
                        <p className="text-brand-muted text-xl leading-relaxed mb-10">
                            Un accès direct à des experts certifiés, sans attente et depuis chez vous.
                        </p>

                        {/* Location Search Filter */}
                        <form onSubmit={handleSearch} className="max-w-xl mx-auto bg-white p-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-2 mb-8">
                            <div className="pl-4 text-gray-400">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Votre ville ou code postal..."
                                className="flex-1 bg-transparent border-none outline-none text-brand-dark placeholder:text-gray-400 h-10"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                            <button type="submit" className="bg-brand-default text-white px-6 py-2.5 rounded-full font-medium hover:bg-brand-dark transition-colors flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                <span className="hidden sm:inline">Trouver</span>
                            </button>
                        </form>
                    </div>

                    {/* Motifs Grid - Anchor: motifs */}
                    <section id="motifs" className="py-20 bg-brand-light/20">
                        <div className="container mx-auto px-4 md:px-6">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-serif font-medium text-brand-text mb-4">Quelle est votre préoccupation ?</h2>
                                <p className="text-brand-muted">Sélectionnez un motif pour trouver le spécialiste adapté.</p>
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                {problems.map((problem, idx) => (
                                    <Link
                                        to={`/doctors?specialty=${encodeURIComponent(problem.title)}`}
                                        key={idx}
                                        className="relative h-80 rounded-3xl overflow-hidden group shadow-md hover:shadow-xl transition-all cursor-pointer block"
                                    >
                                        <img
                                            src={problem.image}
                                            alt={problem.title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                                        <div className="absolute bottom-0 left-0 right-0 p-8">
                                            <h3 className="text-2xl font-serif font-bold text-white mb-2">{problem.title}</h3>
                                            <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-light opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                                Prendre RDV <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Déroulement - Anchor: deroulement */}
                    <section id="deroulement" className="py-20">
                        <div className="container mx-auto px-4 md:px-6">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-serif font-medium text-brand-text mb-4">Déroulement de la Consultation</h2>
                                <p className="text-brand-muted max-w-2xl mx-auto">Un parcours de soin simple, fluide et complet, conçu pour vous accompagner avant, pendant et après votre rendez-vous.</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto relative mb-20">
                                <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-brand-light"></div>
                                {steps.map((step, idx) => (
                                    <div key={idx} className="relative z-10 flex flex-col items-center text-center px-4">
                                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-brand-default mb-6 border-4 border-brand-light shadow-lg">
                                            <step.icon className="w-10 h-10" />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-brand-default mb-2">{step.phase}</span>
                                        <h3 className="text-xl font-serif font-bold mb-3">{step.title}</h3>
                                        <p className="text-brand-muted leading-relaxed">{step.description}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Mention Importante Block */}
                            <div className="max-w-4xl mx-auto bg-brand-default/5 rounded-3xl p-8 md:p-10 border border-brand-default/20 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <ShoppingBag className="w-32 h-32 text-brand-default" />
                                </div>
                                <div className="flex-shrink-0 bg-brand-default text-white p-4 rounded-full shadow-md z-10">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <div className="flex-1 z-10 text-center md:text-left">
                                    <h4 className="text-xl font-serif font-bold text-brand-dark mb-4">Mention Importante</h4>
                                    <ul className="space-y-3 mb-6">
                                        <li className="flex items-center gap-3 text-brand-text font-medium text-lg">
                                            <div className="w-2 h-2 bg-brand-default rounded-full flex-shrink-0"></div>
                                            Recommandations de soins personnalisés.
                                        </li>
                                        <li className="flex items-center gap-3 text-brand-text font-medium text-lg">
                                            <div className="w-2 h-2 bg-brand-default rounded-full flex-shrink-0"></div>
                                            Accès facilité aux produits via la boutique.
                                        </li>
                                    </ul>
                                    <Link to="/products" className="inline-flex items-center gap-2 text-brand-default font-bold hover:underline">
                                        Visiter la boutique <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Tarifs - Anchor: tarifs */}
                    <section id="tarifs" className="py-20 bg-brand-dark text-white relative overflow-hidden">
                        {/* Background blobs */}
                        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-default/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-900/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

                        <div className="container mx-auto px-4 md:px-6 relative z-10">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-serif font-medium mb-4">Tarifs & Prise de Rendez-vous</h2>
                                <p className="text-white/70">Un tarif unique pour une expertise complète.</p>
                            </div>

                            <div className="max-w-lg mx-auto mb-16">
                                {prices.map((price, idx) => (
                                    <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 hover:bg-white/15 transition-colors flex flex-col items-center text-center">
                                        <h3 className="text-3xl font-serif font-bold mb-4">{price.type}</h3>
                                        <p className="text-5xl font-bold text-brand-default mb-8">{price.price}</p>
                                        <ul className="space-y-4 mb-10 text-left w-full max-w-xs mx-auto">
                                            {price.features.map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3 text-white/90 text-lg">
                                                    <CheckCircle2 className="w-6 h-6 text-brand-default flex-shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <Link to="/doctors" className="block w-full max-w-sm bg-white text-brand-dark py-4 rounded-full font-bold text-lg hover:bg-brand-default hover:text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                            Prendre rendez-vous maintenant
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            {/* Trust Elements at bottom */}
                            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto border-t border-white/10 pt-12">
                                <div className="flex flex-col items-center text-center">
                                    <ShieldCheck className="w-8 h-8 text-brand-default mb-3" />
                                    <h4 className="font-bold mb-1">Paiement Sécurisé</h4>
                                    <p className="text-sm text-white/60">Mobile Money, Carte Bancaire</p>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <RefreshCcw className="w-8 h-8 text-brand-default mb-3" />
                                    <h4 className="font-bold mb-1">Annulation Flexible</h4>
                                    <p className="text-sm text-white/60">Remboursement jusqu'à 24h avant</p>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <FileHeart className="w-8 h-8 text-brand-default mb-3" />
                                    <h4 className="font-bold mb-1">Prise en Charge</h4>
                                    <p className="text-sm text-white/60">Facture agrée pour assurance</p>
                                </div>
                            </div>
                        </div>
                    </section>

                </main>
                <Footer />
            </div>
        </PageTransition>
    );
}
