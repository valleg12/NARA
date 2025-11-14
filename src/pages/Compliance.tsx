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
import EmailService, { type Email, type EmailCategory } from "@/services/EmailService";

const Compliance = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [categories, setCategories] = useState<EmailCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  const fetchEmails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await EmailService.getAllEmails();
      setEmails(data);
      const categorized = EmailService.analyzeAndCategorizeEmails(data);
      setCategories(categorized);
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold text-foreground">Votre Journée</h1>
          <p className="text-foreground/60 mt-2">
            {emails.length} email{emails.length > 1 ? "s" : ""} analysé{emails.length > 1 ? "s" : ""} et classé{emails.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="outline" size="lg" onClick={fetchEmails} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Dashboards principaux */}
      <div className="grid lg:grid-cols-2 gap-6">
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

      {/* Catégories intelligentes */}
      {categories.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-display font-semibold">Emails classés par catégorie</CardTitle>
            <p className="text-sm text-foreground/60 mt-2">
              Classification automatique basée sur le contenu des emails
            </p>
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
