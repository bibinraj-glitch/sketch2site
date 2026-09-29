import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  AlignCenter, ArrowLeft, ArrowRight, ArrowUpRight, Box, Check, ChevronDown,
  Circle, Code2, Copy, Download, Eraser, Eye, FilePlus2, FileText, Grid3X3,
  Hand, Image as ImageIcon, Layers3, LayoutGrid, LayoutPanelTop, Link2,
  Menu, MousePointer2, Move, Paintbrush, Palette, Pencil, Plus, Redo2,
  RotateCcw, Save, Scissors, Settings2, Sparkles, Square, SquareDashed,
  TextCursorInput, Trash2, Type, Undo2, Upload, WandSparkles, X, Zap
} from 'lucide-react';
import {
  type SketchObject, type SketchTool, type SiteStructure, starterSketch,
  saveProject, loadProject, convertSketch, improveLocally, codeFor, PALETTE
} from '@/lib/sketch-service';

type View = 'home' | 'editor' | 'preview';
type History = { objects: SketchObject[]; site: SiteStructure | null };
type ToolDef = { id: SketchTool; label: string; icon: typeof MousePointer2; section?: string };

const TOOL_DEFS: ToolDef[] = [
  { id: 'select', label: 'Select', icon: MousePointer2 },
  { id: 'move', label: 'Move', icon: Move },
  { id: 'pencil', label: 'Pencil', icon: Pencil },
  { id: 'brush', label: 'Brush', icon: Paintbrush },
  { id: 'line', label: 'Line', icon: ArrowRight },
  { id: 'rectangle', label: 'Rectangle', icon: Square },
  { id: 'rounded', label: 'Rounded rectangle', icon: SquareDashed },
  { id: 'circle', label: 'Circle', icon: Circle },
  { id: 'eraser', label: 'Eraser', icon: Eraser },
  { id: 'text', label: 'Text', icon: Type, section: 'Website elements' },
  { id: 'button', label: 'Button', icon: Zap },
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'navbar', label: 'Navbar', icon: Menu },
  { id: 'hero', label: 'Hero', icon: LayoutPanelTop },
  { id: 'card', label: 'Card', icon: Box },
  { id: 'container', label: 'Container', icon: Layers3 },
  { id: 'form', label: 'Form', icon: FileText },
  { id: 'input', label: 'Input', icon: TextCursorInput },
  { id: 'link', label: 'Link', icon: Link2 },
  { id: 'icon', label: 'Icon', icon: Sparkles },
  { id: 'footer', label: 'Footer', icon: LayoutGrid },
];

const OBJECT_TOOLS = new Set<SketchTool>([
  'text', 'button', 'image', 'navbar', 'hero', 'card', 'container', 'form',
  'input', 'link', 'icon', 'footer'
]);

const uid = () => `obj-${Math.random().toString(36).slice(2, 9)}`;
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

