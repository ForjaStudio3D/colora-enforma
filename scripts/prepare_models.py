"""Export display-only LODs from the actual Enforma V2 part meshes.

The production NPZ/3MF files are read only. No reconstructed base or image mesh.
"""
import argparse, hashlib, json
from pathlib import Path
import numpy as np
import trimesh

parser=argparse.ArgumentParser()
parser.add_argument('--source',type=Path,required=True)
args=parser.parse_args()
out=Path(__file__).resolve().parents[1]/'public'/'models'
out.mkdir(parents=True,exist_ok=True)
manifest={'units':'mm','base':'v25b-released','floor_mm':-.7,'peak_mm':.5,'models':{}}
for mode,slug in [('COM-FUNDO','com-fundo'),('SEM-FUNDO','sem-fundo')]:
    folder=args.source/mode
    report=json.loads((folder/'montagem.json').read_text())
    data=np.load(folder/'montagem.npz')
    scene=trimesh.Scene()
    entries=[]
    intervals={str(i):[float('inf'),float('-inf')] for i in range(5)}
    for part in report['parts']:
        i=part['index'];v=data['v'+str(i)];faces=data['f'+str(i)]
        # Front surface now faces +Z, logo reads upright, original mm retained.
        vertices=np.c_[-v[:,2],-v[:,0],v[:,1]+12.0921]
        mesh=trimesh.Trimesh(vertices,faces,process=False)
        role=0 if part['object'] in ('base','tampa') else {'#09078C':1,'#5082FA':2,'#77CFF3':3,'#FFFFFF':4}[part['color']]
        # Printing rotation maps old Z to bed Z; lid articulation preserves it.
        z=17.5000002-v[:,2]
        intervals[str(role)][0]=min(intervals[str(role)][0],float(z.min()))
        intervals[str(role)][1]=max(intervals[str(role)][1],float(z.max()))
        budget=22000 if i<2 else max(800,int(len(faces)*.28))
        if i>=23 and len(faces)>budget:
            mesh=mesh.simplify_quadric_decimation(face_count=budget,aggression=7)
            # QEM may overshoot a silhouette or height extremum. Keep each display
            # part within its source bounds, including the +0.50 mm relief limit.
            mesh.vertices=np.clip(mesh.vertices,vertices.min(axis=0),vertices.max(axis=0))
        name=f'r{role}__{part["name"]}'
        mesh.visual=trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
            name=f'role-{role}',baseColorFactor=trimesh.visual.color.hex_to_rgba(part['color']),
            metallicFactor=0,roughnessFactor=.38))
        scene.add_geometry(mesh,node_name=name,geom_name=name)
        entries.append({'name':name,'role':role,'object':part['object'],'faces':len(mesh.faces)})
    blob=scene.export(file_type='glb')
    (out/(slug+'.glb')).write_bytes(blob)
    lo=max(x[0] for x in intervals.values());hi=min(x[1] for x in intervals.values())
    manifest['models'][slug]={
        'file':slug+'.glb','source_sha256':hashlib.sha256((folder/'montagem.npz').read_bytes()).hexdigest(),
        'bounds_mm':scene.bounds.tolist(),'faces':sum(x['faces'] for x in entries),'bytes':len(blob),
        'parts':entries,'pause':{'simple_height_swap':not(lo<hi),'shared_z_interval_mm':[lo,hi],
            'role_z_intervals_mm':intervals,'note':'Intervalos geométricos; não substitui fatiamento nem gera pausas.'}}
    print(slug,len(blob),'bytes',sum(x['faces'] for x in entries),'triangles',scene.bounds.tolist(),flush=True)
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
