const expenseForm = document.getElementById('expenseForm');

// -------------------- ADD / EDIT EXPENSE --------------------
expenseForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('expenseId').value;
  const amount = e.target.amount.value;
  const description = e.target.description.value;
  const category = e.target.category.value;
  const expenseData = { amount, description, category };

  try {
    let response;
    const token = localStorage.getItem('token');

    if (id) {
      // Edit existing expense
      response = await axios.put(
        `http://localhost:3000/expense/update-expense/${id}`,
        expenseData,
        { headers: { Authorization: token } }
      );
      console.log('Expense updated:', response.data);
    } else {
      // Add new expense
      response = await axios.post(
        'http://localhost:3000/expense/add-expense',
        expenseData,
        { headers: { Authorization: token } }
      );
      console.log('Expense added successfully:', response.data);
    }

    // Refresh current page after add/update
    loadExpenses(currentPage);

    // Reset form and hidden ID field
    e.target.reset();
    document.getElementById('expenseId').value = '';

  } catch (err) {
    console.error('Error saving expense:', err.response || err);
  }
});

// -------------------- RENDER EXPENSE ROW --------------------
function showOnScreen(expense) {
  const tbody = document.getElementById('expenseTableBody');

  const tr = document.createElement('tr');
  tr.dataset.id = expense.id;

  const amountTd = document.createElement('td');
  amountTd.textContent = expense.amount;

  const descriptionTd = document.createElement('td');
  descriptionTd.textContent = expense.description;

  const categoryTd = document.createElement('td');
  categoryTd.textContent = expense.category;

  const actionsTd = document.createElement('td');

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', async () => {
    const idToDelete = tr.dataset.id;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/expense/delete-expense/${idToDelete}`, {
        headers: { Authorization: token }
      });
      console.log(`Deleted expense with id ${idToDelete}`);
      loadExpenses(currentPage); // reload page after delete
    } catch (err) {
      console.error('Error deleting expense:', err.response || err);
      alert('Could not delete expense.');
    }
  });

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.style.marginLeft = '10px';
  editBtn.addEventListener('click', () => {
    const idToEdit = tr.dataset.id;
    document.getElementById('amount').value = expense.amount;
    document.getElementById('description').value = expense.description;
    document.getElementById('category').value = expense.category;
    document.getElementById('expenseId').value = idToEdit;
  });

  actionsTd.appendChild(editBtn);
  actionsTd.appendChild(deleteBtn);

  tr.appendChild(amountTd);
  tr.appendChild(descriptionTd);
  tr.appendChild(categoryTd);
  tr.appendChild(actionsTd);

  tbody.appendChild(tr);
}

// -------------------- PREMIUM UI --------------------
function updatePremiumUI(token) {
  if (!token) return;

  const decoded = jwt_decode(token);

  if (decoded.isPremiumUser === false) {
    document.getElementById('premiumBuy').style.display = 'block';
  }

  if (decoded.isPremiumUser) {
    const messageDiv = document.getElementById('showPremmiumMessage');
    messageDiv.textContent = '✨ You are a premium user';

    const leaderboardBtn = document.createElement('button');
    leaderboardBtn.textContent = 'Show Leaderboard';
    leaderboardBtn.id = 'showLeaderboard';
    leaderboardBtn.style.marginLeft = '10px';

    leaderboardBtn.addEventListener('click', async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/premium/showLeaderboard', {
          headers: { Authorization: token }
        });

        const leaderboard = res.data.leaderboard;
        const container = document.getElementById('leaderboardContainer');
        container.innerHTML = '<h3>🏆 Leaderboard</h3>';

        const list = document.createElement('ol');
        leaderboard.forEach((user, index) => {
          const item = document.createElement('li');
          let medal = '';
          if (index === 0) medal = '🥇 ';
          else if (index === 1) medal = '🥈 ';
          else if (index === 2) medal = '🥉 ';

          const expenseText = user.totalExpenses === null || user.totalExpenses === 0
            ? 'No expenses yet'
            : `₹${user.totalExpenses}`;

          item.textContent = `${medal}${user.name} - ${expenseText}`;
          list.appendChild(item);
        });

        container.appendChild(list);

      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        alert('Could not load leaderboard.');
      }
    });

    messageDiv.appendChild(leaderboardBtn);

    const premiumBtn = document.getElementById('premiumBuy');
    if (premiumBtn) premiumBtn.style.display = 'none';
  }
}

// -------------------- PAGINATION --------------------
let currentPage = 1;
const limit = 5; // items per page

async function loadExpenses(page = 1) {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(
      `http://localhost:3000/expense/get-expenses?page=${page}&limit=${limit}`,
      { headers: { Authorization: token } }
    );

    const tbody = document.getElementById('expenseTableBody');
    tbody.innerHTML = '';

    res.data.expenses.forEach(expense => {
      showOnScreen(expense);
    });

    renderPagination(res.data.totalPages, res.data.currentPage);
    currentPage = res.data.currentPage;

  } catch (err) {
    console.error('Error loading expenses with pagination:', err.response || err);
  }
}

function renderPagination(totalPages, currentPage) {
  const container = document.getElementById('pagination');
  container.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.disabled = true;

    btn.addEventListener('click', () => loadExpenses(i));
    container.appendChild(btn);
  }
}

// -------------------- INITIAL LOAD --------------------
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  updatePremiumUI(token);
  loadExpenses(1);
});

// -------------------- PREMIUM PURCHASE --------------------
document.getElementById('premiumBuy').addEventListener('click', async () => {
  try {
    const token = localStorage.getItem('token');
    const { data } = await axios.post(
      'http://localhost:3000/purchase/premium',
      {},
      { headers: { Authorization: token } }
    );

    const options = {
      key: data.key_id,
      order_id: data.order_id,
      name: 'Expense Tracker Premium',
      description: 'Unlock premium features',
      prefill: { name: 'Your Name', email: 'you@example.com' },
      handler: async (response) => {
        const res = await axios.post(
          'http://localhost:3000/purchase/update-status',
          {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id
          },
          { headers: { Authorization: token } }
        );

        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          updatePremiumUI(res.data.token);
        }

        alert('🎉 You are now a premium user!');
      }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', (response) => {
      console.error('Payment failed:', response.error);
      alert(`Payment failed:\n${response.error.description}`);
    });

    rzp.open();

  } catch (err) {
    console.error('Premium purchase failed:', err);
    alert('Could not initiate payment.');
  }
});
