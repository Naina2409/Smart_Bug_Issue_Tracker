/* js/data.js - Data Management */

const StorageKey = 'smart_bugs';

// Sample initial data
const sampleBugs = [
    { id: 'BUG-101', title: 'Login page crashes on Safari', priority: 'critical', status: 'open', description: 'Safari browser crashes when submitting login form', assignee: 'Sarah', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'BUG-102', title: 'API timeout on large file uploads', priority: 'high', status: 'in-progress', description: 'Files over 10MB cause timeout', assignee: 'Mike', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 'BUG-103', title: 'Dark mode toggle not persisting', priority: 'medium', status: 'open', description: 'Theme resets after page refresh', assignee: 'Emma', createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 'BUG-104', title: 'Typo in error message', priority: 'low', status: 'resolved', description: 'Fix spelling mistake', assignee: 'Alex', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 'BUG-105', title: 'Payment gateway timeout', priority: 'critical', status: 'open', description: 'Payment processing fails after 30 seconds', assignee: 'Sarah', createdAt: new Date(Date.now() - 4 * 86400000).toISOString() }
];

function getBugs() {
    const stored = localStorage.getItem(StorageKey);
    if (!stored) {
        localStorage.setItem(StorageKey, JSON.stringify(sampleBugs));
        return [...sampleBugs];
    }
    return JSON.parse(stored);
}

function saveBugs(bugs) {
    localStorage.setItem(StorageKey, JSON.stringify(bugs));
}

function addBug(bugData) {
    const bugs = getBugs();
    const newId = `BUG-${Math.floor(100 + Math.random() * 900)}`;
    const newBug = {
        id: newId,
        title: bugData.title,
        priority: bugData.priority,
        status: bugData.status,
        description: bugData.description,
        assignee: bugData.assignee,
        createdAt: new Date().toISOString()
    };
    bugs.unshift(newBug);
    saveBugs(bugs);
    return newBug;
}

function updateBug(id, updates) {
    const bugs = getBugs();
    const index = bugs.findIndex(b => b.id === id);
    if (index !== -1) {
        bugs[index] = { ...bugs[index], ...updates };
        saveBugs(bugs);
        return true;
    }
    return false;
}

function deleteBug(id) {
    let bugs = getBugs();
    bugs = bugs.filter(b => b.id !== id);
    saveBugs(bugs);
    return true;
}

function getStats() {
    const bugs = getBugs();
    return {
        total: bugs.length,
        open: bugs.filter(b => b.status === 'open').length,
        inProgress: bugs.filter(b => b.status === 'in-progress').length,
        resolved: bugs.filter(b => b.status === 'resolved').length,
        critical: bugs.filter(b => b.priority === 'critical').length,
        high: bugs.filter(b => b.priority === 'high').length,
        medium: bugs.filter(b => b.priority === 'medium').length,
        low: bugs.filter(b => b.priority === 'low').length
    };
}