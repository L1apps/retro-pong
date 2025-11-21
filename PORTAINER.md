# Deploying Retro Pong on Portainer

This guide will help you deploy **Retro Pong** using Portainer's "Stacks" feature.

## Prerequisites

*   A running instance of Portainer.
*   Access to the Docker environment within Portainer.

## Installation Steps

1.  **Log in** to your Portainer dashboard.
2.  Click on your **Environment** (e.g., local).
3.  In the left sidebar, click on **Stacks**.
4.  Click the **+ Add stack** button in the top right corner.
5.  **Name** your stack (e.g., retro-pong).
6.  In the **Web editor**, paste the following configuration:

    services:
      retro-pong:
        image: l1apps/retro-pong:latest
        container_name: retro-pong
        ports:
          - "2700:80"
        restart: unless-stopped

    > **Alternative Image Source:** You can also use the GitHub Container Registry image by replacing `image: l1apps/retro-pong:latest` with `image: ghcr.io/l1apps/retro-pong:latest`.

    > **Note:** You can change the port mapping (2700:80) if port 2700 is already in use on your server. For example, use 8080:80 to access the game on port 8080.

7.  Scroll down and click the blue **Deploy the stack** button.
8.  Wait a moment for the image to download and the container to start.

## Accessing the Game

Once the stack is deployed successfully, you can access the game by opening your web browser and navigating to:

http://<your-server-ip>:2700

(Replace <your-server-ip> with the IP address of your Portainer/Docker host).