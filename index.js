const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;

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

app.listen(PORT, () => {
  console.log('Online');
});
