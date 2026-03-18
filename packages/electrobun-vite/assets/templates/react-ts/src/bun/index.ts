import Electrobun, {
  ApplicationMenu,
  BrowserView,
  BrowserWindow,
} from "electrobun/bun";
import { APP_NAME, type AppRPC } from "../shared/rpc";

const devServerUrl = process.env.ELECTROBUN_VITE_DEV_SERVER_URL;
const isDevelopment = Boolean(devServerUrl);
const appUrl = devServerUrl ?? "views://app/index.html";

const rpc = BrowserView.defineRPC<AppRPC>({
  handlers: {
    requests: {
      getAppState: () => ({
        appName: APP_NAME,
        bunVersion: Bun.version,
        platform: process.platform,
        mode: isDevelopment ? "development" : "production",
      }),
    },
    messages: {
      log: ({ message }) => {
        console.log(`[ui] ${message}`);
      },
    },
  },
});

ApplicationMenu.setApplicationMenu([
  {
    submenu: [{ label: "Quit", role: "quit" }],
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
]);

Electrobun.events.on("before-quit", async () => {
  console.log("Closing Electrobun Vite Starter");
});

new BrowserWindow({
  title: APP_NAME,
  url: appUrl,
  rpc,
});
