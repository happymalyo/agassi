'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { Check, PartyPopper, RotateCcw, Sparkles, X } from 'lucide-react';
import type { Lesson } from '@/lib/lessons';

export function Modal({children,onClose,label}:{children:ReactNode;onClose:()=>void;label:string}) {
 const ref=useRef<HTMLDialogElement>(null);
 const close=useRef(onClose);close.current=onClose;
 useEffect(()=>{
  const dialog=ref.current!;
  const previous=document.activeElement as HTMLElement|null;
  const overflow=document.body.style.overflow;
  document.body.style.overflow='hidden';dialog.showModal();
  const media=gsap.matchMedia();media.add('(prefers-reduced-motion: no-preference)',()=>{gsap.fromTo(dialog,{y:32,scale:.95,opacity:0},{y:0,scale:1,opacity:1,duration:.4,ease:'back.out(1.3)'});});
  return()=>{media.revert();dialog.close();document.body.style.overflow=overflow;previous?.focus();};
 },[]);
 return <dialog ref={ref} className="modal" aria-label={label} onCancel={e=>{e.preventDefault();close.current();}} onClick={e=>{if(e.target===e.currentTarget)close.current();}}>
  <div className="modal-inner"><button autoFocus className="icon-button modal-close" onClick={onClose} aria-label="Fermer"><X/></button>{children}</div>
 </dialog>;
}
export default function LessonDialog({lesson,onClose,onComplete}:{lesson:Lesson;onClose:()=>void;onComplete:(id:string)=>void}) {
 const [step,setStep]=useState(0),[answer,setAnswer]=useState<number|null>(null),[finished,setFinished]=useState(false);
 const content=useRef<HTMLDivElement>(null);
 const correct=answer===lesson.correct;
 useEffect(()=>{
  const media=gsap.matchMedia();media.add('(prefers-reduced-motion: no-preference)',()=>{gsap.fromTo(content.current,{opacity:0,x:20},{opacity:1,x:0,duration:.3,ease:'power2.out'});});
  if(step>0||finished)content.current?.querySelector<HTMLElement>('h2')?.focus({preventScroll:true});
  return()=>media.revert();
 },[step,finished]);
 return <Modal onClose={onClose} label={lesson.title}>
  <div className="lesson-top"><span className={`lesson-token ${lesson.color}`} aria-hidden="true">{lesson.emoji}</span><span>{lesson.world==='animals'?'Les animaux':'L’espace'} · Mini-leçon</span></div>
  <div className="step-dots" aria-label={`Étape ${finished?3:step+1} sur 3`}>
   {['Je découvre','J’explore','Je joue'].map((text,i)=><span key={text} className={step>=i?'current':''}>{i+1}. {text}</span>)}
  </div>
  <div ref={content} className="lesson-body">
   {finished?<div className="celebration"><span className="big-emoji" aria-hidden="true">🏅</span><h2 tabIndex={-1}>Bravo, toi !</h2><p>Tu as gagné le badge <strong>« {lesson.badge} »</strong>.</p><p>Chaque découverte fait grandir ta curiosité.</p><button className="big-button orange" onClick={onClose}><PartyPopper/> Continuer l’aventure</button></div>:<>
    <h2 tabIndex={-1}>{step===0?lesson.title:step===1?'À toi d’explorer !':'Un petit défi pour toi'}</h2>
    {step===0&&<>{lesson.facts.map((fact,i)=><p className="fact" key={fact}><span aria-hidden="true">{i===0?'💡':'🔎'}</span>{fact}</p>)}<button className="big-button orange" onClick={()=>setStep(1)}>J’ai découvert ! <Sparkles/></button></>}
    {step===1&&<><div className={`activity ${lesson.color}`}><span aria-hidden="true">{lesson.emoji}</span><p>{lesson.activity}</p></div><p className="helper">Prends ton temps. Tu peux aussi imaginer l’activité et l’essayer plus tard !</p><div className="lesson-actions"><button className="big-button soft" onClick={()=>setStep(0)}>Revoir la leçon</button><button className="big-button orange" onClick={()=>setStep(2)}>Place au quiz !</button></div></>}
    {step===2&&<><p className="question">{lesson.question}</p><div className="answers">{lesson.answers.map((text,i)=><button key={text} className={`answer ${answer===i?(correct?'correct':'retry'):''}`} aria-pressed={answer===i} disabled={correct} onClick={()=>setAnswer(i)}><span>{['A','B','C'][i]}</span>{text}{answer===i&&correct&&<Check/>}</button>)}</div>
     <div aria-live="polite" className="feedback">{answer!==null&&(correct?<p className="success"><strong>Bien joué !</strong> {lesson.explanation}</p>:<p>Presque ! Tu peux essayer une autre réponse ou relire la leçon.</p>)}</div>
     <div className="lesson-actions"><button className="big-button soft" onClick={()=>{setStep(0);setAnswer(null);}}><RotateCcw size={19}/> Relire</button><button className="big-button orange" disabled={!correct} onClick={()=>{onComplete(lesson.id);setFinished(true);}}>Mon badge ! <PartyPopper size={21}/></button></div>
    </>}
   </>}
  </div>
 </Modal>;
}
