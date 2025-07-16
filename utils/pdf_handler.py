from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain_openai import ChatOpenAI
import tempfile
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Ensure OpenAI API key is set
if not os.getenv("OPENAI_API_KEY"):
    raise Exception("OPENAI_API_KEY environment variable is not set. Please check your .env file.")

logger = logging.getLogger(__name__)

def process_pdf(file_bytes):
    """Process PDF file and create FAISS vector store"""
    temp_file = None
    temp_path = None
    try:
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        temp_file.write(file_bytes)
        temp_file.close()
        temp_path = temp_file.name

        logger.info("Loading PDF document...")
        
        # Load PDF
        try:
            loader = PyPDFLoader(temp_path)
            docs = loader.load()
        except Exception as e:
            raise Exception(f"Failed to load PDF: {str(e)}")
        
        if not docs:
            raise Exception("No text content found in PDF")
        
        logger.info(f"Loaded {len(docs)} pages from PDF")
        
        # Split documents into chunks
        try:
            splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
            chunks = splitter.split_documents(docs)
            logger.info(f"Split into {len(chunks)} chunks")
        except Exception as e:
            raise Exception(f"Failed to split text: {str(e)}")
        
        # Create embeddings and vector store
        try:
            embeddings = OpenAIEmbeddings()
            db = FAISS.from_documents(chunks, embeddings)
            logger.info("Successfully created FAISS vector store")
        except Exception as e:
            raise Exception(f"Failed to create vector store: {str(e)}")
        
        return db
        
    except Exception as e:
        logger.error(f"Error in process_pdf: {str(e)}")
        raise
    finally:
        # Clean up temporary file
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
                logger.info("Cleaned up temporary file")
            except Exception as e:
                logger.warning(f"Failed to clean up temporary file: {str(e)}")

def ask_question(db, question):
    """Ask a question and get answer from the vector store"""
    try:
        # Validate inputs
        if not db:
            raise Exception("No vector database provided")
        
        if not question or not question.strip():
            raise Exception("Question cannot be empty")
        
        logger.info("Retrieving relevant documents...")
        
        # Get relevant documents
        try:
            retriever = db.as_retriever()
            relevant_docs = retriever.get_relevant_documents(question)
            
            if not relevant_docs:
                return "I couldn't find any relevant information in the document to answer your question."
                
            logger.info(f"Retrieved {len(relevant_docs)} relevant documents")
        except Exception as e:
            raise Exception(f"Failed to retrieve documents: {str(e)}")
        
        # Generate answer using LLM
        try:
            llm = ChatOpenAI(temperature=0)
            chain = load_qa_chain(llm, chain_type="stuff")
            answer = chain.run(input_documents=relevant_docs, question=question)
            
            if not answer or answer.strip() == "":
                return "I couldn't generate a meaningful answer to your question."
                
            logger.info("Successfully generated answer")
            return answer
            
        except Exception as e:
            raise Exception(f"Failed to generate answer: {str(e)}")
            
    except Exception as e:
        logger.error(f"Error in ask_question: {str(e)}")
        raise

