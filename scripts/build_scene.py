"""Run inside the connected Blender. Original Sketchfab fox must be imported first."""
import bpy, math, random, os
from mathutils import Vector
random.seed(24)
BASE='/home/mario/Documents/jobs/agassi'
os.makedirs(BASE+'/public/models',exist_ok=True)
scene=bpy.context.scene
root=bpy.data.objects['Sketchfab_model']
rig=bpy.data.objects['Object_4']
# Export the source rig with only its stationary opening sequence.
scene.frame_start=1
scene.frame_end=140
scene.frame_set(1)
for track in rig.animation_data.nla_tracks: track.mute=True
rig.animation_data.action.name='Fox_Idle'
root.location.z += 0.002
bpy.ops.object.select_all(action='DESELECT')
for obj in [root]+list(root.children_recursive): obj.select_set(True)
bpy.context.view_layer.objects.active=root
bpy.ops.export_scene.gltf(filepath=BASE+'/public/models/fox.glb',export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIVE_ACTIONS',export_frame_range=True,export_force_sampling=True)
# A dedicated collection keeps all original user objects intact.
collection=bpy.data.collections.new('Wildcamp · environment')
scene.collection.children.link(collection)
env=[]
def mat(name,color):
 m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
 bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
 bs.inputs['Base Color'].default_value=(*color,1); bs.inputs['Roughness'].default_value=.9
 return m
soil=mat('Layered earth',(.16,.19,.13)); grass=mat('Moss green',(.28,.36,.18)); path=mat('Sandstone path',(.53,.46,.30))
wood=mat('Cedar wood',(.22,.12,.065)); leaf=[mat('Pine '+str(i),c) for i,c in enumerate([(.09,.22,.15),(.15,.29,.18),(.23,.34,.19)])]
stone=mat('River stone',(.36,.41,.35)); canvas=mat('Ochre canvas',(.78,.39,.12)); dark=mat('Tent opening',(.10,.12,.085)); rope=mat('Ropes',(.66,.58,.39))
def add(obj,name,material):
 obj.name=name
 for col in list(obj.users_collection): col.objects.unlink(obj)
 collection.objects.link(obj);obj.data.materials.append(material);env.append(obj);return obj
def cone(name,loc,r1,r2,depth,material,verts=7):
 bpy.ops.mesh.primitive_cone_add(vertices=verts,radius1=r1,radius2=r2,depth=depth,location=loc)
 return add(bpy.context.object,name,material)
def rock(name,loc,scale,material=stone):
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1,location=loc)
 o=add(bpy.context.object,name,material);o.scale=scale;o.rotation_euler=(random.random(),random.random(),random.random());return o
def beam(name,a,b,r,material):
 a,b=Vector(a),Vector(b);o=cone(name,(a+b)/2,r,r,(a-b).length,material,6);o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return o
def mesh(name,verts,faces,material):
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(name,me);collection.objects.link(o);o.data.materials.append(material);env.append(o);return o
cone('Island · earth',(0,0,-.42),4.5,5.15,.85,soil,11).scale.y=.84
cone('Island · meadow',(0,0,.025),5.15,5.02,.18,grass,11).scale.y=.84
# A winding path leading into the camp.
mesh('Trail',[(-1.4,-4.0,.125),(-.3,-4.12,.125),(.6,-2.7,.125),(.7,-1.7,.125),(1.6,-.5,.125),(2.9,.3,.125),(2.5,.8,.125),(1.0,.1,.125),(-.05,-1.4,.125),(-.15,-2.7,.125)],[(0,1,2,3,4,5,6,7,8,9)],path)
for i,(x,y,s) in enumerate([(-3,1.7,1.2),(-2,2.6,1.45),(-.5,3,1.2),(1.1,3.05,1.3),(3,2.1,1.5),(3.9,.8,1),(-4,.1,.95),(-3.7,-1.4,.7),(3.7,-1.8,.65)]):
 cone('Pine trunk '+str(i),(x,y,.7*s),.15*s,.10*s,1.4*s,wood)
 for j in range(3):cone('Pine crown '+str(i)+' '+str(j),(x,y,(1.4+j*.6)*s),(.95-j*.18)*s,.025,1.65*s,leaf[(i+j)%3])
for i in range(28):
 a=random.uniform(0,math.tau);r=random.uniform(3.7,4.6);x,y=math.cos(a)*r,math.sin(a)*r*.78
 rock('Weathered rock '+str(i),(x,y,.17),(random.uniform(.2,.6),random.uniform(.2,.5),random.uniform(.2,.55)))
# A-frame tent at the back left, open towards the viewer.
x,y=-1.9,.6
mesh('Tent canvas',[(x-1,y-.8,.15),(x,y-.8,1.65),(x+1,y-.8,.15),(x-1,y+1,.15),(x,y+1,1.65),(x+1,y+1,.15)],[(0,1,4,3),(1,2,5,4),(3,4,5)],canvas)
mesh('Tent interior',[(x-.82,y-.74,.16),(x,y-.74,1.4),(x+.82,y-.74,.16)],[(0,1,2)],dark)
beam('Tent ridge',(x,y-1,1.65),(x,y+1.2,1.65),.035,wood)
beam('Front tent pole',(x,y-.83,.15),(x,y-.83,1.7),.035,wood)
for dx in [-1,1]:
 beam('Tent guyline',(x+dx*.7,y-.8,.6),(x+dx*1.3,y-1.25,.14),.012,rope)
# Fire ring. Animated flames are rendered in the app.
for i in range(9):
 a=i*math.tau/9;rock('Fire ring '+str(i),(1.7+math.cos(a)*.48,-.6+math.sin(a)*.48,.20),(.19,.16,.14))
for i in [-1,1]:beam('Firewood',(1.4,-.6+i*.25,.21),(2,-.6-i*.25,.21),.09,wood)
beam('Fallen log',(-2.9,-2,.35),(-1.4,-2.3,.35),.24,wood)
for i in range(75):
 x=random.uniform(-4.2,4.2);y=random.uniform(-3.0,3)
 if abs(x)<1.2 or (x<-1 and y>-.8) or (x>1 and -1.3<y<.3):continue
 cone('Grass tuft '+str(i),(x,y,.24),.10,0,random.uniform(.18,.35),leaf[i%3],4)
bpy.ops.object.select_all(action='DESELECT')
for o in env:o.select_set(True)
bpy.context.view_layer.objects.active=env[0]
bpy.ops.export_scene.gltf(filepath=BASE+'/public/models/camp.glb',export_format='GLB',use_selection=True,export_animations=False)
# Place fox for the editable source scene, after exporting its local asset.
root.location=(.15,-.7,.125);root.rotation_euler.z=-.45
scene.world.color=(.2,.2,.2)
for o in bpy.data.objects:
 if o.type=='LIGHT':o.data.energy=1300;o.location=(1,-3,7)
cam=bpy.data.objects.get('Camera')
if cam:
 cam.location=(10,-15,11);cam.rotation_euler=(Vector((0,0,.6))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=13;scene.camera=cam
scene.render.resolution_x=1400;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
bpy.ops.wm.save_as_mainfile(filepath=BASE+'/assets/wildcamp.blend')
print('EXPORTED',[(f,os.path.getsize(BASE+'/public/models/'+f)) for f in ['fox.glb','camp.glb']])
