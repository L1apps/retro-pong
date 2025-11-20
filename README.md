# Retro Pong 📺

> A classic, single-player Pong game featuring retro CRT aesthetics, monochrome themes, dynamic physics, and adjustable difficulty.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker Image Version](https://img.shields.io/docker/v/l1apps/retro-pong?label=docker%20hub)
![Docker Pulls](https://img.shields.io/docker/pulls/l1apps/retro-pong)

**Docker Hub Repository:** https://hub.docker.com/r/l1apps/retro-pong
**Website:** https://l1apps.com

## 🎮 Features

- **Retro Aesthetic**: Selectable monochrome themes (Classic B&W, Terminal Green, Amber).
- **CRT Simulation**: Optional scanlines, screen flicker, curvature, and static noise.
- **Dynamic Physics**: Ball spin and speed adjustments based on paddle hits.
- **Adaptive AI**: Three difficulty levels (Easy, Medium, Hard).
- **Orientation Support**: Play in Landscape or Portrait mode.
- **Demo Mode**: Sit back and watch the AI play against itself with randomized visual effects.
- **Accessibility**: Adjustable text scaling (Small, Medium, Large) for better readability.

## 🚀 Quick Start

Use the pre-built image from Docker Hub to get the game running instantly.

### Option 1: Docker CLI

Run the game with a single command:

    docker run -d -p 2700:80 --name retro-pong --restart unless-stopped l1apps/retro-pong:latest

Open your browser and go to http://localhost:2700.

### Option 2: Docker Compose

Create a docker-compose.yml file with the following content and run docker compose up -d:

    services:
      retro-pong:
        image: l1apps/retro-pong:latest
        container_name: retro-pong
        ports:
          - "2700:80"
        restart: unless-stopped

### Option 3: Portainer

For detailed instructions on deploying via Portainer Stacks, please see PORTAINER.md.

## 📧 Support

For support or inquiries, please contact us at:
services@l1apps.com

## 📜 License

MIT License
Copyright (c) 2024 Level 1 Apps