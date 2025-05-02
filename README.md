# Devins GPT GUI

A sleek web interface for interacting with the Devins model via Ollama, featuring real-time markdown rendering, syntax highlighting, and a responsive design.

## Features

- 🚀 Real-time streaming responses
- 💻 Code syntax highlighting with support for multiple languages
- 📋 One-click code copying
- 🌓 Automatic dark/light theme based on system preferences
- ↕️ Dynamic input box that expands with content
- 📱 Fully responsive design
- 💾 Persistent system instructions
- ⌨️ Keyboard shortcuts (Enter to send, Shift+Enter for new line)

## Prerequisites

- [Ollama](https://ollama.ai/) installed on your system
- llama3.2 model pulled (`ollama run llama3.2`)
- A modern web browser

`NOTE: Make sure ollama model llama3.2 is installed`
## Setup

1. Clone the repository:
```bash
git clone https://github.com/ksuhal7201/offline-gpt-gui.git
cd offline-gpt-gui
```

2. Give you custom instructions to the model in bash by running:
```bash
ollama run llama3.2
```

3. Save the model as devins if you haven't already:
```bash
/save devins
```

4. Open `index.html` in your web browser:
<!-- ```bash
# If you have Python installed:
python -m http.server 8000
# Then open http://localhost:8000 in your browser

# Or simply open index.html directly in your browser
``` -->

## Usage

1. The interface will automatically attempt to load the Devins model when opened
2. (Optional) Set your system instructions in the left panel
3. Type your message in the input box at the bottom
4. Press Enter or click Send to submit
5. Use Shift+Enter for new lines in your input

### Keyboard Shortcuts

- `Enter`: Send message
- `Shift + Enter`: New line in input
- `↓` (Scroll button): Scroll to latest messages

## Project Structure

```
offline-gpt-gui/
├── index.html      # Main HTML structure
├── style.css       # Styling and themes
├── script.js       # Application logic
└── README.md       # Documentation
```

## Technical Details

- Uses the Ollama API endpoint at `localhost:11434`
- Implements streaming responses for real-time interaction
- Supports markdown formatting including code blocks
- Uses highlight.js for syntax highlighting
- Stores system prompt in localStorage for persistence
- Implements responsive design with CSS variables for theming

## Browser Support

Tested and working in:
- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT LICENSE - see the [LICENSE](LICENSE)  file for details.

## Acknowledgments

- [Ollama](https://ollama.ai/) for the local LLM infrastructure
- [highlight.js](https://highlightjs.org/) for code syntax highlighting