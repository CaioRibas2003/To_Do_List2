// Commit: Docs: traduzir comentários para pt-BR
// Alterna modo de desenvolvimento/testes: quando true a interface usa localStorage
// em vez de chamar um backend.
const USE_LOCAL_STORAGE = true;

// Pequenas funções utilitárias para simplificar consultas ao DOM
const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// As chaves de armazenamento são gerenciadas pela classe TaskAPI

// Usa a classe TaskAPI fornecida em taskApi.js
// Ela expõe `window.TaskAPI` com as operações de armazenamento usadas pela UI.

document.addEventListener('DOMContentLoaded', async function() {
    // Registro diagnóstico (útil para depuração)
    console.log('Aplicação iniciando, USE_LOCAL_STORAGE =', USE_LOCAL_STORAGE);
    window.addEventListener('error', function(evt) {
        try {
            console.error('Erro global capturado:', evt.error || evt.message || evt);
        } catch(e) {}
    });
    // Observação: o banner de aviso sobre localStorage foi removido da interface
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
    const descEditBtn = document.getElementById('desc-edit-btn');
    const descDeleteBtn = document.getElementById('desc-delete-btn');
    const descCompleteBtn = document.getElementById('desc-complete-btn');
    // edit mode button removed from UI
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

    // Inicializa a API de armazenamento (TaskAPI usa localStorage)
    const api = new TaskAPI();
    
    let tasks = [];
    let editingTaskId = null; // Identifica a tarefa em edição (usa id em vez de índice)
    let viewingTaskId = null; // id da tarefa atualmente exibida no modal de descrição
    
    // Carrega as tarefas do armazenamento (TaskAPI lê do localStorage)
    await loadTasks();

    // Mapa de cores para o seletor de fundo
    const colorMap = {
        'blue': { color: '#4285f4', name: 'Azul' },
        'green': { color: '#34a853', name: 'Verde' },
        'pink': { color: '#ff69b4', name: 'Rosa' },
        'orange': { color: '#ffa500', name: 'Laranja' },
        'brown': { color: '#8b4513', name: 'Marrom' }
    };

    // Lógica do dropdown customizado (abrimos a lista no <body> para evitar
    // que fique atrás de modais)
    function initCustomSelect() {
        const selectSelected = backgroundColorPicker.querySelector('.select-selected');
        const selectItems = backgroundColorPicker.querySelector('.select-items');
        const selectOptions = selectItems.querySelectorAll('.select-option');

    // Ao abrir o dropdown, movemos a lista para o <body> e a posicionamos
    // com position:fixed para que não seja obstruída por outros elementos.
        selectSelected.addEventListener('click', function(event) {
            const isHidden = selectItems.classList.contains('select-hide');
            if (isHidden) {
                // Abrir: posiciona selectItems no viewport com base no retângulo do seletor
                const rect = selectSelected.getBoundingClientRect();
                // Move para o body para ficar acima de overlays/modais
                if (!document.body.contains(selectItems)) {
                    document.body.appendChild(selectItems);
                }
                selectItems.style.position = 'fixed';
                selectItems.style.left = `${rect.left}px`;
                selectItems.style.top = `${rect.bottom}px`;
                selectItems.style.width = `${rect.width}px`;
                selectItems.style.zIndex = '10050';
                selectItems.classList.remove('select-hide');
                selectSelected.classList.add('select-arrow-active');
            } else {
                // Fechar: retorna para o container original e restaura estilos
                selectItems.classList.add('select-hide');
                selectSelected.classList.remove('select-arrow-active');
                selectItems.style.position = '';
                selectItems.style.left = '';
                selectItems.style.top = '';
                selectItems.style.width = '';
                selectItems.style.zIndex = '';
                // tenta reanexar a lista ao picker caso ela tenha sido movida para o <body>
                if (!backgroundColorPicker.contains(selectItems)) {
                    backgroundColorPicker.appendChild(selectItems);
                }
            }
            event.stopPropagation();
        });

    // Tratamento de clique em opção
        selectOptions.forEach(option => {
            option.addEventListener('click', async function() {
                const selectedValue = this.getAttribute('data-value');
                const selectedColorData = colorMap[selectedValue];
                
                // Atualiza o mostrador com a cor e o nome selecionados
                const selectedIndicator = selectSelected.querySelector('.color-indicator');
                const selectedName = selectSelected.querySelector('.color-name');
                selectedIndicator.style.backgroundColor = selectedColorData.color;
                selectedName.textContent = selectedColorData.name;

                // Atualiza estado selecionado
                selectOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');

                // Aplica a cor ao fundo e salva na configuração
                document.body.style.backgroundColor = selectedColorData.color;
                await api.saveSetting('backgroundColor', selectedColorData.color);

                // Fecha o dropdown
                selectItems.classList.add('select-hide');
                selectSelected.classList.remove('select-arrow-active');
            });
        });

    // Fecha o dropdown ao clicar fora (considera que a lista pode estar ported)
        document.addEventListener('click', function(e) {
            if (!backgroundColorPicker.contains(e.target) && !selectItems.contains(e.target)) {
                selectItems.classList.add('select-hide');
                selectSelected.classList.remove('select-arrow-active');
                // reset portal styles if needed
                selectItems.style.position = '';
                selectItems.style.left = '';
                selectItems.style.top = '';
                selectItems.style.width = '';
                selectItems.style.zIndex = '';
                if (!backgroundColorPicker.contains(selectItems)) {
                    backgroundColorPicker.appendChild(selectItems);
                }
            }
        });
    }

    // Carrega preferências de fundo do armazenamento
    async function loadBackgroundPreferences() {
        // Primeiro verifica se há uma imagem de fundo salva (prioridade sobre cor)
        const savedBackgroundImage = await api.getSetting('backgroundImage');
        if (savedBackgroundImage) {
            document.body.style.backgroundImage = `url(${savedBackgroundImage})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.backgroundAttachment = 'fixed';
            
            // Exibe o botão de remover imagem
            removeBackgroundImage.style.display = 'inline-block';
            
            // Atualiza o visual do seletor para indicar imagem personalizada
            const selectSelected = backgroundColorPicker.querySelector('.select-selected');
            const selectedIndicator = selectSelected.querySelector('.color-indicator');
            const selectedName = selectSelected.querySelector('.color-name');
            selectedIndicator.style.backgroundColor = '#f0f0f0';
            selectedName.textContent = 'Imagem personalizada';
            
            // Limpa a seleção nas opções de cor
            const selectOptions = backgroundColorPicker.querySelectorAll('.select-option');
            selectOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Desabilita seleção de cor enquanto a imagem estiver ativa
            disableColorSelection();
        } else {
            // Carrega cor de fundo (caso não haja imagem)
            const savedBackgroundColor = await api.getSetting('backgroundColor');
            if (savedBackgroundColor) {
                document.body.style.backgroundColor = savedBackgroundColor;
                // Encontra o nome da cor salva para atualizar o seletor
                const colorName = Object.keys(colorMap).find(key => colorMap[key].color === savedBackgroundColor);
                if (colorName) {
                    const selectSelected = backgroundColorPicker.querySelector('.select-selected');
                    const selectedIndicator = selectSelected.querySelector('.color-indicator');
                    const selectedName = selectSelected.querySelector('.color-name');
                    selectedIndicator.style.backgroundColor = colorMap[colorName].color;
                    selectedName.textContent = colorMap[colorName].name;

                    // Atualiza o estado selecionado nas opções
                    const selectOptions = backgroundColorPicker.querySelectorAll('.select-option');
                    selectOptions.forEach(opt => {
                        opt.classList.remove('selected');
                        if (opt.getAttribute('data-value') === colorName) {
                            opt.classList.add('selected');
                        }
                    });
                }
            } else {
                // Se não houver preferência, usa laranja como padrão e salva
                document.body.style.backgroundColor = '#ffa500';
                await api.saveSetting('backgroundColor', '#ffa500');
            }
        }
    }

    // Inicializa o seletor e carrega as preferências de fundo
    initCustomSelect();
    await loadBackgroundPreferences();

    // Upload de imagem para o fundo
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
                
                // Salva a imagem no armazenamento (localStorage)
                await api.saveSetting('backgroundImage', imageDataUrl);
                await api.deleteSetting('backgroundColor'); // Clear color preference
                
                // Mostra o botão de remover a imagem
                removeBackgroundImage.style.display = 'inline-block';
                
                // Reset color picker to show no selection
                const selectSelected = backgroundColorPicker.querySelector('.select-selected');
                const selectedIndicator = selectSelected.querySelector('.color-indicator');
                const selectedName = selectSelected.querySelector('.color-name');
                selectedIndicator.style.backgroundColor = '#f0f0f0';
                selectedName.textContent = 'Imagem personalizada';
                
                // Limpa a seleção das opções de cor
                const selectOptions = backgroundColorPicker.querySelectorAll('.select-option');
                selectOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Desabilita seleção de cor quando a imagem é usada
                disableColorSelection();
            };
            reader.readAsDataURL(file);
        }
    });

    // Remover imagem de fundo
    removeBackgroundImage.addEventListener('click', async function() {
        // Remove background image
        document.body.style.backgroundImage = '';
        document.body.style.backgroundSize = '';
        document.body.style.backgroundPosition = '';
        document.body.style.backgroundRepeat = '';
        document.body.style.backgroundAttachment = '';
        
    // Restaura cor padrão e limpa configuração de imagem
    document.body.style.backgroundColor = '#ffa500';
    await api.deleteSetting('backgroundImage');
    await api.saveSetting('backgroundColor', '#ffa500');
        
        // Hide remove button
        removeBackgroundImage.style.display = 'none';
        
        // Reset file input
        backgroundImageUpload.value = '';
        
    // Ajusta o seletor para mostrar Laranja como selecionado
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
        
        // Reativa seleção de cores
        enableColorSelection();
    });

    // Desativa seleção de cor enquanto houver imagem de fundo
    function disableColorSelection() {
        const colorOptionGroup = backgroundOptionsModal.querySelector('.option-group:first-child');
        colorOptionGroup.classList.add('disabled');
        backgroundColorPicker.classList.add('disabled');
    }

    // Reativa seleção de cor quando a imagem é removida
    function enableColorSelection() {
        const colorOptionGroup = backgroundOptionsModal.querySelector('.option-group:first-child');
        colorOptionGroup.classList.remove('disabled');
        backgroundColorPicker.classList.remove('disabled');
    }

    // Carrega tarefas do localStorage
    async function loadTasks() {
        try {
            tasks = await api.getTasks();
            renderTasks();
        } catch (error) {
            console.error('Failed to load tasks:', error);
            tasks = [];
        }
    }

    // Envio do formulário para criar nova tarefa
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
                
                // Limpa o formulário
                input.value = '';
                descInput.value = '';
                urgencyInput.value = 'low';
                dueDateInput.value = '';
                
                renderTasks();
                if (calendarVisible) {
                    // If calendar is showing, refresh it so the new task appears
                    renderCalendar(currentYear, currentMonth);
                }
            } catch (error) {
                console.error('Erro ao adicionar tarefa:', error);
            }
        }
    });

    // Envio do formulário de edição
    editForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (editingTaskId) {
            const title = editTitle.value.trim();
            const desc = editDesc.value.trim();
            const urgency = editUrgency.value;
            const dueDate = editDueDate.value;
            
            if (title && desc && dueDate) {
                try {
                    // Atualiza a tarefa no armazenamento
                    await api.updateTask(editingTaskId, { title, desc, urgency, dueDate });
                    
                    // Atualiza o array local de tarefas
                    const taskIndex = tasks.findIndex(task => task.id === editingTaskId);
                    if (taskIndex > -1) {
                        tasks[taskIndex] = { ...tasks[taskIndex], title, desc, urgency, dueDate };
                    }
                    
                    renderTasks();
                    if (calendarVisible) {
                        renderCalendar(currentYear, currentMonth);
                    }
                    
                    // Fecha modal e reseta estado
                    editModal.style.display = 'none';
                    editingTaskId = null;
                    
                    // Limpa o formulário de edição
                    editTitle.value = '';
                    editDesc.value = '';
                    editUrgency.value = 'low';
                    editDueDate.value = '';
                } catch (error) {
                    console.error('Erro ao atualizar tarefa:', error);
                }
            }
        }
    });

    // Abre modal para selecionar tarefa a editar
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

    // Calcula o status em relação ao prazo (0: atrasada, 1: próxima, 2: normal)
    // Analisa uma string 'YYYY-MM-DD' e retorna uma Date no timezone local
    function parseLocalDate(dateStr) {
        if (!dateStr) return null;
        // dateStr expected format: YYYY-MM-DD
        const parts = dateStr.split('-').map(p => parseInt(p, 10));
        if (parts.length !== 3 || parts.some(isNaN)) return new Date(dateStr);
        const [y, m, d] = parts;
        // monthIndex is zero-based
        return new Date(y, m - 1, d);
    }

    function dueStatus(task) {
        const today = new Date();
        today.setHours(0,0,0,0);
        if (task.dueDate) {
            const due = parseLocalDate(task.dueDate);
            if (!due || isNaN(due.getTime())) return 2;
            due.setHours(0,0,0,0);
            if (due < today) return 0; // atrasada
            const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
            if (diffDays <= 2) return 1; // próxima
            return 2; // normal
        }
        return 2;
    }

    // Renderiza um item de tarefa (botões, estilos de prazo)
    function renderTaskItem(task) {
        const li = document.createElement('li');
        const isLate = dueStatus(task) === 0;
        const isSoon = dueStatus(task) === 1;
        const dueDateStr = task.dueDate ? `<span style="font-size:0.9em;color:#555;">Prazo: ${formatDate(task.dueDate)}</span> ` : '';
        const taskTitle = isLate ? task.title.toUpperCase() : task.title;
        let taskStyle = '';
        if (isLate) taskStyle = 'color:#c00;font-weight:bold;';
        else if (isSoon) taskStyle = 'color:orange;font-weight:bold;';
        else if (task.dueDate) taskStyle = 'color:green;font-weight:bold;';

        const titleHtml = `<strong>${taskTitle}</strong><br>`;
        li.innerHTML = `<span style="${taskStyle}">${titleHtml}${dueDateStr}</span>`;

        // Make the entire list item clickable to open the shared description modal
        li.style.cursor = 'pointer';
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            viewingTaskId = task.id;
            modalTitle.textContent = task.title;
            modalDesc.textContent = task.desc;
            descModal.style.display = 'flex';
        });

        return li;
    }

    // Renderiza uma coluna de tarefas por nível de urgência
    function renderColumn(listElem, group) {
        group.sort((a, b) => {
            const sa = dueStatus(a);
            const sb = dueStatus(b);
            if (sa !== sb) return sa - sb; // prioriza atrasadas -> próximas -> normais
            // mesma categoria: ordena por data (mais próxima primeiro)
            const da = a.dueDate ? parseLocalDate(a.dueDate) : null;
            const db = b.dueDate ? parseLocalDate(b.dueDate) : null;
            if (da && db) return da - db;
            if (da && !db) return -1;
            if (!da && db) return 1;
            return 0;
        });
        listElem.innerHTML = '';
        group.forEach(task => listElem.appendChild(renderTaskItem(task)));
    }

    // Renderiza todas as tarefas nas suas colunas
    function renderTasks() {
        const urgencyGroups = { high: [], medium: [], low: [] };
        tasks.forEach(t => urgencyGroups[t.urgency].push(t));
        renderColumn(highList, urgencyGroups.high);
        renderColumn(mediumList, urgencyGroups.medium);
        renderColumn(lowList, urgencyGroups.low);
    }

    // Lógica de fechamento de modais
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

    // Wire description modal Edit/Delete buttons
    if (descEditBtn) {
        descEditBtn.addEventListener('click', function() {
            if (!viewingTaskId) return;
            const task = tasks.find(t => t.id === viewingTaskId);
            if (!task) return;
            // Prefill edit form and open edit modal
            editingTaskId = task.id;
            editTitle.value = task.title;
            editDesc.value = task.desc;
            editDueDate.value = task.dueDate;
            editUrgency.value = task.urgency;
            descModal.style.display = 'none';
            editModal.style.display = 'flex';
        });
    }

    if (descDeleteBtn) {
        descDeleteBtn.addEventListener('click', async function() {
            if (!viewingTaskId) return;
            try {
                await api.deleteTask(viewingTaskId);
                const idx = tasks.findIndex(t => t.id === viewingTaskId);
                if (idx > -1) tasks.splice(idx, 1);
                viewingTaskId = null;
                descModal.style.display = 'none';
                renderTasks();
                if (calendarVisible) renderCalendar(currentYear, currentMonth);
            } catch (e) {
                console.error('Erro ao excluir tarefa:', e);
            }
        });
    }

    if (descCompleteBtn) {
        descCompleteBtn.addEventListener('click', async function() {
            if (!viewingTaskId) return;
            try {
                await api.deleteTask(viewingTaskId);
                const idx = tasks.findIndex(t => t.id === viewingTaskId);
                if (idx > -1) tasks.splice(idx, 1);
                viewingTaskId = null;
                descModal.style.display = 'none';
                renderTasks();
                if (calendarVisible) renderCalendar(currentYear, currentMonth);
            } catch (e) {
                console.error('Erro ao marcar tarefa como concluída:', e);
            }
        });
    }
    
    // Botão que abre as opções de cor/fundo
    toggleColorOptions.addEventListener('click', function() {
        backgroundOptionsModal.style.display = 'flex';
    });

    // Edit mode removed — use item click or modal Edit button to edit tasks
    
    // Toggle calendar view
    const toggleCalendarViewBtn = document.getElementById('toggle-calendar-view');
    const calendarContainer = document.getElementById('calendar-container');
    let calendarVisible = false;
    let currentMonth = (new Date()).getMonth();
    let currentYear = (new Date()).getFullYear();

    toggleCalendarViewBtn.addEventListener('click', function() {
        calendarVisible = !calendarVisible;
        if (calendarVisible) {
            // show calendar, hide columns container
            document.querySelector('.columns-container').style.display = 'none';
            calendarContainer.style.display = 'block';
                toggleCalendarViewBtn.classList.add('active');
            renderCalendar(currentYear, currentMonth);
        } else {
            document.querySelector('.columns-container').style.display = 'flex';
            calendarContainer.style.display = 'none';
                toggleCalendarViewBtn.classList.remove('active');
        }
    });

    // Helpers to render calendar grid and tasks
    function startOfMonth(year, month) {
        return new Date(year, month, 1);
    }
    function endOfMonth(year, month) {
        return new Date(year, month + 1, 0);
    }

    function renderCalendar(year, month) {
        calendarContainer.innerHTML = '';
        const header = document.createElement('div');
        header.className = 'calendar-header';
        const title = document.createElement('div');
        title.textContent = `${startOfMonth(year, month).toLocaleString('pt-BR', { month: 'long' })} ${year}`;
        const controls = document.createElement('div');
        controls.className = 'calendar-controls';
        const prevBtn = document.createElement('button'); prevBtn.textContent = '<';
        const nextBtn = document.createElement('button'); nextBtn.textContent = '>';
    const todayBtn = document.createElement('button'); todayBtn.textContent = 'Voltar ao mês atual';
        controls.appendChild(prevBtn);
        controls.appendChild(todayBtn);
        controls.appendChild(nextBtn);
        header.appendChild(title);
        header.appendChild(controls);
        calendarContainer.appendChild(header);

        // Weekday headers
        const grid = document.createElement('div');
        grid.className = 'calendar-grid';
        const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        weekdays.forEach(w => {
            const wdiv = document.createElement('div');
            wdiv.className = 'calendar-weekday';
            wdiv.textContent = w;
            grid.appendChild(wdiv);
        });

        // Build the cells for the month (including leading/trailing days)
        const start = startOfMonth(year, month);
        const end = endOfMonth(year, month);
        const startDay = start.getDay(); // 0 (Sun) - 6 (Sat)
        const daysInMonth = end.getDate();
        // Determine how many preceding days from previous month to show
        const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
        const cells = [];
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            grid.appendChild(cell);
            cells.push(cell);
        }

        // Fill cells with dates
        const today = new Date();
        today.setHours(0,0,0,0);
        let dayCounter = 1 - startDay; // starts possibly negative
        for (let i = 0; i < totalCells; i++, dayCounter++) {
            const cell = cells[i];
            const cellDate = new Date(year, month, dayCounter);
            const dateNum = cellDate.getDate();
            const isInMonth = (cellDate.getMonth() === month);
            if (!isInMonth) cell.classList.add('inactive');
            const dateDiv = document.createElement('div');
            dateDiv.className = 'date-number';
            dateDiv.textContent = dateNum;
            cell.appendChild(dateDiv);

            // If this date is today (local), add a blue circular badge
            const cellCopy = new Date(cellDate);
            cellCopy.setHours(0,0,0,0);
            if (cellCopy.getTime() === today.getTime()) {
                const badge = document.createElement('div');
                badge.className = 'today-badge';
                cell.appendChild(badge);
            }

            // Render tasks due on this date
            const tasksForDay = tasks.filter(t => {
                if (!t.dueDate) return false;
                const d = parseLocalDate(t.dueDate);
                if (!d) return false;
                return d.getFullYear() === cellDate.getFullYear() && d.getMonth() === cellDate.getMonth() && d.getDate() === cellDate.getDate();
            });
            tasksForDay.forEach(task => {
                const pill = document.createElement('div');
                // Color by due date status (late / soon / normal) instead of urgency
                const status = dueStatus(task); // 0: late, 1: soon, 2: normal
                const statusClass = status === 0 ? 'late' : status === 1 ? 'soon' : 'normal';
                pill.className = `task-pill ${statusClass}`;
                // Provide a more informative tooltip: title — status (urgency)
                const statusText = status === 0 ? 'Atrasada' : status === 1 ? 'Prazo próximo (≤2 dias)' : 'Prazo normal';
                const urgencyText = task.urgency === 'high' ? 'Alta' : task.urgency === 'medium' ? 'Média' : 'Baixa';
                pill.title = `${task.title} — ${statusText} (${urgencyText} urg.)`;
                pill.textContent = task.title;
                // Click opens description modal (reuse existing modal)
                pill.addEventListener('click', (e) => {
                    e.stopPropagation();
                    viewingTaskId = task.id;
                    modalTitle.textContent = task.title;
                    modalDesc.textContent = task.desc;
                    descModal.style.display = 'flex';
                });
                // Right-click to open edit modal
                pill.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    editingTaskId = task.id;
                    editTitle.value = task.title;
                    editDesc.value = task.desc;
                    editDueDate.value = task.dueDate;
                    editUrgency.value = task.urgency;
                    editModal.style.display = 'flex';
                });
                cell.appendChild(pill);
            });
        }

        calendarContainer.appendChild(grid);

        // Wire navigation
        prevBtn.addEventListener('click', () => {
            currentMonth -= 1;
            if (currentMonth < 0) { currentMonth = 11; currentYear -= 1; }
            renderCalendar(currentYear, currentMonth);
        });
        nextBtn.addEventListener('click', () => {
            currentMonth += 1;
            if (currentMonth > 11) { currentMonth = 0; currentYear += 1; }
            renderCalendar(currentYear, currentMonth);
        });
        todayBtn.addEventListener('click', () => {
            const now = new Date();
            currentMonth = now.getMonth();
            currentYear = now.getFullYear();
            renderCalendar(currentYear, currentMonth);
        });
    }
    
    // Fecha modais ao clicar fora
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

    // Formata string 'YYYY-MM-DD' para pt-BR usando data local
    function formatDate(dateStr) {
        const d = parseLocalDate(dateStr) || new Date(dateStr);
        if (isNaN(d)) return dateStr;
        return d.toLocaleDateString('pt-BR');
    }

    // renderTasks() é chamado por loadTasks após carregar as tarefas
});