function Home({ onCreate }: { onCreate: () => void }) {
  return (
    <main className="home-page">
      <nav className="home-nav">
        <Logo />
        <div className="home-nav-links"><a href="#how">How it works</a><a href="#features">Features</a><a href="#workflow">Workflow</a></div>
        <button className="nav-ghost" onClick={onCreate}>Open editor <ArrowRight size={15} /></button>
      </nav>
      <section className="hero-home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> AI-powered website sketching</div>
          <h1>Draw your website.<br /><em>Let AI build it.</em></h1>
          <p>Sketch your website like you use Paint, then turn your drawing into a real responsive website in seconds.</p>
          <div className="hero-actions">
            <button className="primary-btn large" onClick={onCreate}>Create website <ArrowUpRight size={17} /></button>
            <a className="text-btn" href="#how"><span className="play-circle">▶</span> See how it works</a>
          </div>
          <div className="hero-note"><Check size={14} /> No code required &nbsp;·&nbsp; Local-first &nbsp;·&nbsp; Export anytime</div>
        </div>
        <div className="hero-demo" aria-label="Sketch to site flow">
          <div className="demo-window">
            <div className="demo-top"><span className="window-dots"><i /><i /><i /></span><span>untitled-direction.s2s</span><span className="demo-status">● saved locally</span></div>
            <div className="demo-body">
              <div className="demo-sketch">
                <span className="demo-label">YOUR SKETCH</span>
                <div className="mini-nav">LOGO <span>WORK &nbsp; ABOUT &nbsp; CONTACT</span></div>
                <div className="mini-hero"><b>Make the idea visible.</b><button>START EXPLORING</button></div>
                <div className="mini-cards"><i /><i /><i /></div>
              </div>
              <div className="demo-arrow"><span>→</span><small>AI<br />understands</small></div>
              <div className="demo-site">
                <span className="demo-label">REAL WEBSITE</span>
                <div className="site-top"><b>studio</b><span>work&nbsp;&nbsp; about&nbsp;&nbsp; contact</span></div>
                <div className="site-copy"><small>HELLO, I'M GLAD YOU'RE HERE</small><strong>Ideas worth<br /><i>making real.</i></strong><button>Explore work <ArrowUpRight size={11} /></button></div>
                <div className="site-bars"><i /><i /><i /></div>
              </div>
            </div>
          </div>
          <div className="float-card float-card-one"><Sparkles size={13} /> <span>Semantic structure detected</span><Check size={13} /></div>
          <div className="float-card float-card-two"><span className="live-dot" /> <span>Live preview</span><span className="float-pill">Responsive</span></div>
        </div>
      </section>
      <section className="flow-strip" id="how">
        <div className="flow-intro"><span className="section-kicker">A faster way to start</span><h2>From rough idea<br />to <i>real site.</i></h2></div>
        {[
          ['01', 'Draw', 'Use familiar tools to map out your idea.'],
          ['02', 'Analyze', 'Sketch2Site reads the intent behind your layout.'],
          ['03', 'Convert', 'Turn your canvas into semantic components.'],
          ['04', 'Ship', 'Preview, refine, and export your site.'],
        ].map(([num, title, text], index) => <div className="flow-step" key={title}><span>{num}</span><strong>{title}</strong><p>{text}</p>{index < 3 && <ArrowRight size={15} className="flow-arrow" />}</div>)}
      </section>
      <section className="features-home" id="features">
        <div><span className="section-kicker">Built for momentum</span><h2>Make the first draft<br /><i>the easiest part.</i></h2></div>
        <div className="feature-grid">
          <Feature icon={Palette} title="Draw freely" text="A friendly canvas for the way ideas actually arrive: rough, visual, and in motion." />
          <Feature icon={WandSparkles} title="AI conversion" text="Convert layout intent into responsive, semantic components without losing the original idea." />
          <Feature icon={Eye} title="Live preview" text="See the real thing as you shape it, with viewport controls for every screen." />
          <Feature icon={Zap} title="Export cleanly" text="Take your HTML, CSS, JavaScript, or React structure with you whenever you're ready." />
        </div>
      </section>
      <footer className="home-footer"><Logo /><span>Draw it. Design it. Make it real.</span><span>© 2026 Sketch2Site</span></footer>
    </main>
  );
}

function Feature({ icon: Icon, title, text }: { icon: typeof Palette; title: string; text: string }) {
  return <article className="feature-card"><div className="feature-icon"><Icon size={18} /></div><h3>{title}</h3><p>{text}</p><ArrowUpRight size={16} className="feature-arrow" /></article>;
}

function Logo() {
  return <div className="brand-mark"><span>✦</span> Sketch2Site</div>;
}

