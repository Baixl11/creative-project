from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any


SKILL_DIR = Path(__file__).resolve().parents[1]
TEMPLATES_DIR = SKILL_DIR / "assets" / "templates"
MAX_SKILL_DESCRIPTION_LENGTH = 1024


class BootstrapError(Exception):
    pass


@dataclass(frozen=True)
class RenderAction:
    source: Path
    target: Path
    status: str


def parse_args(description: str) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument("--plan", required=True, help="Path to bootstrap plan JSON/YAML.")
    parser.add_argument("--target", required=True, help="Target project root.")
    return parser.parse_args()


def read_plan(plan_path: Path) -> dict[str, Any]:
    if not plan_path.exists():
        raise BootstrapError(f"Plan not found: {plan_path}")

    text = plan_path.read_text(encoding="utf-8")
    suffix = plan_path.suffix.lower()

    if suffix == ".json":
        try:
            loaded = json.loads(text)
        except json.JSONDecodeError as exc:
            raise BootstrapError(f"Invalid JSON plan: {exc}") from exc
        if not isinstance(loaded, dict):
            raise BootstrapError("Plan root must be a mapping.")
        return loaded

    if suffix in {".yaml", ".yml"}:
        try:
            import yaml  # type: ignore
        except ModuleNotFoundError as exc:
            raise BootstrapError("YAML plan requires PyYAML. Install pyyaml or use JSON plan.") from exc

        try:
            loaded = yaml.safe_load(text)
        except yaml.YAMLError as exc:  # type: ignore[attr-defined]
            raise BootstrapError(f"Invalid YAML plan: {exc}") from exc
        if not isinstance(loaded, dict):
            raise BootstrapError("Plan root must be a mapping.")
        return loaded

    raise BootstrapError("Plan must be .json, .yaml, or .yml.")


