/* ============ online.js — cuánta gente está jugando ahora ============
 *
 * Sin Firebase: lo cuenta el Worker de Cloudflare (cloudflare/turn-worker.js,
 * ruta /online), en el plan gratis, que nunca cobra.
 *   - Cada pestaña avisa al abrir el juego y cada 20 min (si está a la vista)
 *     con un id de sesión al azar; el Worker devuelve, en la misma respuesta,
 *     cuántas sesiones han avisado en los últimos 25 min.
 *   - Sólo 1 de cada 10 pestañas (al azar) avisa; el número se multiplica por
 *     10. Las demás sólo lo LEEN al ver el menú (como mucho cada 30 min).
 *     El plan gratis de Workers da 100.000 llamadas al día y las comparten el
 *     contador y las claves TURN del cooperativo: si el contador las gastara,
 *     el cooperativo volvería a ir por Firebase (de pago).
 * Si el Worker no responde (o se acaba el cupo del día) no se enseña nada.
 * (El primer contador, del 11-10-2026, usaba la Realtime Database de Firebase
 * con la conexión siempre abierta y se quitó porque gastaba demasiado.)
 */
G.Online = (() => {
  const URL = 'https://turn.pokesurvivor.com/online';
  const EVERY = 20 * 60 * 1000, READ_EVERY = 30 * 60 * 1000, SAMPLE = 10;
  let count = null, el = null, timer = 0, lastPing = 0, lastRead = 0;

  const sid = (() => {
    const make = () => Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
    try {
      let s = sessionStorage.getItem('ps.sid');
      if (!s) { s = make(); sessionStorage.setItem('ps.sid', s); }
      return s;
    } catch (e) { return make(); }
  })();

  // ¿Esta pestaña es una de las que avisan? (1 de cada SAMPLE, fijo para la sesión)
  const counts = [...sid].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 1000003, 7) % SAMPLE === 0;
  const live = () => /^https?:$/.test(location.protocol) && !(G.FIREBASE_CONFIG || {}).emulator;

  /** Avisa (si le toca) o sólo lee. Sin sid válido el Worker no apunta nada. */
  async function call(add) {
    if (!live()) return;
    if (add) lastPing = Date.now(); else lastRead = Date.now();
    try {
      const r = await fetch(URL + '?s=1&sid=' + (add ? sid : 'x'), { method: 'POST' });
      if (r.ok) { const j = await r.json(); if (typeof j.n === 'number') count = j.n * SAMPLE; }
    } catch (e) { /* sin conexión o sin cupo: no se enseña */ }
    render();
  }
  const ping = () => (counts ? call(true) : null);

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
    const n = Math.max(1, Math.round(count / 10) * 10 || count);   // aproximado (muestra 1 de cada 10)
    const en = G.I18n && G.I18n.lang === 'en';
    const num = n.toLocaleString(en ? 'en-US' : 'es-ES');
    el.querySelector('span').textContent = en ? `${num} playing now` : `${num} jugando ahora`;
    el.classList.remove('hidden');
  }

  /** El menú está a la vista: enseña el número (las que no avisan lo leen, como mucho cada 30 min). */
  function show(target) {
    el = target; start(); render();
    if (!counts && Date.now() - lastRead > READ_EVERY) call(false);
  }

  return { start, show, get count() { return count; } };
})();
