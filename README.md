# Story_Scene_Narrator


Narrative RAG System
A deterministic, rule-based text generation system that dynamically writes dramatic story scenes based on strictly enforced character knowledge boundaries.

Tech Stack
Backend: Python, FastAPI, Uvicorn, Pydantic

LLM: Qwen3:4b (via local Ollama) / OpenAI API compatible

Environment Management: uv

Requests: For inter-service communication

Prerequisites
Python 3.10+

uv (for lightning-fast dependency management)

Ollama (running locally with the qwen2.5:4b or equivalent model installed)



Clone the repository and navigate to the backend:

Bash
cd path/to/Epistemic_RAG/Backend
Create a virtual environment using uv:

Bash
uv venv
Activate the virtual environment:

Windows: .venv\Scripts\activate

Mac/Linux: source .venv/bin/activate

Install dependencies:

Bash
uv pip install -r requirements.txt
Running the System
You will need two separate terminal windows (both with the virtual environment activated).

Terminal 1: Start the FastAPI Server
Start the backend API that handles the knowledge filtering and prompt assembly.

Bash
uvicorn main:app --reload
Terminal 2: Generate Scene Samples
Run the sample generation script. This will communicate with the FastAPI server, request specific character scenes based on the JSON state, and output the generated Markdown and JSON artifacts into a local sample/ folder.

Bash
python generate_samples.py
Project Architecture
main.py: The FastAPI server. Handles API requests, loads the JSON state, filters permitted facts, applies regex text sanitization, and communicates with the LLM.

story_events.json: The hardcoded state file containing every story event, its episode number, and an exact array of characters who know about it.

generate_samples.py: A test script that requests scenes and saves the output to disk for human review.

DECISIONS.md: A detailed prose breakdown of the architectural choices, including why vector databases were rejected and where the current system's weaknesses lie.

requirements.txt: Project dependencies managed by uv

URL : http://localhost:5173/
