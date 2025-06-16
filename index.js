const api = `https://api-database-1.onrender.com/ToDo`;

async function myTodos() {
  const value = document.querySelector('#todos').value.trim();
  
  if (!value) {
    alert('Please enter a todo item');
    return;
  }

  let objectData = {
    id: Math.random().toString(36).substring(2, 15),
    text: value,
    isEdits: false,
    isCompleted: false,
  };

  try {
    const res = await fetch(api, {
      method: 'POST',
      body: JSON.stringify(objectData),
      headers: {
        'Content-type': 'application/json',
      },
    });
    
    document.querySelector('#todos').value = '';
    appendData();
  } catch (error) {
    console.log(error);
  }
}

async function appendData() {
  let data;
  try {
    const res = await fetch(api);
    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  const main_div = document.querySelector('#dataInfo');
  main_div.innerHTML = '';

  if (data.length === 0) {
    main_div.innerHTML = '<p class="no-todos">No todos found. Add one above!</p>';
    return;
  }

  data.forEach((el) => {
    let div = document.createElement('div');
    let id = document.createElement('p');
    let text = document.createElement('p');
    let buttonGroup = document.createElement('div');
    let editBtn = document.createElement('button');
    let deleteBtn = document.createElement('button');
    let completeBtn = document.createElement('button');

    div.className = 'todo-item';
    buttonGroup.className = 'button-group';
    editBtn.className = 'edit-btn';
    deleteBtn.className = 'delete-btn';
    completeBtn.className = el.isCompleted ? 'complete-btn completed' : 'complete-btn';

    id.innerText = `ID: ${el.id.substring(0, 8)}...`;
    text.innerText = el.text;
    editBtn.innerText = 'Edit';
    deleteBtn.innerText = 'Delete';
    completeBtn.innerText = el.isCompleted ? 'Completed' : 'Complete';

    if (el.isCompleted) {
      text.style.textDecoration = 'line-through';
      text.style.opacity = '0.7';
    }

    // Delete functionality
    deleteBtn.addEventListener('click', async function () {
      if (confirm('Are you sure you want to delete this todo?')) {
        try {
          await fetch(`${api}/${el.id}`, {
            method: 'DELETE',
            headers: {
              'Content-type': 'application/json',
            },
          });
          appendData();
        } catch (error) {
          console.log(error);
        }
      }
    });

    // Edit functionality
    editBtn.addEventListener('click', function() {
      const editInput = document.createElement('input');
      editInput.className = 'edit-input';
      editInput.value = text.innerText;
      
      text.replaceWith(editInput);
      editInput.focus();
      
      editBtn.innerText = 'Save';
      editBtn.style.backgroundColor = '#3498DB';
      
      const handleSave = async () => {
        const newText = editInput.value.trim();
        if (!newText) {
          alert("Todo can't be empty");
          return;
        }
        
        try {
          await fetch(`${api}/${el.id}`, {
            method: 'PATCH',
            headers: {
              'Content-type': "application/json"
            },
            body: JSON.stringify({ text: newText })
          });
          appendData();
        } catch (error) {
          console.log("Error while editing", error);
        }
      };
      
      editBtn.onclick = handleSave;
      editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSave();
      });
    });

    completeBtn.addEventListener('click', async function() {
      try {
        await fetch(`${api}/${el.id}`, {
          method: 'PATCH',
          headers: {
            'Content-type': "application/json"
          },
          body: JSON.stringify({ isCompleted: !el.isCompleted })
        });
        appendData();
      } catch (error) {
        console.log("Error updating status", error);
      }
    });

    buttonGroup.append(completeBtn, editBtn, deleteBtn);
    div.append(id, text, buttonGroup);
    main_div.append(div);
  });
}

appendData();

document.querySelector('#todos').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    myTodos();
  }
});