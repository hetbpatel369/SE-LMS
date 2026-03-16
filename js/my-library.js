document.addEventListener('DOMContentLoaded', () => {
  const borrowedGrid = document.getElementById('borrowed-books-grid');
  const purchasedGrid = document.getElementById('purchased-books-grid');

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    try {
      await fetchMyBooks(user.uid);
    } catch (error) {
      console.error('Error fetching library data:', error);
      borrowedGrid.innerHTML = `<div style="grid-column:1/-1; color:var(--danger); padding:var(--space-md); text-align:center;">Failed to load library data.</div>`;
    }
  });

  async function fetchMyBooks(userId) {
    if (!window.db) return;

    // Fetch transactions for this user
    const snapshot = await db.collection('borrowTransactions')
      .where('studentId', '==', userId)
      .where('status', '==', 'active')
      .get();
      
    // Stub implementation: Since we just seeded books and don't have borrow transactions seeded yet,
    // this will be empty initially until the user borrows something. 
    
    const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const borrowed = transactions.filter(t => t.transactionType === 'borrow');
    const purchased = transactions.filter(t => t.transactionType === 'buy');

    if (borrowed.length === 0) {
      borrowedGrid.innerHTML = `
        <div style="grid-column:1/-1; padding:var(--space-xl); text-align:center; color:var(--text-muted); background:var(--bg-card); border-radius:var(--radius-md); border:1px dashed var(--border-subtle);">
          You don't have any actively borrowed books right now. <br><br>
          <a href="library.html" class="btn btn-sm btn-primary">Browse Catalog</a>
        </div>
      `;
    } else {
      renderBookList(borrowed, borrowedGrid, true);
    }

    if (purchased.length === 0) {
      purchasedGrid.innerHTML = `
        <div style="grid-column:1/-1; padding:var(--space-xl); text-align:center; color:var(--text-muted); background:var(--bg-card); border-radius:var(--radius-md); border:1px dashed var(--border-subtle);">
          You haven't purchased any books yet.
        </div>
      `;
    } else {
      renderBookList(purchased, purchasedGrid, false);
    }
  }

  async function renderBookList(transactions, gridElement, isBorrowed) {
    let html = '';

    for (const t of transactions) {
      try {
        const bookDoc = await db.collection('books').doc(t.bookId).get();
        if (bookDoc.exists) {
          const b = bookDoc.data();
          const coverImage = b.coverImage || 'https://via.placeholder.com/150x200?text=No+Cover';
          const dueDateFormatted = t.dueDate ? t.dueDate.toDate().toLocaleDateString() : 'N/A';
          
          let actionHtml = '';
          if (isBorrowed) {
            actionHtml = `
              <div style="margin-top:var(--space-md); font-size:0.9rem; color:var(--text-muted);">
                <span style="display:block; margin-bottom:4px;">Due Date: <strong>${dueDateFormatted}</strong></span>
                <button class="btn btn-sm btn-secondary" style="width:100%;" onclick="returnBook('${t.id}')">Return Book</button>
              </div>
            `;
          } else {
             actionHtml = `
              <div style="margin-top:var(--space-md);">
                <button class="btn btn-sm btn-primary" style="width:100%;">Read Online</button>
              </div>
            `;
          }

          html += `
            <div class="card" style="padding:var(--space-md); display:flex; flex-direction:column;">
              <div style="height:150px; background:var(--bg-input); border-radius:var(--radius-sm); margin-bottom:var(--space-md); display:flex; align-items:center; justify-content:center; overflow:hidden;">
                <img src="${coverImage}" style="max-height:100%; max-width:100%; object-fit:contain;">
              </div>
              <h3 style="font-size:1.1rem; margin-bottom:4px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${b.title}</h3>
              <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:auto;">${b.author}</p>
              ${actionHtml}
            </div>
          `;
        }
      } catch (err) {
        console.error('Error fetching Book info for transaction', err);
      }
    }

    gridElement.innerHTML = html;
  }

  window.returnBook = function(transactionId) {
    if(confirm('Are you sure you want to return this book?')) {
      showToast('Return initiated (Stub).', 'success');
      // Update logic will go here
    }
  };
});
