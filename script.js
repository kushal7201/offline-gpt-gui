document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const systemPrompt = document.getElementById('systemPrompt');
    const updatePromptBtn = document.getElementById('updatePromptBtn');
    const scrollBottom = document.getElementById('scrollBottom');
    const scrollBottomBtn = document.getElementById('scrollBottomBtn');
    const updateNotification = document.getElementById('updateNotification');

    // Add function to load the model
    async function loadModel() {
        try {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'bot-message');
            messageDiv.textContent = 'Loading model "devins"... Please wait.';
            chatContainer.appendChild(messageDiv);
    
            // First, send the load command
            const loadResponse = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'devins',
                    messages: [
                        { role: 'user', content: '/load devins' }
                    ]
                })
            });
    
            if (!loadResponse.ok) {
                throw new Error(`HTTP error! status: ${loadResponse.status}`);
            }
    
            // Wait a moment for the model to load
            await new Promise(resolve => setTimeout(resolve, 1000));
    
            // Check if model is loaded
            const checkResponse = await fetch('http://localhost:11434/api/tags');
            const tags = await checkResponse.json();
            
            if (tags.models && tags.models.includes('devins')) {
                messageDiv.textContent = 'Model "devins" loaded successfully! You can now start chatting.';
            } else {
                throw new Error('Model not found after loading attempt');
            }
    
        } catch (error) {
            const messageDiv = document.createElement('div');
            // messageDiv.classList.add('message', 'bot-message');
            // messageDiv.innerHTML = `Error: Could not load model. Make sure Ollama is running and the model is installed.<br>You can install it with: <code>ollama pull devins</code>`;
            chatContainer.appendChild(messageDiv);
            console.error('Error loading model:', error);
        }
    }

    // Call loadModel when the page loads
    loadModel();

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent newline when just Enter is pressed
            sendMessage();
        }
    });
    
    function autoResize() {
        const textarea = document.getElementById('userInput');
        // Reset height to allow shrinking
        textarea.style.height = 'auto';
        
        // Get the computed max height
        const maxHeight = parseInt(window.getComputedStyle(textarea).maxHeight);
        
        // Calculate new height
        const newHeight = Math.min(textarea.scrollHeight, maxHeight);
        
        // Apply the new height
        textarea.style.height = newHeight + 'px';
        
        // Show/hide scrollbar based on content
        textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
    
    userInput.addEventListener('input', autoResize);
    
    // Also trigger on key events to catch Enter and Delete
    userInput.addEventListener('keyup', autoResize);
    userInput.addEventListener('keydown', autoResize);

    // Initial resize in case there's content
    autoResize();

    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessageToChat('user', message);
        userInput.value = '';

        // Send to Ollama and get response
        fetchOllamaResponse(message);
    }

    function addMessageToChat(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);

        // If it's a bot message, process for markdown formatting
        if (sender === 'bot') {
            messageDiv.innerHTML = formatMessage(message);
            // Apply syntax highlighting to code blocks
            messageDiv.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        } else {
            messageDiv.textContent = message;
        }

        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Update button notification
    updatePromptBtn.addEventListener('click', () => {
        localStorage.setItem('systemPrompt', systemPrompt.value);
        updateNotification.classList.remove('hidden');
        setTimeout(() => {
            updateNotification.classList.add('hidden');
        }, 3000);
    });

    // Load saved system prompt if exists
    const savedPrompt = localStorage.getItem('systemPrompt');
    if (savedPrompt) {
        systemPrompt.value = savedPrompt;
    }

    chatContainer.addEventListener('click', (event) => {
        const copyBtn = event.target.closest('.copy-code-btn');
        if (copyBtn) {
            const codeBlock = copyBtn.closest('.code-block');
            // Find the hidden textarea containing the raw code
            const rawCodeTextArea = codeBlock.querySelector('.raw-code');
            if (rawCodeTextArea) {
                const codeToCopy = rawCodeTextArea.value;
                navigator.clipboard.writeText(codeToCopy).then(() => {
                    // Visual feedback: change button text
                    const btnSpan = copyBtn.querySelector('span');
                    const originalText = btnSpan.textContent;
                    btnSpan.textContent = 'Copied!';
                    copyBtn.disabled = true; // Disable button briefly
                    setTimeout(() => {
                        btnSpan.textContent = originalText;
                        copyBtn.disabled = false; // Re-enable button
                    }, 2000); // Reset after 2 seconds
                }).catch(err => {
                    console.error('Failed to copy code: ', err);
                    // Optional: Provide error feedback to the user
                    const btnSpan = copyBtn.querySelector('span');
                    btnSpan.textContent = 'Error';
                     setTimeout(() => {
                        btnSpan.textContent = 'Copy';
                    }, 2000);
                });
            } else {
                console.error('Could not find raw code textarea for copying.');
            }
        }
    });

    // Scroll handling
    chatContainer.addEventListener('scroll', () => {
        const isScrolledUp = chatContainer.scrollTop + chatContainer.clientHeight < chatContainer.scrollHeight - 10;
        scrollBottom.classList.toggle('hidden', !isScrolledUp);
    });

    scrollBottomBtn.addEventListener('click', () => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    });

    async function fetchOllamaResponse(prompt) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'bot-message');
        chatContainer.appendChild(messageDiv);
    
        try {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'devins',
                    prompt: `${systemPrompt.value}\n\nUser: ${prompt}\nAssistant:`,
                    stream: true
                })
            });
    
            let fullResponse = '';
            const reader = response.body.getReader();
    
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
    
                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());
    
                for (const line of lines) {
                    const data = JSON.parse(line);
                    fullResponse += data.response;
                    messageDiv.innerHTML = formatMessage(fullResponse);
    
                    // Apply syntax highlighting to new code blocks
                    messageDiv.querySelectorAll('pre code').forEach((block) => {
                        hljs.highlightElement(block);
                    });
    
                    // Always scroll to the latest content
                    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
            }
    
        } catch (error) {
            messageDiv.innerHTML = `Error: Could not connect to Ollama. Make sure it's running with the command: ollama run llama3.2`;
            console.error('Error:', error);
        }
    }
    
});

