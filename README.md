# DeadRAG 🧠💬

*Note: Project is neither active in development at the moment nor finished*

> An intelligent RAG (Retrieval-Augmented Generation) chat application. Built with a modular architecture, DeadRAG processes PDF documents with advanced image extraction, vectorization, and AI-powered conversations about both text and visual content.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)

## ✨ Features

### 📄 **Advanced PDF Processing**
- Upload and intelligently process PDF documents
- **Image Extraction & Analysis** - Automatically extracts images from PDFs and generates AI descriptions
- **Multi-Modal Vectorization** - Both text content and image descriptions are vectorized for comprehensive search
- **Visual Question Answering** - Ask questions about charts, diagrams, or any images within your PDFs

### 🧩 **Modular & Extensible Architecture**
- **Pluggable LLM Providers** - Currently uses Anthropic Claude, easily extendable to other providers
- **Flexible Ingestion Pipeline** - Modular design allows for different document processing methods
- **Provider-Agnostic Design** - Swap components without major refactoring

### 💬 **Intelligent Chat Experience**
- **Real-time Communication** - WebSocket-powered chat for instant responses
- **Context-Aware Responses** - AI understands both textual and visual content from your documents
- **Multi-Modal Queries** - Ask about text, images, or combinations of both

### 🔧 **Developer Experience**
- 📊 **LLM Observability** - Integrated Langfuse for monitoring AI interactions and performance
- 🎨 **Modern UI/UX** - Beautiful, responsive interface built with Nuxt 3 and TailwindCSS
- 🐳 **Container-Ready** - Fully dockerized external services for seamless deployment
- 🔒 **Type-Safe** - Complete TypeScript implementation across the entire stack

## 🏗️ Tech Stack

### Frontend
- **Framework**: [Nuxt 3](https://nuxt.com/) with Vue 3
- **Styling**: [TailwindCSS](https://tailwindcss.com/) + [Nuxt UI](https://ui.nuxt.com/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Real-time**: Socket.io Client

### Backend
- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **AI/LLM**: [Anthropic Claude](https://www.anthropic.com/)
- **WebSockets**: Socket.io

### External Services
- **Document Processing**: [Unstructured API](https://unstructured.io/)
- **LLM Monitoring**: [Langfuse](https://langfuse.com/)

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Docker & Docker Compose
- PostgreSQL database

### Installation

1. **Start external services**
   ```bash
   docker-compose up -d
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Environment Setup**
   
   Create environment files for both frontend and backend:
   
   Examples are included in the frontend/backend folder

5. **Start the development servers**
   
   In separate terminals:
   ```bash
   # Start docker containers (runs unstructured and langfuse)
   docker compose up

   # Start backend (runs on http://localhost:3010)
   cd backend
   npm run start:dev

   # Start frontend (runs on http://localhost:3000)
   cd frontend
   npm run dev
   ```

## 🛠️ Development

### Project Structure

```
dead-rag/
├── frontend/              # Nuxt 3 frontend application
│   ├── components/        # Vue components
│   ├── pages/            # Application pages
│   ├── stores/           # Pinia stores
│   └── types/            # TypeScript type definitions
├── backend/              # NestJS backend application
│   ├── src/
│   │   ├── chat/         # Chat functionality
│   │   ├── documents/    # Document management
│   │   ├── ingestion/    # Document processing
│   │   ├── llm/          # LLM integration
│   │   └── database/     # Database configuration
├── docs/                 # Documentation
└── docker-compose.yml    # Docker services
```

### External Services

1. **Unstructured API**: Runs on port 5001
2. **Langfuse**: Runs on port 5002
3. **PostgreSQL**: Configure connection in environment variables