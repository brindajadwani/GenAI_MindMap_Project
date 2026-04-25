from agents.base_agent import BaseAgent
from typing import Any, Dict

class PlannerAgent(BaseAgent):
    def __init__(self, api_key: str = None, model: str = "llama-3.3-70b-versatile"):
        super().__init__("Planner Agent", api_key, model)

    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        user_input = input_data.get("input", "")
        clarification = input_data.get("clarification_answers", {})
        additional = input_data.get("additional_info", "")
        
        clarification_text = "\n".join([f"Q: {k} A: {v}" for k, v in clarification.items()]) if clarification else "None"
        
        prompt = f"""Analyze the input and create a complete, deep hierarchical STRATEGIC ROADMAP.
        
        CENTRAL GOAL: {user_input}
        USER CLARIFICATIONS: {clarification_text}
        SPECIFIC REQUIREMENTS: {additional}
        
        Instructions:
        1. The Central Goal is the Root of the tree.
        2. Create 4-5 Sequential Phases as level 1 children.
        3. Generate logical sub-tasks (level 2 and 3).
        4. Write a professional 'summary' (2-3 sentences) of this specific roadmap.
        5. Write a 'flow_explanation' describing the progression between phases.
        6. **Assign a highly relevant emoji (icon) to EVERY node.**
        
        Return ONLY valid JSON:
        {{
          "title": "...",
          "icon": "...",
          "summary": "...",
          "flow_explanation": "...",
          "children": [
            {{
              "title": "Phase 1: ...",
              "icon": "...",
              "children": [
                {{ "title": "Task 1.1", "icon": "...", "children": [] }}
              ]
            }}
          ]
        }}

        
        INPUT:
        {user_input}"""



        raw_output = await self.call_llm(prompt)
        return self.parse_json(raw_output)
