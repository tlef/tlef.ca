---
title: When REST Gets Messy - Handling Actions in Resource-Based APIs
date: 2025-10-26
author: tlef
tags: api,rest
summary: This article summarizes strategies for handling actions that fall outside standard CRUD operations in REST APIs. It outlines five patterns—job resources, state transitions, controller endpoints, RPC-style routes, and query parameters—offering guidance on when to use each. Real-world examples and best practices stress the importance of consistency, documentation, and pragmatic design choices over strict REST compliance.
---

Every developer who's built a REST API eventually hits this wall: you need to trigger an action that doesn't fit neatly into the CREATE, READ, UPDATE, DELETE paradigm. Maybe it's importing data, sending an email, generating a report, or restarting a server. Suddenly, your clean resource-based design feels inadequate.

So what do you do? Abandon REST? Squeeze square pegs into round holes? Let's explore how to handle actions in REST APIs while maintaining clean, intuitive design.

## The REST Purist's Dilemma

REST (Representational State Transfer) is inherently resource-oriented. Every URL represents a resource, and HTTP methods define what you're doing to that resource:

- `GET /users/123` - Read user 123
- `POST /users` - Create a new user
- `PUT /users/123` - Update user 123
- `DELETE /users/123` - Delete user 123

This works beautifully for data manipulation. But what about:

- Sending a password reset email?
- Running a data import?
- Generating a PDF report?
- Executing a database backup?

These are actions, not resources. And this is where developers start sweating.

## Pattern 1: Actions as Resource Creation (The Purist's Choice)

The most RESTful approach treats actions as resources themselves. Instead of "running an import," you "create an import job."

```http
POST /api/imports
Content-Type: application/json

{
  "source": "https://example.com/data.csv",
  "format": "csv",
  "mapping": {
    "name": "column_1",
    "email": "column_2"
  }
}
```

Response:

```http
HTTP/1.1 201 Created
Location: /api/imports/550e8400-e29b-41d4-a716

{
  "id": "550e8400-e29b-41d4-a716",
  "status": "pending",
  "created_at": "2024-08-25T10:30:00Z",
  "estimated_completion": "2024-08-25T10:35:00Z"
}
```

Now you can check the status:

```http
GET /api/imports/550e8400-e29b-41d4-a716
```

This pattern shines for:

- **Long-running operations** that need status tracking
- **Auditable actions** where you need history
- **Async processes** that return immediately
- **Complex operations** with multiple steps

Real-world example: Stripe's API creates "payment intent" resources rather than directly "charging" cards.

## Pattern 2: State Transitions (The Elegant Reframe)

Sometimes you can reframe an action as a state change on an existing resource:

Instead of:

```http
POST /api/servers/123/restart  # ❌ Action-oriented
```

Try:

```http
PATCH /api/servers/123
Content-Type: application/json

{
  "desired_state": "restarting"
}
```

```typescript
constructor() {
	this.posts = {};
	this.orderedKeys = [];

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const postsDir = path.resolve(__dirname, '../../posts');
	this.posts = {};

	const files = fs
		.readdirSync(postsDir)
		.filter((f: string) => f.endsWith('.md'));

	for (const file of files) {
		const filePath = path.join(postsDir, file);
		const content = fs.readFileSync(filePath, 'utf-8');
		const parsed = parseMarkdown(content);
		const key = path.basename(file, '.md');

		this.posts[key] = {
			title: parsed.data.title,
			slug: key,
			date: parsed.data.date,
			author: parsed.data.author,
			tags: parsed.data.tags ? parsed.data.tags.split(',') : [],
			summary: parsed.data.summary,
			content: parsed.content,
		};
	}

	this.orderedKeys = Object.keys(this.posts).sort((a, b) => {
		const dateA = new Date(this.posts[a]?.date ?? 0).getTime();
		const dateB = new Date(this.posts[b]?.date ?? 0).getTime();
		return dateB - dateA;
	});
}
```

This works well when:

- The action naturally maps to a state change
- The resource has a clear lifecycle
- You're already tracking state

Another example - publishing an article:

