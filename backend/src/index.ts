import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";

const app = express();
const prisma = new PrismaClient();


app.use(express.json());
app.use(cors());

app.get("/api/notes", async (req, res) => {
    const notes = await prisma.note.findMany();
    res.json(notes);
});

app.post("/api/notes", async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res
            .status(400)
            .send("Titulo y contenido son requeridos");
    }
    try {
        const note = await prisma.note.create({
            data: { title, content }
        });
        res.json(note);

    } catch (error) {
        res
            .status(500)
            .send("Algo salio mal");
    }
});

app.put("/api/notes/:id", async (req, res) => {
    const { title, content } = req.body;
    const id = parseInt(req.params.id);

    if (!title || !content) {
        return res.status(400).send("Titulo y contenido son requeridos");
    }
    if (!id || isNaN(id)) {
        return res
            .status(400)
            .send("El id debe ser un numero")
    }

    try {
        const updatedNote = await prisma.note.update({
            where: { id },
            data: { title, content },
        });
        res.json(updatedNote);
    } catch (error) {
        res.status(500).send("Algo salio mal");
    }

});

app.delete("/api/notes/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    if (!id || isNaN(id)) {
        return res.status(400).send("ID es requerido");
    }

    try {
        await prisma.note.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).send("Algo salio mal");
    }
});


app.listen(5000, () => {
    console.log("server running on localhost:5000");
});