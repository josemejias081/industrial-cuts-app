const TIPOS_CHAPA = {
    '3000x1500': { ancho: 3000, alto: 1500, etiqueta: '3000 x 1500 mm' },
    '2000x1000': { ancho: 2000, alto: 1000, etiqueta: '2000 x 1000 mm' }
};
let tipoChapa = localStorage.getItem('wf_tipo_chapa') || '3000x1500';
let CH_W = TIPOS_CHAPA[tipoChapa].ancho;
let CH_H = TIPOS_CHAPA[tipoChapa].alto;
let espesorChapa = localStorage.getItem('wf_espesor_chapa') || '1.5';
const CANVAS_WIDTH = 732;
let pedido = JSON.parse(localStorage.getItem('wf_biz_2d')) || [];
let resultado = [];

function formatoEspesor() { return espesorChapa.replace('.', ','); }

document.getElementById('tipoChapa').value = tipoChapa;
document.getElementById('espesorChapa').value = espesorChapa;

window.onload = () => { renderLista(); if (pedido.length > 0) calcular2D(); };

function agregarPieza() {
    const w = parseInt(document.getElementById('anchoP').value);
    const h = parseInt(document.getElementById('altoP').value);
    const c = parseInt(document.getElementById('cantP').value);
    const n = document.getElementById('nombreP').value || "Pieza";
    if (w && h && c) {
        pedido.push({ w, h, c, n, id: Date.now() });
        save();
        renderLista();
        calcular2D();
        document.getElementById('nombreP').value = '';
        document.getElementById('anchoP').value = '';
        document.getElementById('altoP').value = '';
        document.getElementById('cantP').value = '1';
    }
}

function save() { localStorage.setItem('wf_biz_2d', JSON.stringify(pedido)); }
function eliminar(id) { pedido = pedido.filter(p => p.id !== id); save(); location.reload(); }
function limpiarTodo() { localStorage.clear(); location.reload(); }

function cambiarTipoChapa() {
    tipoChapa = document.getElementById('tipoChapa').value;
    CH_W = TIPOS_CHAPA[tipoChapa].ancho;
    CH_H = TIPOS_CHAPA[tipoChapa].alto;
    localStorage.setItem('wf_tipo_chapa', tipoChapa);
    if (pedido.length > 0) calcular2D();
}

function cambiarEspesorChapa(nuevoEspesor) {
    espesorChapa = nuevoEspesor;
    localStorage.setItem('wf_espesor_chapa', espesorChapa);
    document.querySelectorAll('.espesor-label').forEach(label => {
        label.textContent = `${formatoEspesor()} mm`;
    });
}

function escalaPlano() {
    return CANVAS_WIDTH / CH_W;
}

function aplicarEscalaPlano(canvas, escala) {
    canvas.querySelectorAll('.pieza-item').forEach(pieza => {
        pieza.style.left = `${Number(pieza.dataset.x) * escala}px`;
        pieza.style.top = `${Number(pieza.dataset.y) * escala}px`;
        pieza.style.width = `${Number(pieza.dataset.fw) * escala}px`;
        pieza.style.height = `${Number(pieza.dataset.fh) * escala}px`;
    });
}

function ajustarEscalaPlanos() {
    document.querySelectorAll('.chapa-canvas').forEach(canvas => {
        aplicarEscalaPlano(canvas, canvas.clientWidth / CH_W);
    });
}

function renderLista() {
    const cont = document.getElementById('listaPiezas');
    cont.innerHTML = pedido.map(p => `
        <div class="flex justify-between items-center p-4 bg-slate-900 rounded-2xl border border-slate-800">
            <div><p class="font-black italic">${p.c}x ${p.n}</p><p class="text-[10px] text-slate-500">${p.w}x${p.h}mm</p></div>
            <button onclick="eliminar(${p.id})" class="text-slate-700 hover:text-red-500 transition"><i data-lucide="trash-2"></i></button>
        </div>`).join('');
    lucide.createIcons();
}

function empaquetarPiezas(piezas, kerf, permiteRotar) {
    let chapas = [];
    piezas.forEach(p => {
        let puesto = false;
        let pw = p.w + kerf, ph = p.h + kerf;

        for (let ch of chapas) {
            for (let s = 0; s < ch.espacios.length; s++) {
                let esp = ch.espacios[s];
                let cabeN = (pw <= esp.w && ph <= esp.h);
                let cabeR = permiteRotar && (ph <= esp.w && pw <= esp.h);
                if (cabeN || cabeR) {
                    let fW = pw, fH = ph;
                    if (cabeR && (!cabeN || (esp.w - ph < esp.w - pw))) { fW = ph; fH = pw; }
                    ch.piezas.push({ ...p, x: esp.x, y: esp.y, fw: fW - kerf, fh: fH - kerf });
                    let eD = { x: esp.x + fW, y: esp.y, w: esp.w - fW, h: esp.h };
                    let eA = { x: esp.x, y: esp.y + fH, w: fW, h: esp.h - fH };
                    ch.espacios.splice(s, 1);
                    if (eD.w > 1) ch.espacios.push(eD);
                    if (eA.h > 1) ch.espacios.push(eA);
                    ch.espacios.sort((a, b) => a.y - b.y || a.x - b.x);
                    puesto = true;
                    break;
                }
            }
            if (puesto) break;
        }
        if (!puesto) {
            const cabeNormal = p.w + kerf <= CH_W && p.h + kerf <= CH_H;
            const fW = cabeNormal ? p.w + kerf : p.h + kerf;
            const fH = cabeNormal ? p.h + kerf : p.w + kerf;
            chapas.push({
                piezas: [{ ...p, x: 0, y: 0, fw: fW - kerf, fh: fH - kerf }],
                espacios: [
                    { x: fW, y: 0, w: CH_W - fW, h: CH_H },
                    { x: 0, y: fH, w: fW, h: CH_H - fH }
                ].filter(espacio => espacio.w > 1 && espacio.h > 1)
            });
        }
    });
    return chapas;
}

