I've added a new folder called personas. This contains a generic_nx_snapshot_example.json5 file. this file is the
representation of what we will call agent specialists. Those agent specialists are intended to go beyond the limitations
of agents.md files which you can research here https://agents.md/. It is not the exact content we will use, and is only
a representation of the type of structure.

Our intent is to leverage the versioning of the agent specialists themselves to validate improvements to the system
prompts, tools, personas, and capabilities.

For benchmarks, we will be using reference-repos/ze-benchmarks as our framework. Review this repository to understand
how
to structure benchmarks, how to run the benchmarks and how to interact with the benchmarks itself. We will be editing
code in this repository as well to add our benchmarks.

# Rules

1) Agent Specialist Snapshots are immutable cannot be edited under any circumstances
2) Agent Specialist Templates are editable and versioned similar to npm packages and should have semver concepts

# Tasks

You will need to do the following.
1) Create a folder called specialist_work with a node package that ingests an agent specialist template and runs the appropriate benchmarks. Benchmarks
   should be run in parallel.
2) In the folder specialist_work create a node package that ingests the agent specialist template and the benchmark scores and creates the agent
   specialist snapshot.
3) In the folder specialist_work create a dashboard to displays the diff of agent specialists and the score progress across versions.
4) Review the work that we've done in this project 'figma-research' and create a series of agent specialists for the
   tasks that we've done. It is expected that we will have multiple agent specialists.
5) Validate that our benchmarking and agent specialist versioning and ui are working as expected by artificially
   introducing prompts that are designed to make the output worse in order to validate negative impact on scores.
6) After we have validated that agent snapshots are working and that we can view scores going up and down in a
   measurable fashion we will begin to iterate.
7) Our goal is to establish prompts for each of the models that we are working with that has optimal results for our
   tasks. Validate by improved benchmarks. 
