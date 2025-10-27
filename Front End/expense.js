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
    const li = document.createElement('li');
    li.dataset.id = expense.id;  // assumes your server returns an `id`
  
    // Display expense details
    li.textContent = `${expense.amount} — ${expense.description} — ${expense.category} `;
  
    // Create Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.marginLeft = '10px';
    deleteBtn.addEventListener('click', async () => {
    //    console.log(li.dataset.id);
      try {
        // 1. Call your delete API (adjust URL to match your route)
        await axios.delete(`http://localhost:3000/expense/delete-expense/${expense.id}`);
  
        // 2. Remove the <li> from the list
        ul.removeChild(li);
        console.log(`Deleted expense with id ${expense.id}`);
      } catch (err) {
        console.error('Error deleting expense:', err.response || err);
      }
    });
  
    // Append button and item to the list
    li.appendChild(deleteBtn);
    ul.appendChild(li);
  }
  