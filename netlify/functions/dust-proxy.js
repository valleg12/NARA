const { DustAPI } = require("@dust-tt/client");

const workspaceId = "Z1YDH1d9W9";
const agentId = "YX4V29pLKw";
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
    });

    if (conversationResult.isErr()) {
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: conversationResult.error.message,
        }),
      };
    }

    const { conversation, message: createdMessage } = conversationResult.value;

    const streamResult = await dustAPI.streamAgentAnswerEvents({
      conversation,
      userMessageId: createdMessage.sId,
    });

    if (streamResult.isErr()) {
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: streamResult.error.message,
        }),
      };
    }

    const { eventStream } = streamResult.value;
    let answer = "";
    const actions = [];

    for await (const event of eventStream) {
      if (!event) continue;

      if (event.type === "agent_error" || event.type === "user_message_error") {
        throw new Error(event.error?.message ?? "Erreur Dust");
      }

      if (event.type === "agent_action_success") {
        actions.push(event.action);
      }

      if (event.type === "generation_tokens" && event.classification === "tokens" && event.text) {
        answer += event.text;
      }

      if (event.type === "agent_message_success") {
        answer = typeof event.message.content === "string" ? event.message.content : answer;
      }
    }

    if (!answer) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Réponse vide renvoyée par l'agent Dust." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: answer,
        actions,
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

