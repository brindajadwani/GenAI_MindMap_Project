import pytest
import asyncio
from unittest.mock import patch, MagicMock, AsyncMock
from httpx import Response, Request, HTTPStatusError

from agents.base_agent import BaseAgent
from agents.clarifier_agent import ClarifierAgent
from agents.planner_agent import PlannerAgent
from agents.structurer_agent import StructurerAgent
from agents.validator_agent import ValidatorAgent
from agents.enhancer_agent import EnhancerAgent
from agents.renderer_agent import RendererAgent
from agents.exporter_agent import ExporterAgent
from agents.tester_agent import TesterAgent

@pytest.fixture
def mock_base_agent():
    return BaseAgent(name="TestAgent", api_key="fake-key")

@pytest.mark.asyncio
async def test_base_agent_missing_api_key():
    agent = BaseAgent(name="TestAgent", api_key=None)
    # Force api_key to None in case env var is set
    agent.api_key = None
    with pytest.raises(ValueError, match="API key missing"):
        await agent.call_llm("Test prompt")

@pytest.mark.asyncio
async def test_base_agent_run_not_implemented(mock_base_agent):
    with pytest.raises(NotImplementedError):
        await mock_base_agent.run({})

@pytest.mark.asyncio
async def test_base_agent_call_llm_success(mock_base_agent):
    with patch("httpx.AsyncClient.post") as mock_post:
        mock_response = MagicMock(spec=Response)
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "choices": [{"message": {"content": "response content"}}]
        }
        mock_post.return_value = mock_response
        
        result = await mock_base_agent.call_llm("test prompt")
        assert result == "response content"

@pytest.mark.asyncio
async def test_base_agent_call_llm_429_retry(mock_base_agent):
    with patch("httpx.AsyncClient.post") as mock_post:
        mock_response_429 = MagicMock(spec=Response)
        mock_response_429.status_code = 429
        
        mock_response_200 = MagicMock(spec=Response)
        mock_response_200.status_code = 200
        mock_response_200.json.return_value = {
            "choices": [{"message": {"content": "success after retry"}}]
        }
        
        # First call returns 429, second returns 200
        mock_post.side_effect = [mock_response_429, mock_response_200]
        
        with patch("asyncio.sleep", new_callable=AsyncMock) as mock_sleep:
            result = await mock_base_agent.call_llm("test prompt")
            assert result == "success after retry"
            mock_sleep.assert_called_once_with(2)

@pytest.mark.asyncio
async def test_base_agent_call_llm_430_retry(mock_base_agent):
    with patch("httpx.AsyncClient.post") as mock_post:
        req = Request("POST", "url")
        mock_response_430 = MagicMock(spec=Response)
        mock_response_430.status_code = 430
        mock_response_430.text = "Error 430"
        
        mock_response_200 = MagicMock(spec=Response)
        mock_response_200.status_code = 200
        mock_response_200.json.return_value = {
            "choices": [{"message": {"content": "success after 430 retry"}}]
        }
        
        # Raise HTTPStatusError for 430
        error_430 = HTTPStatusError("430 Error", request=req, response=mock_response_430)
        
        mock_post.side_effect = [error_430, mock_response_200]
        
        result = await mock_base_agent.call_llm("test prompt")
        assert result == "success after 430 retry"

@pytest.mark.asyncio
async def test_base_agent_call_llm_generic_exception_retry(mock_base_agent):
    with patch("httpx.AsyncClient.post") as mock_post:
        mock_response_200 = MagicMock(spec=Response)
        mock_response_200.status_code = 200
        mock_response_200.json.return_value = {
            "choices": [{"message": {"content": "success after exception"}}]
        }
        
        mock_post.side_effect = [Exception("Network error"), mock_response_200]
        
        with patch("asyncio.sleep", new_callable=AsyncMock) as mock_sleep:
            result = await mock_base_agent.call_llm("test prompt")
            assert result == "success after exception"
            mock_sleep.assert_called_once_with(1)

@pytest.mark.asyncio
async def test_base_agent_call_llm_max_retries_exceeded(mock_base_agent):
    with patch("httpx.AsyncClient.post") as mock_post:
        mock_response_429 = MagicMock(spec=Response)
        mock_response_429.status_code = 429
        
        # Always return 429
        mock_post.return_value = mock_response_429
        
        with patch("asyncio.sleep", new_callable=AsyncMock):
            with pytest.raises(Exception, match="Failed to get response"):
                await mock_base_agent.call_llm("test prompt", max_retries=2)

def test_base_agent_parse_json_valid(mock_base_agent):
    raw = 'Here is the JSON: {"key": "value"} ends here.'
    parsed = mock_base_agent.parse_json(raw)
    assert parsed == {"key": "value"}

def test_base_agent_parse_json_markdown(mock_base_agent):
    raw = '```json\n{"key": "value"}\n```'
    parsed = mock_base_agent.parse_json(raw)
    assert parsed == {"key": "value"}

