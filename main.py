from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from utils.document_handler import process_document, ask_question, summarize_document, create_conversation_chain, get_chat_history, get_suggested_questions
from typing import Optional
import logging
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Ensure OpenAI API key is set
if not os.getenv("OPENAI_API_KEY"):
    raise Exception("OPENAI_API_KEY environment variable is not set. Please check your .env file.")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS for local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global store for uploaded document vector store and conversation chains
doc_store: dict = {
    "db": None,
    "conversation_chain": None,
    "summary": None,
    "filename": None,
    "file_type": None
}

# File size limit: 5MB in bytes
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Supported file types
SUPPORTED_EXTENSIONS = {'.pdf', '.txt', '.doc', '.docx'}

@app.post("/upload")
async def upload_file(file: UploadFile):
    try:
        # Validate file type
        if not file.filename:
            raise HTTPException(
                status_code=400, 
                detail="No filename provided"
            )
        
        # Get file extension
        file_extension = os.path.splitext(file.filename.lower())[1]
        
        if file_extension not in SUPPORTED_EXTENSIONS:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type. Supported types: {', '.join(SUPPORTED_EXTENSIONS)}"
            )
        
        # Read file content
        file_bytes = await file.read()
        
        # Check file size
        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File size exceeds the maximum limit of 5MB. Current size: {len(file_bytes) / (1024*1024):.2f}MB"
            )
        
        logger.info(f"Processing {file_extension.upper()} file: {file.filename} ({len(file_bytes) / 1024:.2f}KB)")
        
        # Process the document
        result = process_document(file_bytes, file_extension)
        db = result["db"]
        docs = result["docs"]
        
        # Generate summary
        summary = summarize_document(docs)
        
        # Create conversation chain with memory
        conversation_chain = create_conversation_chain(db)
        
        # Store everything
        doc_store["db"] = db
        doc_store["conversation_chain"] = conversation_chain
        doc_store["summary"] = summary
        doc_store["filename"] = file.filename
        doc_store["file_type"] = file_extension.upper()
        
        logger.info(f"Successfully processed {file_extension.upper()} file: {file.filename}")
        
        return JSONResponse(
            status_code=200,
            content={
                "message": f"{file_extension.upper()} file processed and stored successfully",
                "filename": file.filename,
                "file_type": file_extension.upper(),
                "size_kb": len(file_bytes) / 1024,
                "summary": summary
            }
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error processing document: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing document: {str(e)}"
        )

@app.post("/ask")
async def ask(question: str = Form(...)):
    try:
        # Validate question
        if not question or not question.strip():
            raise HTTPException(
                status_code=400,
                detail="Question cannot be empty"
            )
        
        # Check if document is loaded
        db = doc_store.get("db")
        conversation_chain = doc_store.get("conversation_chain")
        
        if not db:
            raise HTTPException(
                status_code=404,
                detail="No document loaded. Please upload a document first."
            )
        
        logger.info(f"Processing question: {question[:50]}...")
        
        # Get answer with conversation memory
        answer = ask_question(db, question, conversation_chain)
        
        logger.info("Successfully generated answer")
        
        return JSONResponse(
            status_code=200,
            content={
                "answer": answer,
                "question": question
            }
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error processing question: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing question: {str(e)}"
        )

@app.get("/summary")
async def get_summary():
    """Get the current document summary"""
    try:
        summary = doc_store.get("summary")
        if not summary:
            raise HTTPException(
                status_code=404,
                detail="No document loaded. Please upload a document first."
            )
        
        return JSONResponse(
            status_code=200,
            content={
                "summary": summary,
                "filename": doc_store.get("filename"),
                "file_type": doc_store.get("file_type")
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting summary: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting summary: {str(e)}"
        )

@app.get("/chat-history")
async def get_chat_history_endpoint():
    """Get the current chat history"""
    try:
        conversation_chain = doc_store.get("conversation_chain")
        if not conversation_chain:
            return JSONResponse(
                status_code=200,
                content={"messages": []}
            )
        
        history = get_chat_history(conversation_chain)
        
        # Convert to simple format for frontend
        messages = []
        for i, message in enumerate(history):
            if hasattr(message, 'content'):
                messages.append({
                    "role": "user" if i % 2 == 0 else "assistant",
                    "content": message.content
                })
        
        return JSONResponse(
            status_code=200,
            content={"messages": messages}
        )
        
    except Exception as e:
        logger.error(f"Error getting chat history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting chat history: {str(e)}"
        )

@app.get("/suggested-questions")
async def get_suggested_questions_endpoint():
    """Get suggested questions based on the loaded document"""
    try:
        db = doc_store.get("db")
        if not db:
            raise HTTPException(
                status_code=404,
                detail="No document loaded. Please upload a document first."
            )
        
        suggested_questions = get_suggested_questions(db)
        
        return JSONResponse(
            status_code=200,
            content={"suggested_questions": suggested_questions}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting suggested questions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting suggested questions: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "documents_loaded": "db" in doc_store}

@app.get("/status")
async def get_status():
    """Get current server status"""
    return {
        "status": "running",
        "documents_loaded": "db" in doc_store,
        "max_file_size_mb": MAX_FILE_SIZE / (1024 * 1024),
        "supported_file_types": list(SUPPORTED_EXTENSIONS),
        "features": {
            "conversation_memory": True,
            "document_summarization": True,
            "source_citations": True
        }
    }

