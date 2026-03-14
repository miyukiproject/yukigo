# Contributing to Yukigo

Thank you for taking the time to contribute! Whether you're fixing a bug, proposing a feature, or improving the docs, every contribution helps make yukigo better for everyone.

There is very useful information in the [documentation page](https://miyukiproject.github.io/yukigo/en/getting-started.html) to understand the internal workflow of Yukigo. This will help you get started more quickly.

## Getting Started
 
1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/your-username/yukigo.git
   cd yukigo
   ```
3. **Add the upstream remote** so you can keep your fork in sync:
   ```bash
   git remote add upstream https://github.com/original-owner/yukigo.git
   ```
 
## Development Setup
 
### Prerequisites
 
- **Node.js** ≥ 18
 
### Install dependencies
 
```bash
npm install
```
 
### Run tests
 
```bash
npm test
```
 
### Build the package
 
```bash
npm run build
```

## Commit Message Convention
 
Yukigo follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(target_package): <short summary>
```
 
Common types:
 
| Type       | When to use                                      |
|------------|--------------------------------------------------|
| `feat`     | A new feature                                    |
| `fix`      | A bug fix                                        |
| `refactor` | Code change that is neither a fix nor a feature  |
| `chore`    | Build process, tooling, or dependency updates    |

**Examples:**
```
feat(python-parser): add support for optional chaining
fix(yukigo): handle null input in serialize()
feat(docs): add streaming example to README
```

Thank you again for contributing to yukigo, we really appreciate it! ❄️
