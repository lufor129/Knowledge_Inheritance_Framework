# 現成做法研究：有哪些 skill 和方式可以達成知識傳承框架的目標

- 研究日期：2026-10-24
- 範圍：使用者原話「幫我研究有哪些 skill 或有哪些方式可以達成我的目標」。依委託分成 A 到 F 六個面向，最後一節給建議。
- 方法：只引用第一手來源（官方文件、原始碼、規格、作者本人的文章）。本機檔案寫絕對路徑。查不到或不確定的，直接寫「未確認」。標「實測」的，是這次用不需安裝的方式實際跑過（例如 GitHub 的 Markdown API）。
- 用語：沿用 `/Volumes/T7/Claude_Project/Knowledge_Inheritance_Framework/GLOSSARY.md`。提到外部工具自己的名詞（例如 Karpathy 的 wiki、GitHub 的 pull request）時保留原名。
- 現有決定的依據：GLOSSARY、ADR-0001（已被取代）、ADR-0002、ADR-0003（`/Volumes/T7/Claude_Project/Knowledge_Inheritance_Framework/docs/adr/`），以及委託說明中的設計摘要。

## 先講結論

1. 這套框架的骨架（Git、Markdown、Agent 寫草稿、人審核）和 Karpathy 提出的「LLM wiki」做法、Write the Docs 的 docs-as-code 是同一路。不需要另找平台。差異在於框架有維護者審核和訪談，這兩點是框架自己要補的。
2. 最省力的做法是：讓程式和 Git 平台負責「一定要成立的規則」，Agent 只負責需要判斷的事。Claude Code 官方文件明講 CLAUDE.md／AGENTS.md 是「context，不是強制設定」，一定要成立的規則應該寫成 hook。
3. 「單一 HTML 檔、離線能開的手冊網站」這個條件，主流網站產生器幾乎都做不到。只有 Quarto 的「單一文件」模式、Pandoc，和現有的自寫引擎做得到。所以保留自寫引擎、替它加上手冊模式，代價最低。
4. 實測發現：`## 標題 {#hk1}` 在 GitHub 網頁上會原樣顯示 `{#hk1}`。如果「手冊可以直接閱讀」包括在 GitHub／GitLab 上讀，小節 id 的寫法要重新考慮。
5. 規模只有幾百個小節時，查找用 grep 加一份由程式產生的索引就夠了，不需要向量檢索或 MCP。

---

## A. 可以直接用或改來用的現成 skill／plugin／agent

### A1. Agent Skills 規格與 Claude Code 的 skill 機制

**找到什麼**

