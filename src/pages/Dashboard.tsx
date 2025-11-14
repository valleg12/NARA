import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, DollarSign, CheckSquare, Plus, Calendar, Mail, Star, Briefcase, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import EmailService, { type Email } from "@/services/EmailService";
import CalendarEventService from "@/services/CalendarEventService";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [emails, setEmails] = useState<Email[]>([]);
  const [opportunities, setOpportunities] = useState<{
    collaborations: Email[];
    invitations: Email[];
    gifting: Email[];
  }>({ collaborations: [], invitations: [], gifting: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedEmails = await EmailService.getAllEmails();
      setEmails(fetchedEmails);
      
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

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !newTaskDate) {
      toast.error("Veuillez remplir au moins le titre et la date");
      return;
    }

    try {
      // Combiner date et heure
      const dateTime = new Date(newTaskDate);
      if (newTaskTime) {
        const [hours, minutes] = newTaskTime.split(":");
        dateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      } else {
        dateTime.setHours(9, 0, 0, 0); // Par défaut 9h
      }

      // Créer l'événement
      CalendarEventService.addEvent({
        title: newTaskTitle,
        date: dateTime,
        email: {
          id: `manual-${Date.now()}`,
          subject: newTaskTitle,
          body_text: newTaskDescription || "",
          from_name: "Vous",
        } as Email,
        description: newTaskDescription || undefined,
      });

      toast.success("Événement ajouté au calendrier !");
      
      // Réinitialiser le formulaire
      setNewTaskTitle("");
      setNewTaskDate("");
      setNewTaskTime("");
      setNewTaskDescription("");
      setIsAddTaskDialogOpen(false);
      
      // Rediriger vers ORBIT pour voir l'événement
      navigate("/app/compliance");
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'événement:", err);
      toast.error("Erreur lors de l'ajout de l'événement");
    }
  };

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
    <div className="space-y-4 md:space-y-8">
      {/* Welcome Message */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 md:space-y-2">
          <h1 className="font-display text-2xl md:text-4xl font-semibold text-foreground">
            Bonjour NARAGent, bienvenue dans votre univers.
          </h1>
          <p className="text-foreground/60 text-sm md:text-lg">
            Voici votre aperçu quotidien
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading} className="w-full sm:w-auto">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card className="border-border/50 hover-lift transition-all duration-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">
              Événements à venir
            </CardTitle>
            <Calendar className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-semibold text-foreground">
              {CalendarEventService.getManualEvents().length + EmailService.getCalendarEvents(emails).length}
            </div>
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

      {/* Quick Actions */}
      <div className="space-y-3 md:space-y-4">
        <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
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
            onClick={() => setIsAddTaskDialogOpen(true)}
          >
            <Plus className="mr-2 h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Ajouter une tâche</div>
              <div className="text-xs opacity-60 font-normal">Organisation simplifiée</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Dialog pour ajouter une tâche */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">
              Ajouter un événement au calendrier
            </DialogTitle>
            <DialogDescription>
              Créez un nouvel événement qui apparaîtra dans le calendrier de l'onglet ORBIT
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Titre de l'événement *</Label>
              <Input
                id="task-title"
                placeholder="Ex: Réunion avec le client"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-date">Date *</Label>
                <Input
                  id="task-date"
                  type="date"
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="task-time">Heure</Label>
                <Input
                  id="task-time"
                  type="time"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                placeholder="Détails de l'événement..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddTaskDialogOpen(false);
                  setNewTaskTitle("");
                  setNewTaskDate("");
                  setNewTaskTime("");
                  setNewTaskDescription("");
                }}
              >
                Annuler
              </Button>
              <Button variant="gold" onClick={handleAddTask}>
                Ajouter au calendrier
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
