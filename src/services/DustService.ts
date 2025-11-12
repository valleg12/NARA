type DustAgentPayload = {
  message: string;
  username?: string;
  email?: string | null;
  fullName?: string | null;
  fileIds?: string[];
};

type DustAgentResponse = {
  message?: string;
  conversation?: {
    content?: Array<Array<{ content?: string }>>;
  };
  error?: string;
};

class DustService {
  private proxyUrl: string;
  private uploadProxyUrl: string;

  constructor() {
    this.proxyUrl = import.meta.env.VITE_DUST_PROXY_URL ?? "/.netlify/functions/dust-proxy";
    this.uploadProxyUrl = import.meta.env.VITE_DUST_UPLOAD_URL ?? "/.netlify/functions/dust-upload";
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
      throw new Error(data.error ?? "Erreur lors du téléversement du document");
    }

    return data.fileId;
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

export default new DustService();

