# JARVIS Nexus

An original, holographic desktop command center built with Electron, React, TypeScript, React Three Fiber, and Framer Motion. It provides a live visual interface, voice input through the browser speech-recognition API, local text-to-speech, safe desktop IPC bridges, quick actions, a conversation panel, and an AI-provider boundary.

## Holographic core

The centerpiece is a real WebGL / Three.js scene, not a video or a flat image. It renders 4,800 moving particles on a spherical shell, transparent orbital rings, a wireframe energy shell, floating data fragments, and additive light. Pointer movement tilts the full 3D assembly. Each assistant mode has a distinct animation profile: listening draws particles inward and accelerates rings, thinking speeds scans and data rings, speaking expands to microphone amplitude, and executing emits the brightest, fastest pulse.

## Responsive layout

The command center is designed for desktop displays and mobile screens. It uses dynamic viewport units and safe-area insets, reflows the quick actions into a three-column touch grid below 640px, enlarges tap targets, and keeps the core prominent while compressing secondary telemetry. Very short screens prioritize the core, navigation, and voice control. Reduced-motion preferences are also honored.

## Installation

```bash
npm install
cp .env.example .env
```

## Development and desktop app

```bash
npm run dev
```

This starts Vite and opens Electron. To use the interface in a browser while styling, run `npm run web`.

## Configuration

Set `AI_API_KEY` and `AI_PROVIDER` in `.env`. The current `src/services/ai` module is an intentionally small provider abstraction with a useful local fallback; connect it to a chosen provider through a main-process IPC handler before using a secret in a production build. The settings panel provides a configuration surface and deliberately does not expose unrestricted Node APIs.

## Voice

Press the circular voice control to activate recognition. The app requests microphone permission only after that action and samples the microphone locally with `AudioContext` / `AnalyserNode` to drive the holographic core. Speech recognition is supplied by Chromium (`SpeechRecognition` / `webkitSpeechRecognition`) and may require an internet connection depending on the installed Chromium platform. Responses use the operating system's available speech-synthesis voices. The wake-phrase preference is present in Settings; true always-on wake-word detection should be implemented with an offline wake-word engine in the Electron main process.

## Build

```bash
npm run build
```

For a Windows executable, add an Electron packaging tool such as `electron-builder` to this project and run it on Windows (or configure a Windows CI runner) after `npm run build`.

## Security model

Electron runs with `contextIsolation` enabled and `nodeIntegration` disabled. The preload bridge exposes only `systemInfo` and a sanitized web-search opener. Desktop command features should remain allowlisted and require confirmation for destructive actions; arbitrary shell commands are never accepted.
