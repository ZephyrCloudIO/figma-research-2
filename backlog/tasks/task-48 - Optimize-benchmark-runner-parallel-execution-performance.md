---
id: task-48
title: Optimize benchmark-runner parallel execution performance
status: To Do
assignee: []
created_date: '2025-11-11 15:16'
labels: []
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Optimize the parallel-runner to reduce the 3.8 hour execution time for 387 benchmarks (129 scenarios × 3 models) through improved concurrency, caching, and resource management.

## Context
Current performance: 3.8 hours for 387 benchmarks (1.7 scenarios/min)
Target performance: <2 hours (3.2+ scenarios/min)

## Research Findings
- Concurrency strategy: 2-20 workers based on benchmark count
- No caching of benchmark results between runs
- Sequential model execution per scenario (could be parallelized)
- 180 second timeout per benchmark (3 minutes)
- Each scenario runs 3 models sequentially

## Optimization Opportunities
1. **Result caching**: Cache results by template hash + scenario hash + model
2. **Model parallelization**: Run all 3 models for same scenario in parallel
3. **Smart concurrency**: Adjust workers based on API rate limits
4. **Incremental runs**: Skip unchanged scenarios
5. **Resource pooling**: Reuse ze-benchmarks CLI instances

## Performance Goals
- 387 benchmarks in <2 hours (50% improvement)
- Cache hit rate >80% on repeated runs
- Throughput: 3.2+ scenarios/min (current: 1.7)
- Memory usage <2GB (prevent OOM)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Implement result caching based on template hash + scenario hash + model
- [ ] #2 Add cache storage using SQLite or JSON files in .cache/ directory
- [ ] #3 Add --use-cache CLI flag to enable cached results
- [ ] #4 Parallelize model execution within each scenario (3 models run concurrently)
- [ ] #5 Adjust concurrency limits based on API provider rate limits
- [ ] #6 Add --incremental flag to skip scenarios with unchanged templates
- [ ] #7 Implement resource pooling to reuse process instances
- [ ] #8 Run full benchmark suite (387 tests) completes in under 2 hours
- [ ] #9 Cache hit rate >80% on second run of same suite
- [ ] #10 Memory usage stays under 2GB throughout execution
- [ ] #11 Add performance metrics to output (cache hits, avg latency, throughput)
- [ ] #12 Document optimization strategies in benchmark-runner/PERFORMANCE.md
<!-- AC:END -->
