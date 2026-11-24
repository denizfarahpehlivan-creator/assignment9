
import { useEffect, useState } from "react";
import {
  getBooks,
  getStats,
  createBook,
  updateBook,
  patchBook,
  deleteBook,
} from "./api/books";
import "./App.css";

const emptyForm = {
  title: "",
  author: "",
  year: "",
  genre: "fiction",
};

function App() {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [filterRead, setFilterRead] = useState("");
  const [sort, setSort] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function loadStats() {
    try {
      const data = await getStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadBooks() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({ limit: "50" });

        if (search.trim()) params.set("q", search.trim());
        if (filterGenre) params.set("genre", filterGenre);
        if (filterRead) params.set("read", filterRead);
        if (sort) params.set("sort", sort);
    params.set("order", sortDirection);

        const data = await getBooks(params, controller.signal);
        setBooks(data.books || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadBooks();

    return () => controller.abort();
  }, [search, filterGenre, filterRead, sort, sortDirection]);

  useEffect(() => {
    loadStats();
  }, []);

  function handleFormChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const bookData = {
      title: form.title.trim(),
      author: form.author.trim(),
      year: Number(form.year),
      genre: form.genre,
    };

    setSubmitting(true);

    try {
      if (editingId !== null) {
        const currentBook = books.find((book) => book.id === editingId);

        await updateBook(editingId, {
          ...bookData,
          read: currentBook?.read ?? false,
          rating: currentBook?.rating ?? null,
        });
      } else {
        await createBook({
          ...bookData,
          read: false,
          rating: null,
        });
      }

      setForm(emptyForm);
      setEditingId(null);

      await refreshData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function startEditing(book) {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      year: String(book.year),
      genre: book.genre,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditing() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function refreshData() {
    const params = new URLSearchParams({ limit: "50" });

    if (search.trim()) params.set("q", search.trim());
    if (filterGenre) params.set("genre", filterGenre);
    if (filterRead) params.set("read", filterRead);
    if (sort) params.set("sort", sort);
    params.set("order", sortDirection);

    try {
      const data = await getBooks(params);
      setBooks(data.books || []);
      await loadStats();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleRead(book) {
    setError("");

    try {
      await patchBook(book.id, book.read
        ? { read: false, rating: null }
        : { read: true });
      await refreshData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function rateBook(book, rating) {
    if (!rating) return;

    setError("");

    try {
      await patchBook(book.id, { rating: Number(rating) });
      await refreshData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    setError("");

    try {
      await deleteBook(id);

      if (editingId === id) {
        cancelEditing();
      }

      await refreshData();
    } catch (err) {
      setError(err.message);
    }
  }

  const displayedBooks =
    books;

  return (
    <main className="container">
      <header className="header">
        <p className="eyebrow">YOUR PERSONAL LIBRARY</p>
        <h1>My Reading List</h1>
        <p>Keep track of the books you love.</p>
      </header>

      {stats && (
        <section className="stats-grid">
          <div className="stat-card">
            <h3>Total Books</h3>
            <p>{stats.total}</p>
          </div>
          <div className="stat-card">
            <h3>Read</h3>
            <p>{stats.read}</p>
          </div>
          <div className="stat-card">
            <h3>Unread</h3>
            <p>{stats.unread}</p>
          </div>
          <div className="stat-card">
            <h3>Average Rating</h3>
            <p>{stats.averageRating ?? "N/A"}</p>
          </div>
          <div className="stat-card">
            <h3>Books by Genre</h3>
            {Object.entries(stats.byGenre || {}).map(([genre, count]) => (
              <p key={genre}>{genre}: {count}</p>
            ))}
          </div>
        </section>
      )}

        <section className="panel">
        <h2>{editingId !== null ? "Edit Book" : "Add a New Book"}</h2>

        <form className="book-form" onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Book title"
            value={form.title}
            onChange={handleFormChange}
            required
          />

          <input
            name="author"
            placeholder="Author"
            value={form.author}
            onChange={handleFormChange}
            required
          />

          <input
            name="year"
            type="number"
            placeholder="Publication year"
            value={form.year}
            onChange={handleFormChange}
            min="1"
            max="9999"
            required
          />

          <select
            name="genre"
            value={form.genre}
            onChange={handleFormChange}
          >
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-fiction</option>
            <option value="science">Science</option>
            <option value="history">History</option>
            <option value="fantasy">Fantasy</option>
            <option value="other">Other</option>
          </select>

          <button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : editingId !== null ? "Save Changes" : "Add Book"}
          </button>

          {editingId !== null && (
            <button
              type="button"
              className="secondary"
              onClick={cancelEditing}
            >
              Cancel
            </button>
          )}
        </form>
      </section>

      <section className="library">
        <div className="section-heading">
          <div>
            <h2>Your Books</h2>
            <p>{books.length} books found</p>
          </div>
        </div>

        <div className="filters">
          <input
            placeholder="Search title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filterGenre}
            onChange={(e) => setFilterGenre(e.target.value)}
          >
            <option value="">All genres</option>
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-fiction</option>
            <option value="science">Science</option>
            <option value="history">History</option>
            <option value="fantasy">Fantasy</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="true">Read</option>
            <option value="false">Unread</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="title">Sort by title</option>
            <option value="author">Sort by author</option>
            <option value="year">Sort by year</option>
            <option value="rating">Sort by rating</option>
          </select>

          <select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {error && <p className="error">{error}</p>}
        {loading && <p>Loading books...</p>}

        {!loading && !error && displayedBooks.length === 0 && (
          <p className="empty">No books found. Add your first book!</p>
        )}

        <div className="book-grid">
          {displayedBooks.map((book) => (
            <article className="book-card" key={book.id}>
              <div className="book-top">
                <span className="genre">{book.genre}</span>

                <span className={book.read ? "status read" : "status unread"}>
                  {book.read ? "Read" : "Unread"}
                </span>
              </div>

              <h3>{book.title}</h3>
              <p className="author">by {book.author}</p>
              <p className="details">Published: {book.year}</p>
              <p className="details">
                Rating: {book.rating ?? "Not rated"}
              </p>

              <select
                aria-label={`Rate ${book.title}`}
                disabled={!book.read}
                value={book.rating ?? ""}
                onChange={(e) => rateBook(book, e.target.value)}
              >
                <option value="" disabled>
                  {book.read ? "Give a rating" : "Mark as read to rate"}
                </option>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>

              <div className="actions">
                <button
                  className="secondary"
                  onClick={() => toggleRead(book)}
                >
                  Mark as {book.read ? "Unread" : "Read"}
                </button>

                <button
                  className="secondary"
                  onClick={() => startEditing(book)}
                >
                  Edit
                </button>

                <button
                  className="delete"
                  onClick={() => handleDelete(book.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