```http
PATCH /api/articles/789
{
  "status": "published",
  "published_at": "2024-08-25T12:00:00Z"
}
```

## Pattern 3: Controller Resources (The Pragmatic Approach)

Sometimes, you just need to trigger an action. Many successful APIs use controller endpoints:

```http
POST /api/users/123/password-reset
POST /api/reports/monthly/generate
POST /api/search/reindex
```

While REST purists might cringe, this pattern is:

- **Immediately understandable** to developers
- **Simple to implement**
- **Used by major APIs** (GitHub, Google, Heroku)

The key is consistency. If you use this pattern:

- Always use POST for actions that change state
- Use a consistent naming convention (`/resource/{id}/action`)
- Document these endpoints clearly as actions
- Consider grouping under an `/actions` path for clarity

## Pattern 4: RPC-Style Endpoints (The Honest Approach)

Sometimes your API needs RPC (Remote Procedure Call) operations. Instead of contorting them into REST, you can create a dedicated RPC section:

```http
POST /api/rpc/send-welcome-email
{
  "user_id": "123",
  "template": "premium_welcome"
}

POST /api/rpc/calculate-shipping
{
  "items": [...],
  "destination": {...}
}
```

This approach:

- Clearly separates RPC from REST operations
- Sets proper expectations
- Prevents REST design pollution
- Makes the API's dual nature explicit

## Pattern 5: Query Parameters for Safe Operations

For idempotent, read-only operations that require processing:

```http
GET /api/reports/sales?format=pdf&generate=true
GET /api/data/analytics?calculate=correlation&variables=x,y
```

Use this sparingly for:

- Report generation
- Data transformation
- Calculations
- Format conversions

## Choosing the Right Pattern

Here's a decision framework:

1. **Can it be modeled as a resource?** → Create a job/task resource
2. **Is it a state transition?** → Use PATCH with state change
3. **Is it a long-running operation?** → Definitely create a resource
4. **Does it need auditing/history?** → Create a resource
5. **Is it a simple, synchronous action?** → Consider a controller endpoint
6. **Is it completely non-RESTful?** → Be honest and use RPC

## Real-World Examples

Let's see how successful APIs handle this:

**Stripe (Payment Processing)**

```http
POST /v1/payment_intents  # Creates a resource, not "charge"
```

**GitHub (Repository Management)**

```http
POST /repos/{owner}/{repo}/dispatches  # Triggers workflow
POST /repos/{owner}/{repo}/merges      # Performs merge
```

**Heroku (App Management)**

```http
POST /apps/{app}/dynos/{dyno}/actions/restart
```

**Slack (Messaging)**

```http
POST /api/chat.postMessage  # RPC-style
```

Notice how even these major APIs mix patterns based on use case.

## Best Practices

Regardless of which pattern you choose:

1. **Be Consistent**: Pick patterns and stick to them across your API
2. **Document Clearly**: Make it obvious which endpoints are actions
3. **Use Appropriate HTTP Methods**: POST for state changes, GET for safe operations
4. **Return Appropriate Status Codes**: 202 Accepted for async, 201 Created for resources
5. **Provide Feedback**: Return job IDs, status endpoints, or immediate results
6. **Version Thoughtfully**: Action endpoints often change; plan for versioning

## The Bottom Line

REST is a guideline, not a religion. Your API's usability matters more than REST purity. The best API is one that:

- Developers can understand quickly
- Maintains internal consistency
- Solves real problems efficiently
- Documents its patterns clearly

Don't let REST perfectionism prevent you from shipping a useful API. Even Roy Fielding, who defined REST, has said that most "REST" APIs aren't truly RESTful—and that's fine.

Choose patterns that make sense for your use cases, be consistent in their application, and document them well. Your API consumers will thank you for prioritizing clarity and functionality over architectural purity.

## Further Reading

- [REST API Design: Resource Modeling](https://www.thoughtworks.com/insights/blog/rest-api-design-resource-modeling)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- [Google API Design Guide](https://cloud.google.com/apis/design)
- [Stripe's API Design](https://stripe.com/blog/api-design)
