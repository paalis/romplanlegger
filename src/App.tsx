import { useState, useRef, useCallback, useEffect } from 'react';

const SCALE = 32;

const FLOORS = [
  {
    id: 1, name: '1. etasje', width: 9, height: 18,
    rooms: [
      { id: 'terrasse_top', name: 'Terrasse 25m²', x: 1.5, y: 0.2, w: 5, h: 5, color: '#e8e0d0', dashed: true },
      { id: 'stue1', name: 'Stue 35m²', x: 1.5, y: 5.2, w: 5, h: 7, color: '#f0ede8' },
      { id: 'trapp1', name: 'Trapp', x: 6.5, y: 5.2, w: 1.5, h: 4.3, color: '#e4e0da' },
      { id: 'tekrom', name: 'Tek.rom 2m²', x: 6.5, y: 9.5, w: 1.5, h: 1.5, color: '#e0dbd2' },
      { id: 'kjokken', name: 'Kjøkken 8m²', x: 1.5, y: 12.2, w: 3, h: 2.8, color: '#e8f0ed' },
      { id: 'entre', name: 'Entré 4,5m²', x: 4.5, y: 12.2, w: 2.5, h: 2.8, color: '#ede8f0' },
      { id: 'terrasse_bak', name: 'Terrasse 4m²', x: 3, y: 15, w: 3, h: 1.5, color: '#e8e0d0', dashed: true },
      { id: 'bod1', name: 'Bod 5m²', x: 2.5, y: 16.5, w: 3.5, h: 1.8, color: '#e0dbd2' },
    ],
  },
  {
    id: 2, name: '2. etasje', width: 9, height: 16,
    rooms: [
      { id: 'sov1', name: 'Soverom 13m²', x: 0.5, y: 0.5, w: 4.5, h: 4.5, color: '#e8edf0' },
      { id: 'sov2', name: 'Soverom 7m²', x: 5, y: 0.5, w: 3, h: 4.5, color: '#e8edf0' },
      { id: 'bad', name: 'Bad 7,5m²', x: 0.5, y: 5, w: 4, h: 3.5, color: '#d6eaf8' },
      { id: 'gang', name: 'Gang/trapp 8,5m²', x: 4.5, y: 5, w: 3.5, h: 3.5, color: '#f0ede8' },
      { id: 'sov3', name: 'Soverom 12m²', x: 0.5, y: 8.5, w: 7.5, h: 4, color: '#e8edf0' },
      { id: 'altan', name: 'Altan 4m²', x: 5.5, y: 12.5, w: 2.5, h: 2, color: '#e8e0d0', dashed: true },
    ],
  },
  {
    id: 3, name: '3. etasje', width: 9, height: 14,
    rooms: [
      { id: 'takter', name: 'Takterrasse 17m²', x: 0.5, y: 0.2, w: 7.5, h: 3.5, color: '#e8e0d0', dashed: true },
      { id: 'bod3', name: 'Bod 1m²', x: 6.5, y: 3.7, w: 1.5, h: 1.5, color: '#e0dbd2' },
      { id: 'stue3', name: 'Stue 15,5m²', x: 0.5, y: 3.7, w: 6, h: 4.5, color: '#f0ede8' },
      { id: 'trapp3', name: 'Trapp', x: 6.5, y: 5.2, w: 1.5, h: 3, color: '#e4e0da' },
      { id: 'sov4', name: 'Soverom 8m²', x: 0.5, y: 8.2, w: 3.5, h: 3, color: '#e8edf0' },
      { id: 'vask', name: 'Vaskerom 4,5m²', x: 4, y: 8.2, w: 2.5, h: 3, color: '#d6eaf8' },
    ],
  },
];

const PRESETS = [
  { name: 'Sofa (3-seter)', w: 2.2, h: 0.9, color: '#8B7355' },
  { name: 'Sofa m/sjeselong (H)', w: 2.6, h: 1.5, color: '#8B7355', shape: 'l-shape', legW: 1.3, legH: 0.9, legCorner: 'bl' },
  { name: 'Sofa m/sjeselong (V)', w: 2.6, h: 1.5, color: '#8B7355', shape: 'l-shape', legW: 1.3, legH: 0.9, legCorner: 'br' },
  { name: 'Sofa (2-seter)', w: 1.6, h: 0.85, color: '#9B8060' },
  { name: 'Sofabord', w: 1.2, h: 0.6, color: '#A0845C' },
  { name: 'Spisebord', w: 1.6, h: 0.9, color: '#7A6548' },
  { name: 'Dobbeltseng', w: 1.8, h: 2.0, color: '#6B8CAE' },
  { name: 'Enkeltseng', w: 0.9, h: 2.0, color: '#7FA8C9' },
  { name: 'Kleskap', w: 1.2, h: 0.6, color: '#9E7B5A' },
  { name: 'Skrivebord', w: 1.4, h: 0.7, color: '#7B9E7A' },
  { name: 'TV-benk', w: 1.8, h: 0.45, color: '#5A7A9E' },
  { name: 'Vaskemaskin', w: 0.6, h: 0.6, color: '#8A9EB0' },
  { name: 'Tørketrommel', w: 0.6, h: 0.6, color: '#9AAEBB' },
  { name: 'Kjøleskap', w: 0.7, h: 0.7, color: '#8A9E88' },
];

const ALT_CATEGORIES = [
  'Sofa', 'Stol', 'Bord', 'Seng', 'Skap', 'Hylle',
  'Belysning', 'Kjøkken', 'Bad', 'TV-møbel', 'Utemøbel', 'Annet',
];

const STATUS_OPTIONS = [
  { value: 'vurderer', label: 'Vurderer', color: '#c8a96e', bg: '#c8a96e22' },
  { value: 'favoritt', label: 'Favoritt', color: '#6ec88a', bg: '#6ec88a22' },
  { value: 'valgt',    label: 'Valgt',    color: '#6eaac8', bg: '#6eaac822' },
  { value: 'avvist',   label: 'Avvist',   color: '#6a5a50', bg: '#6a5a5022' },
];

const emptyAltForm = {
  category: 'Sofa', name: '', brand: '', width: '', height: '', depth: '',
  color: '#8B7355', colorName: '', price: '', url: '', material: '', notes: '', imageUrl: '', status: 'vurderer',
};
const emptyForm = { name: '', width: '', height: '', url: '', price: '', color: '#8B7355', shape: 'rect', legW: '', legH: '', legCorner: 'bl' };