def test_base_agent_parse_json_error(mock_base_agent):
    raw = 'Invalid json { '
    with pytest.raises(Exception):
        mock_base_agent.parse_json(raw)

@pytest.mark.asyncio
async def test_base_agent_call_llm_http_status_error(mock_base_agent):
    with patch("httpx.AsyncClient.post") as mock_post:
        req = Request("POST", "url")
        mock_response_500 = MagicMock(spec=Response)
        mock_response_500.status_code = 500
        mock_response_500.text = "Internal Server Error"
        
        # Raise HTTPStatusError for 500, not 430, so it will print and raise
        error_500 = HTTPStatusError("500 Error", request=req, response=mock_response_500)
        
        mock_post.side_effect = [error_500]
        
        with pytest.raises(HTTPStatusError):
            await mock_base_agent.call_llm("test prompt", max_retries=1)

@pytest.mark.asyncio
async def test_base_agent_call_llm_430_max_retries(mock_base_agent):
    with patch("httpx.AsyncClient.post") as mock_post:
        req = Request("POST", "url")
        mock_response_430 = MagicMock(spec=Response)
        mock_response_430.status_code = 430
        mock_response_430.text = "Error 430"
        
        error_430 = HTTPStatusError("430 Error", request=req, response=mock_response_430)
        
        mock_post.side_effect = [error_430]
        
        with pytest.raises(HTTPStatusError):
            await mock_base_agent.call_llm("test prompt", max_retries=1)

@pytest.mark.asyncio
async def test_base_agent_call_llm_generic_error_max_retries(mock_base_agent):
    with patch("httpx.AsyncClient.post") as mock_post:
        mock_post.side_effect = [Exception("Network error")]
        
        with pytest.raises(Exception, match="Network error"):
            await mock_base_agent.call_llm("test prompt", max_retries=1)

def test_base_agent_parse_json_fallback(mock_base_agent):
    # Test fallback path when `{` and `}` are not properly bounding the json
    raw = '```json\n"just a string"\n```'
    parsed = mock_base_agent.parse_json(raw)
    assert parsed == "just a string"

@pytest.mark.asyncio
async def test_base_agent_call_llm_not_200_no_exception(mock_base_agent):
    with patch("httpx.AsyncClient.post") as mock_post:
        mock_response_400 = MagicMock(spec=Response)
        mock_response_400.status_code = 400
        mock_response_400.text = "Bad Request"
        # Mock raise_for_status to raise HTTPStatusError
        req = Request("POST", "url")
        mock_response_400.raise_for_status.side_effect = HTTPStatusError("400 Error", request=req, response=mock_response_400)
        
        mock_post.return_value = mock_response_400
        
        with pytest.raises(HTTPStatusError):
            await mock_base_agent.call_llm("test prompt", max_retries=1)


# --- ClarifierAgent Tests ---

@pytest.fixture
def mock_clarifier_agent():
    return ClarifierAgent(api_key="fake")

