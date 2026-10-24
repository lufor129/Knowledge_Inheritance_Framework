# 改框架

框架是 AGENTS.md、CLAUDE.md、GLOSSARY.md、docs/、framework/、.claude/、.github/。修改要開變更提案，由框架維護者核准。

## 加規則

先看到錯誤，才加規則：

1. 同一個錯至少出現兩次，才考慮加規則。
2. 先問能不能用程式判斷。能，就加進 `framework/tools/check.py`：判斷得準的擋（✗），判斷不準的只提醒（△）。
3. 程式判斷不了，才寫進 AGENTS.md 或對應的 skill，寫成「要做什麼」。
4. 只加這一條。還沒發生過的錯，不預先加規則。

## 改引擎

`framework/engine/` 是所有知識庫共用的。CI 在每個變更提案上都會建置每一個知識庫；全部成功才可以合併。
