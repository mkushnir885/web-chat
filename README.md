# web-chat

## How to run

First of all, you should start the MySQL server. You can find the SQL script for database initialization in the `lib/database/sql/` directory.

Then, in the root directory of the project, create a `.env` file and specify the following environment variables:

```bash
# HTTP server configuration
HTTP_HOST=... # Hostname of HTTP server (default: "localhost") 
HTTP_PORT=... # Port of HTTP server (default: 8000)

# WebSocket server configuration
WS_HOST=... # Hostname of WebSocket server (default: "localhost")
WS_PORT=... # Port of WebSocket server (default: 8001)

# Database configuration
DB_NAME=... # Name of MySQL database (default: "web_chat")
DB_HOST=... # Hostname of MySQL server (default: "localhost")
DB_USER=... # Username to access database (default: "root")
DB_PASS=... # Password for the MySQL user (default: "")
```

To start the HTTP and WebSocket servers, use the following npm scripts:

```bash
npm run http
```

```bash
npm run ws
```

### Docker Compose

Alternatively, you can run application using Docker Compose. Run the following command in the root of the project:

```bash
docker compose up
```

This command will create three interconnected containers for the MySQL, HTTP, and WebSocket servers. The application will be available at http://localhost:8080.
