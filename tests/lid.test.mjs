import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Vector3} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {rigLid,setLidAngle} from '../src/lid.mjs';
const manifest=JSON.parse(await readFile(new URL('../public/models/manifest.json',import.meta.url)));
const meta=manifest.models['sem-fundo'];
const bytes=await readFile(new URL(`../public/models/${meta.file}`,import.meta.url));
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const root=gltf.scene,meshes=[];
root.traverse(o=>{if(o.isMesh){const part=meta.parts.find(p=>p.name===o.name);assert.ok(part,`Unmapped ${o.name}`);o.userData.lid=part.lid;meshes.push(o);}});
const position=(o,i=0)=>new Vector3().fromBufferAttribute(o.geometry.attributes.position,i).applyMatrix4(o.matrixWorld);
root.updateMatrixWorld(true);
const before=meshes.map(o=>position(o));
const rig=rigLid(root,meta.hinge);
test('published V6 is byte-identical to the approved 39-part GLB, with all color regions mapped',()=>{
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'258aba1baa5071b69ab1be4075bbeb367a8b39fac45d08bcaef1f1075e1da63c');
 assert.equal(meshes.length,39);assert.equal(meta.parts.filter(p=>p.lid).length,22);
 assert.deepEqual([...new Set(meta.parts.map(p=>p.role))].sort(),[0,1,2,3,4]);
 assert.equal(manifest.floor_mm,-.5);assert.equal(manifest.peak_mm,1.2);
});
test('actual lid and 21 logos rotate rigidly on V25B hinge; body and artwork stay fixed; closing restores exact pose',()=>{
 root.updateMatrixWorld(true);
 meshes.forEach((o,i)=>assert.ok(position(o).distanceTo(before[i])<1e-9));
 for(const angle of [25,60,85,0]){
  setLidAngle(rig,angle);root.updateMatrixWorld(true);
  meshes.forEach((o,i)=>{
   const expected=before[i].clone();
   if(o.userData.lid)expected.sub(rig.pivot.position).applyAxisAngle(rig.axis,angle*Math.PI/180).add(rig.pivot.position);
   assert.ok(position(o).distanceTo(expected)<1e-8,`${o.name} at ${angle}`);
  });
 }
 const lid=root.getObjectByName('tampa'),points=lid.geometry.attributes.position;
 let tip=0;for(let i=1;i<points.count;i++)if(points.getY(i)>points.getY(tip))tip=i;
 const closed=position(lid,tip);setLidAngle(rig,85);root.updateMatrixWorld(true);
 assert.ok(position(lid,tip).z>closed.z+15,'Lid opens outwards, not into the body');
 setLidAngle(rig,0);
});
test('preview stops at canonical 85 degrees and rejects invalid angles',()=>{
 assert.equal(setLidAngle(rig,180),85);assert.equal(setLidAngle(rig,-20),0);assert.equal(setLidAngle(rig,NaN),0);
});
