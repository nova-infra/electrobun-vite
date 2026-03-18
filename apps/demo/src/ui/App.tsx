import { useEffect, useState } from "react";
import { Electroview } from "electrobun/view";
import { APP_NAME, type AppRPC, type ContextMenuItem } from "../shared/rpc";

const rpc = Electroview.defineRPC<AppRPC>({ handlers: { requests: {}, messages: {} } });
const electrobun = new Electroview({ rpc });

type TabId = "runtime" | "window" | "tray" | "context" | "events";
const TABS: { id: TabId; label: string }[] = [
  { id: "runtime", label: "Runtime" },
  { id: "window", label: "Window" },
  { id: "tray", label: "Tray & Menu" },
  { id: "context", label: "Context Menu" },
  { id: "events", label: "Events" },
];

type State = { appName: string; bunVersion: string; platform: string; mode: string };

export function App() {
  const [tab, setTab] = useState<TabId>("runtime");
  const [state, setState] = useState<State | null>(null);
  const [status, setStatus] = useState("Ready.");
  const [frame, setFrame] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [lastEvent, setLastEvent] = useState({ kind: "", data: "" });
  const [trayTitle, setTrayTitle] = useState(APP_NAME);
  const [windowTitle, setWindowTitle] = useState(APP_NAME);

  const loadAppState = async () => {
    setStatus("Fetching runtime data from the Bun process...");
    try {
      const nextState = await electrobun.rpc?.request.getAppState({});
      if (nextState) setState(nextState as State);
      setStatus(`Connected to ${(nextState as State)?.appName ?? APP_NAME}.`);
    } catch (err) {
      console.error(err);
      setStatus("Failed to fetch runtime data. Check the desktop console.");
    }
  };

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

  const refreshFrame = () => {
    electrobun.rpc?.request.getWindowFrame({}).then((f) => setFrame(f));
  };
  const refreshEvent = () => {
    electrobun.rpc?.request.getLastEvent({}).then(setLastEvent);
  };

  useEffect(() => {
    loadAppState();
    refreshFrame();
    refreshEvent();
  }, []);

  const contextMenuItems: ContextMenuItem[] = [
    { label: "Copy", action: "copy" },
    { label: "Paste", action: "paste" },
    { type: "separator" },
    { label: "Custom action", action: "custom", tooltip: "Demo item" },
  ];

  return (
    <div className="app">
      {/* 仅顶部可拖动：系统栏 + 标题栏，符合「点顶栏移动」习惯 */}
      <div className="titlebar-drag-strip electrobun-webkit-app-region-drag" aria-hidden />
      <header className="titlebar electrobun-webkit-app-region-drag">
        <h1>{APP_NAME}</h1>
        <nav className="tabs" role="tablist">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`tab ${tab === id ? "active" : ""} electrobun-webkit-app-region-no-drag`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="content">
        {tab === "runtime" && (
          <>
            <header className="hero">
              <p className="eyebrow">Desktop shell meets fast front-end iteration</p>
              <h2 className="hero-title">Electrobun + React 19 + Vite 8</h2>
              <p className="lede">
                A minimal starter for building desktop apps with a Bun-powered main
                process, a React renderer, and a Vite loop that stays friendly to AI
                assisted vibe coding.
              </p>
            </header>
            <div className="content-grid">
              <section className="panel">
                <div className="panel-heading">
                  <h2>Runtime snapshot</h2>
                  <button type="button" onClick={() => void loadAppState()}>
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
                  <button type="button" onClick={sendLog}>
                    Send log to Bun
                  </button>
                </div>
                <ul className="checklist">
                  <li>Vite handles local UI development at <code>127.0.0.1:5173</code>.</li>
                  <li>Electrobun loads <code>views://app/index.html</code> in production.</li>
                  <li>Typed RPC is ready in <code>src/shared/rpc.ts</code>.</li>
                  <li>Project AI guidance lives in <code>AGENTS.md</code> and <code>skills/</code>.</li>
                </ul>
                <p className="status-line">{status}</p>
              </section>
            </div>
          </>
        )}

        {tab === "window" && (
          <section className="panel">
            <h2>Window</h2>
            <p className="frame">
              Position: ({frame.x}, {frame.y}) · Size: {frame.width}×{frame.height}
            </p>
            <div className="row">
              <button type="button" onClick={() => { electrobun.rpc?.request.windowMinimize({}); refreshFrame(); }}>
                Minimize
              </button>
              <button type="button" onClick={() => { electrobun.rpc?.request.windowMaximize({}); refreshFrame(); }}>
                Maximize
              </button>
              <button type="button" onClick={() => electrobun.rpc?.request.windowSetFullScreen({ value: true })}>
                Full screen
              </button>
              <button type="button" onClick={() => electrobun.rpc?.request.windowSetAlwaysOnTop({ value: true })}>
                Always on top
              </button>
            </div>
            <div className="row">
              <label>
                Title:{" "}
                <input
                  value={windowTitle}
                  onChange={(e) => setWindowTitle(e.target.value)}
                  onBlur={() => electrobun.rpc?.request.windowSetTitle({ title: windowTitle })}
                />
              </label>
            </div>
          </section>
        )}

        {tab === "tray" && (
          <section className="panel">
            <h2>Tray & Application Menu</h2>
            <p>System tray icon is in the menu bar. Use app menu (File, Edit, View, Window) and tray menu.</p>
            <label>
              Tray title:{" "}
              <input
                value={trayTitle}
                onChange={(e) => setTrayTitle(e.target.value)}
                onBlur={() => electrobun.rpc?.request.traySetTitle({ title: trayTitle })}
              />
            </label>
            <p className="hint">Click tray → Show to focus window; Quit to exit.</p>
          </section>
        )}

        {tab === "context" && (
          <section className="panel">
            <h2>Context Menu</h2>
            <p>Show native context menu at cursor (triggered by RPC from renderer).</p>
            <button
              type="button"
              onClick={() => electrobun.rpc?.request.showContextMenu({ items: contextMenuItems })}
            >
              Show context menu
            </button>
            <p className="hint">Right-click or click the button, then pick an item. Last action appears in Events tab.</p>
          </section>
        )}

        {tab === "events" && (
          <section className="panel">
            <h2>Events 验收</h2>
            <p>下面「最近一次事件」会显示 Bun 进程收到的最新一次事件。按下面步骤操作后，点「刷新」即可验收。</p>
            <ol className="checklist" style={{ listStyle: "decimal" }}>
              <li><strong>Application menu</strong>：顶部菜单栏选 e.g. View → Minimize，或 Edit → Copy，再点「刷新」→ 应看到 <code>application-menu-clicked: window-minimize</code> 或 <code>application-menu-clicked: copy</code>。</li>
              <li><strong>Context menu</strong>：切到「Context Menu」tab，点「Show context menu」，在弹出菜单里选一项，再回本 tab 点「刷新」→ 应看到 <code>context-menu-clicked: copy</code> / <code>custom</code> 等。</li>
              <li><strong>Tray</strong>：点击菜单栏托盘图标或菜单项（Show / Quit），回到本 tab 点「刷新」→ 应看到 <code>tray-clicked: (图标)</code> 或 <code>tray-clicked: tray-show</code> 等。</li>
            </ol>
            <div className="panel-heading" style={{ marginTop: "1rem" }}>
              <span>最近一次事件</span>
              <button type="button" onClick={refreshEvent}>刷新</button>
            </div>
            <pre className="event-log">
              {lastEvent.kind ? `${lastEvent.kind}: ${lastEvent.data}` : "(尚未触发，按上面步骤操作后点「刷新」)"}
            </pre>
          </section>
        )}
      </main>
    </div>
  );
}
