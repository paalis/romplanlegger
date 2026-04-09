import { useState, useRef, useCallback } from 'react';

const SCALE = 32;

const FLOORS = [
  {
    id: 1,
    name: '1. etasje',
    width: 9,
    height: 18,
    rooms: [
      {
        id: 'terrasse_top',
        name: 'Terrasse 25m²',
        x: 1.5,
        y: 0.2,
        w: 5,
        h: 5,
        color: '#e8e0d0',
        dashed: true,
      },
      {
        id: 'stue1',
        name: 'Stue 35m²',
        x: 1.5,
        y: 5.2,
        w: 5,
        h: 7,
        color: '#f0ede8',
      },
      {
        id: 'tekrom',
        name: 'Tek.rom 2m²',
        x: 6.5,
        y: 9.5,
        w: 1.5,
        h: 1.5,
        color: '#e0dbd2',
      },
      {
        id: 'kjokken',
        name: 'Kjøkken 8m²',
        x: 1.5,
        y: 12.2,
        w: 3,
        h: 2.8,
        color: '#e8f0ed',
      },
      {
        id: 'entre',
        name: 'Entré 4,5m²',
        x: 4.5,
        y: 12.2,
        w: 2.5,
        h: 2.8,
        color: '#ede8f0',
      },
      {
        id: 'terrasse_bak',
        name: 'Terrasse 4m²',
        x: 4.5,
        y: 15,
        w: 2.5,
        h: 1.5,
        color: '#e8e0d0',
        dashed: true,
      },
      {
        id: 'bod1',
        name: 'Bod 5m²',
        x: 4.5,
        y: 16.5,
        w: 2.5,
        h: 1.8,
        color: '#e0dbd2',
      },
    ],
  },
  {
    id: 2,
    name: '2. etasje',
    width: 9,
    height: 16,
    rooms: [
      {
        id: 'sov1',
        name: 'Soverom 13m²',
        x: 0.5,
        y: 0.5,
        w: 4.5,
        h: 4.5,
        color: '#e8edf0',
      },
      {
        id: 'sov2',
        name: 'Soverom 7m²',
        x: 5,
        y: 0.5,
        w: 3,
        h: 4.5,
        color: '#e8edf0',
      },
      {
        id: 'bad',
        name: 'Bad 7,5m²',
        x: 0.5,
        y: 5,
        w: 4,
        h: 3.5,
        color: '#d6eaf8',
      },
      {
        id: 'gang',
        name: 'Gang/trapp 8,5m²',
        x: 4.5,
        y: 5,
        w: 3.5,
        h: 3.5,
        color: '#f0ede8',
      },
      {
        id: 'sov3',
        name: 'Soverom 12m²',
        x: 0.5,
        y: 8.5,
        w: 7.5,
        h: 4,
        color: '#e8edf0',
      },
      {
        id: 'altan',
        name: 'Altan 4m²',
        x: 5.5,
        y: 12.5,
        w: 2.5,
        h: 2,
        color: '#e8e0d0',
        dashed: true,
      },
    ],
  },
  {
    id: 3,
    name: '3. etasje',
    width: 9,
    height: 14,
    rooms: [
      {
        id: 'takter',
        name: 'Takterrasse 17m²',
        x: 0.5,
        y: 0.2,
        w: 7.5,
        h: 3.5,
        color: '#e8e0d0',
        dashed: true,
      },
      {
        id: 'bod3',
        name: 'Bod 1m²',
        x: 6.5,
        y: 3.7,
        w: 1.5,
        h: 1.5,
        color: '#e0dbd2',
      },
      {
        id: 'stue3',
        name: 'Stue 15,5m²',
        x: 0.5,
        y: 3.7,
        w: 6,
        h: 4.5,
        color: '#f0ede8',
      },
      {
        id: 'sov4',
        name: 'Soverom 8m²',
        x: 0.5,
        y: 8.2,
        w: 3.5,
        h: 3,
        color: '#e8edf0',
      },
      {
        id: 'vask',
        name: 'Vaskerom 4,5m²',
        x: 4,
        y: 8.2,
        w: 2.5,
        h: 3,
        color: '#d6eaf8',
      },
    ],
  },
];

