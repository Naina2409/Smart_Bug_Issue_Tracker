/* js/app.js - Main App Logic with Login */

// Navigation functions
function showDashboard() {
    document.getElementById('dashboardView').style.display = 'block';
    document.getElementById('reportView').style.display = 'none';
    document.getElementById('boardView').style.display = 'none';
    document.getElementById('listView').style.display = 'none';
    updateDashboard();
    renderBoard();
    renderIssuesTable();
    
    // Update active nav
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
    renderBoard();
    
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
    renderIssuesTable();
    
    document.querySelectorAll('.nav-item').forEach((item, i) => {
        item.classList.remove('active');
        if (i === 3) item.classList.add('active');
    });
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    location.reload();
}

// Login handling
document.addEventListener('DOMContentLoaded', function() {
    const introScreen = document.getElementById('introScreen');
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    const typewriterElement = document.getElementById('typewriterText');
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const introShown = localStorage.getItem('introShown');
    
    // Check if already logged in
    if (isLoggedIn === 'true') {
        // Skip intro and login, go directly to dashboard
        if (introScreen) introScreen.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'none';
        if (mainApp) mainApp.style.display = 'flex';
        updateDashboard();
        renderBoard();
        return;
    }
    
    // First time - show typewriter intro
    if (introShown !== 'true') {
        if (mainApp) mainApp.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'none';
        
        const textToType = "MINI JIRA";
        let index = 0;
        typewriterElement.textContent = '';
        
        function typeWriter() {
            if (index < textToType.length) {
                typewriterElement.textContent += textToType.charAt(index);
                index++;
                setTimeout(typeWriter, 150);
            } else {
                setTimeout(function() {
                    introScreen.style.opacity = '0';
                    introScreen.style.transition = 'opacity 0.8s';
                    setTimeout(function() {
                        introScreen.style.display = 'none';
                        loginScreen.style.display = 'flex';
                        localStorage.setItem('introShown', 'true');
                    }, 800);
                }, 800);
            }
        }
        setTimeout(typeWriter, 500);
    } else {
        // Intro already shown, go to login
        introScreen.style.display = 'none';
        loginScreen.style.display = 'flex';
    }
    
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Simple validation - accept any non-empty input for demo
            if (email && password) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUser', email);
                document.getElementById('userName').innerText = email.split('@')[0];
                
                loginScreen.style.display = 'none';
                mainApp.style.display = 'flex';
                updateDashboard();
                renderBoard();
            } else {
                alert('Please enter email and password');
            }
        });
    }
});