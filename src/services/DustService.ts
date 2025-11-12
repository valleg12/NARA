type DustAgentPayload = {
  message: string;
  username?: string;
  email?: string | null;
  fullName?: string | null;
};

type DustAgentResponse = {
  conversation?: {
    content?: Array<Array<{ content?: string }>>;
  };
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

    const data = (await response.json()) as DustAgentResponse;

    if (!response.ok) {
      throw new Error(data.error ?? "Erreur Dust API");
    }

    const content = data.conversation?.content?.[1]?.[0]?.content;
    if (content) {
      return content;
    }

    return JSON.stringify(data);
  }
}

export default new DustService();

