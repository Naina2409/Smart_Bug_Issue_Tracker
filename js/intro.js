/* js/intro.js - Clean Version (No Duplicates) */

// ========== USERNAME DISPLAY FUNCTION ==========
function updateUsernameDisplay() {
    const userNameSpan = document.getElementById('userName');
    if (!userNameSpan) return;
    
    let username = localStorage.getItem('currentUserName');
    
    if (!username) {
        const email = localStorage.getItem('currentUser');
        if (email) {
            username = email.split('@')[0];
            username = username.charAt(0).toUpperCase() + username.slice(1);
        } else {
            username = "Guest";
        }
    }
    
    userNameSpan.innerHTML = `${username} <span class="demo-bracket">(Demo)</span>`;
}

// ========== TYPEWRITER FUNCTION ==========
function startTypewriter() {
    console.log('Starting typewriter...');
    
    const introScreen = document.getElementById('introScreen');
    const loginScreen = document.getElementById('loginScreen');
    const typewriterElement = document.getElementById('typewriterText');
    
    if (!typewriterElement) {
        console.error('Typewriter element not found!');
        return;
    }
    
    const textToType = "MINI JIRA";
    let index = 0;
    typewriterElement.textContent = '';
    
    function typeWriter() {
        if (index < textToType.length) {
            typewriterElement.textContent += textToType.charAt(index);
            index++;
            setTimeout(typeWriter, 150);
        } else {
            console.log('Typing complete!');
            const cursor = document.querySelector('.cursor');
            if (cursor) cursor.style.opacity = '0';
            
            setTimeout(function() {
                if (introScreen) {
                    introScreen.style.opacity = '0';
                    introScreen.style.transition = 'opacity 1s';
                    setTimeout(function() {
                        introScreen.style.display = 'none';
                        if (loginScreen) loginScreen.style.display = 'flex';
                        localStorage.setItem('introShown', 'true');
                    }, 1000);
                }
            }, 800);
        }
    }
    
    typeWriter();
}

// ========== MESSAGE SYSTEM ==========
function addMessage(message, type = 'info') {
    const messages = JSON.parse(localStorage.getItem('activity_messages') || '[]');
    messages.unshift({
        id: Date.now(),
        text: message,
        type: type,
        timestamp: new Date().toLocaleTimeString()
    });
    localStorage.setItem('activity_messages', JSON.stringify(messages.slice(0, 50)));
    displayMessages();
}

function displayMessages() {
    const messageList = document.getElementById('messageList');
    if (!messageList) return;
    
    const messages = JSON.parse(localStorage.getItem('activity_messages') || '[]');
    
    if (messages.length === 0) {
        messageList.innerHTML = '<div class="message-item">💬 No recent activity. Report a bug to start!</div>';
        return;
    }
    
    messageList.innerHTML = messages.map(msg => `
        <div class="message-item" style="border-left-color: ${msg.type === 'success' ? '#10b981' : (msg.type === 'critical' ? '#ef4444' : '#0ea5e9')}">
            <strong>${msg.timestamp}</strong> - ${msg.text}
        </div>
    `).join('');
}

function clearMessages() {
    localStorage.setItem('activity_messages', '[]');
    displayMessages();
}

// ========== TIME-BASED AUTO RESOLUTION ==========
let bugReportTimes = {};

const RESOLVE_TIMES = {
    'critical': 30,
    'high': 45,
    'medium': 60,
    'low': 90
};

let resolvedNotified = {};

function checkAndNotifyResolution() {
    const bugs = getBugs();
    const now = new Date();
    
    bugs.forEach(bug => {
        if (bug.status === 'resolved') return;
        if (resolvedNotified[bug.id]) return;
        
        let reportTime = bugReportTimes[bug.id];
        if (!reportTime && bug.createdAt) {
            reportTime = new Date(bug.createdAt);
            bugReportTimes[bug.id] = reportTime;
        }
        
        if (!reportTime) return;
        
        const elapsedSeconds = Math.floor((now - reportTime) / 1000);
        const resolveTime = RESOLVE_TIMES[bug.priority] || 60;
        
        if (elapsedSeconds >= resolveTime) {
            resolvedNotified[bug.id] = true;
            showResolutionPopup(bug, elapsedSeconds);
            addMessage(`✅ RESOLVED: Bug ${bug.id} "${bug.title}" has been resolved! (Took ${elapsedSeconds} seconds)`, 'success');
        }
    });
}

