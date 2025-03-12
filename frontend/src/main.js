import './style.css'
import axios from 'axios'

// API base URL
const API_URL = 'http://localhost:5000';

// Store categories and active category
let categories = [];
let activeCategory = '';
let commandHistory = [];
let historyIndex = -1;

// Store currently displayed commands
let currentCommands = [];

// Initialize the app
function initApp() {
  // Create the app HTML structure
  document.querySelector('#app').innerHTML = `
  <div class="loading-screen">
    <svg class="powershell-logo" viewBox="0 0 24 24">
      <path fill="#5cb3fd" d="M23.5 1h-23C.2 1 0 1.2 0 1.5v21c0 .3.2.5.5.5h23c.3 0 .5-.2.5-.5v-21c0-.3-.2-.5-.5-.5zM7.3 19.2l-4.8-4.8c-.2-.2-.2-.5 0-.7l4.8-4.8c.2-.2.5-.2.7 0l1.4 1.4c.2.2.2.5 0 .7L5.9 14.5l3.5 3.5c.2.2.2.5 0 .7l-1.4 1.4c-.2.1-.5.1-.7-.1zm5.2.3h-2c-.3 0-.5-.2-.5-.5v-2c0-.3.2-.5.5-.5h2c.3 0 .5.2.5.5v2c0 .3-.2.5-.5.5z"/>
    </svg>
    <div class="loading-bar"></div>
    <div class="loading-text">Initializing PowerShell Command Finder...</div>
  </div>
  <div class="container">
    <h1>PowerShell Command Finder</h1>
    <p class="subtitle">Search for PowerShell commands by name, description, or usage</p>
    
    <button id="toggle-dev-env" class="toggle-dev-env">Toggle PowerShell</button>
    
    <div class="dev-test-env hidden">
      <div id="dev-test-panel" class="dev-test-panel">
        <div class="dev-test-header">
          <h3>Windows PowerShell</h3>
          <button id="close-dev-test" class="close-button">×</button>
        </div>
        <div class="dev-test-content">
          <div class="test-output-section">
            <pre id="test-command-output">Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.

Try the new cross-platform PowerShell https://aka.ms/pscore6
</pre>
          </div>
          <div class="test-input-section">
            <div class="ps-prompt">PS C:\\Users\\user> </div>
            <textarea id="test-command-input" rows="1" placeholder=""></textarea>
          </div>
        </div>
      </div>
    </div>
    
    <div class="search-container">
      <input type="text" id="search-input" placeholder="Search PowerShell commands..." />
      <button id="search-button">Search</button>
    </div>
    
    <div id="categories-container" class="categories-container">
      <button class="category-tab active" data-category="all">All Commands</button>
    </div>
    
    <div class="app-content">
      <div id="results-container">
        <div id="loading" class="hidden">Searching...</div>
        <div id="results" class="results-grid"></div>
      </div>
      
      <div id="details-container" class="details-container hidden">
        <div class="details-header">
          <h2 id="details-title">Command Details</h2>
          <button id="close-details" class="close-details">×</button>
        </div>
        <div id="details-content" class="details-content"></div>
      </div>
    </div>
  </div>
`;

  // Get DOM elements after they've been created
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const resultsContainer = document.getElementById('results');
  const loadingIndicator = document.getElementById('loading');
  const categoriesContainer = document.getElementById('categories-container');
  const detailsContainer = document.getElementById('details-container');
  const detailsTitle = document.getElementById('details-title');
  const detailsContent = document.getElementById('details-content');
  const closeDetailsButton = document.getElementById('close-details');
  const commandInput = document.getElementById('test-command-input');
  const commandOutput = document.getElementById('test-command-output');
  const toggleDevEnv = document.getElementById('toggle-dev-env');
  const devTestEnv = document.querySelector('.dev-test-env');
  const closeDevTest = document.getElementById('close-dev-test');

  // Event listeners
  searchButton.addEventListener('click', () => {
    searchCommands(searchInput.value.trim());
    closeDetails(); // Close details panel when searching
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchCommands(searchInput.value.trim());
      closeDetails(); // Close details panel when searching
    }
  });

  // Close details panel when close button is clicked
  closeDetailsButton.addEventListener('click', closeDetails);

  // Toggle dev test panel
  toggleDevEnv.addEventListener('click', async () => {
    try {
      const response = await axios.post(`${API_URL}/api/launch-powershell`);
      if (response.data.message) {
        console.log('PowerShell launched successfully');
      }
    } catch (error) {
      console.error('Failed to launch PowerShell:', error);
    }
  });

  // Close dev environment when clicking the close button
  closeDevTest.addEventListener('click', () => {
    devTestEnv.classList.add('hidden');
  });

  // Handle command input
  commandInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const command = commandInput.value;
      simulatePowerShellCommand(command);
      commandInput.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        commandInput.value = commandHistory[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        commandInput.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        commandInput.value = '';
      }
    }
  });

  // Hide loading screen after a short delay
  setTimeout(() => {
    document.querySelector('.loading-screen').classList.add('hidden');
  }, 2000);
  
  // Function to fetch categories from the API
  async function fetchCategories() {
    try {
      const response = await axios.get(`${API_URL}/api/categories`);
      categories = response.data;
      renderCategoryTabs();
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  // Function to render category tabs
  function renderCategoryTabs() {
    const tabsHtml = categories.map(category => 
      `<button class="category-tab" data-category="${category}">${category}</button>`
    ).join('');
    
    // Append new category tabs after the "All Commands" tab
    const allCommandsTab = categoriesContainer.querySelector('[data-category="all"]');
    allCommandsTab.insertAdjacentHTML('afterend', tabsHtml);
    
    // Add event listeners to category tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        activeCategory = tab.dataset.category === 'all' ? '' : tab.dataset.category;
        searchCommands(searchInput.value.trim());
      });
    });
  }

  // Function to fetch commands from the API
  async function searchCommands(query = '') {
    try {
      loadingIndicator.classList.remove('hidden');
      resultsContainer.innerHTML = '';
      
      let url = `${API_URL}/api/commands`;
      let params = { q: query };
      
      if (activeCategory && activeCategory !== 'all') {
        params.category = activeCategory;
      }
      
      const response = await axios.get(url, { params });
      
      displayResults(response.data);
    } catch (error) {
      console.error('Error fetching commands:', error);
      resultsContainer.innerHTML = `<div class="error">Failed to fetch commands. Please try again.</div>`;
    } finally {
      loadingIndicator.classList.add('hidden');
    }
  }

  // Function to display search results
  function displayResults(commands) {
    if (commands.length === 0) {
      resultsContainer.innerHTML = `<div class="no-results">No commands found. Try a different search term.</div>`;
      return;
    }
    
    // Store commands for reference when showing details
    currentCommands = commands;
    
    resultsContainer.innerHTML = commands.map((cmd, index) => `
      <div class="command-card">
        <h3 class="command-name">${cmd.name}</h3>
        <p class="command-description">${cmd.description}</p>
        <button class="toggle-details" data-index="${index}">Show Details</button>
      </div>
    `).join('');
    
    // Add event listeners to toggle buttons
    document.querySelectorAll('.toggle-details').forEach(button => {
      button.addEventListener('click', () => {
        const index = parseInt(button.getAttribute('data-index'));
        showCommandDetails(index);
      });
    });
  }

  // Function to show command details in the details panel
  function showCommandDetails(index) {
    const command = currentCommands[index];
    
    // Update details panel content
    detailsTitle.textContent = command.name;
    
    detailsContent.innerHTML = `
      <p class="command-description">${command.description}</p>
      <div class="usage">
        <h4>Usage:</h4>
        <pre>${command.usage}</pre>
      </div>
      <div class="example">
        <h4>Example:</h4>
        <pre>${command.examples}</pre>
      </div>
    `;
    
    // Show details panel
    detailsContainer.classList.remove('hidden');
  }

  // Function to close the details panel
  function closeDetails() {
    detailsContainer.classList.add('hidden');
  }

  // PowerShell terminal functionality
  function appendToOutput(text, className = '') {
    const prompt = 'PS C:\\Users\\user> ';
    const newContent = className ? 
      `${commandOutput.textContent}${text}\n` :
      `${commandOutput.textContent}${prompt}${text}\n`;
    commandOutput.textContent = newContent;
    commandOutput.scrollTop = commandOutput.scrollHeight;
  }

  function simulatePowerShellCommand(command) {
    if (!command.trim()) return;

    commandHistory.push(command);
    historyIndex = commandHistory.length;

    // Basic PowerShell command simulation
    const cmd = command.toLowerCase().trim();
    let output = '';

    if (cmd === 'cls' || cmd === 'clear') {
      commandOutput.textContent = '';
      return;
    }

    if (cmd === 'exit') {
      appendToOutput('Closing PowerShell session...');
      setTimeout(() => {
        document.querySelector('.dev-test-env').style.display = 'none';
      }, 1000);
      return;
    }

    if (cmd.startsWith('get-')) {
      output = `NAME                           VALUE\n----                           -----\nExample-Item                   Sample Value`;
    } else if (cmd === 'pwd' || cmd === 'get-location') {
      output = 'Path\n----\nC:\\Users\\user';
    } else if (cmd === 'ls' || cmd === 'dir' || cmd === 'get-childitem') {
      output = `
    Directory: C:\\Users\\user

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----        12/31/2023  10:00 PM                Documents
d-----        12/31/2023  10:00 PM                Downloads
d-----        12/31/2023  10:00 PM                Desktop`;
    } else if (cmd === 'help' || cmd === 'get-help') {
      output = `
TOPIC\n    Windows PowerShell Help System

SHORT DESCRIPTION\n    Displays help about Windows PowerShell cmdlets and concepts.`;
    } else {
      output = `The term '${command}' is not recognized as the name of a cmdlet, function, script file, or operable program.`;
    }

    appendToOutput(command);
    appendToOutput(output, 'ps-output');
  }
  
  // Fetch categories and load all commands
  fetchCategories();
  searchCommands();
}

// Start the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);
