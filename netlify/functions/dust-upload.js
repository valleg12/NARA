const { Buffer } = require("node:buffer");
const fetch = require("node-fetch");

const workspaceId = "Z1YDH1d9W9";
const apiKey = process.env.DUST_API_KEY ?? "sk-bf49d6cbdca92c3c0498c86047ec1608";

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const requestPayload = JSON.parse(event.body ?? "{}");
    const { fileName, fileType = "application/pdf", fileBase64 } = requestPayload;

    if (!fileBase64 || !fileName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "fileName et fileBase64 sont requis." }),
      };
    }

    // Extraire le base64 pur (enlever le préfixe data:application/pdf;base64, si présent)
    const base64Data = fileBase64.includes(",") 
      ? fileBase64.split(",")[1] 
      : fileBase64;
    
    const fileBuffer = Buffer.from(base64Data, "base64");
    const fileSize = fileBuffer.length;

    // L'API Dust attend un format JSON spécifique, pas FormData !
    const payload = {
      fileName: fileName,
      fileSize: fileSize,
      contentType: fileType || "application/pdf",
      useCase: "conversation", // "conversation" ou "upsert_table"
      file: base64Data, // Le fichier en base64 (sans préfixe)
    };

    console.log("📤 Upload vers Dust (JSON):", { 
      fileName, 
      fileType, 
      fileSize,
      useCase: payload.useCase 
    });

    const response = await fetch(`https://eu.dust.tt/api/v1/w/${workspaceId}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("📥 Réponse Dust upload:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("Erreur upload Dust:", data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error?.message ?? JSON.stringify(data) }),
      };
    }

    // Extraire fileId et s'assurer que c'est une string
    let fileId = data.file?.id ?? data.file?.sId ?? data.id;
    
    // Si fileId est un objet, extraire la propriété id ou sId
    if (fileId && typeof fileId === "object") {
      fileId = fileId.id ?? fileId.sId ?? null;
    }
    
    // Forcer en string et nettoyer
    fileId = fileId ? String(fileId).trim() : null;
    
    console.log("✅ FileId extrait (type:", typeof fileId, "):", fileId);

    if (!fileId || fileId.length === 0) {
      console.error("❌ Aucun fileId valide trouvé dans la réponse:", data);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Aucun fileId retourné par Dust" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        fileId: fileId, // Garanti d'être une string
      }),
    };
  } catch (error) {
    console.error("Erreur Dust upload:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message ?? "Erreur inconnue" }),
    };
  }
};

