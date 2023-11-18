let fromAutocomplete,
	toAutocomplete,
	stopsOrder = [];

function initialize() {
	fromAutocomplete = new google.maps.places.Autocomplete(
		document.getElementById("fromAddress")
	);
	toAutocomplete = new google.maps.places.Autocomplete(
		document.getElementById("toAddress")
	);
}

function calculateDistance() {
	const fromAddress = document.getElementById("fromAddress").value;
	const toAddress = document.getElementById("toAddress").value;
	const stops = Array.from(document.getElementsByClassName("stop")).map(
		(stop) => stop.value
	);
	if (stops.length >= 2) {
		const userConsent = window.confirm(
			"Do you want to optimize the stops order for the shortest time?"
		);
		if (userConsent) {
			// If user agrees, calculate and display the optimized route
			calculateAndDisplayRoute(fromAddress, toAddress, stops, true);
		} else {
			calculateAndDisplayRoute(fromAddress, toAddress, stops, false);
		}
	} else {
		// If less than two stops, calculate and display the route without optimization
		calculateAndDisplayRoute(fromAddress, toAddress, stops, false);
	}
	// This will calculate and display the route without optimization
	document.getElementById("submitButton").style.display = "block";
}

function calculateAndDisplayRoute(fromAddress, toAddress, stops, optimize) {
	const directionsService = new google.maps.DirectionsService();
	const directionsRenderer = new google.maps.DirectionsRenderer();
	const map = new google.maps.Map(document.getElementById("map"), {
		zoom: 6,
		center: { lat: 37.77, lng: -122.447 },
	});
	directionsRenderer.setMap(map);

	const waypoints = stops
		.map((stop) => ({ location: stop, stopover: true }))
		.filter((stop) => stop.location);
	const request = {
		origin: fromAddress,
		destination: toAddress,
		waypoints: waypoints,
		optimizeWaypoints: optimize,
		travelMode: "DRIVING",
	};

	directionsService.route(request, function (response, status) {
		if (status === "OK") {
			directionsRenderer.setDirections(response);
			const route = response.routes[0];

			if (optimize && route.waypoint_order.length > 0) {
				updateStopsOrder(route.waypoint_order, stops);
			}
			let totalDistance = 0;
			for (const leg of route.legs) {
				totalDistance += leg.distance.value / 1609.34; // Convert to kilometers or miles as needed
			}
			displayResult(totalDistance);
			// Remaining logic for displaying route...
		} else {
			window.alert("Directions request failed due to " + status);
		}
	});
}
function displayResult(totalDistance) {
	var price = 30.0;
	if (totalDistance > 5) {
		price += (totalDistance - 5.0) * 3;
	}
	totalDistance = totalDistance.toFixed(2);
	price = price.toFixed(2);
	document.getElementById(
		"result"
	).innerHTML = `Total Distance: ${totalDistance} Miles, Estimated Price: ${price}$`;
}

function updateStopsOrder(waypointOrder, stops) {
	const stopsContainer = document.getElementById("stopsContainer");

	// Clear the current stopsContainer
	while (stopsContainer.firstChild) {
		stopsContainer.removeChild(stopsContainer.firstChild);
	}

	// Re-add stop inputs in the order provided by waypointOrder
	waypointOrder.forEach((index, order) => {
		const stopDiv = document.createElement("div");
		stopDiv.className = "stopContainer";

		const stopInput = document.createElement("input");
		stopInput.type = "text";
		stopInput.className = "stop";
		stopInput.value = stops[index];
		stopInput.placeholder = "Stop " + (order + 1);

		const moveUpButton = document.createElement("button");
		moveUpButton.innerHTML = "↑";
		moveUpButton.onclick = function () {
			moveStop(stopDiv, true);
		};

		const moveDownButton = document.createElement("button");
		moveDownButton.innerHTML = "↓";
		moveDownButton.onclick = function () {
			moveStop(stopDiv, false);
		};

		const deleteButton = document.createElement("button");
		deleteButton.innerHTML = "X";
		deleteButton.onclick = function () {
			deleteStop(stopDiv);
		};

		stopDiv.appendChild(moveUpButton);
		stopDiv.appendChild(moveDownButton);
		stopDiv.appendChild(deleteButton);
		stopDiv.appendChild(stopInput);

		stopsContainer.appendChild(stopDiv);

		// Reinitialize autocomplete
		new google.maps.places.Autocomplete(stopInput);
	});
}

google.maps.event.addDomListener(window, "load", initialize);

// 获取当前日期时间并设置起始时间为下一个小时
const now = new Date();
let startHour = now.getHours() + 2;
const currentTime = new Date(
	now.getFullYear(),
	now.getMonth(),
	now.getDate(),
	startHour,
	0,
	0
);

// 为预约时间下拉列表生成时间段
const bookingTimeDropdown = document.getElementById("bookingTime");

