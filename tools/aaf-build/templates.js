/**
 * Code templates for aaf build scaffold generation.
 * Each template is a function that takes ACC data and returns file content.
 */

export function agentPy(acc) {
  const level = acc.autonomy_level || "delegated";
  return `"""
Agent entry point — ${acc.intent || "AAF-compliant agent"}.
Autonomy level: ${level}

Control loop: Trigger -> Interpret Context -> Decide -> Act -> Observe Results -> Verify -> [Adapt / Stop]
"""
from gates import require_approval, validate_output
from budgets import BudgetEnforcer
from observability import trace

budget = BudgetEnforcer.from_policy("policy.yaml")


def run(trigger: dict) -> dict:
    """Execute one cycle of the agentic control loop."""
    trace.start(intent=trigger.get("intent", "unknown"))

    # 1. Interpret context
    context = interpret_context(trigger)
    trace.log("plan", context)

    # 2. Decide
    plan = decide(context)

    # 3. Act (with gate)
${level === "assistive" ? `    if not require_approval(plan):
        return {"status": "blocked", "reason": "human rejected plan"}` : `    # ${level} level: agent executes within policy bounds`}
    result = act(plan)
    trace.log("act", result)
    budget.record_step()

    # 4. Verify
    verified = validate_output(result)
    trace.log("verify", verified)

    if not verified["pass"]:
        return {"status": "failed", "reason": verified["reason"]}

    return {"status": "success", "output": result}


def interpret_context(trigger: dict) -> dict:
    """Build task context from trigger. Implement per use case."""
    return {"trigger": trigger}


def decide(context: dict) -> dict:
    """Produce an action plan. Implement per use case."""
    return {"action": "default", "context": context}


def act(plan: dict) -> dict:
    """Execute the plan. Implement tool calls here."""
    return {"executed": plan["action"]}


if __name__ == "__main__":
    import json, sys
    trigger = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {"intent": "test"}
    print(json.dumps(run(trigger), indent=2))
`;
}

export function gatesPy(acc) {
  const level = acc.autonomy_level || "delegated";
  return `"""
Validation and approval gates.
Autonomy level: ${level}
"""


def require_approval(plan: dict) -> bool:
    """
    Gate that blocks execution until approved.
    ${level === "assistive" ? "All actions require human approval at this level." : `At ${level} level, approval is required for write/delete actions.`}
    """
    action = plan.get("action", "")
    write_actions = {"write", "delete", "update", "create", "send"}

${level === "assistive"
    ? `    # Assistive: everything needs approval
    print(f"[GATE] Approval required for: {action}")
    return _get_human_approval(plan)`
    : level === "bounded-autonomous"
    ? `    # Bounded-autonomous: only escalate exceptions
    if action in write_actions and plan.get("risk", "low") == "high":
        print(f"[GATE] High-risk action needs approval: {action}")
        return _get_human_approval(plan)
    return True`
    : `    # ${level}: write/delete actions need approval
    if action in write_actions:
        print(f"[GATE] Write action needs approval: {action}")
        return _get_human_approval(plan)
    return True`}


def _get_human_approval(plan: dict) -> bool:
    """Placeholder: integrate with your approval system."""
    return True


def validate_output(result: dict) -> dict:
    """
    Post-action validation gate.
    Returns {"pass": bool, "reason": str}.
    """
    if not result:
        return {"pass": False, "reason": "Empty result"}
    if "error" in result:
        return {"pass": False, "reason": result["error"]}
    return {"pass": True, "reason": "ok"}
`;
}

export function budgetsPy(acc) {
  return `"""
Budget enforcement — steps, tokens, time, spend.
Reads limits from policy.yaml.
"""
import time
import yaml


class BudgetEnforcer:
    def __init__(self, max_steps=50, max_tokens=100_000, max_time_s=300, max_spend=1.0):
        self.max_steps = max_steps
        self.max_tokens = max_tokens
        self.max_time_s = max_time_s
        self.max_spend = max_spend
        self._steps = 0
        self._tokens = 0
        self._spend = 0.0
        self._start = time.time()

    @classmethod
    def from_policy(cls, policy_path: str) -> "BudgetEnforcer":
        """Load budget limits from a YAML policy file."""
        try:
            with open(policy_path) as f:
                policy = yaml.safe_load(f)
            budgets = policy.get("budgets", {})
            return cls(
                max_steps=budgets.get("max_steps", 50),
                max_tokens=budgets.get("max_tokens", 100_000),
                max_time_s=budgets.get("max_time_s", 300),
                max_spend=budgets.get("max_spend_usd", 1.0),
            )
        except FileNotFoundError:
            return cls()

    def record_step(self, tokens_used=0, cost=0.0):
        self._steps += 1
        self._tokens += tokens_used
        self._spend += cost
        self._check()

    def _check(self):
        elapsed = time.time() - self._start
        if self._steps > self.max_steps:
            raise BudgetExceeded(f"Step limit: {self._steps}/{self.max_steps}")
        if self._tokens > self.max_tokens:
            raise BudgetExceeded(f"Token limit: {self._tokens}/{self.max_tokens}")
        if elapsed > self.max_time_s:
            raise BudgetExceeded(f"Time limit: {elapsed:.0f}s/{self.max_time_s}s")
        if self._spend > self.max_spend:
            raise BudgetExceeded(f"Spend limit: \${self._spend:.4f}/\${self.max_spend:.2f}")

    @property
    def summary(self) -> dict:
        return {
            "steps": f"{self._steps}/{self.max_steps}",
            "tokens": f"{self._tokens}/{self.max_tokens}",
            "time_s": f"{time.time() - self._start:.1f}/{self.max_time_s}",
            "spend_usd": f"{self._spend:.4f}/{self.max_spend:.2f}",
        }


class BudgetExceeded(Exception):
    pass
`;
}

export function observabilityPy() {
  return `"""
Observability trace — intent -> plan -> act -> verify.
Structured logging for audit and debugging.
"""
import json
import time
from datetime import datetime, timezone


class Trace:
    def __init__(self):
        self._events = []
        self._intent = None
        self._start = None

    def start(self, intent: str):
        self._intent = intent
        self._start = time.time()
        self._events = []
        self._events.append({
            "phase": "intent",
            "data": intent,
            "ts": datetime.now(timezone.utc).isoformat(),
        })

    def log(self, phase: str, data):
        self._events.append({
            "phase": phase,
            "data": data if isinstance(data, (str, int, float, bool)) else str(data),
            "ts": datetime.now(timezone.utc).isoformat(),
        })

    def finish(self, status: str = "complete"):
        elapsed = time.time() - self._start if self._start else 0
        self._events.append({
            "phase": "finish",
            "data": {"status": status, "elapsed_s": round(elapsed, 3)},
            "ts": datetime.now(timezone.utc).isoformat(),
        })
        return self.to_dict()

    def to_dict(self) -> dict:
        return {
            "intent": self._intent,
            "events": self._events,
        }

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), indent=2, default=str)


