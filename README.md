# ContextForge

### Turn messy project requirements into an actionable build plan.

ContextForge is a private on-device requirements analysis tool powered by Tether's QVAC SDK.

Paste unstructured project requirements and ContextForge transforms them into:

- Project goal
- Structured requirements
- Technical architecture
- Ordered build plan
- Questions and ambiguities

All AI inference runs locally through QVAC using Qwen3 0.6B Q4.

## Features

- Local AI inference
- Requirements extraction
- Architecture planning
- Ordered implementation planning
- Ambiguity detection
- No cloud AI API
- Lightweight Node.js backend
- Browser-based interface
- JSON-structured model output

## Technology

- Node.js
- Express
- HTML / CSS / JavaScript
- Tether QVAC SDK 0.19.1
- Qwen3 0.6B Q4

## Requirements

- Windows 10/11
- Node.js 22.17+
- npm 10.9+
- Vulkan-capable GPU recommended
- 4 GB+ RAM recommended

## Installation

Clone the repository:

    git clone https://github.com/rishisin89-create/contextforge.git
    cd contextforge

Install dependencies:

    npm install

## Run

Start ContextForge with the local QVAC configuration:

    QVAC_CONFIG_PATH=./qvac.config.json npm start

Then open:

    http://localhost:3000

On first use, QVAC loads the Qwen3 0.6B Q4 model locally. Subsequent runs can reuse the locally cached model.

## Example

Input:

    Build a college event management website. Students should be able to browse
    upcoming events, register for events, and receive confirmation. Organizers
    should be able to create events, manage registrations, and view attendee lists.
    The website should have a dashboard, authentication, event search, and an admin
    panel. It should work well on mobile devices.

ContextForge produces a structured implementation brief containing:

1. Project goal
2. Requirements
3. Architecture
4. Build plan
5. Questions and ambiguities

## How It Works

1. The user enters project requirements in the browser.
2. The browser sends them to the local Node.js server.
3. The server loads Qwen3 through QVAC.
4. QVAC performs inference locally.
5. The model returns structured JSON.
6. ContextForge renders the implementation brief in the browser.

The application uses QVAC's:

- loadModel()
- completion()
- unloadModel()

## Privacy

ContextForge does not use OpenAI, Gemini, Claude, OpenRouter, or another cloud AI API.

The AI analysis is performed locally through Tether's QVAC SDK.

## Author

rishisin89-create

Built as an open-source demonstration of on-device AI inference using Tether's QVAC SDK.

## License

MIT License
