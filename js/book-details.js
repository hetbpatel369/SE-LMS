document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('book-container');
  const params = new URLSearchParams(window.location.search);
  const bookId = params.get('id');

  if (!bookId) {
    container.innerHTML = '<div style="text-align:center;padding:var(--space-3xl);color:var(--danger);">Book ID missing! <a href="library.html">Go to Library</a></div>';
    return;
  }

  let currentUser = null;
  auth.onAuthStateChanged(user => { currentUser = user; });

  // ============ Fetch & Render Book ============
  async function fetchBook() {
    try {
      const doc = await db.collection('books').doc(bookId).get();
      if (!doc.exists) {
        container.innerHTML = '<div style="text-align:center;padding:var(--space-3xl);color:var(--danger);">Book not found! <a href="library.html">Go to Library</a></div>';
        return;
      }
      const book = { id: doc.id, ...doc.data() };
      renderBook(book);
      loadReviews();
    } catch (error) {
      container.innerHTML = `<div style="text-align:center;padding:var(--space-3xl);color:var(--danger);">Error loading book: ${error.message}</div>`;
    }
  }

  // ============ Borrow / Buy Handlers ============
  window.handleBorrow = async function() {
    if (!currentUser) {
      showToast('Please log in to borrow books.', 'warning');
      setTimeout(() => window.location.href = '/pages/public/login.html', 1500);
      return;
    }
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      await db.collection('borrows').add({
        userId: currentUser.uid,
        bookId: bookId,
        type: 'borrow',
        borrowedAt: new Date().toISOString(),
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'active'
      });
      // Decrement available copies
      await db.collection('books').doc(bookId).update({
        availableCopies: firebase.firestore.FieldValue.increment(-1)
      });
      showToast('Book borrowed successfully! Due in 30 days. Check My Library.', 'success', 4000);
    } catch(err) {
      console.error(err);
      showToast('Failed to borrow book. Please try again.', 'error');
    }
  };

  window.handleBuy = async function() {
    if (!currentUser) {
      showToast('Please log in to purchase books.', 'warning');
      setTimeout(() => window.location.href = '/pages/public/login.html', 1500);
      return;
    }
    try {
      await db.collection('purchases').add({
        userId: currentUser.uid,
        bookId: bookId,
        purchasedAt: new Date().toISOString(),
        type: 'purchase'
      });
      showToast('Book purchased! View it in My Library.', 'success', 4000);
    } catch(err) {
      console.error(err);
      showToast('Purchase failed. Please try again.', 'error');
    }
  };

  // ============ Render Book Page ============
  function renderBook(b) {
    const coverImage = b.coverImage || null;
    const coverDisplay = coverImage
      ? `<img src="${coverImage}" alt="${b.title}" style="max-width:100%;border-radius:var(--radius-md);box-shadow:var(--shadow-md);object-fit:contain;max-height:420px;">`
      : `<div style="font-size:6rem;display:flex;align-items:center;justify-content:center;height:280px;">📚</div>`;
    const isAvailable = (b.availableCopies || 0) > 0;
    const stars = '★'.repeat(Math.floor(b.rating || 0)) + '☆'.repeat(5 - Math.floor(b.rating || 0));

    container.innerHTML = `
      <a href="library.html" style="display:inline-flex;align-items:center;gap:6px;color:var(--text-muted);font-size:0.85rem;margin-bottom:var(--space-xl);text-decoration:none;">
        ← Back to Library
      </a>
      <div class="grid-2 animate-up" style="gap:var(--space-xl);align-items:start;">
        <!-- Cover -->
        <div class="card" style="padding:var(--space-xl);text-align:center;background:var(--bg-input);">
          ${coverDisplay}
          <div style="margin-top:var(--space-md);">
            <span style="font-size:0.85rem;color:${isAvailable ? 'var(--success)' : 'var(--danger)'};font-weight:600;">
              ${isAvailable ? `✅ ${b.availableCopies} Copies Available` : '❌ Out of Stock'}
            </span>
          </div>
        </div>

        <!-- Details -->
        <div>
          <span class="badge badge-primary" style="margin-bottom:var(--space-md);">${b.category || 'General'}</span>
          <h1 style="font-family:'Cormorant Garamond',serif;font-size:2.8rem;line-height:1.1;margin-bottom:var(--space-sm);">${b.title}</h1>
          <h3 style="color:var(--text-secondary);font-weight:400;margin-bottom:var(--space-md);">by ${b.author}</h3>
          <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-lg);">
            <span style="color:#fbbf24;font-size:1.1rem;">${stars}</span>
            <span style="color:var(--text-muted);font-size:0.85rem;">${b.rating || 'N/A'}/5</span>
            ${b.isbn ? `<span style="color:var(--text-muted);font-size:0.82rem;">ISBN: ${b.isbn}</span>` : ''}
          </div>

          <p style="color:var(--text-secondary);line-height:1.7;margin-bottom:var(--space-xl);">${b.description || 'No description available.'}</p>

          <!-- Pricing & Actions -->
          <div class="card" style="padding:var(--space-lg);margin-bottom:var(--space-xl);">
            <div style="display:flex;gap:var(--space-xl);flex-wrap:wrap;align-items:center;justify-content:space-between;">
              <div>
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Monthly Borrow</div>
                <div style="font-family:'Cormorant Garamond',serif;font-size:2rem;font-weight:700;color:var(--primary);">$${b.borrowPrice || '—'}/mo</div>
              </div>
              <div>
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Buy Forever</div>
                <div style="font-family:'Cormorant Garamond',serif;font-size:2rem;font-weight:700;color:var(--primary);">$${b.buyPrice || '—'}</div>
              </div>
              <div style="display:flex;flex-direction:column;gap:var(--space-sm);">
                <button class="btn btn-secondary" onclick="handleBorrow()" ${!isAvailable ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
                  📖 Borrow ($${b.borrowPrice || 0}/mo)
                </button>
                <button class="btn btn-primary" onclick="handleBuy()">
                  🛒 Buy ($${b.buyPrice || 0})
                </button>
              </div>
            </div>
          </div>

          <!-- Reviews Section -->
          <div id="reviews-section">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-md);padding-bottom:var(--space-sm);border-bottom:1px solid var(--border);">
              <h3>Student Reviews</h3>
              <button class="btn btn-sm btn-secondary" onclick="toggleReviewForm()">✏️ Write a Review</button>
            </div>
            <!-- Review form (hidden by default) -->
            <div id="review-form-container" style="display:none;margin-bottom:var(--space-lg);">
              <div class="card" style="padding:var(--space-lg);">
                <h4 style="margin-bottom:var(--space-md);">Your Review</h4>
                <div style="display:flex;gap:var(--space-sm);margin-bottom:var(--space-md);" id="star-selector">
                  ${[1,2,3,4,5].map(n => `<span data-star="${n}" onclick="setRating(${n})" style="font-size:1.8rem;cursor:pointer;color:var(--border);">★</span>`).join('')}
                </div>
                <textarea id="review-text" class="form-input" rows="3" placeholder="Share your thoughts about this book..." style="margin-bottom:var(--space-md);resize:vertical;"></textarea>
                <button class="btn btn-primary" onclick="submitReview()">Submit Review</button>
              </div>
            </div>
            <div id="reviews-list"><p style="color:var(--text-muted);font-style:italic;">Loading reviews...</p></div>
          </div>
        </div>
      </div>
    `;
  }

  // ============ Reviews ============
  let selectedRating = 0;

  window.toggleReviewForm = function() {
    const form = document.getElementById('review-form-container');
    if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
  };

  window.setRating = function(n) {
    selectedRating = n;
    document.querySelectorAll('#star-selector span').forEach((s, i) => {
      s.style.color = i < n ? '#fbbf24' : 'var(--border)';
    });
  };

  window.submitReview = async function() {
    if (!currentUser) {
      showToast('Please log in to submit a review.', 'warning');
      setTimeout(() => window.location.href = '/pages/public/login.html', 1500);
      return;
    }
    if (selectedRating === 0) { showToast('Please select a star rating.', 'warning'); return; }
    const text = document.getElementById('review-text').value.trim();
    if (!text) { showToast('Please write your review text.', 'warning'); return; }

    try {
      await db.collection('bookReviews').add({
        bookId,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email.split('@')[0],
        rating: selectedRating,
        text,
        createdAt: new Date().toISOString()
      });
      showToast('Review submitted! Thank you.', 'success');
      document.getElementById('review-form-container').style.display = 'none';
      loadReviews();
    } catch(err) {
      console.error(err);
      showToast('Failed to submit review. Please try again.', 'error');
    }
  };

  async function loadReviews() {
    const list = document.getElementById('reviews-list');
    if (!list) return;
    try {
      const snapshot = await db.collection('bookReviews').where('bookId', '==', bookId).orderBy('createdAt', 'desc').limit(10).get();
      if (snapshot.empty) {
        list.innerHTML = '<p style="color:var(--text-muted);font-style:italic;">No reviews yet. Be the first to review this book!</p>';
        return;
      }
      list.innerHTML = snapshot.docs.map(doc => {
        const r = doc.data();
        const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) : '';
        return `
          <div style="padding:var(--space-md) 0;border-bottom:1px solid var(--border);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-weight:600;">${r.userName || 'Anonymous'}</span>
              <span style="font-size:0.78rem;color:var(--text-muted);">${date}</span>
            </div>
            <div style="color:#fbbf24;margin-bottom:4px;">${stars}</div>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin:0;">${r.text}</p>
          </div>
        `;
      }).join('');
    } catch(err) {
      list.innerHTML = '<p style="color:var(--text-muted);">Could not load reviews.</p>';
    }
  }

  fetchBook();
});
