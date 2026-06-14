from __future__ import annotations

import shutil
import subprocess
import sys
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def find_frontend_command() -> list[str]:
    if sys.platform == "win32":
        return ["npm.cmd", "run", "dev", "--", "--host"]
    return ["npm", "run", "dev", "--", "--host"]


def frontend_command_available(command: list[str]) -> bool:
    return shutil.which(command[0]) is not None


def main() -> None:
    frontend_cmd = find_frontend_command()
    if not frontend_command_available(frontend_cmd):
        raise RuntimeError(
            "Unable to start the frontend because npm is not available in PATH. "
            "Install Node.js and npm, or run the frontend manually with `npm run dev`."
        )

    backend = subprocess.Popen(
        [sys.executable, "-m", "sahayai_x_ai.scripts.run_backend"],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )

    time.sleep(2)
    if backend.poll() is not None:
        output = backend.stdout.read() if backend.stdout is not None else ""
        raise RuntimeError(
            "Backend failed to start. Check whether port 8000 is already in use or the backend has a startup error.\n"
            f"Backend output:\n{output}"
        )

    frontend = subprocess.Popen(frontend_cmd, cwd=ROOT)

    try:
        backend.wait()
        frontend.wait()
    except KeyboardInterrupt:
        backend.terminate()
        frontend.terminate()


if __name__ == "__main__":
    main()

