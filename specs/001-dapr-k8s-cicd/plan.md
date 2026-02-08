# Implementation Plan: Phase V - Distributed Cloud Infrastructure

**Branch**: `001-dapr-k8s-cicd` | **Date**: 2026-02-08 | **Spec**: [specs/001-dapr-k8s-cicd/spec.md](specs/001-dapr-k8s-cicd/spec.md)
**Input**: Feature specification from `/specs/001-dapr-k8s-cicd/spec.md`

## Summary

This plan outlines the detailed implementation strategy for Phase V of the Todo Application, focusing on transitioning to a distributed cloud infrastructure using Dapr for microservices communication, Kafka for event streaming, and Kubernetes for orchestration. Key components include Dapr runtime integration, an event-driven background worker, CI/CD with GitHub Actions, and cloud deployment to a Kubernetes cluster.

## Technical Context

**Language/Version**: Python 3.11+ (Backend, new Background Worker), TypeScript (Frontend), Go (Dapr sidecars implicitly)
**Primary Dependencies**: FastAPI, Dapr, Kafka client (for worker), SQLModel, Kubernetes, Helm, Docker, GitHub Actions, Redpanda Cloud (Kafka), Neon PostgreSQL (State Store)
**Storage**: Neon PostgreSQL (primarily via Dapr State Store component)
**Testing**: pytest (Python), jest/react-testing-library (TypeScript). New integration tests for Dapr pub/sub, state management, and Job API interactions. End-to-end tests for CI/CD pipeline.
**Target Platform**: Cloud Kubernetes (Azure AKS, Google GKE, Oracle OKE)
**Project Type**: Full-stack web application with a distributed microservices architecture and event-driven worker.
**Performance Goals**:
- Dapr sidecars fully operational and healthy.
- Task creation with reminder publishes to Kafka within 5 seconds.
- Background Worker processes reminder events within 10 seconds.
- Background Worker processes recurring task events within 15 seconds.
- Application accessible via public cloud URL with main landing page response < 2 seconds.
- CI/CD pipeline completes within 10 minutes.
- Dapr state store operations (read/write) under 200ms (p95).
**Constraints**:
- Adherence to Dapr component model for Pub/Sub, State Store, and Jobs API.
- Multi-environment deployment (local Minikube vs. cloud Kubernetes) using Helm.
- Automated CI/CD pipeline triggered by `main` branch pushes.
- Existing Frontend and Backend services must integrate seamlessly with Dapr.
**Scale/Scope**: Designed for production readiness in a distributed, event-driven, cloud-native environment. Supports horizontal scaling of services within Kubernetes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

N/A - The project's constitution template (`.specify/memory/constitution.md`) is not fully defined with specific principles. This plan adheres to general best practices for cloud-native development and distributed systems.

## Project Structure

### Documentation (this feature)

```text
specs/001-dapr-k8s-cicd/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# New service for the Dapr Background Worker
services/
├── worker/
│   ├── main.py     # FastAPI application for event consumption
│   ├── Dockerfile
│   └── tests/
└── [existing services, e.g., task_service.py if moved here]
```

**Structure Decision**: The project will utilize a multi-service structure with distinct `backend`, `frontend`, and a new `services/worker` directory for the Dapr event consumer. This aligns with microservices best practices and clearly separates concerns. The existing `src/services` might be refactored to `backend/src/services` or the new worker might simply leverage existing libraries from the root `src/lib`. For this plan, the `services/worker` will be a new top-level service.

## Complexity Tracking

*(Not applicable as no Constitution violations were identified due to an undefined constitution.)*

## Phase 0: Outline & Research

The detailed plan requirements provided by the user are quite specific, minimizing the need for extensive research into "unknowns". The primary research tasks will focus on ensuring compatibility and best practices for the chosen technologies.

### Research Tasks

1.  **Dapr Component Configuration Best Practices**: Research best practices for defining Dapr component YAMLs for Kafka Pub/Sub, Neon PostgreSQL State Store, and the Jobs API, including security considerations for connection strings and secrets management within Kubernetes/Dapr.
2.  **Dapr with FastAPI Integration Patterns**: Investigate recommended patterns for integrating Dapr's Pub/Sub and State Management APIs with a Python FastAPI application for both publishing and subscribing to events.
3.  **Helm Chart Best Practices for Multi-environment Deployment**: Research best practices for creating flexible Helm charts that support configuration variations between local (Minikube) and cloud Kubernetes environments.
4.  **GitHub Actions for Kubernetes Deployment**: Investigate secure and efficient GitHub Actions workflows for building Docker images, pushing to registries, and deploying Helm charts to cloud Kubernetes clusters.

## Phase 1: Design & Contracts

### Data Model (`specs/001-dapr-k8s-cicd/data-model.md`)

(This will be generated as a separate file)

### API Contracts (`specs/001-dapr-k8s-cicd/contracts/`)

(These will be generated as separate files/directories)

### Quickstart (`specs/001-dapr-k8s-cicd/quickstart.md`)

(This will be generated as a separate file)

### Agent Context Update

A `.specify/scripts/bash/update-agent-context.sh` call will be made at the end of this phase to integrate new technologies into the agent's knowledge base.