import { useEffect, useState } from "react";
import { Electroview } from "electrobun/view";
import { APP_NAME, type AppRPC } from "../shared/rpc";

type RuntimeState = {
  appName: string;
  bunVersion: string;
  platform: string;
  mode: "development" | "production";
};

const rpc = Electroview.defineRPC<AppRPC>({
  handlers: {
    requests: {},
    messages: {},
  },
});

const electrobun = new Electroview({ rpc });

export function App() {
  const [state, setState] = useState<RuntimeState | null>(null);
  const [status, setStatus] = useState("Ready.");

  const loadAppState = async () => {
    setStatus("Fetching runtime data from the Bun process...");

    try {
      if (!electrobun.rpc) {
        throw new Error("Electrobun RPC bridge is unavailable.");
      }

      const nextState = await electrobun.rpc.request.getAppState({});
      setState(nextState);
      setStatus(`Connected to ${nextState.appName}.`);
    } catch (error) {
      console.error(error);
      setStatus("Failed to fetch runtime data. Check the desktop console.");
    }
  };

  useEffect(() => {
    void loadAppState();
  }, []);

  const sendLog = () => {
    if (!electrobun.rpc) {
      setStatus("Electrobun RPC bridge is unavailable.");
      return;
    }

    electrobun.rpc.send.log({
      message: `${APP_NAME} UI pinged the Bun process at ${new Date().toISOString()}`,
    });
    setStatus("Sent a log message to the Bun process.");
  };

  return (
    <div className="app-shell">
      <header className="hero electrobun-webkit-app-region-drag">
        <p className="eyebrow">Desktop shell meets fast front-end iteration</p>
        <h1>Electrobun + React 19 + Vite 8</h1>
        <p className="lede">
          A minimal starter for building desktop apps with a Bun-powered main
          process, a React renderer, and a Vite loop that stays friendly to AI
          assisted vibe coding.
        </p>
      </header>

      <main className="content">
        <section className="panel">
          <div className="panel-heading">
            <h2>Runtime snapshot</h2>
            <button onClick={() => void loadAppState()} type="button">
              Refresh state
            </button>
          </div>
          <div className="stats-grid">
            <article className="stat-card">
              <span className="stat-label">App</span>
              <strong>{state?.appName ?? "Loading..."}</strong>
            </article>
            <article className="stat-card">
              <span className="stat-label">Mode</span>
              <strong>{state?.mode ?? "Loading..."}</strong>
            </article>
            <article className="stat-card">
              <span className="stat-label">Platform</span>
              <strong>{state?.platform ?? "Loading..."}</strong>
            </article>
            <article className="stat-card">
              <span className="stat-label">Bun</span>
              <strong>{state?.bunVersion ?? "Loading..."}</strong>
            </article>
          </div>
        </section>

        <section className="panel panel-accent">
          <div className="panel-heading">
            <h2>Vibe coding helpers</h2>
            <button onClick={sendLog} type="button">
              Send log to Bun
            </button>
          </div>
          <ul className="checklist">
            <li>Vite handles local UI development at `127.0.0.1:5173`.</li>
            <li>Electrobun loads `views://app/index.html` in production.</li>
            <li>Typed RPC is ready in `src/shared/rpc.ts`.</li>
            <li>Project AI guidance lives in `AGENTS.md` and `skills/`.</li>
          </ul>
          <p className="status-line">{status}</p>
        </section>
      </main>
    </div>
  );
}