function Editor({ onPreview }: { onPreview: (site: SiteStructure) => void }) {
  const [objects, setObjects] = useState<SketchObject[]>(() => loadProject()?.objects ?? starterSketch());
  const [tool, setTool] = useState<SketchTool>('select');
  const [selected, setSelected] = useState<string | null>(null);
  const [color, setColor] = useState(PALETTE[0]);
  const [zoom, setZoom] = useState(72);
  const [grid, setGrid] = useState(true);
  const [snap, setSnap] = useState(true);
  const [site, setSite] = useState<SiteStructure | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [future, setFuture] = useState<History[]>([]);
  const [message, setMessage] = useState('Ready to sketch');
  const [assistant, setAssistant] = useState('');
  const [showAssistant, setShowAssistant] = useState(true);
  const [showSave, setShowSave] = useState(false);
  const [projectName, setProjectName] = useState('Untitled direction');
  const [drawing, setDrawing] = useState<{ start: { x: number; y: number }; current: { x: number; y: number } } | null>(null);
  const [drag, setDrag] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [resize, setResize] = useState<{ id: string; startX: number; startY: number; startW: number; startH: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const selectedObject = objects.find(o => o.id === selected) ?? null;

  const snapshot = () => ({ objects: clone(objects), site: clone(site) });
  const commit = (next: SketchObject[], nextSite = site) => {
    setHistory(prev => [...prev.slice(-29), snapshot()]);
    setFuture([]);
    setObjects(next);
    setSite(nextSite);
  };
  const updateObject = (id: string, patch: Partial<SketchObject>, record = true) => {
    const next = objects.map(o => o.id === id ? { ...o, ...patch } : o);
    if (record) commit(next); else setObjects(next);
  };
  const localPoint = (event: { clientX: number; clientY: number }) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1000, ((event.clientX - rect.left) / rect.width) * 1000)), y: Math.max(0, Math.min(700, ((event.clientY - rect.top) / rect.height) * 700)) };
  };
  const snapPoint = (point: { x: number; y: number }) => snap ? { x: Math.round(point.x / 10) * 10, y: Math.round(point.y / 10) * 10 } : point;
  const createObject = (type: SketchTool, x: number, y: number, width?: number, height?: number): SketchObject => {
    const dimensions: Record<string, [number, number]> = { text: [260, 54], button: [170, 48], image: [210, 140], navbar: [720, 58], hero: [720, 230], card: [210, 150], container: [330, 200], form: [280, 190], input: [230, 42], link: [160, 35], icon: [48, 48], footer: [720, 64] };
    const [w, h] = dimensions[type] ?? [180, 100];
    const text: Record<string, string> = { text: 'Add your headline', button: 'Get started', image: 'Image placeholder', navbar: 'LOGO   WORK   ABOUT   CONTACT', hero: 'Make the idea visible.', card: 'A thoughtful starting point', container: 'Container', form: 'Get in touch', input: 'Your email address', link: 'Read more →', icon: '✦', footer: 'Made with Sketch2Site' };
    return { id: uid(), type, x: snapPoint({ x, y }).x, y: snapPoint({ x, y }).y, width: width ?? w, height: height ?? h, fill: type === 'hero' ? '#f5d66b' : type === 'button' ? '#f16b5d' : '#f6efe2', stroke: type === 'text' ? 'none' : '#222a35', strokeWidth: type === 'text' ? 0 : 2, text: text[type], radius: type === 'rounded' ? 18 : type === 'button' ? 10 : 0, fontSize: type === 'text' || type === 'hero' ? 24 : 13 };
  };
  const addToolObject = (type = tool) => {
    const next = [...objects, createObject(type, 120 + (objects.length % 3) * 40, 110 + (objects.length % 4) * 60)];
    commit(next);
    setSelected(next[next.length - 1].id);
    setMessage(`${type[0].toUpperCase() + type.slice(1)} added`);
  };
  const handleCanvasDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (tool === 'select' || tool === 'move') { setSelected(null); return; }
    const point = snapPoint(localPoint(event));
    if (OBJECT_TOOLS.has(tool)) { addToolObjectAt(tool, point.x, point.y); return; }
    if (tool === 'pencil' || tool === 'brush' || tool === 'line' || tool === 'rectangle' || tool === 'rounded' || tool === 'circle') setDrawing({ start: point, current: point });
  };
  const addToolObjectAt = (type: SketchTool, x: number, y: number) => {
    const next = [...objects, createObject(type, x, y)];
    commit(next);
    setSelected(next[next.length - 1].id);
    setMessage(`${type[0].toUpperCase() + type.slice(1)} added`);
  };
  const handleCanvasMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const point = snapPoint(localPoint(event));
    if (drawing) setDrawing({ ...drawing, current: point });
    if (drag) {
      const object = objects.find(o => o.id === drag.id);
      if (object) updateObject(drag.id, { x: snapPoint({ x: point.x - drag.offsetX, y: point.y - drag.offsetY }).x, y: snapPoint({ x: point.x - drag.offsetX, y: point.y - drag.offsetY }).y }, false);
    }
    if (resize) {
      updateObject(resize.id, { width: Math.max(30, resize.startW + point.x - resize.startX), height: Math.max(24, resize.startH + point.y - resize.startY) }, false);
    }
  };
  const finishPointer = () => {
    if (drawing) {
      const { start, current } = drawing;
      const left = Math.min(start.x, current.x), top = Math.min(start.y, current.y);
      const w = Math.max(8, Math.abs(current.x - start.x)), h = Math.max(8, Math.abs(current.y - start.y));
      const type = tool === 'pencil' || tool === 'brush' ? tool : tool;
      const next = [...objects, { ...createObject(type, left, top, w, h), points: type === 'pencil' || type === 'brush' ? [start, current] : undefined, stroke: color, fill: type === 'circle' ? 'transparent' : color === '#222a35' ? '#f6efe2' : `${color}55` }];
      commit(next);
      setSelected(next[next.length - 1].id);
      setDrawing(null);
    }
    if (drag) { setHistory(prev => [...prev.slice(-29), snapshot()]); setFuture([]); setDrag(null); }
    if (resize) { setHistory(prev => [...prev.slice(-29), snapshot()]); setFuture([]); setResize(null); }
  };
  const selectObject = (event: ReactPointerEvent<SVGGElement>, object: SketchObject) => {
    event.stopPropagation();
    if (tool === 'eraser') { commit(objects.filter(o => o.id !== object.id)); setSelected(null); return; }
    setSelected(object.id);
    if (tool === 'select' || tool === 'move') setDrag({ id: object.id, offsetX: localPoint(event).x - object.x, offsetY: localPoint(event).y - object.y });
  };
  const undo = () => { const last = history.at(-1); if (!last) return; setFuture(prev => [...prev, snapshot()]); setHistory(prev => prev.slice(0, -1)); setObjects(last.objects); setSite(last.site); };
  const redo = () => { const next = future.at(-1); if (!next) return; setHistory(prev => [...prev, snapshot()]); setFuture(prev => prev.slice(0, -1)); setObjects(next.objects); setSite(next.site); };
  const convert = () => { if (!objects.length) { setMessage('Add an element before converting'); return; } const generated = convertSketch(objects); setSite(generated); onPreview(generated); };
  const save = () => { saveProject(objects, projectName); setMessage('Project saved locally'); setShowSave(false); };
  const improve = () => { setObjects(improveLocally(objects)); setMessage('Local assistant updated the direction'); };
  const assistantAction = (prompt: string) => { setAssistant(prompt); if (/dark/i.test(prompt)) setObjects(objects.map(o => ({ ...o, fill: o.type === 'hero' ? '#222a35' : '#2d3940', stroke: '#f5d66b' }))); else if (/modern|rounded/i.test(prompt)) setObjects(objects.map(o => ({ ...o, radius: Math.max(o.radius ?? 0, 16) }))); else improve(); setMessage('Assistant applied a local improvement'); };
  const deleteSelected = () => { if (selected) { commit(objects.filter(o => o.id !== selected)); setSelected(null); } };

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); undo(); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') { event.preventDefault(); saveProject(objects, projectName); setMessage('Project saved locally'); }
      if (event.key === 'Delete' || event.key === 'Backspace') deleteSelected();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });

  return <main className="editor-shell">
    <header className="editor-topbar">
      <button className="top-brand" onClick={() => window.history.back()}><span>✦</span> Sketch2Site <small>/ untitled-direction</small></button>
      <div className="top-actions">
        <button className="icon-btn" title="Undo" onClick={undo}><Undo2 size={16} /></button><button className="icon-btn" title="Redo" onClick={redo}><Redo2 size={16} /></button><span className="top-divider" />
        <button className="top-text-btn" onClick={() => { setObjects(starterSketch()); setSelected(null); setSite(null); setMessage('New project created'); }}><FilePlus2 size={15} /> New</button>
        <button className="top-text-btn" onClick={() => { const loaded = loadProject(); if (loaded) { setObjects(loaded.objects); setProjectName(loaded.name); setMessage('Project opened'); } else setMessage('No saved project yet'); }}><FolderOpenIcon /> Open</button>
        <button className="top-text-btn" onClick={() => setShowSave(true)}><Save size={15} /> Save</button>
        <button className="convert-btn" onClick={convert}><Sparkles size={15} /> Convert to website <ArrowUpRight size={14} /></button>
      </div>
    </header>
    <div className="editor-layout">
      <aside className="tools-panel">
        <div className="panel-label">Tools</div>
        <div className="tool-grid">
          {TOOL_DEFS.filter(t => !t.section).map(def => <ToolButton key={def.id} def={def} active={tool === def.id} onClick={() => setTool(def.id)} />)}
        </div>
        <div className="panel-label website-label">Website elements</div>
        <div className="website-tools">
          {TOOL_DEFS.filter(t => t.section).map(def => <ToolButton key={def.id} def={def} active={tool === def.id} onClick={() => { setTool(def.id); addToolObject(def.id); }} wide />)}
        </div>
        <div className="tool-bottom"><button className="tool-setting"><Settings2 size={15} /> Settings</button><div className="shortcuts"><kbd>⌘</kbd><kbd>Z</kbd> undo <kbd>⌘</kbd><kbd>S</kbd> save</div></div>
      </aside>
      <section className="canvas-workspace">
        <div className="canvas-toolbar">
          <div className="canvas-breadcrumb"><span>Untitled direction</span><ChevronDown size={14} /></div>
          <div className="canvas-tools-center"><button className={grid ? 'active' : ''} onClick={() => setGrid(!grid)}><Grid3X3 size={15} /> Grid</button><button className={snap ? 'active' : ''} onClick={() => setSnap(!snap)}><MagnetIcon /> Snap</button><span className="canvas-separator" /><button onClick={() => setZoom(Math.max(40, zoom - 10))}>−</button><span className="zoom-value">{zoom}%</span><button onClick={() => setZoom(Math.min(120, zoom + 10))}>+</button></div>
          <button className="preview-mini-btn" onClick={() => site ? onPreview(site) : convert()}><Eye size={15} /> Preview</button>
        </div>
        <div className="canvas-stage">
          <div className="ruler ruler-top"><span>0</span><span>240</span><span>480</span><span>720</span><span>960</span></div>
          <div className="ruler ruler-left"><span>0</span><span>175</span><span>350</span><span>525</span><span>700</span></div>
          <svg ref={svgRef} className="drawing-canvas" viewBox="0 0 1000 700" style={{ width: `${zoom}%` }} onPointerDown={handleCanvasDown} onPointerMove={handleCanvasMove} onPointerUp={finishPointer} onPointerLeave={finishPointer}>
            <defs><pattern id="canvas-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e9e5dd" strokeWidth=".8" /></pattern></defs>
            <rect width="1000" height="700" fill={grid ? 'url(#canvas-grid)' : '#fffdf9'} />
            {objects.map(object => <CanvasObject key={object.id} object={object} selected={selected === object.id} onPointerDown={selectObject} onResize={(event) => { event.stopPropagation(); setSelected(object.id); const p = localPoint(event); setResize({ id: object.id, startX: p.x, startY: p.y, startW: object.width, startH: object.height }); }} />)}
            {drawing && <rect x={Math.min(drawing.start.x, drawing.current.x)} y={Math.min(drawing.start.y, drawing.current.y)} width={Math.abs(drawing.current.x - drawing.start.x)} height={Math.abs(drawing.current.y - drawing.start.y)} fill={`${color}35`} stroke={color} strokeDasharray="6 4" />}
          </svg>
          <div className="canvas-empty-hint"><span>1440 × 900</span><small>Click a website element to add it to your sketch</small></div>
        </div>
        <div className="canvas-status"><span><span className="status-dot" /> {message}</span><span>Canvas 1440 × 900</span><span>{objects.length} objects</span></div>
      </section>
      <aside className="properties-panel">
        <div className="properties-tabs"><button className="active">Properties</button><button onClick={() => setShowAssistant(!showAssistant)}>AI assistant</button></div>
        {selectedObject ? <ObjectProperties object={selectedObject} color={color} setColor={setColor} update={(patch) => updateObject(selectedObject.id, patch)} onDelete={deleteSelected} onImage={(src) => updateObject(selectedObject.id, { text: src })} /> : <div className="no-selection"><div className="no-selection-icon"><MousePointer2 size={19} /></div><strong>Select an element</strong><p>Click anything on the canvas to inspect and edit its properties.</p></div>}
        {showAssistant && <div className="assistant-panel"><div className="assistant-heading"><div className="assistant-spark"><Sparkles size={14} /></div><div><strong>AI Design Assistant</strong><small>Local mode · no API key required</small></div><button onClick={() => setShowAssistant(false)}><X size={14} /></button></div><div className="assistant-prompt"><textarea value={assistant} onChange={e => setAssistant(e.target.value)} placeholder="Tell AI what you want to change..." /><button onClick={() => assistantAction(assistant || 'Make it more modern')}><WandSparkles size={14} /> Improve design</button></div><div className="prompt-chips">{['Make it more modern', 'Use dark mode', 'Improve spacing'].map(prompt => <button key={prompt} onClick={() => assistantAction(prompt)}>{prompt}</button>)}</div></div>}
        <ColorPalette color={color} setColor={setColor} selected={selectedObject} update={(fill) => selectedObject && updateObject(selectedObject.id, { fill })} />
      </aside>
    </div>
    {showSave && <Modal title="Save project" onClose={() => setShowSave(false)}><p className="modal-copy">Your sketch and generated structure will be saved in this browser.</p><label className="field-label">Project name<input value={projectName} onChange={e => setProjectName(e.target.value)} autoFocus /></label><div className="modal-actions"><button className="secondary-btn" onClick={() => setShowSave(false)}>Cancel</button><button className="primary-btn" onClick={save}><Save size={15} /> Save locally</button></div></Modal>}
  </main>;
}

