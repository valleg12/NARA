import * as pdfjsLib from 'pdfjs-dist';

// Configuration pour le worker PDF.js (utilise le CDN pour compatibilité)
// Alternative: copier pdf.worker.min.js dans public/ et utiliser '/pdf.worker.min.js'
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extrait le texte d'un fichier PDF
 * @param file - Le fichier PDF à analyser
 * @returns Le texte extrait du PDF
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Convertir le fichier en ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Charger le document PDF
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Parcourir toutes les pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Extraire le texte de chaque page
      const pageText = textContent.items
        .map((item: any) => {
          // Certains items peuvent être des objets avec une propriété 'str'
          return typeof item === 'string' ? item : item.str || '';
        })
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Erreur lors de l\'extraction du texte PDF:', error);
    throw new Error(
      error instanceof Error 
        ? `Impossible d'extraire le texte du PDF: ${error.message}`
        : 'Impossible d\'extraire le texte du PDF. Le fichier est peut-être corrompu ou protégé.'
    );
  }
}

