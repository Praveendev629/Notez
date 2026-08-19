import { jsPDF } from 'jspdf';

/** Build a safe download filename from a note title. */
export function safeFilename(title = 'notez') {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return (base || 'notez') + '.pdf';
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Export a note or to-do list as a PDF using jsPDF.
 * Includes title, owner name, created/updated dates, tags, and the note's
 * plain-text content. To-do lists render each task with a checked box.
 */
export function exportNotePdf(note, ownerName = '') {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let y = 64;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(20, 20, 28);
  const title = (note.title || 'Untitled').slice(0, 90);
  const titleLines = doc.splitTextToSize(title, maxWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 26 + 8;

  // Meta row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 130);
  const meta = [
    ownerName && `By ${ownerName}`,
    note.createdAt && `Created ${formatDate(note.createdAt)}`,
    note.updatedAt && `Updated ${formatDate(note.updatedAt)}`,
    note.tags?.length ? `Tags: ${note.tags.join(', ')}` : '',
  ].filter(Boolean).join('   ·   ');
  doc.text(meta, margin, y);
  y += 18;

  // Divider
  doc.setDrawColor(230, 230, 235);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 26;

  if (note.type === 'todo') {
    const items = note.todoItems || [];
    if (!items.length) {
      doc.setFontSize(12);
      doc.setTextColor(90, 90, 100);
      doc.text('No tasks yet.', margin, y);
    } else {
      items.forEach((item) => {
        if (y > doc.internal.pageSize.getHeight() - 60) {
          doc.addPage();
          y = 60;
        }
        // checkbox
        doc.setDrawColor(150, 150, 160);
        doc.setLineWidth(1.2);
        if (item.completed) {
          doc.setFillColor(224, 30, 38);
          doc.rect(margin, y - 11, 13, 13, 'F');
          doc.setTextColor(255, 255, 255);
          doc.text('✓', margin + 3, y + 1);
        } else {
          doc.rect(margin, y - 11, 13, 13);
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(item.completed ? 150 : 40, item.completed ? 150 : 40, item.completed ? 150 : 60);
        const lines = doc.splitTextToSize(item.text, maxWidth - 30);
        doc.text(lines, margin + 24, y);
        y += lines.length * 16 + 10;
      });
    }
  } else {
    const body = note.plainTextContent || '';
    const lines = doc.splitTextToSize(body || 'No content.', maxWidth);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 70);
    for (const line of lines) {
      if (y > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        y = 60;
      }
      doc.text(line, margin, y);
      y += 16;
    }
  }

  // Footer brand
  doc.setFontSize(9);
  doc.setTextColor(180, 180, 190);
  doc.text('Exported with Notez', margin, doc.internal.pageSize.getHeight() - 40);

  const name = safeFilename(note.title);
  doc.save(name);
  return name;
}