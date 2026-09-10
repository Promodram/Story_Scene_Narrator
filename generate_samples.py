import os
import json
import requests

API_URL = "http://localhost:8000/generate"
OUTPUT_DIR = "sample"

TEST_CASES = [
    {
        "case_id": "case_1_kamala_ep5",
        "character": "Kamala",
        "episode_boundary": 5,
        "prompt": "Kamala confronts Dev in the empty auditorium about whether he still wants to be here."
    },
    {
        "case_id": "case_2_kamala_ep4",
        "character": "Kamala",
        "episode_boundary": 4,
        "prompt": "Kamala goes over what she saw in the car park."
    },
    {
        "case_id": "case_3_tomas_ep5",
        "character": "Tomas",
        "episode_boundary": 5,
        "prompt": "Tomas walks through the empty auditorium the morning after signing the sale agreement."
    },
    {
        "case_id": "case_4_priya_ep5",
        "character": "Priya",
        "episode_boundary": 5,
        "prompt": "Priya writes up her notes after the dress rehearsal."
    },
    {
        "case_id": "case_5_wren_ep6",
        "character": "Wren",
        "episode_boundary": 6,
        "prompt": "Wren walks home after closing night, thinking about next season."
    },
    {
        "case_id": "case_6_wren_ep5",
        "character": "Wren",
        "episode_boundary": 5,
        "prompt": "Wren tries to work out why Kamala has been so distracted lately."
    }
]

os.makedirs(OUTPUT_DIR, exist_ok=True)

for tc in TEST_CASES:
    print(f"Generating: {tc['case_id']} ({tc['character']} - Ep {tc['episode_boundary']})...")
    
    payload = {
        "character": tc["character"],
        "episode_boundary": tc["episode_boundary"],
        "prompt": tc["prompt"]
    }
    
    try:
        response = requests.post(API_URL, json=payload, timeout=120)
        response.raise_for_status()
        data = response.json()
        
        # 1. Save machine-readable JSON artifact
        json_path = os.path.join(OUTPUT_DIR, f"{tc['case_id']}.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump({
                "metadata": payload,
                "permitted_facts": data.get("permitted_facts", []),
                "scene": data.get("scene", "")
            }, f, indent=2)

        # 2. Save human-readable Markdown artifact for reviewers
        md_path = os.path.join(OUTPUT_DIR, f"{tc['case_id']}.md")
        with open(md_path, "w", encoding="utf-8") as f:
            facts_md = "\n".join(f"- {fact}" for fact in data.get("permitted_facts", []))
            f.write(
                f"# Scenario: {tc['character']} (Episode {tc['episode_boundary']})\n\n"
                f"**Prompt:** {tc['prompt']}\n\n"
                f"## Permitted Facts (Narrative Boundary)\n"
                f"{facts_md if facts_md else '- None'}\n\n"
                f"## Generated Scene\n"
                f"{data.get('scene', '').strip()}\n"
            )

        print(f"Saved: {json_path} & {md_path}")

    except Exception as e:
        print(f"Failed {tc['case_id']}: {e}")