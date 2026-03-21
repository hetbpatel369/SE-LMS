document.addEventListener('DOMContentLoaded', () => {
  const borrowedGrid = document.getElementById('borrowed-books-grid');
  const purchasedGrid = document.getElementById('purchased-books-grid');

  function renderError(message) {
    const html = `<div style="grid-column:1/-1; color:var(--danger); padding:var(--space-md); text-align:center;">${message}</div>`;
    borrowedGrid.innerHTML = html;
    purchasedGrid.innerHTML = html;
  }

  async function initLibraryPage() {
    try {
      const cachedUser = getCurrentUser();
      if (cachedUser && cachedUser.uid) {
        await fetchMyBooks(cachedUser.uid);
        return;
      }

      if (typeof auth !== 'undefined' && auth) {
        auth.onAuthStateChanged(async (user) => {
          if (!user) {
            window.location.href = '/pages/public/login.html';
            return;
          }
          await fetchMyBooks(user.uid);
        });
        return;
      }

      window.location.href = '/pages/public/login.html';
    } catch (error) {
      console.error('Error initializing library page:', error);
      renderError('Failed to load library data.');
    }
  }

  initLibraryPage();

  async function fetchMyBooks(userId) {
    if (typeof db === 'undefined' || !db) {
      renderError('Database is not available. Please refresh and try again.');
      return;
    }

    let borrowed = [];
    let purchased = [];
    try {
      const [borrowedSnap, purchasedSnap] = await Promise.all([
        db.collection('borrows')
          .where('userId', '==', userId)
          .where('status', '==', 'active')
          .get(),
        db.collection('purchases')
          .where('userId', '==', userId)
          .get()
      ]);

      borrowed = borrowedSnap.docs.map(doc => ({ id: doc.id, transactionType: 'borrow', ...doc.data() }));
      purchased = purchasedSnap.docs.map(doc => ({ id: doc.id, transactionType: 'buy', ...doc.data() }));
    } catch(err) {
      console.error('Failed to fetch library transactions:', err);
      renderError('Failed to load your borrowed/purchased books.');
      return;
    }

    if (borrowed.length === 0) {
      borrowedGrid.innerHTML = `
        <div style="grid-column:1/-1; padding:var(--space-xl); text-align:center; color:var(--text-muted); background:var(--bg-card); border-radius:var(--radius-md); border:1px dashed var(--border-subtle);">
          You don't have any actively borrowed books right now. <br><br>
          <a href="/pages/public/library.html" class="btn btn-sm btn-primary">Browse Catalog</a>
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
        let b;
        if (t.dummyBook) {
           b = t.dummyBook;
        } else {
           const bookDoc = await db.collection('books').doc(t.bookId).get();
           if (bookDoc.exists) b = bookDoc.data();
        }
        
        if (b) {
          const coverImage = b.coverImage || 'https://via.placeholder.com/150x200?text=No+Cover';
          const dueDateFormatted = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A';
          
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
