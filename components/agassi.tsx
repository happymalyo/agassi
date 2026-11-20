'use client';
import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { BookOpen, Check, Compass, Home, Moon, PawPrint, Pause, Play, Rocket, RotateCcw, Star, Sun, Trophy } from 'lucide-react';
import LessonDialog, {Modal} from './lesson-dialog';
import { lessons, type Lesson, type World } from '@/lib/lessons';
const Scene=dynamic(()=>import('./scene'),{ssr:false,loading:()=> <div className="scene-message" role="status">Notre petit monde arrive…</div>});
class SceneBoundary extends Component<{children:ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return {error:true};}render(){return this.state.error?<div className="scene-message">Le campement fait une petite pause.<button className="big-button white" onClick={()=>location.reload()}>Réessayer</button><span>Tu peux toujours explorer les leçons !</span></div>:this.props.children;}}
export default function Agassi(){
 const [paused,setPaused]=useState(false),[night,setNight]=useState(false),[reset,setReset]=useState(0),[ready,setReady]=useState(false);
 const [filter,setFilter]=useState<World|'all'>('all'),[lesson,setLesson]=useState<Lesson|null>(null),[panel,setPanel]=useState<'badges'|'parents'|null>(null);
 const [completed,setCompleted]=useState<string[]>([]),[saved,setSaved]=useState(true);
 const root=useRef<HTMLElement>(null),cards=useRef<HTMLDivElement>(null);
 const onReady=useCallback(()=>setReady(true),[]);
 useEffect(()=>{
  const motion=matchMedia('(prefers-reduced-motion: reduce)');setPaused(motion.matches);
  const change=()=>setPaused(motion.matches);motion.addEventListener('change',change);
  try{const data:unknown=JSON.parse(localStorage.getItem('agassi-badges')||'[]');if(Array.isArray(data))setCompleted([...new Set(data.filter((id):id is string=>typeof id==='string'&&lessons.some(l=>l.id===id)))]);}catch{setSaved(false);}
  const media=gsap.matchMedia();media.add('(prefers-reduced-motion: no-preference)',()=>{gsap.from('.hero-copy > *',{y:28,opacity:0,stagger:.09,duration:.6,ease:'power3.out'});},root);
  return()=>{media.revert();motion.removeEventListener('change',change);};
 },[]);
 useEffect(()=>{const media=gsap.matchMedia();media.add('(prefers-reduced-motion: no-preference)',()=>{gsap.fromTo('.lesson-card',{y:25,opacity:0},{y:0,opacity:1,duration:.4,stagger:.07,ease:'power2.out'});},cards);return()=>media.revert();},[filter]);
 function complete(id:string){
  const next=[...new Set([...completed,id])];setCompleted(next);
  try{localStorage.setItem('agassi-badges',JSON.stringify(next));setSaved(true);}catch{setSaved(false);}
 }
 function explore(world:World|'all'){
  setFilter(world);document.getElementById('lessons')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
 }
 return <main ref={root}>
  <a className="skip-link" href="#lessons">Aller aux leçons</a>
  <header className="site-header">
   <a href="#" className="brand" aria-label="Agassi, accueil">agassi<span className="brand-period">.</span></a>
   <nav aria-label="Menu principal"><button className="nav-button home-nav" onClick={()=>{setFilter('all');window.scrollTo({top:0,behavior:'smooth'});}}><Home/> Accueil</button><button className={`nav-button ${filter==='animals'?'selected':''}`} onClick={()=>explore('animals')}><PawPrint/> Animaux</button><button className={`nav-button ${filter==='space'?'selected':''}`} onClick={()=>explore('space')}><Rocket/> Espace</button></nav>
   <button className="badge-button" onClick={()=>setPanel('badges')}><Trophy/> <span>Mes badges</span><b>{completed.length}</b></button>
  </header>
  <section className="hero" aria-labelledby="hero-title">
   <div className="hero-copy"><h1 id="hero-title">Le monde est<br/>ton <span>terrain<br className="desktop-break"/> de jeu.</span></h1><p>Des animaux aux étoiles, il y a tant à découvrir.<br/>Prêt pour une grande petite aventure ?</p><div className="hero-actions"><button className="big-button orange hero-cta" onClick={()=>explore('all')}><Compass size={25}/> C’est parti !</button></div></div>
   <div className={`hero-world ${night?'night':''}`}>
    <span className="world-cloud cloud-one" aria-hidden="true"/><span className="world-cloud cloud-two" aria-hidden="true"/>
    <svg className="hero-cloud" viewBox="0 0 180 90" aria-hidden="true" focusable="false"><path d="M32 84C14 84 4 74 4 60C4 47 13 37 27 35C29 16 44 5 62 5C79 5 91 15 96 28C104 22 112 20 121 22C136 24 145 35 147 47C164 46 176 54 176 66C176 77 166 84 151 84Z"/></svg>
    
    <div className="hero-scene" aria-label="Campement 3D avec un renard animé"><SceneBoundary><Scene paused={paused} night={night} rotating={false} reset={reset} onReady={onReady}/></SceneBoundary></div>
    <span className="scene-caption">{ready?'Fais glisser pour explorer mon petit monde':'Rouxy prépare le campement…'}</span>
    <div className="world-controls"><button onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused?<Play/>:<Pause/>}{paused?'Animer':'Pause'}</button><button onClick={()=>setNight(!night)} aria-pressed={night}>{night?<Sun/>:<Moon/>}{night?'Jour':'Nuit'}</button><button onClick={()=>setReset(n=>n+1)}><RotateCcw/> Recentrer</button></div>
   </div>
  </section>
  <div className="discovery-strip" aria-label="Les aventures Agassi"><span><PawPrint/> Des animaux étonnants</span><span className="strip-star" aria-hidden="true">✳</span><span><Rocket/> L’espace à explorer</span><span className="strip-star" aria-hidden="true">✳</span><span><Star/> Des découvertes à collectionner</span></div>
  <section className="learning-section" id="lessons" aria-labelledby="learning-title">
   <div className="section-heading"><div><span className="eyebrow">À CHAQUE JOUR SA DÉCOUVERTE</span><h2 id="learning-title">Alors, on explore quoi ? <span aria-hidden="true">🔎</span></h2></div><span className="lesson-count">{lessons.length} petites aventures<br/><strong>pour les 6–10 ans</strong></span></div>
   <div className="world-picker" aria-label="Choisir un univers"><button className={filter==='all'?'selected':''} aria-pressed={filter==='all'} onClick={()=>setFilter('all')}><Compass/> Tout découvrir</button><button className={filter==='animals'?'selected':''} aria-pressed={filter==='animals'} onClick={()=>setFilter('animals')}><PawPrint/> Les animaux</button><button className={filter==='space'?'selected':''} aria-pressed={filter==='space'} onClick={()=>setFilter('space')}><Rocket/> L’espace</button></div>
   <div className="lesson-grid" ref={cards}>
    {lessons.filter(l=>filter==='all'||l.world===filter).map(l=><button key={l.id} className="lesson-card" onClick={()=>setLesson(l)} aria-label={`${completed.includes(l.id)?'Rejouer':'Découvrir'} : ${l.title}`}><div className={`lesson-art ${l.color}`}><span className="art-spark spark-a" aria-hidden="true">✦</span><span className="lesson-emoji" aria-hidden="true">{l.emoji}</span><span className="art-spark spark-b" aria-hidden="true">✳</span><span className="category-pill">{l.world==='animals'?<PawPrint size={15}/>:<Rocket size={15}/>} {l.world==='animals'?'Animaux':'Espace'}</span>{completed.includes(l.id)&&<span className="earned-pill"><Check size={16}/> Badge gagné</span>}</div><div className="lesson-card-body"><span className="lesson-meta"><BookOpen size={16}/> Découverte + activité + quiz</span><h3>{l.title}</h3><p>{l.subtitle}</p><span className="card-action">{completed.includes(l.id)?'Je rejoue !':'Je découvre !'} <Play size={17} fill="currentColor"/></span></div></button>)}
   </div>
  </section>
  <section className="curiosity-banner"><span className="banner-rocket" aria-hidden="true">🚀</span><div><span className="eyebrow">ENCORE PLUS LOIN ?</span><h2>La curiosité n’a pas de limites.</h2><p>Avec un adulte, découvre aussi les jeux et les activités de la NASA.</p><span className="external-note">Site externe en anglais · Agassi est un projet indépendant.</span></div><a className="big-button white" href="https://www.nasa.gov/learning-resources/nasa-kids-club/" target="_blank" rel="noreferrer"><Rocket/> NASA Kids’ Club</a></section>
  <footer className="site-footer"><a className="brand" href="#">agassi<span className="brand-period">.</span></a><p>Pour les petits curieux et les grandes découvertes.</p><button onClick={()=>setPanel('parents')}>Le coin des parents</button></footer>
  {lesson&&<LessonDialog key={lesson.id} lesson={lesson} onClose={()=>setLesson(null)} onComplete={complete}/>}
  {panel==='badges'&&<Modal label="Mes badges" onClose={()=>setPanel(null)}><span className="big-emoji" aria-hidden="true">🏆</span><h2>Mes découvertes</h2><p>{completed.length===0?'Ton aventure commence ! Termine un quiz pour gagner ton premier badge.':`Déjà ${completed.length} badge${completed.length>1?'s':''} gagné${completed.length>1?'s':''}. Continue à explorer !`}</p><div className="badge-grid">{lessons.map(l=><div className={`badge-tile ${completed.includes(l.id)?'earned':''}`} key={l.id}><span aria-hidden="true">{completed.includes(l.id)?l.emoji:'☆'}</span><strong>{l.badge}</strong><small>{completed.includes(l.id)?'Bravo, tu l’as gagné !':'À découvrir'}</small></div>)}</div><p className="helper">{saved?'Tes badges sont enregistrés dans ce navigateur, sur cet appareil.':'Le navigateur ne permet pas la sauvegarde. Tes badges restent disponibles pendant cette visite.'}</p><button className="big-button orange" onClick={()=>{setPanel(null);explore('all');}}>Explorer les leçons</button></Modal>}
  {panel==='parents'&&<Modal label="Le coin des parents" onClose={()=>setPanel(null)}><span className="big-emoji" aria-hidden="true">🌻</span><h2>Grandir en s’amusant</h2><p>Agassi propose {lessons.length} leçons originales pour les enfants de 6 à 10 ans. Accompagnez les plus jeunes dans la lecture et les activités. Pas de compte, pas de chronomètre : chacun avance à son rythme.</p><h3>Des repères pour explorer</h3><p>Chaque leçon associe une découverte, une activité et une question avec explication. Les badges sont stockés uniquement dans votre navigateur.</p><div className="parent-links"><a href="https://science.nasa.gov/solar-system/solar-system-facts/" target="_blank" rel="noreferrer">Le système solaire — NASA</a><a href="https://science.nasa.gov/moon/moon-phases/" target="_blank" rel="noreferrer">Les phases de la Lune — NASA</a><a href="https://science.nasa.gov/earth/facts/" target="_blank" rel="noreferrer">La Terre — NASA</a><a href="https://spaceplace.nasa.gov/nebula/en/" target="_blank" rel="noreferrer">Les nébuleuses — NASA Space Place</a><a href="https://spaceplace.nasa.gov/galactic-explorer/en/" target="_blank" rel="noreferrer">Les galaxies — NASA Space Place</a><a href="https://www.nasa.gov/stem-content/nasa-space-place/" target="_blank" rel="noreferrer">NASA Space Place</a></div><h3>Notre compagnon 3D</h3><p>Renard : PixelMannen (modèle), tomkranis (rig et animation). Import Sketchfab via Blender MCP ; taille et séquence idle adaptées. Décor original créé dans Blender.</p><div className="parent-links"><a href="https://sketchfab.com/3d-models/371dea88d7e04a76af5763f2a36866bc" target="_blank" rel="noreferrer">Modèle original du renard</a><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">Licence CC BY 4.0</a></div></Modal>}
 </main>;
}
