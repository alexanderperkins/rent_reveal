var map;
var markers = [];
var infoWindow;

var API_BASE;
if (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
) {
  API_BASE = 'http://localhost:3000';
} else {
  API_BASE = 'https://rent-reveal.onrender.com';
}

fetch(API_BASE + '/api/config')
  .then(function (res) {
    return res.json();
  })
  .then(function (config) {
    var script = document.createElement('script');
    script.src =
      'https://maps.googleapis.com/maps/api/js?key=' +
      config.mapsApiKey +
      '&callback=initMap';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  })
  .catch(function () {
    console.log('Could not load Maps API key.');
  });
// eslint-disable-next-line no-unused-vars
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 42.3398, lng: -71.0892 },
    zoom: 12,
    styles: [
      {
        featureType: 'poi',
        stylers: [{ visibility: 'off' }],
      },
    ],
  });

  infoWindow = new google.maps.InfoWindow();
  loadPropertyMarkers();
}

function loadPropertyMarkers() {
  fetch(API_BASE + '/api/properties')
    .then(function (res) {
      return res.json();
    })
    .then(function (properties) {
      plotMarkers(properties);
    })
    .catch(function () {
      console.log('Could not load properties for map.');
    });
}

function plotMarkers(properties) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];

  var geocoder = new google.maps.Geocoder();

  for (var j = 0; j < properties.length; j++) {
    var p = properties[j];
    if (p.location.lat && p.location.lng) {
      plotMarker(p, { lat: p.location.lat, lng: p.location.lng });
    } else {
      geocodeAndPlot(geocoder, p);
    }
  }
}

function geocodeAndPlot(geocoder, property) {
  var fullAddress =
    property.location.address +
    ', ' +
    property.location.city +
    ', ' +
    property.location.state;

  geocoder.geocode({ address: fullAddress }, function (results, status) {
    if (status !== 'OK') return;

    var rating =
      property.reviewCount > 0
        ? property.averageRatings.overall.toFixed(1)
        : null;

    var color = '#888888';
    if (rating) {
      var r = parseFloat(rating);
      if (r >= 4) color = '#2ecc71';
      else if (r >= 3) color = '#e8a020';
      else color = '#c0392b';
    }

    var marker = new google.maps.Marker({
      position: results[0].geometry.location,
      map: map,
      title: property.location.address,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      label: rating
        ? {
            text: rating,
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 'bold',
          }
        : null,
    });

    var propertyId = property._id;
    var address = property.location.address + ', ' + property.location.city;
    var ratingText = rating ? '★ ' + rating : 'No ratings yet';
    var reviewText =
      property.reviewCount +
      ' review' +
      (property.reviewCount !== 1 ? 's' : '');

    marker.addListener('click', function () {
      infoWindow.setContent(
        '<div style="font-family:sans-serif;min-width:160px;">' +
          '<strong style="font-size:0.95rem;">' +
          address +
          '</strong>' +
          '<p style="margin:6px 0;color:#555;">' +
          ratingText +
          ' · ' +
          reviewText +
          '</p>' +
          '<a href="/pages/properties.html?id=' +
          propertyId +
          '" ' +
          'style="display:inline-block;margin-top:4px;padding:6px 12px;background:#333;color:white;' +
          'border-radius:4px;text-decoration:none;font-size:0.85rem;">View Reviews</a>' +
          '</div>'
      );
      infoWindow.open(map, marker);
    });

    markers.push(marker);
  });
}

function searchAddress() {
  var query = document.getElementById('address-input').value.trim();
  if (!query) return;

  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: query }, function (results, status) {
    if (status === 'OK') {
      map.setCenter(results[0].geometry.location);
      map.setZoom(15);
    } else {
      alert('Address not found. Try being more specific.');
    }
  });
}

document.getElementById('search-btn').addEventListener('click', searchAddress);

document
  .getElementById('address-input')
  .addEventListener('keydown', function (e) {
    if (e.key === 'Enter') searchAddress();
  });

function plotMarker(property, position) {
  var rating =
    property.reviewCount > 0
      ? property.averageRatings.overall.toFixed(1)
      : null;

  var color = '#888888';
  if (rating) {
    var r = parseFloat(rating);
    if (r >= 4) color = '#2ecc71';
    else if (r >= 3) color = '#e8a020';
    else color = '#c0392b';
  }

  var marker = new google.maps.Marker({
    position: position,
    map: map,
    title: property.location.address,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
    },
    label: rating
      ? {
          text: rating,
          color: '#ffffff',
          fontSize: '10px',
          fontWeight: 'bold',
        }
      : null,
  });

  var propertyId = property._id;
  var address = property.location.address + ', ' + property.location.city;
  var ratingText = rating ? '★ ' + rating : 'No ratings yet';
  var reviewText =
    property.reviewCount + ' review' + (property.reviewCount !== 1 ? 's' : '');

  marker.addListener('click', function () {
    infoWindow.setContent(
      '<div style="font-family:sans-serif;min-width:160px;">' +
        '<strong style="font-size:0.95rem;">' +
        address +
        '</strong>' +
        '<p style="margin:6px 0;color:#555;">' +
        ratingText +
        ' · ' +
        reviewText +
        '</p>' +
        '<a href="/pages/properties.html?id=' +
        propertyId +
        '" ' +
        'style="display:inline-block;margin-top:4px;padding:6px 12px;background:#333;color:white;' +
        'border-radius:4px;text-decoration:none;font-size:0.85rem;">View Reviews</a>' +
        '</div>'
    );
    infoWindow.open(map, marker);
  });

  markers.push(marker);
}
