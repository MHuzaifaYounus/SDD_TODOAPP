# Quickstart Guide: Phase V - Distributed Cloud Infrastructure

**Feature Branch**: `001-dapr-k8s-cicd`  
**Date**: 2026-02-08  
**Plan**: [specs/001-dapr-k8s-cicd/plan.md](specs/001-dapr-k8s-cicd/plan.md)
**Spec**: [specs/001-dapr-k8s-cicd/spec.md](specs/001-dapr-k8s-cicd/spec.md)

This guide provides steps to get the Todo Application running locally with Dapr and Minikube, simulating the distributed cloud environment.

## Prerequisites

-   Docker Desktop (or Docker Engine + Minikube)
-   `kubectl`
-   `dapr CLI`
-   `helm`
-   Python 3.11+
-   Node.js 18+ (for Frontend)

## 1. Setup Minikube and Dapr

1.  **Start Minikube**:
    ```bash
    minikube start
    ```

2.  **Initialize Dapr on Minikube**:
    ```bash
    dapr init -k
    ```
    Verify Dapr components are running:
    ```bash
    kubectl get pods -n dapr-system
    ```

## 2. Configure Dapr Components

1.  **Create Dapr Component Directory**:
    ```bash
    mkdir -p dapr/components
    ```

2.  **Create `pubsub.kafka.yaml`**: (Replace `your-redpanda-broker` and `your-kafka-sasl-secret`)
    ```yaml
    # dapr/components/pubsub.kafka.yaml
    apiVersion: dapr.io/v1alpha1
    kind: Component
    metadata:
      name: pubsub-kafka
      namespace: default
    spec:
      type: pubsub.kafka
      version: v1
      metadata:
      - name: brokers
        value: "your-redpanda-broker:9092" # e.g., "localhost:9092" for local Redpanda/Kafka
      - name: authRequired
        value: "true"
      - name: saslMechanism
        value: "PLAIN"
      - name: saslUsername
        secretKeyRef:
            name: kafka-secrets
            key: username
      - name: saslPassword
        secretKeyRef:
            name: kafka-secrets
            key: password
      - name: enableTLS
        value: "true"
    ```
    *   **Note**: For local development, you might configure Dapr to use a local Kafka/Redpanda instance.

3.  **Create `state.postgresql.yaml`**: (Replace `your-neon-pg-connection-string`)
    ```yaml
    # dapr/components/state.postgresql.yaml
    apiVersion: dapr.io/v1alpha1
    kind: Component
    metadata:
      name: statestore-pg
      namespace: default
    spec:
      type: state.postgresql
      version: v1
      metadata:
      - name: connectionString
        secretKeyRef:
            name: pg-secrets
            key: connectionString
      - name: table
        value: "daprstate"
      - name: schema
        value: "public"
    ```

4.  **Create Kubernetes Secrets**:
    ```bash
    kubectl create secret generic kafka-secrets --from-literal=username=your-kafka-username --from-literal=password=your-kafka-password
    kubectl create secret generic pg-secrets --from-literal=connectionString="postgres://user:password@host:port/database"
    ```

5.  **Apply Dapr Components**:
    ```bash
    kubectl apply -f dapr/components/
    ```

## 3. Run Application with Dapr Sidecars (Local Development)

This section assumes you have your Frontend (Node.js/Vite) and Backend (Python/FastAPI) services set up in their respective directories.

1.  **Run Backend (e.g., `main.py`):**
    ```bash
    dapr run --app-id todo-backend --app-port 8000 --dapr-http-port 3500 -- python main.py
    ```
    *   Replace `8000` with your actual FastAPI backend port.

2.  **Run Frontend (e.g., `npm run dev`):**
    ```bash
    dapr run --app-id todo-frontend --app-port 3000 --dapr-http-port 3501 -- npm run dev
    ```
    *   Replace `3000` with your actual Frontend port.

3.  **Run Background Worker (e.g., `services/worker/main.py`):**
    ```bash
    dapr run --app-id todo-worker --app-port 8001 --dapr-http-port 3502 -- python services/worker/main.py
    ```
    *   Replace `8001` with your actual worker port.

## 4. Testing Dapr Pub/Sub

1.  **Publish a message (example for `task-events` topic):**
    ```bash
    curl -X POST http://localhost:3500/v1.0/publish/pubsub-kafka/task-events -H "Content-Type: application/json" -d '{ "id": "123", "action": "created", "payload": { "title": "New Task" } }'
    ```
    *   Ensure `todo-backend` (or whichever service publishes) is running with Dapr sidecar enabled.

2.  **Verify subscription on Worker:**
    Observe logs of the `todo-worker` for incoming messages.

## 5. Connect `kubectl` to Cloud Kubernetes

Once your application is deployed to a cloud Kubernetes cluster (Azure AKS, Google GKE, Oracle OKE), you'll need to configure `kubectl` to interact with it.

### Azure Kubernetes Service (AKS)

```bash
az login
az account set --subscription <your-subscription-id>
az aks get-credentials --resource-group <your-resource-group-name> --name <your-aks-cluster-name> --overwrite-existing
```

### Google Kubernetes Engine (GKE)

```bash
gcloud auth login
gcloud config set project <your-gcp-project-id>
gcloud container clusters get-credentials <your-gke-cluster-name> --region <your-cluster-region> --project <your-gcp-project-id>
```

### Oracle Kubernetes Engine (OKE)

```bash
# Ensure OCI CLI is configured
oci ce cluster create-kubeconfig --cluster-id <ocid-of-your-oke-cluster> --file $HOME/.kube/config --region <your-oke-region> --overwrite-existing --token-version 2.0
```

After connecting, you can verify your connection:
```bash
kubectl get nodes
kubectl get pods -n <your-application-namespace>
```
