var API_BASE;
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  API_BASE = 'http://localhost:3000';
} else {
  API_BASE = 'https://rent-reveal.onrender.com';
}

// load properties when page is ready
document.addEventListener('DOMContentLoaded', function () {
  loadAllProperties();
});

// fetch and show properties
function loadAllProperties() {
  fetch(API_BASE + '/api/properties')
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

    item.addEventListener('click', makePropertyClickHandler(p));
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

  fetch(API_BASE + '/api/properties?search=' + encodeURIComponent(query))
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

// open reviews panel when property clicked
function makePropertyClickHandler(p) {
  return function () {
    var items = document.querySelectorAll('.property-item');
    for (var i = 0; i < items.length; i++) {
      items[i].classList.remove('selected');
    }
    this.classList.add('selected');
    loadReviews(p._id, p.location.address + ', ' + p.location.city);
  };
}

function loadReviews(propertyId, address) {
  document.getElementById('reviews-panel-address').textContent = address;
  document.getElementById('reviews-list').innerHTML = '<p class="empty-msg">Loading reviews…</p>';
  document.getElementById('reviews-panel').classList.remove('hidden');

  fetch(API_BASE + '/api/reviews?propertyId=' + propertyId)
    .then(function (res) {
      return res.json();
    })
    .then(function (reviews) {
      renderReviews(reviews);
    })
    .catch(function () {
      document.getElementById('reviews-list').innerHTML = '<p class="empty-msg">Could not load reviews.</p>';
    });
}

function renderReviews(reviews) {
  var list = document.getElementById('reviews-list');

  if (reviews.length === 0) {
    list.innerHTML = '<p class="empty-msg">No reviews yet. Be the first to submit one.</p>';
    return;
  }

  list.innerHTML = '';

  for (var i = 0; i < reviews.length; i++) {
    var r = reviews[i];
    var date = new Date(r.createdAt).toLocaleDateString();
    var stars = '★'.repeat(r.ratings.overall) + '☆'.repeat(5 - r.ratings.overall);

    var item = document.createElement('div');
    item.className = 'review-item';
    item.innerHTML =
      '<div class="review-header">' +
        '<span class="review-stars">' + stars + '</span>' +
        '<span class="review-date">' + date + '</span>' +
      '</div>' +
      '<p class="review-comment">' + (r.comments || 'No comment left.') + '</p>';

    list.appendChild(item);
  }
}

// close reviews panel
document.getElementById('reviews-close-btn').addEventListener('click', function () {
  document.getElementById('reviews-panel').classList.add('hidden');
  var items = document.querySelectorAll('.property-item');
  for (var i = 0; i < items.length; i++) {
    items[i].classList.remove('selected');
  }
});
