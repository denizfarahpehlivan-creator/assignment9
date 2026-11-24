# Assignment 9 â€“ Book Management API

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
â”‚
â”œâ”€â”€ server/
â”‚   â”œâ”€â”€ server.js
â”‚   â”œâ”€â”€ booksStore.js
â”‚   â”œâ”€â”€ validate.js
â”‚   â””â”€â”€ .env.example
â”‚
â”œâ”€â”€ client/
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”‚   â””â”€â”€ books.js
â”‚   â”‚   â”œâ”€â”€ App.jsx
â”‚   â”‚   â”œâ”€â”€ App.css
â”‚   â”‚   â””â”€â”€ main.jsx
â”‚   â”œâ”€â”€ .env.example
â”‚   â””â”€â”€ package.json
â”‚
â””â”€â”€ README.md
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

### 3. POST â€“ Create a book

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

### 4. POST â€“ Invalid body

```powershell
curl.exe -i -X POST http://localhost:3000/api/books `
  -H "Content-Type: application/json" `
  -d '{"title":"","author":"Test","year":2020,"genre":"fiction"}'
```

Expected status: `400 Bad Request`

### 5. GET â€“ Repeated query parameter

```powershell
curl.exe -i "http://localhost:3000/api/books?genre=fantasy&genre=science"
```

Expected status: `400 Bad Request`

### 6. GET â€“ Missing book

```powershell
curl.exe -i http://localhost:3000/api/books/9999
```

Expected status: `404 Not Found`

### 7. POST â€“ Duplicate book

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

I moved express.json() below the routes and tested a POST request. The request returned 400 Bad Request with the error "Book data must be an object". This happened because req.body was not parsed before the route handler tried to validate it.

### 3. Why is return important before an early error response?

I removed return before the 404 response and tested an unknown route. The response was still 404 Not Found with the same JSON error. In this implementation, removing return did not change the result because no further normal middleware is called after the response.

### 4. What is the difference between PUT and PATCH?

PUT replaces the complete resource using the submitted data. PATCH changes only the fields included in the request. PATCH is useful for small updates, such as changing a reading status or rating, while PUT is appropriate when replacing the full book information.

### 5. What happens if CLIENT_ORIGIN is incorrect?

I started the server with CLIENT_ORIGIN set to http://localhost:9999 while the frontend was running at http://localhost:5173. The browser console reported a CORS error because the allowed origin did not match. The server still returned 200 OK, and curl also received 200 OK because curl does not enforce browser CORS restrictions. No server-side error was needed for this browser restriction to occur.

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

## Challenges Faced

During development, several challenges were encountered:

- Handling JSON request bodies correctly in PowerShell while testing the API with curl.exe.
- Implementing server-side validation for invalid and repeated query parameters.
- Handling duplicate books and returning appropriate HTTP status codes.
- Configuring CORS so that the React frontend can communicate with the Express backend.
- Understanding the difference between PUT and PATCH when updating book information.
- Working with in-memory storage and understanding why data resets after restarting the server.

These challenges helped improve understanding of REST API design, HTTP status codes, middleware, validation, and frontend-backend communication.
## Verified HTTP Test Results

All tests below were performed using curl.exe.

| Test | Expected Status | Actual Result |
|---|---:|---|
| GET books with filters | 200 | Passed |
| GET book by ID | 200 | Passed |
| POST new book | 201 | Passed |
| POST duplicate book | 409 | Passed |
| POST invalid body | 400 | Passed |
| Repeated genre query | 400 | Passed |
| GET missing book | 404 | Passed |
| PUT book | 200 | Passed |
| PATCH book | 200 | Passed |
| DELETE book | 204 | Passed |
| DELETE same book again | 404 | Passed |
| GET statistics before and after creation | 200 | Passed |

### POST Creation Response

HTTP/1.1 201 Created
Location: /api/books/8

### Duplicate POST Response

{"error":"A book with this title and author already exists."}

### Repeated Query Response

{"error":"Invalid genre"}

### Statistics Before Creation

{"total":7,"read":4,"unread":3,"averageRating":4.5}

### Statistics After Creation

{"total":8,"read":5,"unread":3,"averageRating":4.6}

## Actual curl --include Test Outputs

