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
    const { message, username, email, fullName } = payload;

    if (typeof message !== "string" || message.trim().length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Le champ message est requis." }),
      };
    }

    const conversationResult = await dustAPI.createConversation({
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
    });

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

