"""Copy the approved V6 GLB verbatim; assign roles without modifying geometry."""
import argparse, hashlib, json, shutil
from pathlib import Path
parser=argparse.ArgumentParser()
parser.add_argument('--source',type=Path,required=True)
args=parser.parse_args()
folder=args.source/'geometry'
report=json.loads((folder/'montagem.json').read_text())
source=folder/'montagem.glb'
digest=hashlib.sha256(source.read_bytes()).hexdigest()
assert report['revision']=='V6'
assert digest=='258aba1baa5071b69ab1be4075bbeb367a8b39fac45d08bcaef1f1075e1da63c', 'Approved source changed'
out=Path(__file__).resolve().parents[1]/'public/models'
manifest=json.loads((out/'manifest.json').read_text())
parts=[]
for part in report['parts']:
    role=0 if part['object'] in ('base','tampa') else {'#09078C':1,'#5082FA':2,'#77CFF3':3,'#FFFFFF':4}[part['color']]
    parts.append({'name':part['name'],'role':role,'object':part['object'],'faces':part['faces'],
                  'lid':part['object']=='tampa' or part['name'].endswith('@tampa')})
assert sum(p['lid'] for p in parts)==22
filename='enforma-v6-montagem.glb'
shutil.copyfile(source,out/filename)
manifest.update(revision='V6',floor_mm=-.5,peak_mm=1.2,color_root_mm=-1.5,window_mm=[31,33.6])
old=manifest['models']['sem-fundo']
manifest['models']['sem-fundo']={
    'file':filename,'revision':'V6','source_sha256':digest,'file_sha256':digest,
    'geometry':'Approved montagem.glb, byte-for-byte; no decimation or vertex changes',
    'bounds_mm':[[-17.5,-35.00034,-11.5],[17.5,35.00034,1.199940]],
    'faces':sum(p['faces'] for p in parts),'bytes':source.stat().st_size,'parts':parts,
    'hinge':{'pivot':[0,8.49538,-5.49455],'axis':[1,0,0],'max_degrees':85,'source_pose':'closed',
             'source':'V25B geometria.py PINO_XY / ANG_FECHADO; native opening -Z; preview x=-Z,y=-X,z=Y+12.0921',
             'limit_note':'Canonical mechanical range; does not validate physical clearance of this decorated lid.'}}
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(filename,digest,len(parts),'parts')
