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
      response = await axios.put(
        `http://localhost:3000/expense/update-expense/${id}`,
        expenseData
      );
      console.log('Expense updated:', response.data);
    } else {
      // Add new expense
      response = await axios.post(
        'http://localhost:3000/expense/add-expense',
        expenseData
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
      await axios.delete(`http://localhost:3000/expense/delete-expense/${idToDelete}`);
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
    const response = await axios.get(
      'http://localhost:3000/expense/get-expenses'
    );
    response.data.forEach(expense => {
      showOnScreen(expense);
    });
  } catch (err) {
    console.error('Error loading expenses:', err.response || err);
  }
});
