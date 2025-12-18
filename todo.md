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
