const { DustAPI } = require("@dust-tt/client");

const workspaceId = "Z1YDH1d9W9";
const agentId = "4WCrFBWWVR"; // Agent Cashflow
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

    if (typeof message !== "string" || message.trim().length === 0) {
      // Si le message est vide, mais qu'il y a des fichiers, on peut le laisser passer
      // L'agent Dust peut parfois répondre uniquement sur la base des fichiers
      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Le champ message est requis si aucun fichier n'est fourni." }),
        };
      }
    }

    // Construire contentFragments au format exact attendu par Dust (tableau d'objets avec fileId)
    const hasFiles = Array.isArray(fileIds) && fileIds.length > 0;
    let contentFragments = [];
    if (hasFiles) {
      contentFragments = fileIds.map((fileId) => ({ fileId: String(fileId) }));
      // Validation supplémentaire pour s'assurer que tous les fileIds sont des strings valides
      if (contentFragments.some(frag => typeof frag.fileId !== "string" || frag.fileId.trim().length === 0)) {
        console.error("❌ Format fileIds invalide:", fileIds);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Format fileIds invalide" }),
        };
      }
    }

    // Construire le message payload (DOIT être un objet, pas une string)
    // Pour les nouvelles conversations, contentFragments va dans message
    // Pour les conversations existantes, contentFragments va au niveau du payload principal
    const messagePayload = {
      content: String(message || ""), // S'assurer que content est une string (même vide)
      mentions: [{ configurationId: String(agentId) }], // S'assurer que configurationId est une string
      ...(hasFiles && contentFragments.length > 0 && {
        contentFragments: contentFragments // DANS message pour nouvelles conversations
      }),
      context: {
        username: String(username ?? "Utilisateur"),
        timezone: "Europe/Paris",
        email: email ? String(email) : null,
        fullName: fullName ? String(fullName) : null,
        origin: "api",
      },
    };

    console.log("📝 Message payload construit:", JSON.stringify(messagePayload, null, 2));

    // Si on a une conversation existante, ajouter un message à cette conversation
    if (conversationId && typeof conversationId === "string" && conversationId.trim().length > 0) {
      console.log("💬 Réponse à conversation existante:", conversationId);

      // Pour les messages dans une conversation existante, contentFragments doit être DANS message, pas au niveau principal
      // Créer un nouveau messagePayload sans contentFragments dans message (on l'ajoutera au payload principal)
      const messageForExistingConv = {
        content: String(message || ""),
        mentions: [{ configurationId: String(agentId) }],
        context: {
          username: String(username ?? "Utilisateur"),
          timezone: "Europe/Paris",
          email: email ? String(email) : null,
          fullName: fullName ? String(fullName) : null,
          origin: "api",
        },
      };

      const messageRequestPayload = {
        message: messageForExistingConv, // Message SANS contentFragments
        ...(hasFiles && contentFragments.length > 0 && {
          contentFragments: contentFragments // Au niveau du payload principal pour conversations existantes
        }),
        blocking: true, // true = synchrone (on attend la réponse)
      };

      // Validation
      if (hasFiles && contentFragments.length > 0) {
        if (!Array.isArray(messageRequestPayload.contentFragments)) {
          console.error("❌ contentFragments n'est pas un tableau");
          return {
            statusCode: 500,
            body: JSON.stringify({ error: "Erreur interne: format contentFragments invalide" }),
          };
        }
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
      // Construire le payload final - contentFragments est DÉJÀ dans messagePayload
      const payload = {
        message: messagePayload, // Objet avec contentFragments DÉJÀ inclus dans message
        visibility: "unlisted",
        blocking: true, // true = synchrone (on attend la réponse)
      };

      // Validation finale - contentFragments est dans message
      if (!Array.isArray(payload.message.contentFragments)) {
        console.error("❌ contentFragments n'est pas un tableau dans message:", payload.message);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Erreur interne: format contentFragments invalide" }),
        };
      }

      payload.message.contentFragments.forEach((frag, idx) => {
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

    const conversation = conversationResult.value.conversation;
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
  } catch (error) {
    console.error("Erreur Dust proxy:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message ?? "Erreur inconnue" }),
    };
  }
};

function extractText(content) {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content.map(extractText).join("");
  }
  if (typeof content === "object" && content !== null && "text" in content) {
    return content.text;
  }
  return "";
}

