import { Buffer } from "node:buffer";
import FormData from "form-data";
import fetch from "node-fetch";

const workspaceId = "Z1YDH1d9W9";
const apiKey = process.env.DUST_API_KEY ?? "sk-bf49d6cbdca92c3c0498c86047ec1608";

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const payload = JSON.parse(event.body ?? "{}");
    const { fileName, fileType = "application/pdf", fileBase64 } = payload;

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

    // Créer FormData avec form-data package (compatible Node.js)
    const formData = new FormData();
    formData.append("file", fileBuffer, {
      filename: fileName,
      contentType: fileType,
    });

    const response = await fetch(`https://eu.dust.tt/api/v1/w/${workspaceId}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        // Ne pas mettre Content-Type, form-data le gère automatiquement via getHeaders()
        ...formData.getHeaders(),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur upload Dust:", data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error?.message ?? JSON.stringify(data) }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        fileId: data.file?.id ?? data.file?.sId ?? data.id,
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

