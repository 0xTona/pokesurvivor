# Investigation Report: Co-op Mode Disconnection Bug ("Lost connection")

## 1. Problem Description
In co-op mode, the player who was invited (the guest/peer) consistently gets disconnected with the error message **"Lost connection"** ("Se ha perdido la conexión con el anfitrión.") after a short period of gameplay (typically between 1 and 3 minutes).

---

## 2. Root Cause Analysis

### A. The Disconnection Trigger
In `js/data/lang-en.js` (line 191) and `js/net/coop.js` (lines 232–236):
```javascript
G.Net.onPeer((u, mode) => {
  if (!active || (mode !== 'closed' && mode !== 'failed')) return;
  if (host) mateGone(u);
  else if (u === hostUid) { const cb = api.lost; end(); if (cb) cb('Se ha perdido la conexión con el anfitrión.'); }
});
```
When `G.Net` reports `mode === 'closed'` or `mode === 'failed'` for the `hostUid`, the guest terminates the session (`end()`) and triggers `api.lost('Se ha perdido la conexión con el anfitrión.')`, displaying the toast "Lost connection to the host" ("Se ha perdido la conexión con el anfitrión") and ending the run.

### B. What causes `mode` to switch to `failed` or `closed` after 1–3 minutes?

#### Root Cause 1: Premature RTDB Disconnection & Auto-deletion of Room via `onDisconnect()`
In `js/net/social.js`:
1. When entering a room, `watchRoomDisconnect()` sets up an `onDisconnect` hook on Firebase Realtime Database:
   ```javascript
   function watchRoomDisconnect() {
     if (!room) return;
     const ref = room.isHost ? fb.rtdb.ref('rooms/' + room.id) : fb.rtdb.ref('rooms/' + room.id + '/m/' + uid);
     ref.onDisconnect().remove();
   }
   ```
2. When co-op begins, `Game.startRun` calls:
   ```javascript
   G.Social.setPlaying(true);
   ```
   In `social.js`:
   ```javascript
   function setPlaying(p) { if (playing !== !!p) { playing = !!p; writeStatus(); } }
   ```
   Notice that `setPlaying` only writes to Firestore (`pres` collection). It does **not** keep the Firebase RTDB connection alive.
3. Firebase Realtime Database Web SDK automatically disconnects or puts idle websocket connections to sleep when there is no RTDB traffic, or when the connection experiences a brief keepalive timeout / background throttle (after ~60–120s of WebRTC data channel usage where zero RTDB messages are being pushed).
4. When RTDB's client connection drops or reconnects, or if Firebase server considers the client socket dropped:
   - The host's registered `onDisconnect().remove()` on `rooms/{id}` triggers on the Firebase server!
   - The room node `rooms/{id}` is deleted from Firebase RTDB.
5. In `social.js`:
   ```javascript
   const href = fb.rtdb.ref('rooms/' + id + '/host');
   href.on('value', s => { if (room && room.id === id && !s.val()) closedRoom(); }, () => closedRoom());
   ```
   Both players are still listening to `rooms/{id}/host`! When `rooms/{id}` is removed by `onDisconnect()`, `s.val()` evaluates to `null`.
   This triggers `closedRoom()`:
   ```javascript
   function closedRoom() {
     if (!room) return;
     detachRoom();
     room = null;
     retractInvites();
     writeStatus();
     rtOff();
     emit('room-closed');
   }
   ```
6. In `social-ui.js`, there is a listener on `G.Social.on`:
   ```javascript
   G.Social.on(what => {
     const room = G.Social.room;
     if (room) {
       G.Net.open(room.id, room.isHost, room.host);
       G.Net.syncMembers(room.members.map(m => m.uid));
     } else if (G.Net.open_) G.Net.close();
     if (what === 'room-closed') {
       G.UI.toast('La sala se ha cerrado', 2600);
       if (G.UI.isOpen('scr-lobby')) G.MenuUI.open();
     }
     if (G.UI.isOpen('scr-lobby')) render();
   });
   ```
7. When `room` becomes `null`, `G.Net.close()` is called:
   ```javascript
   function close() {
     for (const u of [...peers.keys()]) drop(u);
     if (qref) { qref.off(); qref = null; }
     roomId = null; isHost = false; hostUid = null;
   }
   ```
   And `drop(u)` executes:
   ```javascript
   function drop(u, silent) {
     const p = peers.get(u);
     if (!p) return;
     clearTimeout(p.timer);
     p.mode = 'closed';
     try { if (p.dc) p.dc.close(); } catch (e) { /* nada */ }
     try { if (p.pc) p.pc.close(); } catch (e) { /* nada */ }
     peers.delete(u);
     if (!silent) emitPeer(u);
   }
   ```
   Calling `drop(hostUid)` sets `p.mode = 'closed'` and emits `emitPeer(hostUid)`!
