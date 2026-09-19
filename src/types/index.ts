export type AssistantMode = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'EXECUTING' | 'ERROR'
export type ChatMessage = { speaker: 'JARVIS' | 'YOU'; text: string; time: string }
