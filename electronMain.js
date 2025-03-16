import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true
        }
    });

    win.loadFile(path.join(__dirname, 'public/HTML/main.html'))
        .then(() => win.show())
        .catch(err => console.error("Failed to load file:", err));

    win.webContents.openDevTools();

    // Adding menu with back button functionality
    const menu = Menu.buildFromTemplate([
        {
            label: 'Navigation',
            submenu: [
                {
                    label: 'Back',
                    accelerator: 'Alt+Left',  // Keyboard shortcut (Alt + Left Arrow)
                    click: () => {
                        if (win.webContents.navigationHistory.canGoBack) {  // Use the updated API
                            win.webContents.navigationHistory.goBack();
                        }
                    }
                }
            ]
        }
    ]);
    
    Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
