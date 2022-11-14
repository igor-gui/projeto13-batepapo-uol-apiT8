import express from "express";
import { MongoClient } from "mongodb";
import cors from 'cors';
import dotenv from 'dotenv';
import joi from "joi";
import bcrypt from 'bcrypt';
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI)
let db;

mongoClient.connect().then(() => {
    db = mongoClient.db("participants")
})
const app = express()
app.use(express.json())
app.use(cors())

const nameSchema = joi.object({ name: joi.string().required() })

app.post('/participants', async (req, res) => {
    const { name } = req.body
    const validation = nameSchema.validate(name, { abortEarly: true })

    if (validation.error) {
        const erros = validation.error.details.map((detail) => detail.message);
        res.status(422).send(erros);
        return;
    }
    const alreadyNamed = db.colection("participants").findOne(name)

    if(alreadyNamed){
        res.sendStatus(409)
        return;
    }


    try {
        await db.colection("participants").insertOne({ name: name, lastStatus: Date.now() })
        res.sendStatus(201)
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

app.get((req, res) => {
    let participants;
    db.collection("participants").find().toArray().then(lista => {
        participants = lista;
    });
    res.send(participants)
})

app.listen(5000)
