import { useRef, useState } from "react";
import { TrendingUp, DollarSign, Clock, Plus, FileText, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import DustService from "@/services/DustService";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const invoices = [
  {
    id: "2024-003",
    client: "Client ABC",
    amount: 3500,
    date: "20 Jan 2024",
    status: "paid",
  },
  {
    id: "2024-002",
    client: "Projet Y",
    amount: 5200,
    date: "15 Jan 2024",
    status: "sent",
  },
  {
    id: "2024-001",
    client: "Client XYZ",
    amount: 2800,
    date: "05 Jan 2024",
    status: "overdue",
  },
];

const Cashflow = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) {
      setError("Veuillez saisir un message.");
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: currentMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setError(null);
    setIsAgentLoading(true);

    try {
      // Appeler l'agent Cashflow avec le nouvel ID
      const response = await DustService.callCashflowAgent({
        message: userMessage.content,
        username: "Manager",
        fullName: "Utilisateur NARA",
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
      case "paid":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
      case "sent":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "overdue":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      case "draft":
        return "bg-foreground/10 text-foreground border-foreground/20";
      default:
        return "bg-foreground/10 text-foreground border-foreground/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Payée";
      case "sent":
        return "Envoyée";
      case "overdue":
        return "En retard";
      case "draft":
        return "Brouillon";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold text-foreground">
            Vos Finances
          </h1>
          <p className="text-foreground/60 mt-2">
            Comptabilité simplifiée et transparente
          </p>
        </div>
        <Button variant="gold" size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Créer une facture
        </Button>
      </div>

      {/* Financial Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-border/50 hover-lift transition-all duration-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">
              Chiffre d'affaires (30j)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-semibold text-foreground">11 500 €</div>
            <p className="text-xs text-emerald-600 mt-1">+12% vs mois dernier</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover-lift transition-all duration-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">
              En attente de paiement
            </CardTitle>
            <Clock className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-semibold text-foreground">8 000 €</div>
            <p className="text-xs text-foreground/60 mt-1">2 factures</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover-lift transition-all duration-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">
              Prévision URSSAF
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-semibold text-foreground">2 530 €</div>
            <p className="text-xs text-foreground/60 mt-1">Trimestre en cours</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-display font-semibold">
            Évolution du chiffre d'affaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-end justify-between gap-4 px-4">
            {[3200, 4100, 3800, 5200, 4500, 4800, 5500, 6200, 4900, 5800, 6500, 7200].map(
              (value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gold/20 rounded-t-md relative group transition-all duration-300 hover:bg-gold/30"
                    style={{ height: `${(value / 7500) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-foreground whitespace-nowrap">
                      {value}€
                    </div>
                  </div>
                  <span className="text-xs text-foreground/60">
                    {["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"][index]}
                  </span>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoices List and Chat */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Invoices List */}
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold text-foreground">Factures récentes</h2>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {invoices.map((invoice, index) => (
                  <div
                    key={invoice.id}
                    className={`flex items-center justify-between py-4 ${
                      index !== invoices.length - 1 ? "border-b border-border/30" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Facture #{invoice.id}</p>
                        <p className="text-sm text-foreground/60">{invoice.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{invoice.amount} €</p>
                        <p className="text-xs text-foreground/60">{invoice.date}</p>
                      </div>
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusText(invoice.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chatbox */}
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold text-foreground">Assistant financier</h2>
          <Card className="border-border/50 h-[calc(100vh-400px)] flex flex-col">
            <CardHeader>
              <CardTitle className="font-display text-xl font-semibold">
                Chat avec l'agent financier NARA
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
                        Posez une question sur vos finances, factures ou paiements
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
                      className="resize-none"
                    />
                  </div>
                  <Button
                    variant="gold"
                    size="lg"
                    onClick={handleSendMessage}
                    disabled={isAgentLoading || !currentMessage.trim()}
                    className="px-6"
                  >
                    {isAgentLoading ? (
                      "..."
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cashflow;
