import NoteCard from './NoteCard';
import EmptyState from './EmptyState';

export default function NoteGrid({ notes = [], tab, onChanged }) {
  if (notes.length === 0) {
    const hints = {
      all: { title: 'No notes yet', body: 'Tap the + button to create your first note or to-do list.' },
      pinned: { title: 'Nothing pinned', body: 'Pin a note to keep it front and centre here.' },
      todos: { title: 'No to-do lists', body: 'Create a to-do list and start checking things off.' },
      archived: { title: 'Nothing archived', body: 'Notes you archive will appear here.' },
    }[tab] || { title: 'Nothing here', body: 'Try a different filter.' };

    return <EmptyState title={hints.title} body={hints.body} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {notes.map((n, i) => (
        <NoteCard key={n.id} note={n} index={i} onChanged={onChanged} />
      ))}
    </div>
  );
}