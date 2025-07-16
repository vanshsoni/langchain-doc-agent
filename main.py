from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from utils.pdf_handler import process_pdf, ask_question
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

# Global store for uploaded PDF vector store
doc_store = {}

# File size limit: 5MB in bytes
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@app.post("/upload")
async def upload_file(file: UploadFile):
    try:
        # Validate file type
        if not file.filename or not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=400, 
                detail="Only PDF files are allowed"
            )
        
        # Read file content
        file_bytes = await file.read()
        
        # Check file size
        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File size exceeds the maximum limit of 5MB. Current size: {len(file_bytes) / (1024*1024):.2f}MB"
            )
        
        logger.info(f"Processing PDF: {file.filename} ({len(file_bytes) / 1024:.2f}KB)")
        
        # Process the PDF
        db = process_pdf(file_bytes)
        doc_store["db"] = db
        
        logger.info(f"Successfully processed PDF: {file.filename}")
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "PDF processed and stored successfully",
                "filename": file.filename,
                "size_kb": len(file_bytes) / 1024
            }
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing PDF: {str(e)}"
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
        if not db:
            raise HTTPException(
                status_code=404,
                detail="No document loaded. Please upload a PDF first."
            )
        
        logger.info(f"Processing question: {question[:50]}...")
        
        # Get answer
        answer = ask_question(db, question)
        
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
        "max_file_size_mb": MAX_FILE_SIZE / (1024 * 1024)
    }

