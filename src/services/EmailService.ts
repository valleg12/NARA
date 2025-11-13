/**
 * Service pour récupérer et analyser les emails depuis Supabase
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_EMAILS_URL || "https://gttdxeghsgfabgtganvi.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_EMAILS_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0dGR4ZWdoc2dmYWJndGdhbnZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk0NDk0MCwiZXhwIjoyMDc4NTIwOTQwfQ.e_yfI6D4zTcVLtvTjmrfQ7f9kytY1ZN1z9wAEmWTChA";

const supabase = createClient(supabaseUrl, supabaseKey);

export interface Email {
  id: string;
  user_id?: string;
  gmail_message_id?: string;
  thread_id?: string;
  history_id?: string;
  internal_date?: number;
  size_estimate?: number;
  from_address?: string;
  from_name?: string;
  to_addresses?: string[];
  cc_addresses?: string[];
  bcc_addresses?: string[];
  subject?: string;
  snippet?: string;
  body_text?: string;
  body_html?: string;
  labels?: any; // jsonb
  label_ids?: string[];
  payload?: any; // jsonb
  raw?: any; // jsonb
  is_read?: boolean;
  is_starred?: boolean;
  is_important?: boolean;
  has_attachments?: boolean;
  category?: string;
  received_at?: string;
  inserted_at?: string;
  updated_at?: string;
}

export interface EmailCategory {
  name: string;
  emails: Email[];
  count: number;
  icon: string;
  color: string;
}

class EmailService {
  /**
   * Récupère tous les emails depuis Supabase
   */
  async getAllEmails(): Promise<Email[]> {
    try {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .order("received_at", { ascending: false });

      if (error) {
        console.error("Erreur Supabase:", error);
        throw new Error(`Erreur lors de la récupération des emails: ${error.message}`);
      }

      return (data as Email[]) || [];
    } catch (err) {
      console.error("Erreur lors de la récupération des emails:", err);
      throw err;
    }
  }

  /**
   * Analyse et classe intelligemment les emails par contenu
   */
  analyzeAndCategorizeEmails(emails: Email[]): EmailCategory[] {
    const categories: Map<string, Email[]> = new Map();

    emails.forEach((email) => {
      const subject = (email.subject || "").toLowerCase();
      const snippet = (email.snippet || "").toLowerCase();
      const bodyText = (email.body_text || "").toLowerCase();
      const fromAddress = (email.from_address || "").toLowerCase();
      const combinedText = `${subject} ${snippet} ${bodyText}`.toLowerCase();

      // Analyse intelligente du contenu
      let category = this.detectCategory(combinedText, subject, email);

      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(email);
    });

    // Convertir en format EmailCategory avec métadonnées
    const emailCategories: EmailCategory[] = Array.from(categories.entries()).map(
      ([name, emails]) => {
        const metadata = this.getCategoryMetadata(name);
        return {
          name,
          emails: emails.sort((a, b) => {
            const dateA = a.received_at ? new Date(a.received_at).getTime() : 0;
            const dateB = b.received_at ? new Date(b.received_at).getTime() : 0;
            return dateB - dateA;
          }),
          count: emails.length,
          icon: metadata.icon,
          color: metadata.color,
        };
      }
    );

    // Trier par nombre d'emails décroissant
    return emailCategories.sort((a, b) => b.count - a.count);
  }

  /**
   * Détecte la catégorie d'un email en analysant son contenu
   */
  private detectCategory(text: string, subject: string, email: Email): string {
    // Utiliser la catégorie existante si disponible
    if (email.category) {
      return email.category;
    }

    // Analyser les labels Gmail
    if (email.label_ids && email.label_ids.length > 0) {
      const labelMap: Record<string, string> = {
        INBOX: "Boîte de réception",
        SENT: "Envoyés",
        DRAFT: "Brouillons",
        TRASH: "Corbeille",
        SPAM: "Spam",
        IMPORTANT: "Important",
        STARRED: "Favoris",
      };

      for (const labelId of email.label_ids) {
        if (labelMap[labelId]) {
          return labelMap[labelId];
        }
      }
    }

    // Détection intelligente par mots-clés
    const keywords: Record<string, string[]> = {
      "Factures & Paiements": [
        "facture",
        "invoice",
        "paiement",
        "payment",
        "billing",
        "due",
        "échéance",
        "montant",
        "€",
        "euro",
        "dollar",
        "$",
        "paypal",
        "stripe",
        "virement",
      ],
      "Contrats & Documents": [
        "contrat",
        "contract",
        "signature",
        "document",
        "pdf",
        "accord",
        "convention",
        "agreement",
        "terms",
        "conditions",
      ],
      "Réunions & Rendez-vous": [
        "réunion",
        "meeting",
        "appel",
        "call",
        "zoom",
        "teams",
        "calendar",
        "calendrier",
        "rendez-vous",
        "appointment",
        "schedule",
        "disponible",
        "available",
      ],
      "Projets & Collaborations": [
        "projet",
        "project",
        "collaboration",
        "deadline",
        "échéance",
        "livraison",
        "delivery",
        "milestone",
        "jalon",
        "brief",
        "cahier des charges",
      ],
      "Marketing & Communication": [
        "newsletter",
        "promotion",
        "offre",
        "campaign",
        "marketing",
        "publicité",
        "advertising",
        "social media",
        "réseaux sociaux",
      ],
      "Support & Assistance": [
        "support",
        "help",
        "assistance",
        "ticket",
        "issue",
        "problem",
        "problème",
        "bug",
        "error",
        "erreur",
      ],
      "Notifications & Alertes": [
        "notification",
        "alert",
        "alerte",
        "reminder",
        "rappel",
        "confirmation",
        "confirm",
        "validation",
      ],
      "Réseaux Sociaux": [
        "instagram",
        "facebook",
        "twitter",
        "linkedin",
        "tiktok",
        "youtube",
        "follow",
        "abonné",
        "subscriber",
      ],
    };

    // Chercher des correspondances de mots-clés
    for (const [category, words] of Object.entries(keywords)) {
      for (const word of words) {
        if (text.includes(word)) {
          return category;
        }
      }
    }

    // Catégorie par défaut basée sur l'état
    if (email.is_important) return "Important";
    if (email.is_starred) return "Favoris";
    if (!email.is_read) return "Non lus";
    if (email.has_attachments) return "Avec pièces jointes";

    return "Autres";
  }

  /**
   * Retourne les métadonnées d'une catégorie (icône, couleur)
   */
  private getCategoryMetadata(category: string): { icon: string; color: string } {
    const metadata: Record<string, { icon: string; color: string }> = {
      "Boîte de réception": { icon: "Inbox", color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
      "Envoyés": { icon: "Send", color: "bg-green-500/10 text-green-700 border-green-500/20" },
      "Brouillons": { icon: "FileText", color: "bg-gray-500/10 text-gray-700 border-gray-500/20" },
      "Corbeille": { icon: "Trash", color: "bg-red-500/10 text-red-700 border-red-500/20" },
      "Spam": { icon: "AlertTriangle", color: "bg-orange-500/10 text-orange-700 border-orange-500/20" },
      "Important": { icon: "Star", color: "bg-gold/10 text-gold-dark border-gold/20" },
      "Favoris": { icon: "Star", color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
      "Non lus": { icon: "Mail", color: "bg-purple-500/10 text-purple-700 border-purple-500/20" },
      "Avec pièces jointes": { icon: "Paperclip", color: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20" },
      "Factures & Paiements": { icon: "DollarSign", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
      "Contrats & Documents": { icon: "FileText", color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
      "Réunions & Rendez-vous": { icon: "Calendar", color: "bg-purple-500/10 text-purple-700 border-purple-500/20" },
      "Projets & Collaborations": { icon: "Briefcase", color: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20" },
      "Marketing & Communication": { icon: "Megaphone", color: "bg-pink-500/10 text-pink-700 border-pink-500/20" },
      "Support & Assistance": { icon: "HelpCircle", color: "bg-orange-500/10 text-orange-700 border-orange-500/20" },
      "Notifications & Alertes": { icon: "Bell", color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
      "Réseaux Sociaux": { icon: "Share2", color: "bg-rose-500/10 text-rose-700 border-rose-500/20" },
      "Autres": { icon: "Mail", color: "bg-gray-500/10 text-gray-700 border-gray-500/20" },
    };

    return metadata[category] || metadata["Autres"];
  }

  /**
   * Récupère les emails non lus
   */
  getUnreadEmails(emails: Email[]): Email[] {
    return emails.filter((email) => !email.is_read);
  }

  /**
   * Récupère les emails importants
   */
  getImportantEmails(emails: Email[]): Email[] {
    return emails.filter((email) => email.is_important || email.is_starred);
  }

  /**
   * Récupère les emails d'aujourd'hui
   */
  getTodayEmails(emails: Email[]): Email[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return emails.filter((email) => {
      if (!email.received_at) return false;
      const emailDate = new Date(email.received_at);
      emailDate.setHours(0, 0, 0, 0);
      return emailDate.getTime() === today.getTime();
    });
  }

  /**
   * Récupère les emails à venir (dates futures)
   */
  getUpcomingEmails(emails: Email[]): Email[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return emails.filter((email) => {
      if (!email.received_at) return false;
      const emailDate = new Date(email.received_at);
      emailDate.setHours(0, 0, 0, 0);
      return emailDate.getTime() > today.getTime();
    });
  }

  /**
   * Récupère les emails complétés/lus récemment
   */
  getCompletedEmails(emails: Email[]): Email[] {
    return emails
      .filter((email) => email.is_read)
      .sort((a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 10); // Limiter aux 10 derniers
  }
}

export default new EmailService();

