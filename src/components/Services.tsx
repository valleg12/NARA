import { Shield, DollarSign, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const services = [
  {
    icon: Shield,
    title: "GUARDIANS",
    subtitle: "Protection juridique intelligente",
    description: "Ne vous demandez plus si votre contrat est juste. Notre IA l'analyse pour vous.",
    features: [
      "Analyse automatique de contrats",
      "Veille juridique personnalisée",
      "Alertes sur vos droits",
    ],
  },
  {
    icon: DollarSign,
    title: "CASHFLOW",
    subtitle: "Comptabilité et finances connectées",
    description: "Concentrez-vous sur votre art, nous gérons vos finances.",
    features: [
      "Tableau de bord financier en temps réel",
      "Facturation automatisée",
      "Optimisation fiscale",
    ],
  },
  {
    icon: Zap,
    title: "COMPLIANCE",
    subtitle: "Organisation et collaboration centralisées",
    description: "Tous vos projets, collaborations et deadlines au même endroit.",
    features: [
      "Gestion de projets créatifs",
      "Collaboration avec votre équipe",
      "Calendrier intelligent",
    ],
  },
];

const Services = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6 lg:px-12 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto">
        <div className={`text-center mb-20 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 tracking-tight">
            Votre carrière, simplifiée et sécurisée.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <div
              key={service.title}
              className={`group hover-lift hover-glow bg-card border border-border/50 rounded-2xl p-8 transition-all duration-500 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="mb-6">
                <div className="inline-flex p-4 rounded-xl bg-gold/10 text-gold group-hover:bg-gold group-hover:text-navy transition-all duration-400">
                  <service.icon className="w-8 h-8" />
                </div>
              </div>
              
              <h3 className="font-display text-2xl font-semibold mb-2">{service.title}</h3>
              <p className="text-sm text-gold mb-4 font-medium">{service.subtitle}</p>
              <p className="text-foreground/70 mb-6 leading-relaxed">{service.description}</p>
              
              <ul className="space-y-3">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link 
            to="/platform" 
            className="inline-flex items-center gap-2 text-foreground/70 hover:text-gold transition-colors group"
          >
            Explorer les fonctionnalités
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;
