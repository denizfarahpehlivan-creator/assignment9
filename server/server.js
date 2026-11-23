import { validateBook } from "./validate.js";
import { addBook } from "./booksStore.js";
import {
  getAllBooks,
  getBookById,
  updateBook,
  patchBook,
  deleteBook
} from "./booksStore.js";
//famework that help with creating api and web server
import express from "express";
//provide communication between react and express api since they have diff ports
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

//middleware
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

//endpoint
app.get("/api/hello", async (req, res) => {
  res.json({ message: "Reading List API is working!" });
});

//await help with not responding till we get book datas
app.get("/api/books", async (req, res) => {
  const books = await getAllBooks();
  res.status(200).json(books);
});

app.get("/api/books/:id", async (req, res) => {
  const id = Number(req.params.id);
  //invlid request
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Book ID must be a positive integer",
    });
  }

  const book = await getBookById(id);
  if (!book) {
    return res.status(404).json({
      error: "Book not found",
    });
  }

  return res.status(200).json(book);
});

app.post("/api/books", async (req, res) => {
  const result = validateBook(req.body);

  if (result.error) {
    return res.status(400).json({
      error: result.error,
    });
  }

  const newBook = await addBook(result.value);

  if (!newBook) {
    return res.status(409).json({
      error: "A book with the same title and author already exists",
    });
  }

  return res.status(201).location(`/api/books/${newBook.id}`).json(newBook);
});

app.put("/api/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Book ID must be a positive integer",
    });
  }

  const result = validateBook(req.body);

  if (result.error) {
    return res.status(400).json({
      error: result.error,
    });
  }

  const updated = await updateBook(id, result.value);

  if (updated.error === "not_found") {
    return res.status(404).json({
      error: "Book not found",
    });
  }

  if (updated.error === "duplicate") {
    return res.status(409).json({
      error: "A book with the same title and author already exists",
    });
  }

  return res.status(200).json(updated.value);
});

app.patch("/api/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Book ID must be a positive integer",
    });
  }

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({
      error: "Book data must be an object",
    });
  }

  const existingBook = await getBookById(id);

  if (!existingBook) {
    return res.status(404).json({
      error: "Book not found",
    });
  }

  const allowedFields = ["title", "author", "year", "genre", "read", "rating"];

  const changes = {};

  for (const field of allowedFields) {
    if (Object.hasOwn(req.body, field)) {
      changes[field] = req.body[field];
    }
  }

  const mergedBook = {
    ...existingBook,
    ...changes,
  };

  const result = validateBook(mergedBook);

  if (result.error) {
    return res.status(400).json({
      error: result.error,
    });
  }

  const updated = await patchBook(id, result.value);

  if (updated.error === "duplicate") {
    return res.status(409).json({
      error: "A book with the same title and author already exists",
    });
  }

  if (updated.error === "not_found") {
    return res.status(404).json({
      error: "Book not found",
    });
  }

  return res.status(200).json(updated.value);
});

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


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
