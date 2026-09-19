import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'node:path'
import os from 'node:os'

const createWindow = () => {
  const win = new BrowserWindow({ width: 1440, height: 900, minWidth: 1000, minHeight: 700, backgroundColor: '#05070d', autoHideMenuBar: true, webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false } })
  const url = process.env.VITE_DEV_SERVER_URL || 'http://127.0.0.1:5173'
  win.loadURL(url)
}
app.whenReady().then(() => {
  ipcMain.handle('system:info', () => ({ platform: process.platform, cpu: os.cpus()[0]?.model ?? 'Unknown processor', cores: os.cpus().length, memory: Math.round((1 - os.freemem() / os.totalmem()) * 100), hostname: os.hostname() }))
  ipcMain.handle('web:open', (_, url: string) => shell.openExternal(url.startsWith('http') ? url : `https://www.google.com/search?q=${encodeURIComponent(url)}`))
  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
