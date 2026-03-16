# 🔄 AGILE - AGILE DEVELOPMENT GUIDE

## Giới thiệu

Hướng dẫn này mô tả cách sử dụng **Agile methodology** để phát triển Weather App một cách hiệu quả.

---

## 🎯 AGILE PRINCIPLES

### 12 Agile Principles (Applied to Weather App):

1. **Customer Satisfaction**
   - Release working software early and often
   - Get user feedback on each version

2. **Welcome Change**
   - Accept requirement changes
   - Plan for flexibility

3. **Deliver Frequently**
   - Release every 2 weeks
   - MVP → v1.1 → v1.2 → v2.0

4. **Collaborate Daily**
   - Daily standup (15 min)
   - Open communication
   - Pair programming when needed

5. **Trust & Support Team**
   - Give autonomy to developers
   - Remove blockers
   - Provide resources

6. **Face-to-Face Communication**
   - Video calls for remote teams
   - Weekly team meetings
   - Monthly review & demo

7. **Working Software**
   - Code works first, polish later
   - Always shippable
   - Frequent releases

8. **Sustainable Pace**
   - No crunching
   - Work-life balance
   - Quality over speed

9. **Technical Excellence**
   - Clean code
   - Good design
   - Regular refactoring

10. **Simplicity**
    - Keep it simple
    - Minimal complexity
    - No over-engineering

11. **Self-Organization**
    - Team makes decisions
    - Collective ownership
    - High engagement

12. **Continuous Improvement**
    - Retrospectives every sprint
    - Learn from mistakes
    - Adapt & improve

---

## 📋 AGILE ROLES

### Product Owner
**Responsibilities**:
- Define product vision
- Prioritize features
- Accept user stories
- Manage backlog
- Communicate with stakeholders

**For Weather App**:
- Prioritize between POC/MVP/Enhancements
- Make scope decisions
- Approve releases

### Scrum Master
**Responsibilities**:
- Facilitate meetings
- Remove blockers
- Coach team on Agile
- Protect team focus
- Improve process

**For Weather App**:
- Run standups
- Manage sprint planning
- Track velocity
- Organize retrospectives

### Development Team
**Responsibilities**:
- Build product
- Self-organize
- Estimate work
- Deliver quality
- Continuous improvement

**For Weather App**:
- Develop features
- Write tests
- Code review
- Support production

---

## 📊 AGILE ARTIFACTS

### 1. Product Backlog

**Weather App Product Backlog**:

```
Priority | Story | Points | Sprint
---------|-------|--------|--------
HIGH     | Search weather | 5 | MVP
HIGH     | Display results | 5 | MVP
HIGH     | Save history | 3 | MVP
HIGH     | View history | 3 | MVP
HIGH     | Clear history | 3 | MVP
MEDIUM   | Error handling | 5 | v1.1
MEDIUM   | Weather icons | 3 | v1.1
MEDIUM   | Keyboard shortcuts | 3 | v1.1
MEDIUM   | Settings panel | 5 | v1.1
LOW      | Dark mode | 8 | v2.0
LOW      | Forecast | 13 | v2.0
LOW      | Database | 13 | v2.0
```

### 2. Sprint Backlog

**Sprint 1 (MVP - Week 1)**:

```
Story: Search Weather
├─ Create Models (3h)
├─ Implement ApiService (4h)
├─ Test API (2h)
└─ Status: In Progress

Story: Display Results
├─ Design UI (3h)
├─ Implement display (3h)
├─ Test (1h)
└─ Status: To Do

Story: Save History
├─ Implement HistoryService (3h)
├─ Test file I/O (1h)
└─ Status: To Do
```

### 3. Definition of Done (DoD)

**Checklist for each feature**:
- [ ] Code written & tested locally
- [ ] Peer reviewed & approved
- [ ] Unit tests passing (80%+ coverage)
- [ ] No SonarQube critical issues
- [ ] Documentation updated
- [ ] Merged to main branch
- [ ] Deployed to staging
- [ ] User acceptance test passed
- [ ] Ready for production

