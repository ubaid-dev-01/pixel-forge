# PixelForge processor

FastAPI worker. Pulls inputs from signed URLs, never from Convex, never with bucket keys.

```bash
pip install -e .
uvicorn app.main:app --port 8090
```

GPU extras:

```bash
pip install -e ".[gpu,onnx]"
```

Health: `GET /health`  
Enqueue: `POST /jobs` with bearer `PROCESSOR_AUTH_TOKEN`
