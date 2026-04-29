import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PdfExportService {

  async exportReleveNotes(data: {
    etudiant: { nom: string; prenom: string; cne: string; cin: string; groupe: string };
    noteRows: { moduleNom: string; moduleCode: string; coefficient: number; noteCC: number | null; noteExamen: number; noteFinale: number; valide: boolean }[];
    moyenne: number;
    deliberation: { decision: string; mention: string; rang: number } | null;
    annee: string;
  }): Promise<void> {
    // Dynamically load jsPDF
    const jsPDF = await this.loadJsPDF();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageW = 210;
    const margin = 15;
    let y = 20;

    // ── Header ──────────────────────────────────────────────
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageW, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('École Normale Supérieure de Meknès', pageW / 2, 12, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Département Informatique — Année universitaire ${data.annee}`, pageW / 2, 20, { align: 'center' });

    y = 40;

    // ── Title ────────────────────────────────────────────────
    doc.setTextColor(30, 30, 46);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RELEVÉ DE NOTES', pageW / 2, y, { align: 'center' });

    y += 4;
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageW - margin, y);

    y += 10;

    // ── Student info ─────────────────────────────────────────
    doc.setFillColor(248, 247, 255);
    doc.roundedRect(margin, y - 5, pageW - margin * 2, 28, 3, 3, 'F');

    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'bold');

    const col1x = margin + 5;
    const col2x = pageW / 2 + 5;

    doc.text('NOM COMPLET', col1x, y + 1);
    doc.text('CNE', col2x, y + 1);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 46);
    doc.setFontSize(11);
    doc.text(`${data.etudiant.nom} ${data.etudiant.prenom}`, col1x, y + 8);
    doc.text(data.etudiant.cne, col2x, y + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text('CIN', col1x, y + 16);
    doc.text('GROUPE', col2x, y + 16);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 46);
    doc.setFontSize(11);
    doc.text(data.etudiant.cin, col1x, y + 23);
    doc.text(data.etudiant.groupe, col2x, y + 23);

    y += 38;

    // ── Table header ─────────────────────────────────────────
    const cols = [
      { label: 'Module',        x: margin,      w: 55 },
      { label: 'Code',          x: margin + 55, w: 18 },
      { label: 'Coef.',         x: margin + 73, w: 14 },
      { label: 'CC /20',        x: margin + 87, w: 22 },
      { label: 'Exam /20',      x: margin + 109,w: 22 },
      { label: 'Finale /20',    x: margin + 131,w: 24 },
      { label: 'Résultat',      x: margin + 155,w: 25 },
    ];
    const tableW = pageW - margin * 2;
    const rowH = 8;

    doc.setFillColor(79, 70, 229);
    doc.rect(margin, y, tableW, rowH, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    cols.forEach(col => {
      doc.text(col.label, col.x + col.w / 2, y + 5.5, { align: 'center' });
    });

    y += rowH;

    // ── Table rows ───────────────────────────────────────────
    data.noteRows.forEach((row, i) => {
      const rowBg = !row.valide ? [255, 245, 245] : i % 2 === 0 ? [255, 255, 255] : [249, 250, 251];
      doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
      doc.rect(margin, y, tableW, rowH, 'F');

      doc.setTextColor(30, 30, 46);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');

      // Module name (truncate if too long)
      const modName = row.moduleNom.length > 28 ? row.moduleNom.substring(0, 26) + '…' : row.moduleNom;
      doc.text(modName, cols[0].x + 2, y + 5.5);
      doc.text(row.moduleCode, cols[1].x + cols[1].w / 2, y + 5.5, { align: 'center' });
      doc.text(String(row.coefficient), cols[2].x + cols[2].w / 2, y + 5.5, { align: 'center' });
      doc.text(row.noteCC !== null ? row.noteCC.toFixed(2) : '—', cols[3].x + cols[3].w / 2, y + 5.5, { align: 'center' });
      doc.text(row.noteExamen.toFixed(2), cols[4].x + cols[4].w / 2, y + 5.5, { align: 'center' });

      // Note finale colored
      doc.setTextColor(row.valide ? 22 : 220, row.valide ? 163 : 38, row.valide ? 74 : 38);
      doc.setFont('helvetica', 'bold');
      doc.text(row.noteFinale.toFixed(2), cols[5].x + cols[5].w / 2, y + 5.5, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(row.valide ? 22 : 220, row.valide ? 163 : 38, row.valide ? 74 : 38);
      doc.text(row.valide ? '✓ Validé' : '✗ Non validé', cols[6].x + cols[6].w / 2, y + 5.5, { align: 'center' });

      // Row border
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.2);
      doc.line(margin, y + rowH, margin + tableW, y + rowH);

      y += rowH;
    });

    // ── Total row ────────────────────────────────────────────
    doc.setFillColor(237, 233, 254);
    doc.rect(margin, y, tableW, rowH, 'F');

    doc.setTextColor(79, 70, 229);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Moyenne Générale Pondérée', margin + 2, y + 5.5);
    doc.text(data.moyenne.toFixed(2) + '/20', cols[5].x + cols[5].w / 2, y + 5.5, { align: 'center' });

    y += rowH + 10;

    // ── Deliberation result ──────────────────────────────────
    if (data.deliberation) {
      doc.setFillColor(240, 249, 255);
      doc.setDrawColor(186, 230, 253);
      doc.roundedRect(margin, y, tableW, 20, 3, 3, 'FD');

      const decisionMap: Record<string, string> = {
        'valide': '✅ Validé', 'rattrapage': '🔁 Rattrapage',
        'ajourne': '❌ Ajourné', 'exclu': '🚫 Exclu'
      };
      const mentionMap: Record<string, string> = {
        'passable': 'Passable', 'assez-bien': 'Assez Bien',
        'bien': 'Bien', 'tres-bien': 'Très Bien', 'aucune': '—'
      };

      const items = [
        { label: 'Décision',     value: decisionMap[data.deliberation.decision] ?? data.deliberation.decision },
        { label: 'Mention',      value: mentionMap[data.deliberation.mention] ?? data.deliberation.mention },
        { label: 'Classement',   value: `#${data.deliberation.rang}` },
      ];

      doc.setTextColor(107, 114, 128);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');

      items.forEach((item, i) => {
        const ix = margin + 5 + i * 60;
        doc.text(item.label.toUpperCase(), ix, y + 7);
        doc.setTextColor(30, 30, 46);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(item.value, ix, y + 15);
        doc.setTextColor(107, 114, 128);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
      });

      y += 30;
    }

    // ── Footer ───────────────────────────────────────────────
    const footerY = 280;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY, pageW - margin, footerY);

    doc.setTextColor(107, 114, 128);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fait à Meknès, le ${new Date().toLocaleDateString('fr-FR')}`, margin, footerY + 6);

    doc.setFont('helvetica', 'bold');
    doc.text('Le Directeur', pageW - margin - 40, footerY + 6);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.text('Signature et cachet', pageW - margin - 40, footerY + 11);
    doc.setDrawColor(150, 150, 150);
    doc.rect(pageW - margin - 45, footerY + 14, 40, 15);

    // ── Save ─────────────────────────────────────────────────
    const filename = `releve_${data.etudiant.cne}_${data.annee}.pdf`;
    doc.save(filename);
  }

  private loadJsPDF(): Promise<any> {
    return new Promise((resolve, reject) => {
      if ((window as any).jspdf) {
        resolve((window as any).jspdf.jsPDF);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => resolve((window as any).jspdf.jsPDF);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}