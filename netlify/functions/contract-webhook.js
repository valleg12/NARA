/**
 * Webhook pour recevoir les PDFs de contrats depuis le frontend
 * Le PDF sera ensuite traité par N8N qui renverra le résumé
 */

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Parser le body (peut être JSON avec base64 ou FormData)
    let fileName, fileBase64, fileType;
    
    if (event.headers["content-type"]?.includes("application/json")) {
      const payload = JSON.parse(event.body ?? "{}");
      fileName = payload.fileName;
      fileBase64 = payload.fileBase64;
      fileType = payload.fileType || "application/pdf";
    } else {
      // Si FormData, on retourne une erreur (on attend JSON)
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

    // Extraire le base64 pur
    const base64Data = fileBase64.includes(",") 
      ? fileBase64.split(",")[1] 
      : fileBase64;

    // Créer un ID unique pour ce contrat
    const contractId = `contract_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const status = "processing"; // En attente de traitement par N8N

    // TODO: Stocker dans Supabase (sera fait par N8N aussi, mais on peut pré-créer l'entrée)
    // Pour l'instant, on retourne juste un succès avec l'ID

    console.log("📤 Contrat reçu:", { contractId, fileName, size: base64Data.length });

    // Retourner l'ID du contrat et le statut
    // N8N va recevoir ce webhook et traiter le PDF
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        contractId: contractId,
        fileName: fileName,
        status: status,
        message: "Contrat reçu, en cours de traitement par N8N...",
      }),
    };
  } catch (error) {
    console.error("Erreur webhook contrat:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message ?? "Erreur inconnue" }),
    };
  }
};

