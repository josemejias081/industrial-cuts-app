let LONGITUD_BARRA = parseInt(localStorage.getItem('wf_longitud')) || 12000;
const kerfGuardado = localStorage.getItem('wf_kerf');
const kerfConfigurado = localStorage.getItem('wf_kerf_configured') === '1';
let KERF_CORTE = kerfConfigurado && kerfGuardado !== null ? Math.max(0, parseInt(kerfGuardado) || 0) : 0;
let listaCortes = JSON.parse(localStorage.getItem('wf_cortes')) || [];
let resultadoGlobal = [];

document.getElementById('longitudBase').value = LONGITUD_BARRA;
document.getElementById('kerf').value = KERF_CORTE;

window.onload = () => {
    actualizarInterfaz();
    if (listaCortes.length > 0) calcular();
};

function cambiarLongitudBase() {
    LONGITUD_BARRA = parseInt(document.getElementById('longitudBase').value) || 12000;
    localStorage.setItem('wf_longitud', LONGITUD_BARRA);
    if (listaCortes.length > 0) calcular();
}

function cambiarKerf() {
    KERF_CORTE = Math.max(0, parseInt(document.getElementById('kerf').value) || 0);
    document.getElementById('kerf').value = KERF_CORTE;
    localStorage.setItem('wf_kerf', KERF_CORTE);
    localStorage.setItem('wf_kerf_configured', '1');
    if (listaCortes.length > 0) calcular();
}

function agregarCorte() {
    const m = parseInt(document.getElementById('medida').value);
    const c = parseInt(document.getElementById('cantidad').value);
    if (!m || !c) return;
    if (m > LONGITUD_BARRA) return alert(`El corte supera los ${LONGITUD_BARRA}mm de la barra base.`);

    listaCortes.push({ medida: m, cantidad: c, id: Date.now() });
    guardarYActualizar();
    document.getElementById('medida').value = '';
    document.getElementById('medida').focus();
}

function eliminarCorte(id) {
    listaCortes = listaCortes.filter(i => i.id !== id);
    guardarYActualizar();
}

function limpiarTodo() {
    if (confirm("¿Reiniciar todo el proyecto?")) {
        listaCortes = [];
        localStorage.removeItem('wf_cortes');
        location.reload();
    }
}

function guardarYActualizar() {
    localStorage.setItem('wf_cortes', JSON.stringify(listaCortes));
    actualizarInterfaz();
    if (listaCortes.length > 0) calcular();
}

function longitudOcupada(cortes) {
    return cortes.reduce((total, corte) => total + corte, 0) + Math.max(0, cortes.length - 1) * KERF_CORTE;
}

function actualizarInterfaz() {
    const cont = document.getElementById('listaCortes');
    cont.innerHTML = '';
    listaCortes.forEach(item => {
        cont.innerHTML += `
            <div class="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all group">
                <span class="font-black text-slate-700">${item.cantidad}x <small class="text-slate-400 font-bold ml-1">${item.medida}mm</small></span>
                <button onclick="eliminarCorte(${item.id})" class="text-slate-300 group-hover:text-red-500 transition">
                    <i data-lucide="x-circle" class="w-5 h-5"></i>
                </button>
            </div>`;
    });
    document.getElementById('contadorTotal').innerText = `${listaCortes.length} ÍTEMS`;
    lucide.createIcons();
}

function calcular() {
    let todos = [];
    listaCortes.forEach(c => { for (let i = 0; i < c.cantidad; i++) todos.push(c.medida); });
    todos.sort((a, b) => b - a);

    let barras = [];
    todos.forEach(corte => {
        let puesto = false;
        for (let b of barras) {
            let ocupado = longitudOcupada(b);
            if (ocupado + (b.length > 0 ? KERF_CORTE : 0) + corte <= LONGITUD_BARRA) {
                b.push(corte);
                puesto = true;
                break;
            }
        }
        if (!puesto) barras.push([corte]);
    });

    resultadoGlobal = barras;
    renderizarResultados(barras);
    document.getElementById('btnPDF').classList.remove('hidden');
}

