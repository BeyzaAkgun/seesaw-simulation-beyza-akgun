# Seesaw Simulation

A pure JavaScript physics simulation of a playground seesaw where users can drop objects with random weights and watch the seesaw tilt based on torque calculations.

## Project Overview

This project implements an interactive seesaw simulation with realistic physics. Users can click anywhere on the seesaw plank to drop objects with random weights (1-10kg), and the seesaw responds by tilting based on torque calculations.

## Live Demo
[View Live Simulation](https://beyzaakgun.github.io/seesaw-simulation-beyza-akgun/)

## Features

- **Real Physics Simulation**: Calculates torque using weight × distance from pivot
- **Smooth Animations**: CSS transitions for natural movement
- **Persistent State**: Saves progress using localStorage
- **Visual Scale**: Ruler showing distance from center
- **History Log**: Tracks all interactions
- **Responsive Design**: Clean, modern UI

## Implementation Details

### Core Logic
- **Torque Calculation**: `torque = weight × distance`
- **Angle Calculation**: Capped at ±30° based on net torque
- **Pivot Point**: Fixed at the center of the 400px plank
- **Object Placement**: Click position converted to distance from center

### Technical Decisions
1. **Pure JavaScript**: No frameworks or external libraries
2. **CSS Transforms**: Smooth rotation animations using `transform: rotate()`
3. **Event Delegation**: Single click handler for the entire plank area
4. **Promise-based Animation**: Ensures objects drop before recalculating physics

### Key Functions
- `calculateTorque()`: Computes left/right torque and determines tilt angle
- `createAnimatedObject()`: Handles object creation with drop animation
- `rotatePlank()`: Applies smooth rotation to the seesaw
- `saveToLocalStorage()`: Persists state between sessions

## AI Usage

The main implementation code, physics logic, and core functionality were hand-coded independently. AI assistance was limited to:

- **Animation Timing**: Consulted for CSS cubic-bezier values and keyframe animations
- **Debugging Help**: Minor assistance with animation sequencing issues
- **Syntax References**: Occasionally for CSS transform properties and localStorage methods

## Design Choices

- **Color Scheme**: Earth tones for the plank with vibrant object colors for visibility
- **Visual Hierarchy**: Clear data panel with emphasized metrics
- **User Feedback**: History log provides immediate feedback on interactions
- **Smooth Transitions**: Cubic-bezier timing functions for natural movement

## Setup

Simply open `index.html` in a web browser or visit the GitHub Pages deployment.
