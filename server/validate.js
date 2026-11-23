
const validGenres = [
  "fiction",
  "non-fiction",
  "science",
  "history",
  "fantasy",
  "other"
];

export function validateBook(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { error: "Book data must be an object" };
  }

  if (
    typeof data.title !== "string" ||
    data.title.trim().length < 1 ||
    data.title.trim().length > 100
  ) {
    return { error: "Title must be between 1 and 100 characters" };
  }

  if (
    typeof data.author !== "string" ||
    data.author.trim().length < 1 ||
    data.author.trim().length > 100
  ) {
    return { error: "Author must be between 1 and 100 characters" };
  }

  if (
    !Number.isInteger(data.year) ||
    data.year < 1000 ||
    data.year > new Date().getFullYear()
  ) {
    return { error: "Invalid publication year" };
  }

  if (!validGenres.includes(data.genre)) {
    return { error: "Invalid genre" };
  }

  if (data.read !== undefined && typeof data.read !== "boolean") {
    return { error: "Read must be true or false" };
  }

  const read = data.read ?? false;
  const rating = data.rating === undefined ? null : data.rating;

  if (
    rating !== null &&
    (!Number.isInteger(rating) || rating < 1 || rating > 5)
  ) {
    return { error: "Rating must be between 1 and 5 or null" };
  }

  if (!read && rating !== null) {
    return { error: "Unread books cannot have a rating" };
  }

  return {
    value: {
      title: data.title.trim(),
      author: data.author.trim(),
      year: data.year,
      genre: data.genre,
      read,
      rating
    }
  };
}

