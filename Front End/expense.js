const expenseForm = document.getElementById('expenseForm');

expenseForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('expenseId').value;
  const amount = e.target.amount.value;
  const description = e.target.description.value;
  const category = e.target.category.value;
  const expenseData = { amount, description, category };

  try {
    let response;

    if (id) {
      // Edit existing expense
      const token = localStorage.getItem('token');
      response = await axios.put(
        `http://localhost:3000/expense/update-expense/${id}`,
        expenseData, {
          headers: {
            Authorization: token
          }
        }
      );
      console.log('Expense updated:', response.data);
    } else {
      // Add new expense
      const token = localStorage.getItem('token');
      response = await axios.post(
        'http://localhost:3000/expense/add-expense',
        expenseData,{
          headers: {
            Authorization: token
          }
        }
      );
      console.log('Expense added successfully:', response.data);
    }

    // Use the same rendering logic regardless
    showOnScreen(response.data.expense || response.data);

    // Reset form and hidden ID field
    e.target.reset();
    document.getElementById('expenseId').value = '';

  } catch (err) {
    console.error('Error saving expense:', err.response || err);
  }
});

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

      await axios.delete(`http://localhost:3000/expense/delete-expense/${idToDelete}`,{
        headers: {
          Authorization: token
        }
      });
      tbody.removeChild(tr);
      console.log(`Deleted expense with id ${idToDelete}`);
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

    tbody.removeChild(tr);
  });

  actionsTd.appendChild(editBtn);
  actionsTd.appendChild(deleteBtn);

  tr.appendChild(amountTd);
  tr.appendChild(descriptionTd);
  tr.appendChild(categoryTd);
  tr.appendChild(actionsTd);

  tbody.appendChild(tr);
}

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
    
        const list = document.createElement('ol'); // ordered list for ranking
    
        leaderboard.forEach((user) => {
          const item = document.createElement('li');
        
          const expenseText = user.totalExpense === null
            ? 'No expenses yet'
            : `₹${user.totalExpense}`;
        
          item.textContent = `${user.name} - ${expenseText}`;
          list.appendChild(item);
        });
        
    
        container.appendChild(list);
    
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        alert('Could not load leaderboard.');
      }
    });
   

    messageDiv.appendChild(leaderboardBtn);

    // Hide the Buy Premium button if it exists
    const premiumBtn = document.getElementById('premiumBuy');
    if (premiumBtn) premiumBtn.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const token = localStorage.getItem('token');

    updatePremiumUI(token);

    const response = await axios.get(
      'http://localhost:3000/expense/get-expenses',{
        headers: {
          Authorization: token
        }
      }
    );
    response.data.forEach(expense => {
      showOnScreen(expense);
    });
  } catch (err) {
    console.error('Error loading expenses:', err.response || err);
  }
});

document.getElementById('premiumBuy').addEventListener('click', async () => {
  try {
    const token = localStorage.getItem('token');
    const { data } = await axios.post(
      'http://localhost:3000/purchase/premium',
      {},
      { headers: { Authorization: token } }
    );

    const options = {
      key:         data.key_id,
      order_id:    data.order_id,
      name:        'Expense Tracker Premium',
      description: 'Unlock premium features',
      prefill: {
        name:  'Your Name',
        email: 'you@example.com'
      },
      handler: async (response) => {
        const res = await axios.post(
          'http://localhost:3000/purchase/update-status',
          {
            order_id:   response.razorpay_order_id,
            payment_id: response.razorpay_payment_id
          },
          { headers: { Authorization: token } }
        );

    // Save the new token from backend
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      updatePremiumUI(res.data.token); // ✅ Call the function here
    }

    // updatePremiumUI(res.data.token);

        alert('🎉 You are now a premium user!');
      }
    };

    const rzp = new Razorpay(options);

    // listen for payment failures
    rzp.on('payment.failed', (response) => {
      console.error('Payment failed:', response.error);
      alert(
        `Payment failed:\n` +
        `Code: ${response.error.code}\n` +
        `Description: ${response.error.description}\n` +
        `Source: ${response.error.source}`
      );
    });

    rzp.open();

  } catch (err) {
    console.error('Premium purchase failed:', err);
    alert('Could not initiate payment.');
  }
});
