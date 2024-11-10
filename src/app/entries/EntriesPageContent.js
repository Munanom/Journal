import Link from 'next/link';

export default function EntriesPageContent({ entries }) {
  return (
    <div>
      <h1>Your Journal Entries</h1>
      {entries.length === 0 ? (
        <p>No entries yet. Start writing your first entry!</p>
      ) : (
        <ul>
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link href={`/entries/${entry.id}`}>
                {entry.title || 'Untitled Entry'} - {new Date(entry.date).toLocaleDateString()}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link href="/add-entry">
        <button>Add New Entry</button>
      </Link>
    </div>
  );
}
