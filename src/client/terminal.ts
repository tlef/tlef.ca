interface CommandResponse {
	actions?: string[];
	error?: string;
	text?: string;
	input?: string;
}

const INITIAL_COMMAND = 'less aboutme.json';
const INITIAL_COMMAND_DELAY_MS = 500;
const PROMPT = ':$';

type OutputType = 'output' | 'error' | 'success' | 'response' | 'input';

class Terminal {
	private container!: HTMLElement;
	private content!: HTMLElement;
	private input!: HTMLInputElement;
	private cursor!: HTMLElement;
	private backdrop: HTMLElement | null = null;
	private isOverlay: boolean = false;
	private windowToggle!: HTMLElement;
	private commandHistory: string[] = [];
	private historyIndex: number = -1;
	private originalParent: HTMLElement | null = null;
	private originalNextSibling: HTMLElement | null = null;

	constructor() {
		const terminalElement = document.getElementById('terminal');
		if (!terminalElement) {
			console.error('#terminal element not found');
			return;
		}

		this.backdrop = document.getElementById('terminal-backdrop');
		if (!this.backdrop) {
			console.error('#terminal-backdrop element not found');
		}

		// Create the container
		this.container = document.createElement('div');
		this.container.classList.add('terminal-container', 'dark');
		this.container.innerHTML = `
			<div class="title-bar">
				<div class="window-controls" id="overlayToggle">
					<button class="window-control close"></button>
					<button class="window-control minimize"></button>
					<button class="window-control maximize"></button>
				</div>
			</div>
			<div class="terminal-content" id="terminalContent"></div>
		`;
		terminalElement.appendChild(this.container);

		this.content = document.getElementById('terminalContent')!;
		this.windowToggle = document.getElementById('overlayToggle')!;

		this.initEventListeners();
		this.appendInputLine();
		this.input?.blur();

		setTimeout(async () => {
			try {
				await this.executeCommand(INITIAL_COMMAND);
				this.input?.blur();
			} catch (error) {
				console.error('Error executing initial command:', error);
				this.appendInputLine();
			}
		}, INITIAL_COMMAND_DELAY_MS);
	}

