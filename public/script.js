const getCars = async () => {
  try {
    const response = await fetch("api/cars/");
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

const showCars = async () => {
  document.getElementById("cars").innerHTML = "";
  let cars = await getCars();
  cars.forEach((car) => {
    const section = document.createElement("section");
    const a = document.createElement("a");
    section.append(a);
    section.classList.add("column");
    a.href = "#";
    a.innerHTML = car.make;

    if (car.img) {
      const img = document.createElement("img");
      img.src = car.img;
      section.append(img);
    }

    document.getElementById("cars").append(section);
    a.onclick = (e) => {
      e.preventDefault();
      displayDetails(car);
    };
  });
};

displayDetails = (car) => {
  document.getElementById("details").innerHTML = "";
  const section = document.createElement("section");
  section.classList.add("column");

  const h2 = document.createElement("h2");
  h2.innerHTML = car.make;
  section.append(h2);

  if (car.img) {
    const img = document.createElement("img");
    img.src = car.img;
    section.append(img);
  }

  const p = document.createElement("p");
  p.innerHTML = `Model: ${car.model}`;
  section.append(p);

  const p2 = document.createElement("p");
  p2.innerHTML = `Year: ${car.year}`;
  section.append(p2);

  const type = document.createElement("p");
  type.innerHTML = `Type: ${car.type}`;
  section.append(type);

  const features = document.createElement("p");
  features.innerHTML = "Features: ";

  car.features.forEach((feature) => {
    if (feature == car.features[car.features.length - 1]) {
      features.innerHTML += `${feature}`;
    } else {
      features.innerHTML += `${feature}, `;
    }
  });

  section.append(features);

  const color = document.createElement("p");
  color.innerHTML = `Color: ${car.color}`;
  section.append(color);

  const editButton = document.createElement("a");
  editButton.innerHTML = "&#9998; ";
  editButton.classList.add("icon");
  editButton.id = "edit-button";
  section.append(editButton);

  const deleteButton = document.createElement("a");
  deleteButton.innerHTML = "&#x2715;";
  deleteButton.classList.add("icon");
  deleteButton.id = "delete-button";
  section.append(deleteButton);

  document.getElementById("details").append(section);

  editButton.onclick = (e) => {
    e.preventDefault();
    populateForm(car);
    showEditForm();
  };

  deleteButton.onclick = (e) => {
    e.preventDefault();
    deleteConfirmation(car);
  };
};

const addCar = async (e) => {
  e.preventDefault();
  let response;

  const form = document.getElementById("add-car-form");
  const result = document.getElementById("result");
  const formData = new FormData(form);

  if (form._id.value == -1) {
    formData.delete("_id");
    response = await fetch("/api/cars", {
      method: "POST",
      body: formData,
    });
  } else {
    response = await fetch(`/api/cars/${form._id.value}`, {
      method: "PUT",
      body: formData,
    });
  }

  if (response.status != 200 && form._id.value == -1) {
    result.innerHTML = "Error: your car was not added";
    result.style.color = "red";
    setTimeout(() => {
      result.innerHTML = "";
    }, 3000);
    return;
  }

  if (response.status != 200 && form._id.value != -1) {
    result.innerHTML = "Error: your car was not updated";
    result.style.color = "red";
    setTimeout(() => {
      result.innerHTML = "";
    }, 3000);
    return;
  }

  response = await response.json();

  if (form._id.value == -1) {
    result.innerHTML = "Car added successfully";
    result.style.color = "green";
    showCars();
    setTimeout(() => {
      result.innerHTML = "";
    }, 3000);
    document.getElementById("add-car-form").reset();
  }

  if (form._id.value != -1) {
    result.innerHTML = "Car updated successfully";
    result.style.color = "green";
    const car = await getCar(form._id.value);
    displayDetails(car);
    showCars();
    setTimeout(() => {
      result.innerHTML = "";
    }, 3000);
  }
};

const getCar = async (id) => {
  let response = await fetch(`/api/cars/${id}`);
  if (response.status != 200) {
    console.log("ERROR: Car not found");
    return;
  }
  return await response.json();
};

const populateForm = (car) => {
  const form = document.getElementById("add-car-form");
  form._id.value = car._id;
  form.make.value = car.make;
  form.model.value = car.model;
  form.year.value = car.year;
  form.type.value = car.type;
  form.color.value = car.color;
  populateFeatures(car.features);
};

const populateFeatures = (features) => {
  const input = document.getElementById("features");
  features.forEach((feature) => {
    if (feature == features[features.length - 1]) {
      input.value += feature;
    } else {
      input.value += feature + ", ";
    }
  });
};

const deleteConfirmation = (car) => {
  const panel = document.getElementById("delete-confirmation");
  panel.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.innerHTML = `Are you sure you want to delete ${car.make}?`;
  panel.append(h2);

  const yes = document.createElement("button");
  yes.innerHTML = "Yes";
  panel.append(yes);

  const no = document.createElement("button");
  no.innerHTML = "No";
  panel.append(no);

  panel.classList.remove("fade-out");
  panel.classList.remove("hide");
  panel.classList.add("fade-in");

  yes.onclick = () => {
    deleteCar(car);
    panel.classList.remove("fade-in");
    panel.classList.add("fade-out");
    setTimeout(() => {
      panel.classList.add("hide");
    }, 500);
  };

  no.onclick = () => {
    panel.classList.remove("fade-in");
    panel.classList.add("fade-out");
    setTimeout(() => {
      panel.classList.add("hide");
    }, 500);
  };
};

const deleteCar = async (car) => {
  let response = await fetch(`/api/cars/${car._id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
  if (response.status != 200) {
    console.log("Error: couldn't delete the car");
    return;
  }
  let result = await response.json();
  showCars();
  document.getElementById("details").innerHTML = "";
  document.getElementById("add-car-form").reset();
  document.getElementById("add-car-form")._id.value = -1;
};

const showForm = () => {
  const form = document.getElementById("add-car-form");
  form._id.value = -1;
  const formTitle = document.getElementById("form-title");
  formTitle.innerHTML = "Add A Car";
  form.classList.remove("fade-out");
  form.classList.remove("hide");
  form.classList.add("fade-in");
};

const hideForm = () => {
  const form = document.getElementById("add-car-form");
  form.classList.remove("fade-in");
  form.classList.add("fade-out");
  setTimeout(() => {
    form.classList.add("hide");
  }, 500);
  form.reset();
};

const showEditForm = () => {
  const formTitle = document.getElementById("form-title");
  formTitle.innerHTML = "Edit A Car";
  const form = document.getElementById("add-car-form");
  form.classList.remove("fade-out");
  form.classList.remove("hide");
  form.classList.add("fade-in");
};

window.onload = () => {
  showCars();
  document.getElementById("addCar").onclick = showForm;
  document.getElementById("add-car-form").onsubmit = addCar;
  document.getElementById("exit-button").onclick = hideForm;
};
