# MyDermaLife Server - Installation Guide

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **PostgreSQL** >= 14
- **Python** >= 3.9 (for audio transcription)
- **ffmpeg** (for audio processing)

## 1. Clone and install Node.js dependencies

```bash
git clone <repository-url>
cd my-derma-life/server
npm install
```

## 2. Set up the database

Create the PostgreSQL database:

```bash
sudo -u postgres psql -c "CREATE DATABASE mydermalife_db;"
```

Run all migrations:

```bash
chmod +x run_migrations.sh
./run_migrations.sh
```

> The migration script uses default credentials (`postgres`/`postgres` on `localhost:5432`). Edit `run_migrations.sh` if your setup differs.

## 3. Configure environment variables

Create a `.env` file at the project root:

```bash
cp .env.example .env   # or create it manually
```

Required variables:

```env
# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/mydermalife_db

# Authentication
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret

# OpenAI (for AI-powered reports and transcription summaries)
OPENAI_API_KEY=your-openai-api-key

# Server
PORT=7070
NODE_ENV=development
```

## 4. Set up Python environment (for audio transcription)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install openai-whisper
```

Make sure `ffmpeg` is installed on your system:

```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg
```

## 5. Run the server

```bash
# Development (with hot reload)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The server starts on `http://localhost:7070` by default.

## Project Structure

| Directory | Description |
|---|---|
| `src/modules/auth` | Authentication (JWT) |
| `src/modules/consultations` | Teleconsultations & transcription |
| `src/modules/doctors` | Doctor management |
| `src/modules/patients` | Patient records & medical documents |
| `src/modules/prescriptions` | Prescription generation (PDF) |
| `src/modules/products` | Product catalog & routines |
| `src/modules/cart` | Shopping cart |
| `src/modules/orders` | Order management |
| `src/modules/inventory` | Inventory & suppliers |
| `src/modules/reports` | AI-generated medical reports |
| `src/modules/uploads` | File uploads (images, recordings, prescriptions) |
| `migrations/` | SQL migration files |
| `scripts/` | Utility scripts (Whisper transcription) |
