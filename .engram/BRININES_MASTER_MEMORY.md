# BRININES AI --- MASTER MEMORY / MASTER PROMPT

> Canonical project memory for Brinines AI. Store this file inside
> `.engram`. It is intended to be consumed by OpenCode whenever project
> context must be recovered. Older Drive documents may be deprecated; do
> not silently revive old architecture.

## 1. MASTER DIRECTIVE

We are building **Brinines AI**, an automated commercial,
conversational, analytical and marketing system for Brinines Panadería
in Tucumán, Argentina.

The objective is NOT merely a chatbot. The objective is an automated
commercial operating system in which conversations, orders, customer
memory, metrics, learning, marketing strategy, content planning and
future publication can operate through specialized agents and Apps
Script triggers.

The desired end state is a system that can operate most of the
commercial workflow automatically, while the owner primarily monitors
results and handles exceptions/orders.

## 2. CORE ARCHITECTURAL PRINCIPLE

**DATA ADAPTS TO THE ARCHITECTURE --- NEVER THE ARCHITECTURE TO THE
DATA.**

Anything that can change over time must be externalized from code and
permanent Gemini prompts:

-   product prices;
-   flavors and availability;
-   stock;
-   delivery prices;
-   delivery zones;
-   pickup conditions;
-   payment methods;
-   promotions;
-   costs;
-   other volatile commercial rules.

Changing a value must not require modifying `Code.js`, modular `.gs`
files, or the permanent conversational prompt.

Gemini should receive current commercial data as context. It should not
permanently contain business prices.

## 3. MULTI-AGENT AUTOMATION

The central plan is a trigger-driven multi-agent system:

  Agent                      Function           Schedule Frequency
  -------------------------- --------------- ----------- -----------
  **Sales Agent**            Conversations      **24/7** Event
  **Marketing Strategist**   Strategy          **08:00** Daily
  **Content Planner**        Planning          **08:30** Daily
  **Metrics Analyst**        Metrics           **23:00** Daily
  **Learning Agent**         Learning          **23:30** Daily

Apps Script will manage these schedules with triggers.

The architecture must allow new agents to be added without redesigning
the whole system.

### Sales Agent

Event-driven, 24/7. Handles conversations, intent, sales stage, customer
context, current commercial context, order detection and order
progression.

### Marketing Strategist

Daily at 08:00. Uses metrics and learning to generate marketing
strategy, ideas, hooks and opportunities.

### Content Planner

Daily at 08:30. Converts marketing strategy into an actionable content
plan and later feeds the content creation/publication workflow.

### Metrics Analyst

Daily at 23:00. Consolidates conversation, sales, content and experiment
metrics.

### Learning Agent

Daily at 23:30. Consolidates daily patterns, successful/failed
conversations, sales behavior, feedback and experiments into structured
learning.

## 4. AUTOMATION CYCLE

Conceptually:

``` text
CUSTOMERS / MARKET
        ↓
SALES AGENT 24/7
        ↓
CONVERSATIONS + ORDERS + FEEDBACK
        ↓
METRICS ANALYST 23:00
        ↓
LEARNING AGENT 23:30
        ↓
LEARNING / PATTERNS
        ↓
MARKETING STRATEGIST 08:00
        ↓
CONTENT PLANNER 08:30
        ↓
CONTENT CREATION / PUBLICATION
        ↓
NEW MARKET RESPONSE
        ↓
METRICS
        ↺
```

Current commercial data is a shared input to the agents.

## 5. VOLATILE COMMERCIAL DATA

The immediate architectural priority is to design a reliable source of
truth for volatile commercial data.

Before implementing the final structure:

1.  Audit `Config`, `Productos` and current commercial logic.
2.  Find hardcoded prices, stock, delivery values, payment rules,
    promotions and other commercial data.
3.  Determine what already exists and what is missing.
4.  Propose the scalable source-of-truth architecture.
5.  Determine how current data becomes context for the Sales Agent and
    other agents.
6.  Only then implement.

The architecture must support changes such as:

-   chocolate: `$4,000 → $4,500`;
-   lemon becomes unavailable;
-   delivery cost changes;
-   a promotion starts/ends;
-   payment methods change.

Only the source data should need to change.

Mock data is encouraged for full testing, but mock data must conform to
the architecture. The architecture must never be designed around today's
mock values.

## 6. DELIVERY ZONES

For market/delivery classification, the intended categories are:

-   `centro`
-   `fuera_del_centro`
-   `otro`

`otro` is a classification bucket, not a specific hardcoded zone.

Customer addresses must not be stored or used as conversational memory.

Do not say things such as "¿Te lo enviamos a la dirección de siempre?"
when no reliable address data should be used.