function calcular2D() {
    const kerf = parseInt(document.getElementById('kerf').value) || 0;
    const permiteRotar = document.getElementById('permiteRotar').checked;
    let todas = [];
    pedido.forEach(p => { for (let i = 0; i < p.c; i++) todas.push({ ...p }); });
    todas.sort((a, b) => (b.w * b.h) - (a.w * a.h));

    const piezaInvalida = todas.find(p => {
        const cabeNormal = p.w + kerf <= CH_W && p.h + kerf <= CH_H;
        const cabeRotada = permiteRotar && p.h + kerf <= CH_W && p.w + kerf <= CH_H;
        return !cabeNormal && !cabeRotada;
    });
    if (piezaInvalida) {
        alert(`La pieza ${piezaInvalida.n} (${piezaInvalida.w} x ${piezaInvalida.h} mm) no cabe en la chapa seleccionada.`);
        return;
    }

    const ordenAlternativo = [];
    let inicio = 0;
    let fin = todas.length - 1;
    while (inicio <= fin) {
        ordenAlternativo.push(todas[inicio++]);
        if (inicio <= fin) ordenAlternativo.push(todas[fin--]);
    }

    const resultados = [empaquetarPiezas(todas, kerf, permiteRotar), empaquetarPiezas(ordenAlternativo, kerf, permiteRotar)];
    const chapas = resultados.reduce((mejor, actual) => actual.length < mejor.length ? actual : mejor);
    resultado = chapas;
    renderFinal();
}

function renderFinal() {
    const cont = document.getElementById('planosCorte');
    const stats = document.getElementById('stats');
    const lRetazos = document.getElementById('listaRetazos');
    const contRetazos = document.getElementById('contenedorRetazos');
    const precio = parseFloat(document.getElementById('precioTablero').value) || 0;
    cont.innerHTML = '';
    stats.classList.remove('hidden');
    contRetazos.classList.add('hidden');
    lRetazos.innerHTML = '';
    let areaU = 0, retazos = [];

    resultado.forEach((ch, i) => {
        let html = `
        <div class="bg-slate-900 p-8 rounded-[3rem] border border-slate-800" id="canvas-tablero-${i}">
            <div class="flex justify-between items-center mb-6 italic text-[10px] font-bold">
                <span class="text-blue-500 uppercase">Tablero #${i + 1}</span>
                <span class="text-slate-500 uppercase font-mono">${TIPOS_CHAPA[tipoChapa].etiqueta} · <span class="espesor-label">${formatoEspesor()} mm</span></span>
            </div>
            <div class="chapa-canvas">
                ${ch.piezas.map(p => {
                    areaU += (p.fw * p.fh);
                    return `
                    <div class="pieza-item" data-x="${p.x}" data-y="${p.y}" data-fw="${p.fw}" data-fh="${p.fh}">
                        <span class="text-[7px] font-bold opacity-60 uppercase mb-1">${p.n}</span>
                        <div class="cota-h">${p.fw}</div>
                        <div class="cota-v"><span class="cota-v-text">${p.fh}</span></div>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
        cont.innerHTML += html;
        ch.espacios.forEach(e => { if (e.w > 300 && e.h > 300) retazos.push(e); });
    });
    ajustarEscalaPlanos();

    const efici = ((areaU / (resultado.length * CH_W * CH_H)) * 100).toFixed(1);
    const costoT = (resultado.length * precio).toFixed(2);
    stats.innerHTML = `
        <div class="bg-blue-600 p-5 rounded-[2rem] text-white shadow-xl"><p class="text-[9px] font-bold opacity-60 uppercase italic">Inversión</p><p class="text-3xl font-black">$${costoT}</p></div>
        <div class="bg-slate-900 p-5 rounded-[2rem] border border-slate-800"><p class="text-[9px] font-bold text-slate-500 uppercase italic">Eficiencia</p><p class="text-3xl font-black text-emerald-500">${efici}%</p></div>
        <div class="bg-slate-900 p-5 rounded-[2rem] border border-slate-800 text-center"><p class="text-[9px] font-bold text-slate-500 uppercase italic">Tableros</p><p class="text-3xl font-black text-white">${resultado.length}</p></div>
        <div class="bg-slate-900 p-5 rounded-[2rem] border border-slate-800 text-center"><p class="text-[9px] font-bold text-slate-500 uppercase italic">Desperdicio</p><p class="text-3xl font-black text-red-500">$${(costoT * (1 - (efici / 100))).toFixed(2)}</p></div>`;

    if (retazos.length > 0) {
        contRetazos.classList.remove('hidden');
        lRetazos.innerHTML = retazos.map(r => `<span>[ ${r.w} x ${r.h} mm ]</span>`).join(' ');
    }
    document.getElementById('btnPDF').classList.remove('hidden');
    lucide.createIcons();
}

