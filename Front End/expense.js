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
  const ul = document.getElementById('expenseList');

  const li = document.createElement('li');
  li.dataset.id = expense.id;
  li.classList.add('expense-item');

  const textSpan = document.createElement('span');
  textSpan.textContent = `${expense.amount} — ${expense.description} — ${expense.category}`;
  li.appendChild(textSpan);

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.style.marginLeft = '10px';
  deleteBtn.addEventListener('click', async () => {
    const idToDelete = li.dataset.id;
    try {
      await axios.delete(
        `http://localhost:3000/expense/delete-expense/${idToDelete}`
      );
      ul.removeChild(li);
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
    const idToEdit = li.dataset.id;
    const [amount, description, category] = textSpan.textContent.split(' — ');

    document.getElementById('amount').value = amount;
    document.getElementById('description').value = description;
    document.getElementById('category').value = category;
    document.getElementById('expenseId').value = idToEdit;

    ul.removeChild(li);
  });

  li.appendChild(editBtn);
  li.appendChild(deleteBtn);
  ul.appendChild(li);
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
