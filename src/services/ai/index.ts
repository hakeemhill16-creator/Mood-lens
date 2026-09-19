/** Provider boundary: keep API secrets in the main process in production. */
export async function askAssistant(input: string): Promise<string> {
  const lower = input.toLowerCase()
  if (lower.includes('time')) return `It is ${new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date())}.`
  if (lower.includes('system')) return 'Diagnostics are nominal. Neural interface and local command safeguards are online.'
  return `I understand. ${input.trim()} is now in my active context. How would you like me to proceed?`
}
