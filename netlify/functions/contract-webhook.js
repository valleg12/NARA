/**
 * Webhook pour recevoir les PDFs de contrats depuis le frontend
 * Le PDF est ensuite envoyé directement au workflow N8N pour traitement
 */

const fetch = require("node-fetch");

const N8N_WEBHOOK_URL = "https://api.ia2s.app/webhook-test/pdf-to-dust";

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Parser le body (JSON avec base64)
    let fileName, fileBase64, fileType;
    
    if (event.headers["content-type"]?.includes("application/json")) {
      const payload = JSON.parse(event.body ?? "{}");
      fileName = payload.fileName;
      fileBase64 = payload.fileBase64;
      fileType = payload.fileType || "application/pdf";
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Content-Type doit être application/json avec fileName et fileBase64" }),
      };
    }

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

    // Créer un ID unique pour ce contrat
    const contractId = `contract_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    console.log("📤 Contrat reçu:", { contractId, fileName, size: base64Data.length });

    // Envoyer le PDF au workflow N8N
    const n8nPayload = {
      contractId: contractId,
      fileName: fileName,
      fileType: fileType,
      fileBase64: base64Data, // Base64 pur (sans préfixe)
      timestamp: new Date().toISOString(),
    };

    console.log("📤 Envoi à N8N:", { url: N8N_WEBHOOK_URL, contractId, fileName });

    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(n8nPayload),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error("❌ Erreur N8N:", { status: n8nResponse.status, body: errorText });
      
      return {
        statusCode: 502,
        body: JSON.stringify({ 
          error: "Erreur lors de l'envoi à N8N",
          details: errorText,
        }),
      };
    }

    // Récupérer la réponse de N8N (si elle envoie quelque chose)
    let n8nData = null;
    try {
      const responseText = await n8nResponse.text();
      if (responseText) {
        n8nData = JSON.parse(responseText);
      }
    } catch {
      // N8N peut ne pas retourner de JSON, c'est OK
      n8nData = { message: "PDF envoyé à N8N avec succès" };
    }

    console.log("✅ Réponse N8N:", n8nData);

    // Retourner le succès avec l'ID du contrat
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        contractId: contractId,
        fileName: fileName,
        status: "processing",
        message: "Contrat envoyé à N8N, en cours de traitement...",
        n8nResponse: n8nData,
      }),
    };
  } catch (error) {
    console.error("❌ Erreur webhook contrat:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message ?? "Erreur inconnue",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      }),
    };
  }
};

