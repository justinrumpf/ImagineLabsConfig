let config = null;

// Load configuration on startup
async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        config = await response.json();
        renderAllTabs();
        showStatus('Configuration loaded successfully', 'success');
    } catch (error) {
        showStatus('Failed to load configuration: ' + error.message, 'error');
    }
}

// Tab switching
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        
        // Update active states
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(tabName + '-tab').classList.add('active');
        
        // Render the selected tab
        renderTab(tabName);
    });
});

function renderTab(tabName) {
    switch(tabName) {
        case 'basic':
            renderBasicInfo();
            break;
        case 'titles':
            renderStepTitles();
            break;
        case 'themes':
            renderThemes();
            break;
        case 'types':
            renderStoryTypes();
            break;
        case 'locations':
            renderLocations();
            break;
        case 'prompts':
            renderAIPrompts();
            break;
        case 'assets':
            renderAssets();
            break;
        case 'raw':
            renderRawJson();
            break;
    }
}

function renderAllTabs() {
    renderBasicInfo();
    renderStepTitles();
    renderThemes();
    renderStoryTypes();
    renderLocations();
    renderAIPrompts();
    renderAssets();
    renderRawJson();
}

// Basic Info Tab
function renderBasicInfo() {
    document.getElementById('version').value = config.version || '';
    document.getElementById('lastUpdated').value = config.lastUpdated || '';
}

// Step Titles Tab
function renderStepTitles() {
    const container = document.getElementById('stepTitles');
    container.innerHTML = '';
    
    const titles = config.stepTitles || {};
    const titleDescriptions = {
        step1: 'Title for child selection step',
        step2: 'Title for character selection step',
        step3: 'Title for location selection step',
        step4: 'Title for story type selection step',
        step5: 'Title for theme selection step',
        createCharacter: 'Button text for creating a character'
    };
    
    Object.entries(titleDescriptions).forEach(([key, description]) => {
        const group = document.createElement('div');
        group.className = 'form-group';
        group.innerHTML = `
            <label for="title_${key}">${key}</label>
            <input type="text" id="title_${key}" class="form-control" 
                   value="${titles[key] || ''}" 
                   onchange="updateStepTitle('${key}', this.value)">
            <small>${description}</small>
        `;
        container.appendChild(group);
    });
}

// Themes Tab
function renderThemes() {
    const container = document.getElementById('themes');
    container.innerHTML = '';
    
    (config.storyThemes || []).forEach((category, categoryIndex) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-section';
        
        categoryDiv.innerHTML = `
            <div class="category-header">
                <h3>${category.category}</h3>
                <button class="btn btn-danger btn-sm" onclick="removeThemeCategory(${categoryIndex})">Remove Category</button>
            </div>
            <div class="form-group">
                <label>Category Name</label>
                <input type="text" class="form-control" value="${category.category}" 
                       onchange="updateThemeCategory(${categoryIndex}, 'category', this.value)">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" 
                          onchange="updateThemeCategory(${categoryIndex}, 'description', this.value)">${category.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Icon</label>
                <input type="text" class="form-control" value="${category.icon || ''}" 
                       onchange="updateThemeCategory(${categoryIndex}, 'icon', this.value)">
                <small>Icon identifier (e.g., flask-green, flask-orange)</small>
            </div>
            <h4>Themes</h4>
            <div id="themes_${categoryIndex}"></div>
            <button class="btn btn-primary btn-sm" onclick="addTheme(${categoryIndex})">Add Theme</button>
        `;
        
        container.appendChild(categoryDiv);
        renderThemeList(categoryIndex, category.themes || []);
    });
}

