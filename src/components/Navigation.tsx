import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Accueil", path: "/" },
    { name: "Notre Vision", path: "/about" },
    { name: "Plateforme", path: "/platform" },
    { name: "Contact", path: "/contact" },
  ];
  const appEntryPoint = "http://localhost:8080/app";

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="font-display text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity">
            NARA
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-gold relative py-2",
                  isActive(link.path) ? "text-foreground" : "text-foreground/70"
                )}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full" />
                )}
              </Link>
            ))}
            <Button size="sm" className="bg-gold text-background hover:bg-gold/90" asChild>
              <a href={appEntryPoint}>Accéder à l&apos;app</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-accent/10 rounded-md transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md animate-fade-in">
          <div className="container mx-auto px-6 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block py-3 px-4 rounded-md text-base font-medium transition-colors",
                  isActive(link.path)
                    ? "bg-accent/10 text-foreground"
                    : "text-foreground/70 hover:bg-accent/5 hover:text-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
            <Button
              className="w-full bg-gold text-background hover:bg-gold/90"
              onClick={() => setIsOpen(false)}
              asChild
            >
              <a href={appEntryPoint}>Accéder à l&apos;app</a>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
