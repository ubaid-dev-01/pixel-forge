FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*
COPY services/processor/pyproject.toml /app/pyproject.toml
COPY services/processor/app /app/app
RUN pip install --no-cache-dir . pillow numpy opencv-python-headless fastapi uvicorn pydantic pydantic-settings httpx filetype structlog
ENV PROCESSOR_TMP_DIR=/tmp/pixelforge PROCESSOR_MODEL_DIR=/models
EXPOSE 8090
HEALTHCHECK --interval=30s --timeout=5s CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8090/health')"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8090"]
