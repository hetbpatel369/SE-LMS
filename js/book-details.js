document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('book-container');
  const params = new URLSearchParams(window.location.search);
  const bookId = params.get('id');

  if (!bookId) {
    container.innerHTML = '<div style="text-align:center;padding:var(--space-3xl);color:var(--danger);">Book ID missing!</div>';
    return;
  }

  let currentUser = null;
  auth.onAuthStateChanged(user => {
    currentUser = user;
    // We update UI buttons based on auth status if necessary
  });

  async function fetchBook() {
    try {
      const doc = await db.collection('books').doc(bookId).get();
      if (!doc.exists) {
        container.innerHTML = '<div style="text-align:center;padding:var(--space-3xl);color:var(--danger);">Book not found!</div>';
        return;
      }
      const book = doc.data();
      renderBook(book, bookId);
    } catch (error) {
      container.innerHTML = `<div style="text-align:center;padding:var(--space-3xl);color:var(--danger);">Error: ${error.message}</div>`;
    }
  }

  window.handleBorrow = function(bId) {
    if (!currentUser) {
      showToast('You must be logged in to borrow books.', 'warning');
      setTimeout(() => window.location.href = 'login.html', 1500);
      return;
    }
    showToast('Borrow transaction initiated (Stub).', 'success');
  };

  window.handleBuy = function(bId) {
    if (!currentUser) {
      showToast('You must be logged in to buy books.', 'warning');
      setTimeout(() => window.location.href = 'login.html', 1500);
      return;
    }
    showToast('Purchase transaction initiated (Stub).', 'success');
  };

  function renderBook(b, id) {
    // Prevent UI glitches if data is incomplete
    const coverImage = b.coverImage || 'https://via.placeholder.com/300x400?text=No+Cover';
    const category = b.category || 'General';
    const isbn = b.isbn || 'N/A';
    const description = b.description || 'No description available for this book.';
    
    // Availability
    const isAvailable = b.availableCopies > 0;
    const availabilityString = isAvailable 
      ? `${b.availableCopies} / ${b.totalCopies} Copies Available` 
      : 'Out of Stock';

    container.innerHTML = `
      <div class="card animate-up" style="padding:var(--space-xl); display:flex; gap:var(--space-xl); flex-wrap:wrap;">
        <div style="flex:1; min-width:300px; text-align:center; background:var(--bg-input); border-radius:var(--radius-md); padding:var(--space-md);">
          <img src="${coverImage}" alt="${b.title}" style="max-width:100%; border-radius:var(--radius-md); box-shadow:var(--shadow-md); object-fit:contain; max-height:450px;">
        </div>
        <div style="flex:2; min-width:300px;">
          <h1 style="margin-bottom:var(--space-sm); font-family:'Cormorant Garamond', serif; font-size:3rem;">${b.title}</h1>
          <h3 style="color:var(--text-secondary); margin-bottom:var(--space-md); font-weight:normal;">By ${b.author}</h3>
          
          <div style="display:flex; gap:var(--space-sm); margin-bottom:var(--space-lg); flex-wrap:wrap;">
            <span class="badge badge-primary">${category}</span>
            <span class="badge" style="background:var(--bg-input); color:var(--text-main);">ISBN: ${isbn}</span>
            <span class="badge" style="background:var(--bg-input); color:var(--text-main);">⭐ ${b.rating || 'N/A'} / 5</span>
          </div>

          <div style="margin-bottom:var(--space-xl);">
            <h4 style="margin-bottom:var(--space-sm); font-size:1.1rem;">Description</h4>
            <p style="font-size:1rem; line-height:1.6; color:var(--text-secondary);">${description}</p>
          </div>

          <div style="background:var(--bg-input); padding:var(--space-md); border-radius:var(--radius-md); margin-bottom:var(--space-xl); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:var(--space-md);">
            <div>
              <p style="margin-bottom:4px; color:var(--text-muted); font-size:0.9rem;">Status</p>
              <p style="font-weight:bold; font-size:1.1rem; color:${isAvailable ? 'var(--success)' : 'var(--danger)'};">
                ${availabilityString}
              </p>
            </div>
            <div style="display:flex; gap:var(--space-md);">
              <div style="text-align:center;">
                <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:4px;">Borrow</p>
                <button class="btn btn-secondary" onclick="handleBorrow('${id}')" ${!isAvailable ? 'disabled' : ''}>$${b.borrowPrice || 0}/mo</button>
              </div>
              <div style="text-align:center;">
                <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:4px;">Buy Forever</p>
                <button class="btn btn-primary" onclick="handleBuy('${id}')">$${b.buyPrice || 0}</button>
              </div>
            </div>
          </div>
          
          <!-- Reviews section stub -->
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-md); border-bottom:1px solid var(--border-subtle); padding-bottom:var(--space-sm);">
              <h3>Student Reviews</h3>
              <button class="btn btn-sm btn-secondary" onclick="alert('Feature coming soon!')">Write a Review</button>
            </div>
            <p style="color:var(--text-muted); font-style:italic;">No reviews yet. Be the first to review this book!</p>
          </div>
        </div>
      </div>
    `;
  }

  fetchBook();
});
