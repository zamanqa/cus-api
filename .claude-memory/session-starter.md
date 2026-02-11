# Session Starter for Claude

> **Purpose**: Quick reminder to load project memory at the start of each session

---

## 🔄 Start of Session Instructions

**Dear Claude**, at the start of each session:

1. **Read the memory file first**: `.claude-memory/claude-memory.md`
2. **Check session history**: `.claude-memory/session-history.md`
3. **Ask user for current task**: "What would you like to work on today?"

---

## 💾 End of Session Instructions

**Dear Claude**, at the end of each session:

1. **Update session-history.md**: Add today's work summary
2. **Update claude-memory.md**: Add any new patterns or discoveries
3. **Save important docs**: Create files in `.claude-memory/` for future reference

---

## 📋 Quick Commands for User

### Start Session
```
Claude, read .claude-memory/claude-memory.md and let me know you're ready
```

### End Session
```
Claude, update session history with today's changes
```

### Add Specific Info
```
Claude, add to memory: [specific information]
```

---

## 🎯 Current Project State

**Project**: Customer API E2E Automation
**Status**: Fresh project setup
**Branches**: main

**Ready to build**:
- Page objects
- Custom commands
- Test specifications
- Fixtures

---

*Save this file for easy reference!*
