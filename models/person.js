const mongoose = require("mongoose");

const URL = process.env.MONGODB_URI

mongoose.set("strictQuery", false);

mongoose
	.connect(URL)
	.then((result) => {
		console.log("connected to MDB");
	})
	.catch((error) => {
		console.log("unable to connect");
	});

const personSchema = new mongoose.Schema({
	name: {
		type: String,
		minLength: 3,
	},
	number: {
		type: String,
		minLength: 8,
		validate:{
			validator: (v) => (/\d{2,3}-\d+/.test(v)),
			message: props => `${props.value} is not a valid phone number`
		}
	},
});

personSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	},
});


module.exports = mongoose.model("Personas", personSchema);
