
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

// Framework for creating API and web server
import express from "express";

// Allows communication between React and Express
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// GET /api/hello
app.get("/api/hello", (req, res) => {
  res.status(200).json({
    message: "Hello from Express API!"
  });
});

// GET /api/books
// Supports genre and read filtering
app.get("/api/books", async (req, res) => {
  const genre = req.query.genre;
  const read = req.query.read;

  const validGenres = [
    "fiction",
    "non-fiction",
    "science",
    "history",
    "fantasy",
    "other"
  ];

  // Validate genre
  if (
    genre !== undefined &&
    (typeof genre !== "string" || !validGenres.includes(genre))
  ) {
    return res.status(400).json({
      error: "Invalid genre"
    });
  }

  // Validate read parameter
  if (
    read !== undefined &&
    read !== "true" &&
    read !== "false"
  ) {
    return res.status(400).json({
      error: "Invalid read value. Use true or false."
    });
  }

  let books = await getAllBooks();

  // Filter by genre
  if (genre !== undefined) {
    books = books.filter((book) => book.genre === genre);
  }

  // Filter by read status
  if (read !== undefined) {
    const isRead = read === "true";

    books = books.filter((book) => book.read === isRead);
  }

  return res.status(200).json(books);
});

// GET /api/books/:id
app.get("/api/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid book ID"
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

// POST /api/books
app.post("/api/books", async (req, res) => {
  const result = validateBook(req.body);

  if (!result.valid) {
    return res.status(400).json({
      error: result.error
    });
  }

  const newBook = await addBook(result.value);

  return res.status(201).json(newBook);
});

// PUT /api/books/:id
app.put("/api/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid book ID"
    });
  }

  const result = validateBook(req.body);

  if (!result.valid) {
    return res.status(400).json({
      error: result.error
    });
  }

  const updatedBook = await updateBook(id, result.value);

  if (!updatedBook) {
    return res.status(404).json({
      error: "Book not found"
    });
  }

  return res.status(200).json(updatedBook);
});

// PATCH /api/books/:id
app.patch("/api/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid book ID"
    });
  }

  const result = await patchBook(id, req.body);

  if (!result) {
    return res.status(404).json({
      error: "Book not found"
    });
  }

  if (result.error) {
    return res.status(400).json({
      error: result.error
    });
  }

  return res.status(200).json(result);
});

// DELETE /api/books/:id
app.delete("/api/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid book ID"
    });
  }

  const deletedBook = await deleteBook(id);

  if (!deletedBook) {
    return res.status(404).json({
      error: "Book not found"
    });
  }

  return res.status(204).send();
});

// GET /api/stats
app.get("/api/stats", async (req, res) => {
  const stats = await getStats();

  return res.status(200).json(stats);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
