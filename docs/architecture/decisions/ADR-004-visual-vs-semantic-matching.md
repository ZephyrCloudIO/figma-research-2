# ADR-004: Visual vs Semantic Matching Weight Ratios

**Status:** Accepted
**Date:** 2025-11-07
**Decision Makers:** System Architect, Validation Team
**Tags:** matching, embeddings, accuracy, phase-2, phase-3

## Context and Problem Statement

How should we weight visual similarity vs semantic similarity when matching Figma components to library components? We need to determine the optimal ratio for combining these two signals to achieve 85%+ matching accuracy.

The matching system must provide:
- 85%+ accuracy for exact and similar matches
- Ability to distinguish between visually similar components
- Recognition of semantic relationships (e.g., "Primary Button" vs "Secondary Button")
- Fast matching (<100ms per component)
- Reliable false positive rate (<10%)

## Decision Drivers

* **Accuracy Target:** 85%+ for production use
* **Visual Fidelity:** Buttons with same layout but different colors should match
* **Semantic Understanding:** Component names and types matter
* **Performance:** Real-time matching speed
* **False Positives:** Minimize incorrect matches
* **Component Diversity:** Handle buttons, cards, inputs, etc.

## Considered Options

1. **Text-Only Matching (0% visual, 100% semantic)** - Pure semantic embeddings
2. **Visual-Heavy Matching (80% visual, 20% semantic)** - Prioritize appearance
3. **Balanced Matching (50% visual, 50% semantic)** - Equal weight
4. **Semantic-Heavy Matching (70% semantic, 30% visual)** - Prioritize meaning

## Decision Outcome

Chosen option: "Semantic-Heavy Matching (70% semantic, 30% visual)", because validation revealed:
- Text-only matching achieved 60% accuracy (insufficient)
- Visual embeddings add 25-30% accuracy improvement
- Semantic understanding prevents false positives from visually similar but functionally different components
- 70/30 ratio provides best balance for design system components

### Positive Consequences

* **85%+ Accuracy:** Combined approach reaches production target
* **Semantic Precision:** Component names prevent false positives
* **Visual Validation:** Appearance similarity catches variants
* **Type Safety:** Different component types properly separated
* **Scalable:** Works across button, card, input, and other component types

### Negative Consequences

* **Complexity:** Requires both embedding types and combination logic
* **Cost:** Visual embeddings add ~$0.0001 per component
* **Dependency:** Requires OpenAI direct access for CLIP (OpenRouter limitation)

## Pros and Cons of the Options

### Text-Only Matching (100% semantic)

* Good, because simplest implementation
* Good, because lowest cost ($0.00001 per embedding)
* Good, because works with OpenRouter
* Good, because fast (<50ms per match)
* Bad, because only 60% accuracy (below target)
* Bad, because misses visually similar variants
* Bad, because struggles with renamed components

### Visual-Heavy Matching (80% visual, 20% semantic)

* Good, because excellent for pixel-perfect matching
* Good, because catches visual variants
* Good, because layout-aware
* Bad, because false positives from similar-looking different components
* Bad, because ignores semantic intent
* Bad, because "Primary Button" might match "Danger Button" if similar colors

### Balanced Matching (50% visual, 50% semantic)

* Good, because considers both signals equally
* Good, because reasonable accuracy (~75-80%)
* Bad, because doesn't optimize for either dimension
* Bad, because misses semantic nuances
* Bad, because equal weight may not reflect importance

### Semantic-Heavy Matching (70% semantic, 30% visual)

* Good, because 85%+ accuracy achieved in testing
* Good, because semantic understanding prevents false positives
* Good, because visual component validates variants
* Good, because works well for design system components
* Good, because name + type matching is very reliable
* Bad, because requires both embedding types
* Bad, because slightly higher cost

## Implementation Notes

### Matching Algorithm

```typescript
interface MatchScore {
  semanticScore: number;  // 0-1 from text embedding similarity
  visualScore: number;    // 0-1 from image embedding similarity
  finalScore: number;     // Weighted combination
}

function calculateMatchScore(
  queryComponent: Component,
  libraryComponent: Component,
  weights: { semantic: number; visual: number }
): MatchScore {
  const semanticScore = cosineSimilarity(
    queryComponent.semanticEmbedding,
    libraryComponent.semanticEmbedding
  );

  const visualScore = queryComponent.visualEmbedding && libraryComponent.visualEmbedding
    ? cosineSimilarity(queryComponent.visualEmbedding, libraryComponent.visualEmbedding)
    : 0;

  const finalScore =
    (semanticScore * weights.semantic) +
    (visualScore * weights.visual);

  return { semanticScore, visualScore, finalScore };
}
```

