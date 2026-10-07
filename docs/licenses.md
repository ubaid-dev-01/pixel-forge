# Processing stack license review

Conducted before implementation. Do not ship a model that failed this review.

| Component | Purpose | License | Commercial | Redistribution | Serverless | Persistent worker | Fallback |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GFPGAN v1.4 | Face restoration | Apache 2.0 (code). StyleGAN2 prior: NVIDIA terms | Review NVIDIA component before paid GFPGAN inference | Weights downloaded at runtime, not vendored | No | Yes | NO_FACES_DETECTED / MODEL_UNAVAILABLE |
| Real-ESRGAN | Super-resolution | BSD-3-Clause | Yes, with notice | Runtime download | No | Yes | User-selected Lanczos |
| BiRefNet official | Segmentation | MIT | Yes, with notice | Runtime download | Poor | Yes | U²-Net |
| rembg | Inference wrapper | MIT | Yes (code) | n/a | Poor | Yes | — |
| U²-Net | Salient object | Apache 2.0 | Yes | ONNX runtime download | Poor | Yes | Fail closed |
| BRIA RMBG 1.4/2.0 | Segmentation | NC / custom | **No** without BRIA deal | Do not redistribute | — | — | **Not shipped** |
| OpenCV / Pillow | Classical | Apache / HPND | Yes | Via pip | Partial | Yes | — |
| FFmpeg | Video | LGPL/GPL build dependent | Use LGPL builds in production | System package | No | Yes | Tool unavailable |
| PyTorch | Inference | BSD-style | Yes | pip | No | Yes | CPU if CUDA missing — quality warning |
| ONNX Runtime | U²-Net | MIT | Yes | pip | Tight | Yes | — |
| FastAPI / Express / Next / Convex | App | MIT / Apache | Yes | n/a | Frontend yes | API+worker yes | — |

GFPGAN inputs: RGB images. Outputs: restored RGB. CPU supported but slow. GPU recommended. Memory: ~2–4GB. Weights ~348MB. Expected time: 1–8s/face on GPU, much slower on CPU.
