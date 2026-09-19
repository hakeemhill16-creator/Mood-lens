import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import HolographicCore from './components/HolographicCore'
import { askAssistant } from './services/ai'
import { listen, speak } from './services/voice'
import type { AssistantMode, ChatMessage } from './types'
import { useMicrophoneLevel } from './hooks/useMicrophoneLevel'
const metrics = [['CPU','18%'],['GPU','34%'],['RAM','42%'],['NETWORK','SECURE']]
const actions = ['Web','Files','Apps','Music','System','Settings']
export default function App() {
 const [mode,setMode]=useState<AssistantMode>('IDLE'), [time,setTime]=useState(new Date()), [input,setInput]=useState(''), [settings,setSettings]=useState(false), [messages,setMessages]=useState<ChatMessage[]>([{speaker:'JARVIS',text:'Good morning. All systems are operational.',time:'NOW'}])
 const microphone = useMicrophoneLevel()
 useEffect(()=>{const id=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(id)},[])
 async function submit(text=input) { if(!text.trim()) return; setInput(''); setMessages(m=>[...m,{speaker:'YOU',text,time:'NOW'}]); setMode('THINKING'); const answer=await askAssistant(text); setMessages(m=>[...m,{speaker:'JARVIS',text:answer,time:'NOW'}]); setMode('SPEAKING'); speak(answer); setTimeout(()=>setMode('IDLE'),2200) }
 async function startVoice() { setMode('LISTENING'); const hasMicrophone = await microphone.start(); if (!hasMicrophone) { setMode('ERROR'); return } if(!listen((text)=>{setInput(text);submit(text)},()=>{microphone.stop();setMode('IDLE')})) { microphone.stop(); setMode('ERROR') } }
 function action(a:string) { if(a==='Web'){window.jarvis?.openWeb('');return} if(a==='Settings')setSettings(true); else {setMode('EXECUTING');setTimeout(()=>setMode('IDLE'),900)} }
 return <main><div className="grid"/><header><div><h1>JARVIS<span>◉</span></h1><p><i/> SYSTEM ONLINE · NEXUS 01</p></div><div className="metrics">{metrics.map(([n,v])=><div key={n}><small>{n}</small><b>{v}</b></div>)}<div className="clock"><small>LOCAL TIME</small><b>{time.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</b></div></div></header>
 <section className="status"><div className="eyebrow">LIVE TELEMETRY</div><div className="wave">▁▃▅▂▇▃▅▁▆▃▂</div><p>VOICE LINK READY</p><div className="bar"><span/></div></section>
 <HolographicCore mode={mode} audioLevel={microphone.level}/><aside className="chat"><div className="panel-title">CONVERSATION <em>LIVE</em></div>{messages.slice(-3).map((m,i)=><div className="message" key={i}><b>{m.speaker}</b><small>{m.time}</small><p>{m.text}</p></div>)}</aside>
 <nav>{actions.map((a,i)=><button onClick={()=>action(a)} key={a}><span>0{i+1}</span>{a}</button>)}</nav>
 <div className="voice"><button className="mic" onClick={startVoice}>{mode==='LISTENING'?'◉':'⌁'}</button><div><strong>{mode==='LISTENING'?'LISTENING...':mode==='THINKING'?'PROCESSING REQUEST...':mode==='SPEAKING'?'JARVIS IS SPEAKING':'AWAITING COMMAND'}</strong><form onSubmit={e=>{e.preventDefault();submit()}}><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Type a command or activate voice interface"/><button>↗</button></form></div></div>
 <AnimatePresence>{settings&&<motion.div className="modal-bg" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.section className="modal" initial={{scale:.94,y:20}} animate={{scale:1,y:0}}><button className="close" onClick={()=>setSettings(false)}>×</button><div className="eyebrow">CONFIGURATION</div><h2>Assistant settings</h2><label>AI PROVIDER<select defaultValue="openai"><option value="openai">OpenAI-compatible</option><option>Local model</option></select></label><label>API KEY<input type="password" placeholder="Stored securely by desktop host"/></label><label className="toggle">Wake phrase <input type="checkbox" defaultChecked/> <span>Hey JARVIS</span></label><button className="save" onClick={()=>setSettings(false)}>SAVE CONFIGURATION</button></motion.section></motion.div>}</AnimatePresence></main>
}