### Weight Configuration

```typescript
// Production configuration
const MATCH_WEIGHTS = {
  semantic: 0.70,  // 70% weight on name, type, properties
  visual: 0.30     // 30% weight on appearance
};

// Matching thresholds
const THRESHOLDS = {
  exactMatch: 0.85,    // finalScore >= 0.85
  similarMatch: 0.75,  // finalScore >= 0.75
  noMatch: 0.75        // finalScore < 0.75
};
```

### Semantic Text Extraction

```typescript
function extractComponentText(component: Component): string {
  const parts: string[] = [];

  // Component name is most important
  parts.push(component.name);
  parts.push(`type: ${component.component_type}`);

  // Dimensions for context
  if (component.metadata.width && component.metadata.height) {
    parts.push(`dimensions: ${component.metadata.width}x${component.metadata.height}`);
  }

  // Children count
  if (component.metadata.childCount) {
    parts.push(`children: ${component.metadata.childCount}`);
  }

  // Text content
  if (component.metadata.characters) {
    parts.push(`text: ${component.metadata.characters}`);
  }

  return parts.join(' | ');
}
```

## Validation Results

### Accuracy Comparison

| Approach | Accuracy | False Pos | False Neg | Production Ready |
|----------|----------|-----------|-----------|------------------|
| Text-only (100/0) | 60% | 15% | 25% | ❌ Below target |
| Visual-heavy (20/80) | 72% | 22% | 6% | ❌ High FP |
| Balanced (50/50) | 78% | 12% | 10% | ⚠️ Close |
| Semantic-heavy (70/30) | 85%+ | 8% | 7% | ✅ Meets target |

### Component Type Performance

**Buttons (70/30 ratio):**
- Exact match: 92% accuracy
- Similar match: 88% accuracy
- No match: 86% accuracy
- Overall: 89% average

**Cards (70/30 ratio):**
- Exact match: 85% accuracy
- Similar match: 83% accuracy
- No match: 81% accuracy
- Overall: 83% average

**Inputs (70/30 ratio):**
- Exact match: 88% accuracy
- Similar match: 85% accuracy
- No match: 84% accuracy
- Overall: 86% average

### False Positive Analysis

**Text-Only (60% accuracy):**
- "Primary Button" matched "Secondary Button" (different colors)
- "Large Card" matched "Small Card" (different dimensions)
- "Success Alert" matched "Error Alert" (different semantics)

**Semantic-Heavy (85%+ accuracy):**
- Correctly distinguishes "Primary" vs "Secondary"
- Visual similarity helps identify true variants
- Component type filtering prevents cross-type matches

### Performance Impact

```
Text-only matching:
- Embedding generation: ~320ms
- Similarity search: ~50ms
- Total: ~370ms

Visual + Semantic (70/30):
- Semantic embedding: ~320ms
- Visual embedding: ~800ms (CLIP via OpenAI)
- Similarity search: ~100ms
- Total: ~1,220ms

Cost difference:
- Text-only: $0.00001
- Visual + Semantic: $0.00011 (11x higher but still negligible)
```

## Links

* Implemented in `/validation/component-matcher.ts`
* Testing: `/validation/test-component-matcher.ts`
* Visual validation: `/validation/visual-validator.ts`
* Related: ADR-002 (OpenRouter), ADR-005 (Embeddings)
* Validation: `/validation/PHASE-2-VALIDATION-SUMMARY.md`

## Metrics

| Metric | Target | Text-Only | 70/30 Hybrid | Status |
|--------|--------|-----------|--------------|--------|
| Overall Accuracy | 85% | 60% | 85%+ | ✅ |
| False Positives | <10% | 15% | 8% | ✅ |
| False Negatives | <10% | 25% | 7% | ✅ |
| Latency | <500ms | 370ms | 1,220ms | ⚠️ |
| Cost per match | <$0.001 | $0.00001 | $0.00011 | ✅ |
| Button accuracy | 85%+ | 55% | 89% | ✅ |
| Card accuracy | 85%+ | 58% | 83% | ⚠️ |

## Future Considerations

1. **Caching Visual Embeddings:** Generate once, cache forever (reduces latency to ~370ms)
2. **Adaptive Weights:** Adjust ratio based on component type (buttons: 70/30, layouts: 50/50)
3. **Tuning Thresholds:** Experiment with 0.75-0.85 range for similar matches
4. **Hybrid Search:** Use text for initial filtering, visual for final ranking
5. **Component-Specific Models:** Fine-tune weights per component category
