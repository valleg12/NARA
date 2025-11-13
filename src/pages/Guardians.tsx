import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { FileText, Upload, AlertCircle, CheckCircle, Info, Plus, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import DustService from "@/services/DustService";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  file?: File;
  timestamp: Date;
};

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleFileSelection = (file?: File) => {
    if (!file) {
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Seuls les fichiers PDF sont autorisés.");
      setCurrentFile(null);
      return;
    }
    setError(null);
    setCurrentFile(file);
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
    setCurrentFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() && !currentFile) {
      setError("Veuillez saisir un message ou joindre un fichier.");
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: currentMessage.trim() || "Analyse ce document",
      file: currentFile || undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    const fileToSend = currentFile;
    setCurrentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setError(null);
    setIsAgentLoading(true);

    try {
      let fileIds: string[] | undefined;

      if (fileToSend) {
        setIsUploadingFile(true);
        try {
          const fileId = await DustService.uploadFile(fileToSend);
          fileIds = [fileId];
        } finally {
          setIsUploadingFile(false);
        }
      }

      // S'assurer que fileIds est un tableau de strings
      const cleanFileIds = fileIds ? fileIds.map(id => String(id).trim()).filter(id => id.length > 0) : undefined;
      
      const response = await DustService.callAgent({
        message: userMessage.content,
        username: "Manager",
        fullName: "Utilisateur NARA",
        fileIds: cleanFileIds,
        conversationId: conversationId || undefined,
      });

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message || "Aucune réponse reçue.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur inattendue est survenue.";
      setError(message);
    } finally {
      setIsAgentLoading(false);
      setTimeout(scrollToBottom, 100);
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
              <Card className="border-border/50 h-[calc(100vh-200px)] flex flex-col">
                <CardHeader>
                  <CardTitle className="font-display text-xl font-semibold">
                    Chat avec l'agent juridique NARA
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4 p-4">
                  {/* Zone de messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                        <Bot className="w-16 h-16 text-foreground/30" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            Commencez une conversation
                          </p>
                          <p className="text-xs text-foreground/60">
                            Posez une question ou joignez un document PDF pour analyse
                          </p>
                        </div>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${
                            msg.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          {msg.role === "assistant" && (
                            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-gold" />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] rounded-lg p-4 ${
                              msg.role === "user"
                                ? "bg-gold/10 text-foreground"
                                : "bg-muted/50 text-foreground"
                            }`}
                          >
                            {msg.file && (
                              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/30">
                                <FileText className="w-4 h-4 text-gold" />
                                <span className="text-xs font-medium">{msg.file.name}</span>
                              </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p className="text-xs text-foreground/50 mt-2">
                              {msg.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                          {msg.role === "user" && (
                            <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-foreground" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    {isAgentLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-gold" />
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4">
                          <p className="text-sm text-foreground/60">L'agent réfléchit...</p>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Zone de saisie */}
                  <div className="space-y-2 border-t border-border/50 pt-4">
                    {error && (
                      <div className="text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                        {error}
                      </div>
                    )}
                    {currentFile && (
                      <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-background p-3">
                        <FileText className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{currentFile.name}</p>
                          <p className="text-xs text-foreground/60">
                            {(currentFile.size / 1024).toFixed(1)} Ko
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveFile}
                          className="text-foreground/60 hover:text-foreground flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Textarea
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="Tapez votre message... (Entrée pour envoyer, Maj+Entrée pour nouvelle ligne)"
                          rows={2}
                          className="resize-none pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute right-2 bottom-2"
                          title="Joindre un fichier PDF"
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={handleInputChange}
                        />
                      </div>
                      <Button
                        variant="gold"
                        size="lg"
                        onClick={handleSendMessage}
                        disabled={isAgentLoading || isUploadingFile || (!currentMessage.trim() && !currentFile)}
                        className="px-6"
                      >
                        {isUploadingFile ? (
                          "Upload..."
                        ) : isAgentLoading ? (
                          "..."
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
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
