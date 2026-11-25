// Subasta Futbolera - motor del juego (funciona en el navegador del anfitrión y en Node para pruebas)
(function (root) {
const DATA = (typeof module !== 'undefined' && module.exports) ? require('./players.js') : root.SF_DATA;
const { POSITIONS, PLAYERS, PRICE_RANGES } = DATA;
// Temporizadores: en el navegador se usan unos que no se duermen con la pestaña en segundo plano
const setT = (root.SF_setTimeout && root.SF_setTimeout.bind(root)) || setTimeout;
const clearT = (x) => ((root.SF_clearTimeout || clearTimeout)(x));
const PRICES = [20, 50, 80, 110, 140]; // precios de salida posibles
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
    cur: r.cur ? { id: r.cur.id, pos: r.cur.data.pos, nat: r.cur.data.nat, attr: r.cur.data.attr, base: r.cur.base, num: r.lots[curPos(r)].indexOf(r.cur) + 1 } : null,
    highBid: r.highBid, highBidder: r.highBidder, deadline: r.deadline, passes: [...r.passes],
    reveal: r.reveal, log: r.log.slice(-25), results: r.results,
    votes: r.votes || null, tally: (r.phase === 'voting' && r.votes) ? tallyVotes(r) : null,
  };
}

function broadcast(r) {
  r.touched = Date.now();
  for (const c of r.clients) {
    try { c.send(publicState(r, c.pid)); } catch (e) { /* ignorar */ }
  }
}

function clearTimers(r) {
  if (r.timer) clearT(r.timer);
  r.timer = null;
  r.botTimers.forEach(clearT);
  r.botTimers = [];
}

// ---------- subasta ----------
function startGame(r) {
  r.posIdx = 0; r.results = null; r.reveal = null; r.log = [];
  for (const p of r.players) { p.budget = BUDGET; p.team = {}; }
  for (const pos of POSITIONS) {
    // De los jugadores de la posición, sale uno al azar de cada tipo (troll, leyenda, normal, bueno, prime)
    const five = ['troll', 'legend', 'normal', 'good', 'prime'].map((t) => pick(PLAYERS[pos.key].filter((d) => d.tier === t)));
    // Precios de salida: en cada posición están siempre los 5 valores, repartidos al azar
    // (así siempre hay uno de 20M para quien vaya justo de dinero)
    const prices = shuffle(PRICES);
    r.lots[pos.key] = shuffle(five).map((d, i) => (
      { id: uid(), data: { ...d, pos: pos.key }, base: prices[i], status: 'pending', owner: null, price: 0 }
    ));
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
    r.timer = setT(() => { r.phase = 'auction'; r.posIdx++; nextLot(r); }, REVEAL_TIME + 1000);
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
  if (r.timer) clearT(r.timer);
  r.timer = setT(() => endLot(r), Math.max(0, r.deadline - Date.now()));
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
  r.timer = setT(() => nextLot(r), REVEAL_TIME);
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
  r.botTimers.forEach(clearT); r.botTimers = [];
  const lotId = r.cur && r.cur.id;
  for (const b of r.players.filter((p) => p.bot)) {
    r.botTimers.push(setT(() => {
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

// ---------- final: cara a cara por posición, votan los mánagers ----------
function finishGame(r) {
  clearTimers(r);
  r.cur = null;
  r.votes = {};
  for (const pos of POSITIONS) r.votes[pos.key] = {};
  // Los bots votan al jugador con más media
  for (const bot of r.players.filter((p) => p.bot)) {
    for (const pos of POSITIONS) {
      const best = r.players.slice().sort((x, y) => (y.team[pos.key].data.ovr - x.team[pos.key].data.ovr) || (Math.random() - 0.5))[0];
      r.votes[pos.key][bot.id] = best.id;
    }
  }
  r.results = null;
  r.phase = 'voting';
  log(r, '🗳️ ¡Subasta terminada! Ahora votad quién tiene mejor jugador en cada posición.');
  broadcast(r);
}

function tallyVotes(r) {
  const byPos = {};
  const wins = Object.fromEntries(r.players.map((p) => [p.id, 0]));
  for (const pos of POSITIONS) {
    const count = Object.fromEntries(r.players.map((p) => [p.id, 0]));
    for (const target of Object.values(r.votes[pos.key] || {})) if (target in count) count[target]++;
    const max = Math.max(...Object.values(count));
    const top = Object.keys(count).filter((id) => count[id] === max);
    const winner = max > 0 && top.length === 1 ? top[0] : null;
    if (winner) wins[winner]++;
    byPos[pos.key] = { count, winner };
  }
  const maxW = Math.max(...Object.values(wins));
  const leaders = Object.keys(wins).filter((id) => wins[id] === maxW);
  return { byPos, wins, champion: leaders.length === 1 ? leaders[0] : null };
}

function allVoted(r) {
  return r.players.filter((p) => !p.bot).every((p) => POSITIONS.every((pos) => r.votes[pos.key][p.id]));
}

function closeVoting(r) {
  r.results = tallyVotes(r);
  r.phase = 'finished';
  const ch = r.results.champion && r.players.find((p) => p.id === r.results.champion);
  log(r, ch ? `🏆 ¡${ch.name} gana por votación!` : '🤝 ¡Empate en la votación!');
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
    case 'vote':
      if (r.phase !== 'voting') err = 'No es momento de votar';
      else if (!r.votes[b.pos]) err = 'Posición no válida';
      else if (!r.players.some((x) => x.id === b.target)) err = 'Equipo no válido';
      else { r.votes[b.pos][p.id] = b.target; if (allVoted(r)) closeVoting(r); else broadcast(r); }
      break;
    case 'closeVoting':
      if (!host) err = 'Solo el anfitrión puede cerrar la votación';
      else if (r.phase !== 'voting') err = 'No hay votación abierta';
      else closeVoting(r);
      break;
    case 'restart':
      if (!host) err = 'Solo el anfitrión';
      else { clearTimers(r); r.phase = 'lobby'; r.results = null; r.votes = null; r.reveal = null; r.cur = null; r.posIdx = 0; for (const x of r.players) { x.team = {}; x.budget = BUDGET; } broadcast(r); }
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

const API = { createRoom, joinRoom, connectClient, handleAction, publicState };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
else root.SF_ENGINE = API;
})(typeof window !== 'undefined' ? window : globalThis);