function showResolutionPopup(bug, elapsedSeconds) {
    const priorityEmoji = {
        'critical': '🔴',
        'high': '🟠',
        'medium': '🟡',
        'low': '🟢'
    };
    
    const popup = document.createElement('div');
    popup.className = 'resolution-popup';
    popup.innerHTML = `
        <div class="resolution-popup-content">
            <div class="popup-icon">✅</div>
            <div class="popup-text">
                <div class="popup-title">${priorityEmoji[bug.priority]} BUG RESOLVED!</div>
                <div class="popup-bug-id">${bug.id}</div>
                <div class="popup-bug-title">${bug.title.substring(0, 60)}</div>
                <div class="popup-details">Auto-resolved after ${elapsedSeconds} seconds | Priority: ${bug.priority.toUpperCase()}</div>
            </div>
            <button class="popup-close" onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        if (popup && popup.parentElement) {
            popup.style.opacity = '0';
            popup.style.transform = 'translateX(100px)';
            setTimeout(() => {
                if (popup && popup.parentElement) popup.remove();
            }, 500);
        }
    }, 8000);
    
    setTimeout(() => {
        if (typeof renderBoard === 'function') renderBoard();
        if (typeof updateDashboard === 'function') updateDashboard();
        if (typeof renderIssuesTable === 'function') renderIssuesTable();
    }, 500);
}

function showNewBugPopup(bug) {
    const priorityColors = {
        'critical': '#ef4444',
        'high': '#f97316',
        'medium': '#eab308',
        'low': '#10b981'
    };
    
    const priorityText = {
        'critical': '🔴 CRITICAL',
        'high': '🟠 HIGH',
        'medium': '🟡 MEDIUM',
        'low': '🟢 LOW'
    };
    
    const resolveSeconds = RESOLVE_TIMES[bug.priority] || 60;
    const resolveMinutes = Math.floor(resolveSeconds / 60);
    const resolveText = resolveSeconds < 60 ? `${resolveSeconds} seconds` : `${resolveMinutes} minute${resolveMinutes > 1 ? 's' : ''}`;
    
    const popup = document.createElement('div');
    popup.className = 'newbug-popup';
    popup.innerHTML = `
        <div class="newbug-popup-content" style="border-left-color: ${priorityColors[bug.priority]}">
            <div class="popup-icon">🐛</div>
            <div class="popup-text">
                <div class="popup-title">NEW BUG REPORTED!</div>
                <div class="popup-bug-id">${bug.id}</div>
                <div class="popup-bug-title">${bug.title.substring(0, 60)}</div>
                <div class="popup-details">Priority: ${priorityText[bug.priority]} | Will resolve in ${resolveText}</div>
            </div>
            <button class="popup-close" onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        if (popup && popup.parentElement) {
            popup.style.opacity = '0';
            popup.style.transform = 'translateX(100px)';
            setTimeout(() => {
                if (popup && popup.parentElement) popup.remove();
            }, 500);
        }
    }, 6000);
    
    addMessage(`🐛 NEW: ${bug.id} "${bug.title}" (${bug.priority.toUpperCase()}) - Will resolve in ${resolveText}`, 
               bug.priority === 'critical' ? 'critical' : 'info');
}

