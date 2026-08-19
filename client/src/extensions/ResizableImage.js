import Image from '@tiptap/extension-image';

/**
 * A TipTap image extension that supports drag-to-resize.
 * Adds `width` and `height` attributes (persisted in the document JSON) and a
 * NodeView that renders a drag handle in the bottom-right corner of the image.
 */
const ResizableImage = Image.extend({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => el.getAttribute('width'),
        renderHTML: (attrs) =>
          attrs.width ? { width: attrs.width } : {},
      },
      height: {
        default: null,
        parseHTML: (el) => el.getAttribute('height'),
        renderHTML: (attrs) =>
          attrs.height ? { height: attrs.height } : {},
      },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const container = document.createElement('div');
      container.className = 'resizable-image';
      container.setAttribute('contenteditable', 'false');

      const img = document.createElement('img');
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || '';
      img.draggable = false;

      const handle = document.createElement('div');
      handle.className = 'resize-handle';
      handle.setAttribute('contenteditable', 'false');

      const render = () => {
        if (node.attrs.width) img.style.width = `${node.attrs.width}px`;
        else img.style.width = '';
        if (node.attrs.height) img.style.height = `${node.attrs.height}px`;
        else img.style.height = 'auto';
      };
      render();

      // Select the image node when clicked, so toolbar actions (e.g. crop)
      // can operate on it.
      img.addEventListener('click', () => {
        if (typeof getPos === 'function') {
          editor.commands.setNodeSelection(getPos());
        }
      });
      img.addEventListener('dblclick', () => {
        if (typeof getPos === 'function') {
          editor.commands.setNodeSelection(getPos());
        }
      });

      // Drag-to-resize.
      let dragging = false;
      let startX = 0;
      let startW = 0;
      let nextW = 0;

      const onMove = (ev) => {
        if (!dragging) return;
        ev.preventDefault();
        const w = Math.max(40, startW + (ev.clientX - startX));
        nextW = Math.round(w);
        img.style.width = `${nextW}px`;
        img.style.height = 'auto';
      };
      const onUp = () => {
        if (!dragging) return;
        dragging = false;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        if (typeof getPos === 'function') {
          editor
            .chain()
            .focus()
            .setNodeSelection(getPos())
            .updateAttributes('image', { width: nextW, height: null })
            .run();
        }
      };
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragging = true;
        startX = e.clientX;
        startW = img.offsetWidth;
        nextW = startW;
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
      });

      container.appendChild(img);
      container.appendChild(handle);

      return {
        dom: container,
        update(updatedNode) {
          node = updatedNode;
          render();
          return true;
        },
        ignoreMutation(mutation) {
          return mutation.type === 'attributes';
        },
        stopEvent(event) {
          return event.target === handle;
        },
      };
    };
  },
});

export default ResizableImage;