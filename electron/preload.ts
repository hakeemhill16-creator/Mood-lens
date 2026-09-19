import { contextBridge, ipcRenderer } from 'electron'
contextBridge.exposeInMainWorld('jarvis', { systemInfo: () => ipcRenderer.invoke('system:info'), openWeb: (query: string) => ipcRenderer.invoke('web:open', query) })
