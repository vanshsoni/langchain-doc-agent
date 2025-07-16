# DocuChat AI - Document Chatbot

An AI-powered document chatbot that allows you to upload documents (PDF, DOC, DOCX, TXT) and have intelligent conversations about their content. Built with FastAPI, LangChain, OpenAI, and a modern React TypeScript frontend.

## 🌟 Features

### Core Features
- **Multi-format Document Support**: Upload PDF, DOC, DOCX, and TXT files
- **AI-Powered Q&A**: Ask questions about your documents and get intelligent answers
- **Smart Document Summaries**: Get instant AI-generated summaries of uploaded documents
- **Conversation Memory**: The chatbot remembers previous questions and maintains context
- **Source Citations**: Get answers with references to specific parts of your document

### Advanced Features
- **Real-time Chat Interface**: Modern, responsive chat UI with typing indicators
- **Drag & Drop Upload**: Easy file upload with visual feedback
- **File Size Validation**: 5MB limit with proper error handling
- **Error Handling**: Comprehensive error handling and user feedback
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

### Backend (FastAPI + Python)
- **FastAPI**: High-performance web framework for building APIs
- **LangChain**: Framework for developing applications with LLMs
- **OpenAI GPT**: Advanced language model for document understanding
- **FAISS**: Vector similarity search for document retrieval
- **Document Processing**: Multi-format text extraction and chunking

### Frontend (React + TypeScript)
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Beautiful, accessible UI components
- **Vite**: Fast build tool and development server
- **Lucide React**: Beautiful, customizable icons

## 📁 Project Structure

```
langchain-pdf-chatbot/
├── main.py                 # FastAPI backend server
├── requirements.txt        # Python dependencies
├── utils/
│   └── document_handler.py # Document processing logic
├── frontend/              # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   └── lib/          # Utility functions
│   ├── package.json      # Node.js dependencies
│   └── vite.config.ts    # Vite configuration
├── start_app.py          # Launcher script for both servers
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites

1. **Python 3.9+** with pip
2. **Node.js 18+** with npm
3. **OpenAI API Key** (get one at [OpenAI Platform](https://platform.openai.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd langchain-pdf-chatbot
   ```

2. **Set up Python environment**
   ```bash
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   
   # Install Python dependencies
   pip install -r requirements.txt
   ```

3. **Set up frontend**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Configure environment variables**
   ```bash
   # Create .env file
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
   ```

### Running the Application

#### Option 1: Use the Launcher Script (Recommended)
```bash
python start_app.py
```

cclwThis will start both the backend (port 8000) and frontend (port 8080) servers automatically.

#### Option 2: Start Servers Manually

**Terminal 1 - Backend:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📚 API Endpoints

### Document Management
- `POST /upload` - Upload and process a document
- `GET /summary` - Get document summary
- `GET /chat-history` - Get conversation history
- `GET /suggested-questions` - Get AI-generated suggested questions

### Chat Interface
- `POST /ask` - Ask a question about the document

### Health & Status
- `GET /health` - Health check
- `GET /status` - Server status

## 🎨 Frontend Features

### Modern UI Components
- **File Upload**: Drag-and-drop interface with visual feedback
- **Chat Interface**: Real-time messaging with typing indicators
- **Document Summary**: Collapsible summary panel
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on all screen sizes

### Technical Features
- **TypeScript**: Full type safety
- **Tailwind CSS**: Modern styling with utility classes
- **shadcn/ui**: Accessible, customizable components
- **React Hooks**: Modern React patterns
- **Error Boundaries**: Graceful error handling

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### File Size Limits
- **Maximum file size**: 5MB
- **Supported formats**: PDF, DOC, DOCX, TXT

### Backend Configuration
- **Host**: 0.0.0.0 (accessible from any IP)
- **Port**: 8000
- **CORS**: Enabled for local development

### Frontend Configuration
- **Development server**: http://localhost:8080
- **API endpoint**: http://localhost:8000
- **Hot reload**: Enabled for development

## 🛠️ Development

### Backend Development
```bash
# Install development dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn main:app --reload

# Run tests (if available)
python -m pytest
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

### Code Structure

#### Backend (`main.py`)
- FastAPI application setup
- CORS middleware configuration
- API endpoint definitions
- Error handling and validation

#### Document Handler (`utils/document_handler.py`)
- Document processing pipeline
- Text extraction from multiple formats
- Vector store creation with FAISS
- LangChain integration for Q&A

#### Frontend Components
- **FileUpload**: Drag-and-drop file upload
- **DocumentChat**: Real-time chat interface
- **DocumentSummary**: Document summary display
- **UI Components**: Reusable shadcn/ui components

## 🔒 Security Considerations

- **File Validation**: Strict file type and size validation
- **CORS Configuration**: Properly configured for development
- **Error Handling**: Comprehensive error handling without exposing sensitive data
- **Input Validation**: All user inputs are validated and sanitized

## 📈 Scalability

### Current Architecture
- **Single-server**: Suitable for development and small-scale deployment
- **In-memory storage**: FAISS vector store stored in memory
- **File-based processing**: Documents processed on upload

### Future Enhancements
- **Database Integration**: Persistent storage for documents and conversations
- **Vector Database**: Pinecone or Weaviate for scalable vector storage
- **Microservices**: Separate services for different functionalities
- **Load Balancing**: Multiple server instances
- **Caching**: Redis for improved performance

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check if uvicorn is installed
pip install uvicorn

# Check if OpenAI API key is set
echo $OPENAI_API_KEY
```

**Frontend won't start:**
```bash
# Check Node.js version
node --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**CORS errors:**
- Ensure backend is running on port 8000
- Check that CORS middleware is properly configured
- Verify frontend is making requests to correct URL

**File upload errors:**
- Check file size (max 5MB)
- Verify file format (PDF, DOC, DOCX, TXT)
- Ensure backend is running and accessible

### Debug Mode

**Backend debugging:**
```bash
# Run with debug logging
uvicorn main:app --log-level debug
```

**Frontend debugging:**
```bash
# Open browser developer tools
# Check Network tab for API calls
# Check Console for JavaScript errors
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **LangChain**: For the excellent LLM framework
- **OpenAI**: For the powerful GPT models
- **FastAPI**: For the high-performance web framework
- **shadcn/ui**: For the beautiful UI components
- **Tailwind CSS**: For the utility-first CSS framework

---

**Happy Document Chatting! 🚀** 