/**
 * Service pour uploader des contrats vers N8N via webhook
 */

class ContractService {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = import.meta.env.VITE_CONTRACT_WEBHOOK_URL ?? "/.netlify/functions/contract-webhook";
  }

  async uploadContract(file: File): Promise<{ contractId: string; fileName: string; status: string }> {
    // Convertir le fichier en base64
    const arrayBuffer = await file.arrayBuffer();
    const fileBase64 = this.arrayBufferToBase64(arrayBuffer);

    const response = await fetch(this.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type || "application/pdf",
        fileBase64,
      }),
    });

    const data = (await response.json()) as {
      success?: boolean;
      contractId?: string;
      fileName?: string;
      status?: string;
      error?: string;
    };

    if (!response.ok || !data.success || !data.contractId) {
      throw new Error(data.error ?? "Erreur lors de l'upload du contrat");
    }

    return {
      contractId: data.contractId,
      fileName: data.fileName ?? file.name,
      status: data.status ?? "processing",
    };
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

export default new ContractService();

