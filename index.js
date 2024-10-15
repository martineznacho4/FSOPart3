require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const Person = require("./models/person");
const app = express();

app.use(express.static("dist"));

app.use(express.json());
var logStream = fs.createWriteStream(path.join(__dirname, "requests.log"), {
	flags: "a",
});

morgan.token("post", (req, res) => JSON.stringify(req.body));

let persons = [
	{
		id: "1",
		name: "Arto Hellas",
		number: "040-123456",
	},
	{
		id: "2",
		name: "Ada Lovelace",
		number: "39-44-5323523",
	},
	{
		id: "3",
		name: "Dan Abramov",
		number: "12-43-234345",
	},
	{
		id: "4",
		name: "Mary Poppendieck",
		number: "39-23-6423122",
	},
];

app.post(
	"/api/persons",
	morgan(":method :url :status :post", { stream: logStream }),
	(request, response) => {
		const body = request.body;

		if (!body.name || !body.number) {
			response.status(400).json({
				error: "Missing name or number",
			});
		} else {
			const person = new Person({
				name: body.name,
				number: body.number,
			});

			person.save().then((savedPerson) => {
				response.json(savedPerson);
			});
		}
	}
);

app.use(morgan("tiny", { stream: logStream }));

app.get("/api/persons", (request, response) => {
	Person.find({}).then((persons) => {
		response.json(persons);
	});
});

app.get("/info", (request, response) => {
	const time = new Date();

	response.send(`<p>Phonebook has info for ${persons.length} people.</p>
                   <p>${time.toLocaleDateString()}</p>`);
});

app.get("/api/persons/:id", (request, response) => {
	const id = request.params.id;

	const person = persons.find((person) => person.id === id);

	if (person) {
		response.json(person);
	} else {
		response.status(404).end();
	}
});

app.delete("/api/persons/:id", (request, response) => {
	persons = persons.filter((person) => person.id !== request.params.id);

	response.status(204).end();
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on port:${PORT}`);
});
