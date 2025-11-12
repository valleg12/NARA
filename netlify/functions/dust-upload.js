const WORKSPACE_ID = "Z1YDH1d9W9";
const DUST_API_KEY = process.env.DUST_API_KEY ?? "sk-bf49d6cbdca92c3c0498c86047ec1608";

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { fileName, fileType = "application/pdf", fileBase64 } = JSON.parse(event.body ?? "{}");

    if (!fileBase64 || !fileName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "fileName et fileBase64 sont requis" }),
      };
    }

    const fileBuffer = Buffer.from(fileBase64, "base64");
    const blob = new Blob([fileBuffer], { type: fileType });

    const formData = new FormData();
    formData.append("file", blob, fileName);

    const response = await fetch(`https://eu.dust.tt/api/v1/w/${WORKSPACE_ID}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DUST_API_KEY}`,
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
      body: JSON.stringify({ fileId: data.file?.sId ?? data.file?.id, file: data.file }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message ?? "Erreur lors de l'upload du fichier" }),
    };
  }
};

