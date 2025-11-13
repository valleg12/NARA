# Configuration N8N pour traitement des contrats

## 📋 Informations du webhook

### URL du webhook Netlify
```
https://votre-site.netlify.app/.netlify/functions/contract-webhook
```

**OU** si vous avez un domaine personnalisé :
```
https://votre-domaine.com/.netlify/functions/contract-webhook
```

### Format de la requête

Le webhook reçoit une requête `POST` avec le body suivant :

```json
{
  "fileName": "contrat-exemple.pdf",
  "fileType": "application/pdf",
  "fileBase64": "JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PC9MZW5ndGggNDAgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAw..."
}
```

### Réponse du webhook

**Succès (200)** :
```json
{
  "success": true,
  "contractId": "contract_1234567890_abc123",
  "fileName": "contrat-exemple.pdf",
  "status": "processing",
  "message": "Contrat reçu, en cours de traitement par N8N..."
}
```

**Erreur (400/500)** :
```json
{
  "error": "Message d'erreur"
}
```

---

## 🔧 Configuration N8N

### Workflow recommandé

1. **Trigger : Webhook** (recevoir le PDF)
   - URL : `https://votre-site.netlify.app/.netlify/functions/contract-webhook`
   - Method : `POST`
   - Response Mode : `When Last Node Finishes`
   - Response Code : `200`

2. **Extraction du PDF**
   - Node : `Extract From File` ou `PDF Parser`
   - Input : `{{ $json.body.fileBase64 }}` (décoder base64)
   - Output : Texte brut du PDF

3. **Analyse avec IA** (optionnel)
   - Node : `OpenAI` ou `HTTP Request` vers votre API Dust
   - Prompt : "Analyse ce contrat et extrait les clauses importantes, risques, et recommandations"
   - Input : Texte extrait du PDF

4. **Stockage dans Supabase**
   - Node : `Supabase` → `Insert Row`
   - Table : `contracts` (voir structure ci-dessous)
   - Data :
     ```json
     {
       "contract_id": "{{ $json.body.contractId }}",
       "file_name": "{{ $json.body.fileName }}",
       "status": "analyzed",
       "summary": "{{ $json.ai_analysis }}",
       "raw_text": "{{ $json.extracted_text }}",
       "created_at": "{{ $now }}"
     }
     ```

5. **Notification** (optionnel)
   - Node : `Email` ou `Slack` ou `HTTP Request` vers votre frontend
   - Message : "Contrat {{ $json.body.fileName }} analysé avec succès"

---

## 🗄️ Structure Supabase recommandée

### Table `contracts`

```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id TEXT UNIQUE NOT NULL, -- ID retourné par le webhook
  file_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing', -- processing, analyzed, error
  summary TEXT, -- Résumé généré par l'IA
  raw_text TEXT, -- Texte brut extrait du PDF
  analysis JSONB, -- Analyse détaillée (clauses, risques, etc.)
  user_id UUID REFERENCES auth.users(id), -- Si vous avez l'auth
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_contracts_contract_id ON contracts(contract_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_created_at ON contracts(created_at DESC);
```

### Table `contract_alerts` (optionnel)

```sql
CREATE TABLE contract_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES contracts(id),
  alert_type TEXT NOT NULL, -- critical, warning, info
  message TEXT NOT NULL,
  clause_reference TEXT, -- Référence à la clause concernée
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 📝 Exemple de workflow N8N complet

```
1. Webhook Trigger
   ↓
2. Decode Base64 → Convertir en fichier PDF
   ↓
3. Extract Text from PDF → Extraire le texte
   ↓
4. OpenAI Node → Analyser le contrat
   Prompt: "Analyse ce contrat d'influenceur et identifie:
   - Les clauses problématiques
   - Les risques juridiques
   - Les recommandations
   Format: JSON avec {risks: [], recommendations: [], summary: ''}"
   ↓
5. Supabase Insert → Stocker dans la table contracts
   ↓
6. HTTP Request → Notifier le frontend (optionnel)
   POST https://votre-site.netlify.app/.netlify/functions/contract-notification
   Body: {contractId, status: 'analyzed', summary}
```

---

## 🔐 Variables d'environnement N8N

Ajoutez dans les credentials N8N :

- `SUPABASE_URL` : URL de votre projet Supabase
- `SUPABASE_KEY` : Clé API Supabase (service_role pour insert)
- `OPENAI_API_KEY` : Si vous utilisez OpenAI pour l'analyse
- `DUST_API_KEY` : Si vous utilisez Dust pour l'analyse

---

## 🚀 Test du webhook

Vous pouvez tester avec curl :

```bash
# Convertir un PDF en base64
FILE_BASE64=$(base64 -i contrat-test.pdf)

# Envoyer au webhook
curl -X POST https://votre-site.netlify.app/.netlify/functions/contract-webhook \
  -H "Content-Type: application/json" \
  -d "{
    \"fileName\": \"contrat-test.pdf\",
    \"fileType\": \"application/pdf\",
    \"fileBase64\": \"$FILE_BASE64\"
  }"
```

---

## 📊 Retour vers le frontend

Une fois le traitement terminé, N8N peut :

1. **Mettre à jour Supabase** → Le frontend peut poller ou utiliser Supabase Realtime
2. **Appeler un webhook de notification** → Créer une fonction Netlify qui notifie le frontend
3. **WebSocket** → Pour les notifications en temps réel (plus complexe)

**Recommandation** : Utiliser Supabase Realtime pour que le frontend soit notifié automatiquement quand un contrat est analysé.

