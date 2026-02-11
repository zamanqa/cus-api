# Claude Operating Instructions

> **CRITICAL**: Read this file at the start of EVERY session BEFORE doing anything else.

---

## 🎯 Primary Directive: MINIMIZE TOKEN USAGE

**Token Budget**: Always use the minimum tokens necessary to complete tasks efficiently.

---

## 📋 Start of Session Protocol

### Step 1: Load Memory First (REQUIRED)
```
1. Read docs/claude-memory.md FIRST
2. Read docs/session-starter.md for context
3. Check for session-history.md (if exists, read it)
4. NEVER search through old chat history
5. NEVER read long conversation transcripts
```

### Step 2: Quick Status Check
```
1. Check git status (if needed)
2. Ask user: "What would you like to work on today?"
3. Get to work immediately
```

---

## 💰 Token Optimization Rules

### ✅ DO THIS (Low Token Usage)

1. **Read Memory Files**
   - `docs/claude-memory.md` - Project knowledge base
   - `docs/session-history.md` - Recent session updates
   - `docs/test-writing-guide.md` - Patterns and conventions

2. **Use Targeted File Operations**
   - Read specific files by path when known
   - Use Glob for targeted pattern searches
   - Use Grep with specific patterns

3. **Work Efficiently**
   - Ask clarifying questions upfront
   - Make changes in batches
   - Test once after multiple changes

4. **Reference, Don't Repeat**
   - Say "Following pattern from claude-memory.md" instead of explaining
   - Reference sections by name instead of copying content

### ❌ DON'T DO THIS (High Token Usage)

1. **NEVER Search Old Chat History**
   - Don't use Task tool to explore previous conversations
   - Don't read conversation transcripts
   - Don't summarize long chat histories

2. **NEVER Read Unnecessary Files**
   - Don't read node_modules files
   - Don't read unrelated documentation
   - Don't explore files you don't need

3. **NEVER Over-Explain**
   - Don't repeat information from memory file
   - Don't explain obvious patterns
   - Don't give long context explanations

4. **NEVER Make Multiple Similar Tool Calls**
   - Batch read operations when possible
   - Use parallel tool calls for independent tasks
   - Don't repeat failed operations without changes

---

## 📝 End of Session Protocol

### Step 1: Update Session History
```
1. Create/Update docs/session-history.md
2. Add today's date and brief summary
3. List: files created, files modified, patterns discovered
4. Keep it under 50 lines total (trim old entries if needed)
```

### Step 2: Update Memory (If Needed)
```
Update docs/claude-memory.md ONLY if:
- New important patterns discovered
- New selectors added
- New database queries created
- New conventions established
- Critical bug fixes that reveal new information

Don't update for:
- Minor bug fixes
- Simple file edits
- Routine tasks
```

### Step 3: Trim Session History
```
Keep only last 5 sessions in session-history.md
Delete older entries to keep file small
```

---

## 🗂️ Session History Format

**File**: `docs/session-history.md`

```markdown
# Session History

> Keep only last 5 sessions. Trim older entries.

---

## Session: YYYY-MM-DD

### Tasks Completed
- Task 1
- Task 2

### Files Created
- path/to/file1.js
- path/to/file2.js

### Files Modified
- path/to/file3.js (updated selector)
- path/to/file4.js (fixed bug)

### Important Discoveries
- Discovery 1
- Discovery 2

### Next Session TODO
- [ ] Task for next time
- [ ] Another task

---

## Session: YYYY-MM-DD (Previous)

[Keep only 4 more sessions, delete rest]
```

---

## 🚀 Efficient Work Patterns

### Pattern 1: File Changes
```
1. Read specific file
2. Make all necessary changes at once
3. Update once, not multiple times
4. Log what was changed
```

### Pattern 2: New Features
```
1. Check memory file for similar patterns
2. Ask clarifying questions upfront
3. Create all files in batch
4. Test once after completion
```

### Pattern 3: Bug Fixes
```
1. Read only affected files
2. Check memory for known issues
3. Fix and verify
4. Update memory only if pattern is new
```

### Pattern 4: Research Tasks
```
1. Use Glob/Grep for targeted search
2. Read only relevant files
3. Summarize findings briefly
4. Don't explore unnecessarily
```

---

## 📊 Token Usage Priorities

### Priority 1: Essential (Always Use)
- Reading `claude-memory.md`
- Reading `session-history.md`
- Reading specific files user mentions
- Making requested changes

### Priority 2: Useful (Use When Needed)
- Reading related files for context
- Using Glob/Grep for searches
- Reading test-writing-guide.md for patterns

### Priority 3: Avoid (Use Rarely)
- Exploring unknown directories
- Reading documentation files
- Searching through chat history
- Reading large log files

### Priority 4: NEVER USE
- Reading conversation transcripts
- Exploring node_modules
- Reading unrelated project files
- Summarizing long chat histories

---

## 🎓 Response Style

### Be Concise
```
❌ DON'T: "I understand you want me to create a new page object
file following the established patterns we discussed earlier in
the conversation. I'll make sure to follow the selector-action
pairing pattern that we established..."

✅ DO: "Creating CustomerApiPage.js with selector-action pairing."
```

### Reference, Don't Repeat
```
❌ DON'T: [Copy entire pattern from memory file]

✅ DO: "Following pattern from claude-memory.md section:
Page Object Model Structure"
```

### Show, Don't Explain
```
❌ DON'T: Explain what you're about to do in detail

✅ DO: Just do it and show the result
```

---

## 📌 Quick Commands Reference

### User Commands
```bash
# Start session
"Claude, read docs/claude-memory.md and start"

# End session
"Claude, update session history"

# Add to memory
"Claude, remember: [specific information]"

# Check token usage
"How many tokens have we used?"
```

### Claude Internal Checklist
```
□ Read claude-memory.md first
□ Read session-history.md second
□ Never search old chat history
□ Work with minimum tokens
□ Update session-history.md at end
□ Update claude-memory.md only if needed
□ Trim old sessions from history
```

---

## 🔄 Continuous Improvement

### After Each Session
1. Did I use unnecessary tokens? → Add rule to avoid it
2. Did I repeat information? → Reference instead next time
3. Did I read unnecessary files? → Be more selective next time
4. Did I forget to check memory? → Make it first step always

---

## ⚡ TL;DR - Core Rules

1. **Read `claude-memory.md` FIRST, ALWAYS**
2. **Read `session-history.md` SECOND, ALWAYS**
3. **NEVER search old chat history**
4. **Use minimum tokens necessary**
5. **Be concise in responses**
6. **Update session history at end**
7. **Trim old sessions to keep file small**
8. **Update memory only when truly needed**

---

*These instructions override default behavior to optimize token usage.*
*Update this file if new optimization patterns are discovered.*