function renderThemeList(categoryIndex, themes) {
    const container = document.getElementById(`themes_${categoryIndex}`);
    container.innerHTML = '';
    
    themes.forEach((theme, themeIndex) => {
        const themeDiv = document.createElement('div');
        themeDiv.className = 'theme-item';
        
        themeDiv.innerHTML = `
            <div class="form-group">
                <label>Theme Name</label>
                <input type="text" class="form-control" value="${theme.theme}" 
                       onchange="updateTheme(${categoryIndex}, ${themeIndex}, 'theme', this.value)">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" 
                          onchange="updateTheme(${categoryIndex}, ${themeIndex}, 'description', this.value)">${theme.description || ''}</textarea>
            </div>
            <div class="theme-controls">
                <div class="age-range">
                    <label>Age Range:</label>
                    <input type="number" class="form-control" placeholder="Min" 
                           value="${theme.ageRange?.min || ''}"
                           onchange="updateThemeAgeRange(${categoryIndex}, ${themeIndex}, 'min', this.value)">
                    <span>to</span>
                    <input type="number" class="form-control" placeholder="Max" 
                           value="${theme.ageRange?.max || ''}"
                           onchange="updateThemeAgeRange(${categoryIndex}, ${themeIndex}, 'max', this.value)">
                </div>
                <div class="word-count">
                    <label>Word Count:</label>
                    <input type="number" class="form-control" placeholder="Min" 
                           value="${theme.wordCount?.min || ''}"
                           onchange="updateThemeWordCount(${categoryIndex}, ${themeIndex}, 'min', this.value)">
                    <span>to</span>
                    <input type="number" class="form-control" placeholder="Max" 
                           value="${theme.wordCount?.max || ''}"
                           onchange="updateThemeWordCount(${categoryIndex}, ${themeIndex}, 'max', this.value)">
                </div>
            </div>
            <button class="btn btn-danger btn-sm remove-btn" onclick="removeTheme(${categoryIndex}, ${themeIndex})">Remove Theme</button>
        `;
        
        container.appendChild(themeDiv);
    });
}

// Story Types Tab
function renderStoryTypes() {
    const container = document.getElementById('storyTypes');
    container.innerHTML = '';
    
    (config.storyType || []).forEach((type, index) => {
        const typeDiv = document.createElement('div');
        typeDiv.className = 'theme-item';
        
        typeDiv.innerHTML = `
            <div class="form-group">
                <label>Type Name</label>
                <input type="text" class="form-control" value="${type.type}" 
                       onchange="updateStoryType(${index}, 'type', this.value)">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" 
                          onchange="updateStoryType(${index}, 'description', this.value)">${type.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Image URL</label>
                <input type="text" class="form-control" value="${type.imageUrl || ''}" 
                       onchange="updateStoryType(${index}, 'imageUrl', this.value)">
                <div class="image-upload">
                    <input type="file" accept="image/*" onchange="uploadImage(event, 'storyType', ${index})">
                    ${type.imageUrl ? `<img src="${type.imageUrl}" class="image-preview">` : ''}
                </div>
            </div>
            <div class="form-group">
                <label>Image Justification</label>
                <select class="form-control" onchange="updateStoryType(${index}, 'imageJustification', this.value)">
                    <option value="left" ${type.imageJustification === 'left' ? 'selected' : ''}>Left</option>
                    <option value="right" ${type.imageJustification === 'right' ? 'selected' : ''}>Right</option>
                </select>
            </div>
            <button class="btn btn-danger btn-sm" onclick="removeStoryType(${index})">Remove Type</button>
        `;
        
        container.appendChild(typeDiv);
    });
}

// Locations Tab
function renderLocations() {
    const container = document.getElementById('locations');
    container.innerHTML = '';
    
    (config.locations || []).forEach((location, locationIndex) => {
        const locationDiv = document.createElement('div');
        locationDiv.className = 'category-section';
        
        locationDiv.innerHTML = `
            <div class="category-header">
                <h3>${location.name}</h3>
                <button class="btn btn-danger btn-sm" onclick="removeLocation(${locationIndex})">Remove Location</button>
            </div>
            <div class="form-group">
                <label>Location Name</label>
                <input type="text" class="form-control" value="${location.name}" 
                       onchange="updateLocation(${locationIndex}, 'name', this.value)">
            </div>
            <div class="form-group">
                <label>Image URL</label>
                <input type="text" class="form-control" value="${location.imageUrl || ''}" 
                       onchange="updateLocation(${locationIndex}, 'imageUrl', this.value)">
                <div class="image-upload">
                    <input type="file" accept="image/*" onchange="uploadImage(event, 'location', ${locationIndex})">
                    ${location.imageUrl ? `<img src="${location.imageUrl}" class="image-preview">` : ''}
                </div>
            </div>
            <h4>Places</h4>
            <div id="places_${locationIndex}"></div>
            <button class="btn btn-primary btn-sm" onclick="addPlace(${locationIndex})">Add Place</button>
        `;
        
        container.appendChild(locationDiv);
        renderPlaces(locationIndex, location.places || []);
    });
}

