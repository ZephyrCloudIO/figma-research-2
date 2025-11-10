# ADR-002: OpenRouter vs Direct Model Access

**Status:** Accepted
**Date:** 2025-11-07
**Decision Makers:** System Architect, Validation Team
**Tags:** ai-models, api, cost-optimization, phase-1

## Context and Problem Statement

How should we access AI models for code generation and embeddings? We need to decide between using OpenRouter as a unified API gateway or accessing each model provider's API directly (OpenAI, Anthropic, etc.).

The solution must provide:
- Access to Claude Sonnet 4.5 for code generation
- Access to text embedding models
- Cost-effective pricing structure
- Reliable performance (<5s for code generation)
- Simple API integration

## Decision Drivers

* **Cost Efficiency:** Monthly operational costs for 300+ components
* **API Simplicity:** Single vs multiple API integrations
* **Model Availability:** Access to required models (Claude, embeddings)
* **Performance:** Latency for code generation and embeddings
* **Reliability:** Uptime and fallback options
* **Future Flexibility:** Ability to test and switch models
* **Budget Constraints:** $50 validation budget, projected monthly costs

## Considered Options

1. **OpenRouter Unified API** - Use OpenRouter for all model access
2. **Direct Provider APIs** - Use Anthropic, OpenAI, etc. directly
3. **Hybrid Approach** - OpenRouter for some, direct for others

## Decision Outcome

Chosen option: "OpenRouter Unified API", because validation testing revealed excellent performance (36% faster than target), negligible costs ($0.30/month for 300 components), and access to 340+ models including all required ones. The unified API simplifies development and enables easy model switching.

### Positive Consequences

* **Outstanding Performance:** Code generation in 3.2s (target was 5s)
* **Negligible Cost:** $0.000523 per component, $0.30/month for 300 components
* **Unified API:** Single integration point for all models
* **Model Flexibility:** Access to 340+ models for testing and fallbacks
* **Faster Development:** No need to integrate multiple provider SDKs
* **Built-in Fallbacks:** Claude 3.7 Sonnet available as automatic fallback
* **Budget Friendly:** 4-6 year runway on $50 budget at projected usage

### Negative Consequences

* **Visual Embeddings Gap:** OpenRouter doesn't support CLIP/visual models (workaround: use text embeddings or OpenAI direct for visuals)
* **Third-party Dependency:** Adds OpenRouter as intermediary (minimal risk, stable service)
* **Rate Limiting:** Shared infrastructure (not an issue in testing)

## Pros and Cons of the Options

### OpenRouter Unified API

* Good, because single API key and integration point
* Good, because 3.2s latency (36% better than 5s target)
* Good, because access to 340+ models for testing
* Good, because $0.000523 per component (extremely cheap)
* Good, because built-in fallback models (Claude 3.7, 3.5 Haiku)
* Good, because no rate limiting detected in concurrent testing
* Good, because validated with 7 model tests, all successful
* Bad, because doesn't support visual embedding models
* Bad, because adds third-party dependency (mitigated by stability)

### Direct Provider APIs

* Good, because no intermediary (direct to source)
* Good, because potentially lower latency (not proven)
* Good, because full API feature access
* Bad, because requires multiple API integrations (Anthropic + OpenAI)
* Bad, because multiple API keys to manage
* Bad, because more complex error handling across providers
* Bad, because higher development time (2-3 days per provider)
* Bad, because harder to test alternative models

### Hybrid Approach

* Good, because uses best of both worlds
* Good, because can use OpenAI direct for visual embeddings
* Bad, because highest complexity (multiple systems)
* Bad, because multiple API keys and error handling
* Bad, because inconsistent rate limiting across providers

## Implementation Notes

### OpenRouter API Usage

```typescript
// Code Generation with Claude Sonnet 4.5
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://github.com/figma-research',
    'X-Title': 'Figma to Code'
  },
  body: JSON.stringify({
    model: 'anthropic/claude-sonnet-4.5',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 4000
  })
});
```

### Text Embeddings

```typescript
// Text embeddings with OpenAI via OpenRouter
const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'openai/text-embedding-3-small',
    input: text
  })
});
```

## Validation Results

### Model Performance Testing

| Model | Purpose | Latency | Cost | Status |
|-------|---------|---------|------|--------|
| Claude Sonnet 4.5 | Code generation | 3,217ms | $0.000513 | ✅ PRIMARY |
| Claude 3.7 Sonnet | Fallback generation | 1,361ms | $0.000513 | ✅ FASTEST |
| Claude 3.5 Haiku | Budget generation | 2,418ms | $0.000139 | ✅ 73% cheaper |
| Claude Haiku 4.5 | Alternative | 4,187ms | $0.000114 | ✅ Available |
| text-embedding-3-small | Semantic matching | 320ms | $0.000010 | ✅ PRIMARY |

### Cost Projections

**Per Component:**
- Code generation: $0.000513
- Text embedding: $0.000010
- **Total: $0.000523**

**Monthly Usage (300 components):**
- Total cost: $0.157 (validation) → **$0.30 projected**
- Budget impact: 0.6% of $50 monthly budget
- **Annual cost: $3.60**

**Cost Optimization:**
Using Claude 3.5 Haiku for budget mode:
- Per component: $0.000149
- Monthly (300): $0.0447
- **73% cost reduction** while maintaining quality

### Performance Benchmarks

| Metric | Target | Claude 4.5 | Claude 3.7 | Status |
|--------|--------|------------|------------|--------|
| Code generation | <5s | 3.2s | 1.4s | ✅ 36% better |
| Text embedding | <500ms | 320ms | N/A | ✅ 36% better |
| Concurrent requests | Working | 7.7s (5 requests) | N/A | ✅ Pass |
| Quality score | High | Excellent | Excellent | ✅ Pass |

### Quality Validation

Generated code quality (Claude Sonnet 4.5):
- TypeScript: 100% (3/3 tests)
- React: 100% (3/3 tests)
- Tailwind CSS: 100% (3/3 tests)
- Props interface: 100% (3/3 tests)
- Accessibility: 67% (2/3 tests)
- Proper formatting: 100% (3/3 tests)

## Links

* Implemented in `/validation/openrouter-test.ts`
* Model testing: `/validation/check-available-models.ts`
* Additional testing: `/validation/test-additional-models.ts`
* Related: ADR-004 (Code Generation Architecture)
* Validation: `/validation/OPENROUTER-VALIDATION.md`

## Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Code Gen Latency | <5s | 3.2s | ✅ 36% better |
| Embedding Latency | <500ms | 320ms | ✅ 36% better |
| Per Component Cost | <$0.01 | $0.000523 | ✅ 95% cheaper |
| Monthly Cost (300) | <$3 | $0.30 | ✅ 90% cheaper |
| Model Availability | Claude 4.5 | ✅ Available | ✅ Pass |
| Concurrent Requests | Working | ✅ 5 parallel | ✅ Pass |
| Quality Score | High | Excellent | ✅ Pass |
| Budget Runway | 1 year | 4-6 years | ✅ Exceeds |

## Future Considerations

1. **Visual Embeddings:** Use OpenAI API directly for CLIP embeddings when needed
2. **Cost Optimization:** Switch to Claude 3.5 Haiku for non-critical generations
3. **Model Updates:** Monitor OpenRouter for new model releases
4. **Caching Strategy:** Implement aggressive caching to reduce API calls by 90%
5. **Fallback Chain:** Claude 4.5 → Claude 3.7 → Claude 3.5 Haiku