const PRESETS = [
  { name: 'Sofa (3-seter)', w: 2.2, h: 0.9, color: '#8B7355' },
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

const emptyForm = {
  name: '',
  width: '',
  height: '',
  url: '',
  price: '',
  color: '#8B7355',
};

export default function App() {
  const [activeFloor, setActiveFloor] = useState(1);
  const [furniture, setFurniture] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const floor = FLOORS.find((f) => f.id === activeFloor);
  const selItem = furniture.find((f) => f.id === selected);

  const getSvgXY = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left - 40, y: e.clientY - r.top - 40 };
  };

  const onMouseMove = useCallback(
    (e) => {
      if (!dragging) return;
      const p = getSvgXY(e);
      setFurniture((prev) =>
        prev.map((f) =>
          f.id === dragging
            ? {
                ...f,
                x: Math.max(0, (p.x - dragOffset.x) / SCALE),
                y: Math.max(0, (p.y - dragOffset.y) / SCALE),
              }
            : f
        )
      );
    },
    [dragging, dragOffset]
  );

  const onMouseUp = useCallback(() => setDragging(null), []);

  const startDrag = (e, item) => {
    e.stopPropagation();
    const p = getSvgXY(e);
    setDragging(item.id);
    setDragOffset({ x: p.x - item.x * SCALE, y: p.y - item.y * SCALE });
    setSelected(item.id);
  };

  const addItem = (preset = null) => {
    const base = preset
      ? {
          name: preset.name,
          width: preset.w,
          height: preset.h,
          color: preset.color,
        }
      : {
          name: form.name,
          width: parseFloat(form.width),
          height: parseFloat(form.height),
          color: form.color,
        };
    if (!base.name || !base.width || !base.height) return;
    setFurniture((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...base,
        url: form.url,
        price: form.price,
        x: 2,
        y: 2,
        floorId: activeFloor,
        rotation: 0,
      },
    ]);
    if (!preset) {
      setForm(emptyForm);
      setShowForm(false);
    }
  };

  const rotate = (id) =>
    setFurniture((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, rotation: ((f.rotation || 0) + 90) % 360 } : f
      )
    );
  const remove = (id) => {
    setFurniture((prev) => prev.filter((f) => f.id !== id));
    setSelected(null);
  };

  const floorItems = furniture.filter((f) => f.floorId === activeFloor);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#1a1812',
        color: '#e8e0d0',
        fontFamily: 'Georgia, serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '18px 28px',
          borderBottom: '1px solid #3a342a',
          background: '#211e17',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 4,
              color: '#9a8a70',
              textTransform: 'uppercase',
              marginBottom: 3,
            }}
          >
            Møbelplanlegger
          </div>
          <div style={{ fontSize: 20, color: '#e8dcc8' }}>Plantegning</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {FLOORS.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setActiveFloor(f.id);
                setSelected(null);
              }}
              style={{
                padding: '8px 16px',
                border: '1px solid',
                borderColor: activeFloor === f.id ? '#c8a96e' : '#3a342a',
                background: activeFloor === f.id ? '#c8a96e' : 'transparent',
                color: activeFloor === f.id ? '#1a1812' : '#9a8a70',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'Georgia, serif',
                borderRadius: 2,
              }}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left */}
        <div
          style={{
            width: 245,
            background: '#211e17',
            borderRight: '1px solid #3a342a',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 16px 10px',
              borderBottom: '1px solid #2e2a22',
            }}
          >
            <div
              style={{
                fontSize: 9,
                letterSpacing: 3,
                color: '#7a6a50',
                textTransform: 'uppercase',
                marginBottom: 9,
              }}
            >
              Legg til møbel
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                width: '100%',
                padding: 9,
                background: showForm ? '#2a2620' : '#c8a96e',
                color: showForm ? '#c8a96e' : '#1a1812',
                border: '1px solid #c8a96e',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'Georgia, serif',
                borderRadius: 2,
              }}
            >
              {showForm ? '↑ Lukk' : '+ Egendefinert møbel'}
            </button>
          </div>

          {showForm && (
            <div
              style={{
                padding: 13,
                borderBottom: '1px solid #2e2a22',
                background: '#1e1b14',
              }}
            >
              {[
                { l: 'Navn', k: 'name', p: 'f.eks. Sofa' },
                { l: 'Bredde (m)', k: 'width', p: '2.2', t: 'number' },
                { l: 'Dybde (m)', k: 'height', p: '0.9', t: 'number' },
                { l: 'Pris (kr)', k: 'price', p: '4990' },
                { l: 'Nettbutikk URL', k: 'url', p: 'https://...' },
              ].map(({ l, k, p, t = 'text' }) => (
                <div key={k} style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      fontSize: 9,
                      color: '#7a6a50',
                      letterSpacing: 2,
                      marginBottom: 3,
                      textTransform: 'uppercase',
                    }}
                  >
                    {l}
                  </div>
                  <input
                    type={t}
                    value={form[k]}
                    placeholder={p}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [k]: e.target.value }))
                    }
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      background: '#2a2620',
                      border: '1px solid #3a342a',
                      color: '#e8e0d0',
                      fontSize: 12,
                      fontFamily: 'Georgia, serif',
                      borderRadius: 2,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 9 }}>
                <div
                  style={{
                    fontSize: 9,
                    color: '#7a6a50',
                    letterSpacing: 2,
                    marginBottom: 3,
                    textTransform: 'uppercase',
                  }}
                >
                  Farge
                </div>
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, color: e.target.value }))
                  }
                  style={{
                    width: '100%',
                    height: 28,
                    border: '1px solid #3a342a',
                    borderRadius: 2,
                    cursor: 'pointer',
                  }}
                />
              </div>
              <button
                onClick={() => addItem()}
                style={{
                  width: '100%',
                  padding: 8,
                  background: '#c8a96e',
                  color: '#1a1812',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: 'Georgia, serif',
                  borderRadius: 2,
                }}
              >
                Plasser på tegning →
              </button>
            </div>
          )}

          <div style={{ padding: '11px 14px 6px' }}>
            <div
              style={{
                fontSize: 9,
                letterSpacing: 3,
                color: '#7a6a50',
                textTransform: 'uppercase',
                marginBottom: 7,
              }}
            >
              Hurtigvalg
            </div>
          </div>
          <div
            style={{
              overflowY: 'auto',
              flex: 1,
              padding: '0 13px 13px',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => addItem(p)}
                style={{
                  padding: '7px 9px',
                  background: '#2a2620',
                  border: '1px solid #3a342a',
                  color: '#c8b898',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: 'Georgia, serif',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: 2,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = '#c8a96e')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = '#3a342a')
                }
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      background: p.color,
                      borderRadius: 1,
                      flexShrink: 0,
                    }}
                  />
                  {p.name}
                </span>
                <span style={{ color: '#5a4a30', fontSize: 9 }}>
                  {p.w}×{p.h}m
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: 28,
            background: '#16140f',
          }}
        >
          <div
            style={{
              marginBottom: 10,
              fontSize: 9,
              letterSpacing: 3,
              color: '#4a3a28',
              textTransform: 'uppercase',
            }}
          >
            Rutenett: 1 rute = 1 meter · {floorItems.length} møbel
            {floorItems.length !== 1 ? 'er' : ''} plassert
          </div>
          <svg
            ref={svgRef}
            width={floor.width * SCALE + 80}
            height={floor.height * SCALE + 80}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onClick={() => setSelected(null)}
            style={{
              cursor: dragging ? 'grabbing' : 'default',
              userSelect: 'none',
              display: 'block',
            }}
          >
            <defs>
              <pattern
                id="g1"
                width={SCALE}
                height={SCALE}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${SCALE} 0 L 0 0 0 ${SCALE}`}
                  fill="none"
                  stroke="#252018"
                  strokeWidth="0.6"
                />
              </pattern>
              <pattern
                id="g5"
                width={SCALE * 5}
                height={SCALE * 5}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${SCALE * 5} 0 L 0 0 0 ${SCALE * 5}`}
                  fill="none"
                  stroke="#2e2820"
                  strokeWidth="1.2"
                />
              </pattern>
            </defs>
            <g transform="translate(40,40)">
              <rect
                width={floor.width * SCALE}
                height={floor.height * SCALE}
                fill="#1e1a14"
              />
              <rect
                width={floor.width * SCALE}
                height={floor.height * SCALE}
                fill="url(#g5)"
              />
              <rect
                width={floor.width * SCALE}
                height={floor.height * SCALE}
                fill="url(#g1)"
              />

              {floor.rooms.map((room) => {
                const cx = (room.x + room.w / 2) * SCALE;
                const cy = (room.y + room.h / 2) * SCALE;
                const parts = room.name.split(' ');
                const areal = parts.find((p) => p.includes('m²')) || '';
                const romNavn = parts
                  .filter((p) => !p.includes('m²'))
                  .join(' ');
                const fs = Math.min(11, (room.w * SCALE) / 7);
                return (
                  <g key={room.id}>
                    <rect
                      x={room.x * SCALE}
                      y={room.y * SCALE}
                      width={room.w * SCALE}
                      height={room.h * SCALE}
                      fill={room.color}
                      fillOpacity={room.dashed ? 0.2 : 0.6}
                      stroke={room.dashed ? '#7a6a50' : '#6a5a40'}
                      strokeWidth={room.dashed ? 1 : 1.5}
                      strokeDasharray={room.dashed ? '6 4' : 'none'}
                      rx={1}
                    />
                    <text
                      x={cx}
                      y={cy - (areal ? 7 : 0)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={fs}
                      fill={room.dashed ? '#6a5a40' : '#5a4a30'}
                      fontFamily="Georgia, serif"
                    >
                      {romNavn}
                    </text>
                    {areal && (
                      <text
                        x={cx}
                        y={cy + 9}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={Math.min(10, fs)}
                        fill={room.dashed ? '#5a4a30' : '#4a3a28'}
                        fontFamily="Georgia, serif"
                      >
                        {areal}
                      </text>
                    )}
                  </g>
                );
              })}

              <g transform={`translate(0, ${floor.height * SCALE + 16})`}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <line
                    key={i}
                    x1={i * SCALE}
                    y1={-4}
                    x2={i * SCALE}
                    y2={4}
                    stroke="#5a4a30"
                    strokeWidth={1}
                  />
                ))}
                <line
                  x1={0}
                  y1={0}
                  x2={SCALE * 5}
                  y2={0}
                  stroke="#5a4a30"
                  strokeWidth={1}
                />
                {[1, 2, 3, 4, 5].map((i) => (
                  <text
                    key={i}
                    x={i * SCALE}
                    y={14}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#5a4a30"
                    fontFamily="Georgia, serif"
                  >
                    {i}m
                  </text>
                ))}
              </g>

              {floorItems.map((item) => {
                const isSel = selected === item.id;
                const rot = item.rotation || 0;
                const cx = (item.x + item.width / 2) * SCALE;
                const cy = (item.y + item.height / 2) * SCALE;
                const fw = item.width * SCALE;
                const fh = item.height * SCALE;
                return (
                  <g
                    key={item.id}
                    transform={`rotate(${rot}, ${cx}, ${cy})`}
                    onMouseDown={(e) => startDrag(e, item)}
                    style={{ cursor: 'grab' }}
                  >
                    <rect
                      x={item.x * SCALE}
                      y={item.y * SCALE}
                      width={fw}
                      height={fh}
                      fill={item.color}
                      fillOpacity={0.9}
                      stroke={isSel ? '#c8a96e' : '#4a3820'}
                      strokeWidth={isSel ? 2.5 : 1.5}
                      rx={2}
                    />
                    {isSel && (
                      <rect
                        x={item.x * SCALE - 3}
                        y={item.y * SCALE - 3}
                        width={fw + 6}
                        height={fh + 6}
                        fill="none"
                        stroke="#c8a96e"
                        strokeWidth={1}
                        strokeDasharray="5 3"
                        opacity={0.5}
                        rx={3}
                      />
                    )}
                    {fw > 28 && (
                      <text
                        x={cx}
                        y={cy - (fh > 24 ? 7 : 0)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={Math.min(
                          10,
                          fw / Math.max(item.name.length * 0.65, 1)
                        )}
                        fill="#fff"
                        fillOpacity={0.88}
                        fontFamily="Georgia, serif"
                        pointerEvents="none"
                      >
                        {item.name}
                      </text>
                    )}
                    {fw > 44 && fh > 22 && (
                      <text
                        x={cx}
                        y={cy + 9}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={8}
                        fill="#fff"
                        fillOpacity={0.5}
                        fontFamily="Georgia, serif"
                        pointerEvents="none"
                      >
                        {item.width}×{item.height}m
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Right */}
        <div
          style={{
            width: 225,
            background: '#211e17',
            borderLeft: '1px solid #3a342a',
            padding: 18,
            overflowY: 'auto',
          }}
        >
          {selItem ? (
            <div>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: 3,
                  color: '#7a6a50',
                  textTransform: 'uppercase',
                  marginBottom: 14,
                }}
              >
                Valgt møbel
              </div>
              <div
                style={{
                  width: 34,
                  height: 34,
                  background: selItem.color,
                  borderRadius: 3,
                  marginBottom: 12,
                }}
              />
              <div style={{ fontSize: 15, color: '#e8dcc8', marginBottom: 4 }}>
                {selItem.name}
              </div>
              <div style={{ fontSize: 12, color: '#8a7a60', marginBottom: 14 }}>
                {selItem.width} × {selItem.height} m
              </div>
              {selItem.price && (
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 9,
                      color: '#7a6a50',
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    Pris
                  </div>
                  <div style={{ fontSize: 19, color: '#c8a96e' }}>
                    {selItem.price} kr
                  </div>
                </div>
              )}
              {selItem.url && (
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 9,
                      color: '#7a6a50',
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      marginBottom: 6,
                    }}
                  >
                    Butikk
                  </div>
                  <a
                    href={selItem.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 11,
                      color: '#c8a96e',
                      textDecoration: 'none',
                      display: 'block',
                      padding: '7px 9px',
                      border: '1px solid #c8a96e',
                      borderRadius: 2,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = '#c8a96e18')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = 'transparent')
                    }
                  >
                    Åpne i nettbutikk →
                  </a>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  {
                    label: '↻  Roter 90°',
                    action: () => rotate(selItem.id),
                    color: '#3a342a',
                    textColor: '#c8b898',
                  },
                  {
                    label: '×  Slett møbel',
                    action: () => remove(selItem.id),
                    color: '#7a3a2a',
                    textColor: '#c87060',
                  },
                ].map(({ label, action, color, textColor }) => (
                  <button
                    key={label}
                    onClick={action}
                    style={{
                      padding: '8px 11px',
                      background: 'transparent',
                      border: `1px solid ${color}`,
                      color: textColor,
                      cursor: 'pointer',
                      fontSize: 11,
                      fontFamily: 'Georgia, serif',
                      borderRadius: 2,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = color + '33')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = 'transparent')
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: 3,
                  color: '#7a6a50',
                  textTransform: 'uppercase',
                  marginBottom: 14,
                }}
              >
                Møbelliste
              </div>
              {FLOORS.map((f) => {
                const items = furniture.filter((i) => i.floorId === f.id);
                if (!items.length) return null;
                return (
                  <div key={f.id} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        fontSize: 10,
                        color: '#9a8a70',
                        marginBottom: 7,
                        paddingBottom: 4,
                        borderBottom: '1px solid #2e2a22',
                        letterSpacing: 1,
                      }}
                    >
                      {f.name}
                    </div>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setActiveFloor(item.floorId);
                          setSelected(item.id);
                        }}
                        style={{
                          padding: '6px 8px',
                          marginBottom: 3,
                          background: '#1e1b14',
                          border: '1px solid #2e2a22',
                          borderRadius: 2,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 7,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor = '#c8a96e')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor = '#2e2a22')
                        }
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            background: item.color,
                            borderRadius: 1,
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div style={{ fontSize: 11, color: '#c8b898' }}>
                            {item.name}
                          </div>
                          {item.price && (
                            <div style={{ fontSize: 9, color: '#7a6a50' }}>
                              {item.price} kr
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
              {!furniture.length && (
                <div
                  style={{ color: '#4a3a28', fontSize: 11, lineHeight: 1.9 }}
                >
                  Velg et møbel fra hurtigvalg eller legg til egendefinert, og
                  dra det til ønsket plass.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
