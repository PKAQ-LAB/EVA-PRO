## 通用组件目录规则（2026-11-07 用户确认）

非业务的通用组件代码（包括异常状态展示、通用表单组件等）必须放在 src/components 下；src/pages 按业务组织页面，业务专属 aoeform 等仍留在所属业务模块。组件迁移必须同步更新路由、导入及测试引用，不改变既有 URL、接口、权限或交互；不得仅凭文件名含 form 就迁移业务表单，也不得将残留测试当作可复用组件。业务代码以高内聚、低耦合为先，不为消除少量重复而将不同业务强行合并；共享组件不得承载电话、用餐等具体业务分支。

CLAUDE.md

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **EVA-PRO** (1803 symbols, 2999 relationships, 103 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "trunk"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/EVA-PRO/context` | Codebase overview, check index freshness |
| `gitnexus://repo/EVA-PRO/clusters` | All functional areas |
| `gitnexus://repo/EVA-PRO/processes` | All execution flows |
| `gitnexus://repo/EVA-PRO/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
