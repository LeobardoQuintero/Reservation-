const { client, createTables, createCustomer, createRestaurant, createReservation, fetchCustomers, fetchRestaurants, fetchReservations, destroyReservation } = require('./db.js');
const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/customers', async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (ex) {
    next(ex);
  }
});

app.get('/api/restaurants', async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (ex) {
    next(ex);
  }
});

app.get('/api/reservations', async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (ex) {
    next(ex);
  }
});

app.delete('/api/customers/:customer_id/reservations/:id', async (req, res, next) => {
  try {
    await destroyReservation(req.params.id);
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

app.post('/api/customers/:id/reservations', async (req, res, next) => {
  try {
    res.status(201).send(await createReservation({customer_id:req.params.id, ...req.body}));
  } catch (ex) {
    next(ex);
  }
});

const init = async () => {
  await client.connect();
  console.log('Connected to the database');
  await createTables();
  console.log('Tables created');

  const [Torie, Vincent, Morgen, Canes, Shanes, Chick, Fiveguys] = await Promise.all([
    createCustomer('Torie'),
    createCustomer('Vincent'),
    createCustomer('Morgen'),
    createRestaurant('Canes'),
    createRestaurant('Shanes'),
    createRestaurant('Chick'),
    createRestaurant('Fiveguys')
  ]);

  console.log(`Morgen has an id of ${Morgen.id}`);
  console.log(`Canes has an id of ${Canes.id}`);
  {/*console.log(await fetchCustomers());
console.log(await fetchRestaurants());*/}

  await Promise.all([
    createReservation({ customer_id: Vincent.id, restaurant_id: Canes.id, reservation_date: '04/01/2024' }),
    createReservation({ customer_id: Torie.id, restaurant_id: Shanes.id, reservation_date: '04/15/2024' }),
    createReservation({ customer_id: Vincent.id, restaurant_id: Chick.id, reservation_date: '07/04/2024' }),
    createReservation({ customer_id: Morgen.id, restaurant_id: Fiveguys.id, reservation_date: '10/31/2024' }),
  ]);

  const reservations = await fetchReservations();
  console.log(reservations);

  await destroyReservation(reservations[0].id);
  console.log(await fetchReservations());

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Listening on port ${port}`));
};

init();