function ToolButton({ def, active, onClick, wide }: { def: ToolDef; active: boolean; onClick: () => void; wide?: boolean }) {
  const Icon = def.icon;
  return <button className={`tool-button ${active ? 'active' : ''} ${wide ? 'wide' : ''}`} onClick={onClick} title={def.label}><Icon size={wide ? 15 : 17} /><span>{def.label}</span></button>;
}

function CanvasObject({ object, selected, onPointerDown, onResize }: { object: SketchObject; selected: boolean; onPointerDown: (event: ReactPointerEvent<SVGGElement>, object: SketchObject) => void; onResize: (event: ReactPointerEvent<SVGCircleElement>) => void }) {
  const { x, y, width, height, fill, stroke, strokeWidth, text = '', radius = 0 } = object;
  const common = { fill, stroke, strokeWidth, opacity: object.opacity ?? 1 };
  return <g className={`canvas-object ${selected ? 'selected' : ''}`} onPointerDown={e => onPointerDown(e, object)}>
    {object.type === 'circle' || object.type === 'icon' ? <ellipse cx={x + width / 2} cy={y + height / 2} rx={width / 2} ry={height / 2} {...common} /> : object.type === 'image' ? <><rect x={x} y={y} width={width} height={height} rx={radius || 8} fill="#e6ece9" stroke={stroke} strokeWidth={strokeWidth} /><path d={`M${x + 18},${y + height - 22} L${x + width * .35},${y + height * .52} L${x + width * .56},${y + height * .72} L${x + width * .76},${y + height * .35} L${x + width - 18},${y + height - 22}`} fill="none" stroke="#78918c" strokeWidth="3" /><circle cx={x + width * .73} cy={y + height * .28} r="10" fill="#f5d66b" /></> : <rect x={x} y={y} width={width} height={height} rx={object.type === 'rounded' || object.type === 'button' ? Math.max(radius, 9) : radius} {...common} />}
    {object.points && <path d={`M${object.points.map(p => `${p.x},${p.y}`).join(' L')}`} fill="none" stroke={stroke} strokeWidth={object.type === 'brush' ? 6 : 2} strokeLinecap="round" />}
    {object.type === 'line' && <line x1={x} y1={y} x2={x + width} y2={y + height} stroke={stroke} strokeWidth={strokeWidth || 2} />}
    <text x={x + width / 2} y={y + height / 2 + ((object.fontSize ?? 14) * .35)} textAnchor="middle" fontSize={object.fontSize ?? 14} fontFamily="DM Sans, sans-serif" fontWeight={object.type === 'hero' || object.type === 'button' ? 700 : 500} fill={object.type === 'button' ? '#fffdf9' : object.type === 'hero' ? '#222a35' : stroke === 'none' ? fill : '#222a35'} pointerEvents="none">{text.length > 27 ? `${text.slice(0, 25)}…` : text}</text>
    {selected && <><rect x={x - 5} y={y - 5} width={width + 10} height={height + 10} fill="none" stroke="#f16b5d" strokeWidth="1.5" strokeDasharray="5 4" pointerEvents="none" /><circle className="resize-handle" cx={x + width} cy={y + height} r="5" onPointerDown={onResize} /></>}
  </g>;
}