function formatMessage(message) {
    // 1. Extract code blocks and store them with placeholders
    const codeBlocks = [];
    let tempMessage = message.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        const id = `__CODE_BLOCK_${codeBlocks.length}__`;
        // Store the raw code and language
        codeBlocks.push({
            id: id,
            lang: lang.toLowerCase().trim() || 'text',
            rawCode: code // Store the original, unescaped code
        });
        return id; // Replace the block with a placeholder
    });

    // 2. Escape HTML characters in the remaining text (outside code blocks)
    let textContent = tempMessage.replace(/[&<>"']/g, (char) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[char]));

    // 3. Apply Bold/Italic formatting to the text content
    textContent = textContent
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 4. Convert newlines (\n) to <br> ONLY in the text content
    textContent = textContent.replace(/\n/g, '<br>');

    // 5. Restore the code blocks, formatting them for display
    let finalMessage = textContent;
    codeBlocks.forEach(({ id, lang, rawCode }) => {
        // Escape the raw code *for display* inside the <pre><code> block
        const escapedCodeForDisplay = rawCode.replace(/[&<>"']/g, char => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[char]));

        // Create the HTML structure for the code block
        const codeBlockHTML = `
            <div class="code-block" data-language="${lang}">
                <div class="code-header">
                    <span class="language-name">${lang}</span>
                    <button class="copy-code-btn" title="Copy code">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
                          <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                          <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                        </svg>
                        <span>Copy</span>
                    </button>
                </div>
                <pre><code class="language-${lang}">${escapedCodeForDisplay}</code></pre>
                <textarea class="raw-code" style="display:none;">${rawCode.replace(/</g, '&lt;') /* Basic escaping for textarea value */}</textarea>
            </div>
        `;
        // Replace the placeholder with the formatted code block
        finalMessage = finalMessage.replace(id, codeBlockHTML);
    });

    return finalMessage;
}