function renderPlaces(locationIndex, places) {
    const container = document.getElementById(`places_${locationIndex}`);
    container.innerHTML = '';
    
    places.forEach((place, placeIndex) => {
        const placeDiv = document.createElement('div');
        placeDiv.className = 'place-item';
        
        placeDiv.innerHTML = `
            <div class="form-group">
                <label>Place Name</label>
                <input type="text" class="form-control" value="${place.placeName}" 
                       onchange="updatePlace(${locationIndex}, ${placeIndex}, 'placeName', this.value)">
            </div>
            <div class="form-group">
                <label>Place Description</label>
                <textarea class="form-control" 
                          onchange="updatePlace(${locationIndex}, ${placeIndex}, 'placeDescription', this.value)">${place.placeDescription || ''}</textarea>
                <small>Make this description vivid and detailed for AI story generation</small>
            </div>
            <button class="btn btn-danger btn-sm" onclick="removePlace(${locationIndex}, ${placeIndex})">Remove Place</button>
        `;
        
        container.appendChild(placeDiv);
    });
}

// AI Prompts Tab
function renderAIPrompts() {
    const container = document.getElementById('aiPrompts');
    container.innerHTML = '';
    
    if (!config.aiPrompts) {
        config.aiPrompts = {
            storyGeneration: {},
            imageGeneration: {}
        };
    }
    
    container.innerHTML = `
        <div class="prompt-section">
            <h3>Story Generation</h3>
            <div class="form-group">
                <label>Base Prompt</label>
                <textarea class="form-control" rows="10" 
                          onchange="updateAIPrompt('storyGeneration', 'basePrompt', this.value)">${config.aiPrompts.storyGeneration?.basePrompt || ''}</textarea>
                <div class="token-hint">
                    <strong>Available tokens:</strong> {characters}, {timePeriod}, {locationName}, {locationDescription}, 
                    {storyType}, {storyTypeDescription}, {theme}, {themeDescription}, {childInfo}, {wordCount}, {ageRange}
                </div>
            </div>
            <div class="form-group">
                <label>Child Info Template</label>
                <input type="text" class="form-control" 
                       value="${config.aiPrompts.storyGeneration?.childInfoTemplate || ''}"
                       onchange="updateAIPrompt('storyGeneration', 'childInfoTemplate', this.value)">
                <small>Template for child information. Tokens: {childName}, {ageRange}</small>
            </div>
            <h4>Generation Config</h4>
            <div class="theme-controls">
                <div class="form-group">
                    <label>Temperature</label>
                    <input type="number" step="0.1" class="form-control" 
                           value="${config.aiPrompts.storyGeneration?.generationConfig?.temperature || 0.8}"
                           onchange="updateGenerationConfig('storyGeneration', 'temperature', this.value)">
                </div>
                <div class="form-group">
                    <label>Max Output Tokens</label>
                    <input type="number" class="form-control" 
                           value="${config.aiPrompts.storyGeneration?.generationConfig?.maxOutputTokens || 2048}"
                           onchange="updateGenerationConfig('storyGeneration', 'maxOutputTokens', this.value)">
                </div>
            </div>
        </div>
        
        <div class="prompt-section">
            <h3>Image Generation</h3>
            <div class="form-group">
                <label>Cover Prompt</label>
                <textarea class="form-control" rows="8" 
                          onchange="updateAIPrompt('imageGeneration', 'coverPrompt', this.value)">${config.aiPrompts.imageGeneration?.coverPrompt || ''}</textarea>
                <div class="token-hint">
                    <strong>Available tokens:</strong> {title}, {storyExcerpt}, {characters}, {locationName}, 
                    {locationDescription}, {timePeriod}, {theme}, {storyType}
                </div>
            </div>
            <div class="form-group">
                <label>Scene Prompt</label>
                <textarea class="form-control" rows="8" 
                          onchange="updateAIPrompt('imageGeneration', 'scenePrompt', this.value)">${config.aiPrompts.imageGeneration?.scenePrompt || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Thumbnail Prompt</label>
                <textarea class="form-control" rows="6" 
                          onchange="updateAIPrompt('imageGeneration', 'thumbnailPrompt', this.value)">${config.aiPrompts.imageGeneration?.thumbnailPrompt || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Image Requirements</label>
                <textarea class="form-control" rows="4" 
                          onchange="updateAIPrompt('imageGeneration', 'imageRequirements', this.value)">${config.aiPrompts.imageGeneration?.imageRequirements || ''}</textarea>
            </div>
        </div>
    `;
}