- 規格位在 agentskills.io。一個 skill 是一個資料夾，至少要有 `SKILL.md`；可選的子資料夾是 `scripts/`、`references/`、`assets/`。（[agentskills.io/specification](https://agentskills.io/specification)）
- `name` 的限制：1 到 64 字元，只能用小寫英文字母、數字和連字號（`a-z`、`0-9`、`-`），不能以連字號開頭或結尾，不能有連續的 `--`，而且必須和所在資料夾同名。`description` 為 1 到 1024 字元，要寫「做什麼」和「什麼時候用」。（同上）
- 規格建議 `SKILL.md` 本文少於 500 行、約 5000 token 以內，細節放到另外的檔案，而且引用只往下一層。啟動時只載入 `name` 和 `description`（約 100 token）。（同上）
- Anthropic 平台的撰寫指南另外規定：`name` 和 `description` 不能含 XML 標籤，`name` 不能含保留字 `anthropic`、`claude`；`description` 要用第三人稱寫。指南建議命名用動名詞（例如 `processing-pdfs`），名詞片語也可以接受。（[Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)）
- 同一份指南的幾個原則，和「減輕規則」直接相關：
  - 「Default assumption: Claude is already very smart」：只寫 Claude 原本不知道的東西。
  - 依任務的脆弱程度決定自由度：容易出錯、一定要照順序的事，給固定的程式（low freedom）；可以有多種做法的事，只給方向（high freedom）。
  - 「Build evaluations first」：先找出 Claude 沒有 skill 時實際做錯的地方，再寫「剛好夠用」的指示。
  - 「Prefer scripts for deterministic operations」：判斷得準的檢查寫成程式，不要叫 Claude 每次自己寫檢查。
- Claude Code 對 skill 的規定（[code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)）：
  - 位置：個人 `~/.claude/skills/`、專案 `.claude/skills/`（commit 進 repo 就能和團隊共用），也可以放在 plugin 裡。從子資料夾啟動時，仍會往上載入到 repo 根目錄的 `.claude/skills/`。
  - frontmatter 欄位：`disable-model-invocation`（只能由人輸入 `/名稱` 叫用）、`user-invocable`、`allowed-tools`、`context: fork`（在子 agent 裡執行）、`paths`（只在碰到特定檔案時自動啟用）、`hooks` 等。
  - 清單裡每個 skill 的 `description` 加 `when_to_use` 會在 1,536 字元處截斷；整份清單的預算是模型 context 的 1%。
  - 疑難排解寫明：「Claude skipped a rule that must hold every time: move the rule into a hook.」也就是說，一定要成立的規則要改成 hook。
- 本機的 Claude Code 版本是 2.1.310（`/Users/lufor/.local/bin/claude` 指向 `/Users/lufor/.local/share/claude/versions/2.1.310`），上面提到的功能都在支援範圍內。

**和這個框架的關係**

- 依 Agent Skills 規格和 Anthropic 平台的規定，skill 名稱不能用中文。Claude Code 本身比較寬鬆，它拒絕的只有零寬字元、控制字元、`<`、`>` 這類字元，以及保留名稱 `synced`（[skills 文件「Characters a skill name can't hold」](https://code.claude.com/docs/en/skills)）。但為了讓其他 Agent 和 claude.ai 也能用，建議照規格走：GLOSSARY 的「研究、整理、訪談、查找、帶讀、檢查、審核」對應到英文資料夾名稱，例如 `kb-contribute`、`kb-lookup`、`kb-guided-reading`、`kb-check`、`kb-review`。名稱只是給 Agent 和人叫用的，`description` 和本文仍然用 GLOSSARY 的中文詞。
- 避免和已安裝的 skill 同名，例如 mattpocock 的 `research`。plugin 的 skill 有命名空間，不會互相蓋掉，但兩段很像的 `description` 會讓 Agent 選錯。
- 「Claude 是聰明的」和「先評估再寫」這兩條，是減輕規則最有力的官方依據：每一條規則都應該對應到一個實際看過的錯誤。

### A2. Anthropic 官方的 skills repo

**找到什麼**

- `anthropics/skills` 的 `skills/` 目前有 19 個資料夾：academy-guide、algorithmic-art、brand-guidelines、canvas-design、claude-api、discernment-nudge、doc-coauthoring、docx、frontend-design、internal-comms、mcp-builder、pdf、pptx、skill-creator、slack-gif-creator、theme-factory、web-artifacts-builder、webapp-testing、xlsx。（GitHub API：`https://api.github.com/repos/anthropics/skills/contents/skills`，2026-10-24 查詢）
- 授權：多數是 Apache 2.0；docx、pdf、pptx、xlsx 是 source-available，不是開源。可以用 `/plugin marketplace add anthropics/skills` 安裝。（[github.com/anthropics/skills](https://github.com/anthropics/skills)）
- **doc-coauthoring** 分三個階段：蒐集背景、逐段修改、讀者測試（Reader Testing）。讀者測試的做法是先預測讀者會問的 5 到 10 個問題，再開一個「沒有這段對話背景」的子 agent，只給它文件和問題，看它答對、答錯哪些，最後檢查模糊、錯誤假設、前後矛盾的地方。（[doc-coauthoring/SKILL.md](https://raw.githubusercontent.com/anthropics/skills/main/skills/doc-coauthoring/SKILL.md)）
- **web-artifacts-builder** 用 React、Vite、Parcel、Tailwind 開發，最後用 `scripts/bundle-artifact.sh` 打包成單一 HTML 檔。（[web-artifacts-builder/SKILL.md](https://raw.githubusercontent.com/anthropics/skills/main/skills/web-artifacts-builder/SKILL.md)）
- **skill-creator**（使用者已透過官方 marketplace 安裝，路徑 `/Users/lufor/.claude/plugins/cache/claude-plugins-official/skill-creator/58267944f921/skills/skill-creator/`）提供 skill 的評估迴圈、新舊版盲測、`description` 觸發率調校。Claude Code 文件也有說明這些功能。（[code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)）

**和這個框架的關係**

- doc-coauthoring 的讀者測試，可以直接拿來做「檢查」裡由 Agent 負責的寫作原則部分。而且框架已經有現成的測試題，就是每章的常見問題（見第 7 節建議）。
- web-artifacts-builder 說明「打包成單一 HTML」是常見做法，但它要 React 和 Node 那一整套，比現有的 Python 打包腳本重得多，不採用。
- skill-creator 適合在框架的 skill 寫好之後，用來確認「新人問問題時，查找 skill 會不會被叫起來」。

### A3. Claude Code 的 plugin 與 marketplace

**找到什麼**

- plugin 是把 skill、子 agent、hook、MCP server 包成一包安裝的單位；marketplace 是一個含 `.claude-plugin/marketplace.json` 的 repo 或資料夾，列出 plugin 和抓取來源。（[code.claude.com/docs/en/plugins](https://code.claude.com/docs/en/plugins)）
- 官方說明什麼時候需要 plugin：「Use a plugin when you want several skills, subagents, hooks, or MCP servers packaged as one unit……Make one to give your own setup to teammates, install it in many projects」。只在一個 repo 用的話，`.claude/skills/` commit 進 repo 就能共用。（同上；[skills 文件的 Share skills 一節](https://code.claude.com/docs/en/skills)）
- 啟用的 plugin，每個能被 Claude 自動叫用的 skill 的名稱和描述「are in Claude's context on every turn」，就算沒用到也占用 context。（[plugins 文件](https://code.claude.com/docs/en/plugins)）
- 公司內部可以架私有 marketplace（GitHub、GitLab、共用資料夾、一個 `marketplace.json` 網址都可以）。也可以用 `--scope project` 寫進 repo 的 `.claude/settings.json`，讓信任這個資料夾的同事自動登記。背景自動更新預設是關閉的。（[Host and maintain a marketplace](https://code.claude.com/docs/en/plugins/host-marketplace)）

**和這個框架的關係**

- ADR-0003 已經決定框架和所有知識庫放在同一個 repo，所以 skill 放在 repo 的 `.claude/skills/` 就夠了，不需要 plugin，也不需要 marketplace。這讓框架少掉一整層版本發布和更新的規則。
- 只有在「框架要給別的 repo 用」時才需要 plugin。目前 ADR-0003 明確不這樣做。

### A4. 使用者本機已安裝的 skill、plugin、agent

已安裝清單見 `/Users/lufor/.claude/plugins/installed_plugins.json`：skill-creator、claude-hud、codex、andrej-karpathy-skills、mattpocock-skills 1.3.1。

#### mattpocock-skills 1.3.1

路徑：`/Users/lufor/.claude/plugins/cache/mattpocock/mattpocock-skills/1.3.1/skills/`

| skill | 做什麼（依原檔） | 對應框架的哪裡 |
|---|---|---|
| `engineering/research` | 開背景 agent，只查第一手來源（官方文件、原始碼、規格），把每個說法附上出處，寫成一份 Markdown。 | 研究。但兩者有差別：GLOSSARY 的研究允許「Agent 自己的知識」，只要在變更提案裡標出來歷；mattpocock 的 research 只接受第一手來源。 |
| `engineering/domain-modeling` | 維護 GLOSSARY.md 和 ADR。GLOSSARY 每個詞一到兩句、列出 `_Avoid_`；ADR 只在「很難反悔、沒有背景會覺得奇怪、真的有取捨」三者都成立時才寫。（`GLOSSARY-FORMAT.md`、`ADR-FORMAT.md`） | 框架本身的 GLOSSARY 和 ADR 已經照這個格式寫。可以繼續用來維護框架；知識庫本身不需要。 |
| `productivity/writing-for-agents` | 寫給 Agent 看的文件（skill、AGENTS.md）的原則：context pointer、context load 和 cognitive load 兩種成本、leading word、避免否定句、每個意思只放一個地方、環境本身就是事實來源（不要重寫設定檔已經說清楚的東西）、刪掉 no-op（模型本來就會做的指示）。 | 寫 AGENTS.md 和 skill 時直接採用。對減輕規則最有用的兩條是「刪掉 no-op」和「不要重寫程式已經檢查的規則」。 |
| `productivity/grilling` | 把問題畫成決策樹，每一輪把「前提已經確定」的問題全部問完，每題附上建議答案；查得到的事實由 Agent 自己查，決定交給人。 | 訪談：「Agent 反問到自己懂了」可以照這個節奏進行，一輪問完一批，不要一題一題擠牙膏。 |
| `productivity/to-questionnaire` | 把「自己答不出來」的問題，做成一份 Markdown 問卷交給知道答案的人，可以非同步填寫。（使用者叫用） | 訪談的非同步版本：資深傳承者沒空當面談時，先填問卷，Agent 再追問。 |
| `productivity/teach` | 長期教學。有 MISSION.md、學習紀錄、HTML 課程、可重用元件；強調 retrieval practice（從記憶裡叫出來）、spacing（分散練習），測驗的每個選項「exactly the same number of words」，正確答案的位置要變換。（使用者叫用，`disable-model-invocation: true`） | 帶讀：測驗規則可以直接用在帶讀出的小題目，以及常見問題的寫法。但 teach 會在工作目錄寫一堆檔案（lessons/、learning-records/），在全公司共用的 repo 裡不要照做。 |
| `productivity/wait-what` | 要求 Agent 用 ASD-STE100 簡化技術英文、沿用 GLOSSARY 的詞重講一次。 | 和 ELI5 同方向，可以當帶讀時「聽不懂」的快捷指令參考。 |
| `engineering/grill-with-docs` | 只是叫用 grilling 和 domain-modeling 兩個 skill。 | 說明「能用現有 skill 組合，就不新增 skill」。 |

- mattpocock 自己的 `SCOPE.md` 規定：意見要有「Observed failure」（真的在對話裡出過錯）才會被接受；「If the behaviour composes from existing skills, it does not get a new one」。（`/Users/lufor/.claude/plugins/cache/mattpocock/mattpocock-skills/1.3.1/SCOPE.md`）這是很好的減輕規則原則。

#### andrej-karpathy-skills

路徑：`/Users/lufor/.claude/plugins/cache/karpathy-skills/andrej-karpathy-skills/1.0.0/`。作者是 forrestchang，不是 Karpathy 本人；內容是從 Karpathy 一則談 LLM 寫程式缺點的推文整理出來的四條寫程式原則（想清楚再寫、簡單優先、只改該改的、以可驗證的目標驅動）。（同路徑 `README.md`）和知識維護無關，不採用。

#### ~/.claude/skills/

`/Users/lufor/.claude/skills/` 目前只有 `codex-gpt-image` 和 claude.ai 同步下來的 `synced/`。和知識維護有關的 skill 在備份資料夾 `/Users/lufor/.claude/skills-backup-20261013/`，例如 `wiki-note`（見下）。

#### wiki-curator agent 與 wiki-note skill

檔案：

- `/Users/lufor/.claude/agents/wiki-curator.md`
- `/Users/lufor/.claude/hooks/wiki-curate.py`
- `/Users/lufor/.claude/settings.json` 的 `hooks.Stop`
- `/Users/lufor/.claude/skills-backup-20261013/wiki-note/SKILL.md`
- vault 的說明檔 `/Users/lufor/Documents/Obsidian Vault/wiki/_README.md`（只讀了這份架構說明，沒有讀任何個人內容）

它怎麼做：

1. **觸發**：每次 Claude Code 對話結束，`Stop` hook 執行 `wiki-curate.py`。腳本有四道防線：環境變數防止自己觸發自己；`stop_hook_active` 為真就跳過；只在工作目錄位於 vault 裡時才執行；transcript 少於 20 行就跳過。通過之後，用 `claude -p --agent wiki-curator --permission-mode bypassPermissions` 在背景另開一個行程，所以不會卡住原本的對話。
2. **agent 設定**：`model: haiku`，工具只給 `Read, Write, Glob, Grep`。只把 `confidence=high` 的洞察寫進 `wiki/_inbox/`，frontmatter 一定要有 `status: draft` 和 `sources[].session_id`。寫之前要過五題自我檢查，例如「6 個月後使用者會回來查這條做決策嗎？」。明寫「一場對話完全沒有產出是正常的」。
3. **影子紀錄**：被拒絕的候選寫進 `_inbox/_log/considered-YYYY-MM-DD.md`，拒絕理由只能用固定的分類詞（`session-specific`、`已收`、`confidence-low`、`重複`、`隱私`、`非洞察`），不能引用原文，避免隱私內容流進紀錄。
4. **人工主管道**：`wiki-note` skill 讓使用者直接寫進正式區。流程是一定先 dry-run 給人看；既有檔案只能在後面加「## YYYY-MM-DD 補充」，不覆寫。
5. **現況**：`wiki-note` 自己寫著「M2 integrator 上線後，inbox drafts 才會被自動處理進 canonical；目前 inbox 是死路」。

和這個框架的關係：

- 「草稿 → 人確認 → 正式內容」的分層，和 wiki 的 `_inbox`（draft）→ canonical（curated）是同一個想法。框架有 Git，不需要 `_inbox` 資料夾：草稿就在變更提案的分支上，合併進主幹就是正式內容。
- 這套設計留下的教訓：自動收集如果沒有人或程式接手消化，就會變成沒人處理的堆積（它自己稱為死路）。框架如果想自動收集「待回答」，應該在查找的同一場對話裡，直接請新人或傳承者確認，再加進常見問題；不要在背景偷偷收集。
- 在公司共用的 repo 裡，用 `bypassPermissions` 在背景啟動 agent 風險太高，不採用這種觸發方式。
- 可以借用的小設計：(a) 用固定分類詞記錄判斷理由，可以借來記錄來歷；(b)「沒有就不寫」的保守原則，可以借給研究：查不到出處的數字就不寫，或標成提醒。

### A5. 社群裡和知識庫、文件維護有關的 skill

來源：本機的 Claude plugin 目錄快取 `/Users/lufor/.claude/plugins/plugin-directory-cache-v2.json`（共 3602 筆）。下列幾個在快取裡的 `review` 狀態都是 `none`，也就是沒有經過審查；星數和最後更新時間來自 GitHub API（2026-10-24）。只當作參考點子，不建議直接依賴。

| 名稱 | 星數 | 重點（依各自的 README） | 可以借什麼 |
|---|---|---|---|
| [praneybehl/llm-wiki-plugin](https://github.com/praneybehl/llm-wiki-plugin) | 122 | Karpathy 做法的 Claude Code plugin。初始化時要裝 FastEmbed、sqlite-vec、PyYAML 和一個本機 embedding 模型，需要 `uv`。 | 不採用：對幾百個小節來說太重。 |
| [cooperacode/wiki-wonka](https://github.com/cooperacode/wiki-wonka) | 15 | raw／wiki／schema 三層；寫入前分兩階段（先分析、再確認）；用 `[!contradiction]`、`[!gap]`、`[!outdated]` 標出要人處理的地方；hook 自動 commit；有 `log.md`。 | 「先分析、再確認」和框架的「草稿 → 傳承者確認」一樣。用 callout 標出矛盾的點子可以參考。 |
| [dragonball2/llm-project-docs](https://github.com/dragonball2/llm-project-docs) | 0 | 每一頁記錄 `verified_at`（上次核對時的 commit）；`/docs-lint` 找斷掉的連結、孤立頁和過期頁；`/docs-query`「if it is not there, the answer says so」。 | 用「上次核對時的版本」把「是否過期」變成程式算得出來的事。這正好可以拿來處理 ADR-0002 的「改小節要檢查簡報頁」（見第 7 節）。 |
| [m4bwav/obsidian-notes](https://github.com/m4bwav/obsidian-notes) | 0 | 只用 Python 標準函式庫的連結檢查（斷連結、孤立頁、重複檔名）；主張用相對路徑的 Markdown 連結，不用 `[[wikilink]]`，因為 GitHub 和多數 Agent 只認得 Markdown 連結。 | 支持「只用標準函式庫寫檢查」的做法；也提醒不要用 Obsidian 專屬語法。 |
| [tobi/qmd](https://github.com/tobi/qmd) | 30,594 | 本機 Markdown 搜尋引擎（BM25、向量、LLM 重新排序），有 CLI 和 MCP。Karpathy 的 gist 提到它。 | 規模大很多時才需要（見 F）。 |

### A6. AGENTS.md 慣例

**找到什麼**

- AGENTS.md 是給 coding agent 看的一般 Markdown 檔，「a README for agents」，沒有必填欄位；目前由 Linux Foundation 底下的 Agentic AI Foundation 維護。巢狀的規則是：「The closest AGENTS.md to the edited file wins」。官網列出的支援工具包括 Codex、Jules、Cursor、Gemini CLI、GitHub Copilot coding agent 等，但沒有列出 Claude Code。（[agents.md](https://agents.md/)）
- Claude Code 自己的文件說它會讀 AGENTS.md（需要 v2.1.277 以上）。規則如下（[code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory)）：
  - repo 裡只有 AGENTS.md、沒有 CLAUDE.md 時，讀 AGENTS.md。
  - 兩者都有時，**預設只讀 CLAUDE.md**。
  - CLAUDE.md 裡寫 `@AGENTS.md` 就會一起載入，重複的檔案會跳過。
  - 「Because `CLAUDE.local.md` counts」：有人在自己的電腦上加一個 `CLAUDE.local.md`，就會讓 Claude 不再讀 AGENTS.md。
  - 子資料夾的 AGENTS.md 只在「沒有任何 CLAUDE.md 時」才會在讀到該資料夾的檔案時載入。
  - 不會讀 `AGENTS.local.md`、`AGENTS.override.md`、`.agents/` 底下的檔案。
- 同一頁的建議：每份 CLAUDE.md「target under 200 lines」；多步驟的流程應該搬到 skill。「Claude treats them as context, not enforced configuration. To block an action regardless of what Claude decides, use a PreToolUse hook instead.」

**和這個框架的關係**

- 把核心規則寫在 AGENTS.md 是對的，而且其他 Agent 也讀得到。
- 但要防止「有人加了 CLAUDE.local.md，AGENTS.md 就失效」。最穩的做法是：根目錄放一行 `CLAUDE.md`，內容只有 `@AGENTS.md`。
- 有了根目錄的 CLAUDE.md，子資料夾的 AGENTS.md 預設就不會載入。所以建議不要在每個知識庫底下放巢狀規則檔；知識庫自己的注意事項，放在 skill 會去讀的檔案裡（例如知識庫的 README）。這樣規則只有一個地方。
- AGENTS.md 控制在 200 行以內，只放「每次對話都要知道的事」，例如用語、資料夾結構的意義、哪些事一定要人確認。研究、整理、訪談、查找、帶讀的步驟放在 skill。

---

## B. 由 LLM 維護知識庫的做法

### B1. Karpathy 的「LLM Knowledge Bases」與「LLM Wiki」

**原文**

- 推文〈LLM Knowledge Bases〉，2026-04-02。（[x.com/karpathy/status/2039805659525644595](https://x.com/karpathy/status/2039805659525644595)；x.com 需要登入，全文經由 `api.fxtwitter.com` 的轉存取得）
- 兩天後他把同一個想法整理成一份「idea file」：gist〈LLM Wiki〉，2026-04-04。推文說明：「you just share the idea, then the other person's agent customizes & builds it」。（[x.com/karpathy/status/2040470801506541998](https://x.com/karpathy/status/2040470801506541998)；gist：[gist.github.com/karpathy/442a6bf555914893e9891c11519de94f](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)）

**重點（引文出自 gist，除非另外註明）**

- 三層架構：
  - **Raw sources**：原始資料，「immutable — the LLM reads from them but never modifies them. This is your source of truth.」
  - **The wiki**：「The LLM owns this layer entirely……You read it; the LLM writes it.」
  - **The schema**：例如 CLAUDE.md 或 AGENTS.md，「what makes the LLM a disciplined wiki maintainer rather than a generic chatbot」，由人和 LLM 一起慢慢調整。
- 三個動作：
  - **Ingest**：放進一份資料，LLM 讀完、和人討論重點、寫摘要頁、更新索引和相關頁面，一份資料可能動到 10 到 15 頁。他自己「prefer to ingest sources one at a time and stay involved」。
  - **Query**：「good answers can be filed back into the wiki as new pages」。
  - **Lint**：定期找頁面之間的矛盾、被新資料推翻的舊說法、沒有任何連結指向的孤立頁、缺少的交叉引用。
- 兩個特殊檔案：`index.md` 是內容目錄，每一頁一行摘要，LLM 每次 ingest 都更新，查詢時先讀它；`log.md` 是只往後加的時間紀錄。
- 規模：「This works surprisingly well at moderate scale (~100 sources, ~hundreds of pages) and avoids the need for embedding-based RAG infrastructure.」推文提到他自己的 wiki 約「~100 articles and ~400K words」，並說「I thought I had to reach for fancy RAG」，結果不需要。
- 版本控制：「The wiki is just a git repo of markdown files. You get version history, branching, and collaboration for free.」
- 團隊用法只帶過一句：「an internal wiki maintained by LLMs……Possibly with humans in the loop reviewing updates.」
- 簡報：他用 Marp 從 wiki 內容產生簡報。
- 他自己強調：「This document is intentionally abstract……Everything mentioned above is optional and modular.」

**和這個框架的對照**

| Karpathy | 這個框架 | 差異 |
|---|---|---|
| raw sources（放在 repo 裡，不可修改） | 整理用的參考資料；GLOSSARY 規定「原檔不放進知識庫，只在出處寫明它在哪裡」 | Karpathy 把原檔留在 repo，出處永遠找得到。框架不放原檔，可以避開機密和大檔案，代價是來源可能搬家或失效。這是取捨，不一定要改。 |
| wiki | 手冊 | Karpathy 的 wiki 是概念頁互相連結的網狀結構；手冊是給新人照順序讀的「部分 → 章 → 小節」。教學順序比較重要，框架的結構比較合適。 |
| schema | AGENTS.md 和 `.claude/skills/` | 相同。 |
| ingest | 整理（和研究） | 相同，也都要人參與。框架多了「訪談」，Karpathy 沒有對應的做法，這是框架獨有、最有價值的部分。 |
| query，好答案寫回 wiki | 查找；手冊沒寫的問題變成待回答 | 相同的想法。框架寫回時要經過維護者審核，比較嚴謹。 |
| lint（定期） | 檢查（只在開變更提案之前） | 框架目前沒有「定期」檢查。可以讓維護者偶爾跑一次，找互相矛盾的小節、過期的數字、沒有任何引用的小節、累積的待回答（選配）。 |
| index.md | 全景圖＋每章速覽 | 全景圖是一張圖，Agent 不容易讀。可以讓程式從檔案自動產生一份「章、小節 id、標題、速覽」的索引，給 Agent 查找時先讀（見 F）。 |
| log.md | Git 歷史 | 框架不需要 log.md，commit 訊息和變更提案的說明就是紀錄。 |
| 人幾乎不改 wiki，也不審核 | 傳承者確認、維護者審核，新人只看正式內容 | 這是公司和個人用途的根本差別。Karpathy 自己也說團隊用時「possibly with humans in the loop」。 |

### B2. docs-as-code

**找到什麼**

Write the Docs 的定義：「writing documentation with the same tools as code」，做法包括 issue tracker、版本控制（Git）、純文字標記（Markdown 等）、code review、自動化測試。好處之一是「You can block merging of new features if they don’t include documentation」。（[writethedocs.org/guide/docs-as-code](https://www.writethedocs.org/guide/docs-as-code/)）

**和這個框架的關係**

框架已經是 docs-as-code：手冊是 Markdown，變更提案就是 code review，檢查就是自動化測試。這代表可以直接用 Git 平台現成的功能（CODEOWNERS、合併前必須通過的檢查，見 E），不需要自己設計審核流程。

---

## C. 同一份 Markdown 產出手冊網站和簡報，並能嵌入互動元件

### C0. 先看現有的範例

範例是 `/Volumes/T7/Claude_Project/Knowledge_Inheritance_Framework/Semi_Conductor_Manufactor/`：

- 簡報引擎是 `js/engine.js`（326 行）。每一頁用 `Deck.add({ id, part, title, minutes, render, init(el, ctx), notes })` 註冊。`ctx` 提供 `raf`、`timer`、`timeout`、`onCleanup`，離開這一頁時會自動停止動畫。
- 引擎另外做了這些功能：章節列、講者視窗與計時、總覽、「回到第 N 頁」、用 `Deck.move` 調整頁序、【可略】標籤。
- 互動元件的共用函式在 `js/widgets/core.js`，整個檔案只引用 `Deck` 一次，和引擎的耦合很低。但每一頁的文字和動畫程式寫在同一個 `js/slides/*.js` 裡。
- 打包腳本 `build-artifact.py`（22 行，只用 Python 標準函式庫）把 CSS、JS、圖片（base64）塞進 `dist/index.html`，約 4.3 MB。
- 注意：這個腳本另外加了一行 Google Fonts 的 `<link>`。所以離線時能開，但字型會退回系統字型。
- 規模：約 92 個頁面 id、197 題 Q&A（`docs/qa-by-topic.md`）。

不管選哪個工具，都要先把每一頁的「文字」和「動畫程式」分開，這是搬遷的固定成本。差別只在分開之後，動畫要用什麼方式掛回去。

### C1. 比較表

| 工具 | 能不能輸出離線可開的單一 HTML | 看的人要裝什麼 | 建置的人要裝什麼 | 能不能嵌自寫 JS 元件 | 中文 | 取代自寫引擎的代價 |
|---|---|---|---|---|---|---|
| **現況：自寫引擎＋Python 打包** | 簡報可以（`dist/index.html`）；手冊網站還沒做 | 瀏覽器 | Python 3（只用標準函式庫） | 可以，`init(el, ctx)` | 可以 | — |
| **Quarto** | 單一文件和 revealjs 簡報可以（`embed-resources: true`）；**網站專案不行** | 瀏覽器 | Quarto CLI（一個安裝檔，內含 Deno、Pandoc、Dart Sass、esbuild、Typst；main 分支設定檔列的是 Deno 2.7.14、Pandoc 3.10，正式版內含的版本可能不同） | 可以（`include-after-body`、Pandoc 的 raw HTML）；OJS 的 `require()` 從 jsDelivr 下載，離線時能不能用：未確認 | 有 `_language-zh-TW.yml` 介面翻譯 | 高。簡報要整份改寫成 `.qmd`，章節列、計時、回到第 N 頁、頁序這些功能要用 reveal.js 外掛重做。手冊網站只能做成「整份手冊合成一份文件」。 |
| **Slidev** | 官方只說可以建置成 SPA；沒有找到單一檔案的選項。Vite 的產物是 ES module，用 `file://` 開會遇到 CORS 錯誤 | 瀏覽器＋一個靜態伺服器 | Node.js ≥ 22.12；匯出 PDF／PPTX／PNG 要 playwright-chromium | 可以（Vue 元件） | 有簡體中文文件；中文內容本身：未確認 | 高。只管簡報，不管手冊網站；元件要改寫成 Vue 或另外包裝。 |
| **Marp** | 能輸出 HTML、PDF、PPTX；HTML 會不會把圖片內嵌：README 沒寫，未確認 | 瀏覽器 | Node.js ≥ 18，或內含 Node 的獨立執行檔；PDF／PPTX 要 Chrome、Edge 或 Firefox | 預設的 HTML 白名單不含 `<script>`；設成 `html: true` 才會全部開放 | 未確認 | 高。適合靜態簡報，不適合 89 頁的互動動畫。 |
| **MkDocs Material** | 不行。offline 外掛產生 `site/` 資料夾，可以用 `file://` 開、搜尋也能用，但要關掉 instant navigation；建議打包成 zip 發送 | 瀏覽器（要先解壓縮） | Python＋pip；**已進入維護模式**（2025-11-05 公告，關鍵錯誤修補到 2027-05-05；後繼專案是 Zensical） | 可以（`extra_javascript`） | 有 zh-TW 介面；搜尋用 jieba 做中文斷詞 | 中。只做手冊網站、不做簡報；是多檔不是單檔；而且已在維護模式。 |
| **Docusaurus** | 3.4 起有實驗性的 hash router，「A single `index.html` file is generated」，可以直接點開；JS 和 CSS 是否也內嵌：未確認。官方說部署到伺服器的網站不建議用這個模式 | 瀏覽器 | Node.js；React、MDX | 可以（React／MDX 元件） | 有 zh-Hans、zh-Hant 主題翻譯 | 高。元件要改成 React；`{#id}` 在 MDX 下已經不是合法語法；不做簡報。 |
| **Astro Starlight** | 沒有找到官方支援 `file://` 的說明，未確認（ES module 的限制同上） | 瀏覽器＋伺服器 | Node.js | 可以（MDX、Markdoc） | 內建「Chinese (Taiwan)」介面翻譯 | 高。 |
| **Quartz v5** | 未確認。換頁用 fetch 抓 HTML（SPA routing，可以關掉），搜尋要靠 ContentIndex | 瀏覽器（可能要伺服器，推論） | Node ≥ 22、npm ≥ 10.9.2 | 可以（JSX 元件） | 有 i18n，細節未確認 | 高。偏向雙向連結的筆記，不是照順序讀的手冊＋簡報。 |
| **Obsidian** | 不適用（它是 App；Publish 由 Obsidian 的主機託管） | 要裝 Obsidian，或連上 Publish 網站 | Obsidian | 未確認 | 可以 | 不適用：違反「新人不用安裝任何東西」。 |
| **Pandoc**（Quarto 的底層） | 可以，`--embed-resources` 支援 html5 和 revealjs | 瀏覽器 | Pandoc（一個執行檔） | 可以（`raw_attribute`） | 未確認 | 中。可以只拿來把 Markdown 轉成 HTML，再交給自寫引擎；但就不再是「只用 Python 標準函式庫」。 |

出處：

- **Quarto**：
  - 單檔：[HTML publishing](https://quarto.org/docs/output-formats/html-publishing.html)
  - revealjs 單檔（chalkboard 外掛不相容）：[Presenting Slides](https://quarto.org/docs/presentations/revealjs/presenting.html)
  - 網站不能單檔：Quarto 維護者 mcanouil 2024-07-16 寫「That's very unlikely HTML Website/Book will ever work with `embed-resources`」（[discussion #10301](https://github.com/orgs/quarto-dev/discussions/10301)），以及提議禁止網站和書籍使用這個選項的 [issue #11316](https://github.com/quarto-dev/quarto-cli/issues/11316)
  - 內含工具與版本：[quarto-cli `configuration`](https://raw.githubusercontent.com/quarto-dev/quarto-cli/main/configuration)；最新正式版 v1.10.19（2026-10-06，GitHub releases API）
  - include：[HTML basics](https://quarto.org/docs/output-formats/html-basics.html)；`{{< include >}}` 的被引入檔要以底線開頭：[Includes](https://quarto.org/docs/authoring/includes.html)
  - OJS：[Observable JS](https://quarto.org/docs/interactive/ojs/)
  - 中文：[`_language-zh-TW.yml`](https://raw.githubusercontent.com/quarto-dev/quarto-cli/main/src/resources/language/_language-zh-TW.yml)
- **Slidev**：
  - 需求：[sli.dev/guide](https://sli.dev/guide/)
  - SPA 建置：[Hosting](https://sli.dev/guide/hosting)
  - `routerMode` 可設成 `hash`：[docs/custom/index.md](https://raw.githubusercontent.com/slidevjs/slidev/main/docs/custom/index.md)
  - 匯出會失去互動：[docs/guide/exporting.md](https://raw.githubusercontent.com/slidevjs/slidev/main/docs/guide/exporting.md)
  - ES module 用 `file://` 開會有 CORS 錯誤：MDN「if you try to load the HTML file locally (i.e., with a `file://` URL), you'll run into CORS errors」（[JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)）
- **Marp**：
  - CLI：[marp-cli README](https://github.com/marp-team/marp-cli)
  - HTML 選項：[marp-core `docs/configuration.md`](https://raw.githubusercontent.com/marp-team/marp-core/main/docs/configuration.md)
  - 白名單原始碼：[`src/html/allowlist.ts`](https://raw.githubusercontent.com/marp-team/marp-core/main/src/html/allowlist.ts)（含 `details`、`summary`，不含 `script`）
- **MkDocs Material**：
  - offline 外掛：[Built-in offline plugin](https://squidfunk.github.io/mkdocs-material/plugins/offline/)
  - 維護模式：[Zensical 公告（2025-11-05）](https://squidfunk.github.io/mkdocs-material/blog/2025/11/05/zensical/)，原文「We will continue fixing critical bugs and security vulnerabilities through May 5, 2027」；最新版本 9.7.7（2026-07-17，GitHub releases API）
  - 中文介面：`material/templates/partials/languages/zh-TW.html`；斷詞：[docs/plugins/search.md](https://raw.githubusercontent.com/squidfunk/mkdocs-material/master/docs/plugins/search.md)
  - 自訂 JS：[MkDocs configuration](https://raw.githubusercontent.com/mkdocs/mkdocs/master/docs/user-guide/configuration.md)
- **Docusaurus**：
  - hash router：[Docusaurus 3.4 release（2024-05-31）](https://docusaurus.io/blog/releases/3.4)
  - 預設建置要用伺服器：[Deployment](https://docusaurus.io/docs/deployment)
  - `{#id}`：[TOC 文件](https://docusaurus.io/docs/markdown-features/toc)
  - 中文：`packages/docusaurus-theme-translations/locales/`
- **Starlight**：[Getting started](https://starlight.astro.build/getting-started/)、[i18n](https://starlight.astro.build/guides/i18n/)
- **Quartz**：
  - 需求與功能：[quartz.jzhao.xyz](https://quartz.jzhao.xyz/)
  - SPA routing：[docs/features/SPA Routing.md](https://raw.githubusercontent.com/jackyzha0/quartz/v4/docs/features/SPA%20Routing.md)
  - 搜尋：[docs/features/full-text search.md](https://raw.githubusercontent.com/jackyzha0/quartz/v4/docs/features/full-text%20search.md)
- **Obsidian**：「Obsidian is free for all purposes, including personal, commercial, and non-profit use」；「Publish data is hosted on our servers」（[obsidian.md/license](https://obsidian.md/license)）
- **Pandoc**：`--embed-resources`「needs no external files and no net access」；`header_attributes`（`{#identifier}`）；`raw_attribute`（[Pandoc manual](https://pandoc.org/MANUAL.html)）

### C2. 和這個框架的關係

- 「單一 HTML 檔、離線能開、看的人不用裝任何東西」這三個條件同時成立時，能用的只剩：自寫引擎、Pandoc，以及 Quarto 的「單一文件或簡報」模式（不是網站模式）。主流網站產生器的設計都假設有伺服器。
- Quarto 是唯一同時滿足「單一 HTML＋簡報＋中文介面＋`{#id}`」的現成工具。但它的代價是：
  - 建置的人要另外裝 Quarto CLI；
  - 引擎特有的功能（章節列、計時、回到第 N 頁、頁序、【可略】）要重做；
  - 手冊網站只能做成「一份很長的文件」。
  - 所以 Quarto 只適合當「以後不想維護引擎時」的備案，不建議現在換。
- 現有的元件已經有乾淨的介面 `init(el, ctx)`，`core.js` 幾乎不依賴引擎。手冊網站只要提供同樣的 `ctx`（例如元件捲到畫面裡才開始動畫、捲出去就停止），同一個互動元件就能同時用在簡報和手冊網站。這符合 GLOSSARY「手冊網站和簡報共用同一個互動元件」的定義。
- **一個要先決定的技術問題**：Python 標準函式庫沒有 Markdown 解析器（Python 官方模組索引：[docs.python.org/3/py-modindex.html](https://docs.python.org/3/py-modindex.html)）。手冊網站要把 Markdown 轉成 HTML，有三條路：
  1. 把一個 JS 的 Markdown 解析器內嵌進單一 HTML，在瀏覽器裡轉換。例如 markdown-it 符合 CommonMark，可以在瀏覽器使用（[markdown-it README](https://github.com/markdown-it/markdown-it)）；它的外掛 markdown-it-attrs 支援 `{#id}`（[markdown-it-attrs](https://github.com/arve0/markdown-it-attrs)）。建置端仍然只要 Python 標準函式庫。
  2. 自己用 Python 寫一個只支援部分 Markdown 語法的轉換器。但小節的內容格式是自由的，這條路風險高。
  3. 放寬「只用標準函式庫」，改用 Pandoc 或 pip 套件。
  - 建議走第 1 條。
- **全景圖**：如果用 Mermaid 畫，GitHub 和 GitLab 網頁上會直接畫出來（見 E）。但離線的手冊網站要把 mermaid 的 JS 一起內嵌：`mermaid@11` 的 `mermaid.min.js` 實測約 3.57 MB（2026-10-24 從 jsDelivr 下載計算）。另一個做法是建置時先轉成 SVG；官方工具 mermaid-cli 要用 npm 安裝（[mermaid-cli README](https://github.com/mermaid-js/mermaid-cli)）。也可以直接手畫 SVG。

---

## D. 幫新人快速上手的文件寫作框架：Diátaxis

**找到什麼**

- Diátaxis 是 Daniele Procida 的作品（[diataxis.fr/colophon](https://diataxis.fr/colophon/)）。它認為文件有四種需求、四種形式：tutorial、how-to guide、reference、explanation（[diataxis.fr](https://diataxis.fr/)）。
- 用兩個問題分類：「action or cognition?」「acquisition or application?」（[The compass](https://diataxis.fr/compass/)）

  | | 學習（acquisition） | 工作（application） |
  |---|---|---|
  | 要做事（action） | tutorial | how-to guide |
  | 要理解（cognition） | explanation | reference |

- 各類型的定義：
  - 「A tutorial is an **experience** that takes place under the guidance of a tutor. A tutorial is always **learning-oriented**.」「A lesson entails a relationship between a teacher and a pupil」「what matters is what the learner does……the teacher's explanations and recitations of fact are far less important.」（[tutorials.rst](https://raw.githubusercontent.com/evildmp/diataxis-documentation-framework/main/source/tutorials.rst)）
  - Explanation 的觀點「is higher and wider than that of the other three types」，範圍是一個主題；而且「tends to absorb other things」：寫的人會忍不住把操作步驟和技術數據也塞進來。（[explanation.rst](https://raw.githubusercontent.com/evildmp/diataxis-documentation-framework/main/source/explanation.rst)）
- 怎麼導入：不要先建一堆空的分類（「Don't do that. It's horrible.」）、「Work one step at a time」、「the structure it proposes is not intended to be a **plan**」。（[How to use Diátaxis](https://diataxis.fr/how-to-use-diataxis/)）
- Diátaxis 沒有「摘要」「FAQ」「地圖」這幾種類型（在 diataxis.fr 原始檔裡搜尋 FAQ，沒有結果）。

**和這個框架的對應**

| 框架的元素 | 最接近的 Diátaxis 類型 | 說明 |
|---|---|---|
| 小節（主體內容） | explanation | 手冊大部分在講「為什麼、怎麼運作」。Diátaxis 提醒 explanation 容易混進數據和步驟；如果某章塞了太多數字，可以考慮集中成一個參考用的小節。 |
| 速覽 | 沒有直接對應 | 速覽是「這章的範圍和讀完會懂什麼」，像 explanation 一開頭交代範圍的那一段。 |
| 全景圖 | explanation（最高、最廣的視角） | 「先看全貌，再進細節」，正好是 explanation 的觀點。 |
| 常見問題 | 沒有直接對應 | 「答案先收起來，自己想過再打開」是 retrieval practice，屬於學習用途；每題指回小節，等於把新人帶回 explanation。這個設計和 Diátaxis 不衝突。 |
| 帶讀 | tutorial | Diátaxis 的 tutorial 本來就是「有老師帶的課」，而且重點是「學生做了什麼」。所以帶讀應該多讓新人回答、預測、動手操作互動元件，少讓 Agent 重講一遍。 |
| 互動元件 | tutorial 裡的「practical activity」 | 讓新人動手看出概念。 |
| 簡報 | tutorial（有講者帶的課） | 講稿和講者須知是給講者的，不是給新人的。 |
| 深入題 | explanation 的延伸 | 給有經驗的人，不是教學主線。 |
| 目前沒有的 | how-to guide、reference | 例如「拿到一張 SPC 圖怎麼判讀」、數字或術語總表。新人上手主要是「學習」，這兩類可以先不做；Diátaxis 也說不要先建空架構。 |

結論：Diátaxis 適合當成檢查章節內容的鏡子（這段是在解釋，還是在列數據？），不需要把手冊改成四大分類。它「不要先建空架構」的原則，也可以支持放寬「每章都必須有常見問題」的規定（見第 7 節）。

---

## E. 有版本控制、有審核的知識維護工具

### E1. CODEOWNERS

**GitHub**（[About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)）

- 檔案放在 `.github/`、根目錄或 `docs/`，依這個順序找到第一個就用。
- 語法類似 gitignore，「the last matching pattern takes the most precedence」。
- 變更提案（GitHub 上叫 pull request）動到某人負責的檔案時，會自動請他審核。
- 在分支保護規則裡打開「Require review from Code Owners」之後，任一位負責人核准就能合併。負責人必須對 repo 有寫入權限；檔案要小於 3 MB。
- 方案限制：「You can define code owners in public repositories with GitHub Free and GitHub Free for organizations, and in public and private repositories with GitHub Pro, GitHub Team, GitHub Enterprise Cloud, and GitHub Enterprise Server.」也就是說，私有 repo 要用付費方案。
- 分支保護也可以要求「必須通過的檢查」：「Required status checks must have a `successful`, `skipped`, or `neutral` status.」（[About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)）

**GitLab**（[Code Owners](https://docs.gitlab.com/user/project/codeowners/)）

- 只有 **Premium、Ultimate** 方案有這個功能。
- 檔案找的順序是 `./CODEOWNERS`、`./docs/CODEOWNERS`、`./.gitlab/CODEOWNERS`。
- 要在受保護分支上打開「Required approval from code owners」。

**和這個框架的關係**

- 「每個知識庫至少有一位維護者」可以直接寫成 CODEOWNERS，例如 `/知識庫/半導體製程/ @維護者帳號`；框架的資料夾（規則、範本、引擎、`.claude/`）則指定給框架維護者。再加上「合併前必須通過檢查」，審核的指派和把關都交給平台處理，框架不用自己寫規則。
- 「新知識庫的建立要框架維護者核准」也可以這樣做：讓框架維護者負責 CODEOWNERS 檔本身，以及知識庫的上層資料夾。
- 未確認：公司用的是哪一個平台、哪一個方案。如果是 GitLab Free，平台不會強制要求負責人核准，只能靠約定。

### E2. Vale（文字風格檢查）

**找到什麼**

- Vale 是用 Go 寫的跨平台指令列工具，有預先編譯好的執行檔，不需要另外裝執行環境。（[docs.vale.sh](https://docs.vale.sh/)、[Install](https://docs.vale.sh/install)）
- 規則用 YAML 寫，例如 `substitution`（把 A 換成 B）、`existence`（找出某些詞）；預設會忽略程式碼區塊。
- 中文支援：官方文件沒有提到 CJK，未確認。
- 推論（未實測）：`existence` 規則預設會在詞的前後加 `\b`（[existence](https://docs.vale.sh/checks/existence)），而 Go 的 `\b` 只認 ASCII 的詞邊界（「These assertions are ASCII-only」，[Go regexp/syntax](https://pkg.go.dev/regexp/syntax)）。所以中文詞很可能要加 `nonword: true` 才比對得到。

**和這個框架的關係**

- GLOSSARY 的 `_Avoid_` 清單（例如「投影片」要寫成「簡報」）理論上可以寫成 Vale 的 `substitution` 規則。
- 但這要多裝一個 Go 執行檔，中文支援也沒有官方說明。同樣的比對，用現有的 Python 檢查腳本加一張對照表就能做到。
- 結論：不採用 Vale，改用「Python 檢查腳本加一張用語對照表」的做法。而且只提醒、不擋，因為手冊內文有時候確實需要提到「投影片」這類詞。

### E3. markdownlint

**找到什麼**

- markdownlint 是 Node.js 的 Markdown 格式檢查工具，可以自訂 JS 規則。（[DavidAnson/markdownlint](https://github.com/DavidAnson/markdownlint)）
- `MD033`（no-inline-html）會擋 `<details>` 這類 HTML，可以用 `allowed_elements` 開放特定元素。（[md033.md](https://raw.githubusercontent.com/DavidAnson/markdownlint/main/doc/md033.md)）
- `MD051` 檢查 `#片段` 連結是否有效，認得 `{#custom-name}` 和 `<a id>`／`<a name>`。（[md051.md](https://raw.githubusercontent.com/DavidAnson/markdownlint/main/doc/md051.md)）

**和這個框架的關係**

小節 id 和引用的檢查，框架的 Python 檢查已經在做（GLOSSARY「檢查」），而且比 markdownlint 的通用規則更準（例如它能處理別名和跨知識庫的引用）。不採用。

### E4. 連結檢查：lychee

**找到什麼**

lychee 是 Rust 寫的單一執行檔，可以檢查 Markdown 和 HTML 的連結：`--offline` 只檢查本機檔案，`--include-fragments` 會檢查 `#錨點`；也有 GitHub Action 版本。（[lycheeverse/lychee](https://github.com/lycheeverse/lychee)）

**和這個框架的關係**

repo 內部的引用由 Python 檢查負責。lychee 唯一能補上的，是「來源的網址是否還活著」；但網址失效不該擋變更提案。可以選配：由維護者定期執行。

### E5. GitHub 和 GitLab 對 Mermaid、`<details>`、`{#id}` 的支援

| | GitHub | GitLab |
|---|---|---|
| Mermaid | 支援，用 ```` ```mermaid ```` 區塊；在區塊裡寫 `info` 可以看版本（[Creating diagrams](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams)） | 支援，Mermaid 11（[GitLab Flavored Markdown](https://docs.gitlab.com/user/markdown/)） |
| `<details>`／`<summary>` | 支援，內部可以寫 Markdown，`<details open>` 預設展開（[Collapsed sections](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-collapsed-sections)）。**實測**正確顯示。 | 支援，內部可以寫 Markdown，前後要空一行（同上 GitLab 頁） |
| 標題後面寫 `{#id}` | 文件沒有提到。**實測**：`## 閘極 {#hk1}` 顯示成「閘極 {#hk1}」，錨點變成 `#閘極-hk1` | 文件沒有提到；錨點由標題文字自動產生 |
| 自訂錨點 | 用 `<a name="...">`（[Basic writing and formatting syntax](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)）。**實測**：`<a id="hk2"></a>` 會被改寫成 `id="user-content-hk2"` | 未確認 |

實測方法：2026-10-24 把一段範例 Markdown 送進 GitHub 公開的 Markdown API（`POST https://api.github.com/markdown`，不需要登入），讀回產生的 HTML。GitLab 沒有實測。

**和這個框架的關係**

- 全景圖用 Mermaid、常見問題用 `<details>`，在 GitHub 和 GitLab 網頁上都能正常閱讀。
- `{#id}` 會在 GitHub 網頁上原樣露出來（見第 7 節「和現有決定衝突的地方」）。

### E6. Claude Code 的 hook

**找到什麼**

- hook 是 Claude Code 在固定時間點執行的 shell 指令，「deterministic control: certain actions always happen rather than relying on the LLM」。（[Hooks guide](https://code.claude.com/docs/en/hooks-guide)）
- 例如可以在專案的 `.claude/settings.json` 設定 `PostToolUse` 加上 `"matcher": "Edit|Write"`，每次 Claude 修改檔案後就執行。（同上）
- 以 exit code 2 結束時，效果依事件而定（[Hooks reference](https://code.claude.com/docs/en/hooks)）：
  - `PreToolUse` 會擋下這個動作。
  - `PostToolUse` 則是「Shows stderr to Claude; the tool already ran」：檔案已經改了，錯誤訊息交給 Claude 去修正。
- skill 的 frontmatter 也可以掛 hook，只在叫用這個 skill 之後生效。（[skills 文件](https://code.claude.com/docs/en/skills)）

**和這個框架的關係**

- 「開變更提案之前一定要通過檢查」可以用兩層保證：
  1. 在 `.claude/settings.json` 掛一個 hook，Agent 每改一次手冊就跑一次 Python 檢查；
  2. 在 Git 平台上把同一支檢查設成「合併前必須通過」。
- 這樣 AGENTS.md 只要寫「檢查沒過時看錯誤訊息修正」，不必寫一長串檢查項目。

---

## F. 查找與帶讀：grep 就夠，還是要向量檢索或 MCP？

**找到什麼**

- Claude Code 的 Grep 工具「is built on ripgrep」（[Tools reference](https://code.claude.com/docs/en/tools-reference)）。
- Anthropic 工程部落格〈Effective context engineering for AI agents〉（2025-09-29）說：Claude Code 用 glob 和 grep「navigate its environment and retrieve files just-in-time」，「effectively bypassing the issues of stale indexing」；代價是「runtime exploration is slower than retrieving pre-computed data」；CLAUDE.md 則是一開始就整份放進 context 的混合做法。（[anthropic.com/engineering/effective-context-engineering-for-ai-agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)）
- Karpathy 的實際規模：約 100 份資料、幾百頁、約 40 萬字，只靠 `index.md` 和摘要，不需要 RAG（見 B1）。
- 內建的 Explore 子 agent 是「A fast, read-only agent optimized for searching and analyzing codebases」，不能寫檔。（[Subagents](https://code.claude.com/docs/en/sub-agents)）

**簡短結論**

- 幾百個小節大約和 Karpathy 的規模相當，甚至更小，**grep 就夠**。最簡單的強化是：用檢查腳本順便產生一份索引檔，內容是每一章的速覽和每個小節的 id 與標題。查找時 Agent 先讀索引，再 grep 原文。
- 中文同義詞是 grep 的弱點（例如「高介電」和「High-k」）。補救方式是在速覽或小節標題裡寫出常見的別稱，並讓查找 skill 換幾個關鍵字多試幾次。不需要為此導入向量檢索。
- 不需要做 MCP server：手冊就在 repo 裡，Claude Code 本來就能直接讀。qmd 這類工具，等到單一知識庫成長到上千頁、grep 明顯找不到東西時再考慮。
- 帶讀用主對話就好（要和新人來回問答）。查找如果要掃很多章，可以交給唯讀的 Explore 子 agent，避免原文塞滿主對話。

---

## 對這個框架的建議

### 1. 每個發現怎麼處理

| # | 發現 | 處理 | 理由 |
|---|---|---|---|
| 1 | Agent Skills 規格（名稱只能用小寫英文、數字、連字號；`SKILL.md` 少於 500 行；只引用下一層） | **採用** | Claude Code 和其他 Agent 共用的格式。Claude Code 對名稱比較寬鬆，但照規格走，其他 Agent 和 claude.ai 才能用；`SKILL.md` 太長或引用太深，Agent 容易漏讀。 |
| 2 | skill 放在 repo 的 `.claude/skills/`，不做 plugin 或 marketplace | **採用** | ADR-0003 已決定單一 repo，plugin 只多出版本發布和更新的負擔。 |
| 3 | Anthropic 撰寫指南：「Claude is already very smart」、依脆弱程度決定自由度、先評估再寫、判斷得準的檢查寫成程式 | **採用**（當作刪規則的依據） | 官方支持「規則越少越好」，也說明哪些事該交給程式。 |
| 4 | AGENTS.md＋一行 `CLAUDE.md`（內容 `@AGENTS.md`），控制在 200 行內，不放巢狀規則檔 | **採用** | 避免有人加了 `CLAUDE.local.md` 就讓 AGENTS.md 失效；規則只放一個地方。 |
| 5 | hook＋「合併前必須通過的檢查」來執行程式檢查 | **採用** | 官方明講指示「not enforced」；一定要成立的規則交給 hook 和平台。 |
| 6 | CODEOWNERS＋分支保護 | **採用**（看公司平台和方案） | 直接對應「每個知識庫的維護者」和「框架維護者」；審核的指派和把關由平台處理。 |
| 7 | doc-coauthoring 的讀者測試 | **改來用** | 用一個「沒有背景」的子 agent，只讀這一章，回答這一章的常見問題，而且只能根據手冊回答並附上小節 id（和查找同一條規則）。答不出來或答錯的地方，就是寫得不清楚的地方。一個測試取代一長串寫作原則檢查項目。 |
| 8 | grilling 的「一輪問完、附建議答案」 | **改來用**（放進訪談） | 訪談的節奏更有效率。差別是：訪談裡的「事實」在傳承者腦袋裡，不能由 Agent 自己去查。 |
| 9 | to-questionnaire | **改來用**（訪談的非同步版本） | 資深的人沒空當面談時，先填問卷。 |
| 10 | teach 的測驗規則（選項等長、正解位置輪換、retrieval practice） | **改來用**（帶讀、常見問題） | 讓小題目不會從格式洩漏答案。不照搬它的 lessons、learning-records 檔案，帶讀不在 repo 裡留下新人的資料。 |
| 11 | writing-for-agents（刪 no-op、每個意思只放一個地方、環境就是事實來源、避免否定句） | **採用**（寫 AGENTS.md 和 skill 時） | 直接幫忙減輕規則。 |
| 12 | domain-modeling（GLOSSARY、ADR 格式） | **採用**（只用於框架本身） | 現有的 GLOSSARY 和 ADR 已經是這個格式。 |
| 13 | mattpocock 的 research | **改來用** | 「只查第一手來源、每個說法附出處」可以當研究的預設；但保留 GLOSSARY 的定義：允許用 Agent 自己的知識，並在來歷標明。 |
| 14 | Karpathy 的 LLM wiki | **改來用** | 三層架構和 ingest／query／lint 已經對應到整理、查找、檢查；再補兩點：(a) 由程式產生索引，給查找先讀；(b) 維護者偶爾做一次健康檢查（選配）。不需要 `log.md`，Git 就是紀錄。 |
| 15 | docs-as-code | **採用**（框架本來就是） | 直接借用 Git 平台的審核和檢查功能。 |
| 16 | llm-project-docs 的「上次核對時的版本」 | **改來用** | 簡報的頁序替每個對應的小節記一個指紋（小節文字的短雜湊值）。小節改了、指紋對不上，程式就能點名「哪一頁簡報要重新看」（見下方第 2 節第 1 點）。 |
| 17 | wiki-curator（Stop hook 背景擷取、`_inbox`） | **不採用**觸發方式；**改來用**兩個小設計 | 公司共用的 repo 不適合用 `bypassPermissions` 在背景寫檔，作者自己也註記 inbox「是死路」。借用「保守、沒有就不寫」和「用固定分類詞記錄理由」。 |
| 18 | 保留自寫引擎做簡報；同一套打包加上手冊模式，用內嵌的 markdown-it（加 attrs 外掛）在瀏覽器轉 Markdown；互動元件沿用 `init(el, ctx)` | **採用** | 唯一能同時做到單檔、離線、不用安裝、只要 Python 標準函式庫，而且不用重寫 89 頁的做法。 |
| 19 | Quarto（單一文件＋revealjs） | **不採用**（列為備案） | 網站模式不能單檔；簡報要整份重寫；建置的人要多裝 Quarto CLI。 |
| 20 | Slidev、Marp、MkDocs Material、Docusaurus、Starlight、Quartz、Obsidian | **不採用** | 都做不到「單一 HTML、離線、看的人不用裝」；MkDocs Material 已進入維護模式；Obsidian 要裝 App。 |
| 21 | Diátaxis | **改來用**（當成檢查章節內容的鏡子） | 不改結構；用它檢查「這段在解釋還是在列數據」，並借用「不要先建空架構」。 |
| 22 | Mermaid 畫全景圖 | **採用**（可選） | GitHub 和 GitLab 會直接畫出來；手冊網站要內嵌約 3.57 MB 的 mermaid.min.js，或改用手畫 SVG。 |
| 23 | Vale | **不採用**（改用 Python 腳本加用語對照表，只提醒） | 多一個 Go 執行檔，中文支援未確認。 |
| 24 | markdownlint | **不採用** | Python 檢查已經涵蓋 id 和引用，而且更符合框架的規則。 |
| 25 | lychee | **選配** | 只用來定期檢查來源網址是否失效，不擋變更提案。 |
| 26 | 向量檢索、qmd、llm-wiki-plugin、MCP | **不採用** | 幾百個小節，grep 加程式產生的索引就夠（Karpathy 和 Anthropic 的第一手說法）。 |
| 27 | andrej-karpathy-skills（forrestchang） | **不採用** | 是寫程式的行為準則，和知識維護無關，也不是 Karpathy 本人的作品。 |
| 28 | web-artifacts-builder | **不採用** | 要 React、Vite、Parcel 一整套，比現有打包重。 |

### 2. 會推翻或簡化的現有決定

**和現有決定衝突的地方**

1. **小節 id 的寫法 `{#id}`**（委託摘要）和 GLOSSARY「手冊……可以直接閱讀」。
   - 實測 GitHub 會把 `{#hk1}` 原樣顯示在標題裡；GitLab 文件也沒有這個語法。Docusaurus 在 MDX 下也不再把它當合法語法，只靠相容選項支援。另一方面，Pandoc、Quarto、markdown-it-attrs、markdownlint MD051 都認得它。
   - 可以選的寫法：
     - (a) 接受 GitHub 上看得到 `{#hk1}`；
     - (b) 改成在標題前一行放 `<a name="hk1"></a>`，GitHub 有支援，markdown-it 也會照原樣輸出；
     - (c) 改用 HTML 註解 `<!-- id: hk1 -->`，GitHub 上看不到，但 GitHub 上就沒有錨點。
   - 要看「直接閱讀」是否包括在 Git 平台網頁上讀，再做決定。
2. **ADR-0002 的「改小節就要一起檢查簡報頁必須是 Agent 的硬性規則」**。
   - 決定本身不用推翻，但「靠 Agent 記得」是 Claude Code 官方說不可靠的方式（「not enforced configuration」「move the rule into a hook」）。
   - 建議把它改成程式檢查：頁序裡每個「簡報頁 → 小節」的對應，多記一個小節文字的指紋；指紋對不上，就提醒或擋下。Agent 更新或確認過簡報頁之後，才更新指紋。
   - 更輕的變形：在變更提案裡，只要改到的小節被頁序引用，就要求同一個提案也改到那一頁，或明確寫「已檢查，不需修改」。
   - 這會改到 ADR-0002 的 Consequences 段落，可能需要一份新的 ADR。
3. **「打包腳本只用 Python 標準函式庫」**（委託摘要，範例 README）和手冊網站要把 Markdown 轉成 HTML。
   - 標準函式庫沒有 Markdown 解析器。要嘛在瀏覽器端內嵌 JS 解析器（建議），要嘛放寬這條限制。
4. **審核的平台功能看公司方案**。
   - GitHub 私有 repo 要付費方案才有 CODEOWNERS；GitLab 要 Premium 以上。公司用哪個平台：未確認。
   - 如果平台做不到，「維護者核准才算正式內容」只能靠約定，不能由平台強制。
5. **（不是衝突，但值得知道）GLOSSARY「整理」的「原檔不放進知識庫」**，和 Karpathy「raw sources 留在 repo、是事實來源」相反。
   - 框架的做法避開了機密和大檔案，代價是來源可能失效，沒有原檔可以回頭核對。建議維持現狀，用 lychee 選配檢查網址。
6. **（小問題）範例的單一 HTML 會載入 Google Fonts**（`Semi_Conductor_Manufactor/build-artifact.py` 的 `fonts` 那一行）。離線時字型會退回系統字型。如果「離線可開」也要求外觀一致，要改成內嵌字型或只用系統字型。

**可以減輕的規則**

1. **一定要成立的規則交給程式和平台，不寫進 AGENTS.md。**
   - 程式檢查負責：小節 id、引用、別名、圖片清單、常見問題的 `<details>` 格式、簡報頁的指紋。
   - 執行方式：hook（每次編輯後）加上「合併前必須通過的檢查」。
   - 審核的指派：CODEOWNERS。
   - AGENTS.md 只要說「看檢查的錯誤訊息修正」。
   - 涉及 GLOSSARY 的「檢查」「審核」、ADR-0002。
2. **新增知識寫成一個 skill、三個分支，不寫成三個 skill。**
   - GLOSSARY 已寫明「三種方式最後都一樣：Agent 寫草稿 → 傳承者確認 → 檢查 → 開變更提案」。共同的後半段只寫一次；研究、整理、訪談各自的前半段放進 `references/` 的三個檔案，只有用到時才讀。這符合 writing-for-agents 的「每個意思只放一個地方」和規格的「引用只往下一層」。
   - 訪談的前半段最容易被趕著做完。如果實際觀察到 Agent 急著寫草稿，再把訪談拆成獨立 skill（writing-for-agents 的「依順序拆分」）。
3. **只有「人會主動叫」的流程設成 `disable-model-invocation: true`。**
   - 帶讀和審核由人叫用，不占每一輪的 context；查找要讓 Agent 自己判斷何時叫用（新人只會直接發問）。
   - 依據：Claude Code skills 文件、writing-for-agents 的 `SKILL-MECHANICS.md`。
4. **用一個讀者測試取代一串寫作原則檢查項目。**
   - 開一個沒有背景的子 agent，只讀這一章，回答這一章的常見問題（見建議表第 7 項）。
   - ELI5 仍然是方向，不必另外列細則。這呼應 GLOSSARY 的 ELI5「不是硬性規定」。
5. **Git 本身就是草稿區和紀錄，不另設狀態欄位、收件匣或 `log.md`。**
   - 分支上的修改就是草稿和變更提案；合併後就是正式內容；commit 歷史就是紀錄。
   - 涉及 GLOSSARY 的「草稿」「變更提案」「正式內容」。
6. **不做 plugin、marketplace、向量檢索、MCP。** 這些都可以從規則和文件裡整段刪掉（ADR-0003）。
7. **索引由程式產生，不由人維護。**
   - 檢查腳本順便輸出「章、速覽、小節 id、標題」的清單，給查找先讀。
   - 全景圖的骨架（部分和章）也可以由資料夾結構自動產生，人只補「章與章之間的關係」。
   - 涉及 GLOSSARY 的「全景圖」。
8. **（可考慮）常見問題改成「有題目才建」。**
   - Diátaxis 說不要先建空架構。可以把 GLOSSARY「常見問題：每章的最後一節」放寬成「有題目時，放在每章最後一節」。這會改到 GLOSSARY 的定義，請使用者決定。
9. **新增規則的門檻：先看到實際的錯誤，再加規則。**
   - 依據：mattpocock 的 SCOPE「Observed failure」、Anthropic 指南的「Build evaluations first」。
   - 可以搭配 skill-creator 的評估功能，確認刪掉某條規則之後，Agent 的表現沒有變差。

### 3. 未確認事項

- 公司用的 Git 平台和方案（決定 CODEOWNERS 能不能強制）。
- Quarto OJS 在 `embed-resources` 加上離線時能不能用。
- Docusaurus hash router 產生的 `index.html`，JS 和 CSS 是否也內嵌在同一個檔案。
- Marp 的 HTML 輸出會不會把圖片內嵌。
- Astro Starlight、Quartz 能不能用 `file://` 直接打開。
- Vale 的中文斷詞行為（上面的 `\b` 是推論，沒有實測）。
- GitLab 對 `{#id}` 和 `<a name>` 的實際顯示（沒有實測）。
- Slidev、Marp 的中文內容顯示（沒有查到官方說明，也沒有實測）。
