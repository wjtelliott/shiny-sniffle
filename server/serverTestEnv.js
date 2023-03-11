/**
 * Set up a mock app environment for testing
 */

const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// exclude middleware, apply in test file

module.exports = app;
