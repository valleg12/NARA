import { useEffect, useState } from "react";
import {
  Calendar,
  CheckSquare,
  Mail,
  Star,
  AlertCircle,
  Loader2,
  RefreshCw,
  DollarSign,
  FileText,
  Briefcase,
  Bell,
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Paperclip,
  Send,
  Trash,
  Inbox,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import EmailService, { type Email, type EmailCategory, type CalendarEvent } from "@/services/EmailService";
import CalendarEventService from "@/services/CalendarEventService";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";

const Compliance = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [categories, setCategories] = useState<EmailCategory[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [opportunities, setOpportunities] = useState<{
    collaborations: Email[];
    invitations: Email[];
    gifting: Email[];
  }>({ collaborations: [], invitations: [], gifting: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [currentWeek, setCurrentWeek] = useState(new Date(2025, 10, 14)); // 14 novembre 2025

  const fetchEmails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await EmailService.getAllEmails();
      setEmails(data);
      const categorized = EmailService.analyzeAndCategorizeEmails(data);
      setCategories(categorized);
      
      // Récupérer les événements du calendrier
      const events = EmailService.getCalendarEvents(data);
      setCalendarEvents(events);
      
      // Récupérer les opportunités
      const opps = EmailService.getOpportunities(data);
      setOpportunities(opps);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue lors du chargement des emails";
      setError(message);
      console.error("Erreur:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const unreadEmails = EmailService.getUnreadEmails(emails);
  const importantEmails = EmailService.getImportantEmails(emails);
  const todayEmails = EmailService.getTodayEmails(emails);
  const upcomingEmails = EmailService.getUpcomingEmails(emails);

  const toggleCategory = (categoryName: string) => {
    setOpenCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date inconnue";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date invalide";
    }
  };

  const formatEventDate = (date: Date | string) => {
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

  // Générer des événements de test basés sur les emails réels
  const generateTestEvents = (emails: Email[]): CalendarEvent[] => {
    const testEvents: CalendarEvent[] = [];
    const now = new Date(2025, 10, 14); // 14 novembre 2025
    
    // Prendre les emails d'invitation existants et créer des événements pour les prochaines semaines
    const invitationEmails = EmailService.getInvitationEmails(emails);
    
    // Si on a des emails réels, les utiliser
    invitationEmails.slice(0, 10).forEach((email, index) => {
      const eventDate = new Date(now);
      eventDate.setDate(eventDate.getDate() + (index * 2) + Math.floor(Math.random() * 7));
      eventDate.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 4) * 15, 0, 0);
      
      testEvents.push({
        id: `test-${email.id}-${index}`,
        title: email.subject || `Événement ${index + 1}`,
        date: eventDate,
        email: email,
        description: email.snippet || email.body_text?.substring(0, 200),
        location: email.from_name ? `Organisé par ${email.from_name}` : undefined,
      });
    });
    
    // Ajouter des événements de test supplémentaires pour remplir le calendrier
    const eventTitles = [
      "Vernissage exposition",
      "Soirée de lancement",
      "Conférence créative",
      "Workshop design",
      "Défilé de mode",
      "Salon professionnel",
      "Atelier photo",
      "Événement networking",
      "Showroom produit",
      "Réunion partenariat",
    ];
    
    for (let i = 0; i < 15; i++) {
      const eventDate = new Date(now);
      eventDate.setDate(eventDate.getDate() + i * 2 + Math.floor(Math.random() * 3));
      eventDate.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 4) * 15, 0, 0);
      
      const randomTitle = eventTitles[Math.floor(Math.random() * eventTitles.length)];
      
      testEvents.push({
        id: `test-event-${i}`,
        title: randomTitle,
        date: eventDate,
        email: {
          id: `test-email-${i}`,
          subject: randomTitle,
          from_name: "Organisateur",
          body_text: `Description de l'événement ${randomTitle}`,
        } as Email,
        description: `Événement ${randomTitle} - Détails à venir`,
        location: "Paris, France",
      });
    }
    
    return testEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  // Récupérer les événements manuels ajoutés depuis le Dashboard
  const manualEvents = CalendarEventService.getManualEvents();
  
  // Combiner les événements des emails et les événements manuels
  const combinedEvents = [...calendarEvents, ...manualEvents];
  
  // Utiliser les événements de test si pas assez d'événements réels
  const allCalendarEvents = combinedEvents.length > 5 
    ? combinedEvents 
    : generateTestEvents(emails);

  // Obtenir le début de la semaine (lundi)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour lundi = 1
    return new Date(d.setDate(diff));
  };

  // Obtenir les jours de la semaine
  const getWeekDays = (weekStart: Date): Date[] => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekStart = getWeekStart(currentWeek);
  const weekDays = getWeekDays(weekStart);
  const weekEvents = allCalendarEvents.filter((event) => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return eventDate >= weekStart && eventDate < weekEnd;
  });

  // Grouper les événements par jour
  const eventsByDay = weekDays.reduce((acc, day) => {
    const dayKey = day.toISOString().split('T')[0];
    acc[dayKey] = weekEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.toISOString().split('T')[0] === dayKey;
    });
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentWeek(new Date(2025, 10, 14));
  };

  // Prochains événements (7 prochains jours)
  const upcomingEvents = allCalendarEvents
    .filter((event) => {
      const today = new Date(2025, 10, 14);
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= 7;
    })
    .slice(0, 5);

  const getCategoryIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Inbox: Inbox,
      Send: Send,
      FileText: FileText,
      Trash: Trash,
      AlertTriangle: AlertCircle,
      Star: Star,
      Mail: Mail,
      Paperclip: Paperclip,
      DollarSign: DollarSign,
      Calendar: Calendar,
      Briefcase: Briefcase,
      Megaphone: Bell,
      HelpCircle: HelpCircle,
      Bell: Bell,
      Share2: Share2,
    };
    return icons[iconName] || Mail;
  };

  const renderEmailItem = (email: Email, showDate = true) => (
    <div
      key={email.id}
      className="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
      onClick={() => setSelectedEmail(email)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-foreground truncate">{email.subject || "Sans objet"}</p>
          <div className="flex items-center gap-1 flex-shrink-0">
            {email.is_important && <Star className="w-4 h-4 text-gold fill-gold" />}
            {!email.is_read && <div className="w-2 h-2 rounded-full bg-blue-500" />}
          </div>
        </div>
        {email.from_name && (
          <p className="text-xs text-foreground/70 mb-1">De: {email.from_name}</p>
        )}
        {email.snippet && (
          <p className="text-xs text-foreground/60 line-clamp-2">{email.snippet}</p>
        )}
        {showDate && email.received_at && (
          <p className="text-xs text-foreground/50 mt-2">{formatDate(email.received_at)}</p>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-semibold text-foreground">Votre Journée</h1>
            <p className="text-foreground/60 mt-2">Organisation et collaboration simplifiées</p>
          </div>
        </div>
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
            <p className="text-foreground/60">Chargement des emails...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-semibold text-foreground">Votre Journée</h1>
            <p className="text-foreground/60 mt-2">Organisation et collaboration simplifiées</p>
          </div>
          <Button variant="outline" size="lg" onClick={fetchEmails}>
            <RefreshCw className="mr-2 h-5 w-5" />
            Réessayer
          </Button>
        </div>
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">Erreur de chargement</h3>
            <p className="text-foreground/60 text-center max-w-md">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-4xl font-semibold text-foreground">Votre Journée</h1>
          <p className="text-foreground/60 mt-1 md:mt-2 text-sm md:text-base">
            {emails.length} email{emails.length > 1 ? "s" : ""} analysé{emails.length > 1 ? "s" : ""} et classé{emails.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="outline" size="lg" onClick={fetchEmails} disabled={isLoading} className="w-full sm:w-auto">
          <RefreshCw className={`mr-2 h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Dashboards principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Emails non lus / À faire aujourd'hui */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-display font-semibold flex items-center gap-2">
              <Mail className="w-5 h-5 text-gold" />
              À faire aujourd'hui ({unreadEmails.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unreadEmails.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
                <p className="text-foreground/60">Aucun email non lu</p>
              </div>
            ) : (
              <div className="max-h-[360px] overflow-y-auto space-y-4 pr-2">
                {unreadEmails.map((email) => renderEmailItem(email))}
                  </div>
            )}
          </CardContent>
        </Card>

        {/* Emails importants / À venir */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-display font-semibold flex items-center gap-2">
              <Star className="w-5 h-5 text-gold" />
              Importants ({importantEmails.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {importantEmails.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
                <p className="text-foreground/60">Aucun email important</p>
                </div>
            ) : (
              <div className="max-h-[360px] overflow-y-auto space-y-4 pr-2">
                {importantEmails.map((email) => renderEmailItem(email))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section Calendrier */}
      <Card className="border-border/50">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <CardTitle className="text-lg md:text-xl font-display font-semibold flex items-center gap-2">
                <Calendar className="w-4 md:w-5 h-4 md:h-5 text-gold" />
                Calendrier des événements
              </CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('prev')}
                  className="h-8 w-8 p-0 flex-1 sm:flex-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="h-8 px-3 text-xs flex-1 sm:flex-none"
                >
                  Aujourd'hui
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('next')}
                  className="h-8 w-8 p-0 flex-1 sm:flex-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="text-xs md:text-sm text-foreground/60">
              {weekStart.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} -{" "}
              {new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 overflow-x-auto">
              {/* En-têtes des jours */}
              <div className="grid grid-cols-7 gap-1 mb-2 min-w-[600px]">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day, index) => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold text-foreground/70 py-2 border-b border-border/50"
                  >
                    <div>{day}</div>
                    <div className="text-xs md:text-sm mt-1">
                      {weekDays[index].toLocaleDateString("fr-FR", { day: "numeric" })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Grille du calendrier */}
              <div className="grid grid-cols-7 gap-1 min-h-[300px] md:min-h-[400px] min-w-[600px]">
                {weekDays.map((day, dayIndex) => {
                  const dayKey = day.toISOString().split('T')[0];
                  const dayEvents = eventsByDay[dayKey] || [];
                  const isToday =
                    day.toDateString() === new Date(2025, 10, 14).toDateString();

                  return (
                    <div
                      key={dayKey}
                      className={`border border-border/50 rounded-lg p-1 md:p-2 min-h-[60px] md:min-h-[80px] ${
                        isToday ? "bg-gold/5 border-gold/30" : "bg-background"
                      }`}
                    >
                      <div className="space-y-0.5 md:space-y-1">
                        {dayEvents.slice(0, 2).map((event) => {
                          const eventTime = new Date(event.date);
                          const timeStr = eventTime.toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                          return (
                            <div
                              key={event.id}
                              className="text-[10px] md:text-xs p-1 md:p-1.5 rounded bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 cursor-pointer transition-colors"
                              onClick={() => setSelectedEvent(event)}
                              title={event.title}
                            >
                              <div className="font-semibold text-purple-700 truncate">
                                <span className="hidden sm:inline">{timeStr} - </span>
                                <span className="truncate">{event.title}</span>
                              </div>
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <div className="text-[10px] md:text-xs text-foreground/60 text-center py-0.5 md:py-1">
                            +{dayEvents.length - 2} autre{dayEvents.length - 2 > 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vue d'ensemble des opportunités */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl font-display font-semibold flex items-center gap-2">
              <Briefcase className="w-4 md:w-5 h-4 md:h-5 text-gold" />
              Vue d'ensemble des opportunités
            </CardTitle>
            <p className="text-xs md:text-sm text-foreground/60 mt-1 md:mt-2">
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
                        className="p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => setSelectedEmail(email)}
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
                        className="p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => setSelectedEmail(email)}
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
                        className="p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => setSelectedEmail(email)}
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

      {/* Catégories intelligentes */}
      {categories.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-display font-semibold">Emails classés par catégorie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map((category) => {
              const isOpen = openCategories.has(category.name);
              const IconComponent = getCategoryIcon(category.icon);
              return (
                <Collapsible
                  key={category.name}
                  open={isOpen}
                  onOpenChange={() => toggleCategory(category.name)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color.split(" ")[0]}`}>
                          <IconComponent className={`w-5 h-5 ${category.color.split(" ")[1]}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{category.name}</p>
                          <p className="text-xs text-foreground/60">{category.count} email{category.count > 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <Badge className={category.color}>{category.count}</Badge>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-foreground/60 ml-2" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-foreground/60 ml-2" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-2 space-y-2 pl-4 border-l-2 border-border/30">
                      {category.emails.slice(0, 10).map((email) => renderEmailItem(email, false))}
                      {category.emails.length > 10 && (
                        <p className="text-xs text-foreground/50 text-center py-2">
                          +{category.emails.length - 10} autre{category.emails.length - 10 > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
        </CardContent>
      </Card>
      )}

      {/* Popup pour afficher les détails d'un événement */}
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
                <span>{formatEventDate(selectedEvent.date)}</span>
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

      {/* Popup pour afficher le contenu complet de l'email */}
      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-semibold text-foreground mb-2">
                  {selectedEmail?.subject || "Sans objet"}
                </DialogTitle>
                <div className="space-y-1 text-sm text-foreground/70">
                  {selectedEmail?.from_name && (
                    <p>
                      <span className="font-medium">De:</span> {selectedEmail.from_name}
                      {selectedEmail.from_address && ` <${selectedEmail.from_address}>`}
                    </p>
                  )}
                  {selectedEmail?.to_addresses && selectedEmail.to_addresses.length > 0 && (
                    <p>
                      <span className="font-medium">À:</span> {selectedEmail.to_addresses.join(", ")}
                    </p>
                  )}
                  {selectedEmail?.received_at && (
                    <p>
                      <span className="font-medium">Reçu le:</span> {formatDate(selectedEmail.received_at)}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEmail(null)}
                className="flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            {selectedEmail?.snippet && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Aperçu</h4>
                <p className="text-sm text-foreground/80 bg-muted/30 rounded-lg p-4">{selectedEmail.snippet}</p>
              </div>
            )}
            {selectedEmail?.body_html ? (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Résumé</h4>
                <div
                  className="text-sm text-foreground/80 bg-muted/30 rounded-lg p-4 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
                />
              </div>
            ) : selectedEmail?.body_text ? (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Résumé</h4>
                <div className="text-sm text-foreground/80 bg-muted/30 rounded-lg p-4 whitespace-pre-wrap">
                  {selectedEmail.body_text}
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground/60 italic">Aucun contenu disponible</p>
            )}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
              {selectedEmail?.is_important && (
                <Badge className="bg-gold/10 text-gold-dark border-gold/20">
                  <Star className="w-3 h-3 mr-1" />
                  Important
                </Badge>
              )}
              {selectedEmail?.is_starred && (
                <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                  <Star className="w-3 h-3 mr-1 fill-yellow-700" />
                  Favori
                </Badge>
              )}
              {selectedEmail?.has_attachments && (
                <Badge className="bg-indigo-500/10 text-indigo-700 border-indigo-500/20">
                  <FileText className="w-3 h-3 mr-1" />
                  Pièces jointes
                </Badge>
              )}
              {selectedEmail?.category && (
                <Badge variant="outline">{selectedEmail.category}</Badge>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Compliance;
