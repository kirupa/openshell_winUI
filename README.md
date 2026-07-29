# NVIDIA OpenShell — Summary

**Repo:** https://github.com/NVIDIA/OpenShell
**Docs:** https://docs.nvidia.com/openshell/latest/
**License:** Apache 2.0
**Status:** Alpha (single-player mode)
**Primary language:** Rust

## What it is

**OpenShell is NVIDIA's safe, private runtime for autonomous AI agents.** It provides sandboxed execution environments for agents (Claude Code, Codex, OpenCode, GitHub Copilot CLI, OpenClaw, Hermes, Ollama, Pi, and more) that protect your data, credentials, and infrastructure. Behavior is governed by declarative YAML policies that prevent unauthorized file access, data exfiltration, and uncontrolled network activity.

OpenShell is built *agent-first*: it ships with agent skills for tasks ranging from gateway troubleshooting to policy generation.

## How it works

Each sandbox runs in its own container with policy-enforced egress routing. A lightweight **gateway** coordinates sandbox lifecycle, and every outbound connection is intercepted by the **policy engine**, which either:

- **Allows** the request (destination + binary match a policy block),
- **Routes for inference** — strips caller credentials, injects backend credentials, and forwards to the managed model, or
- **Denies** the request and logs it.

| Component          | Role                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------- |
| **Gateway**        | Control-plane API that coordinates sandbox lifecycle and acts as the auth boundary.      |
| **Sandbox**        | Isolated runtime with container supervision and policy-enforced egress routing.          |
| **Policy Engine**  | Enforces filesystem, network, and process constraints from application layer to kernel.  |
| **Privacy Router** | Privacy-aware LLM routing that keeps sensitive context on sandbox compute.               |

Supported compute drivers: **Docker, Podman, MicroVM, and Kubernetes**.

## Protection layers (defense in depth)

| Layer      | What it protects                                    | When it applies             |
| ---------- | --------------------------------------------------- | --------------------------- |
| Filesystem | Reads/writes outside allowed paths.                 | Locked at sandbox creation. |
| Network   | Unauthorized outbound connections.                  | Hot-reloadable at runtime.  |
| Process    | Privilege escalation and dangerous syscalls.        | Locked at sandbox creation. |
| Inference  | Reroutes model API calls to controlled backends.    | Hot-reloadable at runtime.  |

Policies are declarative YAML. Static sections (filesystem, process) lock at sandbox creation; dynamic sections (network, inference) hot-reload on a running sandbox via `openshell policy set`.

## Providers

Agents need credentials (API keys, tokens, service accounts). OpenShell manages these as **providers** — named credential bundles injected into sandboxes at runtime as environment variables. Credentials never touch the sandbox filesystem. The CLI can auto-discover credentials for recognized agents (Claude, Codex, OpenCode, Copilot) from your shell, or you can create providers explicitly with `openshell provider create`.

## GPU support (experimental)

OpenShell can pass host GPUs into sandboxes for local inference, fine-tuning, or any GPU workload via `openshell sandbox create --gpu ...`. Docker-backed GPU sandboxes auto-select CDI when available, falling back to `--gpus all`. Requires NVIDIA drivers and the NVIDIA Container Toolkit on the host.

## Quickstart

**Install (binary):**

```bash
curl -LsSf https://raw.githubusercontent.com/NVIDIA/OpenShell/main/install.sh | sh
```

**Install (PyPI, via uv):**

```bash
uv tool install -U openshell
```

**Create a sandbox and launch an agent:**

```bash
openshell sandbox create -- claude   # or opencode, codex, copilot
```

**See policy in action:**

```bash
# Start with minimal outbound access
openshell sandbox create

# Apply a read-only GitHub API policy (hot reload)
openshell policy set demo --policy examples/sandbox-policy-quickstart/policy.yaml --wait

# Reconnect: GET allowed, POST denied at L7
openshell sandbox connect demo
```

## Key commands

| Command                                                    | Description                                     |
| ---------------------------------------------------------- | ----------------------------------------------- |
| `openshell sandbox create -- <agent>`                      | Create a sandbox and launch an agent.           |
| `openshell sandbox connect [name]`                         | SSH into a running sandbox.                     |
| `openshell sandbox list`                                   | List all sandboxes.                             |
| `openshell provider create --type [type] --from-existing`  | Create a credential provider from env vars.     |
| `openshell policy set <name> --policy file.yaml`           | Apply or update a policy on a running sandbox.  |
| `openshell policy get <name>`                              | Show the active policy.                         |
| `openshell inference set --provider <p> --model <m>`       | Configure the `inference.local` endpoint.       |
| `openshell logs [name] --tail`                             | Stream sandbox logs.                            |
| `openshell term`                                           | Launch the real-time terminal UI (k9s-inspired). |

## Supported agents

Out of the box: **Claude Code, OpenCode, Codex, GitHub Copilot CLI**. Via NemoClaw with managed inference: **OpenClaw, Hermes Agent**. Community: **Ollama, Pi**, and more.

## Deployment

- **Local:** Docker, Podman, or host-virtualization–backed MicroVMs.
- **Kubernetes / OpenShift (experimental):** Helm chart published to GHCR — `helm install openshell oci://ghcr.io/nvidia/openshell/helm-chart`.

---

*This README is a summary of the upstream project at https://github.com/NVIDIA/OpenShell — refer to the official docs for authoritative and up-to-date information.*
