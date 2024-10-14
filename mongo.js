const mongoose = require("mongoose");

if (process.argv.length < 3) {
	console.log("missing arguments (password?)");
	process.exit(1);
}

const password = process.argv[2];
const URL = `mongodb+srv://nacho:${password}@phonebook.dcgxr.mongodb.net/people?retryWrites=true&w=majority&appName=phonebook`;
mongoose.set("strictQuery", false);
mongoose.connect(URL);

const personSchema = new mongoose.Schema({
	name: String,
	number: String,
});

const Person = mongoose.model("Personas", personSchema);

if (process.argv.length > 3) {
	const name = process.argv[3];
	const phoneNumber = process.argv[4];

	const person = new Person({
		name: name,
		number: phoneNumber,
	});

	person.save().then((result) => {
		console.log(`Added ${name}, number: ${phoneNumber} to the phonebook`);
		mongoose.connection.close();
	});
} else {
	Person.find({}).then((result) => {
		result.forEach((person) => {
			console.log(person);
		});
		mongoose.connection.close();
	});
}
