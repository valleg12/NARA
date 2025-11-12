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

    if (Array.isArray(fileIds) && fileIds.length > 0) {
      context.files = fileIds.map((id) => ({ fileId: id }));
    }

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
        visibility: "unlisted",
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
    const conversationId =
      conversationData.conversation?.sId ??
      conversationData.conversation?.id ??
      conversationData.message?.conversation_id;

    if (!conversationId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Impossible de récupérer l'identifiant de conversation." }),
      };
    }

    const eventsResponse = await fetch(
      `https://eu.dust.tt/api/v1/w/${workspaceId}/assistant/conversations/${conversationId}/events`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${dustApiKey}`,
          Accept: "text/event-stream",
        },
      }
    );

    if (!eventsResponse.ok || !eventsResponse.body) {
      const errorText = await eventsResponse.text();
      return {
        statusCode: eventsResponse.status,
        body: errorText,
      };
    }

    const reader = eventsResponse.body.getReader();
    const decoder = new TextDecoder();
    let aggregatedTokens = "";
    let finalResponse = null;
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const segments = buffer.split("\n\n");
      buffer = segments.pop() ?? "";

      for (const segment of segments) {
        const lines = segment.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (!data || data === "[DONE]") {
            continue;
          }

          try {
            const event = JSON.parse(data);
            if (event.type === "generation_tokens" && event.classification === "tokens" && event.text) {
              aggregatedTokens += event.text;
            }

            if (event.type === "agent_message_success" && event.message) {
              if (typeof event.message.content === "string") {
                finalResponse = event.message.content;
              } else if (Array.isArray(event.message.content)) {
                finalResponse = event.message.content
                  .map((block) => (typeof block === "string" ? block : block.text ?? ""))
                  .join("\n")
                  .trim();
              }
            }

            if (
              event.type === "agent_error" ||
              event.type === "user_message_error" ||
              event.type === "error"
            ) {
              const errorMessage =
                event.error?.message ??
                event.message ??
                "Erreur lors de l'exécution de l'agent Dust.";
              throw new Error(errorMessage);
            }
          } catch (parseError) {
            console.error("Erreur de parsing SSE Dust:", parseError);
          }
        }
      }

      if (finalResponse) {
        await reader.cancel().catch(() => {});
        break;
      }
    }

    const responsePayload = finalResponse ?? aggregatedTokens;

    if (!responsePayload) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Aucune réponse de l'agent Dust n'a été reçue." }),
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

