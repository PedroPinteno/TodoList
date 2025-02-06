class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.initializeElements();
        this.setupEventListeners();
        this.render();
    }

    initializeElements() {
        // Form elements
        this.taskForm = document.getElementById('taskForm');
        this.taskInput = document.getElementById('taskInput');
        this.taskPriority = document.getElementById('taskPriority');
        this.taskDate = document.getElementById('taskDate');

        // List and stats elements
        this.tasksList = document.getElementById('tasksList');
        this.tasksCount = document.getElementById('tasksCount');
        this.clearCompletedBtn = document.getElementById('clearCompleted');

        // Statistics elements
        this.totalTasksElement = document.getElementById('totalTasks');
        this.completedTasksElement = document.getElementById('completedTasks');
        this.pendingTasksElement = document.getElementById('pendingTasks');
        
        // Priority bars
        this.highPriorityBar = document.getElementById('highPriorityBar');
        this.mediumPriorityBar = document.getElementById('mediumPriorityBar');
        this.lowPriorityBar = document.getElementById('lowPriorityBar');
        this.highPriorityCount = document.getElementById('highPriorityCount');
        this.mediumPriorityCount = document.getElementById('mediumPriorityCount');
        this.lowPriorityCount = document.getElementById('lowPriorityCount');

        // Theme toggle
        this.themeToggle = document.querySelector('.theme-toggle');
    }

    setupEventListeners() {
        // Form submission
        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Clear completed tasks
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelector('.filter-btn.active').classList.remove('active');
                button.classList.add('active');
                this.currentFilter = button.dataset.filter;
                this.render();
            });
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        this.taskDate.setAttribute('min', today);
    }

    addTask() {
        const text = this.taskInput.value.trim();
        const priority = this.taskPriority.value;
        const date = this.taskDate.value;

        if (text) {
            const task = {
                id: Date.now(),
                text,
                priority,
                date,
                completed: false,
                createdAt: new Date().toISOString()
            };

            this.tasks.unshift(task);
            this.saveTasks();
            this.taskForm.reset();
            this.render();
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.render();
    }

    clearCompleted() {
        this.tasks = this.tasks.filter(task => !task.completed);
        this.saveTasks();
        this.render();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    toggleTheme() {
        document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', document.body.dataset.theme);
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    updateStatistics() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        // Update counts
        this.totalTasksElement.textContent = total;
        this.completedTasksElement.textContent = completed;
        this.pendingTasksElement.textContent = pending;
        this.tasksCount.textContent = `${pending} ${pending === 1 ? 'tarea pendiente' : 'tareas pendientes'}`;

        // Update priority stats
        const priorities = {
            alta: 0,
            media: 0,
            baja: 0
        };

        this.tasks.forEach(task => {
            priorities[task.priority]++;
        });

        const maxPriority = Math.max(...Object.values(priorities));

        // Update bars and counts
        this.highPriorityBar.style.width = maxPriority ? (priorities.alta / maxPriority * 100) + '%' : '0%';
        this.mediumPriorityBar.style.width = maxPriority ? (priorities.media / maxPriority * 100) + '%' : '0%';
        this.lowPriorityBar.style.width = maxPriority ? (priorities.baja / maxPriority * 100) + '%' : '0%';

        this.highPriorityCount.textContent = priorities.alta;
        this.mediumPriorityCount.textContent = priorities.media;
        this.lowPriorityCount.textContent = priorities.baja;
    }

    render() {
        const filteredTasks = this.getFilteredTasks();
        
        this.tasksList.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'completed' : ''}"
                     onclick="app.toggleTask(${task.id})"></div>
                <div class="task-content">
                    <span class="task-text">${task.text}</span>
                    <div class="task-details">
                        <span class="task-priority priority-${task.priority}">${task.priority}</span>
                        ${task.date ? `<span><i class="far fa-calendar"></i> ${task.date}</span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button onclick="app.deleteTask(${task.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        this.updateStatistics();
    }
}

// Initialize app
const app = new TodoApp();

// Load saved theme
document.body.dataset.theme = localStorage.getItem('theme') || 'light';
