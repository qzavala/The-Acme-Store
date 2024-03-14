const express = require("express");
const app = express();
app.use(express.json());
const {
    client, createTables, createUser, createProduct,
fetchUsers, fetchProducts, createUserFavorite,
fetchUserFavorites, deleteUserFavorite,
  } = require("./db");
  
  app.get("/api/users", async (req, res, next) => {
    try {
      res.send(await fetchUsers());
    } catch (ex) {
      next(ex);
    }
  });
  
  app.get("/api/products", async (req, res, next) => {
    try {
      res.send(await fetchProducts());
    } catch (ex) {
      next(ex);
    }
  });
  
  app.get("/api/users/:id/favorites", async (req, res, next) => {
    try {
      res.send(await fetchUserFavorites(req.params.id));
    } catch (ex) {
      next(ex);
    }
  });
  
  app.delete("/api/users/:userId/favorites/:id", async (req, res, next) => {
    try {
      await deleteUserFavorite({ user_id: req.params.userId, id: req.params.id });
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  });
  
  app.post("/api/users/:id/favorites", async (req, res, next) => {
    try {
      res
        .status(201)
        .send(
          await createUserFavorite({
            user_id: req.params.id,
            product_id: req.body.product_id,
          })
        );
    } catch (ex) {
      next(ex);
    }
  });
  
  const init = async () => {
    await client.connect();
    console.log("Connected database");
    await createTables();
    console.log("Tables Created");
  
    const [Tom, Timmy, Tamantha, Tim, Waters, Chips, Meats, Charger] =
      await Promise.all([
        createUser({ username: "Tom", password: "Tom123" }),
        createUser({ username: "Timmy", password: "Timmy123" }),
        createUser({ username: "Tamantha", password: "Tamantha123" }),
        createUser({ username: "Tim", password: "Tim123" }),
        createProduct({ name: "Waters" }),
        createProduct({ name: "Chips" }),
        createProduct({ name: "Meats" }),
        createProduct({ name: "Charger" }),
      ]);
  
    console.log(await fetchUsers());
    console.log(await fetchProducts());
  
    const userFavorites = await Promise.all([
      createUserFavorite({ user_id: Tom.id, product_id: Waters.id }),
      createUserFavorite({ user_id: Timmy.id, product_id: Chips.id }),
      createUserFavorite({ user_id: Tamantha.id, product_id: Meats.id }),
      createUserFavorite({ user_id: Tim.id, product_id: Charger.id }),
    ]);
  
    console.log(await fetchUserFavorites(Tom.id));
    await deleteUserFavorite({ user_id: Tom.id, id: userFavorites[0].id });
    console.log(await fetchUserFavorites(Tom.id));
  
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Listening on port ${port}`));
  };
  
  init();