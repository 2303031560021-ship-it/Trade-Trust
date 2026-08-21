import axios from "axios";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_ML_SERVICE_URL = "http://127.0.0.1:8000";
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || DEFAULT_ML_SERVICE_URL;
const ML_SERVICE_START_TIMEOUT_MS = Number(process.env.ML_SERVICE_START_TIMEOUT_MS) || 30000;
const ML_SERVICE_AUTO_START = process.env.ML_SERVICE_AUTO_START !== "false";
const ML_SERVICE_DIR = path.resolve(__dirname, "../../tradetrust-ml");

const mlServiceClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 20000,
});

let startupPromise = null;

function resolvePythonExecutable() {
  if (process.env.ML_SERVICE_PYTHON) {
    return process.env.ML_SERVICE_PYTHON;
  }

  const windowsVenvPython = path.join(ML_SERVICE_DIR, "venv", "Scripts", "python.exe");
  if (fs.existsSync(windowsVenvPython)) {
    return windowsVenvPython;
  }

  const unixVenvPython = path.join(ML_SERVICE_DIR, "venv", "bin", "python");
  if (fs.existsSync(unixVenvPython)) {
    return unixVenvPython;
  }

  return "python";
}

function getHealthcheckPath() {
  return "/docs";
}

async function isMlServiceAvailable() {
  try {
    await mlServiceClient.get(getHealthcheckPath(), { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

function startMlServiceProcess() {
  const pythonExecutable = resolvePythonExecutable();
  const serviceUrl = new URL(ML_SERVICE_URL);

  const child = spawn(
    pythonExecutable,
    [
      "-m",
      "uvicorn",
      "ml_service:app",
      "--host",
      serviceUrl.hostname,
      "--port",
      serviceUrl.port || "8000",
    ],
    {
      cwd: ML_SERVICE_DIR,
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    }
  );

  child.unref();
}

async function waitForMlService() {
  const deadline = Date.now() + ML_SERVICE_START_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (await isMlServiceAvailable()) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return false;
}

function buildUnavailableError() {
  const error = new Error(`ML service is unavailable at ${ML_SERVICE_URL}`);
  error.code = "ML_SERVICE_UNAVAILABLE";
  return error;
}

async function ensureMlService() {
  if (await isMlServiceAvailable()) {
    return;
  }

  if (!ML_SERVICE_AUTO_START) {
    throw buildUnavailableError();
  }

  if (!startupPromise) {
    startupPromise = (async () => {
      if (await isMlServiceAvailable()) {
        return;
      }

      startMlServiceProcess();

      const isReady = await waitForMlService();
      if (!isReady) {
        throw buildUnavailableError();
      }
    })().finally(() => {
      startupPromise = null;
    });
  }

  await startupPromise;
}

function isMlServiceUnavailableError(error) {
  return error?.code === "ML_SERVICE_UNAVAILABLE" || error?.code === "ECONNREFUSED";
}

export {
  ensureMlService,
  isMlServiceUnavailableError,
  mlServiceClient,
  ML_SERVICE_URL,
};