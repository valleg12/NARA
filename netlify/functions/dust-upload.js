import { Buffer } from "node:buffer";

const workspaceId = "Z1YDH1d9W9";
const apiKey = process.env.DUST_API_KEY ?? "sk-bf49d6cbdca92c3c0498c86047ec1608";

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
    const { fileName, fileType = "application/pdf", fileBase64 } = payload;

    if (!fileBase64 || !fileName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "fileName et fileBase64 sont requis." }),
      };
    }

    const fileBuffer = Buffer.from(fileBase64, "base64");
    const blob = new Blob([fileBuffer], { type: fileType });

    const formData = new FormData();
    formData.append("file", blob, fileName);

    const response = await fetch(`https://eu.dust.tt/api/v1/w/${workspaceId}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify(data),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        fileId: data.file?.id ?? data.file?.sId ?? data.id,
        file: data.file ?? data,
      }),
    };
  } catch (error) {
    console.error("Erreur Dust upload:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message ?? "Erreur inconnue" }),
    };
  }
};