/* ── shared style helpers ── */
const inp = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  width: '100%', padding: '8px 10px', background: '#2a2620',
  border: '1px solid #3a342a', color: '#e8e0d0', fontSize: 13,
  fontFamily: 'Georgia, serif', borderRadius: 3, boxSizing: 'border-box', ...extra,
});
const lbl: React.CSSProperties = {
  fontSize: 10, color: '#9a8a70', letterSpacing: 1.5, marginBottom: 4,
  textTransform: 'uppercase', display: 'block',
};
const sectionTitle: React.CSSProperties = {
  fontSize: 10, letterSpacing: 3, color: '#7a6a50', textTransform: 'uppercase', marginBottom: 10,
};

export default function App() {
  const [view, setView] = useState<'plan' | 'alternativer'>('plan');
  const [activeFloor, setActiveFloor] = useState(1);
  const [furniture, setFurniture] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [showAltForm, setShowAltForm] = useState(false);
  const [altForm, setAltForm] = useState(emptyAltForm);
  const [editingAltId, setEditingAltId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState('Alle');
  const [filterStatus, setFilterStatus] = useState('alle');
  const [expandedAlt, setExpandedAlt] = useState<number | null>(null);
  const [scraping, setScraping] = useState(false);
  const [altScraping, setAltScraping] = useState(false);

  /* ── responsive ── */
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  // close drawers when switching view on mobile
  useEffect(() => { setLeftOpen(false); setRightOpen(false); }, [view]);

  const floor = FLOORS.find((f) => f.id === activeFloor)!;
  const selItem = furniture.find((f) => f.id === selected);

  const getSvgXY = (e: React.MouseEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left - 40, y: e.clientY - r.top - 40 };
  };

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const p = getSvgXY(e);
    setFurniture((prev) =>
      prev.map((f) =>
        f.id === dragging
          ? { ...f, x: Math.max(0, (p.x - dragOffset.x) / SCALE), y: Math.max(0, (p.y - dragOffset.y) / SCALE) }
          : f
      )
    );
  }, [dragging, dragOffset]);

  const onMouseUp = useCallback(() => setDragging(null), []);

  const startDrag = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    const p = getSvgXY(e);
    setDragging(item.id);
    setDragOffset({ x: p.x - item.x * SCALE, y: p.y - item.y * SCALE });
    setSelected(item.id);
  };

  const addItem = (preset: any = null) => {
    const base = preset
      ? { name: preset.name, width: preset.w, height: preset.h, color: preset.color, shape: preset.shape || 'rect', legW: preset.legW || 0, legH: preset.legH || 0, legCorner: preset.legCorner || 'bl' }
      : { name: form.name, width: parseFloat(form.width), height: parseFloat(form.height), color: form.color, shape: form.shape, legW: parseFloat(form.legW) || 0, legH: parseFloat(form.legH) || 0, legCorner: form.legCorner };
    if (!base.name || !base.width || !base.height) return;
    setFurniture((prev) => [
      ...prev,
      { id: Date.now(), ...base, url: form.url, price: form.price, x: 2, y: 2, floorId: activeFloor, rotation: 0 },
    ]);
    if (!preset) { setForm(emptyForm); setShowForm(false); }
    if (isMobile) setLeftOpen(false);
  };

  const addFromAlternative = (alt: any) => {
    const w = parseFloat(alt.width) || 1;
    const h = parseFloat(alt.depth || alt.height) || 1;
    setFurniture((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: alt.brand ? `${alt.brand} ${alt.name}` : alt.name,
        width: w, height: h, color: alt.color,
        url: alt.url, price: alt.price,
        x: 2, y: 2, floorId: activeFloor, rotation: 0,
      },
    ]);
    setView('plan');
  };

  const rotate = (id: number) =>
    setFurniture((prev) => prev.map((f) => f.id === id ? { ...f, rotation: ((f.rotation || 0) + 90) % 360 } : f));
  const remove = (id: number) => { setFurniture((prev) => prev.filter((f) => f.id !== id)); setSelected(null); };

  const floorItems = furniture.filter((f) => f.floorId === activeFloor);

  const saveAlternative = () => {
    if (!altForm.name) return;
    if (editingAltId !== null) {
      setAlternatives((prev) => prev.map((a) => a.id === editingAltId ? { ...a, ...altForm } : a));
      setEditingAltId(null);
    } else {
      setAlternatives((prev) => [...prev, { id: Date.now(), ...altForm }]);
    }
    setAltForm(emptyAltForm);
    setShowAltForm(false);
    if (isMobile) setLeftOpen(false);
  };

  const editAlternative = (alt: any) => {
    setAltForm({ ...emptyAltForm, ...alt });
    setEditingAltId(alt.id);
    setShowAltForm(true);
    setExpandedAlt(null);
    if (isMobile) setLeftOpen(true);
  };

  const deleteAlternative = (id: number) => {
    setAlternatives((prev) => prev.filter((a) => a.id !== id));
    if (expandedAlt === id) setExpandedAlt(null);
  };

  const setAltStatus = (id: number, status: string) =>
    setAlternatives((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));

  const filteredAlts = alternatives.filter((a) => {
    const catOk = filterCategory === 'Alle' || a.category === filterCategory;
    const statusOk = filterStatus === 'alle' || a.status === filterStatus;
    return catOk && statusOk;
  });

  const totalValgt = alternatives.filter((a) => a.status === 'valgt').length;
  const totalPris = alternatives
    .filter((a) => a.status === 'valgt' && a.price)
    .reduce((s, a) => s + (parseFloat(a.price) || 0), 0);

  const fetchFurnitureInfo = async (url: string, target: 'plan' | 'alt') => {
    if (!url) return;
    if (target === 'plan') setScraping(true); else setAltScraping(true);
    try {
      const res = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.error) { alert('Klarte ikke hente info:\n' + data.error); return; }
      if (target === 'plan') {
        setForm((prev) => ({
          ...prev,
          name: data.name || prev.name,
          width: data.width != null ? String(data.width) : prev.width,
          height: data.depth != null ? String(data.depth) : prev.height,
          price: data.price != null ? String(data.price) : prev.price,
          ...(data.shape === 'l-shape' && {
            shape: 'l-shape',
            legW: data.legW != null ? String(data.legW) : prev.legW,
            legH: data.legH != null ? String(data.legH) : prev.legH,
          }),
        } as any));
      } else {
        setAltForm((prev) => ({
          ...prev,
          name: data.name || prev.name,
          brand: data.brand || prev.brand,
          width: data.width != null ? String(data.width) : prev.width,
          depth: data.depth != null ? String(data.depth) : prev.depth,
          height: data.height != null ? String(data.height) : prev.height,
          price: data.price != null ? String(data.price) : prev.price,
          imageUrl: data.imageUrl || prev.imageUrl,
          colorName: data.colorName || prev.colorName,
        }));
      }
    } catch {
      alert('Nettverksfeil – er serveren startet? (npm run dev)');
    } finally {
      if (target === 'plan') setScraping(false); else setAltScraping(false);
    }
  };

  /* ── sub-components ── */

  const DrawerToggleBtn = ({ side, label, count }: { side: 'left' | 'right', label: string, count?: number }) => {
    const isOpen = side === 'left' ? leftOpen : rightOpen;
    const toggle = () => {
      if (side === 'left') { setLeftOpen((v) => !v); setRightOpen(false); }
      else { setRightOpen((v) => !v); setLeftOpen(false); }
    };
    return (
      <button onClick={toggle}
        style={{
          padding: '10px 14px', border: '1px solid', fontFamily: 'Georgia, serif', fontSize: 13, cursor: 'pointer',
          borderRadius: 3, borderColor: isOpen ? '#c8a96e' : '#3a342a',
          background: isOpen ? '#c8a96e22' : 'transparent',
          color: isOpen ? '#c8a96e' : '#9a8a70',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
        {side === 'left' ? '☰' : '≡'} {label}
        {count !== undefined && count > 0 && (
          <span style={{ background: '#c8a96e', color: '#1a1812', borderRadius: 10, fontSize: 10, padding: '1px 6px', fontFamily: 'sans-serif' }}>
            {count}
          </span>
        )}
      </button>
    );
  };

  const Backdrop = ({ onClose }: { onClose: () => void }) => (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: '#00000066', zIndex: 10, touchAction: 'none' }} />
  );

  /* ── LEFT PANEL: add furniture / filters ── */
  const LeftPanelContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {view === 'plan' ? (
        <>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #2e2a22' }}>
            {isMobile && (
              <div style={{ ...sectionTitle, marginBottom: 14 }}>Legg til møbel</div>
            )}
            <button
              onClick={() => setShowForm((v) => !v)}
              style={{ width: '100%', padding: '10px 14px', background: showForm ? '#2a2620' : '#c8a96e', color: showForm ? '#c8a96e' : '#1a1812', border: '1px solid #c8a96e', cursor: 'pointer', fontSize: 13, fontFamily: 'Georgia, serif', borderRadius: 3 }}>
              {showForm ? '↑ Lukk skjema' : '+ Egendefinert møbel'}
            </button>
          </div>

          {showForm && (
            <div style={{ padding: 16, borderBottom: '1px solid #2e2a22', background: '#1e1b14', overflowY: 'auto' }}>
              <div style={{ marginBottom: 14, padding: '10px 12px', background: '#1a1812', borderRadius: 4, border: '1px solid #3a342a' }}>
                <label style={lbl}>Hent info fra lenke</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input type="url" value={form.url} placeholder="Lim inn lenke til møbelet…"
                    onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                    style={inp({ flex: 1, minWidth: 0 })} />
                  <button onClick={() => fetchFurnitureInfo(form.url, 'plan')}
                    disabled={scraping || !form.url}
                    style={{ padding: '8px 10px', background: scraping ? '#2a2620' : '#3d6b50', color: scraping ? '#7a6a50' : '#c8e8d8', border: 'none', borderRadius: 3, cursor: scraping || !form.url ? 'default' : 'pointer', fontSize: 11, whiteSpace: 'nowrap' as const, opacity: !form.url ? 0.5 : 1, fontFamily: 'Georgia, serif', flexShrink: 0 }}>
                    {scraping ? '…henter' : 'Hent info'}
                  </button>
                </div>
              </div>
              {[
                { l: 'Navn', k: 'name', p: 'f.eks. Sofa' },
                { l: 'Bredde (m)', k: 'width', p: '2.2', t: 'number' },
                { l: 'Dybde (m)', k: 'height', p: '0.9', t: 'number' },
                { l: 'Pris (kr)', k: 'price', p: '4990' },
              ].map(({ l, k, p, t = 'text' }) => (
                <div key={k} style={{ marginBottom: 10 }}>
                  <label style={lbl}>{l}</label>
                  <input type={t} value={(form as any)[k]} placeholder={p}
                    onChange={(e) => setForm((prev) => ({ ...prev, [k]: e.target.value }))}
                    style={inp()} />
                </div>
              ))}
              <div style={{ marginBottom: 10 }}>
                <label style={lbl}>Form</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[{ v: 'rect', l: 'Rektangel' }, { v: 'l-shape', l: 'L-form (sjeselong)' }].map(({ v, l }) => (
                    <button key={v} onClick={() => setForm((p) => ({ ...p, shape: v }))}
                      style={{ flex: 1, padding: '7px 4px', fontSize: 11, fontFamily: 'Georgia, serif', borderRadius: 3, cursor: 'pointer', border: `1px solid ${(form as any).shape === v ? '#c8a96e' : '#3a342a'}`, background: (form as any).shape === v ? '#c8a96e22' : 'transparent', color: (form as any).shape === v ? '#c8a96e' : '#9a8a70' }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              {(form as any).shape === 'l-shape' && (
                <>
                  <div style={{ marginBottom: 10 }}>
                    <label style={lbl}>Sjeselong-bredde (m)</label>
                    <input type="number" value={(form as any).legW} placeholder="f.eks. 1.3"
                      onChange={(e) => setForm((p) => ({ ...p, legW: e.target.value } as any))} style={inp()} />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={lbl}>Sofadybde uten sjeselong (m)</label>
                    <input type="number" value={(form as any).legH} placeholder="f.eks. 0.9"
                      onChange={(e) => setForm((p) => ({ ...p, legH: e.target.value } as any))} style={inp()} />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={lbl}>Sjeselong-side</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[{ v: 'bl', l: 'Høyre' }, { v: 'br', l: 'Venstre' }].map(({ v, l }) => (
                        <button key={v} onClick={() => setForm((p) => ({ ...p, legCorner: v } as any))}
                          style={{ flex: 1, padding: '7px', fontSize: 11, fontFamily: 'Georgia, serif', borderRadius: 3, cursor: 'pointer', border: `1px solid ${(form as any).legCorner === v ? '#c8a96e' : '#3a342a'}`, background: (form as any).legCorner === v ? '#c8a96e22' : 'transparent', color: (form as any).legCorner === v ? '#c8a96e' : '#9a8a70' }}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Farge</label>
                <input type="color" value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                  style={{ width: '100%', height: 36, border: '1px solid #3a342a', borderRadius: 3, cursor: 'pointer' }} />
              </div>
              <button onClick={() => addItem()}
                style={{ width: '100%', padding: 10, background: '#c8a96e', color: '#1a1812', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'Georgia, serif', borderRadius: 3 }}>
                Plasser på tegning →
              </button>
            </div>
          )}

          <div style={{ padding: '14px 18px 8px' }}>
            <div style={sectionTitle}>Hurtigvalg</div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, padding: '0 14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {PRESETS.map((p, i) => (
              <button key={i} onClick={() => addItem(p)}
                style={{ padding: '9px 12px', background: '#2a2620', border: '1px solid #3a342a', color: '#d8cbb8', cursor: 'pointer', fontSize: 13, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontWeight: 400, textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 3, letterSpacing: 0.1 }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#c8a96e')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#3a342a')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ width: 10, height: 10, background: p.color, borderRadius: 2, flexShrink: 0 }} />
                  {p.name}
                </span>
                <span style={{ color: '#8a7a60', fontSize: 11, fontVariantNumeric: 'tabular-nums', marginLeft: 8 }}>{p.w}×{p.h}m</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        /* Alternativer: left = form + filters */
        <>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #2e2a22' }}>
            <button
              onClick={() => { setShowAltForm((v) => !v); if (showAltForm) { setEditingAltId(null); setAltForm(emptyAltForm); } }}
              style={{ width: '100%', padding: '10px 14px', background: showAltForm ? '#2a2620' : '#c8a96e', color: showAltForm ? '#c8a96e' : '#1a1812', border: '1px solid #c8a96e', cursor: 'pointer', fontSize: 13, fontFamily: 'Georgia, serif', borderRadius: 3 }}>
              {showAltForm ? '↑ Lukk skjema' : '+ Nytt møbelalternativ'}
            </button>
          </div>

          {showAltForm && (
            <div style={{ padding: 16, borderBottom: '1px solid #2e2a22', background: '#1e1b14', overflowY: 'auto', flex: 1 }}>
              <div style={{ fontSize: 12, color: '#c8a96e', marginBottom: 14 }}>
                {editingAltId !== null ? 'Rediger alternativ' : 'Legg til alternativ'}
              </div>
              <div style={{ marginBottom: 14, padding: '10px 12px', background: '#1a1812', borderRadius: 4, border: '1px solid #3a342a' }}>
                <label style={lbl}>Hent info fra lenke</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input type="url" value={altForm.url} placeholder="Lim inn lenke til møbelet…"
                    onChange={(e) => setAltForm((p) => ({ ...p, url: e.target.value }))}
                    style={inp({ flex: 1, minWidth: 0 })} />
                  <button onClick={() => fetchFurnitureInfo(altForm.url, 'alt')}
                    disabled={altScraping || !altForm.url}
                    style={{ padding: '8px 10px', background: altScraping ? '#2a2620' : '#3d6b50', color: altScraping ? '#7a6a50' : '#c8e8d8', border: 'none', borderRadius: 3, cursor: altScraping || !altForm.url ? 'default' : 'pointer', fontSize: 11, whiteSpace: 'nowrap' as const, opacity: !altForm.url ? 0.5 : 1, fontFamily: 'Georgia, serif', flexShrink: 0 }}>
                    {altScraping ? '…henter' : 'Hent info'}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={lbl}>Kategori</label>
                <select value={altForm.category} onChange={(e) => setAltForm((p) => ({ ...p, category: e.target.value }))}
                  style={inp({ appearance: 'none' as any })}>
                  {ALT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={lbl}>Navn *</label>
                  <input type="text" value={altForm.name} placeholder="f.eks. Ektorp" onChange={(e) => setAltForm((p) => ({ ...p, name: e.target.value }))} style={inp()} />
                </div>
                <div>
                  <label style={lbl}>Merke</label>
                  <input type="text" value={altForm.brand} placeholder="f.eks. IKEA" onChange={(e) => setAltForm((p) => ({ ...p, brand: e.target.value }))} style={inp()} />
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={lbl}>Mål (meter) — bredde · dybde · høyde</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                  {[{ k: 'width', p: 'Bredde' }, { k: 'depth', p: 'Dybde' }, { k: 'height', p: 'Høyde' }].map(({ k, p }) => (
                    <input key={k} type="number" value={(altForm as any)[k]} placeholder={p}
                      onChange={(e) => setAltForm((prev) => ({ ...prev, [k]: e.target.value }))}
                      style={inp({ padding: '8px 6px', textAlign: 'center' as any })} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={lbl}>Farge</label>
                  <input type="color" value={altForm.color} onChange={(e) => setAltForm((p) => ({ ...p, color: e.target.value }))}
                    style={{ width: '100%', height: 36, border: '1px solid #3a342a', borderRadius: 3, cursor: 'pointer' }} />
                </div>
                <div>
                  <label style={lbl}>Fargenavn</label>
                  <input type="text" value={altForm.colorName} placeholder="f.eks. Beige" onChange={(e) => setAltForm((p) => ({ ...p, colorName: e.target.value }))} style={inp()} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={lbl}>Pris (kr)</label>
                  <input type="number" value={altForm.price} placeholder="4990" onChange={(e) => setAltForm((p) => ({ ...p, price: e.target.value }))} style={inp()} />
                </div>
                <div>
                  <label style={lbl}>Materiale</label>
                  <input type="text" value={altForm.material} placeholder="Tre, stoff…" onChange={(e) => setAltForm((p) => ({ ...p, material: e.target.value }))} style={inp()} />
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={lbl}>Bilde-URL (valgfritt)</label>
                <input type="url" value={altForm.imageUrl} placeholder="https://…" onChange={(e) => setAltForm((p) => ({ ...p, imageUrl: e.target.value }))} style={inp()} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Notater</label>
                <textarea value={altForm.notes} placeholder="Kommentarer…" onChange={(e) => setAltForm((p) => ({ ...p, notes: e.target.value }))}
                  style={{ ...inp(), height: 64, resize: 'vertical' as any }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Status</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as any }}>
                  {STATUS_OPTIONS.map((s) => (
                    <button key={s.value} onClick={() => setAltForm((p) => ({ ...p, status: s.value }))}
                      style={{ padding: '5px 11px', fontSize: 11, fontFamily: 'Georgia, serif', borderRadius: 3, cursor: 'pointer', border: `1px solid ${s.color}`, background: altForm.status === s.value ? s.bg : 'transparent', color: s.color }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={saveAlternative}
                style={{ width: '100%', padding: 10, background: '#c8a96e', color: '#1a1812', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'Georgia, serif', borderRadius: 3 }}>
                {editingAltId !== null ? 'Oppdater' : 'Lagre alternativ'}
              </button>
              {editingAltId !== null && (
                <button onClick={() => { setEditingAltId(null); setAltForm(emptyAltForm); setShowAltForm(false); if (isMobile) setLeftOpen(false); }}
                  style={{ width: '100%', marginTop: 8, padding: 8, background: 'transparent', color: '#7a6a50', border: '1px solid #3a342a', cursor: 'pointer', fontSize: 12, fontFamily: 'Georgia, serif', borderRadius: 3 }}>
                  Avbryt
                </button>
              )}
            </div>
          )}

          {!showAltForm && (
            <div style={{ padding: 18, overflowY: 'auto', flex: 1 }}>
              <div style={sectionTitle}>Filtrer</div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Kategori</label>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                  style={inp({ appearance: 'none' as any })}>
                  <option value="Alle">Alle kategorier</option>
                  {ALT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={lbl}>Status</label>
                <div style={{ display: 'flex', flexWrap: 'wrap' as any, gap: 6 }}>
                  <button onClick={() => setFilterStatus('alle')}
                    style={{ padding: '5px 10px', fontSize: 11, fontFamily: 'Georgia, serif', borderRadius: 3, cursor: 'pointer', border: '1px solid #5a4a30', background: filterStatus === 'alle' ? '#5a4a3033' : 'transparent', color: '#9a8a70' }}>
                    Alle
                  </button>
                  {STATUS_OPTIONS.map((s) => (
                    <button key={s.value} onClick={() => setFilterStatus(s.value)}
                      style={{ padding: '5px 10px', fontSize: 11, fontFamily: 'Georgia, serif', borderRadius: 3, cursor: 'pointer', border: `1px solid ${s.color}`, background: filterStatus === s.value ? s.bg : 'transparent', color: s.color }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              {alternatives.length > 0 && (
                <>
                  <div style={sectionTitle}>Oversikt</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {STATUS_OPTIONS.map((s) => {
                      const count = alternatives.filter((a) => a.status === s.value).length;
                      return (
                        <div key={s.value} style={{ background: '#1e1b14', border: `1px solid ${s.color}33`, borderRadius: 3, padding: '8px 10px' }}>
                          <div style={{ fontSize: 20, color: s.color, lineHeight: 1 }}>{count}</div>
                          <div style={{ fontSize: 11, color: '#7a6a50', marginTop: 3 }}>{s.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  /* ── RIGHT PANEL: selected item / furniture list ── */
  const RightPanelContent = () => (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%' }}>
      {selItem ? (
        <>
          <div style={sectionTitle}>Valgt møbel</div>
          <div style={{ width: 40, height: 40, background: selItem.color, borderRadius: 4, marginBottom: 14 }} />
          <div style={{ fontSize: 17, color: '#e8dcc8', marginBottom: 5 }}>{selItem.name}</div>
          <div style={{ fontSize: 13, color: '#8a7a60', marginBottom: 16 }}>{selItem.width} × {selItem.height} m</div>
          {selItem.price && (
            <div style={{ marginBottom: 16 }}>
              <div style={lbl}>Pris</div>
              <div style={{ fontSize: 20, color: '#c8a96e' }}>{parseFloat(selItem.price).toLocaleString('nb-NO')} kr</div>
            </div>
          )}
          {selItem.url && (
            <div style={{ marginBottom: 16 }}>
              <div style={lbl}>Butikk</div>
              <a href={selItem.url} target="_blank" rel="noreferrer"
                style={{ fontSize: 12, color: '#c8a96e', textDecoration: 'none', display: 'block', padding: '9px 12px', border: '1px solid #c8a96e', borderRadius: 3 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#c8a96e18')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                Åpne i nettbutikk →
              </a>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: '↻  Roter 90°', action: () => rotate(selItem.id), borderColor: '#3a342a', color: '#c8b898' },
              { label: '×  Slett møbel', action: () => remove(selItem.id), borderColor: '#7a3a2a', color: '#c87060' },
            ].map(({ label, action, borderColor, color }) => (
              <button key={label} onClick={action}
                style={{ padding: '10px 13px', background: 'transparent', border: `1px solid ${borderColor}`, color, cursor: 'pointer', fontSize: 12, fontFamily: 'Georgia, serif', borderRadius: 3 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = borderColor + '33')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                {label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={sectionTitle}>Møbelliste</div>
          {FLOORS.map((f) => {
            const items = furniture.filter((i) => i.floorId === f.id);
            if (!items.length) return null;
            return (
              <div key={f.id} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: '#9a8a70', marginBottom: 8, paddingBottom: 5, borderBottom: '1px solid #2e2a22', letterSpacing: 1 }}>
                  {f.name}
                </div>
                {items.map((item) => (
                  <div key={item.id}
                    onClick={() => { setActiveFloor(item.floorId); setSelected(item.id); if (isMobile) setRightOpen(false); }}
                    style={{ padding: '8px 10px', marginBottom: 4, background: '#1e1b14', border: '1px solid #2e2a22', borderRadius: 3, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9 }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#c8a96e')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2e2a22')}>
                    <span style={{ width: 10, height: 10, background: item.color, borderRadius: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, color: '#c8b898' }}>{item.name}</div>
                      {item.price && <div style={{ fontSize: 10, color: '#7a6a50', marginTop: 2 }}>{parseFloat(item.price).toLocaleString('nb-NO')} kr</div>}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          {!furniture.length && (
            <div style={{ color: '#4a3a28', fontSize: 12, lineHeight: 1.9 }}>
              Velg et møbel fra hurtigvalg eller legg til egendefinert, og dra det til ønsket plass.
            </div>
          )}
        </>
      )}
    </div>
  );

  const PANEL_W = isMobile ? Math.min(window.innerWidth * 0.82, 320) : 260;

  return (
    <div style={{ minHeight: '100vh', background: '#1a1812', color: '#e8e0d0', fontFamily: 'Georgia, serif', display: 'flex', flexDirection: 'column' }}>

      {/* ── HEADER ── */}
      <div style={{ padding: isMobile ? '12px 16px' : '16px 28px', borderBottom: '1px solid #3a342a', background: '#211e17', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' as any }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 20, flexWrap: 'wrap' as any }}>
          {!isMobile && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: 4, color: '#7a6a50', textTransform: 'uppercase', marginBottom: 2 }}>Møbelplanlegger</div>
            </div>
          )}
          {/* View tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['plan', 'alternativer'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: isMobile ? '8px 13px' : '8px 18px', border: '1px solid', fontFamily: 'Georgia, serif', fontSize: isMobile ? 13 : 13, cursor: 'pointer', borderRadius: 3, borderColor: view === v ? '#c8a96e' : '#3a342a', background: view === v ? '#c8a96e' : 'transparent', color: view === v ? '#1a1812' : '#9a8a70' }}>
                {v === 'plan' ? 'Plantegning' : `Alternativer${alternatives.length ? ` (${alternatives.length})` : ''}`}
              </button>
            ))}
          </div>
          {/* Floor tabs — desktop only in header; mobile gets them in toolbar */}
          {view === 'plan' && !isMobile && (
            <div style={{ display: 'flex', gap: 5 }}>
              {FLOORS.map((f) => (
                <button key={f.id} onClick={() => { setActiveFloor(f.id); setSelected(null); }}
                  style={{ padding: '7px 14px', border: '1px solid', fontFamily: 'Georgia, serif', fontSize: 12, cursor: 'pointer', borderRadius: 3, borderColor: activeFloor === f.id ? '#c8a96e' : '#3a342a', background: activeFloor === f.id ? '#c8a96e' : 'transparent', color: activeFloor === f.id ? '#1a1812' : '#9a8a70' }}>
                  {f.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right side of header */}
        {view === 'plan' && isMobile && (
          <div style={{ display: 'flex', gap: 6 }}>
            <DrawerToggleBtn side="left" label="Legg til" />
            <DrawerToggleBtn side="right" label={`Møbler${furniture.length ? ` ${furniture.length}` : ''}`} count={selected ? 1 : 0} />
          </div>
        )}
        {view === 'alternativer' && isMobile && (
          <DrawerToggleBtn side="left" label="Filter / Legg til" count={0} />
        )}
        {view === 'alternativer' && !isMobile && totalValgt > 0 && (
          <div style={{ textAlign: 'right' as any }}>
            <div style={{ fontSize: 10, color: '#7a6a50', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3 }}>Valgte møbler</div>
            <div style={{ fontSize: 17, color: '#6eaac8' }}>
              {totalValgt} møbel{totalValgt !== 1 ? 'er' : ''}
              {totalPris > 0 && <span style={{ fontSize: 13, color: '#9a8a70', marginLeft: 10 }}>{totalPris.toLocaleString('nb-NO')} kr</span>}
            </div>
          </div>
        )}
      </div>

      {/* ── MOBILE FLOOR TABS ── */}
      {isMobile && view === 'plan' && (
        <div style={{ display: 'flex', gap: 0, background: '#1e1b14', borderBottom: '1px solid #2e2a22', overflowX: 'auto' as any }}>
          {FLOORS.map((f) => (
            <button key={f.id} onClick={() => { setActiveFloor(f.id); setSelected(null); }}
              style={{ flex: 1, padding: '11px 8px', border: 'none', borderBottom: '2px solid', fontFamily: 'Georgia, serif', fontSize: 12, cursor: 'pointer', background: 'transparent', borderColor: activeFloor === f.id ? '#c8a96e' : 'transparent', color: activeFloor === f.id ? '#c8a96e' : '#7a6a50', whiteSpace: 'nowrap' as any }}>
              {f.name}
            </button>
          ))}
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' as any }}>

        {/* ── Mobile drawers ── */}
        {isMobile && leftOpen && <Backdrop onClose={() => setLeftOpen(false)} />}
        {isMobile && rightOpen && <Backdrop onClose={() => setRightOpen(false)} />}

        {/* LEFT PANEL */}
        {isMobile ? (
          <div style={{
            position: 'fixed' as any, top: 0, left: 0, bottom: 0, width: PANEL_W,
            background: '#211e17', borderRight: '1px solid #3a342a',
            zIndex: 20, overflowY: 'auto',
            transform: leftOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.25s ease',
            display: 'flex', flexDirection: 'column',
            paddingTop: 56,
          }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #2e2a22', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'fixed' as any, top: 0, left: 0, width: PANEL_W - 36, background: '#211e17', zIndex: 1 }}>
              <span style={{ fontSize: 13, color: '#c8b898' }}>{view === 'plan' ? 'Legg til møbel' : 'Alternativer'}</span>
              <button onClick={() => setLeftOpen(false)}
                style={{ background: 'none', border: 'none', color: '#7a6a50', fontSize: 20, cursor: 'pointer', padding: '0 4px' }}>×</button>
            </div>
            <LeftPanelContent />
          </div>
        ) : (
          <div style={{ width: PANEL_W, background: '#211e17', borderRight: '1px solid #3a342a', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
            <LeftPanelContent />
          </div>
        )}

        {/* ── CANVAS / MAIN AREA ── */}
        {view === 'plan' && (
          <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? 16 : 28, background: '#16140f' }}>
            <div style={{ marginBottom: 10, fontSize: 10, letterSpacing: 2, color: '#4a3a28', textTransform: 'uppercase' as any }}>
              1 rute = 1 m &nbsp;·&nbsp; {floorItems.length} møbel{floorItems.length !== 1 ? 'er' : ''} plassert
            </div>
            <svg ref={svgRef} width={floor.width * SCALE + 80} height={floor.height * SCALE + 80}
              onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
              onClick={() => setSelected(null)}
              style={{ cursor: dragging ? 'grabbing' : 'default', userSelect: 'none', display: 'block' }}>
              <defs>
                <pattern id="g1" width={SCALE} height={SCALE} patternUnits="userSpaceOnUse">
                  <path d={`M ${SCALE} 0 L 0 0 0 ${SCALE}`} fill="none" stroke="#252018" strokeWidth="0.6" />
                </pattern>
                <pattern id="g5" width={SCALE * 5} height={SCALE * 5} patternUnits="userSpaceOnUse">
                  <path d={`M ${SCALE * 5} 0 L 0 0 0 ${SCALE * 5}`} fill="none" stroke="#2e2820" strokeWidth="1.2" />
                </pattern>
              </defs>
              <g transform="translate(40,40)">
                <rect width={floor.width * SCALE} height={floor.height * SCALE} fill="#1e1a14" />
                <rect width={floor.width * SCALE} height={floor.height * SCALE} fill="url(#g5)" />
                <rect width={floor.width * SCALE} height={floor.height * SCALE} fill="url(#g1)" />

                {floor.rooms.map((room) => {
                  const cx = (room.x + room.w / 2) * SCALE;
                  const cy = (room.y + room.h / 2) * SCALE;
                  const parts = room.name.split(' ');
                  const areal = parts.find((p) => p.includes('m²')) || '';
                  const romNavn = parts.filter((p) => !p.includes('m²')).join(' ');
                  const fs = Math.min(12, (room.w * SCALE) / 7);
                  return (
                    <g key={room.id}>
                      <rect x={room.x * SCALE} y={room.y * SCALE} width={room.w * SCALE} height={room.h * SCALE}
                        fill={room.color} fillOpacity={room.dashed ? 0.2 : 0.65}
                        stroke={room.dashed ? '#7a6a50' : '#6a5a40'}
                        strokeWidth={room.dashed ? 1 : 1.5}
                        strokeDasharray={room.dashed ? '6 4' : 'none'} rx={1} />
                      <text x={cx} y={cy - (areal ? 7 : 0)} textAnchor="middle" dominantBaseline="middle"
                        fontSize={fs} fill={room.dashed ? '#6a5a40' : '#5a4a30'} fontFamily="Georgia, serif">
                        {romNavn}
                      </text>
                      {areal && (
                        <text x={cx} y={cy + 9} textAnchor="middle" dominantBaseline="middle"
                          fontSize={Math.min(11, fs)} fill={room.dashed ? '#5a4a30' : '#4a3a28'} fontFamily="Georgia, serif">
                          {areal}
                        </text>
                      )}
                    </g>
                  );
                })}

                <g transform={`translate(0, ${floor.height * SCALE + 16})`}>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <line key={i} x1={i * SCALE} y1={-4} x2={i * SCALE} y2={4} stroke="#5a4a30" strokeWidth={1} />
                  ))}
                  <line x1={0} y1={0} x2={SCALE * 5} y2={0} stroke="#5a4a30" strokeWidth={1} />
                  {[1, 2, 3, 4, 5].map((i) => (
                    <text key={i} x={i * SCALE} y={14} textAnchor="middle" fontSize={10} fill="#5a4a30" fontFamily="Georgia, serif">{i}m</text>
                  ))}
                </g>

                {floorItems.map((item) => {
                  const isSel = selected === item.id;
                  const rot = item.rotation || 0;
                  const sx = item.x * SCALE;
                  const sy = item.y * SCALE;
                  const cx = (item.x + item.width / 2) * SCALE;
                  const cy = (item.y + item.height / 2) * SCALE;
                  const fw = item.width * SCALE;
                  const fh = item.height * SCALE;

                  const isL = item.shape === 'l-shape' && item.legW > 0 && item.legH > 0;
                  const nw = isL ? (item.width - item.legW) * SCALE : 0;
                  const nh = isL ? (item.height - item.legH) * SCALE : 0;
                  const lc = item.legCorner || 'bl';
                  const lPts = isL ? {
                    bl: `${sx},${sy} ${sx+fw},${sy} ${sx+fw},${sy+fh} ${sx+nw},${sy+fh} ${sx+nw},${sy+fh-nh} ${sx},${sy+fh-nh}`,
                    br: `${sx},${sy} ${sx+fw},${sy} ${sx+fw},${sy+fh-nh} ${sx+fw-nw},${sy+fh-nh} ${sx+fw-nw},${sy+fh} ${sx},${sy+fh}`,
                    tl: `${sx+nw},${sy} ${sx+fw},${sy} ${sx+fw},${sy+fh} ${sx},${sy+fh} ${sx},${sy+nh} ${sx+nw},${sy+nh}`,
                    tr: `${sx},${sy} ${sx+fw-nw},${sy} ${sx+fw-nw},${sy+nh} ${sx+fw},${sy+nh} ${sx+fw},${sy+fh} ${sx},${sy+fh}`,
                  }[lc as 'bl'|'br'|'tl'|'tr'] : '';
                  const shapeProps = { fill: item.color, fillOpacity: 0.9, stroke: isSel ? '#c8a96e' : '#4a3820', strokeWidth: isSel ? 2.5 : 1.5 };

                  return (
                    <g key={item.id} transform={`rotate(${rot}, ${cx}, ${cy})`}
                      onMouseDown={(e) => startDrag(e, item)}
                      onClick={(e) => { e.stopPropagation(); setSelected(item.id); if (isMobile) setRightOpen(true); }}
                      style={{ cursor: 'grab' }}>
                      {isL
                        ? <polygon points={lPts} {...shapeProps} />
                        : <rect x={sx} y={sy} width={fw} height={fh} {...shapeProps} rx={2} />
                      }
                      {isSel && (
                        <rect x={sx - 3} y={sy - 3} width={fw + 6} height={fh + 6}
                          fill="none" stroke="#c8a96e" strokeWidth={1} strokeDasharray="5 3" opacity={0.5} rx={3} />
                      )}
                      {fw > 28 && (
                        <text x={cx} y={cy - (fh > 24 ? 7 : 0)} textAnchor="middle" dominantBaseline="middle"
                          fontSize={Math.min(10, fw / Math.max(item.name.length * 0.65, 1))}
                          fill="#fff" fillOpacity={0.88} fontFamily="Georgia, serif" pointerEvents="none">
                          {item.name}
                        </text>
                      )}
                      {fw > 44 && fh > 22 && (
                        <text x={cx} y={cy + 9} textAnchor="middle" dominantBaseline="middle"
                          fontSize={8} fill="#fff" fillOpacity={0.5} fontFamily="Georgia, serif" pointerEvents="none">
                          {item.width}×{item.height}m
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        )}

        {/* ── ALTERNATIVER MAIN AREA ── */}
        {view === 'alternativer' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 14px' : '22px 28px', background: '#16140f' }}>
            {isMobile && totalValgt > 0 && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: '#211e17', border: '1px solid #3a342a', borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#9a8a70' }}>{totalValgt} valgte møbler</span>
                {totalPris > 0 && <span style={{ fontSize: 15, color: '#c8a96e' }}>{totalPris.toLocaleString('nb-NO')} kr</span>}
              </div>
            )}
            {filteredAlts.length === 0 ? (
              <div style={{ color: '#4a3a28', fontSize: 13, lineHeight: 2, maxWidth: 460 }}>
                {alternatives.length === 0
                  ? 'Ingen alternativer lagt til ennå. Trykk "+ Nytt møbelalternativ" for å starte.'
                  : 'Ingen treff for gjeldende filter.'}
              </div>
            ) : (
              ALT_CATEGORIES.filter((cat) => filteredAlts.some((a) => a.category === cat)).map((cat) => (
                <div key={cat} style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: '#7a6a50', textTransform: 'uppercase' as any, marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #2a2620' }}>
                    {cat} · {filteredAlts.filter((a) => a.category === cat).length} alternativ{filteredAlts.filter((a) => a.category === cat).length !== 1 ? 'er' : ''}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filteredAlts.filter((a) => a.category === cat).map((alt) => {
                      const st = STATUS_OPTIONS.find((s) => s.value === alt.status) || STATUS_OPTIONS[0];
                      const isExpanded = expandedAlt === alt.id;
                      return (
                        <div key={alt.id}
                          style={{ background: '#211e17', border: `1px solid ${isExpanded ? '#3a342a' : '#2e2a22'}`, borderRadius: 4, overflow: 'hidden' }}>
                          {/* Summary row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer' }}
                            onClick={() => setExpandedAlt(isExpanded ? null : alt.id)}>
                            <div style={{ width: 36, height: 36, background: alt.color, borderRadius: 4, flexShrink: 0, overflow: 'hidden', position: 'relative' as any }}>
                              {alt.imageUrl && (
                                <img src={alt.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' as any }}>
                                <span style={{ fontSize: 14, color: '#e8dcc8' }}>{alt.name}</span>
                                {alt.brand && <span style={{ fontSize: 12, color: '#7a6a50' }}>{alt.brand}</span>}
                              </div>
                              <div style={{ display: 'flex', gap: 12, marginTop: 3, flexWrap: 'wrap' as any }}>
                                {(alt.width || alt.depth) && (
                                  <span style={{ fontSize: 11, color: '#6a5a40' }}>
                                    {[alt.width && `B ${alt.width}m`, alt.depth && `D ${alt.depth}m`, alt.height && `H ${alt.height}m`].filter(Boolean).join(' · ')}
                                  </span>
                                )}
                                {alt.colorName && <span style={{ fontSize: 11, color: '#6a5a40' }}>{alt.colorName}</span>}
                              </div>
                            </div>
                            {alt.price && !isMobile && (
                              <div style={{ fontSize: 15, color: '#c8a96e', flexShrink: 0 }}>
                                {parseFloat(alt.price).toLocaleString('nb-NO')} kr
                              </div>
                            )}
                            <span style={{ fontSize: 10, padding: '4px 8px', borderRadius: 3, border: `1px solid ${st.color}`, color: st.color, background: st.bg, flexShrink: 0 }}>
                              {st.label}
                            </span>
                            <span style={{ color: '#4a3a28', fontSize: 13, flexShrink: 0 }}>{isExpanded ? '▲' : '▼'}</span>
                          </div>

                          {/* Expanded */}
                          {isExpanded && (
                            <div style={{ borderTop: '1px solid #2e2a22', padding: '16px 16px 16px' }}>
                              <div style={{ display: 'flex', gap: 16 }}>
                                {alt.imageUrl && (
                                  <div style={{ flexShrink: 0 }}>
                                    <img src={alt.imageUrl} alt={alt.name}
                                      style={{ width: isMobile ? 80 : 110, height: isMobile ? 80 : 110, objectFit: 'cover', borderRadius: 4, border: '1px solid #2e2a22' }}
                                      onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }} />
                                  </div>
                                )}
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px 16px', marginBottom: 14 }}>
                                    {alt.width && <div><div style={lbl}>Bredde</div><div style={{ fontSize: 13, color: '#c8b898' }}>{alt.width} m</div></div>}
                                    {alt.depth && <div><div style={lbl}>Dybde</div><div style={{ fontSize: 13, color: '#c8b898' }}>{alt.depth} m</div></div>}
                                    {alt.height && <div><div style={lbl}>Høyde</div><div style={{ fontSize: 13, color: '#c8b898' }}>{alt.height} m</div></div>}
                                    {alt.colorName && <div><div style={lbl}>Farge</div><div style={{ fontSize: 13, color: '#c8b898', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, background: alt.color, borderRadius: 2, display: 'inline-block', flexShrink: 0 }} />{alt.colorName}</div></div>}
                                    {alt.material && <div><div style={lbl}>Materiale</div><div style={{ fontSize: 13, color: '#c8b898' }}>{alt.material}</div></div>}
                                    {alt.price && <div><div style={lbl}>Pris</div><div style={{ fontSize: 15, color: '#c8a96e' }}>{parseFloat(alt.price).toLocaleString('nb-NO')} kr</div></div>}
                                  </div>
                                  {alt.notes && (
                                    <div style={{ marginBottom: 14, padding: '10px 12px', background: '#1e1b14', borderRadius: 3, borderLeft: '2px solid #3a342a' }}>
                                      <div style={lbl}>Notater</div>
                                      <div style={{ fontSize: 12, color: '#8a7a60', lineHeight: 1.7 }}>{alt.notes}</div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Status + actions */}
                              <div style={{ marginBottom: 12 }}>
                                <div style={lbl}>Status</div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as any }}>
                                  {STATUS_OPTIONS.map((s) => (
                                    <button key={s.value} onClick={() => setAltStatus(alt.id, s.value)}
                                      style={{ padding: '5px 11px', fontSize: 11, fontFamily: 'Georgia, serif', borderRadius: 3, cursor: 'pointer', border: `1px solid ${s.color}`, background: alt.status === s.value ? s.bg : 'transparent', color: s.color }}>
                                      {s.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as any }}>
                                {alt.url && (
                                  <a href={alt.url} target="_blank" rel="noreferrer"
                                    style={{ padding: '8px 13px', fontSize: 12, color: '#9a8a70', textDecoration: 'none', border: '1px solid #3a342a', borderRadius: 3, fontFamily: 'Georgia, serif' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#c8a96e')}
                                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#3a342a')}>
                                    Åpne nettside →
                                  </a>
                                )}
                                <button onClick={() => editAlternative(alt)}
                                  style={{ padding: '8px 13px', fontSize: 12, fontFamily: 'Georgia, serif', borderRadius: 3, cursor: 'pointer', border: '1px solid #3a342a', background: 'transparent', color: '#9a8a70' }}
                                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#c8a96e')}
                                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#3a342a')}>
                                  Rediger
                                </button>
                                <button onClick={() => addFromAlternative(alt)}
                                  style={{ padding: '8px 14px', fontSize: 12, fontFamily: 'Georgia, serif', borderRadius: 3, cursor: 'pointer', border: '1px solid #6eaac8', background: '#6eaac822', color: '#6eaac8' }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = '#6eaac844')}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = '#6eaac822')}>
                                  Plasser på tegning →
                                </button>
                                <button onClick={() => deleteAlternative(alt.id)}
                                  style={{ padding: '8px 11px', fontSize: 12, fontFamily: 'Georgia, serif', borderRadius: 3, cursor: 'pointer', border: '1px solid #5a2a20', background: 'transparent', color: '#8a5040' }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = '#7a3a2a33')}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                                  Slett
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* RIGHT PANEL — only in plan view */}
        {view === 'plan' && (
          isMobile ? (
            <div style={{
              position: 'fixed' as any, top: 0, right: 0, bottom: 0, width: PANEL_W,
              background: '#211e17', borderLeft: '1px solid #3a342a',
              zIndex: 20, overflowY: 'auto',
              transform: rightOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.25s ease',
              paddingTop: 56,
            }}>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid #2e2a22', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'fixed' as any, top: 0, right: 0, width: PANEL_W - 36, background: '#211e17', zIndex: 1 }}>
                <span style={{ fontSize: 13, color: '#c8b898' }}>{selItem ? selItem.name : 'Møbelliste'}</span>
                <button onClick={() => setRightOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#7a6a50', fontSize: 20, cursor: 'pointer', padding: '0 4px' }}>×</button>
              </div>
              <RightPanelContent />
            </div>
          ) : (
            <div style={{ width: PANEL_W, background: '#211e17', borderLeft: '1px solid #3a342a', flexShrink: 0, overflow: 'hidden' }}>
              <RightPanelContent />
            </div>
          )
        )}
      </div>
    </div>
  );
}
