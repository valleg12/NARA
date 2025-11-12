exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const dustApiKey = process.env.DUST_API_KEY ?? "sk-bf49d6cbdca92c3c0498c86047ec1608";
  const workspaceId = "Z1YDH1d9W9";
  const agentId = "YX4V29pLKw";

  const dustUrl = `https://eu.dust.tt/api/v1/w/${workspaceId}/assistant/conversations`;

  try {
    const payload = JSON.parse(event.body ?? "{}");
    const { message, username, email, fullName, fileIds } = payload;

    if (!message || typeof message !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Le champ message est requis." }),
      };
    }

    const context = {
      timezone: "Europe/Paris",
      username: username ?? "Utilisateur",
      email: email ?? null,
      fullName: fullName ?? null,
      origin: "api",
    };

    const contentFragments =
      Array.isArray(fileIds) && fileIds.length > 0
        ? fileIds.map((id) => ({ fileId: id }))
        : [];

    const conversationResponse = await fetch(dustUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${dustApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          content: message,
          mentions: [{ configurationId: agentId }],
          context,
        },
        contentFragments,
        visibility: "unlisted",
        blocking: true,
      }),
    });

    if (!conversationResponse.ok) {
      const errorText = await conversationResponse.text();
      return {
        statusCode: conversationResponse.status,
        body: errorText,
      };
    }

    const conversationData = await conversationResponse.json();
    const conversationContent = conversationData.conversation?.content;

    if (!conversationContent) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Impossible de récupérer le contenu de la conversation Dust.",
        }),
      };
    }

    const flatMessages = conversationContent.flat();
    const agentMessages = flatMessages.filter((msg) => msg.type === "agent_message");
    const lastAgentMessage = agentMessages.at(-1);

    let responsePayload = "";
    if (lastAgentMessage) {
      if (typeof lastAgentMessage.content === "string") {
        responsePayload = lastAgentMessage.content;
      } else if (Array.isArray(lastAgentMessage.content)) {
        responsePayload = lastAgentMessage.content
          .map((block) => {
            if (!block) return "";
            if (typeof block === "string") return block;
            if (typeof block.text === "string") return block.text;
            if (typeof block.content === "string") return block.content;
            return "";
          })
          .join("\n")
          .trim();
      }
    }

    if (!responsePayload) {
      const conversationId =
        conversationData.conversation?.sId ??
        conversationData.conversation?.id ??
        conversationData.message?.conversation_id;

      return {
        statusCode: 502,
        body: JSON.stringify({
          error: "Aucune réponse agent reçue.",
          conversationId,
          rawConversation: conversationContent,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: responsePayload }),
    };
  } catch (error) {
    console.error("Erreur Dust proxy:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message ?? "Erreur inconnue" }),
    };
  }
};

