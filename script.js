class KomicKon {
    constructor() {
        this.selectedStyle = 'superhero';
        this.selectedProvider = 'openai';
        this.selectedPanels = 3;
        this.apiKeys = this.loadApiKeys();
        this.isGenerating = false;
        
        // Provider configurations
        this.providers = {
            openai: {
                name: 'OpenAI DALL-E',
                emoji: '🤖',
                color: 'text-comic-yellow',
                placeholder: 'sk-...',
                description: 'Enter your OpenAI API key to generate images with DALL-E'
            },
            replicate: {
                name: 'Replicate',
                emoji: '🔬',
                color: 'text-comic-blue',
                placeholder: 'r8_...',
                description: 'Enter your Replicate API token to access AI models'
            },
            midjourney: {
                name: 'Midjourney',
                emoji: '🎨',
                color: 'text-comic-purple',
                placeholder: 'mj_...',
                description: 'Enter your Midjourney API key for artistic image generation'
            },
            stability: {
                name: 'Stability AI',
                emoji: '🌟',
                color: 'text-comic-green',
                placeholder: 'sk-...',
                description: 'Enter your Stability AI API key for Stable Diffusion models'
            },
            huggingface: {
                name: 'Hugging Face',
                emoji: '🤗',
                color: 'text-comic-orange',
                placeholder: 'hf_...',
                description: 'Enter your Hugging Face token to access ML models'
            }
        };
        
        this.initializeElements();
        this.bindEvents();
        this.updateCharCount();
        this.setDefaultStyle();
        this.setDefaultProvider();
        this.setDefaultPanelCount();
    }

    initializeElements() {
        // Main elements
        this.promptInput = document.getElementById('prompt-input');
        this.generateBtn = document.getElementById('generate-btn');
        this.comicContainer = document.getElementById('comic-strip-container');
        this.comicPanels = document.getElementById('comic-panels');
        this.loadingAnimation = document.getElementById('loading-animation');
        this.charCount = document.getElementById('char-count');
        this.loadingProgress = document.getElementById('loading-progress');
        this.progressBar = document.getElementById('progress-bar');
        
        // Provider selection
        this.providerSelect = document.getElementById('provider-select');
        
        // Style buttons
        this.styleButtons = document.querySelectorAll('.style-btn');
        
        // Panel selection
        this.panelButtons = document.querySelectorAll('.panel-btn');
        this.panelPreview = document.getElementById('panel-preview');
        
        // Settings modal
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsModal = document.getElementById('settings-modal');
        this.closeModalBtn = document.getElementById('close-modal-btn');
        this.modalTitle = document.getElementById('modal-title');
        this.modalDescription = document.getElementById('modal-description');
        this.apiKeyContainer = document.getElementById('api-key-container');
        
        // Key management buttons
        this.saveKeyBtn = document.getElementById('save-key-btn');
        this.clearKeyBtn = document.getElementById('clear-key-btn');
        
        // Action buttons
        this.newComicBtn = document.getElementById('new-comic-btn');
        this.downloadBtn = document.getElementById('download-btn');
        
        // Dynamic API key input (will be created dynamically)
        this.currentApiKeyInput = null;
    }

    bindEvents() {
        // Prompt input events
        this.promptInput.addEventListener('input', () => this.updateCharCount());
        this.promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.generateComic();
            }
        });

        // Provider selection
        this.providerSelect.addEventListener('change', (e) => {
            this.selectedProvider = e.target.value;
        });

        // Style selection
        this.styleButtons.forEach(btn => {
            btn.addEventListener('click', () => this.selectStyle(btn));
        });

        // Panel count selection
        this.panelButtons.forEach(btn => {
            btn.addEventListener('click', () => this.selectPanelCount(btn));
        });

        // Generate button
        this.generateBtn.addEventListener('click', () => this.generateComic());

        // Settings modal events
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeModalBtn.addEventListener('click', () => this.closeSettings());
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) this.closeSettings();
        });

        // API key management
        this.saveKeyBtn.addEventListener('click', () => this.saveApiKey());
        this.clearKeyBtn.addEventListener('click', () => this.clearApiKey());

        // Action buttons
        this.newComicBtn?.addEventListener('click', () => this.createNewComic());
        this.downloadBtn?.addEventListener('click', () => this.downloadComic());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeSettings();
        });
    }

    setDefaultStyle() {
        // Set superhero style as default active
        const superheroBtn = document.querySelector('[data-style="superhero"]');
        if (superheroBtn) {
            this.selectStyle(superheroBtn);
        }
    }

    setDefaultProvider() {
        this.selectedProvider = this.providerSelect.value;
    }

    setDefaultPanelCount() {
        // Set 3 panels as default active
        const threePanelBtn = document.querySelector('[data-panels="3"]');
        if (threePanelBtn) {
            this.selectPanelCount(threePanelBtn);
        }
    }

    updateCharCount() {
        const count = this.promptInput.value.length;
        this.charCount.textContent = `${count}/500`;
        this.charCount.style.color = count > 450 ? '#FF6B6B' : '#9CA3AF';
    }

    selectStyle(selectedBtn) {
        // Remove active state from all buttons
        this.styleButtons.forEach(btn => {
            btn.classList.remove('bg-comic-orange', 'ring-4', 'ring-comic-yellow', 'scale-105', 'border-orange-300');
            btn.classList.add('bg-comic-yellow', 'border-yellow-300');
        });

        // Add active state to selected button
        selectedBtn.classList.remove('bg-comic-yellow', 'border-yellow-300');
        selectedBtn.classList.add('bg-comic-orange', 'ring-4', 'ring-comic-yellow', 'scale-105', 'border-orange-300');
        
        this.selectedStyle = selectedBtn.dataset.style;
    }

    selectPanelCount(selectedBtn) {
        // Remove active state from all panel buttons
        this.panelButtons.forEach(btn => {
            btn.classList.remove('active-panel');
        });

        // Add active state to selected button
        selectedBtn.classList.add('active-panel');
        
        this.selectedPanels = parseInt(selectedBtn.dataset.panels);
        this.updatePanelPreview();
        this.updateComicGridLayout();
    }

    updatePanelPreview() {
        this.panelPreview.textContent = `Creating ${this.selectedPanels}-panel comic strip`;
    }

    updateComicGridLayout() {
        // Update the grid layout class based on panel count
        this.comicPanels.className = `grid gap-6 comic-grid-${this.selectedPanels}`;
    }

    // API Keys management
    loadApiKeys() {
        const stored = localStorage.getItem('komickon_byok');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                console.error('Error parsing stored API keys:', error);
                return {};
            }
        }
        return {};
    }

    hasValidApiKey(provider) {
        return this.apiKeys[provider] && this.apiKeys[provider].trim().length > 0;
    }

    createDynamicApiKeyInput(provider) {
        const config = this.providers[provider];
        
        this.apiKeyContainer.innerHTML = `
            <div>
                <label for="current-api-key-input" class="block font-bangers text-lg mb-2 ${config.color} drop-shadow-sm">
                    ${config.emoji} ${config.name} API Key:
                </label>
                <input 
                    type="password" 
                    id="current-api-key-input" 
                    class="comic-input-dark w-full" 
                    placeholder="${config.placeholder}"
                    value="${this.apiKeys[provider] || ''}"
                >
                <p class="font-inter text-xs text-gray-400 mt-2">
                    ${config.description}
                </p>
            </div>
        `;
        
        this.currentApiKeyInput = document.getElementById('current-api-key-input');
    }

    saveApiKey() {
        if (!this.currentApiKeyInput) return;
        
        const keyValue = this.currentApiKeyInput.value.trim();
        
        if (keyValue) {
            this.apiKeys[this.selectedProvider] = keyValue;
            localStorage.setItem('komickon_byok', JSON.stringify(this.apiKeys));
            
            const providerName = this.providers[this.selectedProvider].name;
            this.showNotification(`💾 ${providerName} API key saved successfully!`, 'success');
        } else {
            // Remove the key if empty
            delete this.apiKeys[this.selectedProvider];
            localStorage.setItem('komickon_byok', JSON.stringify(this.apiKeys));
            
            const providerName = this.providers[this.selectedProvider].name;
            this.showNotification(`🗑️ ${providerName} API key removed`, 'info');
        }
        
        this.closeSettings();
    }

    clearApiKey() {
        if (this.currentApiKeyInput) {
            this.currentApiKeyInput.value = '';
        }
        
        delete this.apiKeys[this.selectedProvider];
        localStorage.setItem('komickon_byok', JSON.stringify(this.apiKeys));
        
        const providerName = this.providers[this.selectedProvider].name;
        this.showNotification(`🗑️ ${providerName} API key cleared`, 'info');
        this.closeSettings();
    }

    // Settings modal methods
    openSettings() {
        const provider = this.selectedProvider;
        const config = this.providers[provider];
        
        // Update modal content for selected provider
        this.modalTitle.innerHTML = `${config.emoji} ${config.name} API Key`;
        this.modalDescription.innerHTML = `🔒 Add your ${config.name} API key to generate comics. Your key is stored locally and never shared.`;
        
        // Create the appropriate input field
        this.createDynamicApiKeyInput(provider);
        
        this.settingsModal.classList.remove('hidden');
        
        // Focus the input after a short delay to ensure it's rendered
        setTimeout(() => {
            if (this.currentApiKeyInput) {
                this.currentApiKeyInput.focus();
            }
        }, 100);
    }

    closeSettings() {
        this.settingsModal.classList.add('hidden');
        this.currentApiKeyInput = null;
    }

    // Intelligent text splitting for multiple panels
    splitTextIntoSegments(text, panelCount) {
        // Remove extra whitespace and normalize
        text = text.trim().replace(/\s+/g, ' ');
        
        // Split by sentences first
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        
        if (sentences.length >= panelCount) {
            // We have enough sentences, distribute them evenly
            const segmentsPerPanel = Math.ceil(sentences.length / panelCount);
            const segments = [];
            
            for (let i = 0; i < panelCount; i++) {
                const start = i * segmentsPerPanel;
                const end = Math.min((i + 1) * segmentsPerPanel, sentences.length);
                const segment = sentences.slice(start, end).join('. ').trim();
                if (segment) {
                    segments.push(segment + (segment.endsWith('.') ? '' : '.'));
                }
            }
            
            return segments;
        } else {
            // Not enough sentences, split by clauses and phrases
            const words = text.split(' ');
            const wordsPerPanel = Math.ceil(words.length / panelCount);
            const segments = [];
            
            for (let i = 0; i < panelCount; i++) {
                const start = i * wordsPerPanel;
                const end = Math.min((i + 1) * wordsPerPanel, words.length);
                const segment = words.slice(start, end).join(' ').trim();
                if (segment) {
                    segments.push(segment);
                }
            }
            
            return segments;
        }
    }

    // Generate contextual captions for each panel
    generatePanelCaptions(segments, panelIndex) {
        const transitions = {
            0: ['Our story begins...', 'In the beginning...', 'It all started when...'],
            1: ['Meanwhile...', 'Suddenly...', 'The plot thickens...', 'Next...'],
            2: ['Then...', 'As the story unfolds...', 'The adventure continues...'],
            3: ['Finally...', 'In the end...', 'The conclusion...']
        };
        
        const transitionIndex = Math.min(panelIndex, 3);
        const availableTransitions = transitions[transitionIndex];
        const selectedTransition = availableTransitions[Math.floor(Math.random() * availableTransitions.length)];
        
        return selectedTransition;
    }

    // Generation flow with progress tracking
    async generateComic() {
        const prompt = this.promptInput.value.trim();
        
        // Check if prompt is provided
        if (!prompt) {
            this.showNotification('📝 Please enter a story prompt!', 'error');
            this.promptInput.focus();
            return;
        }

        // Check if API key is set for selected provider
        if (!this.hasValidApiKey(this.selectedProvider)) {
            const providerName = this.providers[this.selectedProvider].name;
            this.showNotification(`🔑 Please add your ${providerName} API key first!`, 'error');
            this.openSettings();
            return;
        }

        // Prevent multiple generations
        if (this.isGenerating) return;

        this.isGenerating = true;
        this.generateBtn.disabled = true;
        this.generateBtn.textContent = 'Generating...';

        // Show loading animation
        this.showLoading(true);

        try {
            // Split text into segments for panels
            const textSegments = this.splitTextIntoSegments(prompt, this.selectedPanels);
            
            // Log generation details
            console.log(`🤖 Using ${this.providers[this.selectedProvider].name} for ${this.selectedPanels}-panel generation`);
            console.log('📝 Text segments:', textSegments);
            
            // Create the generation payload
            const payload = {
                text: prompt,
                style: this.selectedStyle,
                apiKey: this.apiKeys[this.selectedProvider],
                provider: this.selectedProvider,
                panels: this.selectedPanels,
                segments: textSegments
            };
            
            console.log('🚀 Generation payload:', payload);
            
            // Call the appropriate provider API
            const comicPanels = await this.callProviderAPI(payload);
            
            // Display the generated comic
            this.displayComicPanels(comicPanels);
            
            this.showNotification(`⚡ POW! ${this.selectedPanels}-panel comic generated with ${this.providers[this.selectedProvider].name}!`, 'success');
            this.comicContainer.classList.remove('hidden');
            this.comicContainer.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Error generating comic:', error);
            this.showNotification(`💥 Failed to generate comic with ${this.providers[this.selectedProvider].name}. Please check your API key and try again.`, 'error');
        } finally {
            this.isGenerating = false;
            this.generateBtn.disabled = false;
            this.generateBtn.innerHTML = '<span class="relative z-10">⚡ Generate Comic! ⚡</span>';
            this.showLoading(false);
        }
    }

    async callProviderAPI(payload) {
        // Simulate progressive generation
        await this.simulateProviderGeneration(payload.segments);
        
        // In a real implementation, you would call the actual API here
        // For now, we'll create mock panels with provider-specific styling
        return this.createProviderSpecificMockPanels(payload);
    }

    async simulateProviderGeneration(segments) {
        const totalSteps = segments.length + 1;
        let currentStep = 0;
        
        // Initial setup
        this.updateProgress(0, `Connecting to ${this.providers[this.selectedProvider].name}...`);
        await this.delay(800);
        
        // Generate each panel with progress updates
        for (let i = 0; i < segments.length; i++) {
            currentStep++;
            const progress = (currentStep / totalSteps) * 100;
            this.updateProgress(progress, `Generating panel ${i + 1} with ${this.providers[this.selectedProvider].name}...`);
            await this.delay(1200); // Longer delay to simulate real API calls
        }
        
        // Final step
        this.updateProgress(100, 'Finalizing your comic...');
        await this.delay(400);
    }

    createProviderSpecificMockPanels(payload) {
        const panels = [];
        const config = this.providers[payload.provider];

        payload.segments.forEach((segment, index) => {
            // Create provider-specific image URLs (in real implementation, these would come from the API)
            const imageUrl = this.generateProviderSpecificImageUrl(payload.provider, segment, index, payload.style);
            
            panels.push({
                image: imageUrl,
                caption: this.generatePanelCaptions(payload.segments, index),
                content: segment,
                style: payload.style,
                provider: payload.provider,
                providerName: config.name,
                providerEmoji: config.emoji,
                panelNumber: index + 1
            });
        });

        return panels;
    }

    generateProviderSpecificImageUrl(provider, segment, index, style) {
        // In a real implementation, this would return the actual generated image URL from the API
        // For now, we'll create different placeholder images based on the provider
        const providerColors = {
            openai: '4169E1',      // Royal blue
            replicate: '10B981',   // Emerald
            midjourney: '8B5CF6',  // Violet
            stability: 'F59E0B',   // Amber
            huggingface: 'EF4444'  // Red
        };
        
        const color = providerColors[provider] || '6B7280';
        const providerText = `${provider.toUpperCase()}+${style.toUpperCase()}+Panel+${index + 1}`;
        
        return `https://img-wrapper.vercel.app/image?url=https://placehold.co/400x500/${color}/FFFFFF?text=${providerText}`;
    }

    updateProgress(percentage, message) {
        this.progressBar.style.width = `${percentage}%`;
        this.loadingProgress.textContent = message;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    displayComicPanels(panels) {
        this.comicPanels.innerHTML = '';
        this.updateComicGridLayout();
        
        panels.forEach((panel, index) => {
            const panelElement = this.createPanelElement(panel, index);
            this.comicPanels.appendChild(panelElement);
            
            // Add reveal animation with delay
            setTimeout(() => {
                panelElement.classList.add('comic-panel-reveal-dark');
            }, index * 300);
        });
    }

    createPanelElement(panel, index) {
        const panelDiv = document.createElement('div');
        panelDiv.className = 'comic-panel-sm-dark transform hover:scale-105 transition-transform duration-200';
        
        panelDiv.innerHTML = `
            <div class="relative">
                <img 
                    src="${panel.image}" 
                    alt="Comic panel ${panel.panelNumber} - ${panel.content}"
                    class="w-full h-64 object-cover rounded border-2 border-gray-400"
                    loading="lazy"
                >
                <div class="absolute top-2 right-2 bg-gray-800 border-2 border-gray-400 rounded px-2 py-1">
                    <span class="font-bangers text-sm text-white">${panel.panelNumber}</span>
                </div>
                <div class="absolute top-2 left-2 bg-comic-blue border-2 border-gray-400 rounded px-2 py-1">
                    <span class="font-bangers text-xs text-white">${panel.style.toUpperCase()}</span>
                </div>
                <div class="absolute bottom-2 right-2 bg-gray-900 border-2 border-gray-400 rounded px-2 py-1 flex items-center gap-1">
                    <span class="text-xs">${panel.providerEmoji}</span>
                    <span class="font-bangers text-xs text-comic-yellow">${panel.provider.toUpperCase()}</span>
                </div>
            </div>
            <div class="mt-3 space-y-2">
                <div class="p-2 bg-comic-yellow border-2 border-gray-800 rounded">
                    <p class="font-inter text-sm text-center font-medium text-black italic">"${panel.caption}"</p>
                </div>
                <div class="p-2 bg-gray-700 border-2 border-gray-500 rounded">
                    <p class="font-inter text-xs text-center text-gray-200">${panel.content}</p>
                </div>
            </div>
        `;
        
        return panelDiv;
    }

    showLoading(show) {
        if (show) {
            this.loadingAnimation.classList.remove('hidden');
            this.progressBar.style.width = '0%';
        } else {
            this.loadingAnimation.classList.add('hidden');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 transform transition-transform duration-300 translate-x-full`;
        
        const bgColor = type === 'error' ? 'bg-comic-red' : 
                       type === 'success' ? 'bg-comic-green' : 'bg-comic-blue';
        
        notification.innerHTML = `
            <div class="comic-panel-sm-dark ${bgColor} text-white">
                <div class="flex items-center gap-3">
                    <span class="text-xl">
                        ${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}
                    </span>
                    <span class="font-inter font-medium">${message}</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Action methods
    createNewComic() {
        this.promptInput.value = '';
        this.updateCharCount();
        this.comicContainer.classList.add('hidden');
        this.promptInput.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    downloadComic() {
        this.showNotification(`📥 Downloading ${this.selectedPanels}-panel comic created with ${this.providers[this.selectedProvider].name}...`, 'info');
        
        // Future implementation would:
        // 1. Create a canvas element with dark theme
        // 2. Draw all comic panels onto it in the selected layout
        // 3. Convert to blob and trigger download with proper filename
        // 4. Include panel count, style, and provider in filename
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KomicKon();
});

// Fun easter egg - Konami code (enhanced for dark theme)
document.addEventListener('keydown', (e) => {
    const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
    if (!window.konamiProgress) window.konamiProgress = 0;
    
    if (e.keyCode === konamiCode[window.konamiProgress]) {
        window.konamiProgress++;
        if (window.konamiProgress === konamiCode.length) {
            // Dark theme easter egg effect
            document.body.style.transform = 'rotate(360deg)';
            document.body.style.transition = 'transform 2s ease-in-out';
            document.body.style.filter = 'hue-rotate(180deg) brightness(1.5)';
            setTimeout(() => {
                document.body.style.transform = '';
                document.body.style.transition = '';
                document.body.style.filter = '';
            }, 2000);
            window.konamiProgress = 0;
        }
    } else {
        window.konamiProgress = 0;
    }
});
