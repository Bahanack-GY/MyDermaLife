import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PageTransition } from '../components/PageTransition';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

import acneImg from '../assets/images/problem-acne.png';
import hyperpigmentationImg from '../assets/images/problem-hyperpigmentation.png';
import sensitiveImg from '../assets/images/problem-sensitive.png';
import eczemaImg from '../assets/images/problem-eczema.png';
import antiAgingImg from '../assets/images/problem-anti-aging.png';
import otherImg from '../assets/images/problem-other.png';

export function MedicalSpecialtiesPage() {
    const specialties = [
        {
            title: "Acné & Imperfections",
            description: "Boutons, points noirs, excès de sébum. Nos experts établissent un diagnostic précis (acné hormonale, rétentionnelle...) pour un traitement ciblé.",
            image: acneImg,
            linkConsult: "/doctors?specialty=Acné",
            linkProduct: "/products?category=acne"
        },
        {
            title: "Taches & Hyperpigmentation",
            description: "Mélasma, taches solaires ou post-inflammatoires. Des protocoles unifiants pour retrouver un teint éclatant et homogène.",
            image: hyperpigmentationImg,
            linkConsult: "/doctors?specialty=Taches",
            linkProduct: "/products?category=taches"
        },
        {
            title: "Peaux Sensibles & Allergies",
            description: "Rougeurs, tiraillements, réactivité. Apaisez votre peau avec des soins dermatologiques haute tolérance.",
            image: sensitiveImg,
            linkConsult: "/doctors?specialty=Sensible",
            linkProduct: "/products?category=sensible"
        },
        {
            title: "Eczéma & Psoriasis",
            description: "Plaques rouges, démangeaisons intenses. Une prise en charge médicale pour soulager les poussées et espacer les crises.",
            image: eczemaImg,
            linkConsult: "/doctors?specialty=Eczéma",
            linkProduct: "/products?category=corps"
        },
        {
            title: "Anti-Âge & Rides",
            description: "Perte de fermeté, ridules. Une approche pro-âge pour préserver la jeunesse de votre peau avec des actifs puissants.",
            image: antiAgingImg,
            linkConsult: "/doctors?specialty=Anti-âge",
            linkProduct: "/products?category=anti-age"
        },
        {
            title: "Autres Pathologies",
            description: "Chute de cheveux, ongles, verrues... Nos dermatologues traitent l'ensemble des affections cutanées et des phanères.",
            image: otherImg,
            linkConsult: "/doctors",
            linkProduct: "/products"
        }
    ];

    return (
        <PageTransition>
            <div className="min-h-screen bg-white">
                <Navbar />

                <main className="pt-24 md:pt-32 pb-16">
                    {/* Hero */}
                    <div className="container mx-auto px-4 md:px-6 mb-20 text-center max-w-4xl">
                        <span className="text-brand-default text-sm font-bold uppercase tracking-widest mb-4 block">Expertise Dermatologique</span>
                        <h1 className="text-4xl md:text-5xl font-serif font-medium text-brand-text mb-6">
                            Spécialités Traitées
                        </h1>
                        <p className="text-brand-muted text-xl leading-relaxed">
                            Nous prenons en charge l'ensemble des problématiques de peau, des cheveux et des ongles.
                        </p>
                    </div>

                    {/* Specialties List */}
                    <div className="container mx-auto px-4 md:px-6 max-w-6xl">
                        <div className="space-y-12">
                            {specialties.map((spec, idx) => (
                                <div key={idx} className={`flex flex-col md:flex-row gap-8 items-center bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                                    <div className="w-full md:w-1/2 h-64 md:h-80 relative group">
                                        <img
                                            src={spec.image}
                                            alt={spec.title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                    </div>
                                    <div className="w-full md:w-1/2 p-8 md:p-12">
                                        <h3 className="text-2xl font-serif font-bold text-brand-text mb-4">{spec.title}</h3>
                                        <p className="text-brand-muted mb-8 leading-relaxed">
                                            {spec.description}
                                        </p>
                                        <div className="flex flex-wrap gap-4">
                                            <Link to={spec.linkConsult} className="bg-brand-default text-white px-6 py-3 rounded-full font-medium hover:bg-brand-dark transition-colors inline-flex items-center gap-2">
                                                Consulter un expert
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                            <Link to={spec.linkProduct} className="bg-brand-light/20 text-brand-dark px-6 py-3 rounded-full font-medium hover:bg-brand-light/30 transition-colors inline-flex items-center gap-2">
                                                Voir les soins
                                                <Sparkles className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Review Block */}
                    <section className="mt-24 bg-brand-light/20 py-20">
                        <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
                            <h2 className="text-3xl font-serif font-medium text-brand-text mb-6">Vous ne trouvez pas votre problème ?</h2>
                            <p className="text-brand-muted mb-8 text-lg">
                                Pas d'inquiétude. Nos dermatologues sont formés pour diagnostiquer et traiter toutes les affections cutanées, même les plus rares.
                            </p>
                            <Link to="/doctors" className="bg-white text-brand-dark border border-gray-200 px-8 py-3 rounded-full font-bold hover:border-brand-default hover:text-brand-default transition-all shadow-sm">
                                Voir tous nos médecins
                            </Link>
                        </div>
                    </section>

                </main>
                <Footer />
            </div>
        </PageTransition>
    );
}
