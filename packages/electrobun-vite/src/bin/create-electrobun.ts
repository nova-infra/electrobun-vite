#!/usr/bin/env bun
import { runCLI } from "../cli";

await runCLI(["bun", "create-electrobun", "create", ...process.argv.slice(2)]);
