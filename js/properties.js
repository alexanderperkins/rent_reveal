var API_BASE;
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  API_BASE = 'http://localhost:3000';
} else {
  API_BASE = 'https://rent-reveal.onrender.com';
}

// load properties when page is ready
document.addEventListener('DOMContentLoaded', function () {
  loadAllProperties().then(function () {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    if (id) {
      var item = document.querySelector('[data-id="' + id + '"]');
      if (item) item.click();
    }
  });
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


// Show list of properties
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
    item.dataset.id = p._id;
    item.innerHTML =
      '<span class="item-address">' + p.location.address + ', ' + p.location.city + '</span>' +
      '<span class="item-meta">' + rating + ' · ' + p.reviewCount + ' reviews</span>' +
      '<button class="property-delete-btn">✕</button>';

    item.querySelector('.property-delete-btn').addEventListener('click', makePropertyDeleteHandler(p._id, item));
    item.addEventListener('click', makePropertyClickHandler(p));
    list.appendChild(item);
  }
}

// Handle delete property
function makePropertyDeleteHandler(propertyId, item) {
  return function (e) {
    e.stopPropagation(); // prevent opening the reviews panel
    if (!confirm('Delete this property and all its reviews?')) return;
    fetch(API_BASE + '/api/properties/' + propertyId, { method: 'DELETE' })
      .then(function (res) { return res.json(); })
      .then(function () {
        var panel = document.getElementById('reviews-panel');
        if (panel && panel.dataset.propertyId === propertyId) panel.remove();
        item.remove();
      })
      .catch(function () {
        alert('Could not delete property. Try again.');
      });
  };
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
    // if already open for this property, close it
    var existing = document.getElementById('reviews-panel');
    if (existing && existing.dataset.propertyId === p._id) {
      existing.remove();
      this.classList.remove('selected');
      return;
    }

    // remove any existing panel
    if (existing) existing.remove();
    var items = document.querySelectorAll('.property-item');
    for (var i = 0; i < items.length; i++) {
      items[i].classList.remove('selected');
    }

    this.classList.add('selected');

    // create panel and insert after this item
    var panel = document.createElement('li');
    panel.id = 'reviews-panel';
    panel.className = 'reviews-panel';
    panel.dataset.propertyId = p._id;
    panel.innerHTML =
      '<div class="reviews-panel-header">' +
        '<h3 class="reviews-panel-title">' + p.location.address + ', ' + p.location.city + '</h3>' +
        '<button class="reviews-close-btn">✕</button>' +
      '</div>' +
      '<div id="reviews-list"><p class="empty-msg">Loading reviews…</p></div>';

    this.insertAdjacentElement('afterend', panel);

    panel.querySelector('.reviews-close-btn').addEventListener('click', function () {
      panel.remove();
      items = document.querySelectorAll('.property-item');
      for (var i = 0; i < items.length; i++) {
        items[i].classList.remove('selected');
      }
    });

    loadReviews(p._id);
  };
}

function loadReviews(propertyId) {
  fetch(API_BASE + '/api/reviews?propertyId=' + propertyId)
    .then(function (res) { return res.json(); })
    .then(function (reviews) { renderReviews(reviews); })
    .catch(function () {
      document.getElementById('reviews-list').innerHTML =
        '<p class="empty-msg">Could not load reviews.</p>';
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

    var cats = [
      { label: 'Management', key: 'management' },
      { label: 'Safety', key: 'safety' },
      { label: 'Noise', key: 'noise' },
      { label: 'Cleanliness', key: 'cleanliness' }
    ];

    var catHTML = '';
    for (var j = 0; j < cats.length; j++) {
      var val = r.ratings[cats[j].key] || 0;
      if (val > 0) {
        catHTML +=
          '<div class="review-cat">' +
            '<span class="review-cat-label">' + cats[j].label + '</span>' +
            '<span class="review-cat-stars">' + '★'.repeat(val) + '☆'.repeat(5 - val) + '</span>' +
          '</div>';
      }
    }

    var item = document.createElement('div');
    item.className = 'review-item';
    item.innerHTML =
      '<div class="review-header">' +
        '<span class="review-stars">' + stars + '</span>' +
        '<span class="review-date">' + date + '</span>' +
      '</div>' +
      (catHTML ? '<div class="review-cats">' + catHTML + '</div>' : '') +
      '<p class="review-comment">' + (r.comments || 'No comment left.') + '</p>' +
      '<div class="review-actions">' +
        '<button class="review-edit-btn">Edit</button>' +
        '<button class="review-delete-btn">Delete</button>' +
      '</div>';

    // delete handler
    item.querySelector('.review-delete-btn').addEventListener('click', makeDeleteHandler(r._id, r.propertyId, item));

    // edit handler
    item.querySelector('.review-edit-btn').addEventListener('click', makeEditHandler(r, item));

    list.appendChild(item);
  }
}

function makeDeleteHandler(reviewId, propertyId, item) {
  return function () {
    if (!confirm('Delete this review?')) return;
    fetch(API_BASE + '/api/reviews/' + reviewId, { method: 'DELETE' })
      .then(function (res) { return res.json(); })
      .then(function () {
        item.remove();
        // reload reviews to update count
        loadReviews(propertyId);
      })
      .catch(function () {
        alert('Could not delete review. Try again.');
      });
  };
}

function makeEditHandler(r, item) {
  return function () {
    // swap comment text for an editable textarea
    var commentEl = item.querySelector('.review-comment');
    var currentText = commentEl.textContent;

    commentEl.innerHTML =
      '<textarea class="edit-textarea">' + currentText + '</textarea>' +
      '<div class="edit-actions">' +
        '<button class="edit-save-btn">Save</button>' +
        '<button class="edit-cancel-btn">Cancel</button>' +
      '</div>';

    item.querySelector('.review-edit-btn').style.display = 'none';
    item.querySelector('.review-delete-btn').style.display = 'none';

    // cancel
    item.querySelector('.edit-cancel-btn').addEventListener('click', function () {
      commentEl.innerHTML = currentText;
      item.querySelector('.review-edit-btn').style.display = '';
      item.querySelector('.review-delete-btn').style.display = '';
    });

    // save
    item.querySelector('.edit-save-btn').addEventListener('click', function () {
      var newComment = item.querySelector('.edit-textarea').value.trim();
      fetch(API_BASE + '/api/reviews/' + r._id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratings: r.ratings, comments: newComment })
      })
        .then(function (res) { return res.json(); })
        .then(function () {
          commentEl.innerHTML = newComment || 'No comment left.';
          item.querySelector('.review-edit-btn').style.display = '';
          item.querySelector('.review-delete-btn').style.display = '';
        })
        .catch(function () {
          alert('Could not save. Try again.');
        });
    });
  };
}