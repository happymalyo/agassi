'use client';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useProgress, Sparkles, ContactShadows } from '@react-three/drei';
import { AnimationMixer, LoopPingPong, Mesh, Group, PointLight } from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { OrbitControls as Controls } from 'three-stdlib';
export type SceneProps={ paused:boolean; night:boolean; rotating:boolean; reset:number; onReady:()=>void };
function Fox({paused,onReady}:{paused:boolean;onReady:()=>void}) {
 const gltf=useGLTF('/models/fox.glb');
 const fox=useMemo(()=>clone(gltf.scene),[gltf.scene]);
 const mixer=useMemo(()=>new AnimationMixer(fox),[fox]);
 useEffect(()=>{
  fox.traverse(o=>{if(o instanceof Mesh){o.castShadow=true;o.receiveShadow=true;}});
  const action=mixer.clipAction(gltf.animations[0]);action.setLoop(LoopPingPong,Infinity);action.play();onReady();
  return ()=>{mixer.stopAllAction();mixer.uncacheRoot(fox);};
 },[fox,gltf.animations,mixer,onReady]);
 useFrame((_,delta)=>{if(!paused)mixer.update(Math.min(delta,.05)*.75);});
 return <primitive object={fox} position={[.1,.13,1]} rotation={[0,-.65,0]} scale={1.25} />;
}
function Camp(){
 const {scene}=useGLTF('/models/camp.glb');
 useEffect(()=>{scene.traverse(o=>{if(o instanceof Mesh){o.castShadow=true;o.receiveShadow=true;}});},[scene]);
 return <primitive object={scene}/>;
}
function Fire({paused}:{paused:boolean}){
 const ref=useRef<Group>(null);const light=useRef<PointLight>(null);const time=useRef(0);
 useFrame((_,d)=>{if(paused)return;time.current+=d;if(ref.current){ref.current.scale.y=1+Math.sin(time.current*8)*.14;ref.current.rotation.y=time.current*.6;}if(light.current)light.current.intensity=4+Math.sin(time.current*11);});
 return <group position={[1.7,.28,.6]}><group ref={ref}><mesh position={[0,.25,0]}><coneGeometry args={[.24,.65,5]}/><meshBasicMaterial color="#ff7b2c"/></mesh><mesh position={[.02,.15,.02]}><coneGeometry args={[.15,.45,5]}/><meshBasicMaterial color="#ffd27b"/></mesh></group><pointLight ref={light} color="#ff9d45" intensity={4} distance={5}/></group>;
}
function Camera({reset,rotating}:{reset:number;rotating:boolean}){
 const controls=useRef<Controls>(null);
 const {size}=useThree();
 // Fit a sphere enclosing the entire camp into the narrower field of view.
 // This also keeps portrait screens safe at the closest permitted zoom.
 const halfFov=Math.atan(Math.tan(39*Math.PI/360)*Math.min(1,size.width/Math.max(1,size.height)));
 const minDistance=6.4/Math.sin(halfFov);
 useEffect(()=>{
  const c=controls.current;if(!c)return;
  c.target.set(0,1.7,0);
  c.object.position.set(10,8.2,12).normalize().multiplyScalar(minDistance*1.06).add(c.target);
  c.update();
 },[reset,minDistance]);
 return <OrbitControls ref={controls} makeDefault enablePan={false} autoRotate={rotating} autoRotateSpeed={.35} minDistance={minDistance} maxDistance={minDistance*1.2} minPolarAngle={.6} maxPolarAngle={1.3} zoomSpeed={.45} />;
}
export default function Scene(p:SceneProps){
 const {active}=useProgress();
 return <><Canvas shadows dpr={[1,1.75]} camera={{position:[10,8.2,12],fov:39}} gl={{antialias:true}} fallback={<div className="scene-message">La 3D nécessite un navigateur compatible WebGL.</div>}>
  <ambientLight intensity={p.night?.48:1.1}/><hemisphereLight args={[p.night?'#9bade0':'#f5efd9','#304135',p.night?.7:1.5]}/>
  <directionalLight position={[-3,8,5]} intensity={p.night?.65:2.6} color={p.night?'#a3b9ed':'#ffdfac'} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-normalBias={.04}/>
  <Suspense fallback={null}>
   <Camp/><Fox paused={p.paused} onReady={p.onReady}/><Fire paused={p.paused}/>
   {!p.paused&&<Sparkles count={p.night?55:22} scale={[9,4,7]} position={[0,2,0]} size={p.night?3:1.8} speed={.25} color={p.night?'#f4db83':'#dbdfb7'}/>}
   <ContactShadows position={[0,-.88,0]} opacity={.45} scale={18} blur={2.5} far={8} resolution={256} color="#080e0a"/>
  </Suspense>
  <Camera reset={p.reset} rotating={p.rotating&&!p.paused}/>
 </Canvas>
 {/* Keep loading UI in the page's React root. Drei Html creates a separate
     DOM root whose synchronous teardown conflicts with Suspense commits. */}
 {active&&<div className="scene-message" role="status" style={{pointerEvents:'none'}}>La forêt s’éveille…</div>}
 </>;
}
