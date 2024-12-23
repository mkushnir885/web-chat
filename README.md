# Web-chat

This project implements the basic functionality of web chat, which allows users to log in and exchange messages in real time. One of the key features is the minimization of external dependencies to ensure full control over the code base. The project has been developed taking into account the principles of extensibility and modularity, which allows you to easily add new functions or change existing ones.

The project uses Docker-Compose to provide easy deployment and management of the development environment, which adds convenience and improves opportunities for further development.

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

## Contributors

- [Mykola Kushnir](https://github.com/mkushnir885)
- [Maksym Yatsenko](https://github.com/yatsenkoM)
