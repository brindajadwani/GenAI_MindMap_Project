import time
import logging
import asyncio
from typing import Any, Dict, List
from agents.planner_agent import PlannerAgent
from agents.structurer_agent import StructurerAgent
from agents.validator_agent import ValidatorAgent
from agents.enhancer_agent import EnhancerAgent
from agents.renderer_agent import RendererAgent
from agents.exporter_agent import ExporterAgent
from agents.tester_agent import TesterAgent
from agents.refiner_agent import RefinerAgent

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("PipelineController")

class PipelineController:
    def __init__(self, api_key: str = None):
        self.api_key = api_key
        self.planner = PlannerAgent(api_key=api_key)
        self.structurer = StructurerAgent(api_key=api_key)
        self.validator = ValidatorAgent(api_key=api_key)
        self.enhancer = EnhancerAgent(api_key=api_key)
        self.renderer = RendererAgent(api_key=api_key)
        self.exporter = ExporterAgent(api_key=api_key)
        self.tester = TesterAgent(api_key=api_key)
        self.refiner = RefinerAgent(api_key=api_key)
        self.logs: List[Dict[str, Any]] = []

    def _log_stage(self, agent_name: str, status: str, duration: float, input_len: int, output_len: int, error: str = None):
        log_entry = {
            "timestamp": time.time(),
            "agent_name": agent_name,
            "status": status,
            "duration_ms": int(duration * 1000),
            "input_length": input_len,
            "output_length": output_len,
            "error_message": error
        }
        self.logs.append(log_entry)
        logger.info(f"Agent {agent_name} finished with status {status} in {log_entry['duration_ms']}ms")

    async def run(self, input_text: str, clarification_answers: Dict = None, additional_info: str = None) -> Dict[str, Any]:
        context = {
            "input": input_text,
            "clarification_answers": clarification_answers,
            "additional_info": additional_info
        }
        
        # 1. Architect Stage (Merged Planner & Structurer)
        # The new PlannerAgent returns a full hierarchy in one call.
        start_time = time.time()
        try:
            planner_output = await self.planner.run(context)
            context["structured_output"] = planner_output
            self._log_stage("Architect Agent", "success", time.time() - start_time, len(input_text), len(str(planner_output)))
        except Exception as e:
            self._log_stage("Architect Agent", "failed", time.time() - start_time, len(input_text), 0, str(e))
            raise

        await asyncio.sleep(0.1)

        # 2. Conditional Validator Stage
        start_time = time.time()
        issues = self.validator.rule_check(context["structured_output"])
        if not issues:
            context["validated_output"] = context["structured_output"]
            self._log_stage("Validator Agent", "skipped (already valid)", 0, len(str(context["structured_output"])), 0)
        else:
            try:
                logger.info(f"Validator found {len(issues)} issues, calling LLM to fix...")
                validated_output = await self.validator.run({"structured_output": context["structured_output"]})
                context["validated_output"] = validated_output
                self._log_stage("Validator Agent", "success (fixed issues)", time.time() - start_time, len(str(context["structured_output"])), len(str(validated_output)))
            except Exception as e:
                context["validated_output"] = context["structured_output"]
                self._log_stage("Validator Agent", "failed to fix", time.time() - start_time, 0, 0, str(e))

        # 3. Deterministic Enhancer Stage (No API call)
        start_time = time.time()
        enhanced_output = await self.enhancer.run({"validated_output": context["validated_output"]})
        context["enhanced_output"] = enhanced_output
        self._log_stage("Enhancer Agent", "success (local)", time.time() - start_time, 0, 0)

        # 4. Renderer Agent (Local)
        context["render_output"] = enhanced_output

        # 5. Exporter Agent (Local)
        miro_json = await self.exporter.run({"mind_map": context["render_output"]})
        context["miro_json"] = miro_json

        # 6. Deterministic Tester Agent (No API call)
        start_time = time.time()
        tester_report = await self.tester.run({"pipeline_outputs": context})
        self._log_stage("Tester Agent", "success (local)", time.time() - start_time, 0, 0)

        return {
            "mind_map": context["render_output"],
            "miro_json": context.get("miro_json"),
            "tester_report": tester_report,
            "pipeline_log": self.logs
        }


    async def refine(self, previous_map: Dict, feedback: str) -> Dict[str, Any]:
        """One-trial refinement process"""
        start_time = time.time()
        try:
            # 1. Run Refiner (Requires LLM)
            refined_map = await self.refiner.run({
                "previous_map": previous_map,
                "feedback": feedback
            })
            
            # 2. Conditional Validator Stage
            issues = self.validator.rule_check(refined_map)
            if not issues:
                validated_map = refined_map
            else:
                logger.info(f"Refinement introduced {len(issues)} issues, calling LLM to fix...")
                validated_map = await self.validator.run({"structured_output": refined_map})
            
            # 3. Apply Local Enhancement (Ensure icons/colors are consistent after change)
            validated_map = await self.enhancer.run({"validated_output": validated_map})
            
            # 4. Regenerate Miro JSON (Local)
            miro_json = await self.exporter.run({"mind_map": validated_map})
            
            # 5. Run Final Test (Local)
            tester_report = await self.tester.run({"pipeline_outputs": {"mind_map": validated_map, "input": feedback}})
            
            self._log_stage("Refinement Process", "success", time.time() - start_time, len(str(previous_map)), len(str(validated_map)))
            
            return {
                "mind_map": validated_map,
                "miro_json": miro_json,
                "tester_report": tester_report,
                "pipeline_log": self.logs
            }

        except Exception as e:
            self._log_stage("Refinement Process", "failed", time.time() - start_time, 0, 0, str(e))
            raise
