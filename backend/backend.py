from langchain import PromptTemplate
from langchain.docstore.document import Document
from langchain.document_loaders import WebBaseLoader
from langchain.schema import StrOutputParser
from langchain.schema.prompt_template import format_document
from langchain.schema.runnable import RunnablePassthrough
from langchain_pinecone import Pinecone
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.chains import LLMChain

from dotenv import load_dotenv
import os

from pinecone import Pinecone as pc
from pinecone import PodSpec

import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from pdf_work import chaining

app = FastAPI(title="backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins; adjust this as needed
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/", include_in_schema=False)
def index():
    return RedirectResponse("/docs", status_code=308)

# Load environment variables
load_dotenv()

# Models for API input
class URLInput(BaseModel):
    url: str

class PDFInput(BaseModel):
    pdf: dict #since we will recieve image in base 64

class QuestionInput(BaseModel):
    docs: List[Document]
    question: str

def url_loader(user_input):
    loader = WebBaseLoader(user_input)
    docs = loader.load()
    return docs

def extractor(docs):
    os.environ['GOOGLE_API_KEY'] = os.getenv('GOOGLE_API_KEY')

    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.7, top_p=0.85)
    
    llm_prompt_template = """Summarize the following article into its key components:

    Context: {context}

    Summary:"""
    llm_prompt = PromptTemplate.from_template(llm_prompt_template)
    chain = LLMChain(llm=llm, prompt=llm_prompt)

    response = chain.run({"context": docs})
    return response

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def pine_index(docs, gemini_embeddings):
    pine_client = pc()
    index_name = "langchain-demo"
    if index_name not in pine_client.list_indexes().names():
        print("Creating index")
        pine_client.create_index(name=index_name,
                                 metric="cosine",
                                 dimension=768,
                                 spec=PodSpec(
                                     environment="gcp-starter",
                                     pod_type="starter",
                                     pods=1)
        )
        print(pine_client.describe_index(index_name))

    vectorstore = Pinecone.from_documents(docs, gemini_embeddings, index_name=index_name)
    retriever = vectorstore.as_retriever()
    return retriever

def gemini(retriever, question):
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.7, top_p=0.85)
    llm_prompt_template = """You are an assistant for question-answering tasks.
    Use the following context to answer the question.
    If you don't know the answer, just say that you don't know.
    Use five sentences maximum and keep the answer concise.

    Question: {question}
    Context: {context}
    Answer:"""

    llm_prompt = PromptTemplate.from_template(llm_prompt_template)
    
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | llm_prompt
        | llm
        | StrOutputParser()
    )
    return rag_chain.invoke(question)

# FastAPI Endpoints
@app.post("/extract_url/")
def extract_url(input: URLInput):
    docs = url_loader(input.url)
    result = extractor(docs)
    return {
        # "url scrapped info":docs,
        "extracted_information": result}

@app.post("/extract_pdf/")
def extract_pdf(input: PDFInput):
    try:
        docs = chaining(input.pdf)
        return {
            "extracted_information": docs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


