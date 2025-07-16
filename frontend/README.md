# DocuChat AI Frontend

A modern React TypeScript frontend for the DocuChat AI document chatbot application.

## Features

- **Modern UI**: Built with React 18, TypeScript, and Tailwind CSS
- **Real-time Chat**: Interactive chat interface with document Q&A
- **File Upload**: Drag-and-drop document upload with validation
- **AI Integration**: Seamless integration with FastAPI backend
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Beautiful, accessible components
- **Vite**: Fast build tool and development server
- **Lucide React**: Beautiful, customizable icons

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## Development

- **Development server**: http://localhost:8080
- **Hot reload**: Enabled for development
- **TypeScript**: Full type checking
- **ESLint**: Code quality and consistency

## Project Structure

```
src/
├── components/     # React components
│   ├── ui/        # shadcn/ui components
│   ├── DocumentChat.tsx
│   ├── DocumentSummary.tsx
│   └── ...
├── pages/         # Page components
│   └── Index.tsx
└── lib/           # Utility functions
```

## Backend Integration

This frontend connects to the FastAPI backend running on `http://localhost:8000` and provides:

- Document upload and processing
- Real-time chat with AI
- Suggested questions generation
- Document summarization
- Conversation memory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
