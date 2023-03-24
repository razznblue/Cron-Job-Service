import express from 'express';
import dotenv from 'dotenv';
dotenv.config();


const api = express.Router();

api.get('/characters', (req, res) => {
  const photoUrl = `${process.env.BASE_URL}/img/characters/corn.webp`;
  const characters = [
      {
        "name": "Corn",
        "primaryPhoto": photoUrl
      }
  ]
  res.json(characters);
})

export default api;