function renderizarResultados(barras) {
    const cont = document.getElementById('contenedorResultados');
    const desperdicioTotal = barras.reduce((acc, b) => acc + (LONGITUD_BARRA - longitudOcupada(b)), 0);

    let html = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div class="bg-blue-600 p-6 rounded-[2rem] text-white flex justify-between items-center">
                <div><p class="text-[10px] uppercase font-black opacity-60">Barras de ${LONGITUD_BARRA}mm</p><p class="text-4xl font-black">${barras.length}</p><p class="text-[10px] font-bold opacity-70">Kerf: ${KERF_CORTE}mm</p></div>
                <i data-lucide="trending-up" class="w-10 h-10 opacity-20"></i>
            </div>
            <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center text-slate-700">
                <div><p class="text-[10px] uppercase font-black text-slate-400">Sobrante Total</p><p class="text-4xl font-black text-orange-500">${desperdicioTotal}mm</p></div>
                <i data-lucide="trash" class="w-10 h-10 text-slate-100"></i>
            </div>
        </div>
        <div class="space-y-4">`;

    barras.forEach((b, i) => {
        let sobrante = LONGITUD_BARRA - longitudOcupada(b);
        html += `
            <div class="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 transition-hover hover:shadow-md">
                <div class="flex justify-between items-center mb-3 px-2">
                    <span class="text-xs font-black text-slate-800">BARRA #${i + 1}</span>
                    <span class="text-[10px] font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full uppercase">Sobra: ${sobrante}mm</span>
                </div>
                <div class="flex h-12 bg-slate-50 overflow-hidden p-1.5 border border-slate-100">`;
        b.forEach((corte, index) => {
            let w = (corte / LONGITUD_BARRA) * 100;
            html += `<div class="h-full bg-blue-500 rounded-sm flex items-center justify-center text-[10px] text-white font-black" style="width: ${w}%">${corte}</div>`;
            if (index < b.length - 1 && KERF_CORTE > 0) {
                const kerfWidth = (KERF_CORTE / LONGITUD_BARRA) * 100;
                html += `<div class="h-full bg-orange-400/70" style="width: ${kerfWidth}%" title="Kerf: ${KERF_CORTE}mm" aria-label="Kerf de ${KERF_CORTE} milímetros"></div>`;
            }
        });
        html += `</div></div>`;
    });

    cont.innerHTML = html + `</div>`;
    lucide.createIcons();
}

async function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const fechaHora = new Date().toLocaleString();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text("CutMasterPro", 15, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Reporte de Optimización de Cortes", 15, 26);

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(`Longitud de barra base: ${LONGITUD_BARRA} mm`, 15, 36);
    doc.text(`Kerf: ${KERF_CORTE} mm`, 15, 41);
    doc.text(`Fecha y hora: ${fechaHora}`, 15, 46);
    doc.text(`Total de barras necesarias: ${resultadoGlobal.length}`, 15, 51);

    const bodyBarras = resultadoGlobal.map((barra, indice) => [
        `Barra #${indice + 1}`,
        barra.length,
        barra.join(' + ') + ' mm',
        `${LONGITUD_BARRA - longitudOcupada(barra)} mm`
    ]);

    doc.autoTable({
        startY: 60,
        head: [['Barra', 'Cantidad', 'Medida de corte', 'Sobrante']],
        body: bodyBarras,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        bodyStyles: { textColor: [31, 41, 55] },
        columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 85 },
            3: { cellWidth: 40, halign: 'right' }
        },
        margin: { left: 15, right: 15 }
    });

    let yActual = doc.lastAutoTable.finalY + 14;
    if (yActual > 235) {
        doc.addPage();
        yActual = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('Observaciones', 15, yActual);
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(15, yActual + 4, 180, 38, 3, 3, 'FD');

    const firmaY = yActual + 62;
    doc.setTextColor(30, 41, 59);
    doc.text('Firma del operario', 15, firmaY);
    doc.line(15, firmaY + 18, 95, firmaY + 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Nombre y firma', 15, firmaY + 24);
    doc.line(125, firmaY + 18, 195, firmaY + 18);
    doc.text('Fecha', 125, firmaY + 24);

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`CutMasterPro by Invertya - Página ${i} de ${totalPages}`, 105, 290, null, null, "center");
    }

    doc.save(`CutMasterPro_Plan_${Date.now()}.pdf`);
}
