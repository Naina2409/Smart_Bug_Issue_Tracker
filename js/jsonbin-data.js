/* js/jsonbin-data.js - Simple JSONBin Storage */

// ========== CONFIGURATION ==========
// REPLACE THESE WITH YOUR VALUES FROM JSONBIN.IO
const JSONBIN_API_KEY = "$2a$10$a.fFfuv2.VCmB24d.ExJeugbjm5OvOXBYw6/TX.zRNRkiWFb/eMDK";  // Get from Account → API Keys
const JSONBIN_BIN_ID = "69ea5cfc36566621a8e4a445";    // Get from your bin URL



// API URLs
const GET_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`;
const PUT_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// Headers
const headers = {
    'Content-Type': 'application/json',
    'X-Master-Key': JSONBIN_API_KEY
};

// ========== SAMPLE BUGS (Default data) ==========
const SAMPLE_BUGS = [
    { id: 'BUG-101', title: 'Login page crashes on Safari', priority: 'critical', status: 'open', description: 'Safari browser crashes when submitting login form', assignee: 'Sarah', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'BUG-102', title: 'API timeout on large file uploads', priority: 'high', status: 'in-progress', description: 'Files over 10MB cause timeout', assignee: 'Mike', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 'BUG-103', title: 'Dark mode toggle not persisting', priority: 'medium', status: 'open', description: 'Theme resets after page refresh', assignee: 'Emma', createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 'BUG-104', title: 'Typo in error message', priority: 'low', status: 'resolved', description: 'Fix spelling mistake', assignee: 'Alex', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 'BUG-105', title: 'Payment gateway timeout', priority: 'critical', status: 'open', description: 'Payment processing fails after 30 seconds', assignee: 'Sarah', createdAt: new Date(Date.now() - 4 * 86400000).toISOString() }
];

// In-memory cache for immediate access
let cachedBugs = [];
let isInitialized = false;
let pendingCallbacks = [];

// ========== INITIALIZE ==========
async function initData() {
    console.log('Initializing data from JSONBin...');
    
    try {
        const response = await fetch(GET_URL, { headers });
        
        if (response.ok) {
            const data = await response.json();
            if (data.record && data.record.bugs && data.record.bugs.length > 0) {
                cachedBugs = data.record.bugs;
                console.log('✅ Data loaded from cloud:', cachedBugs.length, 'bugs');
            } else {
                // No data in cloud, upload samples
                cachedBugs = [...SAMPLE_BUGS];
                await saveBugsToCloud(cachedBugs);
                console.log('✅ Sample data uploaded to cloud:', cachedBugs.length, 'bugs');
            }
        } else {
            // API error, use sample data
            cachedBugs = [...SAMPLE_BUGS];
            console.log('⚠️ Cloud error, using sample data:', cachedBugs.length, 'bugs');
        }
    } catch (error) {
        console.error('❌ Error loading from cloud, using samples:', error);
        cachedBugs = [...SAMPLE_BUGS];
    }
    
    isInitialized = true;
    
    // Execute pending callbacks
    pendingCallbacks.forEach(cb => cb());
    pendingCallbacks = [];
    
    // Refresh UI after data is loaded
    refreshUI();
}

async function saveBugsToCloud(bugs) {
    try {
        await fetch(PUT_URL, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({ bugs: bugs })
        });
        console.log('📡 Data saved to cloud');
    } catch (error) {
        console.error('❌ Error saving to cloud:', error);
    }
}

// ========== SYNC FUNCTIONS ==========

// Get all bugs - waits for initialization
function getBugs() {
    if (!isInitialized) {
        // Return sample data immediately while loading
        return [...SAMPLE_BUGS];
    }
    return cachedBugs;
}

// Save all bugs
async function saveBugs(bugs) {
    cachedBugs = bugs;
    await saveBugsToCloud(bugs);
    return true;
}

// Add new bug
async function addBug(bugData) {
    console.log('addBug called with:', bugData);
    
    const bugs = getBugs();
    console.log('Current bugs count:', bugs.length);
    
    // Generate new ID
    const lastId = bugs.length > 0 ? parseInt(bugs[0].id.split('-')[1]) : 100;
    const newId = `BUG-${lastId + 1}`;
    
    const newBug = {
        id: newId,
        title: bugData.title,
        priority: bugData.priority,
        status: bugData.status || 'open',
        description: bugData.description || '',
        assignee: bugData.assignee || 'Unassigned',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    console.log('New bug object:', newBug);
    
    bugs.unshift(newBug);
    await saveBugs(bugs);
    
    console.log('Bug saved, new total:', bugs.length);
    
    // Refresh UI
    refreshUI();
    
    return newBug;
}
// Update existing bug
async function updateBug(id, updates) {
    const bugs = getBugs();
    const index = bugs.findIndex(b => b.id === id);
    
    if (index !== -1) {
        bugs[index] = { 
            ...bugs[index], 
            ...updates, 
            updatedAt: new Date().toISOString() 
        };
        await saveBugs(bugs);
        refreshUI();
        return true;
    }
    return false;
}

// Delete bug
async function deleteBug(id) {
    let bugs = getBugs();
    bugs = bugs.filter(b => b.id !== id);
    await saveBugs(bugs);
    refreshUI();
    return true;
}

// Get statistics
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

// Refresh all UI components
function refreshUI() {
    setTimeout(() => {
        console.log('🔄 Refreshing UI...');
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
        if (typeof renderBoard === 'function') {
            renderBoard();
        }
        if (typeof renderIssuesTable === 'function') {
            renderIssuesTable();
        }
    }, 100);
}

// ========== INITIALIZE ON LOAD ==========
// Start loading immediately
initData();

// Auto-save to cloud periodically (every 15 seconds)
setInterval(async () => {
    if (isInitialized && cachedBugs.length > 0) {
        await saveBugsToCloud(cachedBugs);
    }
}, 15000);