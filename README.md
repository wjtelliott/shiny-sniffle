# easy-cart

A demo shopping cart project for testing PostgreSQL CRUD and a custom user
auth token system.

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`PORT` (3000 as default)

`DATABASE_URL` (postgres//user:pass@endpoint/db)

## Installation

Installing this project and dependencies

```bash
  git clone https://github.com/wjtelliott/shiny-sniffle.git
  cd shiny-sniffle/
  npm run init
```

Run the server with (port 3000):

```bash
  npm run server
```

Run client with (live-server, port 3000):

```bash
  npm run client
```

Server will serve the client's build folder. Create the
client build with:

```bash
  (default):
  npm run build

  (windows):
  npm run winbuild
```