trace = Trace()
`;
}

export function toolsInit() {
  return `"""
Tool definitions with permission scopes.
Register tools here and declare their required permissions.
"""

TOOLS = {
    "example_read": {
        "description": "Read data from a source",
        "permissions": ["read"],
        "handler": lambda params: {"data": "placeholder"},
    },
    "example_write": {
        "description": "Write data to a destination",
        "permissions": ["read", "write"],
        "handler": lambda params: {"written": True},
    },
}


def get_tool(name: str) -> dict:
    tool = TOOLS.get(name)
    if not tool:
        raise ValueError(f"Unknown tool: {name}")
    return tool


def list_tools() -> list:
    return [{"name": k, "description": v["description"], "permissions": v["permissions"]} for k, v in TOOLS.items()]
`;
}

export function policyYaml(acc) {
  const level = acc.autonomy_level || "delegated";
  const budgetDefaults = {
    assistive: { max_steps: 10, max_tokens: 20000, max_time_s: 60, max_spend_usd: 0.10 },
    delegated: { max_steps: 50, max_tokens: 100000, max_time_s: 300, max_spend_usd: 1.00 },
    "bounded-autonomous": { max_steps: 200, max_tokens: 500000, max_time_s: 600, max_spend_usd: 5.00 },
    supervisory: { max_steps: 500, max_tokens: 1000000, max_time_s: 1200, max_spend_usd: 10.00 },
  };
  const b = budgetDefaults[level] || budgetDefaults.delegated;

  return `# Agent Control Contract — operational policy
