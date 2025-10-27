let expenseForm = document.getElementById('expenseForm');
    
expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let amount = e.target.amount.value;
    let description = e.target.description.value;
    let category = e.target.category.value;

    const expenseData = {
        amount: amount,
        description: description,
        category: category
    };

    try {
        let response = await axios.post('http://localhost:3000/expense/add-expense', expenseData);
        console.log('Expense added successfully:', response.data);

        // Optional: clear the form after submission
        e.target.reset();
    } catch (err) {
        console.error('Error adding expense:', err);
    }
});