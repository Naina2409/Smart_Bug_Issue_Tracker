/* js/intro.js - Typewriter then Login */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Intro.js loaded');
    
    const introScreen = document.getElementById('introScreen');
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    const typewriterElement = document.getElementById('typewriterText');
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const introShown = localStorage.getItem('smartbug_intro_shown');
    
    console.log('isLoggedIn:', isLoggedIn);
    console.log('introShown:', introShown);
    
    // CASE 1: Already logged in - show dashboard directly
    if (isLoggedIn === 'true') {
        if (introScreen) introScreen.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'none';
        if (mainApp) mainApp.style.display = 'flex';
        if (typeof updateDashboard === 'function') updateDashboard();
        if (typeof renderBoard === 'function') renderBoard();
        return;
    }
    
    // CASE 2: Intro already shown but not logged in - show login
    if (introShown === 'true') {
        if (introScreen) introScreen.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
        return;
    }
    
    // CASE 3: First time - show typewriter, then login
    console.log('First time - showing typewriter');
    if (mainApp) mainApp.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'none';
    if (introScreen) introScreen.style.display = 'flex';
    
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
            console.log('Typing complete - showing LOGIN');
            setTimeout(function() {
                if (introScreen) {
                    introScreen.style.opacity = '0';
                    introScreen.style.transition = 'opacity 0.8s';
                    setTimeout(function() {
                        introScreen.style.display = 'none';
                        loginScreen.style.display = 'flex';  // Show LOGIN, not dashboard
                        localStorage.setItem('smartbug_intro_shown', 'true');
                    }, 800);
                }
            }, 800);
        }
    }
    
    setTimeout(typeWriter, 500);
});

// Login form handler
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
                
                const userNameSpan = document.getElementById('userName');
                if (userNameSpan) userNameSpan.innerText = email.split('@')[0];
                
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('mainApp').style.display = 'flex';
                
                if (typeof updateDashboard === 'function') updateDashboard();
                if (typeof renderBoard === 'function') renderBoard();
            } else {
                alert('Please enter email and password');
            }
        });
    }
});

// Navigation functions
function showDashboard() {
    const dashboardView = document.getElementById('dashboardView');
    const reportView = document.getElementById('reportView');
    const boardView = document.getElementById('boardView');
    const listView = document.getElementById('listView');
    
    if (dashboardView) dashboardView.style.display = 'block';
    if (reportView) reportView.style.display = 'none';
    if (boardView) boardView.style.display = 'none';
    if (listView) listView.style.display = 'none';
    
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
    localStorage.clear();
    location.reload();
}