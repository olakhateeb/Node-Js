// routes/user.js

const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");
const bcrypt = require("bcrypt");

const db = dbSingleton.getConnection();

router.get("/", (req, res) => {
  const query = "SELECT * FROM users";

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { name, email, password } = req.body;
  const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?);";

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    bcrypt.hash(password, salt, (err, hashedPass) => {
      if (err) {
        res.status(500).send(err);
        return;
      }

      db.query(query, [name, email, hashedPass], (err, results) => {
        if (err) {
          res.status(500).send(err);
          return;
        }
        res.json({ message: "User added!", id: results.insertId });
      });
    });
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    if (results.length === 0) {
      return res.json({ message: "invalid email or password" });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        res.status(500).send(err);
        return;
      }

      if (!result) {
        return res.json({ message: "invalid email or password" });
      }
      res.json({ message: "login successful!" });
    });
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;

  const { name, email, password } = req.body;

  const query =
    "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?";
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    bcrypt.hash(password, salt, (err, hashedPass) => {
      if (err) {
        res.status(500).send(err);
        return;
      }

      db.query(query, [name, email, hashedPass, id], (err, results) => {
        if (err) {
          res.status(500).send(err);
          return;
        }

        res.json({ message: "User updated!" });
      });
    });
  });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM users WHERE id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({ message: "User deleted!" });
  });
});

module.exports = router;
