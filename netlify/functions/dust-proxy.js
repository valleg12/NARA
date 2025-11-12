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

    const dustPayload = {
      message: {
        content: message,
        mentions: [{ configurationId: agentId }],
        context: {
          timezone: "Europe/Paris",
          username: username ?? "Utilisateur",
          email: email ?? null,
          fullName: fullName ?? null,
        },
        ...(Array.isArray(fileIds) && fileIds.length > 0 ? { file_ids: fileIds } : {}),
      },
      blocking: true,
    };

    const response = await fetch(dustUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${dustApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dustPayload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: responseText,
      };
    }

    return {
      statusCode: 200,
      body: responseText,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

