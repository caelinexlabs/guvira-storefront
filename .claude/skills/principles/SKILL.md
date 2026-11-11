---
name: principles
description: "Index of the engineering principles. Load it whenever work is non-trivial: designing types or a signature, refactoring, debugging, planning a migration, reviewing a diff, fanning out to subagents, or deciding whether something is done. Names each principle-* skill and the condition that triggers it, so the right leaf gets read before the work starts rather than after."
---

# Principles

The `principle-*` skills each hold one engineering principle. They are `disable-model-invocation: true`, so they never load on their own. This index is the routing layer: it names every principle and the condition that fires it, so you can pick the ones that apply and read them.

## How to use this

1. Read the entries below and pick the ones whose trigger matches the work in front of you. Usually one to three. Zero is a valid answer for genuinely trivial work.
2. Read each selected leaf **in full** before acting. Invoke it as a skill (`/principle-fix-root-causes`) or read `~/.claude/skills/principle-<name>/SKILL.md` directly. Both work; reading the file is cheaper inside a subagent.
3. Apply it. Citing a principle is not reading it, and reading it is not applying it.

Do not paste the principle's text into your reply. Cite it by name where it changed a decision (`per boundary-discipline`) and let the reasoning show in the work.

When you delegate, name the principles in the subagent's prompt. A subagent does not inherit your reading, and these skills do not auto-load for it either.

## Core

- **Laziness Protocol** (`principle-laziness-protocol`). Refactoring, sizing a diff, or tempted to add abstractions, layers, or signal threading. Bias to deletion and the smallest change that solves the problem.
- **Foundational Thinking** (`principle-foundational-thinking`). Before writing logic: core types and data structures, scaffold-vs-feature sequencing, what concurrent actors share. Get the data structures right and downstream code becomes obvious.
- **Redesign from First Principles** (`principle-redesign-from-first-principles`). Integrating a new requirement into an existing design. Redesign as if it had been foundational from day one instead of bolting it on.
- **Subtract Before You Add** (`principle-subtract-before-you-add`). Sequencing an addition, refactor, or rewrite. Remove dead weight, redundant validators, and stub references first, then build on the simpler base.
- **Minimize Reader Load** (`principle-minimize-reader-load`). Reviewing or shaping code that is hard to trace. Count layers between question and answer, collapse one-caller wrappers, shrink mutable scope.
- **Outcome-Oriented Execution** (`principle-outcome-oriented-execution`). Planned rewrites and migrations with explicit phase boundaries. Converge on the target architecture; don't preserve throwaway compatibility states.
- **Experience First** (`principle-experience-first`). Product, UX, or feature-scope tradeoffs. Choose user delight over implementation convenience; fewer polished features over more rough ones.
- **Exhaust the Design Space** (`principle-exhaust-the-design-space`). A novel interaction or architectural decision with no precedent in the codebase. Build 2-3 competing prototypes and compare before committing.
- **Build the Lever** (`principle-build-the-lever`). Any non-trivial work. Build the tool that does it or proves it (codemod, script, generator) rather than working by hand. The tool is the artifact a reviewer can rerun.

## Architecture

- **Model the Domain** (`principle-model-the-domain`). Writing stateful logic, or code that branches a lot or repeats a shape assumption across files. Encode the domain in a structure instead of scattered conditionals.
- **Boundary Discipline** (`principle-boundary-discipline`). Wiring validation, error handling, or framework adapters. Guards at system boundaries, trust internal types, business logic stays pure.
- **Type System Discipline** (`principle-type-system-discipline`). Designing types or a signature in any statically-typed language. Make illegal states unrepresentable, brand semantic primitives, parse external data at boundaries.
- **Make Operations Idempotent** (`principle-make-operations-idempotent`). Commands, lifecycle steps, or loops that run amid crashes, restarts, and retries. Converge to the same end state regardless of partial prior runs.
- **Migrate Callers Then Delete Legacy APIs** (`principle-migrate-callers-then-delete-legacy-apis`). Introducing a new internal API while old callers exist. Migrate and delete in one wave instead of keeping a compatibility layer.
- **Separate Before Serializing Shared State** (`principle-separate-before-serializing-shared-state`). Concurrent actors might write the same file, branch, key, or object. Eliminate the sharing first; serialize only when one shared writer is a real invariant.

## Verification

- **Prove It Works** (`principle-prove-it-works`). After a task, before declaring done. Verify against the real artifact, not a proxy, a self-report, or "it compiles."
- **Fix Root Causes** (`principle-fix-root-causes`). Debugging. Trace each symptom to its root cause, reproduce first, ask why until you reach it, resist nil-checks that silence crashes.
- **Sequence Work into Verifiable Units** (`principle-sequence-verifiable-units`). Multi-step work and how you stack commits and PRs. Small units that each end in a check, verified before the next, ordered so the sequence proves itself.

## Delegation

- **Guard the Context Window** (`principle-guard-the-context-window`). Context filling up: large outputs, long files, repeated reads, fan-out planning. Route bulk to subagents; the main thread keeps summaries, not raw payloads.
- **Never Block on the Human** (`principle-never-block-on-the-human`). Tempted to ask "should I do X?" on reversible work. Proceed, present the result, let the human course-correct. Reserve confirmation for irreversible actions.

## Meta

- **Encode Lessons in Structure** (`principle-encode-lessons-in-structure`). You catch yourself writing the same instruction a second time, or notice a recurring correction. Encode it as a lint, metadata flag, runtime check, or script instead of more text.

## Conflicts

Principles pull against each other by design. Two common collisions:

- **Build the Lever vs. Laziness Protocol.** Build the tool when the work repeats or a reviewer needs to rerun it. Do it by hand when it is genuinely one pass.
- **Never Block on the Human vs. confirmation on irreversible actions.** Reversibility decides. Proceed on anything you can undo; stop for force-pushes to shared branches, deploys, data deletion, and outbound messages.

When two apply and disagree, name the conflict and the one you followed rather than silently picking.
