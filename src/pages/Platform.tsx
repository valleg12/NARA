import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, DollarSign, Zap, FileText, Bell, PieChart, Calendar, Users, CheckCircle } from "lucide-react";

const modules = [
  {
    icon: Shield,
    name: "GUARDIANS",
    tagline: "Protection juridique intelligente",
    description: "Ne vous demandez plus si votre contrat est juste. Notre IA l'analyse pour vous et vous protège en temps réel.",
    features: [
      {
        icon: FileText,
        title: "Analyse automatique de contrats",
        description: "Upload votre contrat, recevez une analyse détaillée en quelques secondes",
      },
      {
        icon: Bell,
        title: "Veille juridique personnalisée",
        description: "Soyez alerté des changements de lois qui impactent votre activité",
      },
      {
        icon: CheckCircle,
        title: "Alertes sur vos droits",
        description: "Restez informé de vos droits d'auteur et de vos obligations",
      },
    ],
  },
  {
    icon: DollarSign,
    name: "CASHFLOW",
    tagline: "Comptabilité et finances connectées",
    description: "Concentrez-vous sur votre art, nous gérons vos finances avec précision et transparence.",
    features: [
      {
        icon: PieChart,
        title: "Tableau de bord financier en temps réel",
        description: "Visualisez vos revenus, dépenses et marges en un coup d'œil",
      },
      {
        icon: FileText,
        title: "Facturation automatisée",
        description: "Générez et envoyez vos factures professionnelles en quelques clics",
      },
      {
        icon: CheckCircle,
        title: "Optimisation fiscale",
        description: "Bénéficiez de conseils personnalisés pour optimiser votre fiscalité",
      },
    ],
  },
  {
    icon: Zap,
    name: "COMPLIANCE",
    tagline: "Organisation et collaboration centralisées",
    description: "Tous vos projets, collaborations et deadlines au même endroit. Simplifiez votre quotidien.",
    features: [
      {
        icon: Calendar,
        title: "Gestion de projets créatifs",
        description: "Organisez vos projets avec des outils pensés pour les créateurs",
      },
      {
        icon: Users,
        title: "Collaboration avec votre équipe",
        description: "Invitez vos collaborateurs et travaillez ensemble efficacement",
      },
      {
        icon: Bell,
        title: "Calendrier intelligent",
        description: "Ne manquez plus jamais une deadline ou un rendez-vous important",
      },
    ],
  },
];

const Platform = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-32 px-6 lg:px-12">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="space-y-8 animate-fade-in-up">
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
                La Plateforme NARA
              </h1>
              
              <p className="text-xl md:text-2xl text-foreground/70 leading-relaxed max-w-3xl mx-auto text-balance font-light">
                Trois modules puissants, une seule plateforme. Tout ce dont vous avez besoin pour gérer votre carrière créative en toute sérénité.
              </p>
            </div>
          </div>
        </section>

        {/* Modules Sections */}
        {modules.map((module, moduleIndex) => (
          <section 
            key={module.name} 
            className={`py-24 px-6 lg:px-12 ${moduleIndex % 2 === 1 ? 'bg-gradient-to-b from-muted/20 to-background' : ''}`}
          >
            <div className="container mx-auto max-w-6xl">
              <div className="mb-12 animate-fade-in-up">
                <div className="inline-flex p-4 rounded-xl bg-gold/10 text-gold mb-6">
                  <module.icon className="w-10 h-10" />
                </div>
                
                <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4 tracking-tight">
                  {module.name}
                </h2>
                
                <p className="text-lg text-gold font-medium mb-4">{module.tagline}</p>
                <p className="text-xl text-foreground/70 max-w-3xl leading-relaxed">{module.description}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                {module.features.map((feature, featureIndex) => (
                  <div
                    key={feature.title}
                    className="bg-card border border-border/50 rounded-xl p-6 hover-lift transition-all duration-400 animate-fade-in-up"
                    style={{ animationDelay: `${featureIndex * 100}ms` }}
                  >
                    <div className="mb-4">
                      <div className="inline-flex p-3 rounded-lg bg-gold/10 text-gold">
                        <feature.icon className="w-6 h-6" />
                      </div>
                    </div>
                    
                    <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-foreground/70 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* CTA Section */}
        <section className="py-32 px-6 lg:px-12">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="space-y-8 bg-gradient-to-br from-gold/5 to-gold/10 border border-gold/20 rounded-3xl p-12">
              <div className="inline-flex items-center gap-3 px-6 py-3 border border-gold/30 rounded-full bg-background/50">
                <span className="inline-block w-2 h-2 rounded-full bg-gold animate-pulse" />
                <span className="text-sm font-medium text-foreground/80">Accès Exclusif</span>
              </div>
              
              <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-balance">
                L'accès à la plateforme NARA est actuellement sur invitation.
              </h2>
              
              <p className="text-lg text-foreground/70">
                Rejoignez une communauté sélecte de créateurs d'exception qui font confiance à NARA pour élever leur carrière.
              </p>
              
              <Button size="xl" variant="gold" asChild className="hover-lift">
                <Link to="/contact">Demander un accès à la beta</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Platform;
