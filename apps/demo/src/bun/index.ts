import Electrobun, {
  ApplicationMenu,
  BrowserView,
  BrowserWindow,
  ContextMenu,
  Tray,
} from "electrobun/bun";
import type { BrowserWindowInstance } from "../types/electrobun-bun";
import type { ContextMenuItem } from "../shared/rpc";
import { APP_NAME, type AppRPC } from "../shared/rpc";

const devServerUrl = process.env.ELECTROBUN_VITE_DEV_SERVER_URL;
const appUrl = devServerUrl ?? "views://app/index.html";

let mainWindow: BrowserWindowInstance | null = null;
let lastEvent: { kind: string; data: string } = { kind: "", data: "" };

const rpc = BrowserView.defineRPC<AppRPC>({
  handlers: {
    requests: {
      getAppState: () => ({
        appName: APP_NAME,
        bunVersion: Bun.version,
        platform: process.platform,
        mode: devServerUrl ? "development" : "production",
      }),
      getWindowFrame: () => {
        if (!mainWindow) return { x: 0, y: 0, width: 0, height: 0 };
        const f = mainWindow.getFrame();
        return { x: f.x, y: f.y, width: f.width, height: f.height };
      },
      windowMinimize: () => {
        mainWindow?.minimize();
      },
      windowMaximize: () => {
        mainWindow?.maximize();
      },
      windowUnmaximize: () => {
        mainWindow?.unmaximize();
      },
      windowSetFullScreen: ({ value }) => {
        mainWindow?.setFullScreen(value);
      },
      windowSetAlwaysOnTop: ({ value }) => {
        mainWindow?.setAlwaysOnTop(value);
      },
      windowSetTitle: ({ title }) => {
        mainWindow?.setTitle(title);
      },
      showContextMenu: ({ items }) => {
        const menu = items.map((it: ContextMenuItem) => {
          if ("type" in it && (it.type === "separator" || it.type === "divider"))
            return { type: "separator" as const };
          return {
            label: it.label,
            action: it.action,
            enabled: it.enabled ?? true,
            tooltip: it.tooltip,
          };
        });
        ContextMenu.showContextMenu(menu);
      },
      traySetTitle: ({ title }) => {
        tray?.setTitle(title);
      },
      getLastEvent: () => lastEvent,
    },
    messages: {
      log: ({ message }) => console.log(`[ui] ${message}`),
    },
  },
});

ApplicationMenu.setApplicationMenu([
  {
    submenu: [
      { label: "About", action: "about" },
      { type: "separator" },
      { label: "Quit", role: "quit" },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "selectAll" },
    ],
  },
  {
    label: "View",
    submenu: [
      { label: "Minimize", action: "window-minimize" },
      { label: "Zoom", action: "window-zoom" },
      { type: "separator" },
      { label: "Toggle Full Screen", role: "toggleFullScreen" },
    ],
  },
  {
    label: "Window",
    submenu: [
      { label: "Minimize", role: "minimize" },
      { label: "Zoom", role: "zoom" },
      { type: "separator" },
      { role: "bringAllToFront" },
    ],
  },
]);

Electrobun.events.on("before-quit", async () => {
  console.log("[demo] before-quit");
  mainWindow = null;
});

Electrobun.events.on("application-menu-clicked", (e?) => {
  const action = (e?.data as { action?: string })?.action ?? "";
  lastEvent = { kind: "application-menu-clicked", data: action };
  if (action === "window-minimize") mainWindow?.minimize();
  if (action === "window-zoom") mainWindow?.maximize();
});

const tray = new Tray({
  title: APP_NAME,
  width: 22,
  height: 22,
});

tray.setMenu([
  { type: "normal", label: "Show", action: "tray-show" },
  { type: "divider" },
  { type: "normal", label: "Quit", action: "tray-quit" },
]);

tray.on("tray-clicked", (e) => {
  const action = (e.data as { action?: string })?.action ?? "";
  lastEvent = { kind: "tray-clicked", data: action || "(图标)" };
  if (action === "tray-show") mainWindow?.focus();
  if (action === "tray-quit") Electrobun.Utils?.quit?.();
});

Electrobun.events.on("context-menu-clicked", (e?) => {
  const action = (e?.data as { action?: string })?.action ?? "";
  lastEvent = { kind: "context-menu-clicked", data: action };
});

mainWindow = new BrowserWindow({
  title: APP_NAME,
  url: appUrl,
  rpc,
  frame: { width: 900, height: 620 },
  titleBarStyle: "hiddenInset",
}) as unknown as BrowserWindowInstance;

mainWindow.on("close", () => {
  mainWindow = null;
});
