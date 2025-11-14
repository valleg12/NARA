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
    // Utiliser la catégorie existante si disponible et qu'elle correspond aux nouvelles catégories
    if (email.category) {
      const validCategories = [
        "Collaborations Non Rémunérées",
        "Collaborations Rémunérées",
        "Gifting",
        "Invitation",
        "A trier",
      ];
      if (validCategories.includes(email.category)) {
        return email.category;
      }
    }

    // Détection intelligente par mots-clés pour les nouvelles catégories
    // Priorité : on vérifie d'abord les catégories spécifiques, puis on classe en "A trier"

    // 1. Gifting - Détection prioritaire (cadeaux, produits offerts)
    const giftingKeywords = [
      "gift",
      "cadeau",
      "produit offert",
      "échantillon",
      "sample",
      "gifting",
      "produit gratuit",
      "free product",
      "cadeau gracieux",
      "offert",
      "gratuitement",
      "gratuit",
      "complémentaire",
      "test produit",
      "produit test",
    ];
    for (const keyword of giftingKeywords) {
      if (text.includes(keyword)) {
        return "Gifting";
      }
    }

    // 2. Invitation - Événements, invitations
    const invitationKeywords = [
      "invitation",
      "invite",
      "event",
      "événement",
      "soirée",
      "vernissage",
      "lancement",
      "défilé",
      "showroom",
      "salon",
      "exposition",
      "expo",
      "conférence",
      "workshop",
      "atelier",
      "rsvp",
      "confirmer présence",
      "confirmez votre présence",
      "nous serions ravis",
      "serions ravis de vous",
    ];
    for (const keyword of invitationKeywords) {
      if (text.includes(keyword)) {
        return "Invitation";
      }
    }

    // 3. Collaborations Rémunérées - Mention explicite de rémunération/paiement
    const paidCollaborationKeywords = [
      "rémunération",
      "remuneration",
      "paiement",
      "payment",
      "tarif",
      "rate",
      "budget",
      "honoraires",
      "fees",
      "€",
      "euro",
      "dollar",
      "$",
      "montant",
      "amount",
      "facture",
      "invoice",
      "contrat rémunéré",
      "paid collaboration",
      "collaboration payée",
      "sponsorisé",
      "sponsored",
      "partenariat rémunéré",
      "paid partnership",
      "compensation",
      "rémunéré",
      "payé",
      "paid",
    ];
    const hasPaidKeywords = paidCollaborationKeywords.some((keyword) => text.includes(keyword));

    // 4. Collaborations (général) - Mots-clés de collaboration
    const collaborationKeywords = [
      "collaboration",
      "partenariat",
      "partnership",
      "collab",
      "partenaires",
      "partners",
      "projet commun",
      "projet ensemble",
      "travail ensemble",
      "working together",
      "brand ambassador",
      "ambassadeur",
      "ambassadrice",
      "influenceur",
      "influenceuse",
      "creator",
      "créateur",
      "créatrice",
      "content creator",
      "créateur de contenu",
      "sponsor",
      "sponsoring",
    ];
    const hasCollaborationKeywords = collaborationKeywords.some((keyword) => text.includes(keyword));

    // Si collaboration + rémunération = Collaborations Rémunérées
    if (hasCollaborationKeywords && hasPaidKeywords) {
      return "Collaborations Rémunérées";
    }

    // Si collaboration sans rémunération = Collaborations Non Rémunérées
    if (hasCollaborationKeywords && !hasPaidKeywords) {
      return "Collaborations Non Rémunérées";
    }

    // Si rémunération mentionnée mais pas de mot-clé collaboration explicite
    // On peut considérer que c'est une collaboration rémunérée
    if (hasPaidKeywords && (text.includes("post") || text.includes("publication") || text.includes("story") || text.includes("reel"))) {
      return "Collaborations Rémunérées";
    }

    // Par défaut : A trier
    return "A trier";
  }

  /**
   * Retourne les métadonnées d'une catégorie (icône, couleur)
   */
  private getCategoryMetadata(category: string): { icon: string; color: string } {
    const metadata: Record<string, { icon: string; color: string }> = {
      // Nouvelles catégories principales
      "Collaborations Rémunérées": { icon: "DollarSign", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
      "Collaborations Non Rémunérées": { icon: "Briefcase", color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
      "Gifting": { icon: "Star", color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
      "Invitation": { icon: "Calendar", color: "bg-purple-500/10 text-purple-700 border-purple-500/20" },
      "A trier": { icon: "Mail", color: "bg-gray-500/10 text-gray-700 border-gray-500/20" },
      
      // Catégories de fallback (si jamais utilisées)
      "Boîte de réception": { icon: "Inbox", color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
      "Envoyés": { icon: "Send", color: "bg-green-500/10 text-green-700 border-green-500/20" },
      "Brouillons": { icon: "FileText", color: "bg-gray-500/10 text-gray-700 border-gray-500/20" },
      "Corbeille": { icon: "Trash", color: "bg-red-500/10 text-red-700 border-red-500/20" },
      "Spam": { icon: "AlertTriangle", color: "bg-orange-500/10 text-orange-700 border-orange-500/20" },
      "Important": { icon: "Star", color: "bg-gold/10 text-gold-dark border-gold/20" },
      "Favoris": { icon: "Star", color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
      "Non lus": { icon: "Mail", color: "bg-purple-500/10 text-purple-700 border-purple-500/20" },
      "Avec pièces jointes": { icon: "Paperclip", color: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20" },
      "Autres": { icon: "Mail", color: "bg-gray-500/10 text-gray-700 border-gray-500/20" },
    };

    return metadata[category] || metadata["A trier"];
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

