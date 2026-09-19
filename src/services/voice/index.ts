export function speak(text: string) { const voice = window.speechSynthesis; if (voice) { voice.cancel(); voice.speak(new SpeechSynthesisUtterance(text)) } }
export function listen(onText: (text: string) => void, onEnd: () => void) {
  const Recognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
  if (!Recognition) { onEnd(); return false }
  const recognition = new Recognition(); recognition.continuous = false; recognition.lang = 'en-US'
  recognition.onresult = (event: any) => onText(event.results[0][0].transcript); recognition.onerror = onEnd; recognition.onend = onEnd; recognition.start(); return true
}
