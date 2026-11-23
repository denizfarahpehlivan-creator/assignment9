
const seedBooks = [
  {
    id: 1,
    title: "1984",
    author: "George Orwell",
    year: 1949,
    genre: "fiction",
    read: true,
    rating: 5
  },
  {
    id: 2,
    title: "Dune",
    author: "Frank Herbert",
    year: 1965,
    genre: "science",
    read: false,
    rating: null
  },
  {
    id: 3,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    year: 1937,
    genre: "fantasy",
    read: true,
    rating: 4
  },
  {
    id: 4,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    year: 2011,
    genre: "history",
    read: false,
    rating: null
  },
  {
    id: 5,
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    year: 1997,
    genre: "fantasy",
    read: true,
    rating: 5
  },
  {
    id: 6,
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    year: 1988,
    genre: "science",
    read: false,
    rating: null
  }
];

let books = seedBooks;

const delay = () =>
  new Promise((resolve) => setTimeout(resolve, 100));

//create copy for every book than run a new set
export async function getAllBooks() {
  await delay();
  return books.map((book) => ({ ...book }));
}