function ObjectProperties({ object, color, setColor, update, onDelete, onImage }: { object: SketchObject; color: string; setColor: (color: string) => void; update: (patch: Partial<SketchObject>) => void; onDelete: () => void; onImage: (src: string) => void }) {
  return <div className="object-properties"><div className="object-heading"><div className="object-type-icon"><Type size={15} /></div><div><strong>{object.type[0].toUpperCase() + object.type.slice(1)}</strong><small>ID / {object.id.slice(-6)}</small></div><button className="delete-btn" onClick={onDelete}><Trash2 size={15} /></button></div><label className="field-label">Content<input value={object.text ?? ''} onChange={e => update({ text: e.target.value })} /></label><div className="field-row"><label className="field-label">X<input type="number" value={Math.round(object.x)} onChange={e => update({ x: Number(e.target.value) })} /></label><label className="field-label">Y<input type="number" value={Math.round(object.y)} onChange={e => update({ y: Number(e.target.value) })} /></label></div><div className="field-row"><label className="field-label">Width<input type="number" value={Math.round(object.width)} onChange={e => update({ width: Math.max(20, Number(e.target.value)) })} /></label><label className="field-label">Height<input type="number" value={Math.round(object.height)} onChange={e => update({ height: Math.max(20, Number(e.target.value)) })} /></label></div>{object.type === 'image' && <label className="field-label">Image URL<input placeholder="https://..." onChange={e => onImage(e.target.value)} /></label>}<div className="property-divider" /><div className="property-heading">Appearance</div><div className="color-inline"><span>Fill</span><input type="color" value={object.fill.startsWith('#') && object.fill.length === 7 ? object.fill : color} onChange={e => { setColor(e.target.value); update({ fill: e.target.value }); }} /><code>{object.fill}</code></div><label className="field-label">Border radius<input type="range" min="0" max="32" value={object.radius ?? 0} onChange={e => update({ radius: Number(e.target.value) })} /></label><div className="align-row"><button onClick={() => update({ x: 500 - object.width / 2 })}><AlignCenter size={15} /> Center horizontally</button></div></div>;
}

