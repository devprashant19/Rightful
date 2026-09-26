---
name: graphify
description: Codebase structural graphing, dependency tracking, dataflow visualization, and Mermaid architectural mapping.
---

# Graphify: Codebase Structure & Dataflow Mapping

## 1. Trace Before Touching
- Map the flow of data from ingestion to output before modifying multi-layer pipelines:
  $$\text{User Input} \longrightarrow \text{Ingest Engine} \longrightarrow \text{Nano Extractor} \longrightarrow \text{Tavily Search} \longrightarrow \text{Super Matrix} \longrightarrow \text{Code Verifier} \longrightarrow \text{Client UI}$$
- Keep data contracts strictly decoupled so changes to LLM prompts do not break UI rendering.

## 2. Mermaid Visual Architecture
- Maintain clear, maintainable Mermaid graphs in `README.md` and architecture documentation showing:
  - Client component hierarchy.
  - Serverless API routes.
  - External inference and search dependencies.
