import { getAllBooks } from "./booksStore.js";
//famework that help with creating api and web server
import express from "express";
//provide communication between react and express api since they have diff ports
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get("/api/hello", async (req, res) => {
  res.json({ message: "Reading List API is working!" });
});

//await help with not responding till we get book datas
app.get("/api/books", async (req, res) => {
  const books = await getAllBooks();
  res.status(200).json(books);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
