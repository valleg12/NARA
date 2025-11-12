import { Link } from "react-router-dom";
import { FileText, DollarSign, CheckSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="space-y-2">
        <h1 className="font-display text-4xl font-semibold text-foreground">
          Bonjour Marie, bienvenue dans votre univers.
        </h1>
        <p className="text-foreground/60 text-lg">
          Voici votre aperçu quotidien
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-border/50 hover-lift transition-all duration-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">
              Contrats en attente
            </CardTitle>
            <FileText className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-semibold text-foreground">1</div>
            <p className="text-xs text-foreground/60 mt-1">
              Analyse en cours
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover-lift transition-all duration-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">
              Factures en attente
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-semibold text-foreground">2</div>
            <p className="text-xs text-foreground/60 mt-1">
              Paiement attendu
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover-lift transition-all duration-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">
              Tâches aujourd'hui
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-semibold text-foreground">3</div>
            <p className="text-xs text-foreground/60 mt-1">
              À accomplir
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Actions rapides
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Button
            variant="gold"
            size="lg"
            className="w-full justify-start h-auto py-6"
            asChild
          >
            <Link to="/app/guardians">
              <Plus className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Soumettre un contrat</div>
                <div className="text-xs opacity-80 font-normal">Analyse juridique IA</div>
              </div>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full justify-start h-auto py-6"
            asChild
          >
            <Link to="/app/cashy">
              <Plus className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Créer une facture</div>
                <div className="text-xs opacity-60 font-normal">Facturation automatique</div>
              </div>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full justify-start h-auto py-6"
            asChild
          >
            <Link to="/app/productivity">
              <Plus className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Ajouter une tâche</div>
                <div className="text-xs opacity-60 font-normal">Organisation simplifiée</div>
              </div>
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Activité récente
        </h2>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b border-border/30">
                <div className="w-2 h-2 rounded-full bg-gold mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Contrat "Projet X" soumis pour analyse
                  </p>
                  <p className="text-xs text-foreground/60 mt-1">Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-start gap-4 pb-4 border-b border-border/30">
                <div className="w-2 h-2 rounded-full bg-foreground/30 mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Facture #2024-003 envoyée à Client ABC
                  </p>
                  <p className="text-xs text-foreground/60 mt-1">Hier à 14:32</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-foreground/30 mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Tâche "Préparer présentation" marquée comme terminée
                  </p>
                  <p className="text-xs text-foreground/60 mt-1">Il y a 3 jours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
