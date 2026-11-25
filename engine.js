// Subasta Futbolera - motor del juego (funciona en el navegador del anfitrión y en Node para pruebas)
(function (root) {
const DATA = (typeof module !== 'undefined' && module.exports) ? require('./players.js') : root.SF_DATA;
const { POSITIONS, PLAYERS, PRICE_RANGES } = DATA;
const BUDGET = 1000;       // millones
const RESERVE = 1;         // millones reservados por cada posición pendiente
const MAX_PLAYERS = 4;
const FAST = (typeof process !== 'undefined' && process.env && process.env.SF_FAST) ? 0.15 : 1;
const LOT_TIME = 15000 * FAST;    // ms iniciales por lote
const BID_EXTEND = 7000 * FAST;   // tras una puja, quedan al menos 7 s
const REVEAL_TIME = 5000 * FAST;
const COLORS = ['#f5c542', '#3ec7ff', '#ff5c8a', '#7dff8a'];

const rooms = new Map();

// ---------- utilidades ----------
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(rnd(a, b + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const avg = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const uid = () => Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10);

function revealData(d) {
  return { name: d.name, tier: d.tier, ovr: d.ovr, nat: d.nat, bio: d.bio, q: d.q, pos: d.pos };
}

// ---------- salas ----------
function newRoom(code) {
  const r = {
    code, phase: 'lobby', players: [], hostId: null, posIdx: 0, lots: {},
    cur: null, highBid: 0, highBidder: null, deadline: 0, passes: new Set(),
    reveal: null, log: [], results: null, clients: new Set(), timer: null,
    botTimers: [], touched: Date.now(),
  };
  rooms.set(code, r);
  return r;
}

function addPlayer(r, name, bot = false) {
  const p = { id: uid(), name: String(name).slice(0, 16) || 'Jugador', budget: BUDGET, team: {}, bot, color: COLORS[r.players.length % COLORS.length] };
  r.players.push(p);
  if (!r.hostId) r.hostId = p.id;
  return p;
}

const isOnline = (r, pid) => [...r.clients].some((c) => c.pid === pid);
const unfilled = (p) => POSITIONS.filter((x) => !p.team[x.key]).length;
const maxBid = (p) => p.budget - RESERVE * (unfilled(p) - 1);
const curPos = (r) => POSITIONS[r.posIdx] && POSITIONS[r.posIdx].key;

function log(r, text) { r.log.push({ t: Date.now(), text }); if (r.log.length > 40) r.log.shift(); }

function publicState(r, pid) {
  const pos = curPos(r);
  return {
    code: r.code, phase: r.phase, hostId: r.hostId, me: pid, serverNow: Date.now(),
    budgetTotal: BUDGET, positions: POSITIONS, posIdx: r.posIdx,
    players: r.players.map((p) => ({
      id: p.id, name: p.name, budget: p.budget, bot: p.bot, color: p.color,
      online: p.bot || isOnline(r, p.id), maxBid: maxBid(p),
      team: Object.fromEntries(Object.entries(p.team).map(([k, v]) => [k, { ...revealData(v.data), price: v.price }])),
    })),
    lots: pos && r.lots[pos] ? r.lots[pos].map((l) => ({
      id: l.id, status: l.status, owner: l.owner, price: l.price, base: l.base,
      info: (l.status === 'sold' || l.status === 'unsold' || l.status === 'discarded') ? revealData(l.data) : null,
    })) : [],
    cur: r.cur ? { id: r.cur.id, pos: r.cur.data.pos, base: r.cur.base, num: r.lots[curPos(r)].indexOf(r.cur) + 1 } : null,
    highBid: r.highBid, highBidder: r.highBidder, deadline: r.deadline, passes: [...r.passes],
    reveal: r.reveal, log: r.log.slice(-25), results: r.results,
  };
}

function broadcast(r) {
  r.touched = Date.now();
  for (const c of r.clients) {
    try { c.send(publicState(r, c.pid)); } catch (e) { /* ignorar */ }
  }
}

function clearTimers(r) {
  if (r.timer) clearTimeout(r.timer);
  r.timer = null;
  r.botTimers.forEach(clearTimeout);
  r.botTimers = [];
}

// ---------- subasta ----------
function startGame(r) {
  r.posIdx = 0; r.results = null; r.reveal = null; r.log = [];
  for (const p of r.players) { p.budget = BUDGET; p.team = {}; }
  for (const pos of POSITIONS) {
    // De los 50 de la posición, sale uno al azar de cada tipo (troll, leyenda, normal, bueno, prime)
    const five = ['troll', 'legend', 'normal', 'good', 'prime'].map((t) => pick(PLAYERS[pos.key].filter((d) => d.tier === t)));
    r.lots[pos.key] = shuffle(five).map((d) => {
      const [a, b] = PRICE_RANGES[d.tier];
      return { id: uid(), data: { ...d, pos: pos.key }, base: Math.round(rnd(a, b) / 5) * 5, status: 'pending', owner: null, price: 0 };
    });
  }
  r.phase = 'auction';
  log(r, '🔨 ¡Empieza la subasta! 1000M para cada mánager.');
  nextLot(r);
}

function nextLot(r) {
  clearTimers(r);
  r.reveal = null;
  if (r.posIdx >= POSITIONS.length) return finishGame(r);
  const pos = curPos(r);
  const lots = r.lots[pos];
  const needing = r.players.filter((p) => !p.team[pos]);
  const pending = lots.filter((l) => l.status === 'pending');

  if (needing.length === 0) {
    pending.forEach((l) => { l.status = 'discarded'; });
    if (pending.length) log(r, `🗑️ Se quedaron sin subastar: ${pending.map((l) => l.data.name).join(', ')}.`);
    r.posIdx++;
    return nextLot(r);
  }

  if (pending.length <= needing.length) {
    // Asignación forzosa: los que queden sin jugador se llevan los restantes
    const items = [];
    shuffle(needing).forEach((p, i) => {
      const l = pending[i];
      if (!l) return;
      const price = Math.max(0, Math.min(l.base, maxBid(p)));
      sell(r, l, p, price);
      items.push({ player: revealData(l.data), owner: p.id, price });
      log(r, `📦 ${p.name} recibe de descarte a ${l.data.name} por ${price}M.`);
    });
    r.phase = 'reveal';
    r.reveal = { id: uid(), kind: 'forced', items };
    broadcast(r);
    r.timer = setTimeout(() => { r.phase = 'auction'; r.posIdx++; nextLot(r); }, REVEAL_TIME + 1000);
    return;
  }

  const l = pending[0];
  l.status = 'active';
  r.cur = l; r.highBid = 0; r.highBidder = null; r.passes = new Set();
  r.deadline = Date.now() + LOT_TIME;
  r.phase = 'auction';
  broadcast(r);
  scheduleEnd(r);
  scheduleBots(r);
  checkAllPassed(r);
}

function scheduleEnd(r) {
  if (r.timer) clearTimeout(r.timer);
  r.timer = setTimeout(() => endLot(r), Math.max(0, r.deadline - Date.now()));
}

function sell(r, l, p, price) {
  l.status = 'sold'; l.owner = p.id; l.price = price;
  p.budget -= price;
  p.team[l.data.pos] = { data: l.data, price };
}

function endLot(r) {
  if (r.phase !== 'auction' || !r.cur) return;
  clearTimers(r);
  const l = r.cur;
  r.cur = null;
  if (r.highBidder) {
    const p = r.players.find((x) => x.id === r.highBidder);
    sell(r, l, p, r.highBid);
    log(r, `✅ ${p.name} ficha a ${l.data.name} por ${r.highBid}M.`);
    r.reveal = { id: uid(), kind: 'sold', items: [{ player: revealData(l.data), owner: p.id, price: r.highBid }] };
  } else {
    l.status = 'unsold';
    log(r, `🙈 Nadie pujó... era ${l.data.name}.`);
    r.reveal = { id: uid(), kind: 'unsold', items: [{ player: revealData(l.data), owner: null, price: 0 }] };
  }
  r.phase = 'reveal';
  broadcast(r);
  r.timer = setTimeout(() => nextLot(r), REVEAL_TIME);
}

function eligible(r, p) {
  const pos = curPos(r);
  if (p.team[pos]) return false;
  const min = r.highBid ? r.highBid + 1 : r.cur.base;
  return maxBid(p) >= min;
}

function checkAllPassed(r) {
  if (r.phase !== 'auction' || !r.cur) return;
  const waiting = r.players.filter((p) => p.id !== r.highBidder && eligible(r, p) && !r.passes.has(p.id) && (p.bot || isOnline(r, p.id)));
  if (waiting.length === 0) {
    // Pequeña pausa para que se vea la última puja
    r.deadline = Math.min(r.deadline, Date.now() + 1200);
    broadcast(r);
    scheduleEnd(r);
  }
}

function doBid(r, p, amount) {
  if (r.phase !== 'auction' || !r.cur) return 'No hay lote activo';
  amount = Math.floor(Number(amount));
  if (!Number.isFinite(amount)) return 'Cantidad inválida';
  if (p.team[curPos(r)]) return 'Ya tienes jugador en esta posición';
  if (r.highBidder === p.id) return 'Ya vas ganando';
  const min = r.highBid ? r.highBid + 1 : r.cur.base;
  if (amount < min) return `La puja mínima es ${min}M`;
  if (amount > maxBid(p)) return `Solo puedes pujar hasta ${maxBid(p)}M (reserva 1M por posición pendiente)`;
  r.highBid = amount; r.highBidder = p.id;
  r.passes = new Set();
  r.deadline = Math.max(r.deadline, Date.now() + BID_EXTEND);
  log(r, `💰 ${p.name} puja ${amount}M`);
  broadcast(r);
  scheduleEnd(r);
  scheduleBots(r);
  checkAllPassed(r);
  return null;
}

function doPass(r, p) {
  if (r.phase !== 'auction' || !r.cur) return 'No hay lote activo';
  r.passes.add(p.id);
  broadcast(r);
  checkAllPassed(r);
  return null;
}

// ---------- bots ----------
function scheduleBots(r) {
  r.botTimers.forEach(clearTimeout); r.botTimers = [];
  const lotId = r.cur && r.cur.id;
  for (const b of r.players.filter((p) => p.bot)) {
    r.botTimers.push(setTimeout(() => {
      if (!r.cur || r.cur.id !== lotId || r.phase !== 'auction') return;
      if (r.highBidder === b.id || r.passes.has(b.id)) return;
      if (!eligible(r, b)) return doPass(r, b);
      if (!b._limit || b._limit.lot !== lotId) {
        const share = b.budget / unfilled(b);
        b._limit = { lot: lotId, max: Math.round(Math.min(maxBid(b), Math.max(r.cur.base, share * rnd(0.6, 1.8), r.cur.base * rnd(0.9, 1.6)))) };
      }
      const min = r.highBid ? r.highBid + 1 : r.cur.base;
      const next = r.highBid ? r.highBid + pick([1, 5, 5, 10, 10, 20]) : r.cur.base;
      if (Math.max(min, next) <= b._limit.max) doBid(r, b, Math.min(Math.max(min, next), maxBid(b)));
      else doPass(r, b);
    }, rint(1500, 4500) * FAST));
  }
}

// ---------- partido ----------
const SHOOT_W = { DC: 4, EI: 3, ED: 3, MCO: 2.5, MC: 1.2, MCD: 0.5, LD: 0.6, LI: 0.6, DFD: 0.5, DFI: 0.5, POR: 0 };
const ASSIST_W = { DC: 1.5, EI: 3, ED: 3, MCO: 3.5, MC: 2.5, MCD: 1, LD: 1.5, LI: 1.5, DFD: 0.3, DFI: 0.3, POR: 0.05 };

const TROLL_LINES = {
  'Loris Karius': '🤡 Karius saca con la mano... ¡contra la espalda de un rival! Gol a lo Kiev.',
  'Phil Jones': '🤡 Phil Jones pone una de sus caras míticas y la mete en su propia portería.',
  'Harry Maguire': '🤡 Maguire intenta un pase de 60 metros... directo al delantero rival. Gol.',
  'Douglas Pereira': '🤡 Douglas aparece en la jugada. Nadie sabe qué hace ahí, ni él. Gol rival.',
  'Junior Firpo': '🤡 Junior Firpo rompe el fuera de juego... a favor del rival. Gol.',
  'Alex Song': '🤡 Alex Song pierde el balón mientras saluda a la grada como si fuera el banquillo.',
  'Arthur Melo': '🤡 Arthur se queda pensando en su partida de la Play y le roban la cartera. Gol.',
  'Kerlon': '🤡 Kerlon intenta el regate de la foca en su propia área... y la foca se escapa. Gol.',
  'Bebé': '🤡 Bebé prueba una chilena en su propio área. No sale bien.',
  'Jesé Rodríguez': '🤡 Jesé se para a grabar un videoclip en mitad de la contra. Gol rival.',
  'Nicklas Bendtner': '🤡 Lord Bendtner falla a puerta vacía y la contra acaba en gol.',
};
const TROLL_FUNNY = [
  (n) => `🤡 ${n} se tropieza con el balón él solito. Aplausos irónicos en la grada.`,
  (n) => `🤡 ${n} pide el balón, lo recibe... y lo saca de banda sin querer.`,
  (n) => `🤡 ${n} celebra un gol que era fuera de juego. Muy fuera.`,
];
const TROLL_HERO = (n) => `🤡➡️⚽ ¡NO PUEDE SER! ¡${n} marca un golazo! Hoy es su día.`;

const MAGIC_LINES = {
  'Lionel Messi': () => '✨ Messi arranca desde medio campo, deja a cinco rivales sentados y marca. Imposible.',
  'Ronaldo Nazário': () => '✨ El Fenómeno hace la elástica, regatea al portero y la empuja. R9 puro.',
  'Ronaldinho': () => '✨ Ronaldinho mira a un lado, pasa al otro y él mismo remata. ¡Magia!',
  'Zinedine Zidane': () => '✨ Zidane engancha una volea como en Glasgow. Obra de arte.',
  'Roberto Carlos': () => '✨ Falta lejana. Roberto Carlos coge carrerilla... ¡la curva desafía a Newton!',
  'Carles Puyol': () => '✨ Puyol sube al córner y cabecea como en Durban. ¡GOL!',
  'Paolo Maldini': (a) => `✨ Maldini roba sin tocar al rival, sale jugando y ${a} culmina la contra.`,
  'Xavi Hernández': (a) => `✨ Xavi da un pase que nadie más veía. ${a} solo tiene que empujarla.`,
  'Sergio Busquets': (a) => `✨ Busquets sale de la presión de tres rivales con un giro. Gol de ${a}.`,
  'Cafu': (a) => `✨ Cafu se recorre la banda entera y la pone en la cabeza de ${a}. ¡Gol!`,
};
const SELF_SCORE_LEGENDS = ['Lionel Messi', 'Ronaldo Nazário', 'Ronaldinho', 'Zinedine Zidane', 'Roberto Carlos', 'Carles Puyol'];

const CLUTCH_LINES = {
  'Mario Götze': '🏆 ¡GÖTZE! Control con el pecho y volea. ¡Como en Maracaná 2014!',
  'Éder': '🏆 ¡ÉDER se saca un zapatazo desde fuera del área! ¡Como en Saint-Denis!',
  'Mikel Merino': '🏆 ¡MERINO se eleva en el último suspiro! ¡Como contra Alemania!',
  'Divock Origi': '🏆 ¡ORIGI aparece de la nada! ¡Como contra el Barça en Anfield!',
  'Marco Materazzi': '🏆 ¡Materazzi de cabeza! Berlín 2006 revive.',
  'Benjamin Pavard': '🏆 ¡Volea de Pavard con el exterior! Kazán 2018 otra vez.',
  'Marcos Senna': '🏆 ¡Marcos Senna desde 30 metros! Ancla y cañón.',
  'Ricardo Quaresma': '🏆 ¡Trivela imposible de Quaresma! Toca la escuadra y entra.',
  'Joan Capdevila': '🏆 ¡Capdevila se incorpora al ataque y la clava! Nadie lo esperaba.',
  'Carlos Marchena': '🏆 ¡Marchena, el amuleto, empata de cabeza en un córner!',
};

const GOAL_T = [
  (s, a) => `⚽ ¡GOOOL de ${s}! Asistencia de ${a}.`,
  (s) => `⚽ ¡${s} la clava por la escuadra!`,
  (s, a) => `⚽ ${s} define con frialdad tras un pase de ${a}.`,
  (s) => `⚽ ¡Golazo de ${s}! El estadio se viene abajo.`,
  (s, a) => `⚽ ${a} centra y ${s} cabecea a la red.`,
];
const SAVE_T = [(g, s) => `🧤 ¡Paradón de ${g} a disparo de ${s}!`, (g, s) => `🧤 ${g} vuela y saca el balón que buscaba ${s}.`];
const MISS_T = [(s) => `😬 ${s} la manda a las nubes.`, (s) => `💨 ${s} la estrella en el poste.`, (s) => `😩 ${s} se queda solo... y falla.`];

function weighted(list, wfn) {
  const ws = list.map(wfn); const tot = ws.reduce((a, b) => a + b, 0);
  let x = Math.random() * tot;
  for (let i = 0; i < list.length; i++) { x -= ws[i]; if (x <= 0) return list[i]; }
  return list[list.length - 1];
}

function buildSide(p) {
  const list = POSITIONS.map((x) => ({ ...p.team[x.key].data, pos: x.key }));
  const g = (k) => list.find((x) => x.pos === k).ovr;
  return {
    p, list, gk: list.find((x) => x.pos === 'POR'),
    s: { gk: g('POR'), def: avg(['LD', 'DFD', 'DFI', 'LI'].map(g)), mid: avg(['MCD', 'MC', 'MCO'].map(g)), att: avg(['EI', 'ED', 'DC'].map(g)) },
    mult: 1,
  };
}

function simulate(pA, pB, needWinner) {
  const T = [buildSide(pA), buildSide(pB)];
  const ev = []; const sc = [0, 0];
  const add = (min, team, type, text, extra = {}) => ev.push({ min, team, type, text, ...extra });
  const shooter = (t, excl) => weighted(T[t].list.filter((x) => x.name !== excl), (x) => SHOOT_W[x.pos] * Math.pow(x.ovr / 80, 3));
  const assister = (t, excl) => weighted(T[t].list.filter((x) => x.name !== excl), (x) => ASSIST_W[x.pos] * Math.pow(x.ovr / 80, 2));

  // Eventos especiales programados
  const specials = [];
  for (let t = 0; t < 2; t++) {
    for (const pl of T[t].list) {
      if (pl.tier === 'troll') {
        const r = Math.random();
        if (r < 0.25) specials.push({ min: rint(4, 88), t, kind: 'trollGoal', pl });
        else if (r < 0.55) specials.push({ min: rint(4, 88), t, kind: 'trollFunny', pl });
        else if (r < 0.62 && pl.pos !== 'POR') specials.push({ min: rint(4, 88), t, kind: 'trollHero', pl });
      }
      if (pl.tier === 'legend' && Math.random() < 0.2) specials.push({ min: rint(6, 86), t, kind: 'magic', pl });
    }
  }
  // Easter egg: Materazzi vs Zidane
  for (let t = 0; t < 2; t++) {
    const o = 1 - t;
    if (T[t].list.some((x) => x.name === 'Marco Materazzi') && T[o].list.some((x) => x.name === 'Zinedine Zidane') && Math.random() < 0.6) {
      specials.push({ min: rint(55, 85), t, kind: 'zizou' });
    }
  }

  let zizouOut = [false, false];
  for (let min = 1; min <= 93; min++) {
    for (const sp of specials.filter((x) => x.min === min)) {
      const t = sp.t, o = 1 - t;
      if (sp.kind === 'trollGoal') { sc[o]++; add(min, o, 'goal', TROLL_LINES[sp.pl.name] || `🤡 ${sp.pl.name} regala un gol al rival.`, { troll: true, scorer: 'Regalo de ' + sp.pl.name }); }
      if (sp.kind === 'trollFunny') add(min, t, 'troll', pick(TROLL_FUNNY)(sp.pl.name));
      if (sp.kind === 'trollHero') { sc[t]++; add(min, t, 'goal', TROLL_HERO(sp.pl.name), { scorer: sp.pl.name }); }
      if (sp.kind === 'magic') {
        if (sp.pl.pos === 'POR') {
          add(min, t, 'save', sp.pl.name === 'Iker Casillas' ? '✨ San Iker hace una parada imposible con el pie. ¡Milagro!' : `✨ ${sp.pl.name} hace una parada de leyenda. ¡Imposible!`);
          continue;
        }
        const attacker = ['DC', 'EI', 'ED', 'MCO'].includes(sp.pl.pos);
        const f = MAGIC_LINES[sp.pl.name] || (attacker
          ? () => `✨ ${sp.pl.name} saca un recurso de leyenda y marca un golazo para la historia.`
          : (a) => `✨ ${sp.pl.name} se saca una jugada de leyenda y deja a ${a} solo ante el portero. ¡Gol!`);
        const scorer = (SELF_SCORE_LEGENDS.includes(sp.pl.name) || (!MAGIC_LINES[sp.pl.name] && attacker)) ? sp.pl.name : shooter(t, sp.pl.name).name;
        sc[t]++; add(min, t, 'goal', f(scorer), { magic: true, scorer });
      }
      if (sp.kind === 'zizou' && !zizouOut[o]) {
        zizouOut[o] = true; T[o].mult *= 0.93;
        add(min, t, 'card', '🟥 Materazzi le susurra algo a Zidane... ¡CABEZAZO EN EL PECHO! Roja para Zizou. Déjà vu.');
      }
    }
    for (let t = 0; t < 2; t++) {
      const o = 1 - t;
      const A = T[t], D = T[o];
      const rate = 0.04 * Math.pow((A.s.mid * A.mult) / (D.s.mid * D.mult), 2.2);
      if (Math.random() < rate) {
        const sh = shooter(t);
        const pGoal = clamp(0.26 * Math.pow((A.s.att * A.mult) / ((D.s.def * D.mult + D.s.gk) / 2), 3) * Math.pow(sh.ovr / A.s.att, 1.5), 0.07, 0.6);
        if (Math.random() < pGoal) { const as = assister(t, sh.name); sc[t]++; add(min, t, 'goal', pick(GOAL_T)(sh.name, as.name), { scorer: sh.name }); }
        else if (Math.random() < 0.55) add(min, t, 'save', pick(SAVE_T)(D.gk.name, sh.name));
        else add(min, t, 'miss', pick(MISS_T)(sh.name));
      }
      // Momento PRIME: si vas perdiendo o empatando al final, aparecen los héroes
      if (min >= 75 && sc[t] <= sc[o]) {
        for (const pl of A.list.filter((x) => x.tier === 'prime' && x.pos !== 'POR')) {
          if (Math.random() < 0.003) { sc[t]++; add(min, t, 'goal', CLUTCH_LINES[pl.name] || `🏆 ${pl.name} saca su versión de campeón y marca.`, { clutch: true, scorer: pl.name }); }
        }
      }
    }
    if (min === 45) add(45, -1, 'info', `⏸️ Descanso: ${sc[0]} - ${sc[1]}`);
    if (Math.random() < 0.012) { const t = rint(0, 1); add(min, t, 'card', `🟨 Amarilla para ${pick(T[t].list.filter((x) => x.pos !== 'POR')).name}.`); }
  }
  add(93, -1, 'info', `🏁 Final: ${sc[0]} - ${sc[1]}`);

  let pens = null;
  if (needWinner && sc[0] === sc[1]) {
    const order = ['DC', 'ED', 'EI', 'MCO', 'MC', 'MCD', 'LI', 'LD', 'DFI', 'DFD', 'POR'];
    const seq = []; const ps = [0, 0]; const kicks = [0, 0];
    let done = false;
    for (let round = 0; round < 30 && !done; round++) {
      for (let t = 0; t < 2; t++) {
        const o = 1 - t;
        const tk = T[t].list.find((x) => x.pos === order[round % order.length]);
        const gk = T[o].gk;
        let p = 0.76 + (tk.ovr - gk.ovr) / 200;
        if (gk.name === 'Jerzy Dudek') p -= 0.1;
        if (tk.tier === 'troll') p -= 0.12;
        if (tk.tier === 'prime') p += 0.06;
        const ok = Math.random() < clamp(p, 0.3, 0.95);
        if (ok) ps[t]++;
        let text = ok ? `✅ ${tk.name} marca.` : (Math.random() < 0.5 ? `❌ ${gk.name} para el penalti de ${tk.name}.` : `❌ ${tk.name} la manda fuera.`);
        if (!ok && gk.name === 'Jerzy Dudek') text = `🍝 ¡Dudek baila con piernas de espagueti y ${tk.name} falla!`;
        kicks[t]++;
        seq.push({ team: t, ok, text, score: [...ps] });
        if (round < 5) {
          const rem = [5 - kicks[0], 5 - kicks[1]];
          if (ps[0] + rem[0] < ps[1] || ps[1] + rem[1] < ps[0]) { done = true; break; }
        }
      }
      if (round >= 4 && !done && ps[0] !== ps[1]) done = true;
    }
    pens = { seq, score: ps };
  }
  let winner = sc[0] > sc[1] ? 0 : sc[1] > sc[0] ? 1 : -1;
  if (pens) winner = pens.score[0] > pens.score[1] ? 0 : 1;
  ev.sort((a, b) => a.min - b.min);
  return {
    a: pA.id, b: pB.id, score: sc, pens, winner: winner === -1 ? null : [pA.id, pB.id][winner],
    stats: T.map((x) => ({ gk: Math.round(x.s.gk), def: Math.round(x.s.def), mid: Math.round(x.s.mid), att: Math.round(x.s.att), ovr: Math.round(avg(x.list.map((y) => y.ovr))) })),
    events: ev,
  };
}

function finishGame(r) {
  clearTimers(r);
  r.cur = null;
  const ps = r.players;
  const matches = [];
  if (ps.length === 2) matches.push(simulate(ps[0], ps[1], true));
  else for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) matches.push(simulate(ps[i], ps[j], false));
  const table = ps.map((p) => ({ id: p.id, pts: 0, gf: 0, gc: 0, w: 0, d: 0, l: 0 }));
  for (const m of matches) {
    const A = table.find((x) => x.id === m.a), B = table.find((x) => x.id === m.b);
    A.gf += m.score[0]; A.gc += m.score[1]; B.gf += m.score[1]; B.gc += m.score[0];
    if (m.winner === m.a) { A.pts += 3; A.w++; B.l++; } else if (m.winner === m.b) { B.pts += 3; B.w++; A.l++; } else { A.pts++; B.pts++; A.d++; B.d++; }
  }
  table.sort((x, y) => y.pts - x.pts || (y.gf - y.gc) - (x.gf - x.gc) || y.gf - x.gf);
  r.results = { matches, table, champion: table[0].id };
  r.phase = 'finished';
  log(r, '🏟️ ¡Subasta terminada! Que ruede el balón.');
  broadcast(r);
}

// ---------- API para la red ----------
function joinRoom(r, name, pid) {
  const existing = pid && r.players.find((p) => p.id === pid);
  if (existing) return { pid: existing.id };
  if (r.phase !== 'lobby') return { error: 'La subasta ya ha empezado' };
  if (r.players.length >= MAX_PLAYERS) return { error: 'Sala llena (máx. 4)' };
  const p = addPlayer(r, name);
  broadcast(r);
  return { pid: p.id };
}

function connectClient(r, pid, send) {
  const c = { pid, send };
  r.clients.add(c);
  broadcast(r);
  return () => { r.clients.delete(c); broadcast(r); if (r.phase === 'auction') checkAllPassed(r); };
}

function handleAction(r, pid, b) {
  const p = r.players.find((x) => x.id === pid);
  if (!p) return 'No estás en esta sala';
  const host = p.id === r.hostId;
  let err = null;
  switch (b.type) {
    case 'start':
      if (!host) err = 'Solo el anfitrión puede empezar';
      else if (r.phase !== 'lobby') err = 'Ya empezó';
      else if (r.players.length < 2) err = 'Hacen falta al menos 2 mánagers (o añade un bot)';
      else startGame(r);
      break;
    case 'addBot':
      if (!host || r.phase !== 'lobby') err = 'No permitido';
      else if (r.players.length >= MAX_PLAYERS) err = 'Sala llena';
      else { addPlayer(r, pick(['Bot Florentino', 'Bot Laporta', 'Bot Cerezo', 'Bot Gil', 'Bot Al-Khelaifi']), true); broadcast(r); }
      break;
    case 'kick':
      if (!host || r.phase !== 'lobby' || b.target === p.id) err = 'No permitido';
      else { r.players = r.players.filter((x) => x.id !== b.target); broadcast(r); }
      break;
    case 'bid': err = doBid(r, p, b.amount); break;
    case 'pass': err = doPass(r, p); break;
    case 'restart':
      if (!host) err = 'Solo el anfitrión';
      else { clearTimers(r); r.phase = 'lobby'; r.results = null; r.reveal = null; r.cur = null; r.posIdx = 0; for (const x of r.players) { x.team = {}; x.budget = BUDGET; } broadcast(r); }
      break;
    default: err = 'Acción desconocida';
  }
  return err;
}

function createRoom(code, hostName) {
  const r = newRoom(code);
  const p = addPlayer(r, hostName);
  return { room: r, pid: p.id };
}

const API = { createRoom, joinRoom, connectClient, handleAction, publicState, simulate };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
else root.SF_ENGINE = API;
})(typeof window !== 'undefined' ? window : globalThis);
