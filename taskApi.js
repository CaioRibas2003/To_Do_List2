// TaskAPI: storage abstraction supporting localStorage or a server API.
// This file exports a global `TaskAPI` constructor used by `script.js`.
(function(window){
    class TaskAPI {
        constructor() {
            this.lsTasksKey = 'todo_tasks_v1';
            this.lsSettingsKey = 'todo_settings_v1';
        }
        _loadTasksFromLS() {
            try {
                const raw = localStorage.getItem(this.lsTasksKey) || '[]';
                return JSON.parse(raw);
            } catch (e) {
                console.error('Failed to parse tasks from localStorage', e);
                return [];
            }
        }
        _saveTasksToLS(tasks) {
            localStorage.setItem(this.lsTasksKey, JSON.stringify(tasks));
        }
        async getTasks() {
            return this._loadTasksFromLS();
        }
        async addTask(task) {
            const tasks = this._loadTasksFromLS();
            const maxId = tasks.reduce((m, t) => Math.max(m, t.id || 0), 0);
            const id = maxId + 1 || Date.now();
            const newTask = { ...task, id };
            tasks.unshift(newTask);
            this._saveTasksToLS(tasks);
            return newTask;
        }
        async updateTask(id, task) {
            const tasks = this._loadTasksFromLS();
            const idx = tasks.findIndex(t => t.id === id);
            if (idx === -1) throw new Error('Task not found');
            const updated = { ...tasks[idx], ...task, id };
            tasks[idx] = updated;
            this._saveTasksToLS(tasks);
            return updated;
        }
        async deleteTask(id) {
            const tasks = this._loadTasksFromLS();
            const filtered = tasks.filter(t => t.id !== id);
            this._saveTasksToLS(filtered);
            return { message: 'Task deleted successfully' };
        }
        async getSetting(key) {
            try { const raw = localStorage.getItem(this.lsSettingsKey) || '{}'; const obj = JSON.parse(raw); return obj.hasOwnProperty(key) ? obj[key] : null; } catch(e){ console.error(e); return null; }
        }
        async saveSetting(key, value) {
            try { const raw = localStorage.getItem(this.lsSettingsKey) || '{}'; const obj = JSON.parse(raw); obj[key] = value; localStorage.setItem(this.lsSettingsKey, JSON.stringify(obj)); return { key, value, message: 'Setting saved (localStorage)' }; } catch(e){ console.error(e); throw e; }
        }
        async deleteSetting(key) {
            try { const raw = localStorage.getItem(this.lsSettingsKey) || '{}'; const obj = JSON.parse(raw); delete obj[key]; localStorage.setItem(this.lsSettingsKey, JSON.stringify(obj)); return { message: 'Setting deleted (localStorage)' }; } catch(e){ console.error(e); throw e; }
        }
    }
    window.TaskAPI = TaskAPI;
})(window);