### 4. Acceptance Criteria

**Example - Search Weather Feature**:

```
GIVEN: User opens the app
WHEN: User enters "Tokyo" and clicks Search
THEN:
  - API is called within 2 seconds
  - Weather data displays (Temp, Humidity, Wind, Status)
  - No error message appears
  - "Tokyo" is added to history list

AND:
  - If user enters invalid city
  - Then error message displays
  - And history is NOT updated
```

---

## 🏃 AGILE CEREMONIES

### 1. Sprint Planning (Start of Sprint)

**Duration**: 2 hours
**Frequency**: Every 2 weeks
**Attendees**: Product Owner, Scrum Master, Team

**Agenda**:
```
1. Review product backlog (30 min)
   - PO presents priorities
   - Team asks questions

2. Estimate effort (30 min)
   - Team discusses each story
   - Assign story points
   - Ask for clarification

3. Commit to sprint (30 min)
   - Team decides velocity
   - Select stories for sprint
   - Team commits to delivery

4. Sprint goal (30 min)
   - Define sprint objective
   - Example: "Deliver MVP core features"
```

### 2. Daily Standup (Every Day)

**Duration**: 15 minutes max
**Time**: 10:00 AM (consistent)
**Format**: In-person or video call

**Each Person Answers**:
1. What did I do yesterday? (2 min)
2. What will I do today? (2 min)
3. Any blockers? (1 min)

**Example**:
```
Alice (Backend):
- Yesterday: Completed ApiService
- Today: Implement HistoryService
- Blockers: None

Bob (Frontend):
- Yesterday: Designed UI
- Today: Implement Form1 events
- Blockers: Need ApiService ready (blocker alert!)
  → Resolution: Alice will complete by EOD
```

### 3. Sprint Demo (End of Sprint)

**Duration**: 1 hour
**Frequency**: Every 2 weeks
**Attendees**: Team + Stakeholders

**Agenda**:
```
1. Run working software (30 min)
   - Show completed features
   - Demonstrate user workflows
   - Get feedback

2. Incomplete items (5 min)
   - Explain why not done
   - Move to next sprint

3. Q&A (15 min)
   - Answer questions
   - Get stakeholder input

4. Celebration (10 min)
   - Celebrate accomplishments
   - Thank team
```

**Demo Script**:
```
"Today we're demonstrating v1.0 MVP features.

Feature 1: Search Weather
[Enter "Tokyo" → Show results]
"Works! Loads in ~1 second."

Feature 2: History
[Click history item → Show re-search]
"Previous searches load instantly."

Feature 3: Clear History
[Click button → Confirm → Clear]
"History cleared successfully."

Any questions?
```

### 4. Sprint Retrospective (End of Sprint)

**Duration**: 1 hour
**Frequency**: Every 2 weeks
**Attendees**: Team only (confidential)
**Facilitator**: Scrum Master

**Agenda**:
```
1. What went well? (15 min)
   ✅ Good documentation
   ✅ Fast API integration
   ✅ Strong team collaboration

2. What didn't go well? (15 min)
   ❌ Testing took longer than expected
   ❌ API limitations discovered late
   ❌ UI refinements needed

3. What will we improve? (20 min)
   🔄 Start writing tests earlier
   🔄 Validate API limitations in POC
   🔄 Include designer in planning

4. Action items (10 min)
   → Alice: Research caching
   → Bob: Setup CI/CD
   → Charlie: Create test templates
```

**Output**: Improvement plan for next sprint

### 5. Product Refinement (Ongoing)

**Duration**: 1 hour weekly
**Attendees**: PO, Scrum Master, Lead Dev

**Activities**:
- [ ] Review upcoming features
- [ ] Clarify requirements
- [ ] Estimate stories
- [ ] Identify dependencies
- [ ] Prepare backlog for next sprint

---

## 📈 AGILE METRICS

### Velocity

**Calculate velocity**:
```
Sprint 1: Completed 16 points
Sprint 2: Completed 14 points
Sprint 3: Completed 18 points

Average Velocity = (16 + 14 + 18) / 3 = 16 points/sprint
```

