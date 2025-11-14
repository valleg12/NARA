import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, DollarSign, CheckSquare, Plus, Calendar, Mail, Star, Briefcase, RefreshCw, Loader2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EmailService, { type Email, type CalendarEvent } from "@/services/EmailService";

const Dashboard = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [opportunities, setOpportunities] = useState<{
    collaborations: Email[];
    invitations: Email[];
    gifting: Email[];
  }>({ collaborations: [], invitations: [], gifting: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedEmails = await EmailService.getAllEmails();
      setEmails(fetchedEmails);
      
      const events = EmailService.getCalendarEvents(fetchedEmails);
      setCalendarEvents(events);
      
      const opps = EmailService.getOpportunities(fetchedEmails);
      setOpportunities(opps);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue lors du chargement des données";
      setError(message);
      console.error("Erreur:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  // Grouper les événements par mois
  const eventsByMonth = calendarEvents.reduce((acc, event) => {
    const monthKey = `${event.date.getFullYear()}-${event.date.getMonth()}`;
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  // Événements du mois actuel
  const currentMonthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;
  const currentMonthEvents = eventsByMonth[currentMonthKey] || [];

  // Prochains événements (7 prochains jours)
  const upcomingEvents = calendarEvents
    .filter((event) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= 7;
    })
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-semibold text-foreground">
            Bonjour NARAGent, bienvenue dans votre univers.
          </h1>
          <p className="text-foreground/60 text-lg">Voici votre aperçu quotidien</p>
        </div>
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
            <p className="text-foreground/60">Chargement des données...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-semibold text-foreground">
            Bonjour NARAGent, bienvenue dans votre univers.
          </h1>
          <p className="text-foreground/60 text-lg">Voici votre aperçu quotidien</p>
        </div>
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">Erreur de chargement</h3>
            <p className="text-foreground/60 text-center max-w-md mb-6">{error}</p>
            <Button variant="gold" onClick={fetchData}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-semibold text-foreground">
            Bonjour NARAGent, bienvenue dans votre univers.
          </h1>
          <p className="text-foreground/60 text-lg">
            Voici votre aperçu quotidien
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-border/50 hover-lift transition-all duration-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">
              Événements à venir
            </CardTitle>
            <Calendar className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-semibold text-foreground">{calendarEvents.length}</div>
            <p className="text-xs text-foreground/60 mt-1">
              Prochains événements
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover-lift transition-all duration-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">
              Collaborations
            </CardTitle>
            <Briefcase className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-semibold text-foreground">{opportunities.collaborations.length}</div>
            <p className="text-xs text-foreground/60 mt-1">
              Opportunités
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover-lift transition-all duration-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">
              Invitations
            </CardTitle>
            <Mail className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-semibold text-foreground">{opportunities.invitations.length}</div>
            <p className="text-xs text-foreground/60 mt-1">
              En attente
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover-lift transition-all duration-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">
              Gifting
            </CardTitle>
            <Star className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-semibold text-foreground">{opportunities.gifting.length}</div>
            <p className="text-xs text-foreground/60 mt-1">
              Offres reçues
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendrier et Vue d'ensemble */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calendrier des événements */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-display font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold" />
                Calendrier des événements
              </CardTitle>
              <p className="text-sm text-foreground/60">
                Mise à jour automatique depuis vos emails
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {calendarEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
                <p className="text-foreground/60">Aucun événement à venir</p>
                <p className="text-xs text-foreground/50 mt-2">
                  Les événements proposés par email apparaîtront ici automatiquement
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gold" />
                      Prochains 7 jours
                    </h3>
                    <div className="space-y-2">
                      {upcomingEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-purple-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground mb-1">{event.title}</p>
                            <p className="text-xs text-foreground/60">{formatShortDate(event.date)}</p>
                            {event.description && (
                              <p className="text-xs text-foreground/50 mt-1 line-clamp-1">{event.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {currentMonthEvents.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      {currentMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                    </h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {currentMonthEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-purple-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground mb-1">{event.title}</p>
                            <p className="text-xs text-foreground/60">{formatShortDate(event.date)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vue d'ensemble des opportunités */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-display font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gold" />
              Vue d'ensemble des opportunités
            </CardTitle>
            <p className="text-sm text-foreground/60 mt-2">
              Toutes vos opportunités sur un tableau de bord centralisé
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Collaborations */}
              {opportunities.collaborations.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-700" />
                      Collaborations ({opportunities.collaborations.length})
                    </h3>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                      Rémunérées & Non rémunérées
                    </Badge>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {opportunities.collaborations.slice(0, 5).map((email) => (
                      <div
                        key={email.id}
                        className="p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <p className="text-sm font-medium text-foreground mb-1">{email.subject || "Sans objet"}</p>
                        {email.from_name && (
                          <p className="text-xs text-foreground/60">De: {email.from_name}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invitations */}
              {opportunities.invitations.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4 text-purple-700" />
                      Invitations ({opportunities.invitations.length})
                    </h3>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-500/20">
                      Événements
                    </Badge>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {opportunities.invitations.slice(0, 5).map((email) => (
                      <div
                        key={email.id}
                        className="p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <p className="text-sm font-medium text-foreground mb-1">{email.subject || "Sans objet"}</p>
                        {email.from_name && (
                          <p className="text-xs text-foreground/60">De: {email.from_name}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gifting */}
              {opportunities.gifting.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-700" />
                      Gifting ({opportunities.gifting.length})
                    </h3>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                      Produits offerts
                    </Badge>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {opportunities.gifting.slice(0, 5).map((email) => (
                      <div
                        key={email.id}
                        className="p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <p className="text-sm font-medium text-foreground mb-1">{email.subject || "Sans objet"}</p>
                        {email.from_name && (
                          <p className="text-xs text-foreground/60">De: {email.from_name}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {opportunities.collaborations.length === 0 && 
               opportunities.invitations.length === 0 && 
               opportunities.gifting.length === 0 && (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
                  <p className="text-foreground/60">Aucune opportunité pour le moment</p>
                </div>
              )}
            </div>
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
            <Link to="/app/cashflow">
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
            <Link to="/app/compliance">
              <Plus className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Ajouter une tâche</div>
                <div className="text-xs opacity-60 font-normal">Organisation simplifiée</div>
              </div>
            </Link>
          </Button>
        </div>
      </div>

      {/* Modal pour afficher les détails d'un événement */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-foreground/70">
                <Calendar className="w-4 h-4 text-gold" />
                <span>{formatDate(selectedEvent.date)}</span>
              </div>
              {selectedEvent.email.from_name && (
                <div className="text-sm text-foreground/70">
                  <span className="font-medium">De:</span> {selectedEvent.email.from_name}
                  {selectedEvent.email.from_address && ` <${selectedEvent.email.from_address}>`}
                </div>
              )}
              {selectedEvent.description && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Description</h4>
                  <p className="text-sm text-foreground/80 bg-muted/30 rounded-lg p-4">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
              {selectedEvent.email.body_text && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Contenu complet</h4>
                  <div className="text-sm text-foreground/80 bg-muted/30 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                    {selectedEvent.email.body_text}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
