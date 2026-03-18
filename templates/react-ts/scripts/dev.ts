const devServerUrl = "http://127.0.0.1:5173";
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

const vite = Bun.spawn(["bun", "run", "dev:web"], {
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
});

childProcesses.push(vite);

const waitForServer = async () => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(devServerUrl, {
        method: "GET",
      });

      if (response.ok) {
        return;
      }
    } catch {
      await Bun.sleep(250);
      continue;
    }

    await Bun.sleep(250);
  }

  throw new Error(`Timed out waiting for Vite dev server at ${devServerUrl}`);
};

await waitForServer();

const desktop = Bun.spawn(["bun", "run", "dev:desktop"], {
  env: {
    ...process.env,
    ELECTROBUN_VITE_DEV_SERVER_URL: devServerUrl,
  },
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
});

childProcesses.push(desktop);

const [viteExitCode, desktopExitCode] = await Promise.all([
  vite.exited,
  desktop.exited,
]);

await stopChildren();

if (viteExitCode !== 0) {
  process.exit(viteExitCode);
}

process.exit(desktopExitCode);