function ColorPalette({ color, setColor, selected, update }: { color: string; setColor: (c: string) => void; selected: SketchObject | null; update: (c: string) => void }) {
  return <div className="palette-panel"><div className="property-heading"><Palette size={14} /> Color</div><div className="palette-swatches">{PALETTE.map(c => <button key={c} className={color === c ? 'selected' : ''} style={{ background: c }} onClick={() => { setColor(c); if (selected) update(c); }} aria-label={`Set color ${c}`} />)}<label className="custom-swatch"><input type="color" value={color} onChange={e => { setColor(e.target.value); if (selected) update(e.target.value); }} /><Plus size={14} /></label></div></div>;
}

function Preview({ site, objects, onBack, onEdit }: { site: SiteStructure; objects: SketchObject[]; onBack: () => void; onEdit: () => void }) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [codeTab, setCodeTab] = useState<'react' | 'html' | 'css' | 'js'>('react');
  const [style, setStyle] = useState('Modern');
  const [publish, setPublish] = useState(false);
  const [assistant, setAssistant] = useState('');
  const generated = useMemo(() => codeFor(site, codeTab), [site, codeTab]);
  const download = (kind: string, contents: string, ext: string) => { const blob = new Blob([contents], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `sketch2site-${kind}.${ext}`; a.click(); URL.revokeObjectURL(url); };
  const siteBlocks = site.blocks;
  return <main className="preview-shell"><header className="preview-topbar"><button className="top-brand" onClick={onBack}><span>✦</span> Sketch2Site</button><div className="preview-title"><span>Generated website</span><small>Local conversion · {site.blocks.length} elements</small></div><div className="preview-actions"><button className="top-text-btn" onClick={onBack}><ArrowLeft size={15} /> Back to canvas</button><button className="secondary-btn" onClick={onEdit}><Settings2 size={15} /> Edit website</button><button className="primary-btn" onClick={() => setPublish(true)}><Upload size={15} /> Publish</button></div></header><div className="preview-tabs"><button className={tab === 'preview' ? 'active' : ''} onClick={() => setTab('preview')}><Eye size={15} /> Live preview</button><button className={tab === 'code' ? 'active' : ''} onClick={() => setTab('code')}><Code2 size={15} /> Code</button><div className="preview-tab-spacer" /><span className="style-label">Style</span>{['Modern', 'Minimal', 'Dark', 'Colorful'].map(s => <button key={s} className={`style-pill ${style === s ? 'active' : ''}`} onClick={() => setStyle(s)}>{s}</button>)}</div>{tab === 'preview' ? <div className="preview-workspace"><section className="original-sketch"><div className="preview-pane-heading"><div><span className="section-kicker">Source</span><h3>Original sketch</h3></div><span className="source-chip"><Scissors size={12} /> Editable</span></div><div className="source-canvas"><svg viewBox="0 0 1000 700">{objects.map(o => <CanvasObject key={o.id} object={o} selected={false} onPointerDown={() => undefined} onResize={() => undefined} />)}</svg></div><div className="source-footer"><span><Check size={13} /> Sketch preserved</span><button onClick={onEdit}>Continue editing <ArrowRight size={13} /></button></div></section><section className="generated-preview"><div className="preview-pane-heading"><div><span className="section-kicker">Output</span><h3>Generated website</h3></div><div className="device-switcher">{(['desktop', 'tablet', 'mobile'] as const).map(d => <button key={d} className={device === d ? 'active' : ''} onClick={() => setDevice(d)}>{d === 'desktop' ? 'Desktop' : d === 'tablet' ? 'Tablet' : 'Mobile'}</button>)}</div></div><div className={`site-preview-frame ${device} preset-${style.toLowerCase()}`}><div className="generated-site"><nav><b>studio<span>.</span></b><div className="generated-nav-links">work &nbsp;&nbsp; about &nbsp;&nbsp; contact</div><Menu size={16} className="mobile-menu" /></nav>{siteBlocks.map(block => <GeneratedBlock key={block.id} block={block} />)}<footer><span>© 2026 studio</span><span>Made with intention.</span></footer></div></div><div className="preview-footer"><button onClick={() => setAssistant('Make it more modern')}><Sparkles size={14} /> Improve with AI</button><button onClick={() => download('website', codeFor(site, 'html'), 'html')}><Download size={14} /> Download</button><button onClick={() => setTab('code')}><Code2 size={14} /> View code</button></div></section></div> : <div className="code-workspace"><div className="code-heading"><div><span className="section-kicker">Generated output</span><h2>Clean, readable code</h2><p>This code maps directly to the structure generated from your sketch.</p></div><button className="primary-btn" onClick={() => download(codeTab, generated, codeTab === 'react' ? 'tsx' : codeTab === 'js' ? 'js' : codeTab)}><Download size={15} /> Download {codeTab.toUpperCase()}</button></div><div className="code-card"><div className="code-tabs">{(['react', 'html', 'css', 'js'] as const).map(t => <button className={codeTab === t ? 'active' : ''} key={t} onClick={() => setCodeTab(t)}>{t === 'react' ? 'React' : t.toUpperCase()}</button>)}<button className="copy-code" onClick={() => navigator.clipboard?.writeText(generated)}><Copy size={14} /> Copy code</button></div><pre><code>{generated}</code></pre></div></div>}{publish && <Modal title="Your website is ready" onClose={() => setPublish(false)}><div className="publish-state"><div className="publish-icon"><Check size={22} /></div><p>Your generated website is available as a local preview. Configure deployment to publish it to a public URL.</p><div className="local-url"><span className="live-dot" /> localhost · preview only</div></div><div className="modal-actions"><button className="secondary-btn" onClick={() => setPublish(false)}>Close</button><button className="primary-btn" onClick={() => download('react-project', codeFor(site, 'react'), 'tsx')}><Download size={15} /> Export project</button></div></Modal>}{assistant && <div className="toast-message"><Sparkles size={15} /> Local assistant ready — select “Edit website” to refine your sketch.</div>}</main>;
}

