import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { FileText, Upload, AlertCircle, CheckCircle, Info, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import DustService from "@/services/DustService";

const contracts = [
  {
    id: 1,
    name: "Contrat Prestation - Client ABC",
    date: "15 Jan 2024",
    status: "validated",
    alerts: [],
  },
  {
    id: 2,
    name: "Contrat Projet X",
    date: "20 Jan 2024",
    status: "analyzing",
    alerts: [],
  },
  {
    id: 3,
    name: "NDA - Partenariat Y",
    date: "10 Jan 2024",
    status: "action-required",
    alerts: [
      { type: "critical", message: "Clause de non-concurrence trop restrictive" },
      { type: "warning", message: "Durée d'engagement non spécifiée" },
    ],
  },
];

const Guardians = () => {
  const [selectedContract, setSelectedContract] = useState<number | null>(null);
  const [agentMessage, setAgentMessage] = useState("");
  const [agentResponse, setAgentResponse] = useState<string | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelection = (file?: File) => {
    if (!file) {
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Seuls les fichiers PDF sont autorisés.");
      setUploadedFile(null);
      return;
    }
    setUploadError(null);
    setUploadedFile(file);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleFileSelection(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    handleFileSelection(file);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAskAgent = async () => {
    if (!agentMessage.trim()) {
      setAgentError("Veuillez saisir une question ou un besoin avant d'appeler l'agent.");
      return;
    }

    setIsAgentLoading(true);
    setAgentError(null);
    setAgentResponse(null);

    try {
      let fileIds: string[] | undefined;

      if (uploadedFile) {
        setIsUploadingFile(true);
        try {
          const fileId = await DustService.uploadFile(uploadedFile);
          fileIds = [fileId];
        } finally {
          setIsUploadingFile(false);
        }
      }

      const response = await DustService.callAgent({
        message: agentMessage,
        username: "Manager",
        fullName: "Utilisateur NARA",
        fileIds,
      });
      setAgentResponse(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Une erreur inattendue est survenue.";
      setAgentError(message);
    } finally {
      setIsAgentLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "validated":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
      case "analyzing":
        return "bg-gold/10 text-gold-dark border-gold/20";
      case "action-required":
        return "bg-orange-500/10 text-orange-700 border-orange-500/20";
      default:
        return "bg-foreground/10 text-foreground border-foreground/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "validated":
        return "Validé";
      case "analyzing":
        return "En analyse";
      case "action-required":
        return "Action requise";
      default:
        return "Archivé";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold text-foreground">
            Vos Contrats
          </h1>
          <p className="text-foreground/60 mt-2">
            Protection juridique intelligente pour votre carrière
          </p>
        </div>
        <Button variant="gold" size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Soumettre un contrat
        </Button>
      </div>

      {contracts.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gold" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Votre espace juridique est prêt
            </h3>
            <p className="text-foreground/60 text-center max-w-md mb-6">
              Soumettez votre premier contrat pour une analyse approfondie par notre IA juridique.
            </p>
            <Button variant="gold" size="lg">
              <Upload className="mr-2 h-5 w-5" />
              Soumettre un contrat
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Contract List */}
          <div className="lg:col-span-1 space-y-4">
            {contracts.map((contract) => (
              <Card
                key={contract.id}
                className={`border-border/50 cursor-pointer transition-all duration-300 hover-lift ${
                  selectedContract === contract.id ? "ring-2 ring-gold" : ""
                }`}
                onClick={() => setSelectedContract(contract.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold text-foreground leading-snug">
                      {contract.name}
                    </CardTitle>
                    <Badge className={getStatusColor(contract.status)}>
                      {getStatusText(contract.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-foreground/60">
                    <FileText className="w-3 h-3" />
                    {contract.date}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contract Detail */}
          <div className="lg:col-span-2">
            {selectedContract ? (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-2xl font-display font-semibold">
                    {contracts.find((c) => c.id === selectedContract)?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Analysis Report */}
                  <div className="space-y-4">
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      Rapport d'analyse
                    </h3>

                    {contracts.find((c) => c.id === selectedContract)?.alerts.map((alert, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-4 p-4 rounded-lg border ${
                          alert.type === "critical"
                            ? "bg-red-500/5 border-red-500/20"
                            : alert.type === "warning"
                            ? "bg-orange-500/5 border-orange-500/20"
                            : "bg-blue-500/5 border-blue-500/20"
                        }`}
                      >
                        {alert.type === "critical" ? (
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        ) : alert.type === "warning" ? (
                          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {alert.type === "critical"
                              ? "Point critique"
                              : alert.type === "warning"
                              ? "Point d'attention"
                              : "Point informatif"}
                          </p>
                          <p className="text-sm text-foreground/70 mt-1">{alert.message}</p>
                        </div>
                      </div>
                    ))}

                    {(!contracts.find((c) => c.id === selectedContract)?.alerts.length ||
                      contracts.find((c) => c.id === selectedContract)?.alerts.length === 0) && (
                      <div className="flex items-start gap-4 p-4 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Contrat validé</p>
                          <p className="text-sm text-foreground/70 mt-1">
                            Ce contrat a été analysé et ne présente pas de clauses problématiques.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {contracts.find((c) => c.id === selectedContract)?.status === "action-required" && (
                    <Button variant="gold" size="lg" className="w-full">
                      Contacter mon agent NARA
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/50">
                <CardContent className="flex flex-col gap-6 items-center justify-center py-16">
                  <div className="flex flex-col items-center text-center gap-2">
                    <FileText className="w-12 h-12 text-foreground/30" />
                    <p className="text-foreground/60">
                      Sélectionnez un contrat pour voir les détails
                    </p>
                  </div>

                  <div className="w-full max-w-xl space-y-4">
                    <div className="text-center space-y-1">
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        Besoin d'une analyse rapide ?
                      </h3>
                      <p className="text-sm text-foreground/70">
                        Posez votre question à l'agent juridique NARA pour obtenir un retour instantané.
                      </p>
                    </div>
                    <Textarea
                      value={agentMessage}
                      onChange={(event) => setAgentMessage(event.target.value)}
                      placeholder="Ex. Analyse les risques de non-concurrence sur un contrat freelance de 12 mois..."
                      rows={4}
                    />
                    <div
                      className="rounded-lg border-2 border-dashed border-border/60 bg-muted/20 p-6 text-center transition-colors hover:border-gold focus-within:border-gold"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                          <Upload className="w-5 h-5 text-gold" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            Glissez-déposez un contrat au format PDF
                          </p>
                          <p className="text-xs text-foreground/60">
                            Taille maximale recommandée : 10 Mo
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Parcourir votre ordinateur
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={handleInputChange}
                        />
                        <p className="text-xs text-foreground/50">
                          Seuls les fichiers PDF sont pris en charge actuellement.
                        </p>
                      </div>
                    </div>
                    {uploadError && <p className="text-sm text-red-600 text-center">{uploadError}</p>}
                    {uploadedFile && (
                      <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-background p-4">
                        <div className="mt-1">
                          <FileText className="w-5 h-5 text-gold" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{uploadedFile.name}</p>
                          <p className="text-xs text-foreground/60">
                            {(uploadedFile.size / 1024).toFixed(1)} Ko
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveFile}
                          className="text-foreground/60 hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    <Button
                      variant="gold"
                      size="lg"
                      className="w-full"
                      onClick={handleAskAgent}
                      disabled={isAgentLoading || isUploadingFile}
                    >
                      {isUploadingFile
                        ? "Téléversement du document..."
                        : isAgentLoading
                        ? "Consultation en cours..."
                        : "Consulter l'agent Dust"}
                    </Button>
                    {agentError && (
                      <div className="text-sm text-red-600 text-center whitespace-pre-wrap">{agentError}</div>
                    )}
                    {agentResponse && (
                      <div className="p-4 rounded-lg border border-border/50 bg-muted/30 text-left space-y-2">
                        <p className="text-sm font-medium text-foreground">Réponse de l'agent</p>
                        <p className="text-sm text-foreground/80 whitespace-pre-wrap">{agentResponse}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Guardians;
