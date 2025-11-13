/**
 * Service pour récupérer les contrats depuis Supabase
 * 
 * Note: Pour la production, il est recommandé d'utiliser l'anon key plutôt que la service_role key
 * et de stocker les credentials dans des variables d'environnement.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://xtyiubhthowddifvourf.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0eWl1Ymh0aG93ZGRpZnZvdXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjMzNTkxNSwiZXhwIjoyMDc3OTExOTE1fQ.4Bnz7W8Hw_Ej9rhi4HF9bnbuPUc-PLFKOnRXdmYXwMA";

const supabase = createClient(supabaseUrl, supabaseKey);

export interface ContractSummary {
  id: string;
  resume: string;
  // Ajoutez d'autres colonnes si elles existent dans votre table
  file_name?: string;
  contract_id?: string;
  created_at?: string;
}

class SupabaseService {
  /**
   * Récupère tous les contrats depuis la table contract_summaries
   */
  async getContractSummaries(): Promise<ContractSummary[]> {
    try {
      // Récupérer toutes les colonnes disponibles
      const { data, error } = await supabase
        .from("contract_summaries")
        .select("*");

      if (error) {
        console.error("Erreur Supabase:", error);
        throw new Error(`Erreur lors de la récupération des contrats: ${error.message}`);
      }

      const contracts = (data as ContractSummary[]) || [];
      
      // Trier par created_at si disponible, sinon par id
      return contracts.sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
      });
    } catch (err) {
      console.error("Erreur lors de la récupération des contrats:", err);
      throw err;
    }
  }

  /**
   * Récupère un contrat spécifique par son ID
   */
  async getContractSummaryById(id: string): Promise<ContractSummary | null> {
    try {
      const { data, error } = await supabase
        .from("contract_summaries")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erreur Supabase:", error);
        throw new Error(`Erreur lors de la récupération du contrat: ${error.message}`);
      }

      return data as ContractSummary | null;
    } catch (err) {
      console.error("Erreur lors de la récupération du contrat:", err);
      throw err;
    }
  }
}

export default new SupabaseService();

