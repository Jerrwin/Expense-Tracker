const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const list = document.getElementById("list");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const logoutBtn = document.getElementById("logoutBtn");
const addTransaction = document.getElementById("add-transaction");

const username = localStorage.getItem("user");
if (!username) {
  window.location.href = "login.html";
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "login.html";
});

let transactions = [];

function updateValues() {
  const amounts = transactions.map((t) => t.amount);
  const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
  const incomeTotal = amounts
    .filter((a) => a > 0)
    .reduce((acc, item) => acc + item, 0)
    .toFixed(2);
  const expenseTotal = (
    amounts.filter((a) => a < 0).reduce((acc, item) => acc + item, 0) * -1
  ).toFixed(2);

  balance.textContent = `$${total}`;
  income.textContent = `$${incomeTotal}`;
  expense.textContent = `$${expenseTotal}`;
}

function addTransactionDOM(transaction) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${formatDate(transaction.date)}</td>
    <td>${transaction.text}</td>
    <td class="amount ${
      transaction.amount < 0 ? "expense" : ""
    }">$${transaction.amount.toFixed(2)}</td>
    <td><button onclick="removeTransaction(${transaction.id})">X</button></td>
  `;
  list.appendChild(tr);
}

function removeTransaction(id) {
  const confirmed = confirm(
    "Are you sure you want to delete this transaction?"
  );

  if (confirmed) {
    fetch(`http://localhost:8080/ExpTrack/transactions/${username}/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        transactions = transactions.filter((t) => t.id !== id);
        updateUI();
      })
      .catch((err) => console.error("Delete failed", err));
  }
}

function updateUI() {
  list.innerHTML = "";
  transactions.forEach(addTransactionDOM);
  updateValues();
}

addTransaction.addEventListener("click", () => {
  const textValue = text.value.trim();
  const amountValue = parseFloat(amount.value);

  if (!textValue || isNaN(amountValue)) {
    alert("Please enter valid description and amount.");
    return;
  }

  const transaction = {
    text: textValue,
    amount: amountValue,
    date: new Date().toISOString().split("T")[0],
  };

  fetch(`http://localhost:8080/ExpTrack/transactions/${username}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transaction),
  })
    .then((res) => res.json())
    .then((data) => {
      transactions.push(data);
      updateUI();
      text.value = "";
      amount.value = "";
    })
    .catch((err) => console.error("Add failed", err));
});

function init() {
  fetch(`http://localhost:8080/ExpTrack/transactions/${username}`)
    .then((res) => res.json())
    .then((data) => {
      transactions = data;
      updateUI();
    })
    .catch((err) => console.error("Fetch failed", err));
}

init();

function formatDate(isoDate) {
  const date = new Date(isoDate);

  // Get day, month, and year
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}