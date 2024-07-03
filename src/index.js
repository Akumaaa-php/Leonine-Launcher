const { app, session, BrowserWindow } = require("electron");
const { join } = require("path");
const flashTrust = require('nw-flash-trust');
const { Client } = require('discord-rpc');

const appName = 'Leonine';
const URL = join(__dirname + "/resources/main.swf");
let pluginName;
let win;

// Initialize Discord RPC client
const rpcClient = new Client({ transport: 'ipc' });

rpcClient.on('ready', () => {
  console.log('Discord RPC ready');
  rpcClient.setActivity({
    details: 'Currently In-game',
    state: 'on AQWorlds',
    largeImageKey: 'large_image_key', // Replace with your Discord application's large image key
    instance: false,
  });
});

switch (process.platform) {
  case "win32":
    pluginName =
      process.arch == "x64"
        ? "x64/pepflashplayer.dll"
        : "x32/pepflashplayer32.dll";
    break;
  default:
    pluginName = "x64/pepflashplayer.dll";
    break;
}

app.commandLine.appendSwitch(
  "ppapi-flash-path",
  join(__dirname + "/resources/plugins/" + pluginName)
);
app.commandLine.appendSwitch("ppapi-flash-version", "32.0.0.371");

const flashPath = join(app.getPath('userData'), 'Pepper Data', 'Shockwave Flash', 'WritableRoot');
const trustManager = flashTrust.initSync(appName, flashPath);

trustManager.empty();
trustManager.add(URL);

const createWindow = () => {
  win = new BrowserWindow({
    width: 960,
    height: 580,
    icon: './resources/logo.ico',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      devTools: false,
      plugins: true,
    },
  });
  win.setTitle("Leonine");
  win.setMenu(null);
  win.setIcon(join(__dirname + "/resources/logo.ico"));
  win.webContents.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ArtixGameLauncher/2.1.2 Safari/537.36';
  win.webContents.openDevTools(false);
  win.webContents.on('new-window', (event, url, ...args) => {
    event.preventDefault();
    const childWin = new BrowserWindow({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: false,
        devTools: false,
        plugins: true,
      },
    });
    childWin.setMenu(null);
    childWin.setIcon(join(__dirname + "/resources/logo.ico"));
    childWin.webContents.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ArtixGameLauncher/2.1.2 Safari/537.36';
    childWin.loadURL(url);
  });

  // Initialize Discord RPC
  rpcClient.login({ clientId: '1254084787484758036' }) // Replace with your Discord application's client ID
    .then(() => {
      console.log('Logged into Discord');
    })
    .catch((err) => {
      console.error('Error logging into Discord:', err);
    });

  win.loadURL(URL);
};

app.allowRendererProcessReuse = true;
app.whenReady().then(() => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ArtixGameLauncher/2.1.2 Safari/537.36';
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});