function showCriticalAlert(bug) {
    const popup = document.createElement('div');
    popup.className = 'critical-popup';
    popup.innerHTML = `
        <div class="critical-popup-content">
            <div class="popup-icon">🚨</div>
            <div class="popup-text">
                <div class="popup-title">CRITICAL BUG ALERT!</div>
                <div class="popup-bug-id">${bug.id}</div>
                <div class="popup-bug-title">${bug.title.substring(0, 60)}</div>
                <div class="popup-details">Requires immediate attention! Resolving in ${RESOLVE_TIMES.critical} seconds</div>
            </div>
            <button class="popup-close" onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        if (popup && popup.parentElement) {
            popup.style.opacity = '0';
            popup.style.transform = 'translateX(100px)';
            setTimeout(() => {
                if (popup && popup.parentElement) popup.remove();
            }, 500);
        }
    }, 7000);
}

// ========== MONITOR FOR NEW BUGS ==========
let lastBugList = [];

function checkForNewBugs() {
    const currentBugs = getBugs();
    
    currentBugs.forEach(bug => {
        const exists = lastBugList.some(prev => prev.id === bug.id);
        if (!exists) {
            console.log('New bug detected:', bug.id);
            bugReportTimes[bug.id] = new Date(bug.createdAt || new Date());
            showNewBugPopup(bug);
            
            if (bug.priority === 'critical') {
                showCriticalAlert(bug);
                addMessage(`🚨 CRITICAL: Bug ${bug.id} requires immediate attention!`, 'critical');
            }
        }
    });
    
    lastBugList = JSON.parse(JSON.stringify(currentBugs));
}

// ========== START AUTO-RESOLUTION CHECKER ==========
let resolutionInterval = null;
let newBugInterval = null;

function startAutoResolution() {
    if (resolutionInterval) clearInterval(resolutionInterval);
    if (newBugInterval) clearInterval(newBugInterval);
    
    const currentBugs = getBugs();
    currentBugs.forEach(bug => {
        if (bug.status !== 'resolved') {
            bugReportTimes[bug.id] = new Date(bug.createdAt || new Date());
        }
    });
    lastBugList = JSON.parse(JSON.stringify(currentBugs));
    
    resolutionInterval = setInterval(() => {
        checkAndNotifyResolution();
    }, 5000);
    
    newBugInterval = setInterval(() => {
        checkForNewBugs();
    }, 3000);
}

function stopAutoResolution() {
    if (resolutionInterval) clearInterval(resolutionInterval);
    if (newBugInterval) clearInterval(newBugInterval);
}

// ========== INITIALIZE MESSAGE BOARD ==========
function initMessageBoard() {
    const dashboardView = document.getElementById('dashboardView');
    if (dashboardView && !document.getElementById('messageList')) {
        const messageBoardHTML = `
            <div class="notification-panel">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3>📬 Auto-Resolution Notifications</h3>
                    <button onclick="clearMessages()" style="background: none; border: none; color: #0ea5e9; cursor: pointer;">Clear</button>
                </div>
                <div id="messageList" class="message-list"></div>
                <div style="margin-top: 10px; font-size: 0.7rem; color: #64748b; display: flex; flex-wrap: wrap; gap: 10px;">
                    <span>🔴 Critical: 30s</span>
                    <span>🟠 High: 45s</span>
                    <span>🟡 Medium: 60s</span>
                    <span>🟢 Low: 90s</span>
                </div>
            </div>
        `;
        dashboardView.insertAdjacentHTML('afterbegin', messageBoardHTML);
    }
    displayMessages();
    startAutoResolution();
}

// ========== INTERCEPT ADD BUG ==========
const originalAddBug = window.addBug;

if (typeof addBug === 'function') {
    window.addBug = function(bugData) {
        const result = originalAddBug(bugData);
        if (result) {
            bugReportTimes[result.id] = new Date();
            showNewBugPopup(result);
            if (result.priority === 'critical') {
                showCriticalAlert(result);
                addMessage(`🚨 CRITICAL: Bug ${result.id} "${result.title}" requires immediate attention!`, 'critical');
            }
        }
        return result;
    };
}

// ========== DEMO SCENARIO ==========
function runDemoScenario() {
    addMessage("🎬 STARTING DEMO: Testing auto-resolution timeline", "success");
    
    setTimeout(() => {
        const demoBug = {
            title: "Payment Gateway Crash - Users cannot checkout",
            priority: "critical",
            status: "open",
            description: "Payment page crashes when users enter card details",
            assignee: "Auto-Tester",
            reporter: "Demo"
        };
        const savedBug = originalAddBug(demoBug);
        addMessage(`🔴 DEMO: Critical bug ${savedBug.id} created - Will auto-resolve in 30 seconds`, "critical");
    }, 1000);
    
    setTimeout(() => {
        const demoBug2 = {
            title: "Typo in footer text",
            priority: "low",
            status: "open",
            description: "Footer has a spelling mistake",
            assignee: "Auto-Tester",
            reporter: "Demo"
        };
        const savedBug2 = originalAddBug(demoBug2);
        addMessage(`🟢 DEMO: Low priority bug ${savedBug2.id} created - Will auto-resolve in 90 seconds`, "info");
    }, 3000);
    
    setTimeout(() => {
        addMessage(`🎯 DEMO: Watch the notifications - bugs will auto-resolve after their time thresholds!`, "success");
    }, 5000);
}

function addDemoButton() {
    const headerRight = document.querySelector('#dashboardView .header-right');
    if (headerRight && !document.getElementById('demoBtn')) {
        const demoBtn = document.createElement('button');
        demoBtn.id = 'demoBtn';
        demoBtn.className = 'btn btn-secondary';
        demoBtn.innerHTML = '🎬 Run Demo';
        demoBtn.onclick = runDemoScenario;
        headerRight.appendChild(demoBtn);
    }
}

// ========== CLEANUP ==========
function cleanup() {
    stopAutoResolution();
}

// ========== NAVIGATION FUNCTIONS ==========
function showDashboard() {
    document.getElementById('dashboardView').style.display = 'block';
    document.getElementById('reportView').style.display = 'none';
    document.getElementById('boardView').style.display = 'none';
    document.getElementById('listView').style.display = 'none';
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof renderBoard === 'function') renderBoard();
    
    document.querySelectorAll('.nav-item').forEach((item, i) => {
        item.classList.remove('active');
        if (i === 0) item.classList.add('active');
    });
}

function showReport() {
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('reportView').style.display = 'block';
    document.getElementById('boardView').style.display = 'none';
    document.getElementById('listView').style.display = 'none';
    
    document.querySelectorAll('.nav-item').forEach((item, i) => {
        item.classList.remove('active');
        if (i === 1) item.classList.add('active');
    });
}

function showBoard() {
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('reportView').style.display = 'none';
    document.getElementById('boardView').style.display = 'block';
    document.getElementById('listView').style.display = 'none';
    if (typeof renderBoard === 'function') renderBoard();
    
    document.querySelectorAll('.nav-item').forEach((item, i) => {
        item.classList.remove('active');
        if (i === 2) item.classList.add('active');
    });
}

function showList() {
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('reportView').style.display = 'none';
    document.getElementById('boardView').style.display = 'none';
    document.getElementById('listView').style.display = 'block';
    if (typeof renderIssuesTable === 'function') renderIssuesTable();
    
    document.querySelectorAll('.nav-item').forEach((item, i) => {
        item.classList.remove('active');
        if (i === 3) item.classList.add('active');
    });
}

function logout() {
    cleanup();
    localStorage.clear();
    location.reload();
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing MINI JIRA...');
    
    // Update username display immediately
    updateUsernameDisplay();
    
    const introScreen = document.getElementById('introScreen');
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const introShown = localStorage.getItem('introShown');
    
    // Already logged in - show dashboard
    if (isLoggedIn === 'true') {
        if (introScreen) introScreen.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'none';
        if (mainApp) mainApp.style.display = 'flex';
        if (typeof updateDashboard === 'function') updateDashboard();
        if (typeof renderBoard === 'function') renderBoard();
        setTimeout(() => {
            initMessageBoard();
            addDemoButton();
        }, 500);
        return;
    }
    
    // Intro shown but not logged in - show login
    if (introShown === 'true') {
        if (introScreen) introScreen.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
        return;
    }
    
    // First time - show typewriter
    if (mainApp) mainApp.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'none';
    if (introScreen) introScreen.style.display = 'flex';
    
    setTimeout(startTypewriter, 300);
});

// Login handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (email && password) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUser', email);
                
                let username = email.split('@')[0];
                username = username.charAt(0).toUpperCase() + username.slice(1);
                localStorage.setItem('currentUserName', username);
                
                // Update username display
                updateUsernameDisplay();
                
                const loginScreen = document.getElementById('loginScreen');
                const mainApp = document.getElementById('mainApp');
                
                if (loginScreen) loginScreen.style.display = 'none';
                if (mainApp) mainApp.style.display = 'flex';
                
                if (typeof updateDashboard === 'function') updateDashboard();
                if (typeof renderBoard === 'function') renderBoard();
                
                setTimeout(() => {
                    initMessageBoard();
                    addDemoButton();
                }, 500);
            } else {
                alert('Please enter email and password');
            }
        });
    }
});