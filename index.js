const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const crypto = require('crypto');
const { validateEmail, 
  validatePassword, validateToken,
  validateName,
  validateAge,
  validateTalk,
  validateWatchedAt,
  validateRate } = require('./middlewares');

const TALKERS_FILE_JSON = 'talker.json';

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

const writeTalkersJson = async (talkers) => {
  const data = JSON.stringify(talkers);

  fs.writeFile(TALKERS_FILE_JSON, data, (err) => {
      if (err) throw err;
      console.log('Data written to file');
  });
};

const createNewTalker = async (talker) => {
  const talkers = await readTalkerJson(TALKERS_FILE_JSON);

  const lastTalker = JSON.parse(talkers).length;

  const newTalker = {
    id: lastTalker + 1,
    ...talker,
  };

  return newTalker;
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

app.post('/talker', [validateToken, validateName, validateAge,
validateTalk, validateWatchedAt, validateRate], async (req, res) => {
  const talker = req.body;

  const talkers = JSON.parse(await readTalkerJson(TALKERS_FILE_JSON));
  const newTalker = await createNewTalker(talker);
  talkers.push(newTalker);

  writeTalkersJson(talkers);

  res.status(201).json(newTalker);
});

// ::DONE 6 - Crie o endpoint PUT /talker/:id
app.put('/talker/:id', [validateToken, validateName, validateAge,
validateTalk, validateWatchedAt, validateRate], async (req, res) => {
  const idParams = req.params.id;
  const talker = req.body;
  const talkers = JSON.parse(await readTalkerJson(TALKERS_FILE_JSON));
  
  const newTalkers = talkers.filter(({ id }) => Number(idParams) !== id);
  
  const newTalker = {
    id: Number(idParams),
    ...talker,
  };
  
  newTalkers.push(newTalker);
  newTalkers.sort((a, b) => a.id - b.id);
  writeTalkersJson(newTalkers);
  res.status(200).json(newTalker);
});

app.delete('/talker/:id', validateToken, async (req, res) => {
  const idParams = req.params.id;
  const talkers = JSON.parse(await readTalkerJson(TALKERS_FILE_JSON));
  const newTalkers = talkers.filter(({ id }) => Number(idParams) !== id);
  writeTalkersJson(newTalkers);

  res.status(204).send('');
});

app.listen(PORT, () => {
  console.log('Online');
});
