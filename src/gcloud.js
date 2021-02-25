import * as childProcess from "child_process";
import * as path from "path";
import * as fs from "fs";

const GCLOUD_DOCKER_IMAGE =
  process.env.PETIBRUGNON_GCLOUD_DOCKER_IMAGE || "google/cloud-sdk";

const GCLOUD_CONFIG_DIR = path.resolve(
  process.env.PETIBRUGNON_GCLOUD_CONFIG_DIR || "./.petibrugnon/gcloud"
);

export function login() {
  const { error, status, stdout, stderr } = childProcess.spawnSync(
    "docker",
    [
      "run",
      "--interactive",
      "--rm",
      "--volume",
      `${GCLOUD_CONFIG_DIR}:/root/.config/gcloud`,
      GCLOUD_DOCKER_IMAGE,
      "gcloud",
      "auth",
      "application-default",
      "login",
      "--disable-quota-project",
    ],
    { stdio: "inherit" }
  );
  if (error) {
    throw error;
  } else if (status !== 0) {
    throw new Error(
      `docker returned non-zero status\n\n[STDOUT]\n${stdout}\n\n[STDERR]\n${stderr}`
    );
  }
}

export function fetchToken() {
  if (
    !fs.existsSync(
      path.resolve(GCLOUD_CONFIG_DIR, "application_default_credentials.json")
    )
  ) {
    login();
  }
  const { error, status, stdout, stderr } = childProcess.spawnSync("docker", [
    "run",
    "--interactive",
    "--rm",
    "--volume",
    `${GCLOUD_CONFIG_DIR}:/root/.config/gcloud`,
    GCLOUD_DOCKER_IMAGE,
    "gcloud",
    "auth",
    "application-default",
    "print-access-token",
  ]);
  if (error) {
    throw error;
  } else if (status !== 0) {
    throw new Error(
      `docker returned non-zero status\n\n[STDOUT]\n${stdout}\n\n[STDERR]\n${stderr}`
    );
  }
  return stdout.toString().trim();
}
