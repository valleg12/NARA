type DustAgentPayload = {
  message: string;
  username?: string;
  email?: string | null;
  fullName?: string | null;
  fileIds?: string[];
  conversationId?: string; // Pour répondre à une conversation existante
};

type DustAgentResponse = {
  message?: string;
  actions?: unknown[];
  conversationId?: string;
  error?: string;
};

class DustService {
  private proxyUrl: string;
  private cashflowProxyUrl: string;
  private uploadProxyUrl: string;

  constructor() {
    this.proxyUrl = import.meta.env.VITE_DUST_PROXY_URL ?? "/.netlify/functions/dust-proxy";
    this.cashflowProxyUrl = import.meta.env.VITE_DUST_CASHFLOW_PROXY_URL ?? "/.netlify/functions/dust-proxy-cashflow";
    this.uploadProxyUrl = import.meta.env.VITE_DUST_UPLOAD_URL ?? "/.netlify/functions/dust-upload";
  }

  async callAgent(payload: DustAgentPayload): Promise<DustAgentResponse> {
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
      throw new Error(normalizeError(data, "Erreur Dust API"));
    }

    return data;
  }

  async callCashflowAgent(payload: DustAgentPayload): Promise<DustAgentResponse> {
    const response = await fetch(this.cashflowProxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let data: DustAgentResponse;
    try {
      data = (await response.json()) as DustAgentResponse;
    } catch {
      throw new Error("Réponse invalide de l'agent Dust Cashflow");
    }

    if (!response.ok) {
      throw new Error(normalizeError(data, "Erreur Dust API Cashflow"));
    }

    return data;
  }

  async uploadFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const fileBase64 = this.arrayBufferToBase64(arrayBuffer);

    const response = await fetch(this.uploadProxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type || "application/pdf",
        fileBase64,
      }),
    });

    const data = (await response.json()) as { fileId?: string; error?: string };

    if (!response.ok || !data.fileId) {
      throw new Error(normalizeError(data, "Erreur lors du téléversement du document"));
    }

    // S'assurer que fileId est bien une string
    const fileId = String(data.fileId).trim();
    if (!fileId || fileId.length === 0) {
      throw new Error("fileId invalide retourné par le serveur");
    }

    return fileId;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    return btoa(binary);
  }
}

function normalizeError(
  data: unknown,
  fallback: string
): string {
  if (!data) {
    return fallback;
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data === "object") {
    const maybeError = (data as { error?: unknown }).error;
    if (typeof maybeError === "string") {
      return maybeError;
    }
    if (typeof maybeError === "object" && maybeError) {
      const message = (maybeError as { message?: unknown }).message;
      if (typeof message === "string") {
        return message;
      }
      return JSON.stringify(maybeError);
    }
    return JSON.stringify(data);
  }

  return fallback;
}

export default new DustService();

