const express = require('express')
const joyas = require('./data/joyas')
const app = express()

const HATEOASV1 = () => joyas.results.map(j => ({ name: j.name, href: `http://localhost:3000/api/v1/joya/${j.id}` }));

const HATEOASV2 = () => joyas.results.map(j => ({ nombre: j.name, src: `http://localhost:3000/api/v2/joya/${j.id}` }));

const joya = (id) => joyas.results.find((j) => j.id == id);

const fieldsSelected = (joya, fields) => {
  return fields.reduce((acc, current) => {
    acc[current] = joya[current]
    return acc
  }, {})
};

const orderValue = (order) => {
  if (order === 'asc') {
    return joyas.results.sort((a, b) => (a.value > b.value ? 1 : -1))
  } else if (order === 'desc') {
    return joyas.results.sort((a, b) => (a.value < b.value ? 1 : -1))
  }
return joyas.results
};

const filterByCategory = (category) => joyas.results.filter((j) => j.category === category);

app.get('/', (req, res) => {
  res.send(joyas)
});

app.get('/api/v1/joyas', (req, res) => {
  res.send({
    joyas: HATEOASV1()
  })
});

app.get('/api/v2/joyas', (req, res) => {
  const { values } = req.query;

  if(values == 'asc') return res.send(orderValue('asc'));
  if(values == 'desc') return res.send(orderValue('desc'));

  if (req.query.page) {
    const { page } = req.query;
    return res.send({ joyas: HATEOASV2().slice(page * 2 - 2, page * 2) });
  }
  res.send({
    joyas: HATEOASV2()
  })
});

app.get('/api/v2/joya/:id', (req, res) => {
  const { id } = req.params
  const { fields } = req.query
  const actualJoya = joya(id)
  if (fields) return res.send({
    joya: fieldsSelected(actualJoya, fields.split(','))
  })

  if (actualJoya) {
    res.send({ joya: actualJoya })
  } else {
    res.status(404).send({
      error: "404 no encontrado",
      message: "No existe una joya con ese ID"
    })
  }
});

app.get('/api/v2/category/:categoria', (req, res) => {
  const { categoria } = req.params;
  const joyasFiltradas = filterByCategory(categoria)
  res.send({
    cant: joyasFiltradas.length,
    joyas: joyasFiltradas
  })
});

app.listen(3000, () => console.log('Your app listening on port 3000'));


