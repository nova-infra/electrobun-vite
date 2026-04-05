#!/usr/bin/env bun

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

type Bump = "patch" | "minor" | "major";
type Target = "package" | "template";

type PackageJson = {
  version?: string;
  devDependencies?: Record<string, string>;
};

type TargetConfig = {
  packageJsonPath: string;
  tagPrefix: string;
  buildCommand: string[];
  typecheckCommand: string[];
};

function run(command: string, args: string[], cwd?: string): void {
  execFileSync(command, args, { stdio: "inherit", cwd });
}

function runCapture(command: string, args: string[]): string {
  return execFileSync(command, args, { encoding: "utf8" }).trim();
}

function readJson(filePath: string): PackageJson {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as PackageJson;
}

function writeText(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content);
}

function bumpVersion(version: string, bump: Bump): string {
  const parts = version.split(".").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) throw new Error(`Unsupported version: ${version}`);
  if (bump === "major") return `${parts[0] + 1}.0.0`;
  if (bump === "minor") return `${parts[0]}.${parts[1] + 1}.0`;
  return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
}

function replaceOnce(content: string, pattern: RegExp, replacement: string): string {
  const next = content.replace(pattern, replacement);
  if (next === content) {
    throw new Error(`Pattern not found: ${pattern}`);
  }
  return next;
}

function updatePackageVersion(packageJsonPath: string, nextVersion: string): void {
  const packageJson = readJson(packageJsonPath);
  packageJson.version = nextVersion;
  writeText(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

function updateMetadataVersion(nextVersion: string): void {
  const metadataPath = path.join("packages", "electrobun-vite", "src", "metadata.ts");
  const metadata = fs.readFileSync(metadataPath, "utf8");
  const nextMetadata = replaceOnce(
    metadata,
    /export const PACKAGE_VERSION = "[^"]+";/,
    `export const PACKAGE_VERSION = "${nextVersion}";`,
  );

  writeText(metadataPath, nextMetadata);
}

function updateTemplateDependency(nextVersion: string): void {
  const templatePackagePath = path.join("templates", "react-ts", "package.json");
  const templatePackage = readJson(templatePackagePath);
  const devDependencies = templatePackage.devDependencies ?? {};
  const current = devDependencies["@nova-infra/electrobun-vite"];

  if (current !== nextVersion) {
    devDependencies["@nova-infra/electrobun-vite"] = nextVersion;
    templatePackage.devDependencies = devDependencies;
    writeText(templatePackagePath, `${JSON.stringify(templatePackage, null, 2)}\n`);
  }
}

function readCliVersion(): string {
  const cliPackagePath = path.join("packages", "electrobun-vite", "package.json");
  const cliVersion = readJson(cliPackagePath).version;

  if (!cliVersion) {
    throw new Error(`Missing version in ${cliPackagePath}`);
  }

  return cliVersion;
}

const targets: Record<Target, TargetConfig> = {
  package: {
    packageJsonPath: path.join("packages", "electrobun-vite", "package.json"),
    tagPrefix: "packages/electrobun-vite-v",
    buildCommand: ["bun", "run", "--cwd", "packages/electrobun-vite", "build"],
    typecheckCommand: ["bun", "run", "--cwd", "packages/electrobun-vite", "typecheck"],
  },
  template: {
    packageJsonPath: path.join("templates", "react-ts", "package.json"),
    tagPrefix: "templates/react-ts-v",
    buildCommand: ["bun", "run", "--cwd", "templates/react-ts", "build"],
    typecheckCommand: ["bun", "run", "--cwd", "templates/react-ts", "typecheck"],
  },
};

const targetArg = process.argv[2] as Target | undefined;
const bumpArg = process.argv[3] as Bump | undefined;

if (!targetArg || !bumpArg || !(targetArg in targets) || !["patch", "minor", "major"].includes(bumpArg)) {
  console.error("Usage: bun scripts/release.ts <package|template> <patch|minor|major>");
  process.exit(1);
}

const target = targetArg;
const bump = bumpArg;
const targetConfig = targets[target];
const status = runCapture("git", ["status", "--porcelain"]);
if (status) {
  console.error("Working tree must be clean before releasing.");
  process.exit(1);
}

const currentVersion = readJson(targetConfig.packageJsonPath).version;
if (!currentVersion) {
  throw new Error(`Missing version in ${targetConfig.packageJsonPath}`);
}

const nextVersion = bumpVersion(currentVersion, bump);

updatePackageVersion(targetConfig.packageJsonPath, nextVersion);

if (target === "package") {
  updateMetadataVersion(nextVersion);
  updateTemplateDependency(nextVersion);
}
if (target === "template") {
  updateTemplateDependency(readCliVersion());
}

run(...targetConfig.typecheckCommand);
run(...targetConfig.buildCommand);

const commitMessage =
  target === "package"
    ? `Release @nova-infra/electrobun-vite v${nextVersion}`
    : `Release @nova-infra/template-react-ts v${nextVersion}`;

const commitBody =
  target === "package"
    ? [
        "",
        "Bump the package version, refresh the embedded metadata constant, and keep the starter template's local CLI dependency aligned before tagging for npm publish.",
        "",
        "Constraint: Tag names must match the publish workflow triggers",
        "Rejected: Manual version edits | too easy to miss metadata and template sync",
        "Confidence: high",
        "Scope-risk: moderate",
        "Directive: Keep src/metadata.ts, bun.lock, and the template devDependency in sync with the package version",
        "Tested: package typecheck, package build",
        "Not-tested: npm publish in the Trusted Publisher workflow",
      ].join("\n")
    : [
        "",
        "Bump the starter template version, refresh the workspace lockfile, keep the local CLI dependency aligned, and tag the release so npm can publish it through Trusted Publisher.",
        "",
        "Constraint: Tag names must match the publish workflow triggers",
        "Rejected: Release via manual npm publish | bypasses the OIDC workflow we rely on",
        "Confidence: high",
        "Scope-risk: narrow",
        "Directive: Keep the template package version and bun.lock aligned before tagging",
        "Tested: template typecheck, template build",
        "Not-tested: npm publish in the Trusted Publisher workflow",
      ].join("\n");

run("git", ["add", targetConfig.packageJsonPath]);
if (target === "package") {
  run("git", ["add", "packages/electrobun-vite/src/metadata.ts", "templates/react-ts/package.json"]);
}
run("git", ["add", "bun.lock"]);
run("git", ["add", target === "package" ? "packages/electrobun-vite/dist" : "templates/react-ts/dist"]);
run("git", ["commit", "-m", commitMessage, "-m", commitBody]);
run("git", ["tag", "-a", `${targetConfig.tagPrefix}${nextVersion}`, "-m", `${targetConfig.tagPrefix}${nextVersion}`]);
run("git", ["push", "origin", "HEAD", "--follow-tags"]);