**Use for planning**:
```
Remaining backlog: 64 points
Velocity: 16 points/sprint
Sprints needed: 64 / 16 = 4 sprints
Timeline: 4 sprints × 2 weeks = 8 weeks
```

### Burndown Chart

**Example Burndown - Sprint 1**:
```
Story Points
30│    ╱╲
  │   ╱  ╲___
20│  ╱       ╲
  │ ╱         ╲___
10│╱             ╲
  │_____________
0 └─────────────
  Day 1 2 3 4 5 (Sprint days)

Ideal: —
Actual: ╱╱╱╱╱
Status: On track ✅
```

### Burn Rate

```
Completed per day: 16 points / 5 days = 3.2 points/day

If behind:
- Identify blockers
- Get help from team
- Reduce scope if needed
```

### Cumulative Flow

```
Points
100├─────────────  Total Backlog
80 │    ╱────────  Completed (Done)
60 │   ╱╱────────  In Progress
40 │  ╱╱╱───────  To Do (Remaining)
20 │ ╱╱╱╱
0  └──────────
   1 2 3 4 5... Sprints
```

---

## 🎯 SPRINT PLANNING EXAMPLE

### MVP Sprint (Week 1)

**Sprint Goal**: Build core search and history features

**Sprint Backlog**:

| ID | Story | Points | Dev | Status |
|----|-------|--------|-----|--------|
| 1 | Search weather | 5 | Alice | In Progress |
| 2 | Display results | 5 | Bob | In Progress |
| 3 | Save history | 3 | Alice | To Do |
| 4 | View history | 3 | Bob | To Do |
| 5 | Clear history | 3 | Charlie | To Do |
| **Total** | | **19** | | |

**Velocity**: 16 points/sprint expected
**Status**: Slightly high (19 vs 16), but acceptable for MVP

**Sprint Timeline**:
```
Day 1: Sprint Planning + Kickoff
Day 2-4: Development
Day 5: Testing & Refinement

Friday: Sprint Demo + Retrospective
```

---

## 🚦 AGILE WORKFLOW

### Story Lifecycle:

```
Backlog
  ↓
Planned (Sprint Planning)
  ↓
In Progress (Dev starts)
  ↓
Code Review (Peer review)
  ↓
Testing (QA/Manual test)
  ↓
Done (Merged & deployed)
  ↓
Released (In production)
```

### Example Workflow:
```
Story: Search Weather API

1. Backlog
   Status: Not started
   Points: 5
   Priority: HIGH

2. Sprint 1 Selected
   Dev: Alice
   Timeline: Days 1-2

3. In Progress
   Branch: feature/search-weather
   Progress: 50%

4. Code Review
   Reviewer: Bob
   Status: Approved ✅

5. Testing
   QA: Charlie
   Result: All tests pass ✅

6. Done
   Merged to main
   All checks pass ✅

7. Released
   In v1.0.0
   Live in production ✅
```

---

## 📊 KANBAN BOARD

### Example Kanban Setup:

```
TO DO              IN PROGRESS         DONE
━━━━━━━━━━━━━━─  ━━━━━━━━━━━━━━━  ━━━━━━━━━━━
[Search: 5pts]     [Display: 5pts]   [Models: 3pts]
[Save Hist: 3pts]  [Testing: 1pts]   [API Svc: 5pts]
[View Hist: 3pts]
[Clear: 3pts]
[Icons: 3pts]
[Dark Mode: 8pts]

WIP Limit: 3 items per column
Blocked: [API Response] - Waiting on API team
```

---

## 🔄 SPRINT CYCLE VISUALIZATION

```
Week 1 (MVP Sprint)
├─ Mon: Sprint Planning
├─ Tue-Thu: Development
├─ Fri AM: Testing
└─ Fri PM: Demo + Retro

Week 2 (v1.1 Sprint)
├─ Mon: Sprint Planning
├─ Tue-Thu: Development
├─ Fri AM: Testing
└─ Fri PM: Demo + Retro

Week 3-4: Release & Iteration
```