// Assets Tab (simplified for now)
function renderAssets() {
    const container = document.getElementById('assets');
    container.innerHTML = `
        <p>Asset management is a complex feature. Currently, you can:</p>
        <ul>
            <li>Upload images when editing story types and locations</li>
            <li>Images will be committed to GitHub with the configuration</li>
            <li>Use the image URL paths in the configuration</li>
        </ul>
        <p>For full asset management, edit the assets section in the Raw JSON tab.</p>
    `;
}

// Raw JSON Tab
function renderRawJson() {
    document.getElementById('rawJson').value = JSON.stringify(config, null, 2);
}

// Update functions
function updateStepTitle(key, value) {
    if (!config.stepTitles) config.stepTitles = {};
    config.stepTitles[key] = value;
}

function updateThemeCategory(categoryIndex, field, value) {
    config.storyThemes[categoryIndex][field] = value;
}

function updateTheme(categoryIndex, themeIndex, field, value) {
    config.storyThemes[categoryIndex].themes[themeIndex][field] = value;
}

function updateThemeAgeRange(categoryIndex, themeIndex, field, value) {
    const theme = config.storyThemes[categoryIndex].themes[themeIndex];
    if (!theme.ageRange) theme.ageRange = {};
    theme.ageRange[field] = parseInt(value) || 0;
}

function updateThemeWordCount(categoryIndex, themeIndex, field, value) {
    const theme = config.storyThemes[categoryIndex].themes[themeIndex];
    if (!theme.wordCount) theme.wordCount = {};
    theme.wordCount[field] = parseInt(value) || 0;
}

function updateStoryType(index, field, value) {
    config.storyType[index][field] = value;
}

function updateLocation(index, field, value) {
    config.locations[index][field] = value;
}

function updatePlace(locationIndex, placeIndex, field, value) {
    config.locations[locationIndex].places[placeIndex][field] = value;
}

function updateAIPrompt(section, field, value) {
    if (!config.aiPrompts) config.aiPrompts = {};
    if (!config.aiPrompts[section]) config.aiPrompts[section] = {};
    config.aiPrompts[section][field] = value;
}

function updateGenerationConfig(section, field, value) {
    if (!config.aiPrompts[section].generationConfig) {
        config.aiPrompts[section].generationConfig = {};
    }
    config.aiPrompts[section].generationConfig[field] = 
        field === 'temperature' ? parseFloat(value) : parseInt(value);
}

// Add functions
function addThemeCategory() {
    if (!config.storyThemes) config.storyThemes = [];
    config.storyThemes.push({
        category: 'New Category',
        description: '',
        icon: 'flask-blue',
        themes: []
    });
    renderThemes();
}

function addTheme(categoryIndex) {
    if (!config.storyThemes[categoryIndex].themes) {
        config.storyThemes[categoryIndex].themes = [];
    }
    config.storyThemes[categoryIndex].themes.push({
        theme: 'New Theme',
        description: '',
        ageRange: { min: 3, max: 12 },
        wordCount: { min: 400, max: 1200 }
    });
    renderThemeList(categoryIndex, config.storyThemes[categoryIndex].themes);
}