### 1. Statistics before changes
```text
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 111
ETag: W/"6f-dX87XUq7Hc1nXP7Rw8cjdc4006c"
Date: Tue, 24 Nov 2026 22:06:52 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"total":7,"read":4,"unread":3,"averageRating":4.5,"byGenre":{"fiction":1,"science":3,"fantasy":2,"history":1}}
```

### 2. List with two query parameters
```text
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 307
ETag: W/"133-TnitpctaqNKbyVMfv4SiC0tiQf4"
Date: Tue, 24 Nov 2026 22:06:52 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"page":1,"limit":50,"totalBooks":2,"totalPages":1,"books":[{"id":3,"title":"The Hobbit","author":"J.R.R. Tolkien","year":1937,"genre":"fantasy","read":true,"rating":4},{"id":5,"title":"Harry Potter and the Philosopher's Stone","author":"J.K. Rowling","year":1997,"genre":"fantasy","read":true,"rating":5}]}
```

### 3. Get one book
```text
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 101
ETag: W/"65-QU13BNyl+mmsd8jg7Z1/OfVNr5o"
Date: Tue, 24 Nov 2026 22:06:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":1,"title":"1984","author":"George Orwell","year":1949,"genre":"fiction","read":true,"rating":5}
```

### 4. Create book (201 and Location)
```text
HTTP/1.1 201 Created
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Location: /api/books/8
Content-Type: application/json; charset=utf-8
Content-Length: 129
ETag: W/"81-zvMzy63i2mRjzjS074ZmjliFh9E"
Date: Tue, 24 Nov 2026 22:06:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":8,"title":"README Evidence 20261125010653","author":"Evidence Author","year":2022,"genre":"science","read":true,"rating":4}
```

### 5. Invalid body (400)
```text
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 54
ETag: W/"36-2Rygc0uaNi6iZpfSVzMK4FGxgrE"
Date: Tue, 24 Nov 2026 22:06:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Title must be between 1 and 100 characters"}
```

### 6. Repeated query parameter (400)
```text
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 25
ETag: W/"19-mQYhBchq2WNfsGsbZVHDgV5XLd8"
Date: Tue, 24 Nov 2026 22:06:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Invalid genre"}
```

### 7. Missing book (404)
```text
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 26
ETag: W/"1a-9K7Ys+5Z9m3qczPTmMk82VGBL7g"
Date: Tue, 24 Nov 2026 22:06:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Book not found"}
```

### 8. Duplicate book (409)
```text
HTTP/1.1 409 Conflict
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 61
ETag: W/"3d-GBnKybuWIP+OinY/nj2iyiSjGGI"
Date: Tue, 24 Nov 2026 22:06:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"A book with this title and author already exists."}
```

### 9. PUT complete replacement (200)
```text
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 129
ETag: W/"81-qtM9Mf+6vg+nhqwaeP/eMhbt7NQ"
Date: Tue, 24 Nov 2026 22:06:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":8,"title":"README Evidence 20261125010653","author":"Evidence Author","year":2023,"genre":"science","read":true,"rating":4}
```

### 10. PATCH selected fields (200)
```text
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 129
ETag: W/"81-7jLyMRaSRAvbNi6MjCbtaz24USQ"
Date: Tue, 24 Nov 2026 22:06:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":8,"title":"README Evidence 20261125010653","author":"Evidence Author","year":2023,"genre":"science","read":true,"rating":5}
```

### 11. Statistics after changes
```text
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 111
ETag: W/"6f-DmYuQSYZaeGgwnJB0JyhVFH+5AI"
Date: Tue, 24 Nov 2026 22:06:54 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"total":8,"read":5,"unread":3,"averageRating":4.6,"byGenre":{"fiction":1,"science":4,"fantasy":2,"history":1}}
```

### 12. Delete book (204)
```text
HTTP/1.1 204 No Content
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Date: Tue, 24 Nov 2026 22:06:54 GMT
Connection: keep-alive
Keep-Alive: timeout=5

```

### 13. Repeat delete (404)
```text
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 26
ETag: W/"1a-9K7Ys+5Z9m3qczPTmMk82VGBL7g"
Date: Tue, 24 Nov 2026 22:06:54 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Book not found"}
```
