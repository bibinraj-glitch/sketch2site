export type SketchTool = 'select' | 'move' | 'pencil' | 'brush' | 'line' | 'rectangle' | 'rounded' | 'circle' | 'eraser' | 'text' | 'button' | 'image' | 'navbar' | 'hero' | 'card' | 'container' | 'form' | 'input' | 'link' | 'icon' | 'footer';

export type SketchObject = {
  id: string; type: SketchTool; x: number; y: number; width: number; height: number;
  fill: string; stroke: string; strokeWidth: number; text?: string; fontSize?: number; points?: {x:number;y:number}[];
  radius?: number; opacity?: number;
};

export type SiteBlock = { id:string; type:string; label:string; x:number;y:number;width:number;height:number; text?:string; fill:string };
export type SiteStructure = { title:string; blocks:SiteBlock[]; generatedAt:string };

export const STORAGE_KEY = 'sketch2site-project';
export const PALETTE = ['#222a35','#f16b5d','#f5d66b','#477f78','#f6efe2','#d9b9a7','#8a96a3','#c5d5d0'];

const id = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
export const starterSketch = (): SketchObject[] => [
  {id:id(),type:'navbar',x:60,y:45,width:880,height:58,fill:'#f6efe2',stroke:'#222a35',strokeWidth:2,text:'STUDIO / WORK / ABOUT'},
  {id:id(),type:'hero',x:60,y:150,width:880,height:265,fill:'#f5d66b',stroke:'#222a35',strokeWidth:2,text:'Make the idea visible.'},
  {id:id(),type:'text',x:98,y:225,width:420,height:58,fill:'#222a35',stroke:'none',strokeWidth:0,text:'Sketch first. Ship sooner.'},
  {id:id(),type:'button',x:98,y:332,width:164,height:48,fill:'#f16b5d',stroke:'#222a35',strokeWidth:2,text:'Start exploring'},
  {id:id(),type:'card',x:60,y:462,width:278,height:178,fill:'#f6efe2',stroke:'#222a35',strokeWidth:2,text:'A considered starting point'},
  {id:id(),type:'card',x:370,y:462,width:278,height:178,fill:'#c5d5d0',stroke:'#222a35',strokeWidth:2,text:'Structure from intuition'},
  {id:id(),type:'card',x:680,y:462,width:260,height:178,fill:'#f16b5d',stroke:'#222a35',strokeWidth:2,text:'Ready when you are'},
];

export function saveProject(objects:SketchObject[], name='Untitled direction') {
  const project = {name, objects, savedAt:new Date().toISOString()};
  localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  return project;
}
export function loadProject(): {name:string;objects:SketchObject[];savedAt:string}|null {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export function convertSketch(objects:SketchObject[]):SiteStructure {
  const blocks = objects.filter(o=>o.type!=='select' && o.type!=='eraser' && o.type!=='pencil' && o.type!=='line').map(o=>({
    id:o.id, type: semanticType(o.type), label: labelFor(o.type), x:o.x,y:o.y,width:o.width,height:o.height,text:o.text,fill:o.fill
  }));
  return {title: objects.find(o=>o.type==='hero')?.text || 'A new direction', blocks, generatedAt:new Date().toISOString()};
}
function semanticType(type:SketchTool) {
  const map:Record<string,string> = {navbar:'nav',hero:'section',card:'article',footer:'footer',form:'form',input:'input',button:'button',link:'a',image:'img',text:'p',container:'div',icon:'span',circle:'figure',rectangle:'div',rounded:'div'};
  return map[type] || type;
}
function labelFor(type:SketchTool) { return type === 'navbar' ? 'Navigation' : type === 'hero' ? 'Hero section' : type.charAt(0).toUpperCase()+type.slice(1); }
export function improveLocally(objects:SketchObject[]) {
  return objects.map(o => o.type==='hero' ? {...o, text:o.text?.replace(/\.$/,' — built from a sketch.')} : o);
}
export function codeFor(site:SiteStructure, tab:'react'|'html'|'css'|'js') {
  if (tab==='react') return `export default function Page() {
  return (
    <main className="site">
${site.blocks.map(b=>`      <${b.type} className="block-${b.id.slice(0,5)}">${b.type==='img'?'':b.text||''}</${b.type}>`).join('\n')}
    </main>
  );
}`;
  if (tab==='html') return `<main class="site">\n${site.blocks.map(b=>`  <${b.type} class="block">${b.text||''}</${b.type}>`).join('\n')}\n</main>`;
  if (tab==='css') return `.site { max-width: 1120px; margin: auto; font-family: "DM Sans", sans-serif; }\n.block { padding: 32px; border-radius: 20px; margin: 16px; }\n@media (max-width: 700px) { .site { padding: 12px; } .block { margin: 8px 0; } }`;
  return `// Sketch2Site local interaction layer\nconst buttons = document.querySelectorAll('button');\nbuttons.forEach(button => button.addEventListener('click', () => console.log('clicked', button.textContent)));`;
}