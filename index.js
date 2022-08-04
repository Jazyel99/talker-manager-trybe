const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const crypto = require('crypto');
const { validateEmail, validatePassword } = require('./middlewares');

function generateToken() {
  return crypto.randomBytes(8).toString('hex');
}

const readTalkerJson = async (fileName) => {
  try {
    const talker = await fs.readFile(fileName, 'utf8');
    return talker;
  } catch (error) {
    return [];
  }
};

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (req, res) => {
  const talker = await readTalkerJson('talker.json');
  res.status(200).json(JSON.parse(talker));
});

app.get('/talker/:id', async (req, res) => {
  const talker = JSON.parse(await readTalkerJson('talker.json'));
  const idParams = req.params.id;
  
  const result = talker.find(({ id }) => id === Number(idParams));
  if (result) {
    res.status(200).json(result);
  } else {
    res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
});

app.post('/login', [validateEmail, validatePassword], (req, res) => {
  res.status(200).json({ token: generateToken() });
});

app.listen(PORT, () => {
  console.log('Online');
});
