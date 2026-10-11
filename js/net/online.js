/* ============ online.js — cuánta gente está jugando ahora ============
 *
 * Sin Firebase: lo cuenta el Worker de Cloudflare (cloudflare/turn-worker.js,
 * ruta /online), en el plan gratis, que nunca cobra.
 *   - Cada pestaña avisa al abrir el juego y cada 20 min (si está a la vista)
 *     con un id de sesión al azar; el Worker devuelve, en la misma respuesta,
 *     cuántas sesiones han avisado en los últimos 25 min.
 *   - Unas 3 llamadas por jugador y hora: dentro del cupo gratis diario.
 * Si el Worker no responde (o se acaba el cupo del día) no se enseña nada.
 * (El primer contador, del 11-10-2026, usaba la Realtime Database de Firebase
 * con la conexión siempre abierta y se quitó porque gastaba demasiado.)
 */
G.Online = (() => {
  const URL = 'https://turn.pokesurvivor.com/online';
  const EVERY = 20 * 60 * 1000;
  let count = null, el = null, timer = 0, lastPing = 0;

  const sid = (() => {
    const make = () => Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
    try {
      let s = sessionStorage.getItem('ps.sid');
      if (!s) { s = make(); sessionStorage.setItem('ps.sid', s); }
      return s;
    } catch (e) { return make(); }
  })();

  async function ping() {
    // Las pruebas (emulador) y el juego abierto como archivo no cuentan.
    if (!/^https?:$/.test(location.protocol) || (G.FIREBASE_CONFIG || {}).emulator) return;
    lastPing = Date.now();
    try {
      const r = await fetch(URL + '?sid=' + sid, { method: 'POST' });
      if (r.ok) { const j = await r.json(); if (typeof j.n === 'number') count = j.n; }
    } catch (e) { /* sin conexión o sin cupo: no se enseña */ }
    render();
  }

  function start() {
    if (timer) return;
    ping();
    timer = setInterval(() => { if (!document.hidden) ping(); }, EVERY);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && Date.now() - lastPing > EVERY) ping();
    });
  }

  function render() {
    if (!el) return;
    if (count == null) { el.classList.add('hidden'); return; }
    const n = Math.max(1, count);                 // por lo menos tú
    const en = G.I18n && G.I18n.lang === 'en';
    const num = n.toLocaleString(en ? 'en-US' : 'es-ES');
    el.querySelector('span').textContent = en ? `${num} playing now` : `${num} jugando ahora`;
    el.classList.remove('hidden');
  }

  /** El menú está a la vista: enseña el último número (no hace llamadas de más). */
  function show(target) { el = target; start(); render(); }

  return { start, show, get count() { return count; } };
})();