@pytest.mark.asyncio
async def test_clarifier_agent_run(mock_clarifier_agent):
    with patch.object(mock_clarifier_agent, "call_llm", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = '{"questions": []}'
        with patch.object(mock_clarifier_agent, "parse_json") as mock_parse:
            mock_parse.return_value = {"questions": []}
            result = await mock_clarifier_agent.run({"input": "test input"})
            mock_call.assert_called_once()
            mock_parse.assert_called_once_with('{"questions": []}')
            assert result == {"questions": []}

# --- PlannerAgent Tests ---

@pytest.fixture
def mock_planner_agent():
    return PlannerAgent(api_key="fake")

@pytest.mark.asyncio
async def test_planner_agent_run(mock_planner_agent):
    with patch.object(mock_planner_agent, "call_llm", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = '{"central_topic": "test"}'
        with patch.object(mock_planner_agent, "parse_json") as mock_parse:
            mock_parse.return_value = {"central_topic": "test"}
            result = await mock_planner_agent.run({"input": "test input", "clarification_answers": {"Q1": "A1"}, "additional_info": "test"})
            mock_call.assert_called_once()
            mock_parse.assert_called_once_with('{"central_topic": "test"}')
            assert result == {"central_topic": "test"}

# --- StructurerAgent Tests ---

@pytest.fixture
def mock_structurer_agent():
    return StructurerAgent(api_key="fake")

@pytest.mark.asyncio
async def test_structurer_agent_run(mock_structurer_agent):
    with patch.object(mock_structurer_agent, "call_llm", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = '{"title": "test"}'
        with patch.object(mock_structurer_agent, "parse_json") as mock_parse:
            mock_parse.return_value = {"title": "test"}
            result = await mock_structurer_agent.run({"planner_output": {"central_topic": "test"}})
            mock_call.assert_called_once()
            mock_parse.assert_called_once_with('{"title": "test"}')
            assert result == {"title": "test"}

# --- ValidatorAgent Tests ---

@pytest.fixture
def mock_validator_agent():
    return ValidatorAgent(api_key="fake")

@pytest.mark.asyncio
async def test_validator_agent_run(mock_validator_agent):
    with patch.object(mock_validator_agent, "call_llm", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = '{"title": "valid"}'
        with patch.object(mock_validator_agent, "parse_json") as mock_parse:
            mock_parse.return_value = {"title": "valid"}
            result = await mock_validator_agent.run({"structured_output": {"title": "test"}})
            mock_call.assert_called_once()
            mock_parse.assert_called_once_with('{"title": "valid"}')
            assert result == {"title": "valid"}

def test_validator_agent_rule_check_missing_title(mock_validator_agent):
    issues = mock_validator_agent.rule_check({"children": []})
    assert "Root node must have a title" in issues

def test_validator_agent_rule_check_depth_exceeded(mock_validator_agent):
    tree = {
        "title": "root",
        "children": [
            {
                "title": "l1",
                "children": [
                    {
                        "title": "l2",
                        "children": [
                            {
                                "title": "l3",
                                "children": [
                                    {
                                        "title": "l4",
                                        "children": [
                                            {
                                                "title": "l5",
                                                "children": []
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "title": "c2", "children": []
            }
        ]
    }
    issues = mock_validator_agent.rule_check(tree)
    assert any("Maximum depth exceeded" in issue for issue in issues)

def test_validator_agent_rule_check_missing_children_array(mock_validator_agent):
    tree = {
        "title": "root",
        "children": [
            {"title": "c1"} # missing children
        ]
    }
    tree["children"].append({"title": "c2", "children": []})
    issues = mock_validator_agent.rule_check(tree)
    assert any("missing children array" in issue for issue in issues)

def test_validator_agent_rule_check_duplicate_titles(mock_validator_agent):
    tree = {
        "title": "root",
        "children": [
            {"title": "dup", "children": []},
            {"title": "dup", "children": []}
        ]
    }
    issues = mock_validator_agent.rule_check(tree)
    assert any("Duplicate node titles" in issue for issue in issues)

def test_validator_agent_rule_check_max_children(mock_validator_agent):
    tree = {
        "title": "root",
        "children": [{"title": f"c{i}", "children": []} for i in range(8)]
    }
    issues = mock_validator_agent.rule_check(tree)
    assert any("has more than 7 children" in issue for issue in issues)

def test_validator_agent_rule_check_min_root_children(mock_validator_agent):
    tree = {
        "title": "root",
        "children": [
            {"title": "c1", "children": []}
        ]
    }
    issues = mock_validator_agent.rule_check(tree)
    assert "Minimum 2 children on root node" in issues

# --- EnhancerAgent Tests ---

@pytest.fixture
def mock_enhancer_agent():
    return EnhancerAgent(api_key="fake")

@pytest.mark.asyncio
async def test_enhancer_agent_run(mock_enhancer_agent):
    with patch.object(mock_enhancer_agent, "call_llm", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = '{"title": "enhanced"}'
        with patch.object(mock_enhancer_agent, "parse_json") as mock_parse:
            mock_parse.return_value = {"title": "enhanced"}
            result = await mock_enhancer_agent.run({"validated_output": {"title": "test"}})
            mock_call.assert_called_once()
            mock_parse.assert_called_once_with('{"title": "enhanced"}')
            assert result == {"title": "enhanced"}

# --- RendererAgent Tests ---

@pytest.fixture
def mock_renderer_agent():
    return RendererAgent(api_key="fake")

@pytest.mark.asyncio
async def test_renderer_agent_run(mock_renderer_agent):
    result = await mock_renderer_agent.run({"enhanced_output": {"key": "value"}})
    assert result == {"key": "value"}

# --- ExporterAgent Tests ---

@pytest.fixture
def mock_exporter_agent():
    return ExporterAgent(api_key="fake")

@pytest.mark.asyncio
async def test_exporter_agent_run(mock_exporter_agent):
    tree = {
        "title": "root",
        "color": "#fff",
        "icon": "icon",
        "children": [
            {
                "title": "c1",
                "color": "#000",
                "icon": "icon2"
            }
        ]
    }
    result = await mock_exporter_agent.run({"mind_map": tree})
    assert result["type"] == "mindmap"
    assert len(result["nodes"]) == 2
    assert len(result["edges"]) == 1

def test_exporter_agent_to_json_empty(mock_exporter_agent):
    result = mock_exporter_agent.to_json({})
    assert result["type"] == "mindmap"
    assert len(result["nodes"]) == 1
    assert len(result["edges"]) == 0

# --- TesterAgent Tests ---

@pytest.fixture
def mock_tester_agent():
    return TesterAgent(api_key="fake")

@pytest.mark.asyncio
async def test_tester_agent_run(mock_tester_agent):
    with patch.object(mock_tester_agent, "call_llm", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = '{"valid": true}'
        with patch.object(mock_tester_agent, "parse_json") as mock_parse:
            mock_parse.return_value = {"valid": True}
            result = await mock_tester_agent.run({"pipeline_outputs": {"test": "data"}})
            mock_call.assert_called_once()
            mock_parse.assert_called_once_with('{"valid": true}')
            assert result == {"valid": True}
