const form = document.getElementById('add-goal-form');
const input = document.getElementById('goal-input');
const list = document.getElementById('goals-list');

// Each goal now contains subGoals: [{text, completed}]
let savedGoals = JSON.parse(localStorage.getItem('goals') || '[]');

function renderGoals() {
  list.innerHTML = '';
  savedGoals.forEach((goal, gIndex) => {
    const li = document.createElement('li');
    li.style.flexDirection = 'column';

    // --- Main Goal Row ---
    const topRow = document.createElement('div');
    topRow.style.display = 'flex';
    topRow.style.justifyContent = 'space-between';
    topRow.style.alignItems = 'center';
    topRow.style.width = '100%';

    const leftPart = document.createElement('div');
    leftPart.style.display = 'flex';
    leftPart.style.alignItems = 'center';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = goal.completed;
    checkbox.addEventListener('change', () => {
      goal.completed = checkbox.checked;
      localStorage.setItem('goals', JSON.stringify(savedGoals));
      renderGoals();
    });

    const span = document.createElement('span');
    span.textContent = goal.text;
    if (goal.completed) {
      span.style.textDecoration = 'line-through';
      span.style.color = '#888';
    }

    leftPart.appendChild(checkbox);
    leftPart.appendChild(span);

    const delBtn = document.createElement('button');
    delBtn.textContent = '❌';
    delBtn.addEventListener('click', () => {
      savedGoals.splice(gIndex, 1);
      localStorage.setItem('goals', JSON.stringify(savedGoals));
      renderGoals();
    });

    topRow.appendChild(leftPart);
    topRow.appendChild(delBtn);
    li.appendChild(topRow);

    // --- Sub-Goals List ---
    goal.subGoals = goal.subGoals || [];
    const subList = document.createElement('ul');
    subList.style.marginTop = '6px';

    goal.subGoals.forEach((sub, sIndex) => {
      const subLi = document.createElement('li');

      const subCheckbox = document.createElement('input');
      subCheckbox.type = 'checkbox';
      subCheckbox.checked = sub.completed;
      subCheckbox.addEventListener('change', () => {
        sub.completed = subCheckbox.checked;
        localStorage.setItem('goals', JSON.stringify(savedGoals));
        renderGoals();
      });

      const subSpan = document.createElement('span');
      subSpan.textContent = sub.text;
      if (sub.completed) {
        subSpan.style.textDecoration = 'line-through';
        subSpan.style.color = '#888';
      }

      const subDel = document.createElement('button');
      subDel.textContent = '❌';
      subDel.addEventListener('click', () => {
        goal.subGoals.splice(sIndex, 1);
        localStorage.setItem('goals', JSON.stringify(savedGoals));
        renderGoals();
      });

      subLi.appendChild(subCheckbox);
      subLi.appendChild(subSpan);
      subLi.appendChild(subDel);
      subList.appendChild(subLi);
    });

    li.appendChild(subList);

    // --- Form to Add a Sub-Goal ---
    const subForm = document.createElement('form');
    subForm.style.display = 'flex';
    subForm.style.gap = '6px';

    const subInput = document.createElement('input');
    subInput.type = 'text';
    subInput.placeholder = 'Add sub-goal…';

    const subBtn = document.createElement('button');
    subBtn.textContent = '+';

    subForm.appendChild(subInput);
    subForm.appendChild(subBtn);

    subForm.addEventListener('submit', e => {
      e.preventDefault();
      const text = subInput.value.trim();
      if (!text) return;
      goal.subGoals.push({ text, completed: false });
      localStorage.setItem('goals', JSON.stringify(savedGoals));
      subInput.value = '';
      renderGoals();
    });

    li.appendChild(subForm);
    list.appendChild(li);
  });
}

// Add new main goal
form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  savedGoals.push({ text: text, completed: false, subGoals: [] });
  localStorage.setItem('goals', JSON.stringify(savedGoals));
  input.value = '';
  renderGoals();
});

renderGoals();

async function generateRoadmap(goalText) {
  try {
    const response = await fetch('/api/roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal: goalText })
    });

    const data = await response.json();
    if (data.roadmap) {
      return data.roadmap; // AI returns a roadmap text
    } else {
      return "No roadmap generated.";
    }
  } catch (error) {
    console.error(error);
    return "Error generating roadmap.";
  }
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  // Add the main goal first
  const newGoal = { text, completed: false, subGoals: [] };
  savedGoals.push(newGoal);
  input.value = '';
  renderGoals();

  // Generate roadmap using AI
  const roadmapText = await generateRoadmap(text);

  // Convert roadmap text into sub-goals (split by new lines)
  // Try to split by numbered steps (1., 2., 3.) or bullets
const subGoals = roadmapText
  .split(/\n|•|-/)                // split by new line, bullets, or dashes
  .map(line => line.trim())        // remove extra spaces
  .filter(line => line.length > 0) // remove empty lines

subGoals.forEach(sub => newGoal.subGoals.push({ text: sub, completed: false }));

  // Save and re-render
  localStorage.setItem('goals', JSON.stringify(savedGoals));
  renderGoals();
});

const toggleBtn = document.createElement('button');
toggleBtn.textContent = '▼'; // collapse/expand symbol
toggleBtn.style.marginRight = '6px';

toggleBtn.addEventListener('click', () => {
  if (subList.style.display === 'none') {
    subList.style.display = 'block';
    toggleBtn.textContent = '▼';
  } else {
    subList.style.display = 'none';
    toggleBtn.textContent = '►';
  }
});

leftPart.insertBefore(toggleBtn, checkbox); // place button before checkbox

