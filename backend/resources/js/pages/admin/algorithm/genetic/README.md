# Genetic Algorithm Visualization Components

Modular components for visualizing Genetic Algorithm optimization process.

## 📁 Structure

```
genetic/
├── index.tsx                  # Main component (composition)
├── exports.ts                 # Barrel exports
├── fitness-chart.tsx          # Fitness evolution chart
├── diversity-chart.tsx        # Population diversity chart
├── route-animation.tsx        # Route evolution animation
├── algorithm-parameters.tsx   # GA parameters display
└── statistics-summary.tsx     # Summary statistics
```

## 🧩 Components

### 1. **FitnessChart**

Displays fitness score evolution over generations.

- **Props**: `generations`, `fitnessScores`, `avgFitness`
- **Features**: Dual-line chart (best vs average fitness)

### 2. **DiversityChart**

Shows population diversity percentage per generation.

- **Props**: `generations`, `diversity`
- **Features**: Single-line chart showing convergence

### 3. **RouteAnimation**

Interactive animation of route evolution.

- **Props**: `generations`, `fitnessScores`, `bestRoutes`, `coordinates`
- **Features**: Play/pause controls, slider, route visualization

### 4. **AlgorithmParameters**

Displays GA configuration parameters.

- **Props**: `parameters`, `timing`
- **Features**: Grid layout with all GA settings

### 5. **StatisticsSummary**

Summary of key optimization metrics.

- **Props**: `initialFitness`, `finalFitness`, `finalDiversity`
- **Features**: Improvement calculation, key stats

## 📖 Usage

### Import Main Component

```typescript
import GAVisualization from './genetic';

<GAVisualization
  data={optimizationResult.details}
  coordinates={selectedPoints}
/>
```

### Import Individual Components

```typescript
import { FitnessChart, RouteAnimation } from './genetic/exports';

<FitnessChart
  generations={data.ga_history.generations}
  fitnessScores={data.ga_history.fitness_scores}
  avgFitness={data.ga_history.avg_fitness}
/>
```

## 🎯 Benefits

- **Modularity**: Each component has single responsibility
- **Reusability**: Components can be used independently
- **Maintainability**: Easier to update individual features
- **Testability**: Smaller components are easier to test
- **Performance**: Can optimize individual components

## 🔧 Customization

Each component accepts specific props and can be customized:

```typescript
// Custom fitness chart with different colors
<FitnessChart
  generations={generations}
  fitnessScores={scores}
  avgFitness={avg}
  // Can extend props for customization
/>
```

## 📝 Notes

- All components use shadcn/ui for consistent styling
- Charts use Recharts library
- Animation uses React hooks for state management
- Fully TypeScript typed for safety
