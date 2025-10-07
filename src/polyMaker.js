(() => {
    const MIN = 3;
    const MAX = 60;
    let n = 3;


    const countEl = document.getElementById('count');
    const plusBtn = document.getElementById('plus');
    const minusBtn = document.getElementById('minus');
    const svg = document.getElementById('svg');
    const gPoly = document.getElementById('layer-poly');
    const gSpokes = document.getElementById('layer-spokes');
    const gVerts = document.getElementById('layer-verts');

    const BOX = 500;
    const cx = 250, cy = 250;
    function radius() {

        const rect = svg.getBoundingClientRect();
        return Math.min(rect.width, rect.height) * 0.38;
    }

    function pointsFor(n) {
        const r = radius();
        const pts = [];
        for (let i = 0; i < n; i++) {
            const t = (i / n) * Math.PI * 2 - Math.PI / 2;
            const x = cx + r * Math.cos(t);
            const y = cy + r * Math.sin(t);
            pts.push([x, y]);
        }
        return pts;
    }

    function render() {
        countEl.textContent = n;


        const pts = pointsFor(n);


        gPoly.innerHTML = '';
        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('class', 'poly');
        poly.setAttribute('points', pts.map(p => p.join(',')).join(' '));
        gPoly.appendChild(poly);


        gSpokes.innerHTML = '';
        pts.forEach(([x, y]) => {
            const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            l.setAttribute('x1', cx); l.setAttribute('y1', cy);
            l.setAttribute('x2', x); l.setAttribute('y2', y);
            l.setAttribute('class', 'spoke');
            gSpokes.appendChild(l);
        });


        const prev = Array.from(gVerts.querySelectorAll('circle'));
        gVerts.innerHTML = '';
        pts.forEach(([x, y], i) => {
            const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            c.setAttribute('cx', x); c.setAttribute('cy', y);
            c.setAttribute('class', 'vert');

            if (i >= prev.length) c.classList.add('pop');
            gVerts.appendChild(c);
            if (i >= prev.length) setTimeout(() => c.classList.remove('pop'), 140);
        });
    }

    function change(delta) {
        const next = Math.max(MIN, Math.min(MAX, n + delta));
        if (next === n) return;
        n = next;
        render();
    }

    plusBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); change(+1); });
    minusBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); change(-1); });


    window.addEventListener('resize', render);
    window.addEventListener('orientationchange', render);


    render();
})();