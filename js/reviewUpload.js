var selectedPropertyId = null;

var API_BASE;
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  API_BASE = 'http://localhost:3000';
} else {
  API_BASE = 'https://rent-reveal.onrender.com';
}

// search for property

document.getElementById('search-btn').addEventListener('click', function () {
  var query = document.getElementById('address-input').value.trim();
  if (!query) return;

  document.getElementById('search-results').innerHTML = '<p class="empty-msg">Searching…</p>';
  document.getElementById('add-property-section').classList.add('hidden');

  fetch(API_BASE + '/api/properties?search=' + encodeURIComponent(query))
    .then(function (res) {
      return res.json();
    })
    .then(function (properties) {
      var resultsEl = document.getElementById('search-results');

      if (properties.length === 0) {
        resultsEl.innerHTML = '';
        document.getElementById('add-property-section').classList.remove('hidden');
        document.getElementById('new-address').value = query;
        return;
      }

      resultsEl.innerHTML = '';
      for (var i = 0; i < properties.length; i++) {
        var p = properties[i];
        var fullAddress = p.location.address + ', ' + p.location.city + ', ' + p.location.state + ' ' + p.location.zip;
        var rating = p.reviewCount > 0 ? '★ ' + p.averageRatings.overall.toFixed(1) : 'No ratings yet';

        var item = document.createElement('div');
        item.className = 'result-item';
        item.dataset.id = p._id;
        item.dataset.address = fullAddress;
        item.innerHTML =
          '<div class="result-address">' + p.location.address + '</div>' +
          '<div class="result-meta">' + p.location.city + ', ' + p.location.state + ' · ' + rating + '</div>';

        item.addEventListener('click', makeSelectHandler(p._id, fullAddress, item));
        resultsEl.appendChild(item);
      }
    })
    .catch(function () {
      document.getElementById('search-results').innerHTML = '';
      document.getElementById('add-property-section').classList.remove('hidden');
      document.getElementById('new-address').value = query;
    });
});

document.getElementById('address-input').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') document.getElementById('search-btn').click();
});

// return click handler for search
function makeSelectHandler(id, address, el) {
  return function () {
    var items = document.querySelectorAll('.result-item');
    for (var i = 0; i < items.length; i++) {
      items[i].classList.remove('selected');
    }
    el.classList.add('selected');
    selectProperty(id, address);
  };
}

// display review form for property
function selectProperty(id, address) {
  selectedPropertyId = id;
  document.getElementById('selected-address').textContent = address;
  document.getElementById('review-section').classList.remove('hidden');
  ratings = { overall: 0, management: 0, safety: 0, noise: 0, cleanliness: 0 };
  for (var c = 0; c < categories.length; c++) {
    var stars = document.getElementById('stars-' + categories[c]).querySelectorAll('.star');
    for (var i = 0; i < stars.length; i++) {
      stars[i].classList.remove('active');
    }
  }
  document.getElementById('comments').value = '';
  document.getElementById('submit-msg').textContent = '';
  document.getElementById('submit-msg').className = 'submit-msg';
}


// add new property
document.getElementById('add-property-btn').addEventListener('click', function () {
  var address = document.getElementById('new-address').value.trim();
  var city = document.getElementById('new-city').value.trim();
  var state = document.getElementById('new-state').value.trim();
  var zip = document.getElementById('new-zip').value.trim();

  if (!address || !city || !state || !zip) {
    alert('Please fill in all address fields.');
    return;
  }

  fetch(API_BASE + '/api/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: address, city: city, state: state, zip: zip }),
  })
    .then(function (res) { return res.json(); })
    .then(function (property) {
      document.getElementById('add-property-section').classList.add('hidden');
      var fullAddress = address + ', ' + city + ', ' + state + ' ' + zip;

      var item = document.createElement('div');
      item.className = 'result-item selected';
      item.innerHTML =
        '<div class="result-address">' + address + '</div>' +
        '<div class="result-meta">' + city + ', ' + state + ' · Just added</div>';

      var resultsEl = document.getElementById('search-results');
      resultsEl.innerHTML = '';
      resultsEl.appendChild(item);

      selectProperty(property._id, fullAddress);
    })
    .catch(function () {
      alert('Could not add property. Try again.');
    });
});

// star rating

// ratings state
var ratings = {
  overall: 0,
  management: 0,
  safety: 0,
  noise: 0,
  cleanliness: 0
};

// set up stars for each category
var categories = ['overall', 'management', 'safety', 'noise', 'cleanliness'];

for (var c = 0; c < categories.length; c++) {
  setupStars(categories[c]);
}

function setupStars(category) {
  var container = document.getElementById('stars-' + category);
  var stars = container.querySelectorAll('.star');

  for (var i = 0; i < stars.length; i++) {
    stars[i].addEventListener('click', makeStarHandler(category, i + 1, stars));
  }
}

function makeStarHandler(category, value, stars) {
  return function () {
    ratings[category] = value;
    for (var i = 0; i < stars.length; i++) {
      if (i < value) {
        stars[i].classList.add('active');
      } else {
        stars[i].classList.remove('active');
      }
    }
  };
}
// submit review

document.getElementById('submit-btn').addEventListener('click', function () {
  if (!selectedPropertyId) return;

  if (ratings.overall === 0) {
    showMsg('Please select an overall rating.', 'error');
    return;
  }

  var comments = document.getElementById('comments').value.trim();

  fetch(API_BASE + '/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      propertyId: selectedPropertyId,
      ratings: ratings,
      comments: comments,
    }),
  })
    .then(function (res) { return res.json(); })
    .then(function () {
      showMsg('Review submitted! Thank you.', 'success');
      ratings = { overall: 0, management: 0, safety: 0, noise: 0, cleanliness: 0 };
      for (var c = 0; c < categories.length; c++) {
        var stars = document.getElementById('stars-' + categories[c]).querySelectorAll('.star');
        for (var i = 0; i < stars.length; i++) {
          stars[i].classList.remove('active');
        }
      }
      document.getElementById('comments').value = '';
    })
    .catch(function () {
      showMsg('Could not submit. Try again.', 'error');
    });
});

function showMsg(text, type) {
  var el = document.getElementById('submit-msg');
  el.textContent = text;
  el.className = 'submit-msg ' + type;
}