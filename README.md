# Assignment 9 – Book Management API

## Project Overview

This project is a Book Management application developed using **Node.js, Express, React, and Vite**.

The backend provides a REST API for managing books. The frontend communicates with the API and allows users to add, edit, search, filter, sort, rate, and delete books.

The application also provides statistics about the book collection.

## Technologies

- Node.js
- Express
- React
- Vite
- JavaScript
- CSS
- CORS

## Project Structure

```text
assignment9/
│
├── server/
│   ├── server.js
│   ├── booksStore.js
│   ├── validate.js
│   └── .env.example
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── books.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## Installation and Running

### 1. Backend

Open a terminal:

```bash
cd server
npm install
npm run dev
```

The backend runs at:

`http://localhost:3000`

### 2. Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The frontend runs at:

`http://localhost:5173`

### 3. Environment Variables

The backend environment example (`server/.env.example`):

```env
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
```

The frontend environment example (`client/.env.example`):

```env
VITE_API_URL=http://localhost:3000/api
```

These are example files. To use custom environment variables, configure them in the terminal before starting the corresponding application.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/hello` | Welcome message |
| GET | `/api/books` | List books |
| GET | `/api/books/:id` | Get one book |
| POST | `/api/books` | Create a book |
| PUT | `/api/books/:id` | Replace a book |
| PATCH | `/api/books/:id` | Update selected fields |
| DELETE | `/api/books/:id` | Delete a book |
| GET | `/api/stats` | Get book statistics |

### Query Parameters

The books endpoint supports:

- `genre`: Filter by genre.
- `read`: Filter by reading status.
- `q`: Search by title or author.
- `year`: Filter by publication year.
- `minYear` and `maxYear`: Filter by a year range.
- `sort`: Sort by title, year, or rating.
- `order`: Sort ascending or descending.
- `page` and `limit`: Pagination.

Example:

```bash
curl "http://localhost:3000/api/books?genre=fantasy&read=true"
```

## Frontend Features

- Display all books.
- Add new books.
- Edit existing books.
- Toggle reading status.
- Rate books.
- Delete books.
- Search books by title or author.
- Filter by genre and reading status.
- Sort books.
- Display collection statistics.
- Display books grouped by genre.
- Show API errors to the user.

## HTTP Testing

The following commands can be used to test the API. Run them in PowerShell using `curl.exe`.

### 1. GET all books with multiple query parameters

```powershell
curl.exe -i "http://localhost:3000/api/books?genre=fantasy&read=true"
```

Expected status: `200 OK`

### 2. GET one book

```powershell
curl.exe -i http://localhost:3000/api/books/1
```

Expected status: `200 OK`

### 3. POST – Create a book

```powershell
$body = @{
    title = "Test Book"
    author = "Test Author"
    year = 2020
    genre = "fiction"
    read = $true
    rating = 5
} | ConvertTo-Json

curl.exe -i -X POST http://localhost:3000/api/books `
  -H "Content-Type: application/json" `
  -d $body
```

Expected status: `201 Created`

### 4. POST – Invalid body

```powershell
curl.exe -i -X POST http://localhost:3000/api/books `
  -H "Content-Type: application/json" `
  -d '{"title":"","author":"Test","year":2020,"genre":"fiction"}'
```

Expected status: `400 Bad Request`

### 5. GET – Repeated query parameter

```powershell
curl.exe -i "http://localhost:3000/api/books?genre=fantasy&genre=science"
```

Expected status: `400 Bad Request`

### 6. GET – Missing book

```powershell
curl.exe -i http://localhost:3000/api/books/9999
```

Expected status: `404 Not Found`

### 7. POST – Duplicate book

Send the same POST request twice using the same title and author.

Expected status for the duplicate: `409 Conflict`.

### 8. PUT and PATCH

PUT replaces the complete book data:

```powershell
$putBody = @{
    title = "Updated Test Book"
    author = "Test Author"
    year = 2021
    genre = "fiction"
    read = $true
    rating = 4
} | ConvertTo-Json

curl.exe -i -X PUT http://localhost:3000/api/books/1 `
  -H "Content-Type: application/json" `
  -d $putBody
```

