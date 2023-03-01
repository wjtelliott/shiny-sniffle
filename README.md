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

## Routing Reference

### Client UI / Webpage

```http
  GET *
```

Serves React webpage `index.html` from `/shiny-sniffle/client/build/`

### API sanity check

```http
  GET /api/sanity
```

Returns JSON response `{ message: "backend is alive - users route }`

### Create new user

```http
  POST /api/new
```

| Parameter  | Type     | Description                          |
| :--------- | :------- | :----------------------------------- |
| `name`     | `string` | **Required**. Name for this user     |
| `password` | `string` | **Required**. Password for this user |

Creates a new user if the supplied `name` is not already taken.
Logs in this user with a one hour token.

Returns JSON response `{ token, expireTime, name }`

### Login

```http
  POST /api/login
```

| Parameter  | Type     | Description                          |
| :--------- | :------- | :----------------------------------- |
| `name`     | `string` | **Required**. Name for this user     |
| `password` | `string` | **Required**. Password for this user |

Login a user with a one hour token for the supplied `name` if the
password matches.

Returns JSON response `{ token, expireTime }` or a `403` JSON error message

### Testing a token

```http
  GET /api/test-token
```

| Header  | Type     | Description                               |
| :------ | :------- | :---------------------------------------- |
| `name`  | `string` | **Required**. Name for this user          |
| `token` | `string` | **Required**. Current token for this user |

Checks whether the supplied token is valid for this user and
not expired.

Returns JSON response message or `404` error whether the token is valid or not.

### Logout

```http
  POST /api/logout
```

| Parameter | Type     | Description                               |
| :-------- | :------- | :---------------------------------------- |
| `name`    | `string` | **Required**. Name for this user          |
| `token`   | `string` | **Required**. Current token for this user |

Logout a user if the token is valid and not expired.

Returns JSON response message or `404` error whether the token is valid or not.
