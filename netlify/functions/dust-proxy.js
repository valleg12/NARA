const { DustAPI } = require("@dust-tt/client");

const workspaceId = "Z1YDH1d9W9";
const agentId = "QCOi8N1dOp";
const apiKey = process.env.DUST_API_KEY ?? "sk-bf49d6cbdca92c3c0498c86047ec1608";

const dustAPI = new DustAPI(
  { url: "https://eu.dust.tt" },
  {
    workspaceId,
    apiKey,
  },
  console
);

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const payload = JSON.parse(event.body ?? "{}");
    const { message, username, email, fullName, fileIds, conversationId } = payload;

    // S'assurer que message est une string non vide
    const cleanMessage = message ? String(message).trim() : "";
    if (cleanMessage.length === 0 && (!fileIds || fileIds.length === 0)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Le champ message est requis ou un fichier doit être fourni." }),
      };
    }
    
    // Si message est vide mais qu'on a un fichier, utiliser un message par défaut
    const finalMessage = cleanMessage.length > 0 ? cleanMessage : "Analyse ce document";

    // Construire contentFragments au format exact attendu par Dust (tableau d'objets avec fileId)
    const hasFiles = Array.isArray(fileIds) && fileIds.length > 0;
    let contentFragments = [];
    if (hasFiles) {
      contentFragments = fileIds
        .map((id) => {
          // S'assurer que c'est une string
          let cleanId = id;
          if (typeof cleanId === "object" && cleanId !== null) {
            cleanId = cleanId.id ?? cleanId.sId ?? cleanId.fileId ?? null;
          }
          return cleanId ? String(cleanId).trim() : null;
        })
        .filter((id) => id !== null && id.length > 0)
        .map((fileId) => {
          // S'assurer que fileId est bien une string dans l'objet
          const cleanFileId = String(fileId).trim();
          return { fileId: cleanFileId };
        });
      
      console.log("📎 FileIds reçus (raw):", JSON.stringify(fileIds, null, 2));
      console.log("✅ FileIds nettoyés:", contentFragments.map(f => f.fileId));
      console.log("📦 contentFragments créé:", JSON.stringify(contentFragments, null, 2));
      
      // Validation : chaque élément doit être un objet avec fileId (string)
      const isValid = contentFragments.every(
        (frag) => typeof frag === "object" && typeof frag.fileId === "string" && frag.fileId.length > 0
      );
      if (!isValid) {
        console.error("❌ Format contentFragments invalide:", contentFragments);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Format fileIds invalide" }),
        };
      }
    }

    // Construire le message payload (DOIT être un objet, pas une string)
    // IMPORTANT: contentFragments doit être au niveau du payload principal, PAS dans message
    const messagePayload = {
      content: finalMessage, // Message final (non vide)
      mentions: [{ configurationId: String(agentId) }], // S'assurer que configurationId est une string
      context: {
        username: String(username ?? "Utilisateur"),
        timezone: "Europe/Paris",
        email: email ? String(email) : null,
        fullName: fullName ? String(fullName) : null,
        origin: "api",
      },
    };
    
    // Validation que tous les champs requis sont présents
    if (!messagePayload.content || !messagePayload.mentions || !messagePayload.context) {
      console.error("❌ Message payload incomplet:", messagePayload);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Erreur interne: message payload incomplet" }),
      };
    }
    
    console.log("📝 Message payload construit:", JSON.stringify(messagePayload, null, 2));

    // Si on a une conversation existante, ajouter un message à cette conversation
    if (conversationId && typeof conversationId === "string" && conversationId.trim().length > 0) {
      console.log("💬 Réponse à conversation existante:", conversationId);
      
      // Pour les messages dans une conversation existante, contentFragments va au niveau du payload principal
      const messageRequestPayload = {
        message: messagePayload, // Objet message (sans contentFragments)
        ...(hasFiles && contentFragments.length > 0 && { 
          contentFragments: contentFragments // Au niveau du payload principal
        }),
        blocking: true,
      };
      
      // Validation finale
      if (!messageRequestPayload.message || !messageRequestPayload.message.content) {
        console.error("❌ Message payload invalide pour réponse:", messageRequestPayload);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Erreur interne: message payload invalide" }),
        };
      }
      
      console.log("📤 Payload message (conversation existante):", JSON.stringify(messageRequestPayload, null, 2));
      
      const response = await fetch(
        `https://eu.dust.tt/api/v1/w/${workspaceId}/assistant/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(messageRequestPayload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { raw: errorText };
        }
        
        console.error("❌ Erreur Dust API REST (message) (status:", response.status, "):");
        console.error("Body:", errorText);
        console.error("Parsed:", JSON.stringify(errorData, null, 2));
        
        return {
          statusCode: response.status,
          body: JSON.stringify({
            error: errorData.error?.message ?? errorData.message ?? errorText,
            details: errorData,
          }),
        };
      }

      const data = await response.json();
      console.log("✅ Réponse Dust API REST (message):", JSON.stringify(data, null, 2));

      const conversation = data.conversation;
      const agentMessages = conversation.content
        ?.flat()
        ?.filter((msg) => msg.type === "agent_message")
        ?.map((msg) => extractText(msg?.content))
        ?.filter((text) => typeof text === "string" && text.trim().length > 0) ?? [];

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: agentMessages.at(-1) ?? "",
          conversationId: conversation.sId,
        }),
      };
    }

    // Sinon, créer une nouvelle conversation
    // Si on a des fichiers, utiliser l'API REST directe (le SDK peut avoir des problèmes avec contentFragments)
    if (hasFiles && contentFragments.length > 0) {
      // Construire le payload final - contentFragments au niveau du payload principal
      const payload = {
        message: messagePayload, // Objet message (sans contentFragments)
        contentFragments: contentFragments, // Au niveau du payload principal
        visibility: "unlisted",
        blocking: true, // true = réponse synchrone (plus simple pour MVP), false = asynchrone (nécessite polling/webhook)
      };

      // Validation finale
      if (!Array.isArray(payload.contentFragments)) {
        console.error("❌ contentFragments n'est pas un tableau:", payload);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Erreur interne: format contentFragments invalide" }),
        };
      }
      
      payload.contentFragments.forEach((frag, idx) => {
        if (typeof frag !== "object" || typeof frag.fileId !== "string") {
          console.error(`❌ contentFragments[${idx}] invalide:`, frag);
        }
      });

      console.log("📤 Payload envoyé à Dust API REST:", JSON.stringify(payload, null, 2));

      const response = await fetch(
        `https://eu.dust.tt/api/v1/w/${workspaceId}/assistant/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { raw: errorText };
        }
        
        console.error("❌ Erreur Dust API REST (status:", response.status, "):");
        console.error("Headers:", JSON.stringify([...response.headers.entries()], null, 2));
        console.error("Body:", errorText);
        console.error("Parsed:", JSON.stringify(errorData, null, 2));
        
        return {
          statusCode: response.status,
          body: JSON.stringify({
            error: errorData.error?.message ?? errorData.message ?? errorText,
            details: errorData,
          }),
        };
      }

      const data = await response.json();
      console.log("✅ Réponse Dust API REST:", JSON.stringify(data, null, 2));

      // Extraire la réponse de l'agent depuis la conversation
      const conversation = data.conversation;
      const agentMessages = conversation.content
        ?.flat()
        ?.filter((msg) => msg.type === "agent_message")
        ?.map((msg) => extractText(msg?.content))
        ?.filter((text) => typeof text === "string" && text.trim().length > 0) ?? [];

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: agentMessages.at(-1) ?? "",
          conversationId: conversation.sId,
        }),
      };
    }

    // Sinon, utiliser le SDK (pour les conversations sans fichier)
    const conversationPayload = {
      title: null,
      visibility: "unlisted",
      message: {
        content: message,
        mentions: [{ configurationId: agentId }],
        context: {
          timezone: "Europe/Paris",
          username: username ?? "Utilisateur",
          email: email ?? null,
          fullName: fullName ?? null,
          origin: "api",
        },
      },
      blocking: true,
    };

    const conversationResult = await dustAPI.createConversation(conversationPayload);

    if (conversationResult.isErr()) {
      console.error("Dust createConversation error", conversationResult.error);
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: conversationResult.error.message,
        }),
      };
    }

    const { conversation } = conversationResult.value;
    const agentMessages = conversation.content
      .flat()
      .filter((msg) => msg.type === "agent_message")
      .map((msg) => extractText(msg?.content))
      .filter((text) => typeof text === "string" && text.trim().length > 0);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: agentMessages.at(-1) ?? "",
        conversationId: conversation.sId,
      }),
    };
  } catch (error) {
    console.error("Erreur Dust proxy SDK:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message ?? "Erreur inconnue" }),
    };
  }
};

/**
 * Essaie d'extraire une chaîne de caractères depuis les structures de contenu Dust.
 */
function extractText(content) {
  if (!content) {
    return "";
  }

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => extractText(item))
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  if (typeof content === "object") {
    if (typeof content.text === "string") {
      return content.text;
    }
    if (typeof content.content === "string") {
      return content.content;
    }
    if (Array.isArray(content.content)) {
      return extractText(content.content);
    }
    if (Array.isArray(content.parts)) {
      return extractText(content.parts);
    }
    if (typeof content.value === "string") {
      return content.value;
    }
  }

  return "";
}