PATCH updates only selected fields:

```powershell
curl.exe -i -X PATCH http://localhost:3000/api/books/1 `
  -H "Content-Type: application/json" `
  -d '{"read":true,"rating":5}'
```

Expected status: `200 OK` for successful updates.

### 9. DELETE

```powershell
curl.exe -i -X DELETE http://localhost:3000/api/books/1
```

Expected status: `204 No Content`.

Repeat the request:

```powershell
curl.exe -i -X DELETE http://localhost:3000/api/books/1
```

Expected status: `404 Not Found`.

### 10. Statistics

```powershell
curl.exe -i http://localhost:3000/api/stats
```

Run this before and after adding, updating, or deleting a book to observe how the statistics change.

## CORS Preflight Test

The following OPTIONS request was executed successfully:

```powershell
curl.exe -i -X OPTIONS http://localhost:3000/api/books `
  -H "Origin: http://localhost:5173" `
  -H "Access-Control-Request-Method: POST" `
  -H "Access-Control-Request-Headers: content-type"
```

Observed response:

```text
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE
Access-Control-Allow-Headers: Content-Type
Content-Length: 0
```

The response confirms that the preflight request from the configured frontend origin was accepted.

In the browser Network tab, an OPTIONS request can be inspected before a cross-origin request. Its response headers show the allowed origin, methods, and headers.

## Reasoning Questions

### 1. Why is the book ID a route parameter while genre and sort are query parameters?

The ID identifies one specific book, so it belongs in the route path. Genre and sort are optional ways to filter or organize a collection, so query parameters are more appropriate. If the ID were placed in the query string, the endpoint would be less clear about which resource it addresses.

### 2. What happens if express.json() is moved below the routes?

The JSON parsing middleware would not run before those routes. As a result, `req.body` would not contain the parsed JSON data when the POST or PUT handler executes. This can cause validation to fail and requests to return an error.

### 3. Why is return important before an early error response?

The return statement stops the handler after sending the response. Without it, execution may continue and attempt to send another response. This can cause an "Cannot set headers after they are sent" error.

### 4. What is the difference between PUT and PATCH?

PUT replaces the complete resource using the submitted data. PATCH changes only the fields included in the request. PATCH is useful for small updates, such as changing a reading status or rating, while PUT is appropriate when replacing the full book information.

### 5. What happens if CLIENT_ORIGIN is incorrect?

The browser rejects access to the response because the CORS origin does not match the configured allowed origin. The browser console reports a CORS error. A command-line request using curl can still receive an HTTP response because curl does not enforce browser CORS restrictions.

### 6. Why does the server validate data if the client already validates it?

Client-side validation improves the user experience, but it cannot be trusted as a security or data-integrity boundary. Requests can be sent directly to the API without using the frontend. Server-side validation protects the data regardless of the client.

### 7. What happens to the data after restarting the server?

The current book data is stored in memory in `booksStore.js`. Restarting the server resets the collection to the initial seed data. Persistent storage, such as a database or file-based storage, would be needed to retain changes after restarting.

## Self-Study Notes

### URLSearchParams

URLSearchParams provides a convenient way to create and manage URL query parameters. It helps build search and filtering URLs without manually concatenating query strings.

### localeCompare()

The `localeCompare()` method compares strings according to language-sensitive sorting rules. It is useful for sorting book titles alphabetically.

### Vite import.meta.env

Vite provides environment variables through `import.meta.env`. Variables exposed to frontend code must use the `VITE_` prefix.

### Express 5 and HTTP 204

HTTP status 204 means that the request succeeded but there is no response body. It is appropriate for successful DELETE requests.

### AbortController

AbortController allows a fetch request to be cancelled. It is useful when a component unmounts or a newer search request makes an older request unnecessary. An aborted request can be recognized using the `AbortError` name.

## Data Storage Limitation

The current implementation uses in-memory storage. Books added or changed during a session are not permanently saved and return to their seed state after the backend restarts.

## Build Verification

The frontend production build was tested successfully with:

```bash
cd client
npm run build
```

The Vite build completed successfully.
