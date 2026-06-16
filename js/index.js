let map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 42.3398, lng: -71.0892 },
    zoom: 12
  });
}

function searchAddress() {
  const query = document.getElementById('address-input').value.trim();
  if (!query) return;

  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: query }, function(results, status) {
    if (status === 'OK') {
      map.setCenter(results[0].geometry.location);
      map.setZoom(15);
    } else {
      alert('Address not found. Try being more specific.');
    }
  });
}

document.getElementById('search-btn').addEventListener('click', searchAddress);

document.getElementById('address-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') searchAddress();
});