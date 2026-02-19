## Diagrams

This folder contains the mermaid source files for the architecture and deployment diagrams.

Files:

- `component-diagram.mmd` — component-level architecture (frontend, backend, DB, key files/endpoints).
- `deployment-diagram.mmd` — CI/CD and deployment topology (GitHub Actions → Registry → Containers → DB).

How to export to PNG (locally):

1. Install mermaid CLI (one-time):

```bash
npx @mermaid-js/mermaid-cli -v
```

2. Export a diagram to PNG:

```bash
# from repository root
npx @mermaid-js/mermaid-cli -i docs/diagrams/component-diagram.mmd -o docs/diagrams/component-diagram.png
npx @mermaid-js/mermaid-cli -i docs/diagrams/deployment-diagram.mmd -o docs/diagrams/deployment-diagram.png
```

Alternatively use the Mermaid Preview extension in VS Code and export the rendered diagram to PNG.