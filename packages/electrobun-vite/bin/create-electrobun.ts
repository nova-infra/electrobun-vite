#!/usr/bin/env bun
import { runCLI } from "../src/cli";

await runCLI(["bun", "create-electrobun", "create", ...process.argv.slice(2)]);
