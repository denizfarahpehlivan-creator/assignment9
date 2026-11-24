
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3000/api";

function App() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("fiction");
  const [search, setSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [filterRead, setFilterRead] = useState("");
  const [sort, setSort] = useState("title");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadBooks() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ limit: "100" });

      if (search.trim()) params.set("q", search.trim());
      if (filterGenre) params.set("genre", filterGenre);
      if (filterRead) params.set("read", filterRead);
      if (sort) params.set("sort", sort);

      const response = await fetch(`${API_URL}/books?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Books could not be loaded.");

      setBooks(data.books || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, [search, filterGenre, filterRead, sort]);

  async function addBook(e) {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_URL}/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          author,
          year: Number(year),
          genre,
          read: false,
          rating: null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not add book.");

      setTitle("");
      setAuthor("");
      setYear("");
      setGenre("fiction");
      loadBooks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleRead(book) {
    try {
      const response = await fetch(`${API_URL}/books/${book.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: !book.read }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Update failed.");

      loadBooks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function rateBook(book, rating) {
    try {
      const response = await fetch(`${API_URL}/books/${book.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: Number(rating) }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Rating failed.");

      loadBooks();
    } catch (err) {
      setError(err.message);
    }
  }


  async function deleteBook(id) {
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      const response = await fetch(`${API_URL}/books/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Delete failed.");
      }

      loadBooks();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="container">
      <header className="header">
        <p className="eyebrow">YOUR PERSONAL LIBRARY</p>
        <h1>My Reading List</h1>
        <p>Keep track of the books you love.</p>
      </header>

      <section className="panel">
        <h2>Add a New Book</h2>
        <form className="book-form" onSubmit={addBook}>
          <input
            placeholder="Book title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Publication year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min="1"
            max="9999"
            required
          />
          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-fiction</option>
            <option value="science">Science</option>
            <option value="history">History</option>
            <option value="fantasy">Fantasy</option>
            <option value="other">Other</option>
          </select>
          <button type="submit">Add Book</button>
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

          <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)}>
            <option value="">All genres</option>
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-fiction</option>
            <option value="science">Science</option>
            <option value="history">History</option>
            <option value="fantasy">Fantasy</option>
            <option value="other">Other</option>
          </select>

          <select value={filterRead} onChange={(e) => setFilterRead(e.target.value)}>
            <option value="">All statuses</option>
            <option value="true">Read</option>
            <option value="false">Unread</option>
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="title">Sort by title</option>
            <option value="year">Sort by year</option>
            <option value="rating">Sort by rating</option>
          </select>
        </div>

        {error && <p className="error">{error}</p>}
        {loading && <p>Loading books...</p>}

        {!loading && books.length === 0 && (
          <p className="empty">No books found. Add your first book!</p>
        )}

        <div className="book-grid">
          {books.map((book) => (
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
                value={book.rating ?? ""}
                onChange={(e) => rateBook(book, e.target.value)}
              >
                <option value="" disabled>Give a rating</option>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>

              

              <div className="actions">
                <button className="secondary" onClick={() => toggleRead(book)}>
                  Mark as {book.read ? "Unread" : "Read"}
                </button>
                <button className="delete" onClick={() => deleteBook(book.id)}>
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

