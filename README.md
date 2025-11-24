# 🎥 YoutubeFeels — Analyse automatique de sentiments des commentaires YouTube

## 📌 Présentation

**YoutubeFeels** est une application complète d’analyse de sentiments appliquée aux commentaires YouTube.  
Elle utilise un pipeline **MLOps de bout en bout** :

- Nettoyage et préparation de données
- Entraînement d’un modèle de Machine Learning (TF-IDF + Logistic Regression)
- Déploiement d’une API FastAPI dans le cloud via Docker & Hugging Face
- Extension Chrome permettant l'analyse en temps réel sur YouTube

Ce projet a été réalisé dans le cadre du module **Virtualisation & Cloud Computing** – ENSAM Rabat.

---

## 🎯 Objectifs

- Évaluer automatiquement l’opinion globale d’une audience YouTube
- Offrir un outil instantané pour créateurs de contenu, analystes et marques
- Démontrer une architecture MLOps propre, modulaire et entièrement déployée

---

## 🧱 Architecture du Système

```text
┌────────────────────────────────────────────┐
│              User YouTube Page            │
│        (Extension Chrome Frontend)        │
└───────────────────▲────────────────────────┘
                    │ Comments (Batch)
                    ▼
┌────────────────────────────────────────────┐
│          FastAPI Backend (Cloud)           │
│    - Endpoint /predict_batch               │
│    - Model Inference (TF-IDF + LR)         │
└───────────────────▲────────────────────────┘
                    │ Predictions
                    ▼
┌────────────────────────────────────────────┐
│          UI Results in Chrome              │
│  - Résultats sentiment par commentaire     │
│  - Scores de confiance                     │
└────────────────────────────────────────────┘
````

---

## 🌐 Déploiement Live

API en ligne disponible via Hugging Face Spaces :

🔗 [https://huggingface.co/spaces/d0senzy/YoutubeFeels](https://huggingface.co/spaces/d0senzy/YoutubeFeels)

---

## 📂 Structure du Projet

```
youtubeFeels/
│
├── data/
│   ├── raw/          # Données sources téléchargées
│   └── processed/    # Données nettoyées & split train/test
│
├── models/
│   ├── sentiment_model.joblib
│   └── tfidf.joblib
│
├── src/
│   ├── data/         # Scripts de collecte et préparation
│   ├── models/       # Entraînement du modèle
│   ├── api/          # Code serveur FastAPI
│   └── utils/
│
├── chrome-extension/ # Code frontend de l’extension
│
├── app_api.py        # Version cloud-ready pour Hugging Face
├── Dockerfile        # Image Docker de déploiement
├── requirements.txt  # Dépendances de production
└── README.md
```

---

## 📊 Données

Dataset utilisé :

📌 Reddit Sentiment Analysis
Téléchargé automatiquement depuis :

```
https://raw.githubusercontent.com/Himanshu-1703/reddit-sentiment-analysis/refs/heads/main/data/reddit.csv
```

### Labels :

* `-1` → négatif
* `0` → neutre
* `1` → positif

---

## 🔧 Installation & Exécution (Local)

### 1️⃣ Cloner le dépôt

```bash
git clone https://github.com/SEKALDouaa/youtubeFeels.git
cd youtubeFeels
```

### 2️⃣ Créer et activer l’environnement virtuel

Windows :

```bash
python -m venv venv
venv\Scripts\activate
```

Linux/macOS :

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3️⃣ Installer les dépendances

```bash
pip install -r requirements.txt
```

---

## 🏋️ Entraînement du Modèle

Pour télécharger, nettoyer, analyser et préparer les données :

```bash
python src/data/download_data.py
python src/data/clean_data.py
python src/data/prepare_data.py
```

Puis entraîner le modèle :

```bash
python src/models/train_model.py
```

Les fichiers `joblib` seront enregistrés dans `models/`.

---

## 🚀 Lancer l’API FastAPI en local

```bash
uvicorn src.api.main:app --reload
```

Tester :

* API Docs : [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* Health check : [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## ☁️ Déploiement sur Hugging Face (Docker)

Fichiers essentiels :

* `app_api.py`
* `Dockerfile`
* `requirements.txt`
* `models/*.joblib`

Déploiement :

1. Créer un Space Hugging Face (mode Docker)
2. Uploader les fichiers
3. Le build s’exécute automatiquement

Pour production, l’API tourne sur :

```
https://huggingface.co/spaces/d0senzy/YoutubeFeels
```

---

## 🧩 Extension Chrome

### Installation

1. Ouvrir `chrome://extensions`
2. Activer **Developer Mode**
3. Cliquer sur **Load unpacked**
4. Sélectionner le dossier `chrome-extension/`

### Fonctionnalités

* Extraction des commentaires visibles
* Envoi par batch à l’API cloud
* Affichage des prédictions (texte + score)
* Interface simple et fluide

---

## 📡 API — Exemple d’appel

### Requête

```bash
POST /predict_batch
```

```json
{
  "comments": [
    "I love this video!",
    "Terrible content."
  ]
}
```

### Réponse

```json
{
  "sentiments": [1, -1],
  "confidences": [0.91, 0.87]
}
```

---

## 📈 Performances du Modèle

* **Vectorisation :** TF-IDF bigrammes
* **Modèle :** Logistic Regression
* **Objectifs atteints :**

  * Accuracy 83%
  * F1-score moyen 81%

---

## 🧪 Tests réalisés

✔ Tests du modèle\
✔ Tests de l’API (local et cloud)\
✔ Tests de l’extension Chrome\
✔ Tests d’intégration end-to-end

---

## 👤 Auteurs

Projet réalisé par **Douaa Sekal**
ENSAM Rabat – Filière INDIA

GitHub : [https://github.com/SEKALDouaa/youtubeFeels.git](https://github.com/SEKALDouaa/youtubeFeels.git)

---

## 📜 Licence

Projet académique – usage pédagogique.
---