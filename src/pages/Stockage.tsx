import { useEffect, useState } from "react";
import { FileText, Loader2, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import SupabaseService, { type ContractSummary } from "@/services/SupabaseService";

const Stockage = () => {
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openContracts, setOpenContracts] = useState<Set<string>>(new Set());

  const fetchContracts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await SupabaseService.getContractSummaries();
      setContracts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue lors du chargement des contrats";
      setError(message);
      console.error("Erreur:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

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

  const getFileName = (contract: ContractSummary) => {
    if (contract.file_name) {
      return contract.file_name;
    }
    if (contract.contract_id) {
      return `Contrat ${contract.contract_id}`;
    }
    return `Contrat ${contract.id.substring(0, 8)}...`;
  };

  const toggleContract = (contractId: string) => {
    setOpenContracts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(contractId)) {
        newSet.delete(contractId);
      } else {
        newSet.add(contractId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold text-foreground">
            Stockage
          </h1>
          <p className="text-foreground/60 mt-2">
            Tous vos contrats et leurs résumés
          </p>
        </div>
        <Button variant="outline" size="lg" onClick={fetchContracts} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {isLoading ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
            <p className="text-foreground/60">Chargement des contrats...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Erreur de chargement
            </h3>
            <p className="text-foreground/60 text-center max-w-md mb-6">{error}</p>
            <Button variant="gold" onClick={fetchContracts}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      ) : contracts.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gold" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Aucun contrat trouvé
            </h3>
            <p className="text-foreground/60 text-center max-w-md">
              Aucun contrat n'a été trouvé dans votre espace de stockage. 
              Les contrats soumis via l'onglet "GUARDIANS" apparaîtront ici une fois analysés.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => {
            const isOpen = openContracts.has(contract.id);
            return (
              <Collapsible
                key={contract.id}
                open={isOpen}
                onOpenChange={() => toggleContract(contract.id)}
              >
                <Card className="border-border/50 hover-lift transition-all duration-300">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-gold" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-semibold text-foreground mb-1">
                              {getFileName(contract)}
                            </CardTitle>
                            {contract.created_at && (
                              <p className="text-xs text-foreground/60">
                                {formatDate(contract.created_at)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="flex-shrink-0">
                            {contract.id.substring(0, 8)}...
                          </Badge>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-foreground/60" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-foreground/60" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">Résumé</h4>
                          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                            <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                              {contract.resume || "Aucun résumé disponible"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Stockage;

