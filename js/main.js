'use stric'
const URL_API_GEOLOCATION = 'https://geo.ipify.org/api/v2/country,city?';
const KEY_API_GEOLOCATION = 'apiKey=at_lZFA8WlONLLRbSBUOmRltxRENO9mZ';
const addressDetails = document.querySelector('#address-details');
const inputSearch = document.querySelector("#input-search");
const btnSearch = document.querySelector('#btn-search');
let URL_API, coords = [];

document.getElementById("btn-search").addEventListener("click", () => {
  let IP = inputSearch.value;
  if (isValidIP(IP)) {
    URL_API = `${URL_API_GEOLOCATION}${KEY_API_GEOLOCATION}&ipAddress=${inputSearch.value}`;
    viewMap();
    getCoords();
    async function getCoords() {
      try {
        const data = await getData();
        coords[0] = data.location.lat;
        coords[1] = data.location.lng;

        const map = initMap();
        const geocoder = new google.maps.Geocoder();
        const infowindow = new google.maps.InfoWindow();
        geocodeLatLng(geocoder, map, infowindow, coords);
      } catch (error) {
      }
    }
  } else {
    console.log("IP no válido");
  }
});

async function viewMap() {
  const data = await getData();
  console.log(data);
  addressDetails.innerHTML = `
  <p> IP Address <span>${data.ip}</span> </p>
  <p> Location <span>${data.location.city}, ${data.location.region} ${data.location.postalCode}</span> </p>
  <p> Timezone <span>UTC${data.location.timezone}</span> <!-- add offset value dynamically using the API --> </p>
  <p> ISP <span>${data.isp}</span> </p>
  `;
}


async function getData(url = URL_API) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

function isValidIP(ip) {
  const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (ipPattern.test(ip)) {
    const octets = ip.split('.');
    for (let i = 0; i < octets.length; i++) {
      const octet = parseInt(octets[i]);
      if (octet < 0 || octet > 255) {
        return false;
      }
    }
    return true;
  }
  return false;
}
let map, infoWindow;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: { lat: 34.04915, lng: -118.09462 },
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.BOTTOM,
    },
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_CENTER,
    },
    scaleControl: false,
    streetViewControl: false,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
    },
    fullscreenControl: false,
  });
  infoWindow = new google.maps.InfoWindow();
  const geocoder = new google.maps.Geocoder();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        geocoder
          .geocode({ location: pos })
          .then((response) => {
            if (response.results[0]) {
              map.setZoom(16);

              const marker = new google.maps.Marker({
                position: pos,
                map: map,
              });
              infoWindow.setContent(response.results[0].formatted_address);
              infoWindow.open(map, marker);
            } else {
              window.alert("No results found");
            }
          })
          .catch((e) => window.alert("Geocoder failed due to: " + e))
      },

    );
  } else {
    handleLocationError(false, infoWindow, map.getCenter());
  }
  return map;
}

function geocodeLatLng(geocoder, map, infowindow, coords) {

  const latlng = {
    lat: coords[0],
    lng: coords[1],
  };

  geocoder
    .geocode({ location: latlng })
    .then((response) => {
      if (response.results[0]) {
        map.setZoom(16);

        const marker = new google.maps.Marker({
          position: latlng,
          map: map,
        });

        infowindow.setContent(response.results[0].formatted_address);
        infowindow.open(map, marker);
      } else {
        window.alert("No results found");
      }
    })
    .catch((e) => window.alert("Geocoder failed due to: " + e));
}
window.initMap = initMap;