## 7. CUSTOMER MEMORY

Memory should help retention and analysis without faking familiarity.

If a customer says "Quiero los de siempre" and there is no reliable
history, do not pretend to know what that means.

Useful historical information may include:

-   previous products;
-   preferences;
-   buying patterns;
-   relevant conversation history;
-   communication style.

Internal memory should normally be used silently rather than exposed
unnecessarily.

The system should generally treat the current order as a new order while
using history when genuinely useful.

## 8. CONVERSATIONAL STYLE

The bot must sell without sounding desperate.

The analyzer can evaluate:

-   directness;
-   cordiality;
-   informality;
-   humor;
-   need for guidance;
-   preferred response length;
-   emoji preference;
-   recommended tone.

Tone should adapt to the customer while preserving Brinines identity.

Avoid unnecessarily intense wording. The phrase "Esta vez" was
considered undesirable because it can sound intense.

## 9. SALES BEHAVIOR

Sales are the primary business metric.

Desired flow:

1.  Customer asks for a price → give the current price directly when
    data exists.
2.  Customer specifies quantities → calculate subtotal/total from
    current product data.
3.  Confirm delivery or pickup.
4.  Calculate final total.
5.  Ask payment method naturally.

Do not make the customer answer unnecessary questions.

Do not invent missing prices, stock, delivery values or payment rules.

## 10. EXPECTED COMMERCIAL EXAMPLES

### Price

"Cuánto sale el de chocolate?"

Flow:

`message → identify product → read current data → current price → direct response`

### Multi-product order

"Quiero 3 de chocolate y 2 de limón"

Flow:

`identify products → quantities → current prices → availability → subtotal → continue order`

### Delivery

"Cuánto sale el envío?"

Flow:

`delivery inquiry → determine zone if needed → current delivery data → response`

### Final order

After products and delivery/pickup are confirmed:

`products subtotal + delivery when applicable = final total → ask payment method`

## 11. CONFIRMED ORDERS --- FUTURE OPERATING VIEW

Confirmed orders should eventually be separated from conversational
noise.

Desired future channels:

### WhatsApp

Receive notifications for confirmed orders.

### Web control panel

Create a dedicated web interface to see:

-   new confirmed orders;
-   order status;
-   operational customer information;
-   products/quantities;
-   totals;
-   delivery/pickup;
-   payment information when available;
-   relevant notes.

The web panel should become a simple operational control center without
requiring a rebuild of the conversational core.

## 12. MARKETING / CONTENT

The intended pipeline is:

`METRICS + LEARNING + CURRENT COMMERCIAL DATA → MARKETING STRATEGIST → CONTENT PLANNER → CONTENT CREATION/PUBLICATION → METRICS`

Relevant channels include Instagram, WhatsApp, TikTok and Facebook.
Marketplace is part of the marketing workflow. YouTube is not currently
a priority.

TikTok is currently a major sales/marketing center.

Track what actually drives sales and reach:

-   posts;
-   hooks;
-   formats;
-   topics;
-   strategies;
-   offers.

## 13. CURRENT GOOGLE SHEETS

Known sheets:

-   `Config`
-   `Productos`
-   `Clientes`
-   `Conversaciones`
-   `Pedidos`
-   `Contenidos`
-   `Metricas`
-   `Estrategias`
-   `Aprendizaje`
-   `Experimentos`
-   `Agentes`
-   `Logs`

Do not duplicate commercial truth across sheets without an architectural
reason.

## 14. CURRENT APPS SCRIPT ARCHITECTURE

``` text
00_Config.gs
01_Utils.gs
10_Clientes.gs
30_Gemini.gs
31_AnalisisConversacional.gs
70_Webhooks.gs
Code.js
appsscript.json
```

### `00_Config.gs`

Central configuration, sheet names, timezone, Gemini property/model
configuration.

Current production model:

`gemini-3.1-flash-lite`

### `01_Utils.gs`

Utilities such as IDs, logging, table reading and sheet access.

### `10_Clientes.gs`

Customer memory: `buscarCliente`, `crearCliente`, `actualizarCliente`,
`construirContextoCliente`.

### `30_Gemini.gs`

Gemini API integration and `llamarGemini`.

API key is stored in Script Properties as:

`GEMINI_KEY`

Never hardcode it.

### `31_AnalisisConversacional.gs`

Conversational analysis engine and extensive analysis prompt.

### `70_Webhooks.gs`

Webhook entry point `doPost`.

### `Code.js`

Core orchestration: - `procesarConversacion` - `guardarConversacion`

