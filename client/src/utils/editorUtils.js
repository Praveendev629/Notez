/** Recursively extract plain text from a TipTap JSON document. */
export function docToPlainText(doc) {
  if (!doc) return '';
  if (typeof doc === 'string') return doc;
  let out = '';
  const walk = (node) => {
    if (node.text) out += node.text;
    if (node.type === 'paragraph' || node.type === 'heading') out += ' ';
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  if (doc.type === 'doc') walk(doc);
  else if (Array.isArray(doc)) doc.forEach(walk);
  return out.replace(/\s+/g, ' ').trim();
}

export function emptyDoc() {
  return { type: 'doc', content: [{ type: 'paragraph' }] };
}

/** Turn a TipTap JSON document into a small HTML preview string. */
export function docToPreview(doc, max = 160) {
  const text = docToPlainText(doc);
  return text.length > max ? text.slice(0, max) + '…' : text;
}