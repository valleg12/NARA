import { DustAPI } from "@dust-tt/client";

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
    const { message, username, email, fullName, conversationId } = payload;

    if (typeof message !== "string" || message.trim().length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Le champ message est requis." }),
      };
    }

    // Construire le message payload (texte uniquement, plus de fileIds)
    const messagePayload = {
      content: message,
      mentions: [{ configurationId: agentId }],
      context: {
        username: username ?? "Utilisateur",
        timezone: "Europe/Paris",
        email: email ?? null,
        fullName: fullName ?? null,
        origin: "api",
      },
    };

    // Si on a une conversation existante, ajouter un message à cette conversation
    if (conversationId && typeof conversationId === "string" && conversationId.trim().length > 0) {
      console.log("💬 Réponse à conversation existante:", conversationId);
      
      const messageRequestPayload = {
        message: messagePayload,
        blocking: true,
      };
      
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
        const errorData = await response.json();
        console.error("❌ Erreur Dust API REST (message):", errorData);
        return {
          statusCode: response.status,
          body: JSON.stringify({
            error: errorData.error?.message ?? JSON.stringify(errorData),
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

    // Sinon, créer une nouvelle conversation (texte uniquement)
    const payload = {
      message: messagePayload,
      visibility: "unlisted",
      blocking: true,
    };

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
      const errorData = await response.json();
      console.error("❌ Erreur Dust API REST:", errorData);
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: errorData.error?.message ?? JSON.stringify(errorData),
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
  } catch (error) {
    console.error("Erreur Dust proxy:", error);
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

