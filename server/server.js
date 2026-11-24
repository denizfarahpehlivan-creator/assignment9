
import { validateBook } from "./validate.js";
import {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  patchBook,
  deleteBook,
  getStats
} from "./booksStore.js";

import express from "express";
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Middleware
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// Hello endpoint
app.get("/api/hello", async (req, res) => {
  res.json({ message: "Reading List API is working!" });
});

// Get all books with optional genre filter
app.get("/api/books", async (req, res) => {
  const genre = req.query.genre;



  const validGenres = [
    "fiction",
    "non-fiction",
    "science",
    "history",
    "fantasy",
    "other"
  ];

  if (
    genre !== undefined &&
    (typeof genre !== "string" || !validGenres.includes(genre))
  ) {
    return res.status(400).json({
      error: "Invalid genre"
    });
  }

  let books = await getAllBooks();

  if (genre !== undefined) {
    books = books.filter((book) => book.genre === genre);
  }

  return res.status(200).json(books);
});

// Get book by ID
app.get("/api/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Book ID must be a positive integer"
    });
  }

  const book = await getBookById(id);

  if (!book) {
    return res.status(404).json({
      error: "Book not found"
    });
  }

  return res.status(200).json(book);
});

// Add a new book
app.post("/api/books", async (req, res) => {
  const result = validateBook(req.body);

  if (result.error) {
    return res.status(400).json({
      error: result.error
    });
  }

  const newBook = await addBook(result.value);

  if (!newBook) {
    return res.status(409).json({
      error: "A book with the same title and author already exists"
    });
  }

  return res.status(201)
    .location(`/api/books/${newBook.id}`)
    .json(newBook);
});

// Replace a book
app.put("/api/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Book ID must be a positive integer"
    });
  }

  const result = validateBook(req.body);

  if (result.error) {
    return res.status(400).json({
      error: result.error
    });
  }

  const updated = await updateBook(id, result.value);

  if (updated.error === "not_found") {
    return res.status(404).json({
      error: "Book not found"
    });
  }

  if (updated.error === "duplicate") {
    return res.status(409).json({
      error: "A book with the same title and author already exists"
    });
  }

  return res.status(200).json(updated.value);
});

// Partially update a book
app.patch("/api/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Book ID must be a positive integer"
    });
  }

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({
      error: "Book data must be an object"
    });
  }

  const existingBook = await getBookById(id);

  if (!existingBook) {
    return res.status(404).json({
      error: "Book not found"
    });
  }

  const allowedFields = [
    "title",
    "author",
    "year",
    "genre",
    "read",
    "rating"
  ];

  const changes = {};

  for (const field of allowedFields) {
    if (Object.hasOwn(req.body, field)) {
      changes[field] = req.body[field];
    }
  }

  const mergedBook = {
    ...existingBook,
    ...changes
  };

  const result = validateBook(mergedBook);

  if (result.error) {
    return res.status(400).json({
      error: result.error
    });
  }

  const updated = await patchBook(id, result.value);

  if (updated.error === "duplicate") {
    return res.status(409).json({
      error: "A book with the same title and author already exists"
    });
  }

  if (updated.error === "not_found") {
    return res.status(404).json({
      error: "Book not found"
    });
  }

  return res.status(200).json(updated.value);
});

// Delete a book
app.delete("/api/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Book ID must be a positive integer"
    });
  }

  const deleted = await deleteBook(id);

  if (!deleted) {
    return res.status(404).json({
      error: "Book not found"
    });
  }

  return res.status(204).send();
});

// Get book statistics
app.get("/api/stats", async (req, res) => {
  const stats = await getStats();

  return res.status(200).json(stats);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
