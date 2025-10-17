// Commit: Docs: traduzir comentários para pt-BR
// TaskAPI: abstração simples de armazenamento usando localStorage.
// Exporta globalmente `TaskAPI` usada por `script.js`.
(function(window){
    class TaskAPI {
        constructor() {
            // Chaves no localStorage onde guardamos tarefas e configurações
            this.lsTasksKey = 'todo_tasks_v1';
            this.lsCompletedKey = 'todo_completed_v1';
            this.lsSettingsKey = 'todo_settings_v1';
        }
    // Lê o array de tarefas do localStorage (retorna [] em caso de erro)
    _loadTasksFromLS() {
            try {
                const raw = localStorage.getItem(this.lsTasksKey) || '[]';
                return JSON.parse(raw);
            } catch (e) {
                console.error('Failed to parse tasks from localStorage', e);
                return [];
            }
        }
        // Persiste o array de tarefas no localStorage
        _saveTasksToLS(tasks) {
            localStorage.setItem(this.lsTasksKey, JSON.stringify(tasks));
        }
        // Retorna todas as tarefas (local)
        async getTasks() {
            return this._loadTasksFromLS();
        }
        // Adiciona uma nova tarefa e retorna o objeto criado (com id)
        async addTask(task) {
            const tasks = this._loadTasksFromLS();
            const maxId = tasks.reduce((m, t) => Math.max(m, t.id || 0), 0);
            const id = maxId + 1 || Date.now();
            const newTask = { ...task, id };
            tasks.unshift(newTask);
            this._saveTasksToLS(tasks);
            return newTask;
        }
        // Atualiza a tarefa com o id informado e retorna o objeto atualizado
        async updateTask(id, task) {
            const tasks = this._loadTasksFromLS();
            const idx = tasks.findIndex(t => t.id === id);
            if (idx === -1) throw new Error('Task not found');
            const updated = { ...tasks[idx], ...task, id };
            tasks[idx] = updated;
            this._saveTasksToLS(tasks);
            return updated;
        }
        // Remove a tarefa com o id informado
        async deleteTask(id) {
            const tasks = this._loadTasksFromLS();
            const filtered = tasks.filter(t => t.id !== id);
            this._saveTasksToLS(filtered);
            return { message: 'Task deleted successfully' };
        }
        // Completed tasks handling (history)
        _loadCompletedFromLS() {
            try {
                const raw = localStorage.getItem(this.lsCompletedKey) || '[]';
                return JSON.parse(raw);
            } catch (e) {
                console.error('Failed to parse completed tasks from localStorage', e);
                return [];
            }
        }
        _saveCompletedToLS(list) {
            localStorage.setItem(this.lsCompletedKey, JSON.stringify(list));
        }
        // Add a completed task record (should include at least id, title, completedAt, original task fields)
        async addCompletedTask(record) {
            const list = this._loadCompletedFromLS();
            list.unshift(record);
            this._saveCompletedToLS(list);
            return record;
        }
        // Return completed task records
        async getCompletedTasks() {
            return this._loadCompletedFromLS();
        }
        // Recupera uma configuração por chave (ou null se inexistente)
        async getSetting(key) {
            try { const raw = localStorage.getItem(this.lsSettingsKey) || '{}'; const obj = JSON.parse(raw); return obj.hasOwnProperty(key) ? obj[key] : null; } catch(e){ console.error(e); return null; }
        }
        // Salva/atualiza uma configuração (key -> value)
        async saveSetting(key, value) {
            try { const raw = localStorage.getItem(this.lsSettingsKey) || '{}'; const obj = JSON.parse(raw); obj[key] = value; localStorage.setItem(this.lsSettingsKey, JSON.stringify(obj)); return { key, value, message: 'Setting saved (localStorage)' }; } catch(e){ console.error(e); throw e; }
        }
        // Remove uma configuração do armazenamento
        async deleteSetting(key) {
            try { const raw = localStorage.getItem(this.lsSettingsKey) || '{}'; const obj = JSON.parse(raw); delete obj[key]; localStorage.setItem(this.lsSettingsKey, JSON.stringify(obj)); return { message: 'Setting deleted (localStorage)' }; } catch(e){ console.error(e); throw e; }
        }
    }
    window.TaskAPI = TaskAPI;
})(window);