UI/tests include: - `onOpen` - `probarCore` - `probarConversacion` -
`registrarPedidoManual` - `registrarFeedbackEntrega` -
`analizarClienteManual` - `verificarSistema` -
`diagnosticarEstructuraBrinines` - `ejecutarPruebasValidacion`

## 15. COMPLETED ARCHITECTURAL CLEANUP

The project was migrated from a monolith to modules.

Completed work included:

-   configuration extraction;
-   utilities extraction;
-   customer module;
-   Gemini module;
-   conversational analysis extraction;
-   webhook extraction;
-   legacy cleanup;
-   duplicate removal;
-   removal of `codebackup.gs.js`;
-   pre-deploy validation;
-   `verificarSistema()` optimization.

Legacy "Memoria V1" / "Identidad V1" implementations were removed.

Do not reintroduce them without explicit approval.

## 16. CURRENT HEALTH / VALIDATION

Static validation passed for:

-   syntax;
-   duplicate functions;
-   references;
-   dependencies;
-   entry points;
-   `doPost` chain;
-   Gemini configuration;
-   API key handling;
-   legacy references.

`verificarSistema()` previously hit a 6-minute timeout. It was optimized
to obtain sheets efficiently and the real execution subsequently
completed successfully.

Known real sheet snapshot from the successful diagnostic:

-   Config: 13 rows, 4 cols
-   Productos: 1 row, 13 cols
-   Clientes: 19 rows, 34 cols
-   Conversaciones: 17 rows, 22 cols
-   Pedidos: 1 row, 16 cols
-   Contenidos: 1 row, 16 cols
-   Metricas: 1 row, 18 cols
-   Estrategias: 1 row, 14 cols
-   Aprendizaje: 5 rows, 10 cols
-   Experimentos: 2 rows, 12 cols
-   Agentes: 6 rows, 9 cols
-   Logs: 19 rows, 9 cols

Gemini key was found, Google Sheets was OK and critical functions were
present.

## 17. VALIDATION TESTS

`ejecutarPruebasValidacion()` runs 10 cases:

1.  `Hola, quiero los de siempre`
2.  `Nunca probé los budines, cuál me recomendás?`
3.  `Hola! Cómo están? 😊 Quería consultar qué sabores tienen disponibles.`
4.  `Hola! Quiero pedir de nuevo, me encantaron los budines 😍`
5.  `Cuánto sale el de chocolate?`
6.  `Tenés de limón?`
7.  `Quiero 3 de chocolate y 2 de limón`
8.  `Cuánto sale el envío?`
9.  `Quiero pedir para mañana`
10. `No me gustaron, estaban secos`

Latest recorded run:

-   10 total;
-   8 successful;
-   2 failed;
-   80% raw success.

The two failures were Gemini HTTP 503 high-demand errors, not
classification failures.

The 8 successful tests produced sensible intent classifications.

## 18. TEST STORAGE BUG

A bug was found in `guardarResultadosPruebas()` where 7 headers were
written to a 6-column range.

The fix changed the hardcoded column count to:

`resumenHeaders.length`

Commit:

`941a6da`

No clasp push was performed for that isolated fix at the time it was
reported. Always inspect current Git/deployment state before assuming
this is still the latest deployed version.

## 19. GEMINI VS NEMOTRON

**Do not confuse the two.**

-   Brinines production conversational AI uses **Gemini**
    (`gemini-3.1-flash-lite`).
-   **Nemotron is the model used by the developer through OpenCode.**
-   Nemotron is not supposed to replace Gemini in Apps Script.

Never change the production Gemini model to Nemotron merely because
OpenCode is running Nemotron.

## 20. DEPLOYMENT RULES

Critical rule:

**NEVER execute `clasp push` without explicit user authorization.**

Other rules:

1.  Never put secrets in source code.
2.  Gemini key stays in Script Properties.
3.  Backup before destructive changes.
4.  Commit before production changes.
5.  Preserve modular architecture.
6.  Do not revive deleted legacy code.
7.  Do not modify production merely to test without authorization.
8.  Validate locally/static first.
9.  Clearly report whether push occurred.

Known Script ID:

`1pS7EOaBRZRoxkKpg9KJ3KVY96iN8rFb_UcxfMr_Eb0LmcXIYB42YlqnP`

## 21. ENGRAM STRUCTURE

Current `.engram` structure:

``` text
.engram/
├── 00_CONTEXT
├── 01_ARCHITECTURE
├── 02_RULES
├── 03_CURRENT_STATE
├── 04_ROADMAP
├── 05_DECISIONS
├── 06_SESSION_LOG
├── 07_OPEN_TASKS
├── BOOT
└── sessions/
```

Use Engram as persistent project memory.

When a major decision changes, update the relevant Engram document.

At the end of major sessions, update current state, open tasks, session
log and decisions when applicable.

