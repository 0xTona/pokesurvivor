/* ============ signups.js — tope de cuentas del mes ============
 *
 * Firebase da 50.000 usuarios con cuenta activos al mes gratis; a partir de
 * ahí cobra cada uno. El Worker de Cloudflare (cloudflare/turn-worker.js, /mau)
 * lleva la cuenta del mes:
 *   - report(): la primera vez que una cuenta entra en el mes, avisa (con su
 *     token de Firebase; una vez al mes por cuenta y navegador).
 *   - check(): ¿quedan plazas para cuentas nuevas? Si no (48.000), la pantalla
 *     de inicio quita "Crear cuenta" y propone jugar como invitado hasta el
 *     mes siguiente. Quien ya tiene cuenta entra siempre.
 * Si el Worker no responde, no se bloquea nada.
 */
G.Signups = (() => {
  const URL = 'https://turn.pokesurvivor.com/mau';
  const CACHE = 10 * 60 * 1000;
  let open = true, checkedAt = 0;

  const month = () => new Date(Date.now() - 8 * 3600e3).toISOString().slice(0, 7);
  const enabled = () => /^https?:$/.test(location.protocol) && !(G.FIREBASE_CONFIG || {}).emulator;

  /** ¿Se pueden crear cuentas nuevas este mes? */
  async function check() {
    if (!enabled()) return true;
    if (Date.now() - checkedAt < CACHE) return open;
    try {
      const j = await (await fetch(URL)).json();
      if (typeof j.open === 'boolean') { open = j.open; checkedAt = Date.now(); }
    } catch (e) { /* sin respuesta: no se bloquea */ }
    return open;
  }

  /** Esta cuenta ha entrado: se apunta una vez al mes. */
  async function report(user) {
    if (!enabled() || !user) return;
    const key = 'ps.mau.' + user.uid + '.' + month();
    try { if (localStorage.getItem(key)) return; } catch (e) { /* nada */ }
    try {
      const tok = await user.getIdToken();
      const r = await fetch(URL, { method: 'POST', headers: { Authorization: 'Bearer ' + tok } });
      if (r.ok) {
        const j = await r.json();
        if (typeof j.open === 'boolean') { open = j.open; checkedAt = Date.now(); }
        try { localStorage.setItem(key, '1'); } catch (e) { /* nada */ }
      }
    } catch (e) { /* se reintenta la próxima vez */ }
  }

  /** Nombre del mes siguiente (para el aviso). */
  function nextMonthName() {
    const d = new Date(); d.setMonth(d.getMonth() + 1, 1);
    const en = G.I18n && G.I18n.lang === 'en';
    return d.toLocaleString(en ? 'en-US' : 'es-ES', { month: 'long' });
  }

  return { check, report, nextMonthName, get closed() { return !open; } };
})();
