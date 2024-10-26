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
	(request, response,next) => {
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
			}).catch(error => next(error))
			;
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

	Person.collection.countDocuments().then((total) => {
		response.send(`<p>Phonebook has info for ${total} people.</p>
						<p>${time.toLocaleDateString()}</p>`);
	});
});

app.get("/api/persons/:id", (request, response, next) => {
	Person.findById(request.params.id)
		.then((result) => {
			if (result) {
				response.json(result);
			} else {
				response.status(400).end();
			}
		})
		.catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
	Person.findByIdAndDelete(request.params.id)
		.then((result) => {
			response.status(204).end();
		})
		.catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
	const body = request.body;

	const person = {
		name: body.name,
		number: body.number,
	};

	Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators:true})
		.then((result) => {
			response.json(result);
		})
		.catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
	// console.error(error.message);
	if (error.name === "CastError") {
		return response.status(400).send({ error: "bad id" });
	}

	next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on port:${PORT}`);
});