	private initEventListeners(): void {
		// Backdrop click to close overlay
		this.backdrop?.addEventListener('click', () => this.toggleOverlay(false));

		// Click the window controls to toggle overlay
		this.windowToggle?.addEventListener('click', () => this.toggleOverlay());

		// Container click to focus
		this.container.addEventListener('click', (e) => {
			e.stopPropagation();
			this.input?.focus();
		});

		// Add escape key handler for overlay
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && this.isOverlay) {
				this.toggleOverlay(false);
			}
		});
	}

	private handleInput(e: KeyboardEvent): void {
		if (e.key === 'Enter') {
			e.preventDefault();
			this.executeCommand(this.input.value);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			this.navigateHistory(1);
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			this.navigateHistory(-1);
		}
	}

	private navigateHistory(direction: number): void {
		if (this.commandHistory.length === 0) return;

		this.historyIndex += direction;
		this.historyIndex = Math.max(
			-1,
			Math.min(this.historyIndex, this.commandHistory.length - 1),
		);

		if (this.historyIndex === -1) {
			this.input.value = '';
		} else {
			if (this.commandHistory[this.historyIndex] === undefined) {
				this.historyIndex = this.commandHistory.length - 1;
			}
			this.input.value = this.commandHistory[this.historyIndex];
		}

		this.updateCursorPosition();
	}

	private async executeCommand(commandStr: string): Promise<void> {
		this.input.style.display = 'none';
		this.commandHistory.unshift(commandStr);
		this.historyIndex = -1;

		this.appendCommand(commandStr);
		this.input.value = '';

		await this.handleAPICommand(commandStr.trim());

		this.scrollToBottom();
		this.input.style.display = 'block';
		this.input?.focus();
	}

	private async handleAPICommand(command: string): Promise<void> {
		try {
			const response = await fetch('/api/command', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ command }),
			});

			if (!response.ok) throw new Error('API request failed');

			const data: CommandResponse = await response.json();

			if (data.actions) {
				data.actions.forEach((action) => {
					switch (action) {
						case 'clearTerminal':
							this.clearTerminal();
							break;
						case 'toggleFullscreen':
							this.toggleOverlay();
							break;
						default:
							this.appendOutput(`Invalid action: ${action}`, 'error');
					}
				});
			}

			if (data.error) {
				this.appendOutput(`Error: ${data.error}`, 'error');
				return;
			}

			if (data.text) {
				const encodedText = this.bbcodeToHtml(data.text);
				this.appendOutput(encodedText, 'response');
			}

			if (data.input) {
				const encodedText = this.bbcodeToHtml(data.input);
				this.appendOutput(encodedText, 'input');
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Unknown error';
			this.appendOutput(`Error: ${errorMessage}`, 'error');
		}
	}

	private updateCursorPosition(): void {
		if (!this.input || !this.cursor) return;

		// Get the input value up to the cursor position
		const cursorPosition = this.input.selectionStart || this.input.value.length;
		const textBeforeCursor = this.input.value.substring(0, cursorPosition);

		// Create a temporary element to measure text width
		const measureElement = document.createElement('span');
		measureElement.style.cssText = `
			position: absolute;
			visibility: hidden;
			white-space: pre;
			font-family: ${window.getComputedStyle(this.input).fontFamily};
			font-size: ${window.getComputedStyle(this.input).fontSize};
		`;
		measureElement.textContent = textBeforeCursor;

		document.body.appendChild(measureElement);
		const textWidth = measureElement.offsetWidth;
		document.body.removeChild(measureElement);

		// Position the cursor
		this.cursor.style.left = `${textWidth}px`;
	}

	private clearTerminal(): void {
		this.content.innerHTML = '';
		this.appendInputLine();
	}

	private bbcodeToHtml(bbcode: string): string {
		/* eslint-disable @typescript-eslint/naming-convention */
		const bbcodeToHtmlMap = {
			'\\[b\\](.*?)\\[/b\\]': '<strong>$1</strong>',
			'\\[i\\](.*?)\\[/i\\]': '<em>$1</em>',
			'\\[u\\](.*?)\\[/u\\]': '<u>$1</u>',
			'\\[url=(.*?)\\](.*?)\\[/url\\]': '<a href="$1">$2</a>',
			'\\[img\\](.*?)\\[/img\\]': '<img src="$1" alt="Image">',
			'\\[color=(.*?)\\](.*?)\\[/color\\]':
				'<span class="bb-color-$1">$2</span>',
			'\\[tab\\]': '&nbsp;&nbsp;',
			'\\n': '<br>',
		};
		/* eslint-enable @typescript-eslint/naming-convention */

		let html = bbcode;

		for (const [bbcodePattern, htmlReplacement] of Object.entries(
			bbcodeToHtmlMap,
		)) {
			const regex = new RegExp(bbcodePattern, 'gi');
			html = html.replace(regex, htmlReplacement);
		}

		return html;
	}

	private appendCommand(command: string): void {
		const inputLine = this.content.querySelector('.input-line');
		const commandLine = document.createElement('div');
		commandLine.className = 'command-line';
		commandLine.innerHTML = `<span class="terminal-prompt">${PROMPT}</span><span class="command">${this.escapeHtml(command)}</span>`;
		if (inputLine?.parentNode) {
			inputLine.parentNode.insertBefore(commandLine, inputLine);
		}
	}

	private appendOutput(text: string, type: OutputType = 'output'): void {
		const inputLine = this.content.querySelector('.input-line');
		const output = document.createElement('div');
		output.className = type;

		if (type === 'response' || type === 'input') {
			output.innerHTML = this.bbcodeToHtml(text);
		} else {
			output.textContent = this.bbcodeToHtml(text);
		}

		if (inputLine?.parentNode) {
			inputLine.parentNode.insertBefore(output, inputLine);
		}
	}

	private appendInputLine(): void {
		const existingInput = this.content.querySelector('.input-line');
		if (existingInput) {
			existingInput.remove();
		}

		const inputLine = document.createElement('div');
		inputLine.className = 'terminal-line input-line';
		inputLine.innerHTML = `
			<span class="terminal-prompt">${PROMPT}</span>
			<div class="input-wrapper">
				<input type="text" class="terminal-input" id="terminalInput" placeholder="" autocomplete="off" spellcheck="false" autocorrect="off" autocapitalize="off" data-form-type="other">
				<div class="cursor" id="cursor"></div>
			</div>
		`;

		this.content.appendChild(inputLine);

		// Re-bind input and cursor elements
		this.input = document.getElementById('terminalInput') as HTMLInputElement;
		this.cursor = document.getElementById('cursor') as HTMLElement;

		// Add event listeners
		this.input?.addEventListener('keydown', (e) => this.handleInput(e));
		this.input?.addEventListener('input', () => this.updateCursorPosition());
		this.input?.addEventListener('keyup', () => this.updateCursorPosition());
		this.input?.addEventListener('click', () => this.updateCursorPosition());
		this.input?.addEventListener('focus', () => this.updateCursorPosition());

		this.input?.focus();

		// Initial cursor position
		this.updateCursorPosition();
	}

	private scrollToBottom(): void {
		// Use requestAnimationFrame to ensure DOM is updated before scrolling
		requestAnimationFrame(() => {
			// Try container first (most likely), then content as fallback
			const targets = [
				{ name: 'container', element: this.container },
				{ name: 'content', element: this.content },
			];

			targets.forEach((target) => {
				const scrollHeight = target.element.scrollHeight;
				const clientHeight = target.element.clientHeight;
				const currentScrollTop = target.element.scrollTop;

				// Only scroll if there's content that overflows
				if (scrollHeight > clientHeight) {
					target.element.scrollTop = scrollHeight;
					console.log(
						`Scrolled ${target.name}: ${currentScrollTop} -> ${scrollHeight}`,
					);
				}
			});
		});
	}

	private escapeHtml(unsafe: any): string {
		if (typeof unsafe !== 'string') {
			return unsafe;
		}

		/* eslint-disable @typescript-eslint/naming-convention */
		const htmlEscapes: Record<string, string> = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;',
		};
		/* eslint-enable @typescript-eslint/naming-convention */
		return unsafe.replace(/[&<>"']/g, (match) => htmlEscapes[match]);
	}

	public toggleOverlay(show?: boolean): void {
		// Determine current state from backdrop, then toggle
		const currentlyActive =
			this.backdrop?.classList.contains('active') ?? false;
		this.isOverlay = show !== undefined ? show : !currentlyActive;

		// Toggle classes for terminal and backdrop
		this.container.classList.toggle('overlay', this.isOverlay);
		this.backdrop?.classList.toggle('active', this.isOverlay);

		// Apply styles for maximized state
		if (this.isOverlay) {
			// Store original parent and position for restoration
			this.originalParent = this.container.parentElement;
			this.originalNextSibling = this.container
				.nextElementSibling as HTMLElement;

			// Prevent body scroll when overlay is active
			document.body.style.overflow = 'hidden';

			// Style the backdrop to use flexbox centering
			if (this.backdrop) {
				this.backdrop.style.position = 'fixed';
				this.backdrop.style.top = '0';
				this.backdrop.style.left = '0';
				this.backdrop.style.width = '100vw';
				this.backdrop.style.height = '100vh';
				this.backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
				this.backdrop.style.zIndex = '9999';
				this.backdrop.style.display = 'flex';
				this.backdrop.style.alignItems = 'center';
				this.backdrop.style.justifyContent = 'center';
				this.backdrop.style.padding = '20px';
				this.backdrop.style.boxSizing = 'border-box';

				// Move terminal into the backdrop container
				this.backdrop.appendChild(this.container);
			}

			// Style the terminal container to be centered within the flexbox backdrop
			this.container.style.position = 'relative';
			this.container.style.top = 'auto';
			this.container.style.left = 'auto';
			this.container.style.right = 'auto';
			this.container.style.bottom = 'auto';
			this.container.style.transform = 'none';
			this.container.style.marginLeft = 'auto';
			this.container.style.marginRight = 'auto';
			this.container.style.marginTop = 'auto';
			this.container.style.marginBottom = 'auto';
			this.container.style.width = '90vw';
			this.container.style.height = '90vh';
			this.container.style.maxWidth = '1200px';
			this.container.style.maxHeight = '800px';
			this.container.style.zIndex = '10000';
			this.container.style.borderRadius = '8px';
			this.container.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
			this.container.style.flexShrink = '0';
		} else {
			// Reset styles when closing overlay
			document.body.style.overflow = '';

			// Move terminal back to its original parent
			if (this.originalParent) {
				if (this.originalNextSibling) {
					this.originalParent.insertBefore(
						this.container,
						this.originalNextSibling,
					);
				} else {
					this.originalParent.appendChild(this.container);
				}
			}

			// Reset terminal container styles
			this.container.style.position = '';
			this.container.style.top = '';
			this.container.style.left = '';
			this.container.style.right = '';
			this.container.style.bottom = '';
			this.container.style.transform = '';
			this.container.style.marginLeft = '';
			this.container.style.marginRight = '';
			this.container.style.marginTop = '';
			this.container.style.marginBottom = '';
			this.container.style.width = '';
			this.container.style.height = '';
			this.container.style.maxWidth = '';
			this.container.style.maxHeight = '';
			this.container.style.zIndex = '';
			this.container.style.borderRadius = '';
			this.container.style.boxShadow = '';
			this.container.style.flexShrink = '';

			// Reset and hide backdrop
			if (this.backdrop) {
				this.backdrop.style.display = 'none';
				this.backdrop.style.alignItems = '';
				this.backdrop.style.justifyContent = '';
				this.backdrop.style.padding = '';
				this.backdrop.style.boxSizing = '';
			}

			// Clear the stored references
			this.originalParent = null;
			this.originalNextSibling = null;
		}

		// Focus the input after toggle
		setTimeout(() => {
			this.input?.focus();
		}, 100);
	}
}

// Initialize terminal when DOM is loaded
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		new Terminal();
	});
} else {
	new Terminal();
}

// Export for potential module usage
(window as any).Terminal = Terminal;
