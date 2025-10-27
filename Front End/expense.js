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

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const token = localStorage.getItem('token');

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
    // 4.1 Fetch order info from your backend
    const { data } = await axios.post(
      'http://localhost:3000/purchase/premium',
      {},
      { headers: { Authorization: token } }
    );

    const options = {
      key:         data.key_id,
      amount:      data.amount,
      currency:    'INR',
      order_id:    data.order_id,
      name:        'Expense Tracker Premium',
      description: 'Unlock premium features',
      handler: async (response) => {
        // 4.3 On successful payment, tell backend to update status
        await axios.post(
          'http://localhost:3000/purchase/update-status',
          {
            order_id:    response.razorpay_order_id,
            payment_id:  response.razorpay_payment_id
          },
          { headers: { Authorization: token } }
        );
        alert('🎉 You are now a premium user!');
        // Optionally refresh UI to show premium badge
      },
      prefill: {
        // Optional: fetch user name/email dynamically
        name:  'Your Name',
        email: 'you@example.com'
      }
    };

    // 4.2 Open Razorpay Checkout
    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error('Premium purchase failed:', err);
    alert('Could not initiate payment.');
  }
});