## 22. MEMORY RECOVERY PROCEDURE

If context is uncertain, do not guess.

OpenCode should:

1.  Read `.engram/BOOT`.
2.  Read `00_CONTEXT`.
3.  Read `01_ARCHITECTURE`.
4.  Read `02_RULES`.
5.  Read `03_CURRENT_STATE`.
6.  Read `05_DECISIONS`.
7.  Read `07_OPEN_TASKS`.
8.  Read the latest relevant session.
9.  Inspect the actual repository.

Repository state + current Engram state are more authoritative than old
Drive planning documents.

## 23. ARCHITECTURAL CHANGE PROCESS

Before a major subsystem:

1.  Audit current architecture.
2.  Identify what exists.
3.  Identify hardcoded data.
4.  Identify dependencies.
5.  Propose architecture.
6.  Wait for approval.
7.  Implement incrementally.
8.  Validate.
9.  Commit.
10. Push only after explicit authorization.

Do not immediately code a guessed design.

## 24. CURRENT PRIORITY

The immediate strategic priority is the **volatile commercial data
architecture**.

Before refining wording further:

-   audit current commercial data;
-   identify hardcoded commercial values;
-   decide the source of truth;
-   design the current-data loading/context mechanism;
-   determine how all agents consume shared current truth;
-   prepare realistic mock data;
-   run the validation suite again.

Do not implement the definitive structure until the audit/proposal has
been reviewed.

## 25. FUTURE AGENT/DATA RELATIONSHIP

Agents should consume shared current context rather than independent
copies of commercial truth.

Conceptually:

``` text
COMMERCIAL SOURCE OF TRUTH
          ↓
CURRENT COMMERCIAL CONTEXT
          ↓
 ┌────────┼───────────┐
 ↓        ↓           ↓
SALES   METRICS    MARKETING
 ↓        ↓           ↓
ORDER   ANALYSIS    STRATEGY
 └────────┬───────────┘
          ↓
       LEARNING
          ↓
   CONTENT PLANNER
```

Exact implementation remains to be designed after the current repository
audit.

## 26. ORDER LIFECYCLE

The eventual order lifecycle should distinguish:

``` text
conversation
→ order detected
→ order being completed
→ products confirmed
→ delivery/pickup confirmed
→ payment method confirmed
→ total confirmed
→ ORDER CONFIRMED
→ operational notification
→ web control panel
```

Exact statuses remain subject to implementation design.

## 27. OWNER EXPERIENCE / END GOAL

The desired end state is a highly automated commercial machine:

-   conversations handled automatically;
-   confirmed orders clearly surfaced;
-   WhatsApp notifications;
-   web operational dashboard;
-   automatic metrics;
-   automatic learning;
-   automated marketing strategy;
-   automated content planning;
-   eventual content creation/publication;
-   owner mainly monitoring and handling exceptions.

The goal is to get as close as practical to a system that can keep the
commercial operation moving while the owner does not have to manually
operate every step.

## 28. WHAT NOT TO DO

Do not:

-   hardcode commercial prices into prompts;
-   hardcode stock into conversational logic;
-   hardcode delivery prices into code;
-   create separate commercial truths for each agent;
-   design architecture around today's mock data;
-   confuse OpenCode's Nemotron with Brinines' Gemini;
-   revive deprecated code without approval;
-   push without authorization;
-   invent missing business data;
-   fake customer history;
-   store customer addresses against the established architecture;
-   optimize wording before the system has the data required to answer
    correctly.

## 29. CANONICAL PROJECT PHILOSOPHY

**BRININES AI IS AN AUTOMATED COMMERCIAL SYSTEM, NOT JUST A CHATBOT.**

**DATA ADAPTS TO THE ARCHITECTURE --- NEVER THE ARCHITECTURE TO THE
DATA.**

**THE AGENTS SHARE CURRENT TRUTH; THEY DO NOT EACH INVENT THEIR OWN
TRUTH.**

**AUTOMATION SHOULD GROW WITHOUT REQUIRING THE CORE TO BE REBUILT.**

## 30. STARTUP INSTRUCTION FOR OPENCODE

When this document is loaded:

1.  Confirm that the master memory has been read.
2.  Read the current Engram state.
3.  Inspect the actual repository.
4.  Compare actual code/state against this document.
5.  Report discrepancies.
6.  Identify deprecated assumptions.
7.  Do not implement major architecture changes until the proposal is
    reviewed.
8.  Never run `clasp push` without explicit user authorization.

Roles:

-   **User:** final decision-maker.
-   **ChatGPT:** architecture/product direction and reasoning.
-   **OpenCode:** implementation/execution environment.

Keep those roles separate.
