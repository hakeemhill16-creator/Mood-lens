/// <reference types="vite/client" />
interface Window { jarvis?: { systemInfo: () => Promise<{platform:string;cpu:string;cores:number;memory:number;hostname:string}>; openWeb: (query:string) => Promise<void> } }
