# Learning Games Platform TODO

## AI-Powered Game Generation

- [x] Define game content schemas for all formats (Quiz, Flashcards, Memory, etc.)
- [x] Create backend AI generation endpoint using Forge API
- [x] Implement game content storage in database
- [x] Build interactive Quiz player
- [x] Build interactive Flashcards player
- [x] Build interactive Memory game player
- [ ] Build interactive Puzzle player
- [ ] Build interactive Racing game player
- [ ] Build interactive Simulation player
- [ ] Build interactive Scenario player
- [ ] Build interactive RPG player
- [ ] Build interactive Strategy player
- [ ] Build interactive Adventure player
- [x] Connect Create page chat to AI backend
- [x] Update GameModal to render appropriate player based on format
- [x] Test AI generation for all game formats
- [x] Write unit tests for AI generation endpoints

## Create Page Redesign

- [x] Add mode toggle (Prompt vs Parameters) to Create page
- [x] Implement Prompt Mode - clean chat interface for natural language game creation
- [x] Implement Parameters Mode - structured form with dropdowns and Generate button
- [x] Update AI endpoint to handle both prompt-based and parameter-based requests
- [x] Test both creation modes with various inputs

## Fix Game Playability

- [x] Update FORMATS_BY_COMPLEXITY to only include formats with working players
- [x] Ensure all generated games use supported formats (Quiz, Flashcards, Memory)
- [x] Test that all created games are playable

## Universal Game System Architecture

### Phase 1: Game Specification Schema
- [x] Design universal game specification schema (GameSpec)
- [x] Define component types (quiz, flashcard, simulation, narrative, etc.)
- [x] Define interaction patterns (tap, drag, select, input, timer)
- [x] Define progression systems (linear, branching, open-world)
- [x] Define scoring and feedback mechanisms
- [x] Create TypeScript interfaces for all schema elements

### Phase 2: Universal Game Renderer
- [x] Build GameRenderer component that interprets GameSpec
- [x] Implement QuizComponent for question-answer interactions
- [x] Implement FlashcardComponent for card-based learning
- [x] Implement SimulationComponent for resource management games
- [x] Implement NarrativeComponent for story-driven games
- [x] Implement ChallengeComponent for time-limited challenges
- [x] Implement MatchingComponent for pair matching
- [x] Implement SortingComponent for categorization
- [x] Implement InfoComponent for educational content
- [x] Build state management for game sessions
- [x] Handle scoring, lives, and game completion

### Phase 3: AI Game Generation
- [x] Update AI prompts to generate GameSpec-compliant output
- [x] Create prompt templates for each complexity level
- [x] Implement validation for AI-generated game specs
- [x] Test AI generation with sample prompts from user document
- [x] Handle edge cases and malformed AI responses

### Phase 4: Integration
- [x] Connect GameRenderer to GameModal
- [x] Update game creation flow to use new system
- [x] Restore original format options per complexity level
- [x] Test end-to-end game creation and play

## Bug Fixes

- [x] Fix DialogTitle accessibility error in GameModal
- [x] Fix GameEngine error: Cannot read properties of undefined (reading 'type')
