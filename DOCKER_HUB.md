# Retro Pong - Docker Edition

## Overview
Retro Pong is a lightweight, web-based recreation of the classic arcade tennis game, wrapped in a nostalgic CRT aesthetic. Built with React, TypeScript, and Vite, this Docker image serves the optimized production build using a high-performance Nginx server.

Brought to you by **Level 1 Apps (L1Apps)**.
Website: https://l1apps.com

## Features
*   **Single Player vs AI**: Challenge a dynamic computer opponent with adaptive difficulty.
*   **CRT Effects**: Immersive scanlines, curvature, and static noise simulation.
*   **Theming**: Switch between Classic B&W, Green Phosphor, and Amber terminals.
*   **Demo Mode**: Screensaver-style self-playing mode with randomized effects.
*   **Responsive**: Seamless gameplay in both Portrait and Landscape orientations.
*   **Accessibility**: High-contrast visuals and adjustable text sizes (Small, Medium, Large).

## How to Use

### 🐳 Docker CLI
The fastest way to get started is using the Docker command line:

    docker run -d \
      -p 2700:80 \
      --name retro-pong \
      --restart unless-stopped \
      l1apps/retro-pong:latest

Navigate to http://localhost:2700 to play.

### 📦 Docker Compose
Create a docker-compose.yml file:

    services:
      retro-pong:
        image: l1apps/retro-pong:latest
        container_name: retro-pong
        ports:
          - "2700:80"
        restart: unless-stopped

Run the stack:

    docker compose up -d

### 🚢 Portainer
See the Portainer Guide in our repository for stack deployment.

## Technical Details
*   **Port**: 80 (Internal)
*   **Base Image**: Nginx Alpine
*   **Architecture**: x86_64 (amd64), arm64

## Support
Email: services@l1apps.com

## License
MIT License. Copyright (c) 2024 Level 1 Apps.