async function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const fechaHora = new Date().toLocaleString();
    const nombreChapa = TIPOS_CHAPA[tipoChapa].etiqueta;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text('IndCutPro', 15, 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Reporte de Optimización de Cortes', 15, 26);
    doc.setTextColor(51, 65, 85);
    doc.text(`Tipo de chapa: ${nombreChapa}`, 15, 36);
    doc.text(`Espesor de chapa: ${formatoEspesor()} mm`, 15, 41);
    doc.text(`Kerf: ${document.getElementById('kerf').value} mm`, 15, 46);
    doc.text(`Fecha y hora: ${fechaHora}`, 15, 51);
    doc.text(`Total de tableros necesarios: ${resultado.length}`, 15, 56);

    doc.autoTable({
        startY: 65,
        head: [['Cantidad', 'Descripción de la pieza', 'Largo (mm)', 'Ancho (mm)']],
        body: pedido.map(p => [p.c, p.n, p.w, p.h]),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        bodyStyles: { textColor: [31, 41, 55] },
        margin: { left: 15, right: 15 },
        columnStyles: {
            0: { cellWidth: 25, halign: 'center' },
            1: { cellWidth: 80 },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right' }
        }
    });

    const contenedorPDF = { ancho: 180, alto: 105, x: 15 };
    const planoPDF = { ancho: 170, alto: 85, x: contenedorPDF.x + 5 };
    const altoBloqueObservaciones = 90;
    let ultimoPlanoY = 0;
    for (let i = 0; i < resultado.length; i++) {
        if (i % 2 === 0) doc.addPage();
        const posicionEnPagina = i % 2;
        const tituloY = 15 + (posicionEnPagina * 130);
        const contenedorY = 22 + (posicionEnPagina * 130);
        const planoY = contenedorY + 10;
        ultimoPlanoY = contenedorY + contenedorPDF.alto;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text(`TABLERO DE CORTE #${i + 1} · ${nombreChapa}`, 15, tituloY);
        const original = document.getElementById(`canvas-tablero-${i}`);
        const clone = original.querySelector('.chapa-canvas').cloneNode(true);
        clone.style.width = '732px';
        clone.style.height = '366px';
        clone.style.boxSizing = 'border-box';
        clone.style.backgroundColor = "#f8f9fa";
        clone.querySelectorAll('.pieza-item').forEach(p => { p.style.backgroundColor = "#f8f9fa"; p.style.borderColor = "#111827"; p.style.color = "#111827"; });
        clone.querySelectorAll('.cota-h, .cota-v').forEach(c => { c.style.color = "#111827"; c.style.borderColor = "#111827"; });
        clone.querySelectorAll('.cota-v-text').forEach(ct => { ct.style.backgroundColor = "#f8f9fa"; ct.style.color = "#111827"; });
        document.body.appendChild(clone);
        aplicarEscalaPlano(clone, clone.clientWidth / CH_W);
        const canvas = await html2canvas(clone, { scale: 3 });
        document.body.removeChild(clone);
        doc.setDrawColor(30, 41, 59);
        doc.setFillColor(248, 249, 250);
        doc.setLineWidth(1.2);
        doc.roundedRect(contenedorPDF.x, contenedorY, contenedorPDF.ancho, contenedorPDF.alto, 2, 2, 'FD');
        doc.addImage(canvas.toDataURL('image/png'), 'PNG', planoPDF.x, planoY, planoPDF.ancho, planoPDF.alto);
    }

    let yFinal = ultimoPlanoY + 12;
    if (yFinal + altoBloqueObservaciones > 275) {
        doc.addPage();
        yFinal = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('Observaciones', 15, yFinal);
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(15, yFinal + 4, 180, 38, 3, 3, 'FD');
    const firmaY = yFinal + 62;
    doc.text('Firma del operario', 15, firmaY);
    doc.line(15, firmaY + 18, 95, firmaY + 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Nombre y firma', 15, firmaY + 24);
    doc.line(125, firmaY + 18, 195, firmaY + 18);
    doc.text('Fecha', 125, firmaY + 24);

    const totalPages = doc.internal.getNumberOfPages();
    for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`IndCutPro by Invertya - Página ${page} de ${totalPages}`, 105, 290, null, null, 'center');
    }
    doc.save(`IndCutPro_Plan_${Date.now()}.pdf`);
}
