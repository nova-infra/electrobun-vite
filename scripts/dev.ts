export {};

const childProcesses: Bun.Subprocess[] = [];

const stopChildren = async () => {
  for (const child of childProcesses) {
    if (child.exitCode === null) {
      child.kill();
      await child.exited;
    }
  }
};

const relayExit = async (code: number) => {
  await stopChildren();
  process.exit(code);
};

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    await relayExit(0);
  });
}

const app = Bun.spawn(["bun", "run", "dev:demo"], {
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
});

const docs = Bun.spawn(["bun", "run", "dev:docs"], {
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
});

childProcesses.push(app, docs);

const [appExitCode, docsExitCode] = await Promise.all([app.exited, docs.exited]);

await stopChildren();

if (appExitCode !== 0) {
  process.exit(appExitCode);
}

process.exit(docsExitCode);
