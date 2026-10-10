import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {toCreasedNormals} from 'three/addons/utils/BufferGeometryUtils.js';
import {renderRecipe} from './studio.mjs';

const BG=0xe9eff7;
function lights(scene){
 scene.add(new THREE.HemisphereLight(0xffffff,0x8497b6,2.3));
 const key=new THREE.DirectionalLight(0xffffff,3.8);key.position.set(-45,65,120);scene.add(key);
 const fill=new THREE.DirectionalLight(0xe4efff,1.3);fill.position.set(70,-25,55);scene.add(fill);
 const rim=new THREE.DirectionalLight(0xffffff,1.7);rim.position.set(15,55,-25);scene.add(rim);
}
function colorMaterial(c){return new THREE.MeshPhysicalMaterial({color:c.hex,metalness:c.finish==='silk'?.25:0,roughness:c.finish==='silk'?.25:c.finish==='translucent'?.2:.43,clearcoat:c.finish==='silk'?.3:.12,clearcoatRoughness:.26,transmission:c.finish==='translucent'?.22:0,thickness:c.finish==='translucent'?3:0,ior:1.48,envMapIntensity:.8});}
function prepare(scene){
 const root=scene;
 root.traverse(o=>{if(o.isMesh){
  const match=o.name.match(/^r([0-4])__/);o.userData.role=match?Number(match[1]):0;o.frustumCulled=true;
  if(!o.geometry.getAttribute('normal')){
   if(o.userData.role===0||o.name.includes('enforma')){const original=o.geometry;o.geometry=toCreasedNormals(original,Math.PI/4);original.dispose();}
   else o.geometry.computeVertexNormals();
  }
  o.material?.dispose();
 }});
 return root;
}
export class KeychainViewer{
 constructor(canvas){
  this.canvas=canvas;
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.setClearColor(BG);this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.16;
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color(BG);lights(this.scene);
  this.camera=new THREE.PerspectiveCamera(34,1,.1,1000);this.camera.position.set(34,37,137);
  this.controls=new OrbitControls(this.camera,canvas);this.controls.target.set(0,0,-4);this.controls.enableDamping=false;this.controls.enablePan=false;this.controls.minDistance=48;this.controls.maxDistance=250;
  this.controls.addEventListener('change',()=>this.render());
  this.models={};this.materials=[];this.active=null;this.pending=false;
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas.parentElement);
  this.thumbnailRenderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'low-power'});
  this.thumbnailRenderer.outputColorSpace=THREE.SRGBColorSpace;this.thumbnailRenderer.toneMapping=THREE.ACESFilmicToneMapping;this.thumbnailRenderer.toneMappingExposure=1.16;this.thumbnailRenderer.setPixelRatio(1);
  this.thumbnailScene=new THREE.Scene();this.thumbnailScene.background=new THREE.Color(BG);lights(this.thumbnailScene);
  this.thumbnailCamera=new THREE.PerspectiveCamera(34,1,.1,1000);this.thumbnailCamera.position.set(27,25,141);this.thumbnailCamera.lookAt(0,0,-4);
  this.resize();
 }
 async load(){
  const loader=new GLTFLoader();
  await Promise.all(['sem-fundo'].map(async id=>{const gltf=await loader.loadAsync(new URL(`./models/${id}.glb`,document.baseURI).href);this.models[id]=prepare(gltf.scene);this.models[id].visible=false;this.scene.add(this.models[id]);}));
  return this;
 }
 resize(){const {width,height}=this.canvas.parentElement.getBoundingClientRect();if(!width||!height)return;this.renderer.setSize(width,height,false);this.camera.aspect=width/height;this.camera.updateProjectionMatrix();this.render();}
 apply(recipe){
  this.current=recipe;this.active=this.models[recipe.variant];if(!this.active)return;
  for(const [id,model]of Object.entries(this.models))model.visible=id===recipe.variant;
  const previous=this.materials,{colors,map}=renderRecipe(recipe);this.materials=colors.map(colorMaterial);
  this.active.traverse(o=>{if(o.isMesh)o.material=this.materials[map[o.userData.role]];});
  previous.forEach(m=>m.dispose());this.render();
 }
 render(){if(this.pending)return;this.pending=true;requestAnimationFrame(()=>{this.pending=false;this.renderer.render(this.scene,this.camera);});}
 view(name){const poses={front:[0,0,142],perspective:[34,37,137],back:[0,0,-152]};this.camera.up.set(0,1,0);this.camera.position.set(...poses[name]);this.controls.target.set(0,0,-4);this.controls.update();this.render();}
 zoom(factor){this.camera.position.sub(this.controls.target).multiplyScalar(factor).add(this.controls.target);this.controls.update();this.render();}
 snapshot(recipe,width=360,height=390){
  // Share immutable geometries; each snapshot owns only its temporary materials.
  const {colors,map}=renderRecipe(recipe),clone=this.models[recipe.variant].clone(true),materials=colors.map(colorMaterial);clone.visible=true;
  clone.traverse(o=>{if(o.isMesh)o.material=materials[map[o.userData.role]];});this.thumbnailScene.add(clone);
  this.thumbnailRenderer.setSize(width,height,false);this.thumbnailCamera.aspect=width/height;this.thumbnailCamera.updateProjectionMatrix();this.thumbnailRenderer.render(this.thumbnailScene,this.thumbnailCamera);
  const png=this.thumbnailRenderer.domElement.toDataURL('image/png');this.thumbnailScene.remove(clone);materials.forEach(m=>m.dispose());return png;
 }
 dispose(){this.resizeObserver.disconnect();this.controls.dispose();this.materials.forEach(m=>m.dispose());this.renderer.dispose();this.thumbnailRenderer.dispose();}
}
