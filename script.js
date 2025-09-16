document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('todo-form');
    const input = document.getElementById('todo-input');
    const descInput = document.getElementById('todo-desc-input');
    const urgencyInput = document.getElementById('urgency-input');
    const dueDateInput = document.getElementById('due-date-input');
    const highList = document.getElementById('high-urgency-list');
    const mediumList = document.getElementById('medium-urgency-list');
    const lowList = document.getElementById('low-urgency-list');
    const descModal = document.getElementById('desc-modal');
    const closeModal = document.getElementById('close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');

    let tasks = [];
    // Load tasks from localStorage if available
    if (localStorage.getItem('tasks')) {
        try {
            tasks = JSON.parse(localStorage.getItem('tasks'));
        } catch (e) {
            tasks = [];
        }
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const title = input.value.trim();
        const desc = descInput.value.trim();
        const urgency = urgencyInput.value;
        const dueDate = dueDateInput.value;
        if (title && desc && dueDate) {
            tasks.push({ title, desc, urgency, dueDate });
            saveTasks();
            input.value = '';
            descInput.value = '';
            urgencyInput.value = 'low';
            dueDateInput.value = '';
            renderTasks();
        }
    });



    function renderTasks() {
        // Clear all columns
        highList.innerHTML = '';
        mediumList.innerHTML = '';
        lowList.innerHTML = '';

        // Split tasks by urgency
        const urgencyGroups = {
            high: [],
            medium: [],
            low: []
        };
        tasks.forEach(task => {
            urgencyGroups[task.urgency].push(task);
        });

        // Helper to sort by late, soon, normal
        function dueStatus(task) {
            const today = new Date();
            today.setHours(0,0,0,0);
            if (task.dueDate) {
                const due = new Date(task.dueDate);
                due.setHours(0,0,0,0);
                if (due < today) return 0; // late
                const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
                if (diffDays <= 2) return 1; // close due
                return 2; // normal (green)
            }
            return 2; // treat no due date as normal
        }

        function renderColumn(listElem, group) {
            // Sort: late (0), close due (1), normal (2)
            group.sort((a, b) => dueStatus(a) - dueStatus(b));
            const today = new Date();
            today.setHours(0,0,0,0);
            group.forEach(task => {
                const li = document.createElement('li');
                let isLate = false;
                let isSoon = false;
                if (task.dueDate) {
                    const due = new Date(task.dueDate);
                    due.setHours(0,0,0,0);
                    if (due < today) {
                        isLate = true;
                    } else {
                        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
                        if (diffDays <= 2) isSoon = true;
                    }
                }
                let dueDateStr = task.dueDate ? `<span style=\"font-size:0.9em;color:#555;\">Prazo: ${formatDate(task.dueDate)}</span> ` : '';
                let taskTitle = isLate ? task.title.toUpperCase() : task.title;
                let taskStyle = '';
                if (isLate) {
                    taskStyle = 'color:#c00;font-weight:bold;';
                } else if (isSoon) {
                    taskStyle = 'color:orange;font-weight:bold;';
                } else if (task.dueDate) {
                    taskStyle = 'color:green;font-weight:bold;';
                }
                let titleHtml = `<strong>${taskTitle}</strong><br>`;
                let viewBtn = document.createElement('button');
                viewBtn.textContent = 'Ver descrição';
                viewBtn.className = 'view-desc-btn';
                viewBtn.onclick = function() {
                    modalTitle.textContent = task.title;
                    modalDesc.textContent = task.desc;
                    descModal.style.display = 'flex';
                };
                li.innerHTML = `<span style=\"${taskStyle}\">${titleHtml}${dueDateStr}</span>`;
                li.insertBefore(viewBtn, li.lastChild);
                const delBtn = document.createElement('button');
                delBtn.textContent = 'Excluir';
                delBtn.className = 'delete-btn';
                delBtn.onclick = function() {
                    const originalIdx = tasks.findIndex(t => t.title === task.title && t.urgency === task.urgency && t.dueDate === task.dueDate && t.desc === task.desc);
                    if (originalIdx > -1) tasks.splice(originalIdx, 1);
                    saveTasks();
                    renderTasks();
                };
                li.appendChild(delBtn);
                listElem.appendChild(li);
            });
        }

    // Modal close logic
    closeModal.onclick = function() {
        descModal.style.display = 'none';
    };
    window.onclick = function(event) {
        if (event.target === descModal) {
            descModal.style.display = 'none';
        }
    };

        renderColumn(highList, urgencyGroups.high);
        renderColumn(mediumList, urgencyGroups.medium);
        renderColumn(lowList, urgencyGroups.low);
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        return d.toLocaleDateString('pt-BR');
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function urgencyValue(urgency) {
        if (urgency === 'high') return 3;
        if (urgency === 'medium') return 2;
        return 1;
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Initial render
    renderTasks();
});
