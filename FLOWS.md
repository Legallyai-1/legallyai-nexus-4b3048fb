# Release verification flows

## Existing main routes
- Open home, pricing, chat, contract review, custody, DUI, probation/parole, login, and settings at 360/390/1366px.
- Expect content or an honest sign-in requirement, no horizontal overflow, and no uncaught page errors.
- Do not complete payments, send support mail, or delete accounts in production QA.

## Contract excerpt handoff
- Paste a short excerpt and choose review. Expect every submitted character to reach chat.
- Paste an oversized excerpt with a distinctive final clause. Expect an inline error, retained draft, and no navigation or truncation.
- Use the explicit sample controls. Expect sample-only export and no invented numerical risk score.

## Chat protocol
- Isolated fixtures must prove first-token delivery before completion, UTF-8/CRLF parsing, error handling, abort, and timeout.
- All successful answer paths include the legal-information notice exactly once.
- Isolated fixtures do not establish production provider quality or authenticated billing behavior.
