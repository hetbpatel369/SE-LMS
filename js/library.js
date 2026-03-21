document.addEventListener('DOMContentLoaded', () => {
  const booksGrid = document.getElementById('books-grid');
  const searchInput = document.getElementById('book-search');
  const categorySelect = document.getElementById('book-category');
  const sortSelect = document.getElementById('book-sort');

  let allBooks = [];

  const DEMO_BOOKS = [
    { id: 'b1', title: 'The Pragmatic Programmer', author: 'David Thomas', category: 'Software Engineering', buyPrice: 45, borrowPrice: 5, availableCopies: 12, rating: 4.8 },
    { id: 'b2', title: 'Clean Code', author: 'Robert C. Martin', category: 'Software Engineering', buyPrice: 40, borrowPrice: 4, availableCopies: 8, rating: 4.7 },
    { id: 'b3', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Computer Science', buyPrice: 85, borrowPrice: 10, availableCopies: 5, rating: 4.9 },
    { id: 'b4', title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Science', buyPrice: 15, borrowPrice: 2, availableCopies: 20, rating: 4.8 },
    { id: 'b5', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Literature', buyPrice: 10, borrowPrice: 1, availableCopies: 0, rating: 4.5 }
  ];

  // Fetch books from Firebase
  async function fetchBooks() {
    try {
      const snapshot = await db.collection('books').get();
      allBooks = snapshot.empty ? DEMO_BOOKS : snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderBooks();
    } catch (error) {
      console.warn("Error fetching books (using fallback):", error);
      allBooks = DEMO_BOOKS;
      renderBooks();
    }
  }

  function renderBooks() {
    const search = searchInput.value.toLowerCase();
    const category = categorySelect.value;
    const sort = sortSelect.value;

    let filtered = allBooks.filter(b => {
      const matchSearch = (b.title && b.title.toLowerCase().includes(search)) || 
                          (b.author && b.author.toLowerCase().includes(search)) ||
                          (b.isbn && b.isbn.toLowerCase().includes(search));
      const matchCat = category === 'all' || b.category === category;
      return matchSearch && matchCat;
    });

    if (sort === 'price-low') filtered.sort((a,b) => a.buyPrice - b.buyPrice);
    else if (sort === 'price-high') filtered.sort((a,b) => b.buyPrice - a.buyPrice);
    else if (sort === 'rating-high') filtered.sort((a,b) => (b.rating || 0) - (a.rating || 0));

    if (filtered.length === 0) {
      booksGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:var(--space-3xl);color:var(--text-muted);font-style:italic;">No books found matching your criteria.</div>';
      return;
    }

    booksGrid.innerHTML = filtered.map((b, i) => `
      <div class="card course-card animate-up animate-up-${(i % 3) + 2}" style="cursor:pointer;" onclick="window.location.href = '/pages/public/book-details.html?id=${b.id}'">
        <div style="height: 200px; background: var(--bg-input); border-radius: var(--radius-md) var(--radius-md) 0 0; display:flex; align-items:center; justify-content:center; overflow:hidden;">
          <img src="${b.coverImage || 'https://via.placeholder.com/150x200?text=No+Cover'}" alt="${b.title}" style="max-height: 100%; max-width: 100%; object-fit: contain;">
        </div>
        <div style="padding: var(--space-md);">
          <div class="course-card-top" style="margin-bottom: var(--space-xs);">
            <span class="badge badge-primary">${b.category || 'General'}</span>
            <span style="font-size:0.78rem;color:${b.availableCopies > 0 ? 'var(--success)' : 'var(--danger)'};font-weight:bold;">
              ${b.availableCopies > 0 ? b.availableCopies + ' Available' : 'Out of Stock'}
            </span>
          </div>
          <h3 class="course-card-title" style="margin-bottom: 4px; font-size: 1.1rem; min-height: 2.6rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${b.title}</h3>
          <p class="course-card-instructor" style="margin-bottom: var(--space-sm);">${b.author}</p>
          <div style="display:flex; justify-content:space-between; align-items:center;">
             <div style="display:flex; flex-direction:column;">
               <span style="font-size: 0.8rem; color: var(--text-muted);">Borrow: $${b.borrowPrice}/mo</span>
               <span style="font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:700;color:var(--primary);">Buy: $${b.buyPrice}</span>
             </div>
             <span class="btn btn-sm btn-secondary">Details</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  searchInput.addEventListener('input', renderBooks);
  categorySelect.addEventListener('change', renderBooks);
  sortSelect.addEventListener('change', renderBooks);

  fetchBooks();
});
