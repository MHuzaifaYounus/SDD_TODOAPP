---
id: 0002
title: Create Plan for Dapr K8s CI/CD
stage: plan
date: 2026-02-08
surface: agent
model: gemini-cli-agent
feature: 001-dapr-k8s-cicd
branch: 001-dapr-k8s-cicd
user: user
command: /sp.plan Goal: detailed implementation plan for Phase V Distributed Infrastructure and Cloud Deployment. Plan Requirements: 1. **Dapr Environment Setup:** - Steps to initialize Dapr on the Minikube cluster (`dapr init -k`). - Creation of the Dapr Component folder (`/dapr/components`). 2. **Dapr Component Configuration:** - YAML for `pubsub.kafka`: Link it to Redpanda Cloud (or a local Kafka container). - YAML for `state.postgresql`: Link it to your Neon Database via Dapr. - YAML for `scheduler`: Configure for Dapr Jobs API support. 3. **Background Worker Service (The Event Consumer):** - Structure a new `/services/worker` folder. - Implement a Python FastAPI worker that subscribes to the `reminders` and `task-events` topics via Dapr. - Add logic to handle recurring task spawning: When a task is completed, if it's "recurring", the worker creates a new task in the DB. 4. **Frontend Sidecar Integration:** - Update `k8s/deployment.yaml` with Dapr annotations (`dapr.io/enabled: "true"`, `dapr.io/app-id: "todo-frontend"`). - Refactor the frontend `dbService` or `eventService` to publish events to the Dapr sidecar (HTTP POST to `localhost:3500`). 5. **CI/CD Pipeline (GitHub Actions):** - Create `.github/workflows/deploy.yml`. - Steps to build both Frontend and Worker images. - Steps to push to Docker Hub. - Steps to update the cluster using Helm. 6. **Cloud Cluster Provisioning:** - Guidance on connecting `kubectl` to Azure AKS, Google GKE, or Oracle OKE. - Configuration of a Cloud LoadBalancer to expose the app to the internet. 7. **Verification Steps:** - Commands to check Dapr sidecar logs. - Test case: Marking a recurring task as done and verifying the new one appears automatically via Kafka/Worker logic.
labels: ["implementation-plan", "dapr", "kubernetes", "ci-cd"]
links:
  spec: specs/001-dapr-k8s-cicd/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-dapr-k8s-cicd/plan.md
  - specs/001-dapr-k8s-cicd/research.md
  - specs/001-dapr-k8s-cicd/data-model.md
  - specs/001-dapr-k8s-cicd/contracts/reminder_event.yaml
  - specs/001-dapr-k8s-cicd/contracts/recurring_task_event.yaml
  - specs/001-dapr-k8s-cicd/quickstart.md
tests: []
---

## Prompt

/sp.plan Goal: detailed implementation plan for Phase V Distributed Infrastructure and Cloud Deployment. Plan Requirements: 1. **Dapr Environment Setup:** - Steps to initialize Dapr on the Minikube cluster (`dapr init -k`). - Creation of the Dapr Component folder (`/dapr/components`). 2. **Dapr Component Configuration:** - YAML for `pubsub.kafka`: Link it to Redpanda Cloud (or a local Kafka container). - YAML for `state.postgresql`: Link it to your Neon Database via Dapr. - YAML for `scheduler`: Configure for Dapr Jobs API support. 3. **Background Worker Service (The Event Consumer):** - Structure a new `/services/worker` folder. - Implement a Python FastAPI worker that subscribes to the `reminders` and `task-events` topics via Dapr. - Add logic to handle recurring task spawning: When a task is completed, if it's "recurring", the worker creates a new task in the DB. 4. **Frontend Sidecar Integration:** - Update `k8s/deployment.yaml` with Dapr annotations (`dapr.io/enabled: "true"`, `dapr.io/app-id: "todo-frontend"`). - Refactor the frontend `dbService` or `eventService` to publish events to the Dapr sidecar (HTTP POST to `localhost:3500`). 5. **CI/CD Pipeline (GitHub Actions):** - Create `.github/workflows/deploy.yml`. - Steps to build both Frontend and Worker images. - Steps to push to Docker Hub. - Steps to update the cluster using Helm. 6. **Cloud Cluster Provisioning:** - Guidance on connecting `kubectl` to Azure AKS, Google GKE, or Oracle OKE. - Configuration of a Cloud LoadBalancer to expose the app to the internet. 7. **Verification Steps:** - Commands to check Dapr sidecar logs. - Test case: Marking a recurring task as done and verifying the new one appears automatically via Kafka/Worker logic.

## Response snapshot

Generated a detailed implementation plan (`specs/001-dapr-k8s-cicd/plan.md`), research findings (`research.md`), data model (`data-model.md`), API contracts (`contracts/reminder_event.yaml`, `contracts/recurring_task_event.yaml`), and a quickstart guide (`quickstart.md`) for the "Phase V - Distributed Cloud Infrastructure" feature. The plan covers Dapr setup, component configuration, background worker implementation, frontend integration, CI/CD, and cloud provisioning.

## Outcome

- ✅ Impact: Detailed implementation plan created.
- 🧪 Tests: N/A
- 📁 Files: Created `plan.md`, `research.md`, `data-model.md`, `contracts/*.yaml`, `quickstart.md`.
- 🔁 Next prompts: /sp.tasks
- 🧠 Reflection: Successfully generated a comprehensive plan including research, data model, contracts, and a quickstart guide based on detailed requirements. Encountered minor warnings about spec directory prefixes but proceeded.

## Evaluation notes (flywheel)

- Failure modes observed: `setup-plan.sh` reported a warning about multiple spec directories with the same prefix, but did not hinder the generation of plan artifacts.
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A