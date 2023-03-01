# easy-cart

A demo shopping cart project for testing PostgreSQL CRUD and a custom user
auth token system.

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file.
Make sure your environment file is in the directory `/shiny-sniffle/server/`

`PORT` (3000 or preference)

`DATABASE_URL` (postgres//user:pass@endpoint/db)

## Installation

Make sure you run the `database.sql` file in your PostgreSQL server before launching
this project.

Installing this project and dependencies:

```bash
  git clone https://github.com/wjtelliott/shiny-sniffle.git
  cd shiny-sniffle/
  npm run init
```

Run the server with (port 3000):

```bash
  (default)
  npm run server

  (deployment)
  npm run start
```

Run client with (live-server, port 3000):

```bash
  npm run client
```

Server will serve the client's build folder when deploying. Create the
client build with:

```bash
  (default):
  npm run build

  (windows):
  npm run winbuild
```

When deploying this project to the cloud, make sure your cloud
machine runs the correct `build` script and then the `start` script
in that order.

```bash
  npm run build **winbuild for windows**
  npm run start
```
