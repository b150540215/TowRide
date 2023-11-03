let fromAutocomplete, toAutocomplete;

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

  const service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix(
    {
      origins: [fromAddress],
      destinations: [toAddress],
      travelMode: "DRIVING",
    },
    callback
  );
}

function callback(response, status) {
  if (status == "OK") {
    const distance = response.rows[0].elements[0].distance.text;
    const duration = response.rows[0].elements[0].duration.text;
    document.getElementById(
      "result"
    ).innerHTML = `距离: ${distance}, 预计时间: ${duration}`;
  } else {
    document.getElementById("result").innerHTML = "无法计算距离，请重试。";
  }
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
