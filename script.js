// Physiotherapy Routine App - Main JavaScript File

class PhysioApp {
    constructor() {
        this.db = null;
        this.currentRoutine = null;
        this.currentExerciseIndex = 0;
        this.isPlaying = false;
        this.timer = null;
        this.currentTime = 0;
        this.selectedExercises = [];
        
        this.init();
    }

    async init() {
        try {
            await this.initIndexedDB();
            await this.loadExerciseDatabase();
            this.setupEventListeners();
            this.loadRoutines();
            this.loadProgress();
            this.showLoading(false);
        } catch (error) {
            console.error('App initialization failed:', error);
            this.showToast('Failed to initialize app', 'error');
        }
    }

    // IndexedDB Setup
   // Enhanced IndexedDB Setup with better error handling
async initIndexedDB() {
    return new Promise((resolve, reject) => {
        // Check if IndexedDB is available
        if (!window.indexedDB) {
            reject(new Error('IndexedDB not supported in this browser'));
            return;
        }

        // Clear any existing connections
        if (this.db) {
            this.db.close();
            this.db = null;
        }

        const request = indexedDB.open('PhysioRoutineDB', 1);
        
        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            reject(new Error(`IndexedDB failed to open: ${event.target.error?.message || 'Unknown error'}`));
        };
        
        request.onsuccess = (event) => {
            this.db = event.target.result;
            console.log('IndexedDB opened successfully');
            
            // Add error handler for the database connection
            this.db.onerror = (event) => {
                console.error('Database error:', event.target.error);
            };
            
            resolve();
        };
        
        request.onupgradeneeded = (event) => {
            console.log('IndexedDB upgrade needed');
            const db = event.target.result;
            
            try {
                // Routines store
                if (!db.objectStoreNames.contains('routines')) {
                    const routineStore = db.createObjectStore('routines', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    routineStore.createIndex('name', 'name', { unique: false });
                    routineStore.createIndex('created', 'created', { unique: false });
                    console.log('Created routines store');
                }
                
                // Progress store
                if (!db.objectStoreNames.contains('progress')) {
                    const progressStore = db.createObjectStore('progress', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    progressStore.createIndex('date', 'date', { unique: false });
                    progressStore.createIndex('routineId', 'routineId', { unique: false });
                    console.log('Created progress store');
                }
                
                // Exercises store
                if (!db.objectStoreNames.contains('exercises')) {
                    db.createObjectStore('exercises', { keyPath: 'id' });
                    console.log('Created exercises store');
                }
            } catch (error) {
                console.error('Error creating object stores:', error);
                reject(error);
            }
        };

        request.onblocked = (event) => {
            console.warn('IndexedDB blocked - another tab may have the database open');
            // Show user message about closing other tabs
            this.showToast('Please close other tabs with this app and try again', 'warning');
        };
    });
}

// Enhanced initialization with better error handling
async init() {
    this.showLoading(true);
    
    try {
        console.log('Initializing PhysioApp...');
        
        // Step 1: Initialize IndexedDB
        console.log('Step 1: Initializing IndexedDB...');
        await this.initIndexedDB();
        console.log('IndexedDB initialized successfully');
        
        // Step 2: Load exercise database
        console.log('Step 2: Loading exercise database...');
        await this.loadExerciseDatabase();
        console.log('Exercise database loaded successfully');
        
        // Step 3: Setup event listeners
        console.log('Step 3: Setting up event listeners...');
        this.setupEventListeners();
        console.log('Event listeners setup successfully');
        
        // Step 4: Load routines
        console.log('Step 4: Loading routines...');
        await this.loadRoutines();
        console.log('Routines loaded successfully');
        
        // Step 5: Load progress
        console.log('Step 5: Loading progress...');
        await this.loadProgress();
        console.log('Progress loaded successfully');
        
        console.log('PhysioApp initialized successfully!');
        this.showToast('App loaded successfully!', 'success');
        
    } catch (error) {
        console.error('App initialization failed:', error);
        
        // Provide specific error messages
        let errorMessage = 'Failed to initialize app';
        if (error.message.includes('IndexedDB')) {
            errorMessage = 'Database initialization failed. Try refreshing the page.';
        } else if (error.message.includes('exercises')) {
            errorMessage = 'Failed to load exercise database. Check your connection.';
        }
        
        this.showToast(errorMessage, 'error');
        
        // Try to recover by using a fallback initialization
        try {
            await this.fallbackInit();
        } catch (fallbackError) {
            console.error('Fallback initialization also failed:', fallbackError);
            this.showToast('Critical error: App cannot start. Please clear browser data and try again.', 'error');
        }
    } finally {
        this.showLoading(false);
    }
}

// Fallback initialization method
async fallbackInit() {
    console.log('Attempting fallback initialization...');
    
    // Try to clear and reinitialize IndexedDB
    try {
        // Delete the database and start fresh
        await this.deleteDatabase();
        await this.initIndexedDB();
        await this.loadExerciseDatabase();
        
        this.setupEventListeners();
        this.showToast('App recovered successfully!', 'success');
        
    } catch (error) {
        console.error('Fallback initialization failed:', error);
        throw error;
    }
}

// Method to delete and recreate database
async deleteDatabase() {
    return new Promise((resolve, reject) => {
        const deleteRequest = indexedDB.deleteDatabase('PhysioRoutineDB');
        
        deleteRequest.onsuccess = () => {
            console.log('Database deleted successfully');
            resolve();
        };
        
        deleteRequest.onerror = (event) => {
            console.error('Failed to delete database:', event.target.error);
            reject(event.target.error);
        };
        
        deleteRequest.onblocked = () => {
            console.warn('Database deletion blocked');
            // Continue anyway
            resolve();
        };
    });
}

// Enhanced error handling for database operations
async getAllFromStore(store) {
    return new Promise((resolve, reject) => {
        try {
            const request = store.getAll();
            
            request.onsuccess = () => {
                resolve(request.result || []);
            };
            
            request.onerror = () => {
                console.error('Store operation failed:', request.error);
                reject(request.error);
            };
            
        } catch (error) {
            console.error('Store access failed:', error);
            reject(error);
        }
    });
}

    // Exercise Database
    async loadExerciseDatabase() {
        const exercises = [
            {
                id: 'hamstring-stretch',
                name: 'Hamstring Stretch',
                description: 'A gentle stretch for the back of your thigh to improve flexibility and reduce tension.',
                image: '/exercises/images/hamstring-stretch.jpg',
                category: 'Stretching',
                defaultReps: 1,
                defaultSets: 2,
                defaultRestTime: 45,
                instructions: 'Step 1: Lie on your back, raise your left leg, and clasp your hands around the back of your left thigh, pulling your knee close to your chest. Step 2: While keeping your knee near your chest, slowly straighten your left knee until you feel a stretch along the back of your thigh. Hold for 30-45 seconds, then repeat on the opposite side.',
                benefits: ['Improves hamstring flexibility', 'Reduces muscle tension', 'Prevents injury'],
                difficulty: 'Beginner'
            },
            {
                id: 'piriformis-stretch',
                name: 'Piriformis Stretch',
                description: 'A deep stretch targeting the piriformis muscle in the buttock area.',
                image: '/exercises/images/piriformis-stretch.jpg',
                category: 'Stretching',
                defaultReps: 1,
                defaultSets: 2,
                defaultRestTime: 45,
                instructions: 'Step 1: Lie on your back with knees bent and feet flat on the floor. Cross your right ankle over your left knee. Step 2: Clasp your hands around your left thigh and pull it toward your chest. You should feel the stretch in your right buttock, hip, and the back of your thigh. Hold for 30-45 seconds, then repeat on the opposite side.',
                benefits: ['Relieves sciatic pain', 'Improves hip mobility', 'Reduces lower back tension'],
                difficulty: 'Beginner'
            },
            {
                id: 'standing-hip-flexor',
                name: 'Standing Hip Flexor',
                description: 'A dynamic stretch for the front of the hip to improve flexibility and reduce tightness.',
                image: '/exercises/images/standing-hip-flexor.jpg',
                category: 'Stretching',
                defaultReps: 1,
                defaultSets: 2,
                defaultRestTime: 45,
                instructions: 'Step 1: Stand facing a bench or a sturdy chair, with feet pointing forward. Place your left foot on the bench, ensuring your knee angle is greater than 90 degrees. Step 2: Shift your weight forward toward the foot on the bench, feeling a stretch in the front of your right hip. Hold for 30-45 seconds, then repeat on the opposite side.',
                benefits: ['Improves hip flexibility', 'Reduces lower back pain', 'Enhances posture'],
                difficulty: 'Beginner'
            },
            {
                id: 'straight-leg-raise',
                name: 'Straight Leg Raise',
                description: 'A strengthening exercise for the quadriceps and hip flexors.',
                image: '/exercises/images/straight-leg-raise.jpg',
                category: 'Strengthening',
                defaultReps: 15,
                defaultSets: 3,
                defaultRestTime: 30,
                instructions: 'Step 1: Lie on your back, bend your right knee, and keep your left foot flat on the floor. Step 2: Point the toes of your left foot toward the ceiling, slowly lift your left leg (keeping your knee straight) to about 45 degrees, then slowly lower it back down. Perform 10-20 repetitions, then repeat on the opposite side.',
                benefits: ['Strengthens quadriceps', 'Improves hip stability', 'Enhances leg control'],
                difficulty: 'Beginner'
            },
            {
                id: 'bridge',
                name: 'Bridge',
                description: 'A core and glute strengthening exercise that improves hip stability.',
                image: '/exercises/images/bridge.jpg',
                category: 'Strengthening',
                defaultReps: 15,
                defaultSets: 3,
                defaultRestTime: 30,
                instructions: 'Step 1: Lie on your back with knees bent and feet close to your buttocks, a little wider than hip distance apart. Step 2: Squeeze your glute muscles to lift your pelvis off the floor, keeping your knees aligned over your ankles. Hold for 3-5 seconds, then slowly lower back to the starting position. Repeat 10-20 times.',
                benefits: ['Strengthens glutes', 'Improves core stability', 'Enhances hip control'],
                difficulty: 'Beginner'
            },
            {
                id: 'clamshells',
                name: 'Clamshells',
                description: 'An exercise targeting the hip abductors and external rotators.',
                image: '/exercises/images/clamshells.jpg',
                category: 'Strengthening',
                defaultReps: 15,
                defaultSets: 3,
                defaultRestTime: 30,
                instructions: 'Step 1: Lie on your left side, supporting your head with your bent arm. Keep your knees bent to 90 degrees, with knees and ankles stacked. Step 2: Slowly raise your right knee while keeping your ankles together, without allowing your pelvis to roll back. Feel the effort in your right thigh and buttock, then slowly lower back to the starting position. Repeat 10-20 times, then switch sides.',
                benefits: ['Strengthens hip abductors', 'Improves hip stability', 'Prevents knee injuries'],
                difficulty: 'Beginner'
            },
            {
                id: 'cervical-retraction',
                name: 'Cervical Retraction',
                description: 'A gentle exercise to improve neck posture and reduce forward head position.',
                image: '/exercises/images/cervical-retraction.jpg',
                category: 'Posture Correcting',
                defaultReps: 10,
                defaultSets: 2,
                defaultRestTime: 20,
                instructions: 'Step 1: Sit with your shoulders pulled back and down. Look straight ahead. Step 2: Tuck your chin in (like creating a double chin) and hold for 1-2 seconds. Bring your chin straight back without moving your head downward. Return to the starting position and repeat 10 times.',
                benefits: ['Improves neck posture', 'Reduces forward head position', 'Relieves neck tension'],
                difficulty: 'Beginner'
            },
            {
                id: 'thoracic-extension',
                name: 'Thoracic Extension',
                description: 'An exercise to improve upper back posture and reduce rounded shoulders.',
                image: '/exercises/images/thoracic-extension.jpg',
                category: 'Posture Correcting',
                defaultReps: 10,
                defaultSets: 2,
                defaultRestTime: 20,
                instructions: 'Step 1: Sit or stand straight with your hands placed behind your head. Step 2: Keeping your neck neutral, extend your upper back while squeezing your shoulder blades down and back. Hold for 1-2 seconds, return to the starting position, and repeat 10 times.',
                benefits: ['Improves upper back posture', 'Reduces rounded shoulders', 'Enhances breathing'],
                difficulty: 'Beginner'
            },
            {
                id: 'lumbar-extension',
                name: 'Lumbar Extension',
                description: 'A gentle exercise to improve lower back mobility and posture.',
                image: '/exercises/images/lumbar-extension.jpg',
                category: 'Posture Correcting',
                defaultReps: 10,
                defaultSets: 2,
                defaultRestTime: 20,
                instructions: 'Step 1: Stand up straight with your hands on your lower back. Step 2: Slowly bend backward as far as comfortable, focusing on arching your lower back. Hold for 1-2 seconds, then return to the starting position and repeat 10 times.',
                benefits: ['Improves lower back mobility', 'Reduces back stiffness', 'Enhances posture'],
                difficulty: 'Beginner'
            }
        ];

        // Store exercises in IndexedDB
        const transaction = this.db.transaction(['exercises'], 'readwrite');
        const store = transaction.objectStore('exercises');
        
        for (const exercise of exercises) {
            await store.put(exercise);
        }
        
        return exercises;
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // New routine button
        document.getElementById('new-routine-btn').addEventListener('click', () => {
            this.switchTab('create');
        });

        // Routine form
        document.getElementById('routine-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRoutine();
        });

        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    // Tab Management
    switchTab(tabName) {
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Load specific tab content
        switch(tabName) {
            case 'create':
                this.loadExerciseSelection();
                break;
            case 'exercises':
                this.loadExerciseLibrary();
                break;
            case 'progress':
                this.loadProgress();
                break;
        }
    }

    // Routine Management
    async saveRoutine() {
        const name = document.getElementById('routine-name').value.trim();
        const description = document.getElementById('routine-description').value.trim();

        if (!name) {
            this.showToast('Please enter a routine name', 'error');
            return;
        }

        if (this.selectedExercises.length === 0) {
            this.showToast('Please select at least one exercise', 'error');
            return;
        }

        const routine = {
            name,
            description,
            exercises: this.selectedExercises,
            created: new Date().toISOString(),
            lastUsed: null,
            timesCompleted: 0
        };

        try {
            const transaction = this.db.transaction(['routines'], 'readwrite');
            const store = transaction.objectStore('routines');
            await store.add(routine);
            
            this.showToast('Routine saved successfully!', 'success');
            this.resetForm();
            this.loadRoutines();
            this.switchTab('routines');
        } catch (error) {
            console.error('Error saving routine:', error);
            this.showToast('Failed to save routine', 'error');
        }
    }

    async loadRoutines() {
        try {
            const transaction = this.db.transaction(['routines'], 'readonly');
            const store = transaction.objectStore('routines');
            const routines = await this.getAllFromStore(store);

            const routinesList = document.getElementById('routines-list');
            const noRoutines = document.getElementById('no-routines');

            if (routines.length === 0) {
                routinesList.style.display = 'none';
                noRoutines.style.display = 'block';
                return;
            }

            routinesList.style.display = 'grid';
            noRoutines.style.display = 'none';

            routinesList.innerHTML = routines.map(routine => `
                <div class="routine-card">
                    <h3>${routine.name}</h3>
                    <p>${routine.description || 'No description'}</p>
                    <div class="routine-meta">
                        <span>${routine.exercises.length} exercises</span>
                        <span>Completed ${routine.timesCompleted} times</span>
                    </div>
                    <div class="routine-actions">
                        <button class="btn btn-primary btn-small" onclick="app.startRoutine(${routine.id})">
                            ▶ Start
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="app.editRoutine(${routine.id})">
                            ✏ Edit
                        </button>
                        <button class="btn btn-danger btn-small" onclick="app.deleteRoutine(${routine.id})">
                            🗑 Delete
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading routines:', error);
            this.showToast('Failed to load routines', 'error');
        }
    }

    async startRoutine(routineId) {
        try {
            const routine = await this.getRoutineById(routineId);
            if (!routine) {
                this.showToast('Routine not found', 'error');
                return;
            }

            this.currentRoutine = routine;
            this.currentExerciseIndex = 0;
            this.showPlaybackModal();
        } catch (error) {
            console.error('Error starting routine:', error);
            this.showToast('Failed to start routine', 'error');
        }
    }

    async deleteRoutine(routineId) {
        if (!confirm('Are you sure you want to delete this routine?')) {
            return;
        }

        try {
            const transaction = this.db.transaction(['routines'], 'readwrite');
            const store = transaction.objectStore('routines');
            await store.delete(routineId);
            
            this.showToast('Routine deleted', 'success');
            this.loadRoutines();
        } catch (error) {
            console.error('Error deleting routine:', error);
            this.showToast('Failed to delete routine', 'error');
        }
    }

    // Exercise Selection
    async loadExerciseSelection() {
        try {
            const exercises = await this.getAllExercises();
            const exerciseGrid = document.getElementById('exercise-selection');
            
            exerciseGrid.innerHTML = exercises.map(exercise => `
                <div class="exercise-card" data-exercise-id="${exercise.id}">
                    <img src="${exercise.image}" alt="${exercise.name}">
                    <h4>${exercise.name}</h4>
                    <p>${exercise.description.substring(0, 100)}...</p>
                </div>
            `).join('');

            // Add click handlers
            exerciseGrid.querySelectorAll('.exercise-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    const exerciseId = e.currentTarget.dataset.exerciseId;
                    this.toggleExerciseSelection(exerciseId);
                });
            });
        } catch (error) {
            console.error('Error loading exercise selection:', error);
        }
    }

    async toggleExerciseSelection(exerciseId) {
        const exercise = await this.getExerciseById(exerciseId);
        const card = document.querySelector(`[data-exercise-id="${exerciseId}"]`);
        
        const existingIndex = this.selectedExercises.findIndex(ex => ex.id === exerciseId);
        
        if (existingIndex >= 0) {
            // Remove from selection
            this.selectedExercises.splice(existingIndex, 1);
            card.classList.remove('selected');
        } else {
            // Add to selection
            this.selectedExercises.push({
                ...exercise,
                reps: exercise.defaultReps,
                sets: exercise.defaultSets,
                restTime: exercise.defaultRestTime
            });
            card.classList.add('selected');
        }
        
        this.updateSelectedExercisesDisplay();
    }

    updateSelectedExercisesDisplay() {
        const container = document.getElementById('selected-exercises');
        
        if (this.selectedExercises.length === 0) {
            container.innerHTML = '<p class="no-selection">No exercises selected yet</p>';
            return;
        }

        container.innerHTML = this.selectedExercises.map((exercise, index) => `
            <div class="selected-exercise-item">
                <div class="selected-exercise-info">
                    <h4>${exercise.name}</h4>
                    <p>${exercise.category}</p>
                </div>
                <div class="selected-exercise-controls">
                    <label>Reps: <input type="number" class="exercise-input" value="${exercise.reps}" min="1" max="50" onchange="app.updateExerciseParam(${index}, 'reps', this.value)"></label>
                    <label>Sets: <input type="number" class="exercise-input" value="${exercise.sets}" min="1" max="10" onchange="app.updateExerciseParam(${index}, 'sets', this.value)"></label>
                    <label>Rest: <input type="number" class="exercise-input" value="${exercise.restTime}" min="10" max="300" onchange="app.updateExerciseParam(${index}, 'restTime', this.value)">s</label>
                    <button class="remove-exercise" onclick="app.removeSelectedExercise(${index})">Remove</button>
                </div>
            </div>
        `).join('');
    }

    updateExerciseParam(index, param, value) {
        if (this.selectedExercises[index]) {
            this.selectedExercises[index][param] = parseInt(value);
        }
    }

    removeSelectedExercise(index) {
        const exercise = this.selectedExercises[index];
        const card = document.querySelector(`[data-exercise-id="${exercise.id}"]`);
        
        this.selectedExercises.splice(index, 1);
        if (card) card.classList.remove('selected');
        
        this.updateSelectedExercisesDisplay();
    }

    resetForm() {
        document.getElementById('routine-form').reset();
        this.selectedExercises = [];
        this.updateSelectedExercisesDisplay();
        
        // Clear exercise selections
        document.querySelectorAll('.exercise-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
    }

    // Exercise Library
    async loadExerciseLibrary() {
        try {
            const exercises = await this.getAllExercises();
            const libraryContainer = document.getElementById('exercises-library');
            
            libraryContainer.innerHTML = exercises.map(exercise => `
                <div class="exercise-library-card">
                    <img src="${exercise.image}" alt="${exercise.name}">
                    <div class="exercise-library-card-content">
                        <h3>${exercise.name}</h3>
                        <p>${exercise.description}</p>
                        <div class="exercise-tags">
                            <span class="exercise-tag">${exercise.category}</span>
                            <span class="exercise-tag">${exercise.difficulty}</span>
                        </div>
                        <button class="btn btn-primary" onclick="app.showExerciseDetail('${exercise.id}')">
                            View Details
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading exercise library:', error);
        }
    }

    async showExerciseDetail(exerciseId) {
        const exercise = await this.getExerciseById(exerciseId);
        if (!exercise) return;

        document.getElementById('exercise-modal-name').textContent = exercise.name;
        
        // Update media display based on type
        const mediaContainer = document.getElementById('exercise-modal-media');
        mediaContainer.innerHTML = this.createMediaElement(exercise.image);
        
        document.getElementById('exercise-modal-description').innerHTML = `
            <p><strong>Instructions:</strong> ${exercise.instructions}</p>
            <p><strong>Benefits:</strong> ${exercise.benefits.join(', ')}</p>
            <p><strong>Difficulty:</strong> ${exercise.difficulty}</p>
            <p><strong>Category:</strong> ${exercise.category}</p>
        `;

        document.getElementById('exercise-modal').classList.add('show');
    }

    createMediaElement(media) {
        if (!media) return '<div class="placeholder-media">No image available</div>';
        return `<img src="${media}" alt="Exercise demonstration" class="exercise-media">`;
    }

    // Playback System
    showPlaybackModal() {
        const modal = document.getElementById('playback-modal');
        document.getElementById('playback-routine-name').textContent = this.currentRoutine.name;
        
        this.updateExerciseDisplay();
        this.updateProgressDisplay();
        
        modal.classList.add('show');
    }

    // Update exercise display in playback mode
    updateExerciseDisplay() {
        const exercise = this.currentRoutine.exercises[this.currentExerciseIndex];
        
        document.getElementById('current-exercise-name').textContent = exercise.name;
        document.getElementById('current-exercise-description').textContent = exercise.instructions || exercise.description;
        
        // Update media display
        const mediaContainer = document.getElementById('current-exercise-media');
        mediaContainer.innerHTML = this.createMediaElement(exercise.image);
        
        document.getElementById('current-reps').textContent = exercise.reps;
        document.getElementById('current-sets').textContent = exercise.sets;
        document.getElementById('current-rest').textContent = exercise.restTime + 's';
    }

    updateProgressDisplay() {
        const currentNum = this.currentExerciseIndex + 1;
        const total = this.currentRoutine.exercises.length;
        const progressPercent = (currentNum / total) * 100;
        
        document.getElementById('current-exercise-num').textContent = currentNum;
        document.getElementById('total-exercises').textContent = total;
        document.getElementById('progress-fill').style.width = progressPercent + '%';
        
        // Update navigation buttons
        document.getElementById('prev-exercise').disabled = this.currentExerciseIndex === 0;
        document.getElementById('next-exercise').disabled = this.currentExerciseIndex === total - 1;
    }

    togglePlayPause() {
        const button = document.getElementById('play-pause-btn');
        
        if (this.isPlaying) {
            this.pauseExercise();
            button.textContent = 'Resume';
        } else {
            this.startExercise();
            button.textContent = 'Pause';
        }
        
        this.isPlaying = !this.isPlaying;
    }

    startExercise() {
        const exercise = this.currentRoutine.exercises[this.currentExerciseIndex];
        this.currentTime = exercise.restTime;
        
        this.updateTimerDisplay();
        this.timer = setInterval(() => {
            this.currentTime--;
            this.updateTimerDisplay();
            
            if (this.currentTime <= 0) {
                this.completeCurrentExercise();
            }
        }, 1000);
        
        document.querySelector('.timer-circle').classList.add('active');
    }

    pauseExercise() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        document.querySelector('.timer-circle').classList.remove('active');
    }

    completeCurrentExercise() {
        this.pauseExercise();
        
        if (this.currentExerciseIndex < this.currentRoutine.exercises.length - 1) {
            this.showToast('Exercise completed! Moving to next...', 'success');
            setTimeout(() => this.nextExercise(), 1500);
        } else {
            this.completeRoutine();
        }
    }

    updateTimerDisplay() {
        const timerText = document.getElementById('timer-text');
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        
        if (this.currentTime > 0) {
            timerText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else {
            timerText.textContent = 'Done!';
        }
    }

    nextExercise() {
        if (this.currentExerciseIndex < this.currentRoutine.exercises.length - 1) {
            this.currentExerciseIndex++;
            this.updateExerciseDisplay();
            this.updateProgressDisplay();
            
            if (this.isPlaying) {
                this.pauseExercise();
                this.isPlaying = false;
                document.getElementById('play-pause-btn').textContent = 'Start';
            }
        }
    }

    previousExercise() {
        if (this.currentExerciseIndex > 0) {
            this.currentExerciseIndex--;
            this.updateExerciseDisplay();
            this.updateProgressDisplay();
            
            if (this.isPlaying) {
                this.pauseExercise();
                this.isPlaying = false;
                document.getElementById('play-pause-btn').textContent = 'Start';
            }
        }
    }

    async completeRoutine() {
        this.pauseExercise();
        
        try {
            // Update routine completion count
            const transaction = this.db.transaction(['routines', 'progress'], 'readwrite');
            const routineStore = transaction.objectStore('routines');
            const progressStore = transaction.objectStore('progress');
            
            this.currentRoutine.timesCompleted++;
            this.currentRoutine.lastUsed = new Date().toISOString();
            await routineStore.put(this.currentRoutine);
            
            // Log progress
            const progressEntry = {
                routineId: this.currentRoutine.id,
                routineName: this.currentRoutine.name,
                date: new Date().toISOString(),
                exercises: this.currentRoutine.exercises.length,
                duration: Date.now() - this.routineStartTime
            };
            await progressStore.add(progressEntry);
            
            this.showToast('🎉 Routine completed! Great job!', 'success');
            this.closePlayback();
            this.loadRoutines();
            
        } catch (error) {
            console.error('Error completing routine:', error);
            this.showToast('Routine completed, but failed to save progress', 'error');
        }
    }

    closePlayback() {
        this.pauseExercise();
        this.currentRoutine = null;
        this.currentExerciseIndex = 0;
        this.isPlaying = false;
        document.getElementById('playback-modal').classList.remove('show');
        document.getElementById('play-pause-btn').textContent = 'Start';
        document.getElementById('timer-text').textContent = 'Ready';
    }

    closeExerciseModal() {
        document.getElementById('exercise-modal').classList.remove('show');
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        this.pauseExercise();
    }

    // Progress Tracking
    async loadProgress() {
        try {
            const transaction = this.db.transaction(['progress'], 'readonly');
            const store = transaction.objectStore('progress');
            const progressEntries = await this.getAllFromStore(store);
            
            this.updateProgressStats(progressEntries);
            this.updateActivityLog(progressEntries);
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }

    updateProgressStats(progressEntries) {
        const totalSessions = progressEntries.length;
        
        // Calculate this week's sessions
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const thisWeek = progressEntries.filter(entry => 
            new Date(entry.date) >= oneWeekAgo
        ).length;
        
        // Calculate streak (consecutive days with activity)
        const streak = this.calculateStreak(progressEntries);
        
        document.getElementById('total-sessions').textContent = totalSessions;
        document.getElementById('this-week').textContent = thisWeek;
        document.getElementById('streak').textContent = streak;
    }

    calculateStreak(progressEntries) {
        if (progressEntries.length === 0) return 0;
        
        // Sort entries by date (newest first)
        const sortedEntries = progressEntries.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        // Get unique dates
        const uniqueDates = [...new Set(sortedEntries.map(entry => 
            new Date(entry.date).toDateString()
        ))];
        
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < uniqueDates.length; i++) {
            const entryDate = new Date(uniqueDates[i]);
            const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === i) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    updateActivityLog(progressEntries) {
        const activityLog = document.getElementById('activity-log');
        
        if (progressEntries.length === 0) {
            activityLog.innerHTML = '<p class="no-activity">No activity recorded yet</p>';
            return;
        }
        
        // Sort by date (newest first) and take last 10
        const recentEntries = progressEntries
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);
        
        activityLog.innerHTML = recentEntries.map(entry => {
            const date = new Date(entry.date);
            const timeAgo = this.getTimeAgo(date);
            
            return `
                <div class="activity-item">
                    <div class="activity-info">
                        <h4>${entry.routineName}</h4>
                        <p>${entry.exercises} exercises completed</p>
                    </div>
                    <div class="activity-date">${timeAgo}</div>
                </div>
            `;
        }).join('');
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    // Database Helper Methods
    async getAllFromStore(store) {
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getRoutineById(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['routines'], 'readonly');
            const store = transaction.objectStore('routines');
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getExerciseById(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['exercises'], 'readonly');
            const store = transaction.objectStore('exercises');
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllExercises() {
        const transaction = this.db.transaction(['exercises'], 'readonly');
        const store = transaction.objectStore('exercises');
        return this.getAllFromStore(store);
    }

    // Utility Methods
    showLoading(show = true) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.add('show');
        } else {
            loading.classList.remove('show');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toast-container');
        container.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Audio Guidance (Text-to-Speech)
    speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.volume = 0.8;
            speechSynthesis.speak(utterance);
        }
    }

    // Export/Import Routines
    async exportRoutines() {
        try {
            const routines = await this.getAllFromStore(
                this.db.transaction(['routines'], 'readonly').objectStore('routines')
            );
            
            const dataStr = JSON.stringify(routines, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'physio-routines.json';
            link.click();
            
            URL.revokeObjectURL(url);
            this.showToast('Routines exported successfully', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Failed to export routines', 'error');
        }
    }

    async importRoutines(file) {
        try {
            const text = await file.text();
            const routines = JSON.parse(text);
            
            const transaction = this.db.transaction(['routines'], 'readwrite');
            const store = transaction.objectStore('routines');
            
            for (const routine of routines) {
                delete routine.id; // Let IndexedDB assign new IDs
                await store.add(routine);
            }
            
            this.showToast(`Imported ${routines.length} routines`, 'success');
            this.loadRoutines();
        } catch (error) {
            console.error('Import failed:', error);
            this.showToast('Failed to import routines', 'error');
        }
    }

    // Offline Support
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    // Responsive Design Helper
    isMobile() {
        return window.innerWidth <= 768;
    }

    // Accessibility Features
    announceForScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Performance Optimization
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Global Functions (for onclick handlers)
window.switchTab = (tabName) => app.switchTab(tabName);
window.resetForm = () => app.resetForm();
window.closePlayback = () => app.closePlayback();
window.closeExerciseModal = () => app.closeExerciseModal();
window.togglePlayPause = () => app.togglePlayPause();
window.nextExercise = () => app.nextExercise();
window.previousExercise = () => app.previousExercise();

// Initialize App
const app = new PhysioApp();

// Additional Event Listeners
window.addEventListener('online', () => {
    app.showToast('Back online!', 'success');
});

window.addEventListener('offline', () => {
    app.showToast('Working offline', 'info');
});

// Prevent zoom on double tap (iOS)
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Handle install prompt for PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button or prompt
    const installButton = document.createElement('button');
    installButton.textContent = 'Install App';
    installButton.className = 'btn btn-primary';
    installButton.onclick = () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                app.showToast('App installed successfully!', 'success');
            }
            deferredPrompt = null;
            installButton.remove();
        });
    };
    
    document.querySelector('.nav-brand').appendChild(installButton);
});

// Service Worker Update Handler
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
    });
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N: New routine
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        app.switchTab('create');
    }
    
    // Ctrl/Cmd + E: Exercise library
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        app.switchTab('exercises');
    }
    
    // Ctrl/Cmd + P: Progress
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        app.switchTab('progress');
    }
    
    // Space: Play/Pause during routine
    if (e.code === 'Space' && document.getElementById('playback-modal').classList.contains('show')) {
        e.preventDefault();
        app.togglePlayPause();
    }
});

console.log('PhysioRoutine App initialized successfully!');