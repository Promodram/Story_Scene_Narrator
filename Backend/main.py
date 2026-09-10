import json
from inspect import cleandoc
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the hardcoded story state
with open("story_events.json", "r") as f:
    STORY_EVENTS = json.load(f)

# Initialize Client pointing to local Ollama server
client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"  # Required by SDK, but Ollama ignores it
)

class SceneRequest(BaseModel):
    character: str
    episode_boundary: int
    prompt: str

class SceneResponse(BaseModel):
    scene: str
    permitted_facts: list[str]

@app.post("/generate", response_model=SceneResponse)
def generate_scene(req: SceneRequest):
    permitted_facts = []
    
    # Core RAG Filter: Enforce temporal and perspective boundaries
    for event in STORY_EVENTS:
        if event["episode"] <= req.episode_boundary:
            if req.character in event["known_by"]:
                permitted_facts.append(event["event"])

    formatted_facts = "\n".join(f"- {fact}" for fact in permitted_facts) if permitted_facts else "- (No prior facts known)"

    system_prompt = cleandoc(f"""
        You are a playwright writing a focused dramatic scene from a character's point of view at that scene prompt in the story from {req.character}'s perspective at the end of Episode {req.episode_boundary}

        Narrative BOUNDARY:
        {req.character} ONLY knows the following facts about the world:
        {formatted_facts}

        CRITICAL RULES:
        1. PROGRESSION OVER REPETITION: Do NOT repeat the character's internal reflections, anxieties, or observations. Every paragraph must advance the scene with concrete sensory detail, immediate action, or forward-moving dialogue.
        2. Do NOT info-dump or recite these facts like a summary. The facts represent the character's internal memory.
        3. Only reference facts that are emotionally or contextually relevant to the immediate scene prompt.
        4. NEVER mention, imply, or hint at events, secrets, or outcomes outside the permitted facts.
        5. Focus on dialogue, subtext, tension, and action matching the prompt.
        6. SUBTEXT OVER EXPOSITION: Do NOT recite facts as back-story summaries. Weave them naturally into subtext and behavior.
    """)

    try:
        completion = client.chat.completions.create(
            model="qwen3:4b",  # Must match the tag pulled in Ollama
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Scene Prompt: {req.prompt}"}
            ],
            temperature=0.7,
            
        )
        generated_scene = completion.choices[0].message.content or ""
    except Exception as e:
        generated_scene = f"Error generating scene: {str(e)}"

    return SceneResponse(
        scene=generated_scene,
        permitted_facts=permitted_facts
    )