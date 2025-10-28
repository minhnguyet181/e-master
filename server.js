require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./src/config/db');

const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');

const app = express();
const url = process.env.FRONTEND_URL;
app.use(cors({
  origin: url, 
  credentials: true, 
}));

app.use(express.json());

app.use('/e-master', authRoutes);
app.use('/e-master', userRoutes);

sequelize.sync()
  .then(() => {
    console.log('✅ Database synced');
    app.listen(1818, () => console.log('🚀 Server running on port 1818'));
  })
  .catch(err => console.error('❌ DB connection failed:', err));
