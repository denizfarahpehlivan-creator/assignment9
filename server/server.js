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
app.use(cors({
  origin: CLIENT_ORIGIN,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// Async error handler (works with Express 4 and 5)
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

// GET /api/hello
app.get("/api/hello", (req, res) => {
  res.status(200).json({
    message: "Hello from Express API!"
  });
});

// GET /api/books
app.get("/api/books", asyncHandler(async (req, res) => {
  const {
    genre,
    read,
    q,
    year,
    minYear,
    maxYear,
    sort,
    order = "asc"
  } = req.query;

  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 50);

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
    return res.status(400).json({ error: "Invalid genre" });
  }

  if (
    read !== undefined &&
    read !== "true" &&
    read !== "false"
  ) {
    return res.status(400).json({
      error: "Invalid read value. Use true or false."
    });
  }

  if (q !== undefined && typeof q !== "string") {
    return res.status(400).json({ error: "Invalid search query" });
  }

  if (
    year !== undefined &&
    (!/^\d{4}$/.test(year) || Number(year) <= 0)
  ) {
    return res.status(400).json({ error: "Invalid year" });
  }

  if (
    minYear !== undefined &&
    (!/^\d{4}$/.test(minYear) || Number(minYear) <= 0)
  ) {
    return res.status(400).json({ error: "Invalid minYear" });
  }

  if (
    maxYear !== undefined &&
    (!/^\d{4}$/.test(maxYear) || Number(maxYear) <= 0)
  ) {
    return res.status(400).json({ error: "Invalid maxYear" });
  }

  if (
    minYear !== undefined &&
    maxYear !== undefined &&
    Number(minYear) > Number(maxYear)
  ) {
    return res.status(400).json({
      error: "minYear cannot be greater than maxYear."
    });
  }

  if (!Number.isInteger(page) || page < 1) {
    return res.status(400).json({
      error: "Page must be a positive integer"
    });
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    return res.status(400).json({
      error: "Limit must be a positive integer"
    });
  }

  const validSortFields = ["title", "author", "year", "rating"];

  if (
    sort !== undefined &&
    (typeof sort !== "string" || !validSortFields.includes(sort))
  ) {
    return res.status(400).json({
      error: "Invalid sort field. Use title, author, year or rating."
    });
  }

  if (
    typeof order !== "string" ||
    !["asc", "desc"].includes(order)
  ) {
    return res.status(400).json({
      error: "Invalid order. Use asc or desc."
    });
  }

  let books = await getAllBooks();

  if (genre !== undefined) {
    books = books.filter((book) => book.genre === genre);
  }

  if (read !== undefined) {
    books = books.filter((book) => book.read === (read === "true"));
  }

  if (q !== undefined && q.trim() !== "") {
    const searchTerm = q.trim().toLowerCase();

    books = books.filter((book) =>
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm)
    );
  }

  if (year !== undefined) {
    books = books.filter((book) => book.year === Number(year));
  }

  if (minYear !== undefined) {
    books = books.filter((book) => book.year >= Number(minYear));
  }

  if (maxYear !== undefined) {
    books = books.filter((book) => book.year <= Number(maxYear));
  }

  if (sort !== undefined) {
    books.sort((a, b) => {
      let comparison;

      if (sort === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sort === "author") {
        comparison = a.author.localeCompare(b.author);
      } else if (sort === "year") {
        comparison = a.year - b.year;
      } else {
        if (a.rating === null && b.rating === null) return 0;
        if (a.rating === null) return 1;
        if (b.rating === null) return -1;
        comparison = a.rating - b.rating;
      }

      return order === "desc" ? -comparison : comparison;
    });
  }

  const totalBooks = books.length;
  const totalPages = Math.ceil(totalBooks / limit);
  const startIndex = (page - 1) * limit;
  const paginatedBooks = books.slice(startIndex, startIndex + limit);

  return res.status(200).json({
    page,
    limit,
    totalBooks,
    totalPages,
    books: paginatedBooks
  });
}));

// GET /api/books/:id
app.get("/api/books/:id", asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid book ID" });
  }

  const book = await getBookById(id);

  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  return res.status(200).json(book);
}));

// POST /api/books
app.post("/api/books", asyncHandler(async (req, res) => {
  const result = validateBook(req.body);

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  const newBook = await addBook(result.value);

  if (!newBook) {
    return res.status(409).json({
      error: "A book with this title and author already exists."
    });
  }

  return res
    .location(`/api/books/${newBook.id}`)
    .status(201)
    .json(newBook);
}));

// PUT /api/books/:id
app.put("/api/books/:id", asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid book ID" });
  }

  const result = validateBook(req.body);

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  const updatedBook = await updateBook(id, result.value);

  if (updatedBook?.error === "not_found") {
    return res.status(404).json({ error: "Book not found" });
  }

  if (updatedBook?.error === "duplicate") {
    return res.status(409).json({
      error: "A book with this title and author already exists."
    });
  }

  return res.status(200).json(updatedBook.value);
}));

// PATCH /api/books/:id
app.patch("/api/books/:id", asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid book ID" });
  }

  const allowedFields = [
    "title",
    "author",
    "year",
    "genre",
    "read",
    "rating"
  ];

  if (
    !req.body ||
    typeof req.body !== "object" ||
    Array.isArray(req.body)
  ) {
    return res.status(400).json({ error: "Request body must be an object" });
  }

  // Ignore unknown fields
  const changes = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
  );

  if (Object.keys(changes).length === 0) {
    return res.status(400).json({
      error: "Provide at least one valid book field to update."
    });
  }

  const existingBook = await getBookById(id);

  if (!existingBook) {
    return res.status(404).json({ error: "Book not found" });
  }

  const mergedBook = {
    ...existingBook,
    ...changes
  };

  const validation = validateBook(mergedBook);

  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  const normalizedChanges = {
    ...changes,
    ...(changes.title !== undefined
      ? { title: validation.value.title }
      : {}),
    ...(changes.author !== undefined
      ? { author: validation.value.author }
      : {})
  };

  const result = await patchBook(id, normalizedChanges);

  if (result?.error === "not_found") {
    return res.status(404).json({ error: "Book not found" });
  }

  if (result?.error === "duplicate") {
    return res.status(409).json({
      error: "A book with this title and author already exists."
    });
  }

  return res.status(200).json(result.value);
}));
// DELETE /api/books/:id
app.delete("/api/books/:id", asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid book ID" });
  }

  const deleted = await deleteBook(id);

  if (!deleted) {
    return res.status(404).json({ error: "Book not found" });
  }

  return res.status(204).send();
}));

// GET /api/stats
app.get("/api/stats", asyncHandler(async (req, res) => {
  const stats = await getStats();
  return res.status(200).json(stats);
}));

// Deliberate async error test
app.get("/api/crash", asyncHandler(async (req, res) => {
  throw new Error("Deliberate async error test");
}));

// Unknown API routes
app.use("/api", (req, res) => {
  return res.status(404).json({
    error: "Not found"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Invalid JSON body"
    });
  }

  console.error(err);

  return res.status(500).json({
    error: "Something went wrong"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
