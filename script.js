// Database API utility functions
class TaskAPI {
    constructor() {
        this.baseURL = window.location.origin;
    }

    async getTasks() {
        try {
            const response = await fetch(`${this.baseURL}/api/tasks`);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            return await response.json();
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }
    }

    async addTask(task) {
        try {
            const response = await fetch(`${this.baseURL}/api/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(task)
            });
            if (!response.ok) throw new Error('Failed to add task');
            return await response.json();
        } catch (error) {
            console.error('Error adding task:', error);
            throw error;
        }
    }

    async updateTask(id, task) {
        try {
            const response = await fetch(`${this.baseURL}/api/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(task)
            });
            if (!response.ok) throw new Error('Failed to update task');
            return await response.json();
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }

    async deleteTask(id) {
        try {
            const response = await fetch(`${this.baseURL}/api/tasks/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete task');
            return await response.json();
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }

    async getSetting(key) {
        try {
            const response = await fetch(`${this.baseURL}/api/settings/${key}`);
            if (!response.ok) throw new Error('Failed to fetch setting');
            const data = await response.json();
            return data.value;
        } catch (error) {
            console.error('Error fetching setting:', error);
            return null;
        }
    }

    async saveSetting(key, value) {
        try {
            const response = await fetch(`${this.baseURL}/api/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ key, value })
            });
            if (!response.ok) throw new Error('Failed to save setting');
            return await response.json();
        } catch (error) {
            console.error('Error saving setting:', error);
            throw error;
        }
    }

    async deleteSetting(key) {
        try {
            const response = await fetch(`${this.baseURL}/api/settings/${key}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete setting');
            return await response.json();  
        } catch (error) {
            console.error('Error deleting setting:', error);
            throw error;
        }
    }
}

document.addEventListener('DOMContentLoaded', async function() {
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
    const toggleEditMode = document.getElementById('toggle-edit-mode');
    const taskSelectionModal = document.getElementById('task-selection-modal');
    const closeTaskSelectionModal = document.getElementById('close-task-selection-modal');
    const taskSelectionList = document.getElementById('task-selection-list');
    const editModal = document.getElementById('edit-modal');
    const closeEditModal = document.getElementById('close-edit-modal');
    const editForm = document.getElementById('edit-form');
    const editTitle = document.getElementById('edit-title');
    const editDesc = document.getElementById('edit-desc');
    const editDueDate = document.getElementById('edit-due-date');
    const editUrgency = document.getElementById('edit-urgency');
    const cancelEdit = document.getElementById('cancel-edit');
    const toggleColorOptions = document.getElementById('toggle-color-options');
    const backgroundOptionsModal = document.getElementById('background-options-modal');
    const closeBackgroundOptionsModal = document.getElementById('close-background-options-modal');
    const backgroundColorPicker = document.getElementById('background-color-picker');
    const backgroundImageUpload = document.getElementById('background-image-upload');
    const removeBackgroundImage = document.getElementById('remove-background-image');

    // Initialize API
    const api = new TaskAPI();
    
    let tasks = [];
    let editingTaskId = null; // Track which task is being edited (using ID instead of index)
    
    // Load tasks from database
    await loadTasks();

    // Color mapping
    const colorMap = {
        'blue': { color: '#4285f4', name: 'Azul' },
        'green': { color: '#34a853', name: 'Verde' },
        'pink': { color: '#ff69b4', name: 'Rosa' },
        'orange': { color: '#ffa500', name: 'Laranja' },
        'brown': { color: '#8b4513', name: 'Marrom' }
    };

    // Custom dropdown functionality
    function initCustomSelect() {
        const selectSelected = backgroundColorPicker.querySelector('.select-selected');
        const selectItems = backgroundColorPicker.querySelector('.select-items');
        const selectOptions = selectItems.querySelectorAll('.select-option');

        // Toggle dropdown
        selectSelected.addEventListener('click', function() {
            selectItems.classList.toggle('select-hide');
            selectSelected.classList.toggle('select-arrow-active');
        });

        // Handle option selection
        selectOptions.forEach(option => {
            option.addEventListener('click', async function() {
                const selectedValue = this.getAttribute('data-value');
                const selectedColorData = colorMap[selectedValue];
                
                // Update the selected display
                const selectedIndicator = selectSelected.querySelector('.color-indicator');
                const selectedName = selectSelected.querySelector('.color-name');
                selectedIndicator.style.backgroundColor = selectedColorData.color;
                selectedName.textContent = selectedColorData.name;

                // Update selected state
                selectOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');

                // Change background color
                document.body.style.backgroundColor = selectedColorData.color;
                await api.saveSetting('backgroundColor', selectedColorData.color);

                // Close dropdown
                selectItems.classList.add('select-hide');
                selectSelected.classList.remove('select-arrow-active');
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!backgroundColorPicker.contains(e.target)) {
                selectItems.classList.add('select-hide');
                selectSelected.classList.remove('select-arrow-active');
            }
        });
    }

    // Load background preferences from database
    async function loadBackgroundPreferences() {
        // Load background image from database if available (check this before color)
        const savedBackgroundImage = await api.getSetting('backgroundImage');
        if (savedBackgroundImage) {
            document.body.style.backgroundImage = `url(${savedBackgroundImage})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.backgroundAttachment = 'fixed';
            
            // Show remove button
            removeBackgroundImage.style.display = 'inline-block';
            
            // Update color picker display
            const selectSelected = backgroundColorPicker.querySelector('.select-selected');
            const selectedIndicator = selectSelected.querySelector('.color-indicator');
            const selectedName = selectSelected.querySelector('.color-name');
            selectedIndicator.style.backgroundColor = '#f0f0f0';
            selectedName.textContent = 'Imagem personalizada';
            
            // Clear selected state from color options
            const selectOptions = backgroundColorPicker.querySelectorAll('.select-option');
            selectOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Disable color selection since image is active
            disableColorSelection();
        } else {
            // Load background color from database if available (only if no image)
            const savedBackgroundColor = await api.getSetting('backgroundColor');
            if (savedBackgroundColor) {
                document.body.style.backgroundColor = savedBackgroundColor;
                // Find the color name that matches the saved color
                const colorName = Object.keys(colorMap).find(key => colorMap[key].color === savedBackgroundColor);
                if (colorName) {
                    const selectSelected = backgroundColorPicker.querySelector('.select-selected');
                    const selectedIndicator = selectSelected.querySelector('.color-indicator');
                    const selectedName = selectSelected.querySelector('.color-name');
                    selectedIndicator.style.backgroundColor = colorMap[colorName].color;
                    selectedName.textContent = colorMap[colorName].name;

                    // Update selected state in options
                    const selectOptions = backgroundColorPicker.querySelectorAll('.select-option');
                    selectOptions.forEach(opt => {
                        opt.classList.remove('selected');
                        if (opt.getAttribute('data-value') === colorName) {
                            opt.classList.add('selected');
                        }
                    });
                }
            } else {
                // Set default orange background if no preferences saved
                document.body.style.backgroundColor = '#ffa500';
                await api.saveSetting('backgroundColor', '#ffa500');
            }
        }
    }

    // Initialize custom select and load background preferences
    initCustomSelect();
    await loadBackgroundPreferences();

    // Background image upload functionality
    backgroundImageUpload.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = async function(event) {
                const imageDataUrl = event.target.result;
                document.body.style.backgroundImage = `url(${imageDataUrl})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                document.body.style.backgroundRepeat = 'no-repeat';
                document.body.style.backgroundAttachment = 'fixed';
                
                // Save image to database
                await api.saveSetting('backgroundImage', imageDataUrl);
                await api.deleteSetting('backgroundColor'); // Clear color preference
                
                // Show remove button
                removeBackgroundImage.style.display = 'inline-block';
                
                // Reset color picker to show no selection
                const selectSelected = backgroundColorPicker.querySelector('.select-selected');
                const selectedIndicator = selectSelected.querySelector('.color-indicator');
                const selectedName = selectSelected.querySelector('.color-name');
                selectedIndicator.style.backgroundColor = '#f0f0f0';
                selectedName.textContent = 'Imagem personalizada';
                
                // Clear selected state from color options
                const selectOptions = backgroundColorPicker.querySelectorAll('.select-option');
                selectOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Disable color selection
                disableColorSelection();
            };
            reader.readAsDataURL(file);
        }
    });

    // Remove background image functionality
    removeBackgroundImage.addEventListener('click', async function() {
        // Remove background image
        document.body.style.backgroundImage = '';
        document.body.style.backgroundSize = '';
        document.body.style.backgroundPosition = '';
        document.body.style.backgroundRepeat = '';
        document.body.style.backgroundAttachment = '';
        
        // Restore default orange background
        document.body.style.backgroundColor = '#ffa500';
        
        // Clear database settings
        await api.deleteSetting('backgroundImage');
        await api.saveSetting('backgroundColor', '#ffa500');
        
        // Hide remove button
        removeBackgroundImage.style.display = 'none';
        
        // Reset file input
        backgroundImageUpload.value = '';
        
        // Reset color picker to orange
        const selectSelected = backgroundColorPicker.querySelector('.select-selected');
        const selectedIndicator = selectSelected.querySelector('.color-indicator');
        const selectedName = selectSelected.querySelector('.color-name');
        selectedIndicator.style.backgroundColor = '#ffa500';
        selectedName.textContent = 'Laranja';
        
        // Set orange as selected in options
        const selectOptions = backgroundColorPicker.querySelectorAll('.select-option');
        selectOptions.forEach(opt => {
            opt.classList.remove('selected');
            if (opt.getAttribute('data-value') === 'orange') {
                opt.classList.add('selected');
            }
        });
        
        // Re-enable color selection
        enableColorSelection();
    });

    // Function to disable color selection when image is set
    function disableColorSelection() {
        const colorOptionGroup = backgroundOptionsModal.querySelector('.option-group:first-child');
        colorOptionGroup.classList.add('disabled');
        backgroundColorPicker.classList.add('disabled');
    }

    // Function to enable color selection when image is removed
    function enableColorSelection() {
        const colorOptionGroup = backgroundOptionsModal.querySelector('.option-group:first-child');
        colorOptionGroup.classList.remove('disabled');
        backgroundColorPicker.classList.remove('disabled');
    }

    // Load tasks from database
    async function loadTasks() {
        try {
            tasks = await api.getTasks();
            renderTasks();
        } catch (error) {
            console.error('Failed to load tasks:', error);
            tasks = [];
        }
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const title = input.value.trim();
        const desc = descInput.value.trim();
        const urgency = urgencyInput.value;
        const dueDate = dueDateInput.value;
        
        if (title && desc && dueDate) {
            try {
                const newTask = await api.addTask({ title, desc, urgency, dueDate });
                tasks.push(newTask);
                
                // Clear form
                input.value = '';
                descInput.value = '';
                urgencyInput.value = 'low';
                dueDateInput.value = '';
                
                renderTasks();
            } catch (error) {
                alert('Erro ao adicionar tarefa. Tente novamente.');
            }
        }
    });

    // Edit form submission handler
    editForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (editingTaskId) {
            const title = editTitle.value.trim();
            const desc = editDesc.value.trim();
            const urgency = editUrgency.value;
            const dueDate = editDueDate.value;
            
            if (title && desc && dueDate) {
                try {
                    // Update the task in database
                    await api.updateTask(editingTaskId, { title, desc, urgency, dueDate });
                    
                    // Update local tasks array
                    const taskIndex = tasks.findIndex(task => task.id === editingTaskId);
                    if (taskIndex > -1) {
                        tasks[taskIndex] = { ...tasks[taskIndex], title, desc, urgency, dueDate };
                    }
                    
                    renderTasks();
                    
                    // Close modal and reset
                    editModal.style.display = 'none';
                    editingTaskId = null;
                    
                    // Clear form
                    editTitle.value = '';
                    editDesc.value = '';
                    editUrgency.value = 'low';
                    editDueDate.value = '';
                } catch (error) {
                    alert('Erro ao atualizar tarefa. Tente novamente.');
                }
            }
        }
    });

    // Function to show task selection modal
    function showTaskSelectionModal() {
        taskSelectionList.innerHTML = '';
        
        tasks.forEach((task) => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-selection-item';
            
            const urgencyText = {
                'high': 'Alta',
                'medium': 'Média', 
                'low': 'Baixa'
            };
            
            taskItem.innerHTML = `
                <h4>${task.title}</h4>
                <p>${task.desc}</p>
                <div>
                    <span class="urgency-badge ${task.urgency}">${urgencyText[task.urgency]} Urgência</span>
                    <span class="due-date">Prazo: ${formatDate(task.dueDate)}</span>
                </div>
            `;
            
            taskItem.onclick = function() {
                editingTaskId = task.id;
                editTitle.value = task.title;
                editDesc.value = task.desc;
                editDueDate.value = task.dueDate;
                editUrgency.value = task.urgency;
                taskSelectionModal.style.display = 'none';
                editModal.style.display = 'flex';
            };
            
            taskSelectionList.appendChild(taskItem);
        });
        
        taskSelectionModal.style.display = 'flex';
    }

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
                delBtn.onclick = async function() {
                    try {
                        await api.deleteTask(task.id);
                        // Remove from local array
                        const taskIndex = tasks.findIndex(t => t.id === task.id);
                        if (taskIndex > -1) {
                            tasks.splice(taskIndex, 1);
                        }
                        renderTasks();
                    } catch (error) {
                        alert('Erro ao excluir tarefa. Tente novamente.');
                    }
                };
                li.appendChild(delBtn);
                listElem.appendChild(li);
            });
        }

        renderColumn(highList, urgencyGroups.high);
        renderColumn(mediumList, urgencyGroups.medium);
        renderColumn(lowList, urgencyGroups.low);
    }

    // Modal close logic
    closeModal.onclick = function() {
        descModal.style.display = 'none';
    };
    
    closeBackgroundOptionsModal.onclick = function() {
        backgroundOptionsModal.style.display = 'none';
    };

    closeTaskSelectionModal.onclick = function() {
        taskSelectionModal.style.display = 'none';
    };

    closeEditModal.onclick = function() {
        editModal.style.display = 'none';
        editingTaskId = null;
    };

    cancelEdit.onclick = function() {
        editModal.style.display = 'none';
        editingTaskId = null;
    };
    
    // Toggle color options modal
    toggleColorOptions.addEventListener('click', function() {
        backgroundOptionsModal.style.display = 'flex';
    });

    // Show task selection modal for editing
    toggleEditMode.addEventListener('click', function() {
        if (tasks.length === 0) {
            alert('Não há tarefas para editar!');
            return;
        }
        showTaskSelectionModal();
    });
    
    window.onclick = function(event) {
        if (event.target === descModal) {
            descModal.style.display = 'none';
        }
        if (event.target === backgroundOptionsModal) {
            backgroundOptionsModal.style.display = 'none';
        }
        if (event.target === taskSelectionModal) {
            taskSelectionModal.style.display = 'none';
        }
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
    };

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        return d.toLocaleDateString('pt-BR');
    }

    // Initial render
    renderTasks();
});