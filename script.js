(function () {
  var $ = function (id) { return document.getElementById(id) };
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* ---------- Login logic ---------- */
  var users = { ustoz: { pass: "1234", role: "teacher", name: "Oʻqituvchi" }, oquvchi: { pass: "1234", role: "student", name: "Oʻquvchi" } };
  var role = "teacher", homework = [{ t: "Matematika: 45-bet, 3-mashq", d: "Bugun berildi" }];
  function setRole(r) {
    role = r;
    $("rT").setAttribute("aria-pressed", r === "teacher");
    $("rS").setAttribute("aria-pressed", r === "student");
    $("ttl").textContent = r === "teacher" ? "Oʻqituvchi sifatida kirish" : "Oʻquvchi sifatida kirish";
    $("demo").innerHTML = "Sinov uchun: <code>" + (r === "teacher" ? "ustoz" : "oquvchi") + "</code> / <code>1234</code>";
    $("m").textContent = "";
  }
  $("rT").onclick = function () { setRole("teacher") };
  $("rS").onclick = function () { setRole("student") };
  setRole("teacher");
  $("t").onclick = function () { var p = $("p"), s = p.type === "password"; p.type = s ? "text" : "password"; this.textContent = s ? "Yashirish" : "Koʻrsatish" };
  function render() {
    var ul = $("hwList"); ul.innerHTML = "";
    if (!homework.length) { var li = document.createElement("li"); li.textContent = "Hozircha uy ishi yoʻq."; ul.appendChild(li); return }
    homework.slice().reverse().forEach(function (h) { var li = document.createElement("li"); li.textContent = h.t; var s = document.createElement("small"); s.textContent = h.d; li.appendChild(s); ul.appendChild(li) });
  }
  $("f").addEventListener("submit", function (e) {
    e.preventDefault();
    var u = $("u").value.trim().toLowerCase(), p = $("p").value, m = $("m");
    if (!u || !p) { m.textContent = "Login va parolni kiriting."; return }
    var a = users[u];
    if (!a || a.pass !== p) { m.textContent = "Login yoki parol notoʻgʻri. Qayta urinib koʻring."; return }
    if (a.role !== role) { m.textContent = "Bu login " + (a.role === "teacher" ? "oʻqituvchi" : "oʻquvchi") + " uchun. Yuqoridan rolni almashtiring."; return }
    m.textContent = "";
    $("loginCard").style.display = "none"; $("panel").style.display = "block";
    $("hello").textContent = "Xush kelibsiz, " + a.name + "!";
    var t = a.role === "teacher";
    $("role").textContent = t ? "Sinfingizga yangi uy ishi bering." : "Sizga berilgan uy ishlari:";
    $("teacherBox").style.display = t ? "block" : "none";
    render();
  });
  $("add").onclick = function () { var v = $("hwText").value.trim(); if (!v) return; homework.push({ t: v, d: "Hozir berildi" }); $("hwText").value = ""; render() };
  $("out").onclick = function () { $("panel").style.display = "none"; $("loginCard").style.display = "block"; $("f").reset() };

  /* ---------- Scroll reveal ---------- */
  var els = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { var t = e.target; t.classList.add("in"); io.unobserve(t); setTimeout(function () { t.classList.add("done") }, 1200) } }) }, { threshold: .15 });
    els.forEach(function (el) { io.observe(el) });
  } else { els.forEach(function (el) { el.classList.add("in", "done") }) }

  /* ---------- 3D tilt on cards ---------- */
  if (!reduce) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        if (e.pointerType !== "mouse") return;
        var b = el.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
        el.style.transform = "perspective(900px) rotateY(" + (x * 12) + "deg) rotateX(" + (-y * 12) + "deg) translateZ(8px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = "" });
    });
  }

  /* ---------- Three.js scene ---------- */
  if (typeof THREE === "undefined") return;
  var cv = $("gl"), r;
  try { r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }) } catch (e) { return }
  r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  var sc = new THREE.Scene(); sc.fog = new THREE.Fog(0x10162a, 9, 24);
  var cam = new THREE.PerspectiveCamera(50, 1, .1, 60);
  sc.add(new THREE.AmbientLight(0xffffff, .7));
  var dl = new THREE.DirectionalLight(0xffffff, .9); dl.position.set(3, 5, 6); sc.add(dl);
  var pl = new THREE.PointLight(0x7f9bff, 1.3, 30); pl.position.set(-4, 0, 4); sc.add(pl);

  var cols = [0x2347d9, 0xff6b4a, 0xffd84d, 0x2fb37c, 0x8a5cf6];
  function mat(c, rough) { return new THREE.MeshStandardMaterial({ color: c, roughness: rough == null ? .55 : rough }) }
  function book() {
    var g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, .3), mat(cols[Math.random() * 5 | 0])));
    var p = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.5, .26), mat(0xf5f1e6, .9)); p.position.x = .08; g.add(p);
    return g;
  }
  function pencil() {
    var g = new THREE.Group();
    var body = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 1.5, 6), mat(0xffd84d));
    var wood = new THREE.Mesh(new THREE.ConeGeometry(.07, .3, 6), mat(0xe8c9a0)); wood.position.y = .9;
    var lead = new THREE.Mesh(new THREE.ConeGeometry(.025, .1, 6), mat(0x222a44)); lead.position.y = 1.1;
    var er = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .12, 6), mat(0xff7a9c)); er.position.y = -.81;
    g.add(body, wood, lead, er); return g;
  }
  function ring() { return new THREE.Mesh(new THREE.TorusGeometry(.5, .06, 12, 36), mat(cols[Math.random() * 5 | 0], .35)) }
  function gem() { return new THREE.Mesh(new THREE.IcosahedronGeometry(.4, 0), mat(cols[Math.random() * 5 | 0], .3)) }

  var H = 24, N = matchMedia("(max-width:820px)").matches ? 16 : 30, items = [];
  for (var i = 0; i < N; i++) {
    var k = i % 5, g = k < 2 ? book() : k < 4 ? pencil() : (i % 2 ? ring() : gem());
    var wide = Math.random() < .5;
    g.position.set((Math.random() - .5) * 14, 2 - Math.random() * H, -Math.random() * 8 + 1);
    g.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    var s = .8 + Math.random() * .7; g.userData = { s: s, sc: s, spin: new THREE.Vector3((Math.random() - .5) * .4, (Math.random() - .5) * .4, (Math.random() - .5) * .3), boost: 0, by: g.position.y, ph: Math.random() * 6, jump: 0 };
    g.scale.setScalar(0.001);
    g.traverse(function (o) { o.userData.root = g });
    sc.add(g); items.push(g);
  }

  var mx = 0, my = 0, tx = 0, ty = 0, cur = 0, mouse = new THREE.Vector2(9, 9), ray = new THREE.Raycaster(), hover = null;
  addEventListener("pointermove", function (e) {
    tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5;
    mouse.set(tx * 2, -ty * 2);
  });
  addEventListener("click", function (e) {
    if (e.target.closest("button,input,.card,.info .wrap>*,footer")) return;
    if (hover) { hover.userData.jump = 1; hover.userData.boost = 2 }
  });
  function size() { r.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix() }
  addEventListener("resize", size); size();

  var t0 = performance.now(), last = t0;
  function ease(x) { return 1 - Math.pow(1 - x, 3) }
  function loop(now) {
    requestAnimationFrame(loop);
    var dt = Math.min((now - last) / 1000, .05); last = now;
    var t = (now - t0) / 1000, intro = reduce ? 1 : ease(Math.min(t / 2.4, 1));
    var max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    cur += (scrollY / max - cur) * .07;
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    var camY = -cur * (H - 3);
    cam.position.set(mx * 2.2, camY - my * 1.2, 7 + (1 - intro) * 14);
    cam.rotation.z = (1 - intro) * .5;
    cam.lookAt(mx * .6, camY - my * .3, 0);
    if (!reduce) {
      ray.setFromCamera(mouse, cam);
      var hit = ray.intersectObjects(items, true);
      hover = hit.length ? hit[0].object.userData.root : null;
      cv.style.cursor = ""; document.body.style.cursor = hover ? "pointer" : "";
    }
    items.forEach(function (g) {
      var u = g.userData;
      if (g === hover) u.boost = Math.max(u.boost, 1);
      u.boost *= .96;
      var sp = 1 + u.boost * 5;
      g.rotation.x += u.spin.x * dt * sp; g.rotation.y += u.spin.y * dt * sp; g.rotation.z += u.spin.z * dt * sp;
      u.jump *= .94;
      g.position.y = u.by + Math.sin(t * .7 + u.ph) * .25 + u.jump * 1.2;
      var target = u.s * intro * (g === hover ? 1.25 : 1) * (1 + u.jump * .3);
      u.sc += (target - u.sc) * .12; g.scale.setScalar(Math.max(u.sc, .001));
    });
    pl.position.x = -4 + mx * 10;
    r.render(sc, cam);
  }
  requestAnimationFrame(loop);
})();
