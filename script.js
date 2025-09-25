<script>
const form = document.getElementById('add-goal-form');
const input = document.getElementById('goal-input');
const list = document.getElementById('goals-list');

// Load saved goals, each goal is now an object { text, completed }
let savedGoals = JSON.parse(localStorage.getItem('goals') || '[]');

function renderGoals() {
  list.innerHTML = '';
  savedGoals.forEach((goal, index) => {
    const li = document.createElement('li');

    // Checkbox to mark complete
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = goal.completed;
    checkbox.addEventListener('change', () => {
      goal.completed = checkbox.checked;
      localStorage.setItem('goals', JSON.stringify(savedGoals));
      renderGoals(); // redraw list
    });

    // Goal text
    const span = document.createElement('span');
    span.textContent = goal.text;
    if (goal.completed) {
      span.style.textDecoration = 'line-through';
      span.style.color = '#888';
    }

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = '❌';
    delBtn.addEventListener('click', () => {
      savedGoals.splice(index, 1);
      localStorage.setItem('goals', JSON.stringify(savedGoals));
      renderGoals();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// Add new goal (as an object)
form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  savedGoals.push({ text: text, completed: false }); // note object
  localStorage.setItem('goals', JSON.stringify(savedGoals));
  input.value = '';
  renderGoals();
});

renderGoals();
</script>
