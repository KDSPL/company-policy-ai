# Internal AI Bot (An internal AI assistant for company guidelines, policies and rules.)

## Project Goals

Company AI is an AI-powered application designed to help employees access and understand company policies and information through a conversational interface.

The application uses Retrieval-Augmented Generation (RAG) to retrieve relevant information from company policy documents and provide concise answers to employee questions.

The main goals of the project are:

* Provide employees with quick access to company policies.
* Reduce the need for manually searching through policy documents.
* Use AI to provide relevant and concise answers based on available company information.
* Allow HR administrators to manage and upload company policy documents.
* Store and search document embeddings to support semantic/vector search.

## Technology Stack

* **Frontend / Application:** Next.js (v16.3.0)
* **Database:** PostgreSQL (v16.14)
* **Vector Search:** pgvector (v0.8.6)
* **AI Model Server:** Ollama (v0.32.6)
* **AI Model:** Qwen (qwen2.5:3b, 1.9 GB)
* **Embeddings Model:** nomic-embed-text
* **ORM:** Prisma (v7.9.1)
* **Containerization:** Docker
* **Deployment:** Coolify (not decided yet)
* **Source Control:** GitHub

## Deployment Steps

The application follows a controlled deployment lifecycle across **Development, UAT, and Production** environments. Source code and deployment configuration are maintained in the organization's GitHub repository, with **Coolify** used for application build and deployment.

### Development

1. Developers make changes in the designated development branch.
2. Changes are committed and pushed to the organization's GitHub repository.
3. The application is built and deployed to the Development environment through Coolify.
4. The application is validated in the Development environment.

### UAT

1. Approved changes are promoted to the UAT environment.
2. Coolify builds and deploys the application using the UAT configuration.
3. The application is tested and validated in UAT.
4. Any identified issues are addressed before production deployment.

### Production

1. Changes approved after UAT validation are promoted to Production.
2. Coolify builds and deploys the application using the Production configuration.
3. Production-specific environment variables and service configurations are maintained separately.
4. The deployed application is verified after deployment.

## Persistent Volumes

The application uses Docker named volumes to persist data across container restarts and container recreation.

### PostgreSQL

* **Volume:** `postgres_data`
* **Container mount path:** `/var/lib/postgresql/data`
* **Purpose:** Persists PostgreSQL database data.

### Ollama

* **Volume:** `ollama_data`
* **Container mount path:** `/root/.ollama`
* **Purpose:** Persists downloaded Ollama models.

Docker Compose volume definitions:

```yaml
volumes:
  postgres_data:
  ollama_data:
```

## Database

* **Database:** PostgreSQL
* **Version:** 16.14
* **Extension:** pgvector
* **pgvector Version:** 0.8.6
* **Database Name:** `company_policy_db`

PostgreSQL with pgvector is used to store application data and support vector similarity searches for the RAG functionality.

## Local Development

### Prerequisites

* Node.js (v20 LTS recommended)
* npm (v10+)
* Docker & Docker Compose (v2+)
* PostgreSQL / pgvector through Docker
* Ollama through Docker

### Environment Variables

Create a `.env` file in the project root and configure the required environment variables.

Required configuration includes:

* `DATABASE_URL`
* `POSTGRES_PASSWORD`
* `OLLAMA_BASE_URL`
* `AUTH_SECRET`
* `SMTP_HOST`
* `SMTP_PORT`
* `SMTP_USER`
* `SMTP_PASSWORD`
* `SMTP_FROM`
* `ADMIN_EMAILS`

To enable Google sign-in, set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in `.env`.
In Google Cloud Console, add `http://localhost:3000/api/auth/callback/google` as an
authorized redirect URI for local development. Use your deployed app's matching
`/api/auth/callback/google` URL in production.

### Start the Application

Install dependencies:

```bash
npm install
```

Start the Docker services:

```bash
docker compose up -d
```

Check the service status:

```bash
docker compose ps
```

Generate the Prisma Client:

```bash
npx prisma generate
```

Apply database migrations:

```bash
npx prisma migrate deploy
```

Pull the required Ollama models:

```bash
docker compose exec ollama ollama pull qwen2.5:3b
docker compose exec ollama ollama pull nomic-embed-text
```

Verify the installed models:

```bash
docker compose exec ollama ollama list
```

The application is available at:

```text
http://localhost:3000
```

## Notes

The application requires PostgreSQL with the pgvector extension and Ollama for its RAG and AI functionality.