import json
from agents.base_agent import BaseAgent
from typing import Any, Dict

class EnhancerAgent(BaseAgent):
    def __init__(self, api_key: str = None, model: str = "llama-3.3-70b-versatile"):
        super().__init__("Enhancer Agent", api_key, model)
        self.color_palette = [
            "#c8a96e", "#7eb8a6", "#a47eb8", "#7e9eb8", 
            "#b87e7e", "#7eb87e", "#b8a87e", "#6ea8c8"
        ]

    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        validated_output = input_data.get("validated_output", {})
        
        # Keyword-to-Emoji Mapping
        emoji_map = {
            "foundation": "🧱", "start": "🏁", "basis": "📐",
            "execution": "🚀", "process": "⚙️", "do": "🛠️",
            "growth": "🌱", "scale": "📈", "expand": "🏹",
            "advanced": "🧪", "pro": "🏆", "future": "🔮",
            "analysis": "📊", "research": "🔍", "data": "💾",
            "design": "🎨", "plan": "📝", "concept": "💡",
            "test": "🧪", "verify": "✅", "quality": "💎"
        }

        def enhance_node(node, depth):
            title = node.get("title", "").lower()
            
            # 1. Assign Color based on Depth
            # Use the palette index based on depth (modulo to wrap around if depth is high)
            color_index = (depth - 1) % len(self.color_palette)
            node["color"] = self.color_palette[color_index]
            
            # 2. Assign Emoji (Prefer existing icon if present)
            if "icon" not in node or not node["icon"] or node["icon"] == "🔹":
                assigned_emoji = "🔹" # Default
                for key, emoji in emoji_map.items():
                    if key in title:
                        assigned_emoji = emoji
                        break
                node["icon"] = assigned_emoji

            
            # 3. Recursively enhance children
            for child in node.get("children", []):
                enhance_node(child, depth + 1)

        # Process the tree
        if validated_output:
            enhance_node(validated_output, 1)
            
        # Add basic narrative fields ONLY if missing (Architect should now provide them)
        if "summary" not in validated_output or not validated_output["summary"]:
            validated_output["summary"] = f"A strategic roadmap for {validated_output.get('title', 'the topic')}."
        
        if "flow_explanation" not in validated_output or not validated_output["flow_explanation"]:
            validated_output["flow_explanation"] = "Logical progression from foundational elements to execution."

        return validated_output