---

## 🎓 AGILE TIPS & BEST PRACTICES

### DO:
- ✅ Keep sprints consistent (2 weeks)
- ✅ Have clear Definition of Done
- ✅ Communicate daily
- ✅ Celebrate wins
- ✅ Retrospect honestly
- ✅ Plan realistically
- ✅ Test continuously
- ✅ Deliver incrementally

### DON'T:
- ❌ Use Agile as excuse for no planning
- ❌ Skip retrospectives
- ❌ Ignore technical debt
- ❌ Over-commit on sprint
- ❌ Skip testing
- ❌ Ignore user feedback
- ❌ Work overtime constantly
- ❌ Micromanage team

---

## 📱 TOOLS FOR AGILE

### Recommended Tools:

| Tool | Purpose | Cost |
|------|---------|------|
| Jira | Sprint management | Free/Paid |
| Trello | Kanban board | Free/Paid |
| GitHub Projects | Simple board | Free |
| Azure DevOps | Full suite | Free/Paid |
| Monday.com | Collaboration | Paid |

### For Weather App:
- Use **GitHub Projects** (free, simple)
- Or **Trello** (intuitive)
- Or **Azure DevOps** (full featured)

---

## 🎯 AGILE ANTI-PATTERNS (Avoid!)

### ❌ Anti-Pattern 1: Scrum Theater
```
Problem: Going through ceremonies without meaning
Solution: Make ceremonies valuable, decide early to change if not
```

### ❌ Anti-Pattern 2: Ignoring Technical Debt
```
Problem: Always choosing quick fixes
Solution: Allocate 20% of sprint to technical debt
```

### ❌ Anti-Pattern 3: No Real Backlog Refinement
```
Problem: Stories poorly defined
Solution: Schedule weekly refinement sessions
```

### ❌ Anti-Pattern 4: Crunching at Sprint End
```
Problem: Team working late to meet commitments
Solution: Commit realistically, adjust scope if needed
```

### ❌ Anti-Pattern 5: No Retrospectives
```
Problem: Never improving process
Solution: Mandatory retrospectives every sprint
```

---

## 🚀 AGILE FOR WEATHER APP

### Applied Agile:

**POC Phase**:
- 1 day sprint
- Fast feedback
- Quick pivot

**MVP Phase**:
- 2 week sprints
- 5 core features
- Daily standup
- Sprint demo

**Enhancement Phase**:
- 2 week sprints
- Continuous refinement
- User feedback loop
- Regular retrospectives

**Scaling Phase**:
- Multi-team coordination
- Release trains (4-6 week cycles)
- Portfolio management
- Strategic roadmapping

---

## 📊 SUCCESS METRICS (Agile)

| Metric | Target | Actual (MVP) | Status |
|--------|--------|--------------|--------|
| Velocity | 16 pts/sprint | 19.5 avg | ✅ Good |
| Sprint Completion | 95%+ | 100% | ✅ Excellent |
| Code Review Time | < 24h | ~4h avg | ✅ Excellent |
| Test Coverage | 80%+ | 0% (MVP) | ⚠️ Plan for v1.1 |
| Team Satisfaction | 4+/5 | 4.5/5 | ✅ Good |
| Release Frequency | 2 weeks | 3 weeks | ✅ Acceptable |

---

## 🎉 AGILE CONCLUSION

Agile methodology helps Weather App development by:
- ✅ Delivering value incrementally
- ✅ Getting early feedback
- ✅ Adapting to changes
- ✅ Maintaining team morale
- ✅ Continuous improvement

**Key Success Factors**:
1. Committed team
2. Clear communication
3. Realistic planning
4. Regular feedback
5. Process improvement

---

**Agile Status**: ACTIVE
**Sprint Duration**: 2 weeks
**Next Sprint**: Planning Monday
**Velocity**: ~16 points/sprint

👉 **Continue**: Implement Agile for v1.1+ releases!

Happy Agile! 🚀
