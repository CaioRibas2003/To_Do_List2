const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize SQLite database
const db = new sqlite3.Database('./todos.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        
        // Create tasks table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            urgency TEXT NOT NULL,
            due_date TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        // Create settings table for background preferences
        db.run(`CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            setting_key TEXT UNIQUE NOT NULL,
            setting_value TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// API Routes

// Get all tasks
app.get('/api/tasks', (req, res) => {
    db.all('SELECT * FROM tasks ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Convert database format to frontend format
        const tasks = rows.map(row => ({
            title: row.title,
            desc: row.description,
            urgency: row.urgency,
            dueDate: row.due_date,
            id: row.id
        }));
        
        res.json(tasks);
    });
});

// Add new task
app.post('/api/tasks', (req, res) => {
    const { title, desc, urgency, dueDate } = req.body;
    
    if (!title || !desc || !urgency || !dueDate) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    db.run(
        'INSERT INTO tasks (title, description, urgency, due_date) VALUES (?, ?, ?, ?)',
        [title, desc, urgency, dueDate],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            res.json({
                id: this.lastID,
                title,
                desc,
                urgency,
                dueDate,
                message: 'Task created successfully'
            });
        }
    );
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
    const { title, desc, urgency, dueDate } = req.body;
    const taskId = req.params.id;
    
    if (!title || !desc || !urgency || !dueDate) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    db.run(
        'UPDATE tasks SET title = ?, description = ?, urgency = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, desc, urgency, dueDate, taskId],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }
            
            res.json({
                id: taskId,
                title,
                desc,
                urgency,
                dueDate,
                message: 'Task updated successfully'
            });
        }
    );
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    
    db.run('DELETE FROM tasks WHERE id = ?', taskId, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.json({ message: 'Task deleted successfully' });
    });
});

// Get setting (for background preferences)
app.get('/api/settings/:key', (req, res) => {
    const settingKey = req.params.key;
    
    db.get('SELECT setting_value FROM settings WHERE setting_key = ?', [settingKey], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        res.json({ 
            key: settingKey,
            value: row ? row.setting_value : null 
        });
    });
});

// Save setting (for background preferences)
app.post('/api/settings', (req, res) => {
    const { key, value } = req.body;
    
    if (!key) {
        return res.status(400).json({ error: 'Setting key is required' });
    }
    
    db.run(
        'INSERT OR REPLACE INTO settings (setting_key, setting_value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [key, value],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            res.json({
                key,
                value,
                message: 'Setting saved successfully'
            });
        }
    );
});

// Delete setting
app.delete('/api/settings/:key', (req, res) => {
    const settingKey = req.params.key;
    
    db.run('DELETE FROM settings WHERE setting_key = ?', settingKey, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        res.json({ message: 'Setting deleted successfully' });
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});