# Source: generated by aaf design + aaf build

intent: "${acc.intent || "No intent specified"}"
autonomy_level: ${level}

budgets:
  max_steps: ${b.max_steps}
  max_tokens: ${b.max_tokens}
  max_time_s: ${b.max_time_s}
  max_spend_usd: ${b.max_spend_usd}

escalation:
  on_budget_exceeded: halt_and_notify
  on_gate_rejected: halt_and_notify
  on_tool_error: retry_once_then_halt

control_loop:
  pattern: "Trigger -> Interpret Context -> Decide -> Act -> Observe Results -> Verify -> [Adapt / Stop]"
  observability_trace: "intent -> plan -> act -> verify"
`;
}

export function testCompliancePy(acc) {
  const level = acc.autonomy_level || "delegated";
  return `"""
Skeleton compliance tests.
Run: pytest tests/test_compliance.py
"""
import importlib
import yaml


def _load_policy():
    with open("policy.yaml") as f:
        return yaml.safe_load(f)


def test_policy_has_autonomy_level():
    policy = _load_policy()
    assert "autonomy_level" in policy
    assert policy["autonomy_level"] == "${level}"


def test_policy_has_budgets():
    policy = _load_policy()
    assert "budgets" in policy
    for key in ("max_steps", "max_tokens", "max_time_s", "max_spend_usd"):
        assert key in policy["budgets"]


def test_policy_has_escalation():
    policy = _load_policy()
    assert "escalation" in policy


def test_gates_module_exists():
    gates = importlib.import_module("gates")
    assert hasattr(gates, "require_approval")
    assert hasattr(gates, "validate_output")


def test_budgets_module_exists():
    budgets = importlib.import_module("budgets")
    assert hasattr(budgets, "BudgetEnforcer")


def test_observability_module_exists():
    obs = importlib.import_module("observability")
    assert hasattr(obs, "trace")


def test_agent_has_run():
    agent = importlib.import_module("agent")
    assert hasattr(agent, "run")
`;
}

export function requirementsTxt() {
  return `pyyaml>=6.0
`;
}

export function agentsMd(acc) {
  const level = acc.autonomy_level || "delegated";
  return `# AGENTS.md — Repository Operating Instructions

## Agent identity
- **Intent:** ${acc.intent || "Not specified"}
- **Autonomy level:** ${level}

## Control loop
\`\`\`
Trigger -> Interpret Context -> Decide -> Act -> Observe Results -> Verify -> [Adapt / Stop]
\`\`\`

## Observability trace
Every execution must emit: \`intent -> plan -> act -> verify\`

## Budgets
See \`policy.yaml\` for step/token/time/spend limits.

## Escalation
- Budget exceeded: halt and notify
- Gate rejected: halt and notify
- Tool error: retry once, then halt

## File structure
- \`agent.py\` — main entry point
- \`gates.py\` — approval and validation gates
- \`budgets.py\` — budget enforcement
- \`observability.py\` — structured tracing
- \`tools/__init__.py\` — tool definitions
- \`policy.yaml\` — operational policy (ACC)
- \`tests/test_compliance.py\` — compliance tests
`;
}

export function accMarkdown(acc) {
  const level = acc.autonomy_level || "delegated";
  const pillars = acc.pillars || {};
  let md = `# Agent Control Contract

**Intent:** ${acc.intent || "Not specified"}
**Autonomy level:** ${level}
**Generated:** ${new Date().toISOString().slice(0, 10)}

## Pillar Assessments

`;

  for (const [pillarId, questions] of Object.entries(pillars)) {
    md += `### ${pillarId}\n\n`;
    if (Array.isArray(questions)) {
      for (const q of questions) {
        const badge = q.answer === "yes" ? "[x]" : q.answer === "partial" ? "[-]" : "[ ]";
        md += `- ${badge} ${q.question} — **${q.answer}**\n`;
      }
    }
    md += "\n";
  }

  if (acc.active_tradeoffs?.length > 0) {
    md += "## Active Trade-offs\n\n";
    for (const t of acc.active_tradeoffs) {
      md += `- **${t.pillars?.join(" / ")}**: ${t.tension}\n  - Recommendation: ${t.recommendation}\n`;
    }
  }

  return md;
}
