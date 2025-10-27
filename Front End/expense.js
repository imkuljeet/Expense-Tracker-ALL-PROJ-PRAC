const expenseForm = document.getElementById('expenseForm');

expenseForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const amount = e.target.amount.value;
  const description = e.target.description.value;
  const category = e.target.category.value;

  const expenseData = { amount, description, category };

  try {
    // 1. Send to your backend; capture the response
    const response = await axios.post(
      'http://localhost:3000/expense/add-expense',
      expenseData
    );

    console.log('Expense added successfully:', response.data);

    // 2. Show the saved expense on the page
    showOnScreen(response.data.expense); 
    // <-- use response.data if your server adds an ID or timestamp

    // 3. Reset form fields
    e.target.reset();
  } catch (err) {
    console.error('Error adding expense:', err.response || err);
  }
});

function showOnScreen(expense) {
  const ul = document.getElementById('expenseList');

  // Create <li> wrapper
  const li = document.createElement('li');
  li.dataset.id = expense.id;           // store the ID for deletion
  li.classList.add('expense-item');      // optional, for styling

  // Build a span for the text so we don't clobber children later
  const textSpan = document.createElement('span');
  textSpan.textContent = 
    `${expense.amount} — ${expense.description} — ${expense.category}`;
  li.appendChild(textSpan);

  // Create Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.style.marginLeft = '10px';

  deleteBtn.addEventListener('click', async () => {
    const idToDelete = li.dataset.id;
    console.log('Attempting delete for ID:', idToDelete);

    try {
      await axios.delete(
        `http://localhost:3000/expense/delete-expense/${idToDelete}`
      );

      // On success, remove the <li> from the UL
      ul.removeChild(li);
      console.log(`Deleted expense with id ${idToDelete}`);
    } catch (err) {
      console.error('Error deleting expense:', err.response || err);
      alert('Could not delete expense. Check console for details.');
    }
  });

  li.appendChild(deleteBtn);
  ul.appendChild(li);
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Retrieve all expenses from backend
    const response = await axios.get(
      'http://localhost:3000/expense/get-expenses'
    );

    // 2. For each expense object, call showOnScreen()
    response.data.forEach(expense => {
      showOnScreen(expense);
    });
  } catch (err) {
    console.error('Error loading expenses:', err.response || err);
  }
});

  