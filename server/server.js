const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const NOTES_FILE = path.join(__dirname, 'notes.json');
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(cors());
app.use(express.json());

app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'All fields required.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        let users = JSON.parse(data || '[]');
        if (users.find(u => u.username === username)) return res.status(400).json({ error: 'Username already taken.' });
        users.push({ username, email, password });
        fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), () => res.json({ success: true, username }));
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        let users = JSON.parse(data || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) return res.status(401).json({ error: 'Invalid username or password.' });
        res.json({ success: true, username: user.username });
    });
});

app.get('/api/notes/:username', (req, res) => {
    fs.readFile(NOTES_FILE, 'utf8', (err, data) => {
        const notes = JSON.parse(data || '[]');
        res.json(notes.filter(n => n.owner === req.params.username));
    });
});

app.post('/api/notes', (req, res) => {
    const { id, title, content, category, isPinned, owner } = req.body;
    fs.readFile(NOTES_FILE, 'utf8', (err, data) => {
        let notes = JSON.parse(data || '[]');
        const index = notes.findIndex(n => n.id === id);
        const noteData = { id, title, content, category: category || 'General', isPinned: isPinned || false, owner };
        if (index > -1) notes[index] = noteData;
        else notes.push(noteData);
        fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2), () => res.json({ success: true }));
    });
});

app.delete('/api/notes/:id', (req, res) => {
    fs.readFile(NOTES_FILE, 'utf8', (err, data) => {
        let notes = JSON.parse(data || '[]').filter(n => n.id !== req.params.id);
        fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2), () => res.json({ success: true }));
    });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
