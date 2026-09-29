"use client";
import {useEffect,useRef,useState} from "react";import {ArrowLeft,ArrowRight,X} from "lucide-react";import {Arrow,Footer,Header} from "../components/Shell";
const work=[{src:"1",cat:"Bridal",alt:"Bridal makeup — soft glam look"},{src:"2",cat:"Bridal",alt:"Bridal makeup — classic elegance"},{src:"3",cat:"Editorial",alt:"Bridal makeup — soft glam look"},{src:"4",cat:"Special Occasions",alt:"Special occasion — evening glam"},{src:"5",cat:"Bridal",alt:"Bridal makeup — natural radiance"}];
const filters=["All","Bridal","Editorial","Special Occasions"];
export default function Portfolio(){
  const[filter,setFilter]=useState("All");const[active,setActive]=useState<number|null>(null);
  const lightbox=useRef<HTMLDialogElement>(null);const swipeStart=useRef<number|null>(null);
  const shown=work.filter(w=>filter==="All"||w.cat===filter);
  // Service links on the homepage arrive with ?filter=… preselected; the URL is only readable after hydration.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{const requested=new URLSearchParams(window.location.search).get("filter");if(requested&&filters.includes(requested))setFilter(requested)},[]);
  const choose=(f:string)=>{setFilter(f);const url=new URL(window.location.href);if(f==="All")url.searchParams.delete("filter");else url.searchParams.set("filter",f);window.history.replaceState(null,"",url)};
  const open=(i:number)=>{setActive(i);lightbox.current?.showModal()};
  const step=(by:number)=>setActive(i=>i===null?i:(i+by+shown.length)%shown.length);
  const current=active===null?null:shown[active];
  return <main><Header/><section className="portfolio-head"><div className="head-media"><img src="/gallery/89.jpg" width={1080} height={1350} fetchPriority="high" alt="Editorial makeup look with pearl face adornments by Jonaks Beauty"/></div><p className="eyebrow">Selected Work</p><h1>Beauty,<br/><em>remembered.</em></h1><p>Bridal, editorial, and beyond.</p></section><section className="portfolio-section"><div className="filters">{filters.map(f=><button type="button" className={filter===f?"active":""} aria-pressed={filter===f} onClick={()=>choose(f)} key={f}>{f}<sup>{f==="All"?work.length:work.filter(w=>w.cat===f).length}</sup></button>)}</div><div className="gallery" key={filter}>{shown.map((w,i)=><figure key={w.src} className={i%3===0?"tall":""} style={{"--i":i} as React.CSSProperties}><button type="button" className="gallery-open" data-cursor="View" aria-label={`Open ${w.alt}`} onClick={()=>open(i)}><img src={`/gallery/${w.src}.jpg`} width={1080} height={1350} alt={w.alt}/></button><figcaption><span>0{i+1}</span>{w.cat}</figcaption></figure>)}</div></section>
  <dialog ref={lightbox} className="lightbox" aria-label="Portfolio viewer" onClose={()=>setActive(null)} onClick={e=>{if(e.target===e.currentTarget)lightbox.current?.close()}} onKeyDown={e=>{if(e.key==="ArrowRight")step(1);if(e.key==="ArrowLeft")step(-1)}} onPointerDown={e=>{swipeStart.current=e.clientX}} onPointerUp={e=>{if(swipeStart.current===null)return;const dx=e.clientX-swipeStart.current;swipeStart.current=null;if(Math.abs(dx)>50)step(dx<0?1:-1)}}>
    {current&&<><figure><img key={current.src} src={`/gallery/${current.src}.jpg`} width={1080} height={1350} alt={current.alt}/><figcaption><span>{String(active!+1).padStart(2,"0")} / {String(shown.length).padStart(2,"0")}</span>{current.cat}</figcaption></figure>
    <button type="button" className="lightbox-close" aria-label="Close viewer" onClick={()=>lightbox.current?.close()}><X size={22} strokeWidth={1.25}/></button>
    {shown.length>1&&<><button type="button" className="lightbox-nav prev" aria-label="Previous look" onClick={()=>step(-1)}><ArrowLeft size={22} strokeWidth={1.25}/></button><button type="button" className="lightbox-nav next" aria-label="Next look" onClick={()=>step(1)}><ArrowRight size={22} strokeWidth={1.25}/></button></>}</>}
  </dialog>
  <section className="cta cta-dark"><p className="section-number">Like What You See?</p><h2>Let’s create<br/><em>your look.</em></h2><p>Every masterpiece starts with a conversation. Get in touch to discuss your vision.</p><a className="pill light" href="/booking">Book an Appointment <Arrow/></a></section><Footer/></main>}
