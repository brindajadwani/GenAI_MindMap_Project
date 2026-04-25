import json
from agents.base_agent import BaseAgent
from typing import Any, Dict, List

class TesterAgent(BaseAgent):
    def __init__(self, api_key: str = None, model: str = "llama-3.3-70b-versatile"):
        super().__init__("Tester Agent", api_key, model)

    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        pipeline_outputs = input_data.get("pipeline_outputs", {})
        mind_map = pipeline_outputs.get("render_output") or pipeline_outputs.get("mind_map") or {}
        
        issues = []
        node_count = 0
        max_depth = 0
        branch_counts = []
        
        def check_node(node, current_depth):
            nonlocal node_count, max_depth
            if not node: return
            node_count += 1
            max_depth = max(max_depth, current_depth)
            
            # Count branches from root
            if current_depth == 1:
                branch_counts.append(len(node.get("children", [])))
            
            title = node.get("title", "")
            if not title or len(str(title).strip()) == 0:
                issues.append(f"Structural: Empty title at level {current_depth}")
            
            children = node.get("children", [])
            for child in children:
                check_node(child, current_depth + 1)

        # 1. Gather Basic Metrics
        check_node(mind_map, 1)

        # 2. Proper Scoring Calculation (Weighted Metrics)
        # ------------------------------------------------
        score = 100.0 # Start at perfect 100
        
        # A. Structural Deductions (-10 pts per issue)
        structural_penalty = len(issues) * 10
        score -= structural_penalty

        # B. Topic Relevance Metric (0 to 30 pts)
        relevance_bonus = 0
        original_input = pipeline_outputs.get("input") or ""
        root_title = mind_map.get("title") or ""
        
        if original_input and root_title:
            import re
            def clean(text):
                return set(re.sub(r'[^\w\s]', '', text.lower()).split())
            
            input_words = clean(original_input) - {"and", "the", "a", "of", "to", "for", "with", "is", "in"}
            root_words = clean(root_title) - {"and", "the", "a", "of", "to", "for", "with", "is", "in"}
            
            if input_words:
                match_ratio = len(input_words & root_words) / len(input_words)
                if match_ratio < 0.3:
                    issues.append(f"Relevance: Topic match is low ({int(match_ratio*100)}%)")
                    score -= 20
        
        # C. Complexity Metric
        # Penalty for being too "thin"
        if node_count < 5:
            issues.append("Complexity: Roadmap is too brief (less than 5 nodes)")
            score -= 15
        
        if max_depth < 3:
            issues.append("Complexity: Roadmap lacks depth (less than 3 levels)")
            score -= 10

        # D. Balance Metric
        if branch_counts and branch_counts[0] < 2:
            issues.append("Balance: Root has too few main branches")
            score -= 10

        # Final Normalization
        final_score = max(5.0, min(100.0, score)) / 100.0

        return {
            "valid": structural_penalty == 0,
            "issues": issues,
            "quality_score": round(final_score, 2),
            "metrics": {
                "total_nodes": node_count,
                "max_depth": max_depth,
                "topic_match": "High" if score > 80 else "Medium",
                "status": "Excellent" if final_score > 0.9 else "Good" if final_score > 0.7 else "Review Required"
            }
        }




