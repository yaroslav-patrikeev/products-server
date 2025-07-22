import express from "express";
import cors from "cors";
import { products } from "./mock/products.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(join(__dirname, "public")));

app.use(express.json());
app.use(cors());

app.get("/product", (req, res) => {
  const { sortedBy } = req.query;
  switch (sortedBy) {
    case "price": {
      res.send([...products].sort((a, b) => a.price - b.price));
    }
    default: {
      res.send(products);
    }
  }
});

app.post("/product", (req, res) => {
  try {
    const { name, price, description, category, stock, imageUrl, rating } =
      req.body;
    products.push({
      id: products?.at(-1)?.id + 1,
      name,
      price,
      description,
      category,
      stock,
      imageUrl,
      rating,
      createdAt: new Date(),
    });
    res.status(201).send(products.at(-1));
  } catch (err) {
    res.status(400).send({ errorMessage: err });
  }
});

app.put("/product/:id", (req, res) => {
  try {
    const { name, price, description, category, stock, imageUrl, rating } =
      req.body;
    const { id } = req.params;
    const productIndex = products.findIndex((p) => p.id === Number(id));
    if (productIndex === -1) {
      return res.status(404).json({ errorMessage: "Товар не найден" });
    }
    products[productIndex] = {
      ...products[productIndex],
      name,
      price,
      description,
      category,
      stock,
      imageUrl,
      rating,
      createdAt: new Date(),
    };
    res.send(products[productIndex]);
  } catch (err) {
    res.status(400).send({ errorMessage: err });
  }
});

app.delete("/product/:id", (req, res) => {
  try {
    const { id } = req.params;
    const productIndex = products.findIndex((p) => p.id === Number(id));
    if (productIndex === -1) {
      return res.status(404).json({ errorMessage: "Товар не найден" });
    }
    const product = products[productIndex];
    products.splice(productIndex, 1);
    res.send(product);
  } catch (err) {
    res.status(400).send({ errorMessage: err });
  }
});

app.patch("/product/:id/purchase", (req, res) => {
  try {
    const { id } = req.params;
    const productIndex = products.findIndex((p) => p.id === Number(id));
    if (productIndex === -1) {
      return res.status(404).json({ errorMessage: "Товар не найден" });
    }
    if (products[productIndex].stock > 0) {
      products[productIndex] = {
        ...products[productIndex],
        stock: products[productIndex].stock - 1,
      };
      res.send(products[productIndex]);
    } else {
      return res.status(400).send({ errorMessage: "Недостаточно товара" });
    }
  } catch (err) {
    res.status(400).send({ errorMessage: err });
  }
});

app.get("/adminPanel", (req, res) => {
  if (req.headers?.token === "12345") {
    res.send("Успешно");
  } else {
    res.status(401).send("Ошибка авторизации");
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
