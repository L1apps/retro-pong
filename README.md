# Retro Pong 🎮

A modern reimagining of the classic Pong experience — complete with CRT effects, dynamic physics, adaptive AI, and retro monochrome themes. Lightweight, fast, and deployable anywhere with Docker.

![Docker Image Version](https://img.shields.io/docker/v/l1apps/retro-pong?label=Docker%20Image&style=flat-square)
![Docker Pulls](https://img.shields.io/docker/pulls/l1apps/retro-pong?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)

![Retro Pong Screenshot](https://l1apps.com/retro-pong-screenshot/)

---

## ✨ Features

- **Retro Monochrome Themes**  
  Classic Black & White, Terminal Green, and Amber.

- **CRT Simulation**  
  Optional screen curvature, flicker, scanlines, and static noise.

- **Dynamic Physics**  
  Ball speed and spin adjust based on paddle impact angle.

- **Adaptive AI**  
  Choose from Easy, Medium, and Hard modes.

- **Two Orientations**  
  Landscape or Portrait (perfect for vertical screens).

- **Demo Mode**  
  Watch AI vs. AI with randomized visual effects.

- **Accessibility Options**  
  Adjustable text scaling (Small, Medium, Large).

---

## 🚀 Getting Started

Retro Pong runs anywhere Docker runs — including Linux, Windows, macOS, NAS devices, and small home servers.

### **Option 1: Docker CLI**

Run from Docker Hub:

```bash
docker run -d -p 2700:80 --name retro-pong --restart unless-stopped l1apps/retro-pong:latest