def require_mapping(value: Any, path: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise BootstrapError(f"{path} must be a mapping.")
    return value


def require_string(value: Any, path: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise BootstrapError(f"{path} must be a non-empty string.")
    return value.strip()


def require_bool(value: Any, path: str) -> bool:
    if not isinstance(value, bool):
        raise BootstrapError(f"{path} must be a boolean.")
    return value


def require_skill_slug(value: Any, path: str) -> str:
    text = require_string(value, path)
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,62}", text):
        raise BootstrapError(f"{path} must use lowercase letters, digits, and hyphens only.")
    return text


def require_list(value: Any, path: str) -> list[Any]:
    if not isinstance(value, list):
        raise BootstrapError(f"{path} must be a list.")
    return value


def validate_plan(plan: dict[str, Any]) -> None:
    project = require_mapping(plan.get("project"), "project")
    bootstrap = require_mapping(plan.get("bootstrap"), "bootstrap")
    git = require_mapping(plan.get("git"), "git")
    sensors = require_mapping(plan.get("sensors"), "sensors")
    workspace = require_mapping(plan.get("workspace", {}), "workspace")
    environment = require_mapping(plan.get("environment", {}), "environment")

    require_string(project.get("name"), "project.name")
    require_string(project.get("kind"), "project.kind")
    confidence = require_string(project.get("confidence"), "project.confidence")
    mode = require_string(bootstrap.get("mode"), "bootstrap.mode")
    require_skill_slug(bootstrap.get("request_skill_name"), "bootstrap.request_skill_name")
    require_bool(bootstrap.get("allow_overwrite", False), "bootstrap.allow_overwrite")
    require_string(git.get("branch_pattern"), "git.branch_pattern")
    require_string(git.get("task_path_pattern"), "git.task_path_pattern")
    require_bool(git.get("auto_push", False), "git.auto_push")

    if confidence not in {"low", "medium", "high"}:
        raise BootstrapError("project.confidence must be low, medium, or high.")

    if mode not in {"minimal", "standard", "strict"}:
        raise BootstrapError("bootstrap.mode must be minimal, standard, or strict.")

    if git["branch_pattern"] != "harness/<type>/<short-slug>":
        raise BootstrapError("git.branch_pattern must be harness/<type>/<short-slug>.")

    if git["task_path_pattern"] != ".harness/tasks/<YYYY-MM-DD>/<type>/<short-slug>":
        raise BootstrapError("git.task_path_pattern must be .harness/tasks/<YYYY-MM-DD>/<type>/<short-slug>.")

    if workspace:
        require_string(workspace.get("root", "."), "workspace.root")
        require_string(workspace.get("target_project", "."), "workspace.target_project")
        for index, item in enumerate(require_list(workspace.get("related_projects", []), "workspace.related_projects")):
            project_path = f"workspace.related_projects[{index}]"
            project_map = require_mapping(item, project_path)
            require_string(project_map.get("name"), f"{project_path}.name")
            require_string(project_map.get("path"), f"{project_path}.path")
            require_string(project_map.get("role"), f"{project_path}.role")
            require_string(project_map.get("evidence"), f"{project_path}.evidence")
            require_list(project_map.get("commands", []), f"{project_path}.commands")
            harness_status = project_map.get("harness_status")
            if harness_status is not None and harness_status not in {"present", "absent", "unknown"}:
                raise BootstrapError(f"{project_path}.harness_status must be present, absent, or unknown.")
            write_policy = project_map.get("write_policy")
            if write_policy is not None and write_policy not in {"ask_before_write", "allowed_by_default", "needs_clarification"}:
                raise BootstrapError(
                    f"{project_path}.write_policy must be ask_before_write, allowed_by_default, or needs_clarification."
                )
            branch_policy = project_map.get("branch_policy")
            if branch_policy is not None and branch_policy not in {"same_task_branch", "independent_harness_required", "not_applicable"}:
                raise BootstrapError(
                    f"{project_path}.branch_policy must be same_task_branch, independent_harness_required, or not_applicable."
                )
        for index, item in enumerate(require_list(workspace.get("command_graph", []), "workspace.command_graph")):
            command_path = f"workspace.command_graph[{index}]"
            command_map = require_mapping(item, command_path)
            require_string(command_map.get("command"), f"{command_path}.command")
            require_string(command_map.get("evidence"), f"{command_path}.evidence")
            require_list(command_map.get("touches", []), f"{command_path}.touches")
        require_list(workspace.get("unresolved", []), "workspace.unresolved")

    for group_name in ("native", "harness", "future"):
        sensor_list = require_list(sensors.get(group_name, []), f"sensors.{group_name}")
        for index, sensor in enumerate(sensor_list):
            sensor_path = f"sensors.{group_name}[{index}]"
            sensor_map = require_mapping(sensor, sensor_path)
            require_string(sensor_map.get("name"), f"{sensor_path}.name")
            require_string(sensor_map.get("command"), f"{sensor_path}.command")
            require_string(sensor_map.get("purpose"), f"{sensor_path}.purpose")

    if environment:
        require_mapping(environment.get("runtime", {}), "environment.runtime")
        require_mapping(environment.get("frontend", {}), "environment.frontend")
        require_mapping(environment.get("mcp_playwright", {}), "environment.mcp_playwright")
        require_list(environment.get("unresolved", []), "environment.unresolved")
        for index, item in enumerate(require_list(environment.get("commands", []), "environment.commands")):
            command_path = f"environment.commands[{index}]"
            command_map = require_mapping(item, command_path)
            require_string(command_map.get("name"), f"{command_path}.name")
            require_string(command_map.get("command"), f"{command_path}.command")
            require_string(command_map.get("purpose"), f"{command_path}.purpose")


def safe_target(root: Path, relative: str) -> Path:
    if "\\" in relative:
        relative = relative.replace("\\", "/")
    target = (root / relative).resolve()
    root_resolved = root.resolve()
    if root_resolved != target and root_resolved not in target.parents:
        raise BootstrapError(f"Unsafe target path outside project: {relative}")
    return target


def slug_title(name: str) -> str:
    return " ".join(part.capitalize() for part in re.split(r"[-_\s]+", name) if part)


def as_bullets(items: list[Any]) -> str:
    if not items:
        return "- 待补充"
    return "\n".join(f"- {item}" for item in items)


def yaml_quote(value: Any) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if value is None:
        return "null"
    if isinstance(value, (int, float)):
        return str(value)
    return json.dumps(str(value), ensure_ascii=False)


def as_yaml_list(items: list[Any], indent: int = 4) -> str:
    padding = " " * indent
    if not items:
        return f"{padding}- \"待补充\""
    return "\n".join(f"{padding}- {yaml_quote(item)}" for item in items)


def as_yaml_block(value: Any, indent: int = 0) -> str:
    padding = " " * indent
    if isinstance(value, dict):
        if not value:
            return f"{padding}{{}}"
        lines: list[str] = []
        for key, item in value.items():
            if isinstance(item, (dict, list)):
                lines.append(f"{padding}{key}:")
                lines.append(as_yaml_block(item, indent + 2))
            else:
                lines.append(f"{padding}{key}: {yaml_quote(item)}")
        return "\n".join(lines)

    if isinstance(value, list):
        if not value:
            return f"{padding}[]"
        lines = []
        for item in value:
            if isinstance(item, dict):
                lines.append(f"{padding}-")
                lines.append(as_yaml_block(item, indent + 2))
            elif isinstance(item, list):
                lines.append(f"{padding}-")
                lines.append(as_yaml_block(item, indent + 2))
            else:
                lines.append(f"{padding}- {yaml_quote(item)}")
        return "\n".join(lines)

    return f"{padding}{yaml_quote(value)}"


def sensor_yaml(items: list[Any], indent: int = 4) -> str:
    padding = " " * indent
    if not items:
        return f"{padding}- name: \"pending\"\n{padding}  command: \"待确认\"\n{padding}  purpose: \"待确认\""

    lines: list[str] = []
    for item in items:
        sensor = require_mapping(item, "sensor")
        lines.append(f"{padding}- name: {yaml_quote(sensor['name'])}")
        lines.append(f"{padding}  command: {yaml_quote(sensor['command'])}")
        lines.append(f"{padding}  purpose: {yaml_quote(sensor['purpose'])}")
    return "\n".join(lines)


def sensor_json(items: list[Any]) -> str:
    return json.dumps(items, ensure_ascii=False, indent=4)


def environment_commands_markdown(items: list[Any]) -> str:
    if not items:
        return "- 待确认运行、调试、构建和交互验证命令"

    lines: list[str] = []
    for item in items:
        if not isinstance(item, dict):
            lines.append(f"- {item}")
            continue

        name = item.get("name", "unnamed")
        command = item.get("command", "待确认")
        purpose = item.get("purpose", "待确认")
        category = item.get("category", "general")
        working_dir = item.get("working_dir", ".")
        long_running = "长驻" if item.get("long_running") else "一次性"
        lines.append(
            f"- `{name}`（{category}，{long_running}）：`{command}`，目录：`{working_dir}`，用途：{purpose}"
        )
    return "\n".join(lines)


def template_variables(plan: dict[str, Any]) -> dict[str, str]:
    project = require_mapping(plan["project"], "project")
    bootstrap = require_mapping(plan["bootstrap"], "bootstrap")
    paths = require_mapping(plan.get("paths", {}), "paths")
    workspace = require_mapping(plan.get("workspace", {}), "workspace")
    environment = require_mapping(plan.get("environment", {}), "environment")
    sensors = require_mapping(plan["sensors"], "sensors")
    architecture = require_mapping(plan.get("architecture", {}), "architecture")
    docs = require_mapping(plan.get("docs", {}), "docs")

    project_name = require_string(project["name"], "project.name")
    request_skill_name = require_string(bootstrap["request_skill_name"], "bootstrap.request_skill_name")
    native_sensors = require_list(sensors.get("native", []), "sensors.native")
    harness_sensors = require_list(sensors.get("harness", []), "sensors.harness")
    future_sensors = require_list(sensors.get("future", []), "sensors.future")
    source_paths = require_list(paths.get("source", []), "paths.source")
    generated_paths = require_list(paths.get("generated", []), "paths.generated")
    forbidden_paths = require_list(paths.get("forbidden_to_edit", []), "paths.forbidden_to_edit")
    workspace_root = str(workspace.get("root") or ".")
    workspace_target = str(workspace.get("target_project") or ".")
    related_projects = require_list(workspace.get("related_projects", []), "workspace.related_projects")
    command_graph = require_list(workspace.get("command_graph", []), "workspace.command_graph")
    workspace_unresolved = require_list(workspace.get("unresolved", []), "workspace.unresolved")
    environment_runtime = require_mapping(environment.get("runtime", {}), "environment.runtime")
    environment_commands = require_list(environment.get("commands", []), "environment.commands")
    frontend_environment = require_mapping(environment.get("frontend", {}), "environment.frontend")
    mcp_playwright = require_mapping(environment.get("mcp_playwright", {}), "environment.mcp_playwright")
    environment_unresolved = require_list(environment.get("unresolved", []), "environment.unresolved")
    top_level_map = require_list(architecture.get("top_level_map", []), "architecture.top_level_map")
    domain_boundaries = require_list(architecture.get("domain_boundaries", []), "architecture.domain_boundaries")
    forbidden_rules = require_list(architecture.get("forbidden_rules", []), "architecture.forbidden_rules")
    detection_evidence = require_list(docs.get("detection_evidence", []), "docs.detection_evidence")
    assumptions = require_list(docs.get("assumptions", []), "docs.assumptions")
    skipped_items = require_list(docs.get("skipped_items", []), "docs.skipped_items")

    sensor_commands = as_bullets([sensor["command"] for sensor in native_sensors + harness_sensors])
    project_commands = as_bullets([f"`{sensor['command']}` - {sensor['purpose']}" for sensor in native_sensors])
    sensor_descriptions = as_bullets([f"`{sensor['name']}`：{sensor['purpose']}，命令：`{sensor['command']}`" for sensor in native_sensors + harness_sensors])

    return {
        "PROJECT_NAME": project_name,
        "PROJECT_KIND": require_string(project["kind"], "project.kind"),
        "PROFILE_CONFIDENCE": require_string(project["confidence"], "project.confidence"),
        "PROJECT_SUMMARY": str(project.get("summary") or "待补充"),
        "BOOTSTRAP_MODE": require_string(bootstrap["mode"], "bootstrap.mode"),
        "REQUEST_SKILL_NAME": request_skill_name,
        "SOURCE_PATHS_YAML": as_yaml_list(source_paths, 4),
        "GENERATED_PATHS_YAML": as_yaml_list(generated_paths, 4),
        "FORBIDDEN_PATHS_YAML": as_yaml_list(forbidden_paths, 4),
        "WORKSPACE_ROOT": workspace_root,
        "WORKSPACE_TARGET_PROJECT": workspace_target,
        "RELATED_PROJECTS_YAML": as_yaml_block(related_projects, 4),
        "RELATED_PROJECTS_YAML_6": as_yaml_block(related_projects, 6),
        "COMMAND_GRAPH_YAML": as_yaml_block(command_graph, 4),
        "COMMAND_GRAPH_YAML_6": as_yaml_block(command_graph, 6),
        "WORKSPACE_UNRESOLVED_YAML": as_yaml_block(workspace_unresolved, 4),
        "ENV_RUNTIME_YAML": as_yaml_block(environment_runtime, 2),
        "ENV_RUNTIME_YAML_4": as_yaml_block(environment_runtime, 4),
        "ENV_COMMANDS_YAML": as_yaml_block(environment_commands, 2),
        "ENV_COMMANDS_YAML_4": as_yaml_block(environment_commands, 4),
        "FRONTEND_ENVIRONMENT_YAML": as_yaml_block(frontend_environment, 2),
        "FRONTEND_ENVIRONMENT_YAML_4": as_yaml_block(frontend_environment, 4),
        "MCP_PLAYWRIGHT_YAML": as_yaml_block(mcp_playwright, 2),
        "MCP_PLAYWRIGHT_YAML_4": as_yaml_block(mcp_playwright, 4),
        "ENVIRONMENT_UNRESOLVED_YAML": as_yaml_block(environment_unresolved, 2),
        "ENVIRONMENT_UNRESOLVED_YAML_4": as_yaml_block(environment_unresolved, 4),
        "ENVIRONMENT_COMMANDS": environment_commands_markdown(environment_commands),
        "RELATED_PROJECTS_JSON": json.dumps(related_projects, ensure_ascii=False, indent=6),
        "COMMAND_GRAPH_JSON": json.dumps(command_graph, ensure_ascii=False, indent=6),
        "RELATED_PROJECTS": as_bullets([
            f"{item.get('name', 'unknown')}：{item.get('path', '待补充')}，{item.get('role', '待补充')}"
            if isinstance(item, dict)
            else str(item)
            for item in related_projects
        ]),
        "COMMAND_GRAPH": as_bullets([
            f"{item.get('command', '待补充')}：{item.get('evidence', '待补充')}"
            if isinstance(item, dict)
            else str(item)
            for item in command_graph
        ]),
        "NATIVE_SENSORS_YAML": sensor_yaml(native_sensors, 4),
        "HARNESS_SENSORS_YAML": sensor_yaml(harness_sensors, 4),
        "FUTURE_SENSORS_YAML": sensor_yaml(future_sensors, 4),
        "NATIVE_SENSORS_JSON": sensor_json(native_sensors),
        "HARNESS_SENSORS_JSON": sensor_json(harness_sensors),
        "SNAPSHOT_IGNORE_JSON": json.dumps(generated_paths + ["node_modules", ".git"], ensure_ascii=False, indent=4),
        "TOP_LEVEL_MAP": as_bullets(top_level_map),
        "TOP_LEVEL_MAP_YAML": as_yaml_list(top_level_map, 4),
        "DOMAIN_BOUNDARIES": as_bullets(domain_boundaries),
        "DOMAIN_BOUNDARIES_YAML": as_yaml_list(domain_boundaries, 4),
        "FORBIDDEN_RULES": as_bullets(forbidden_rules),
        "FORBIDDEN_RULES_YAML": as_yaml_list(forbidden_rules, 4),
        "GENERATED_PATHS": as_bullets(generated_paths),
        "SENSOR_COMMANDS": sensor_commands,
        "PROJECT_COMMANDS": project_commands,
        "SENSOR_DESCRIPTIONS": sensor_descriptions,
        "KNOWN_GAPS": as_bullets(skipped_items),
        "DETECTION_EVIDENCE": as_bullets(detection_evidence),
        "DETECTION_EVIDENCE_YAML": as_yaml_list(detection_evidence, 4),
        "GENERATED_FILES": "- 由 preview/render 输出确认",
        "SELECTED_SENSORS": sensor_descriptions,
        "ASSUMPTIONS": as_bullets(assumptions),
        "ASSUMPTIONS_YAML": as_yaml_list(assumptions, 4),
        "SKIPPED_ITEMS": as_bullets(skipped_items),
        "SKIPPED_ITEMS_YAML": as_yaml_list(skipped_items, 4),
        "REVIEW_AND_MERGE_SUMMARY": "机器验证通过后进入 ready_for_human_review；不自动 push，不自动 merge。",
        "RELIABILITY_MECHANISMS": sensor_descriptions,
        "RELIABILITY_GAPS": as_bullets(skipped_items),
        "RELIABILITY_NEXT_STEPS": "- 根据后续任务反馈补充传感器",
        "SECURITY_BOUNDARIES": as_bullets(domain_boundaries),
        "SECURITY_RISKS": as_bullets(forbidden_rules),
        "ARCHITECTURE_SCORE": "待评估",
        "STATIC_SCORE": "待评估",
        "VERIFICATION_SCORE": "待评估",
        "DOC_SCORE": "待评估",
        "HARNESS_SCORE": "待评估",
        "BOUNDARIES_YAML": as_yaml_list(domain_boundaries, 2),
        "VERIFICATION_COMMANDS_YAML": as_yaml_list([sensor["command"] for sensor in native_sensors + harness_sensors], 2),
    }


def render_template(text: str, variables: dict[str, str]) -> str:
    def replace(match: re.Match[str]) -> str:
        key = match.group(1)
        return variables.get(key, match.group(0))

    return re.sub(r"\{\{([A-Z0-9_]+)\}\}", replace, text)


def skill_description(text: str) -> str | None:
    normalized = text.replace("\r\n", "\n")
    if not normalized.startswith("---\n"):
        return None

    end = normalized.find("\n---", 4)
    if end == -1:
        return None

    frontmatter = normalized[4:end]
    for line in frontmatter.splitlines():
        if line.startswith("description:"):
            return line.split(":", 1)[1].strip().strip('"').strip("'")
    return None


def validate_skill_frontmatter(actions: list[RenderAction], variables: dict[str, str]) -> None:
    for action in actions:
        if action.target.name != "SKILL.md":
            continue

        content = render_template(action.source.read_text(encoding="utf-8"), variables)
        description = skill_description(content)
        if description is None:
            raise BootstrapError(f"Skill template is missing frontmatter description: {action.source.name}")
        if len(description) > MAX_SKILL_DESCRIPTION_LENGTH:
            raise BootstrapError(
                f"Skill description exceeds {MAX_SKILL_DESCRIPTION_LENGTH} characters: "
                f"{action.source.name} renders to {len(description)} characters"
            )


def template_targets(request_skill_name: str) -> dict[str, str]:
    return {
        "AGENTS.md.template": "AGENTS.md",
        "ARCHITECTURE.md.template": "ARCHITECTURE.md",
        "environment.yaml.template": ".harness/environment.yaml",
        "project-profile.yaml.template": ".harness/project-profile.yaml",
        "manifest.json.template": ".harness/manifest.json",
        "workspace-map.yaml.template": ".harness/workspace-map.yaml",
        "current-task.json.template": ".harness/current-task.json",
        "invariants.yaml.template": ".harness/invariants.yaml",
        "human-gates.yaml.template": ".harness/human-gates.yaml",
        "tasks-README.md.template": ".harness/tasks/README.md",
        "task-index.json.template": ".harness/tasks/index.json",
        "project-harness-request.SKILL.md.template": f".agents/skills/{request_skill_name}/SKILL.md",
        "openai.yaml.template": f".agents/skills/{request_skill_name}/agents/openai.yaml",
        "task-file-contract.md.template": f".agents/skills/{request_skill_name}/references/task-file-contract.md",
        "stage-checklist.md.template": f".agents/skills/{request_skill_name}/references/stage-checklist.md",
        "git-workflow.md.template": f".agents/skills/{request_skill_name}/references/git-workflow.md",
        "problem-decomposition.md.template": f".agents/skills/{request_skill_name}/references/problem-decomposition.md",
        "research-protocol.md.template": f".agents/skills/{request_skill_name}/references/research-protocol.md",
        "uncertainty-gates.md.template": f".agents/skills/{request_skill_name}/references/uncertainty-gates.md",
        "functional-verification.md.template": f".agents/skills/{request_skill_name}/references/functional-verification.md",
        "runtime-verification.md.template": f".agents/skills/{request_skill_name}/references/runtime-verification.md",
        "interaction-verification.md.template": f".agents/skills/{request_skill_name}/references/interaction-verification.md",
        "task-routing.md.template": f".agents/skills/{request_skill_name}/references/task-routing.md",
        "task-observability.md.template": f".agents/skills/{request_skill_name}/references/task-observability.md",
        "visual-task-profile.md.template": f".agents/skills/{request_skill_name}/references/visual-task-profile.md",
        "harness-operating-model.md.template": "docs/design-docs/harness-operating-model.md",
        "harness-bootstrap-report.md.template": "docs/design-docs/harness-bootstrap-report.md",
        "COMMANDS.md.template": "docs/generated/COMMANDS.md",
        "FEEDBACK_FLYWHEEL.md.template": "docs/generated/FEEDBACK_FLYWHEEL.md",
        "HARNESS_GARDENING.md.template": "docs/HARNESS_GARDENING.md",
        "REVIEW_AND_MERGE.md.template": "docs/REVIEW_AND_MERGE.md",
        "QUALITY_SCORE.md.template": "docs/QUALITY_SCORE.md",
        "RELIABILITY.md.template": "docs/RELIABILITY.md",
        "SECURITY.md.template": "docs/SECURITY.md",
        "harness-self-check.md.template": "docs/generated/HARNESS_SELF_CHECK.md",
        "bootstrap-config.yaml.template": ".harness/bootstrap-config.yaml",
    }


def plan_actions(plan: dict[str, Any], target_root: Path) -> tuple[dict[str, str], list[RenderAction]]:
    validate_plan(plan)
    variables = template_variables(plan)
    request_skill_name = variables["REQUEST_SKILL_NAME"]
    targets = template_targets(request_skill_name)
    allow_overwrite = require_bool(require_mapping(plan["bootstrap"], "bootstrap").get("allow_overwrite", False), "bootstrap.allow_overwrite")
    actions: list[RenderAction] = []

    for template_name, relative_target in sorted(targets.items(), key=lambda item: item[1]):
        source = TEMPLATES_DIR / template_name
        if not source.exists():
            raise BootstrapError(f"Template missing: {source}")
        target = safe_target(target_root, relative_target)
        if target.exists() and not allow_overwrite:
            status = "conflict"
        elif target.exists():
            status = "overwrite"
        else:
            status = "create"
        actions.append(RenderAction(source=source, target=target, status=status))

    root_resolved = target_root.resolve()
    variables["GENERATED_FILES"] = "\n".join(
        f"- `{action.target.relative_to(root_resolved).as_posix()}`：{action.status}" for action in actions
    )
    validate_skill_frontmatter(actions, variables)
    return variables, actions


def render_action(action: RenderAction, variables: dict[str, str]) -> str:
    text = action.source.read_text(encoding="utf-8")
    return render_template(text, variables)
