import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import 'dotenv/config';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const pg_password = process.env.PASSWORD;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: pg_password,
  port: 5432,
});
db.connect();

async function getItems(){
  const result1 = await db.query("SELECT COUNT(id) FROM items;");
  if(result1.rows[0].count == 0){
    return [];
  }
  const result = await db.query("SELECT * FROM items");
  return result.rows;
}

app.get("/", async (req, res) => {
    const items = await getItems();
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  await db.query("INSERT INTO items(title) VALUES($1)",[item]);
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  await db.query("UPDATE items SET title = $1 WHERE id = $2",[req.body.updatedItemTitle, req.body.updatedItemId]);
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  await db.query("DELETE FROM items WHERE id= $1", [req.body.deleteItemId]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
