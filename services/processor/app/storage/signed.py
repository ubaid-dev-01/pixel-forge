from pathlib import Path

import httpx

from app.errors import ProcessorError


async def download_signed(url: str, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    async with httpx.AsyncClient(follow_redirects=True, timeout=120.0) as client:
        response = await client.get(url)
        if response.status_code >= 400:
            raise ProcessorError("INVALID_FILE", "The input file could not be downloaded from storage.")
        destination.write_bytes(response.content)


async def upload_signed(url: str, source: Path, content_type: str) -> None:
    async with httpx.AsyncClient(follow_redirects=True, timeout=120.0) as client:
        response = await client.put(
            url,
            content=source.read_bytes(),
            headers={"Content-Type": content_type},
        )
        if response.status_code >= 400:
            raise ProcessorError("OUTPUT_FAILED", "The output file could not be stored.")
