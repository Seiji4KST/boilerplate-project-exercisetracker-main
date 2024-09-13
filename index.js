const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Criar schema e modelo para o usuário
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
});

const exerciseSchema = new mongoose.Schema({
  username: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: true },
});

// Instanciação dos Modelos
const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

// Middleware
app.use((req, res, next) => {
  console.log(req.method, req.path, req.params, req.query, req.body);
  next();
});

// Endpoints
app.post('/api/users', async (req, res) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });
    if (!existingUser) {
      const newUser = await User.create({ username: req.body.username });
      return res.json({ username: newUser.username, _id: newUser._id });
    }
    return res.json({ username: existingUser.username, _id: existingUser._id });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return res.json({ error: 'Erro ao criar usuário' });
  }
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    // Encontrar o usuário pelo ID
    const user = await User.findById(req.params._id);
    if (!user) return res.json({ error: "user doesn't exist" });

    // Criar um novo exercício
    const newExercise = await Exercise.create({
      username: user.username,
      description: req.body.description,
      duration: req.body.duration,
      date: req.body.date ? new Date(req.body.date) : new Date(),
    });

    // Responder com o objeto do usuário incluindo o novo exercício
    return res.json({
      username: user.username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date.toDateString(),
      _id: user._id, // Mantém o ID como ObjectId
    });
  } catch (error) {
    console.error(error);
    return res.json({ error: "Operation failed" });
  }
});

app.get("/api/users", async(req, res) => {
  try {
    // Encontra todos os usuários e remove o campo __v
    const users = await User.find({}).select({ __v: 0 });
    return res.json(users); // Retorna a lista de usuários como um array
  } catch (error) {
    console.error(error);
    return res.json({ error: "invalid" });
  }
});


app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const user = await User.findById(req.params._id);
    if (!user) return res.json({ error: 'Usuário não encontrado' });

    const { from, to, limit } = req.query;
    let filter = { username: user.username };

    if (from) filter.date = { $gte: new Date(from) };
    if (to) filter.date = { ...filter.date, $lte: new Date(to) };

    const exercises = await Exercise.find(filter).limit(parseInt(limit)).select({ _id: 0, username: 0, __v: 0 });
    
    return res.json({
      _id: user._id,
      username: user.username,
      count: exercises.length,
      log: exercises.map(e => ({
        description: e.description,
        duration: e.duration,
        date: e.date.toDateString(),
      })),
    });
  } catch (error) {
    console.error('Erro ao obter log de exercícios:', error);
    return res.json({ error: 'Erro ao obter log de exercícios' });
  }
});

// Configurando a porta para o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