function addStoryType() {
    if (!config.storyType) config.storyType = [];
    config.storyType.push({
        type: 'New Type',
        description: '',
        imageUrl: '',
        imageJustification: 'left'
    });
    renderStoryTypes();
}

function addLocation() {
    if (!config.locations) config.locations = [];
    config.locations.push({
        name: 'New Location',
        imageUrl: '',
        places: []
    });
    renderLocations();
}

function addPlace(locationIndex) {
    if (!config.locations[locationIndex].places) {
        config.locations[locationIndex].places = [];
    }
    config.locations[locationIndex].places.push({
        placeName: 'New Place',
        placeDescription: ''
    });
    renderPlaces(locationIndex, config.locations[locationIndex].places);
}

// Remove functions
function removeThemeCategory(index) {
    if (confirm('Are you sure you want to remove this category and all its themes?')) {
        config.storyThemes.splice(index, 1);
        renderThemes();
    }
}

function removeTheme(categoryIndex, themeIndex) {
    config.storyThemes[categoryIndex].themes.splice(themeIndex, 1);
    renderThemeList(categoryIndex, config.storyThemes[categoryIndex].themes);
}

function removeStoryType(index) {
    config.storyType.splice(index, 1);
    renderStoryTypes();
}

function removeLocation(index) {
    if (confirm('Are you sure you want to remove this location and all its places?')) {
        config.locations.splice(index, 1);
        renderLocations();
    }
}

function removePlace(locationIndex, placeIndex) {
    config.locations[locationIndex].places.splice(placeIndex, 1);
    renderPlaces(locationIndex, config.locations[locationIndex].places);
}

// Image upload
async function uploadImage(event, type, index) {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (result.success) {
            // Update the appropriate field with the new image URL
            if (type === 'storyType') {
                config.storyType[index].imageUrl = result.url;
                renderStoryTypes();
            } else if (type === 'location') {
                config.locations[index].imageUrl = result.url;
                renderLocations();
            }
            showStatus('Image uploaded successfully', 'success');
        }
    } catch (error) {
        showStatus('Failed to upload image: ' + error.message, 'error');
    }
}

// Save and commit functions
async function saveConfig() {
    // Update basic info
    config.version = document.getElementById('version').value;
    config.lastUpdated = document.getElementById('lastUpdated').value;
    
    try {
        const response = await fetch('/api/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });
        
        const result = await response.json();
        if (result.success) {
            showStatus('Configuration saved locally', 'success');
        }
    } catch (error) {
        showStatus('Failed to save configuration: ' + error.message, 'error');
    }
}

async function commitToGitHub() {
    const message = prompt('Enter commit message:', 'Update story configuration');
    if (!message) return;
    
    try {
        const response = await fetch('/api/commit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        const result = await response.json();
        if (result.success) {
            showStatus('Changes committed to GitHub successfully!', 'success');
        } else {
            showStatus('Failed to commit: ' + result.error, 'error');
        }
    } catch (error) {
        showStatus('Failed to commit to GitHub: ' + error.message, 'error');
    }
}

function formatJson() {
    try {
        const rawJson = document.getElementById('rawJson').value;
        const parsed = JSON.parse(rawJson);
        document.getElementById('rawJson').value = JSON.stringify(parsed, null, 2);
        showStatus('JSON formatted successfully', 'success');
    } catch (error) {
        showStatus('Invalid JSON: ' + error.message, 'error');
    }
}

function applyRawJson() {
    try {
        const rawJson = document.getElementById('rawJson').value;
        config = JSON.parse(rawJson);
        renderAllTabs();
        showStatus('JSON applied successfully', 'success');
    } catch (error) {
        showStatus('Invalid JSON: ' + error.message, 'error');
    }
}

function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = 'status ' + type;
    
    setTimeout(() => {
        status.className = 'status';
    }, 5000);
}

// Initialize on load
window.addEventListener('DOMContentLoaded', loadConfig);