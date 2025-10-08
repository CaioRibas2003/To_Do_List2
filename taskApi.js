// TaskAPI: storage abstraction supporting localStorage or a server API.
// This file exports a global `TaskAPI` constructor used by `script.js`.
(function(window){
    class TaskAPI {
        constructor() {
            this.baseURL = window.location.origin;
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
        async getTasks(useLocal = true) {
            if (useLocal) return this._loadTasksFromLS();
            try {
                const response = await fetch(`${this.baseURL}/api/tasks`);
                if (!response.ok) throw new Error('Failed to fetch tasks');
                return await response.json();
            } catch (error) {
                console.error('Error fetching tasks:', error);
                return [];
            }
        }
        async addTask(task, useLocal = true) {
            if (useLocal) {
                const tasks = this._loadTasksFromLS();
                const maxId = tasks.reduce((m, t) => Math.max(m, t.id || 0), 0);
                const id = maxId + 1 || Date.now();
                const newTask = { ...task, id };
                tasks.unshift(newTask);
                this._saveTasksToLS(tasks);
                return newTask;
            }
            try {
                const response = await fetch(`${this.baseURL}/api/tasks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(task)
                });
                if (!response.ok) throw new Error('Failed to add task');
                return await response.json();
            } catch (error) { console.error('Error adding task:', error); throw error; }
        }
        async updateTask(id, task, useLocal = true) {
            if (useLocal) {
                const tasks = this._loadTasksFromLS();
                const idx = tasks.findIndex(t => t.id === id);
                if (idx === -1) throw new Error('Task not found');
                const updated = { ...tasks[idx], ...task, id };
                tasks[idx] = updated;
                this._saveTasksToLS(tasks);
                return updated;
            }
            try {
                const response = await fetch(`${this.baseURL}/api/tasks/${id}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task)
                });
                if (!response.ok) throw new Error('Failed to update task');
                return await response.json();
            } catch (error) { console.error('Error updating task:', error); throw error; }
        }
        async deleteTask(id, useLocal = true) {
            if (useLocal) {
                const tasks = this._loadTasksFromLS();
                const filtered = tasks.filter(t => t.id !== id);
                this._saveTasksToLS(filtered);
                return { message: 'Task deleted successfully' };
            }
            try {
                const response = await fetch(`${this.baseURL}/api/tasks/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete task');
                return await response.json();
            } catch (error) { console.error('Error deleting task:', error); throw error; }
        }
        async getSetting(key, useLocal = true) {
            if (useLocal) {
                try { const raw = localStorage.getItem(this.lsSettingsKey) || '{}'; const obj = JSON.parse(raw); return obj.hasOwnProperty(key) ? obj[key] : null; } catch(e){ console.error(e); return null; }
            }
            try { const response = await fetch(`${this.baseURL}/api/settings/${key}`); if (!response.ok) throw new Error('Failed to fetch setting'); const data = await response.json(); return data.value; } catch(e){ console.error(e); return null; }
        }
        async saveSetting(key, value, useLocal = true) {
            if (useLocal) {
                try { const raw = localStorage.getItem(this.lsSettingsKey) || '{}'; const obj = JSON.parse(raw); obj[key] = value; localStorage.setItem(this.lsSettingsKey, JSON.stringify(obj)); return { key, value, message: 'Setting saved (localStorage)' }; } catch(e){ console.error(e); throw e; }
            }
            try { const response = await fetch(`${this.baseURL}/api/settings`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ key, value }) }); if (!response.ok) throw new Error('Failed to save setting'); return await response.json(); } catch(e){ console.error(e); throw e; }
        }
        async deleteSetting(key, useLocal = true) {
            if (useLocal) {
                try { const raw = localStorage.getItem(this.lsSettingsKey) || '{}'; const obj = JSON.parse(raw); delete obj[key]; localStorage.setItem(this.lsSettingsKey, JSON.stringify(obj)); return { message: 'Setting deleted (localStorage)' }; } catch(e){ console.error(e); throw e; }
            }
            try { const response = await fetch(`${this.baseURL}/api/settings/${key}`, { method: 'DELETE' }); if (!response.ok) throw new Error('Failed to delete setting'); return await response.json(); } catch(e){ console.error(e); throw e; }
        }
    }
    window.TaskAPI = TaskAPI;
})(window);
