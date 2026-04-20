---
title: Test Syntax Highlighting
tags: testing,javascript,css
summary: Testing our new Prism.js syntax highlighting implementation.
---

Let's test our new Prism.js integration with various code snippets.

## JavaScript

```javascript
function greetUser(name) {
	const message = `Hello, ${name}!`;
	console.log(message);

	return {
		success: true,
		message,
		timestamp: new Date().toISOString(),
	};
}

// Arrow function example
const calculateTotal = (items) => {
	return items.reduce((sum, item) => sum + item.price, 0);
};
```

## TypeScript

```typescript
interface User {
	id: number;
	name: string;
	email: string;
	isActive: boolean;
}

class UserService {
	private users: User[] = [];

	async createUser(userData: Omit<User, 'id'>): Promise<User> {
		const newUser: User = {
			id: this.generateId(),
			...userData,
		};

		this.users.push(newUser);
		return newUser;
	}

	private generateId(): number {
		return Math.max(...this.users.map((u) => u.id), 0) + 1;
	}
}
```

## CSS

```css
.hero-section {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 4rem 2rem;
	text-align: center;
	border-radius: 0.5rem;
}

.hero-section h1 {
	font-size: clamp(2rem, 5vw, 4rem);
	color: white;
	margin-bottom: 1rem;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
	.hero-section {
		padding: 2rem 1rem;
	}
}
```

## JSON

```json
{
	"name": "my-awesome-project",
	"version": "1.0.0",
	"dependencies": {
		"prismjs": "^1.29.0",
		"marked": "^16.2.0"
	},
	"scripts": {
		"build": "tsc",
		"start": "node dist/index.js"
	}
}
```

## Bash

```bash
#!/bin/bash

# Install dependencies
npm install

# Build the project
npm run build

# Start the server
if [ "$NODE_ENV" = "production" ]; then
  npm start
else
  npm run dev
fi
```

## Inline Code

Here's some inline code: `const result = await fetch('/api/users')` and here's a variable: `userCount`.

That's it! All these code blocks should now have beautiful syntax highlighting.
