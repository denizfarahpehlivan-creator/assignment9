
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.error || `Request failed: ${response.status}`);
  }

  return data;
}

export function getBooks(params, signal) {
  return request(`/books?${params.toString()}`, { signal });
}

export function getStats() {
  return request("/stats");
}

export function createBook(book) {
  return request("/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
}

export function updateBook(id, book) {
  return request(`/books/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
}

export function patchBook(id, changes) {
  return request(`/books/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  });
}

export function deleteBook(id) {
  return request(`/books/${id}`, {
    method: "DELETE",
  });
}
