// load properties when page is ready
document.addEventListener('DOMContentLoaded', function () {
  loadAllProperties();
});

// fetch and show properties
function loadAllProperties() {
  fetch('/api/properties')
    .then(function (res) {
      return res.json();
    })
    .then(function (properties) {
      renderList(properties);
    })
    .catch(function () {
      document.getElementById('property-list').innerHTML =
        '<li class="empty-msg">Could not load properties.</li>';
    });
}

// render list
function renderList(properties) {
  var list = document.getElementById('property-list');

  if (properties.length === 0) {
    list.innerHTML = '<li class="empty-msg">No properties found.</li>';
    return;
  }

  list.innerHTML = '';

  for (var i = 0; i < properties.length; i++) {
    var p = properties[i];
    var rating = p.reviewCount > 0 ? '★ ' + p.averageRatings.overall.toFixed(1) : 'No ratings yet';

    var item = document.createElement('li');
    item.className = 'property-item';
    item.innerHTML =
      '<span class="item-address">' + p.location.address + ', ' + p.location.city + '</span>' +
      '<span class="item-meta">' + rating + ' · ' + p.reviewCount + ' reviews</span>';

    list.appendChild(item);
  }
}

// search
document.getElementById('search-btn').addEventListener('click', function () {
  var query = document.getElementById('property-search').value.trim();

  if (!query) {
    loadAllProperties();
    return;
  }

  fetch('/api/properties?search=' + encodeURIComponent(query))
    .then(function (res) {
      return res.json();
    })
    .then(function (properties) {
      renderList(properties);
    })
    .catch(function () {
      document.getElementById('property-list').innerHTML =
        '<li class="empty-msg">Error searching. Try again.</li>';
    });
});

document.getElementById('property-search').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    document.getElementById('search-btn').click();
  }
});