// 添加 "ASAP" 选项
const asapOption = document.createElement("option");
asapOption.value = "ASAP";
asapOption.text = "ASAP";
bookingTimeDropdown.appendChild(asapOption);

// 添加接下来的时间段
for (let i = 0; i < 30; i++) {
	// 20 slots of 15 minutes each
	const timeOption = document.createElement("option");
	timeOption.value = currentTime.toTimeString().slice(0, 5);
	timeOption.text = currentTime.toTimeString().slice(0, 5);
	bookingTimeDropdown.appendChild(timeOption);
	currentTime.setMinutes(currentTime.getMinutes() + 15);
}

document.getElementById("locateMe").addEventListener("click", function () {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const pos = {
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				};

				// Convert the lat/lng to an address using Google Maps Geocoding API
				const geocoder = new google.maps.Geocoder();
				geocoder.geocode({ location: pos }, function (results, status) {
					if (status === "OK") {
						document.getElementById("fromAddress").value =
							results[0].formatted_address;
					} else {
						alert(
							"Geocode was not successful for the following reason: " + status
						);
					}
				});
			},
			() => {
				handleLocationError(true);
			}
		);
	} else {
		handleLocationError(false);
	}
});

document.getElementById("addStopButton").addEventListener("click", function () {
	const stopsContainer = document.getElementById("stopsContainer");
	const numberOfStops = stopsContainer.getElementsByClassName("stop").length;

	if (numberOfStops < 4) {
		const stopDiv = document.createElement("div");
		stopDiv.className = "stopContainer";

		const stopInput = document.createElement("input");
		stopInput.type = "text";
		stopInput.className = "stop";
		stopInput.placeholder = "Stop " + (numberOfStops + 1);

		const moveUpButton = document.createElement("button");
		moveUpButton.innerHTML = "↑";
		moveUpButton.onclick = function () {
			moveStop(stopDiv, true);
		};

		const moveDownButton = document.createElement("button");
		moveDownButton.innerHTML = "↓";
		moveDownButton.onclick = function () {
			moveStop(stopDiv, false);
		};

		const deleteButton = document.createElement("button");
		deleteButton.innerHTML = "X";
		deleteButton.onclick = function () {
			deleteStop(stopDiv);
		};

		stopDiv.appendChild(moveUpButton);
		stopDiv.appendChild(moveDownButton);
		stopDiv.appendChild(deleteButton);
		stopDiv.appendChild(stopInput);

		stopsContainer.appendChild(stopDiv);

		new google.maps.places.Autocomplete(stopInput);
	} else {
		alert("You can add up to 4 stops only.");
	}
});
function moveStop(stopDiv, moveUp) {
	const stopsContainer = document.getElementById("stopsContainer");
	if (moveUp && stopDiv.previousElementSibling) {
		stopsContainer.insertBefore(stopDiv, stopDiv.previousElementSibling);
	} else if (!moveUp && stopDiv.nextElementSibling) {
		stopsContainer.insertBefore(stopDiv.nextElementSibling, stopDiv);
	}

	updateStopPlaceholders();
}

function updateStopPlaceholders() {
	const stopInputs = document.getElementsByClassName("stop");
	for (let i = 0; i < stopInputs.length; i++) {
		stopInputs[i].placeholder = "Stop " + (i + 1);
	}
}

function deleteStop(stopDiv) {
	stopDiv.remove();
	updateStopPlaceholders();
}

// function updateSubmitButtonState() {
// 	var userName = document.getElementById("userName").value.trim();
// 	var userPhone = document.getElementById("userPhone").value.trim();
// 	var submitButton = document.getElementById("submitButton");

// 	if (userName && userPhone) {
// 		submitButton.disabled = false;
// 	} else {
// 		submitButton.disabled = true;
// 	}
// }

// // Event listeners to check the input fields on every input
// document
// 	.getElementById("userName")
// 	.addEventListener("input", updateSubmitButtonState);
// document
// 	.getElementById("userPhone")
// 	.addEventListener("input", updateSubmitButtonState);

function validateInputs() {
	var isValid = true;
	var userName = document.getElementById("userName").value.trim();
	var userPhone = document.getElementById("userPhone").value.trim();
	var nameError = document.getElementById("nameError");
	var phoneError = document.getElementById("phoneError");

	if (!userName) {
		nameError.style.display = "inline";
		isValid = false;
	} else {
		nameError.style.display = "none";
	}

	if (!userPhone) {
		phoneError.style.display = "inline";
		isValid = false;
	} else {
		phoneError.style.display = "none";
	}

	return isValid;
}

// Call validateInputs function when the submit button is clicked
document
	.getElementById("submitButton")
	.addEventListener("click", function (event) {
		// Prevent the default form submission behavior
		event.preventDefault();

		// Validate inputs
		if (!validateInputs()) {
			// If validation fails, return early and do not proceed with the rest of the function
			return;
		}

		console.log(123);
		// Proceed with the rest of the function if validation is successful
		// ... your existing code for what happens when the button is clicked ...
	});
