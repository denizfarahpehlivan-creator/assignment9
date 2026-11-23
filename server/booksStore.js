const seedBooks = [
  {
    id: 1,
    title: "1984",
    author: "George Orwell",
    year: 1949,
    genre: "fiction",
    read: true,
    rating: 5,
  },
  {
    id: 2,
    title: "Dune",
    author: "Frank Herbert",
    year: 1965,
    genre: "science",
    read: false,
    rating: null,
  },
  {
    id: 3,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    year: 1937,
    genre: "fantasy",
    read: true,
    rating: 4,
  },
  {
    id: 4,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    year: 2011,
    genre: "history",
    read: false,
    rating: null,
  },
  {
    id: 5,
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    year: 1997,
    genre: "fantasy",
    read: true,
    rating: 5,
  },
  {
    id: 6,
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    year: 1988,
    genre: "science",
    read: false,
    rating: null,
  },
];

let books = seedBooks;

const delay = () => new Promise((resolve) => setTimeout(resolve, 100));

//create copy for every book than run a new set
export async function getAllBooks() {
  await delay();
  return books.map((book) => ({ ...book }));
}

export async function getBookById(id) {
  await delay();
  //with book.find we get the book by the id used
  const book = books.find((book) => book.id === id);

  return book ? { ...book } : null;
}

export async function addBook(bookData) {
  await delay();

  const duplicate = books.some(
    (book) =>
      book.title.toLowerCase() === bookData.title.toLowerCase() &&
      book.author.toLowerCase() === bookData.author.toLowerCase(),
  );

  if (duplicate) {
    return null;
  }

  const newId = Math.max(0, ...books.map((book) => book.id)) + 1;

  const newBook = {
    id: newId,
    ...bookData,
  };

  books = [...books, newBook];

  return { ...newBook };
}

export async function updateBook(id, bookData) {
  await delay();

  const existingBook = books.find((book) => book.id === id);

  if (!existingBook) {
    return { error: "not_found" };
  }

  const duplicate = books.some(
    (book) =>
      book.id !== id &&
      book.title.toLowerCase() === bookData.title.toLowerCase() &&
      book.author.toLowerCase() === bookData.author.toLowerCase(),
  );

  if (duplicate) {
    return { error: "duplicate" };
  }
  const updatedBook = {
    id,
    ...bookData,
  };

  //put the update book
  books = books.map((book) => (book.id === id ? updatedBook : book));

  return { value: { ...updatedBook } };
}

export async function patchBook(id, changes) {
  await delay();

  const existingBook = books.find((book) => book.id === id);

  if (!existingBook) {
    return { error: "not_found" };
  }

  const updatedBook = {
    ...existingBook,
    ...changes,
    id
  };

  const duplicate = books.some(
    (book) =>
      book.id !== id &&
      book.title.toLowerCase() === updatedBook.title.toLowerCase() &&
      book.author.toLowerCase() === updatedBook.author.toLowerCase()
  );

  if (duplicate) {
    return { error: "duplicate" };
  }

  books = books.map((book) =>
    book.id === id ? updatedBook : book
  );

  return { value: { ...updatedBook } };
}

export async function deleteBook(id) {
  await delay();

  const existingBook = books.find((book) => book.id === id);

  if (!existingBook) {
    return false;
  }

  books = books.filter((book) => book.id !== id);

  return true;
}
