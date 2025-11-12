import { TrendingUp, DollarSign, Clock, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const invoices = [
  {
    id: "2024-003",
    client: "Client ABC",
    amount: 3500,
    date: "20 Jan 2024",
    status: "paid",
  },
  {
    id: "2024-002",
    client: "Projet Y",
    amount: 5200,
    date: "15 Jan 2024",
    status: "sent",
  },
  {
    id: "2024-001",
    client: "Client XYZ",
    amount: 2800,
    date: "05 Jan 2024",
    status: "overdue",
  },
];

const Cashy = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
      case "sent":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "overdue":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      case "draft":
        return "bg-foreground/10 text-foreground border-foreground/20";
      default:
        return "bg-foreground/10 text-foreground border-foreground/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Payée";
      case "sent":
        return "Envoyée";
      case "overdue":
        return "En retard";
      case "draft":
        return "Brouillon";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold text-foreground">
            Vos Finances
          </h1>
          <p className="text-foreground/60 mt-2">
            Comptabilité simplifiée et transparente
          </p>
        </div>
        <Button variant="gold" size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Créer une facture
        </Button>
      </div>

      {/* Financial Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-border/50 hover-lift transition-all duration-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">
              Chiffre d'affaires (30j)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-semibold text-foreground">11 500 €</div>
            <p className="text-xs text-emerald-600 mt-1">+12% vs mois dernier</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover-lift transition-all duration-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">
              En attente de paiement
            </CardTitle>
            <Clock className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-semibold text-foreground">8 000 €</div>
            <p className="text-xs text-foreground/60 mt-1">2 factures</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover-lift transition-all duration-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">
              Prévision URSSAF
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-semibold text-foreground">2 530 €</div>
            <p className="text-xs text-foreground/60 mt-1">Trimestre en cours</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-display font-semibold">
            Évolution du chiffre d'affaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-end justify-between gap-4 px-4">
            {[3200, 4100, 3800, 5200, 4500, 4800, 5500, 6200, 4900, 5800, 6500, 7200].map(
              (value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gold/20 rounded-t-md relative group transition-all duration-300 hover:bg-gold/30"
                    style={{ height: `${(value / 7500) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-foreground whitespace-nowrap">
                      {value}€
                    </div>
                  </div>
                  <span className="text-xs text-foreground/60">
                    {["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"][index]}
                  </span>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-semibold text-foreground">Factures récentes</h2>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {invoices.map((invoice, index) => (
                <div
                  key={invoice.id}
                  className={`flex items-center justify-between py-4 ${
                    index !== invoices.length - 1 ? "border-b border-border/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Facture #{invoice.id}</p>
                      <p className="text-sm text-foreground/60">{invoice.client}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{invoice.amount} €</p>
                      <p className="text-xs text-foreground/60">{invoice.date}</p>
                    </div>
                    <Badge className={getStatusColor(invoice.status)}>
                      {getStatusText(invoice.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cashy;