8. `coop.js` catches `mode === 'closed'` on the guest side and immediately displays:
   `"Se ha perdido la conexión con el anfitrión."` ("Lost connection to the host.")

#### Root Cause 2: Failure to Cancel `onDisconnect()` during Match Execution
The `onDisconnect().remove()` is intended to clean up abandoned lobby rooms if a player closes their tab while waiting in the lobby.
However, once the co-op run has started (`startCoop`), the game is actively running peer-to-peer via WebRTC.
Because `onDisconnect().cancel()` is only called in `leaveRoom()`, any transient socket reset with Firebase RTDB will trigger server-side room deletion, cascading into `closedRoom()`, `G.Net.close()`, closing the active RTCDataChannel and aborting the game!

#### Root Cause 3: WebRTC DataChannel Glitches & `ALLOW_RELAY = false`
In `js/net/net.js`:
```javascript
const ALLOW_RELAY = false;
...
dc.onclose = () => { if (p.mode === 'direct') { p.mode = 'connecting'; useRelay(u); } };
```
In `useRelay`:
```javascript
function useRelay(u) {
  const p = peers.get(u);
  if (!p || p.mode === 'direct' || p.mode === 'closed' || p.mode === 'failed') return;
  if (ALLOW_RELAY) { p.mode = 'relay'; emitPeer(u); return; }
  // Sin relé: no se puede jugar con esa persona por ahora. El anfitrión reintenta.
  clearTimeout(p.timer);
  p.mode = 'failed';
  try { if (p.pc) p.pc.close(); } catch (e) { /* nada */ }
  emitPeer(u);
  ...
}
```
If `ALLOW_RELAY` is false and the data channel encounters any momentary ICE restart, NAT rebinding, or temporary packet flap:
1. `dc.onclose` sets `mode = 'connecting'` and calls `useRelay(u)`.
2. Since `ALLOW_RELAY` is false, it instantly sets `p.mode = 'failed'` and kills `p.pc`.
3. Guest's `coop.js` immediately reacts to `failed` and disconnects with "Lost connection to the host".

#### Root Cause 4: Background Throttling / Tab Inactivity
In `js/net/coop.js`:
```javascript
if (!stalled && performance.now() - lastHostAt > STALL_MS) { stalled = true; updateAway(); }
```
When either player shifts focus or the host's browser deprioritizes background WebRTC timers, `STALL_MS` (2500ms) pauses the game. If the RTDB connection drops during this time, the cascading room tear-down happens.

---

## 3. Proposed Fix

### Fix 1: Disarm `onDisconnect` on Room when Game Starts
Once `startCoop` is invoked and the match starts:
1. In `js/net/social.js`, cancel `onDisconnect` on the room ref and member ref so RTDB socket timeouts while playing peer-to-peer do not wipe out the room node on Firebase.
2. In `social.js`, do not trigger `closedRoom()` / `G.Net.close()` mid-game if `G.Coop.active` is true. Even if the room metadata in RTDB disappears or disconnects, the ongoing WebRTC session (`G.Net`) must remain active.

### Fix 2: Shield `G.Net` from Room Destruction while Co-op Game is Active
In `js/ui/social-ui.js`:
```javascript
G.Social.on(what => {
  const room = G.Social.room;
  if (room) {
    G.Net.open(room.id, room.isHost, room.host);
    G.Net.syncMembers(room.members.map(m => m.uid));
  } else if (G.Net.open_ && !G.Coop.active) {
    G.Net.close();
  }
  ...
});
```
When `G.Coop.active` is true, never allow `G.Net.close()` to be called from a lobby/social UI room event.

### Fix 3: Keep RTDB Alive During Co-op if Signaling or Room Monitoring is Required
In `js/net/social.js`, ensure `rtOn()` remains active or periodically refreshed if RTDB presence is required, OR cleanly detach RTDB listeners during the co-op run so background RTDB idle timeouts never emit false `room-closed` events.

### Fix 4: Resilient ICE Reconnection before Declaring `failed`
In `js/net/net.js`, allow reconnection attempts on data channel closure before abruptly flagging the peer as `failed` and closing the `RTCPeerConnection`:
Instead of immediately transitioning to `failed` on transient data channel closure during active play, allow a grace period (e.g. 5–8 seconds) for ICE reconnection/restart.

---

## 4. Implementation Plan
1. Edit `js/net/social.js`:
   - Add `disarmRoomDisconnect()` when starting a co-op match.
   - Ignore `closedRoom()` callbacks while `G.Coop.active` is true.
2. Edit `js/ui/social-ui.js`:
   - Guard `G.Net.close()` so it is not called while `G.Coop.active` is true.
3. Edit `js/net/net.js`:
   - Prevent immediate termination on transient data channel interruptions when playing.
4. Verify build with `node tools/build.js`.
