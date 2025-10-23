require('dotenv').config();
const express = require('express');
const sequelize = require('./src/config/db');
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');

const app = express();
app.use(express.json());

app.use('/e-master', authRoutes);
app.use('/e-master', userRoutes);

sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Database synced');
  app.listen(1818, () => console.log('🚀 Server running on port 1818'));
});
