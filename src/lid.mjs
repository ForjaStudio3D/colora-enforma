import {Group,Vector3} from 'three';

// The supplied GLB is already closed. Only the moving assembly is pivot-relative.
export function rigLid(root,hinge){
 const pivot=new Group();pivot.name='lid-pivot';pivot.position.fromArray(hinge.pivot);
 const moving=[];root.traverse(o=>{if(o.isMesh&&o.userData.lid)moving.push(o);});
 root.add(pivot);root.updateMatrixWorld(true);
 for(const mesh of moving)pivot.attach(mesh);
 return {pivot,axis:new Vector3().fromArray(hinge.axis).normalize(),max:hinge.max_degrees,angle:0};
}
export function setLidAngle(rig,value){
 const number=Number(value);rig.angle=Math.min(rig.max,Math.max(0,Number.isFinite(number)?number:0));
 rig.pivot.quaternion.setFromAxisAngle(rig.axis,rig.angle*Math.PI/180);
 return rig.angle;
}
