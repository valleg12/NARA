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
  let testPdfPath = process.argv[2] || "./test.pdf";
  
  if (!fs.existsSync(testPdfPath)) {
    console.log("⚠️  Fichier de test non trouvé:", testPdfPath);
    console.log("📝 Création d'un PDF de test minimal...\n");
    
    // Créer un PDF minimal valide (format PDF simple)
    // Header PDF + un objet minimal
    const minimalPdf = Buffer.from(
      "%PDF-1.4\n" +
      "1 0 obj\n" +
      "<< /Type /Catalog /Pages 2 0 R >>\n" +
      "endobj\n" +
      "2 0 obj\n" +
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n" +
      "endobj\n" +
      "3 0 obj\n" +
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>\n" +
      "endobj\n" +
      "4 0 obj\n" +
      "<< /Length 44 >>\n" +
      "stream\n" +
      "BT /F1 12 Tf 100 700 Td (Test PDF for Dust API) Tj ET\n" +
      "endstream\n" +
      "endobj\n" +
      "xref\n" +
      "0 5\n" +
      "0000000000 65535 f \n" +
      "0000000009 00000 n \n" +
      "0000000058 00000 n \n" +
      "0000000115 00000 n \n" +
      "0000000306 00000 n \n" +
      "trailer\n" +
      "<< /Size 5 /Root 1 0 R >>\n" +
      "startxref\n" +
      "400\n" +
      "%%EOF"
    );
    
    fs.writeFileSync(testPdfPath, minimalPdf);
    console.log("✅ PDF de test créé:", testPdfPath, `(${minimalPdf.length} bytes)\n`);
  }
  
  const fileBuffer = fs.readFileSync(testPdfPath);
  const fileName = testPdfPath.split("/").pop();
  
  console.log(`📄 Fichier: ${fileName} (${fileBuffer.length} bytes)\n`);
  
  // Tester différentes méthodes d'upload
  console.log("📤 Test upload - Méthode 1: FormData standard...\n");
  
  const formData = new FormData();
  formData.append("file", fileBuffer, {
    filename: fileName,
    contentType: "application/pdf",
  });
  
  try {
    let uploadResponse = await fetch(`https://eu.dust.tt/api/v1/w/${workspaceId}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });
    
    let uploadData = await uploadResponse.json();
    console.log("📥 Réponse (FormData):", JSON.stringify(uploadData, null, 2));
    
    if (!uploadResponse.ok) {
      console.log("\n📤 Test upload - Méthode 2: FormData avec champ 'data'...\n");
      
      const formData2 = new FormData();
      formData2.append("data", fileBuffer, {
        filename: fileName,
        contentType: "application/pdf",
      });
      
      uploadResponse = await fetch(`https://eu.dust.tt/api/v1/w/${workspaceId}/files`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          ...formData2.getHeaders(),
        },
        body: formData2,
      });
      
      uploadData = await uploadResponse.json();
      console.log("📥 Réponse (FormData 'data'):", JSON.stringify(uploadData, null, 2));
    }
    
    if (!uploadResponse.ok) {
      console.log("\n📤 Test upload - Méthode 3: JSON avec format Dust API...\n");
      
      const base64 = fileBuffer.toString('base64');
      const payload = {
        fileName: fileName,
        fileSize: fileBuffer.length,
        contentType: "application/pdf",
        useCase: "conversation",
        file: base64, // Le fichier en base64
      };
      
      console.log("📤 Payload JSON:", JSON.stringify({ ...payload, file: "[base64...]" }, null, 2));
      
      uploadResponse = await fetch(`https://eu.dust.tt/api/v1/w/${workspaceId}/files`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      uploadData = await uploadResponse.json();
      console.log("📥 Réponse (JSON format Dust):", JSON.stringify(uploadData, null, 2));
    }
    
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

