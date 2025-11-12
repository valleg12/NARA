type DustAgentPayload = {
  message: string;
  username?: string;
  email?: string | null;
  fullName?: string | null;
};

type DustAgentResponse = {
  message?: string;
  actions?: unknown[];
  conversationId?: string;
  error?: string;
};

class DustService {
  private proxyUrl: string;

  constructor() {
    this.proxyUrl = import.meta.env.VITE_DUST_PROXY_URL ?? "/.netlify/functions/dust-proxy";
  }

  async callAgent(payload: DustAgentPayload): Promise<string> {
    const response = await fetch(this.proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let data: DustAgentResponse;
    try {
      data = (await response.json()) as DustAgentResponse;
    } catch {
      throw new Error("Réponse invalide de l'agent Dust");
    }

    if (!response.ok) {
      throw new Error(data.error ?? "Erreur Dust API");
    }

    if (typeof data.message === "string" && data.message.trim().length > 0) {
      return data.message;
    }

    return JSON.stringify(data);
  }
}

export default new DustService();

