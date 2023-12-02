// Used class file to determine what packages were needed
// and how to use them within the file
const express = require("express");
const app = express();
const joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");
const upload = multer({ dest: __dirname + "/public/images" });

app.listen(3000, () => {
  console.log("Listening");
});

mongoose
  .connect(
    "mongodb+srv://sattiabicsce:myuofsc3$@cluster0.5ito1rb.mongodb.net/"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Couldn't connect to MongoDB", error);
  });

const carSchema = new mongoose.Schema({
  make: String,
  model: String,
  year: Number,
  type: String,
  features: [String],
  color: String,
  img: String,
});

const Car = mongoose.model("Car", carSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/api/cars", upload.single("img"), (req, res) => {
  const result = validateCar(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  const car = new Car({
    make: req.body.make,
    model: req.body.model,
    year: req.body.year,
    type: req.body.type,
    features: req.body.features.split(","),
    color: req.body.color,
    img: String,
  });

  if (req.file) {
    car.img = "images/" + req.file.filename;
  }

  createCar(res, car);
});

const createCar = async (res, car) => {
  const result = await car.save();
  res.send(car);
};

app.put("/api/cars/:id", upload.single("img"), (req, res) => {
  const result = validateCar(req.body);
  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }
  updateCar(req, res);
});

const updateCar = async (req, res) => {
  let fields = {
    make: req.body.make,
    model: req.body.model,
    year: req.body.year,
    type: req.body.type,
    features: req.body.features.split(","),
    color: req.body.color,
  };

  if (req.file) {
    fields.img = "images/" + req.file.filename;
  }

  const result = await Car.updateOne({ _id: req.params.id }, fields);
  res.send(result);
};

app.delete("/api/cars/:id", (req, res) => {
  deleteCar(res, req.params.id);
});

const deleteCar = async (res, id) => {
  const car = await Car.findByIdAndDelete(id);
  res.send(car);
};

const validateCar = (car) => {
  const carSchema = joi.object({
    _id: joi.allow(""),
    make: joi.string().min(4).required(),
    model: joi.string().min(2).required(),
    year: joi.number().min(1).required(),
    type: joi.string().min(4).required(),
    features: joi.string().min(4).required(),
    color: joi.string().required(),
    // Found out that sense it is passed in as an object,
    // you dive in further to it to ensure it has a filename
    img: joi.object({
      filename: joi.string().required(),
    }),
  });

  return carSchema.validate(car);
};

app.get("/api/cars", (req, res) => {
  getCars(res);
});

const getCars = async (res) => {
  const cars = await Car.find();
  res.send(cars);
};

app.get("/api/cars/:id", (req, res) => {
  getCar(res, req.params.id);
});

const getCar = async (res, id) => {
  const car = await Car.findOne({ _id: id });
  res.send(car);
};
