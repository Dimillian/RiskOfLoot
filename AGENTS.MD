# Risk of Loot - AI Agent Documentation

## Project Overview

Risk of Loot is a browser-based game built with TypeScript, Vite, and HTML5 Canvas. The game uses an Entity Component System (ECS) architecture for clean separation of concerns and extensibility.

## Quick Start

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
This starts the Vite development server (typically on `http://localhost:3000`). The browser should open automatically.

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Architecture

### Entity Component System (ECS)

The game uses a custom ECS implementation with the following core concepts:

#### Entities
- **Type**: `number` (unique identifier)
- Entities are created via `World.createEntity()` which returns an incrementing ID starting from 0
- **Important**: Entity ID 0 is valid! Don't use falsy checks like `if (!entity)` - use explicit null/undefined checks if needed

#### Components
- **Location**: `src/components/`
- Pure data containers (interfaces)
- Current components:
  - `Position`: `{ x: number, y: number }` - World coordinates
  - `Velocity`: `{ vx: number, vy: number }` - Movement velocity in pixels per second
  - `Renderable`: `{ color: string, radius: number }` - Visual representation

#### Systems
- **Location**: `src/systems/`
- Logic processors that operate on entities with specific components
- Systems extend the `System` base class and implement `update(deltaTime: number)`
- Current systems:
  - `InputSystem`: Maps keyboard input (WASD/Arrow keys) to velocity
  - `MovementSystem`: Applies velocity to position using delta-time
  - `RenderSystem`: Renders grid background and all entities with camera following player

#### World
- **Location**: `src/ecs/World.ts`
- Manages entities, components, and systems
- `World.update(deltaTime)` calls `update()` on all registered systems in order

## Project Structure

```
RiskOfLoot/
├── index.html              # Entry HTML with canvas element
├── package.json            # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration (strict mode)
├── vite.config.ts         # Vite configuration
└── src/
    ├── main.ts            # Application entry point
    ├── game/
    │   └── Game.ts        # Main game class, initializes world and starts game loop
    ├── ecs/               # ECS core implementation
    │   ├── Entity.ts      # Entity type definition
    │   ├── Component.ts   # ComponentRegistry for type-safe component storage
    │   ├── System.ts      # Abstract system base class
    │   └── World.ts       # ECS world manager
    ├── components/        # Component definitions
    │   ├── Position.ts
    │   ├── Velocity.ts
    │   └── Renderable.ts
    └── systems/           # System implementations
        ├── InputSystem.ts
        ├── MovementSystem.ts
        └── RenderSystem.ts
```

## Key Implementation Details

### Component Registry
- Uses `Map<ComponentType, Map<Entity, Component>>` for storage
- Components are stored by reference, so modifications persist
- Component types are string constants (e.g., `'Position'`, `'Velocity'`)

### Game Loop
- Uses `requestAnimationFrame` for smooth rendering
- Delta-time based updates for frame-rate independence
- Delta-time is clamped to max 100ms to prevent large jumps when tab is inactive

### Camera System
- Camera follows the player entity
- Camera offset = `playerPosition - (canvasWidth/2, canvasHeight/2)`
- All rendering uses world-to-screen coordinate conversion: `screenPos = worldPos - cameraOffset`
- Grid is rendered based on visible cells (viewport culling)
- Entities outside viewport are skipped for performance

### Input Handling
- Uses `e.code` for reliable key detection (physical key codes)
- Supports WASD and Arrow keys
- Prevents default behavior to avoid page scrolling
- Keys are stored in a `Set<string>` and checked each frame

### Coordinate System
- **World Coordinates**: Entities exist in infinite world space
- **Screen Coordinates**: Rendering positions relative to camera
- Player starts at world position (1000, 1000)
- Camera centers player on screen

## Adding New Features

### Adding a New Component

1. Create file in `src/components/`:
```typescript
// src/components/Health.ts
export interface Health {
  current: number;
  max: number;
}

export const HEALTH_COMPONENT = 'Health';
```

2. Add component to entity:
```typescript
componentRegistry.set<Health>(entity, HEALTH_COMPONENT, {
  current: 100,
  max: 100
});
```

### Adding a New System

1. Create file in `src/systems/`:
```typescript
// src/systems/HealthSystem.ts
import { System } from '../ecs/System.js';
import { HEALTH_COMPONENT, type Health } from '../components/Health.js';

export class HealthSystem extends System {
  update(deltaTime: number): void {
    const entities = this.componentRegistry.getEntitiesWith(HEALTH_COMPONENT);
    for (const entity of entities) {
      const health = this.componentRegistry.get<Health>(entity, HEALTH_COMPONENT);
      if (!health) continue;

      // System logic here
    }
  }
}
```

2. Register in `Game.ts`:
```typescript
this.world.addSystem(new HealthSystem(componentRegistry));
```

### Adding a New Entity

```typescript
const entity = this.world.createEntity();
const componentRegistry = this.world.getComponentRegistry();

componentRegistry.set<Position>(entity, POSITION_COMPONENT, { x: 500, y: 500 });
componentRegistry.set<Renderable>(entity, RENDERABLE_COMPONENT, {
  color: '#ff0000',
  radius: 15
});
```

## Common Patterns

### Accessing Components
```typescript
const position = componentRegistry.get<Position>(entity, POSITION_COMPONENT);
if (!position) return; // Component doesn't exist
// Use position...
```

### Finding Entities with Components
```typescript
const entities = componentRegistry.getEntitiesWith(POSITION_COMPONENT);
for (const entity of entities) {
  // Process entity
}
```

### System Update Order
Systems are updated in the order they're added. Current order:
1. InputSystem (processes input)
2. MovementSystem (applies movement)
3. RenderSystem (renders everything)

## Technical Notes

### TypeScript Configuration
- Strict mode enabled
- ES2020 target
- ESNext modules
- No emit (Vite handles compilation)

### Dependencies
- **Vite**: Build tool and dev server
- **TypeScript**: Type checking and compilation
- No runtime dependencies (pure browser APIs)

### Browser Support
- Modern browsers with ES2020 support
- Canvas API required
- Keyboard event API required

## Debugging

### Console Logs
The codebase includes debug logging in systems:
- `InputSystem`: Logs key presses and velocity updates
- `MovementSystem`: Logs position updates
- `RenderSystem`: Occasionally logs rendering positions

### Common Issues

1. **Entity ID 0 treated as falsy**: Always use explicit checks, not `if (!entity)`
2. **Components not found**: Verify component type string matches exactly
3. **Movement not working**: Check that InputSystem is registered before MovementSystem
4. **Camera not following**: Ensure RenderSystem receives playerEntity in constructor

## Future Extension Ideas

- Collision detection system
- Enemy entities with AI
- Loot/items system
- Health/damage system
- Particle effects
- Sound system
- Save/load game state
- Multiplayer support

## Code Style

- TypeScript strict mode
- Interfaces for components (no classes)
- Systems extend base `System` class
- Component types are string constants
- Use delta-time for all time-based calculations
- Prefer composition over inheritance