function GeneratedBlock({ block }: { block: SiteStructure['blocks'][number] }) {
  if (block.type === 'nav') return null;
  if (block.type === 'section') return <section className="generated-hero"><small>HELLO, I'M GLAD YOU'RE HERE</small><h1>{block.text || 'Make the idea visible.'}</h1><button>Explore the idea <ArrowUpRight size={13} /></button></section>;
  if (block.type === 'article') return <article className="generated-card"><div className="card-art"><span>{block.label.slice(0, 1)}</span></div><h3>{block.text || 'A thoughtful starting point'}</h3><p>Designed from your original sketch, ready to make your own.</p><a href="#preview">Read more <ArrowRight size={12} /></a></article>;
  if (block.type === 'button') return <button className="generated-standalone-btn">{block.text || 'Get started'}</button>;
  if (block.type === 'img') return <div className="generated-image"><ImageIcon size={20} /><span>{block.text || 'Image'}</span></div>;
  if (block.type === 'input') return <input placeholder={block.text || 'Your email address'} />;
  if (block.type === 'form') return <div className="generated-form"><h3>{block.text || 'Get in touch'}</h3><input placeholder="Your email" /><button>Send message</button></div>;
  return <div className={`generated-generic ${block.type}`}>{block.text || block.label}</div>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal-card" onMouseDown={e => e.stopPropagation()}><div className="modal-heading"><h3>{title}</h3><button onClick={onClose}><X size={17} /></button></div>{children}</div></div>;
}

function FolderOpenIcon() { return <FileText size={15} />; }
function MagnetIcon() { return <span className="magnet-icon">⌁</span>; }

function AppRouter() {
  const [, navigate] = useLocation();
  const [objects, setObjects] = useState<SketchObject[]>(() => loadProject()?.objects ?? starterSketch());
  const [site, setSite] = useState<SiteStructure | null>(() => { try { const raw = localStorage.getItem('sketch2site-site'); return raw ? JSON.parse(raw) : null; } catch { return null; } });
  const goEditor = () => navigate('/editor');
  const goPreview = (next: SiteStructure) => { setSite(next); localStorage.setItem('sketch2site-site', JSON.stringify(next)); navigate('/preview'); };
  return <Switch><Route path="/editor"><Editor onPreview={goPreview} /></Route><Route path="/preview">{site ? <Preview site={site} objects={objects} onBack={goEditor} onEdit={goEditor} /> : <Home onCreate={goEditor} />}</Route><Route path="/"><Home onCreate={goEditor} /></Route><Route><Home onCreate={goEditor} /></Route></Switch>;
}

export default function App() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><AppRouter /></WouterRouter>;
}