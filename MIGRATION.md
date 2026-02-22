# STAGEPASS - Google Cloud Migration Guide

## Overview
You currently have a working MVP built with **React (Frontend)**, **FastAPI (Backend)**, and **MongoDB**. This guide explains how to migrate this exact architecture to a **"Google Only"** stack as requested.

## 1. Prerequisites
- Google Cloud Platform (GCP) Account.
- `gcloud` CLI installed.
- Firebase CLI installed.

## 2. Database Migration (MongoDB -> Firestore)
Since you want to use Google natively, you should switch from MongoDB to **Firestore**.

### Steps:
1.  **Enable Firestore** in your Google Cloud Console.
2.  **Update Backend Logic:**
    - The current code uses `motor` (MongoDB driver).
    - You need to replace the `db` connection in `server.py` with `firebase_admin.firestore`.
    - **Code Change Example:**
      ```python
      # Old (MongoDB)
      # db = client.stagepass
      # await db.users.insert_one(user_dict)

      # New (Firestore)
      # import firebase_admin
      # from firebase_admin import firestore
      # db = firestore.client()
      # db.collection('users').add(user_dict)
      ```
3.  **Data Migration:** Write a script to read from MongoDB and write to Firestore if you have production data.

## 3. Backend Deployment (Cloud Run)
Google Cloud Run is the best place to host the FastAPI Python backend.

### Steps:
1.  **Containerize:** Create a `Dockerfile` in `/backend`:
    ```dockerfile
    FROM python:3.9-slim
    WORKDIR /app
    COPY requirements.txt .
    RUN pip install -r requirements.txt
    COPY . .
    CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]
    ```
2.  **Deploy:**
    ```bash
    gcloud run deploy stagepass-api --source . --region us-central1 --allow-unauthenticated
    ```
3.  **Environment Variables:** Set `EMERGENT_LLM_KEY` and other secrets in Cloud Run settings.

## 4. Frontend Deployment (Firebase Hosting)
Firebase Hosting provides a fast, global CDN for the React app.

### Steps:
1.  **Build:**
    ```bash
    cd frontend
    npm run build
    ```
2.  **Initialize Firebase:**
    ```bash
    firebase init hosting
    # Select 'build' as the public directory
    # Configure as a single-page app (Yes)
    ```
3.  **Deploy:**
    ```bash
    firebase deploy
    ```

## 5. Storage (Google Drive / Cloud Storage)
You mentioned using **Google Drive**.
- **For Production:** We strongly recommend **Google Cloud Storage (GCS)** for video/image serving as it scales better.
- **For Drive:** You would need to use the `google-api-python-client` to upload/read files from Drive. This is slower for video streaming.

## 6. AI (Google Gemini)
The current `GeminiService` is already using the `emergentintegrations` library which connects to Gemini models.
- **Production:** You can keep using this, or switch to the official `google-generativeai` Python SDK if you want direct control without the emergent wrapper.

## Summary of Architecture Change
| Component | Current (MVP) | Google Cloud Target |
|-----------|---------------|---------------------|
| Frontend  | React (Local) | Firebase Hosting    |
| Backend   | FastAPI (Local)| Cloud Run          |
| Database  | MongoDB       | Firestore           |
| Storage   | Local/Mock    | Cloud Storage (GCS) |
| AI        | Gemini (via Emergent) | Gemini (Vertex AI) |

---
**Need Help?** Ask the AI Butler in the dashboard for specific code snippets!
