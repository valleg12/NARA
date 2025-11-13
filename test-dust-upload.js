/**
 * Script de test local pour vérifier l'upload et l'envoi à Dust
 * Usage: node test-dust-upload.js
 */

import { Buffer } from "node:buffer";
import FormData from "form-data";
import fetch from "node-fetch";
import fs from "fs";

const workspaceId = "Z1YDH1d9W9";
const agentId = "QCOi8N1dOp";
const apiKey = "sk-bf49d6cbdca92c3c0498c86047ec1608";

async function testUpload() {
  console.log("🧪 Test 1: Upload d'un fichier PDF vers Dust\n");
  
  // Créer un PDF de test minimal (ou utiliser un fichier existant)
  const testPdfPath = process.argv[2] || "./test.pdf";
  
  if (!fs.existsSync(testPdfPath)) {
    console.log("❌ Fichier de test non trouvé:", testPdfPath);
    console.log("💡 Créez un fichier test.pdf ou passez le chemin en argument");
    console.log("   Ex: node test-dust-upload.js /path/to/file.pdf\n");
    return null;
  }
  
  const fileBuffer = fs.readFileSync(testPdfPath);
  const fileName = testPdfPath.split("/").pop();
  
  console.log(`📄 Fichier: ${fileName} (${fileBuffer.length} bytes)\n`);
  
  // Créer FormData
  const formData = new FormData();
  formData.append("file", fileBuffer, {
    filename: fileName,
    contentType: "application/pdf",
  });
  
  try {
    console.log("📤 Upload vers Dust...");
    const uploadResponse = await fetch(`https://eu.dust.tt/api/v1/w/${workspaceId}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });
    
    const uploadData = await uploadResponse.json();
    console.log("📥 Réponse upload:", JSON.stringify(uploadData, null, 2));
    
    if (!uploadResponse.ok) {
      console.error("❌ Erreur upload:", uploadData);
      return null;
    }
    
    // Extraire fileId
    let fileId = uploadData.file?.id ?? uploadData.file?.sId ?? uploadData.id;
    if (fileId && typeof fileId === "object") {
      fileId = fileId.id ?? fileId.sId ?? null;
    }
    fileId = fileId ? String(fileId).trim() : null;
    
    console.log(`\n✅ FileId extrait: ${fileId} (type: ${typeof fileId})\n`);
    
    if (!fileId) {
      console.error("❌ Aucun fileId valide");
      return null;
    }
    
    return fileId;
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    return null;
  }
}

async function testConversation(fileId) {
  console.log("\n🧪 Test 2: Création conversation avec PDF\n");
  
  // Construire contentFragments
  const contentFragments = [{ fileId: fileId }];
  
  // Construire message payload
  const messagePayload = {
    content: "Analyse ce document",
    mentions: [{ configurationId: agentId }],
    contentFragments: contentFragments, // DANS message
    context: {
      username: "Test User",
      timezone: "Europe/Paris",
      origin: "api",
    },
  };
  
  const payload = {
    message: messagePayload,
    visibility: "unlisted",
    blocking: true,
  };
  
  console.log("📤 Payload envoyé à Dust:");
  console.log(JSON.stringify(payload, null, 2));
  console.log("\n");
  
  try {
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
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("❌ Erreur Dust API:");
      console.error(JSON.stringify(data, null, 2));
      return false;
    }
    
    console.log("✅ Réponse Dust API:");
    console.log(JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    return false;
  }
}

// Exécuter les tests
async function runTests() {
  console.log("=".repeat(60));
  console.log("TEST LOCAL - Upload PDF et envoi à Dust");
  console.log("=".repeat(60));
  console.log();
  
  const fileId = await testUpload();
  
  if (fileId) {
    await testConversation(fileId);
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("Tests terminés");
  console.log("=".repeat(60));
}

runTests().catch(console.error);

