# 💬 Message Moderation & Retention Policy

This document describes how MyScholaria handles message deletion, why
messages are not permanently erased on "Delete for everyone," and what
this means for users, administrators, and compliance.

---

## Summary

To protect minors and allow institutions to investigate misconduct,
harassment, or policy violations, messages are **not permanently
erased** when a user selects **"Delete for everyone."**

- The message is hidden from both participants' conversation view.
- The original content is retained in the database, flagged as
  deleted, and accessible only to authorized administrators for
  moderation and compliance purposes.
- This retention period follows the institution's configured data
  retention policy (see **Settings**).
- Users are informed of this behavior in the **Privacy Policy** at
  the point of account creation.

This approach balances user privacy with the safety obligations
schools have toward minors using the platform.

---

## Why this design choice

| Concern | How this policy addresses it |
|---|---|
| **Child safety** | Allows administrators to review reported or flagged conversations involving minors, even after a participant deletes their copy. |
| **Harassment / abuse investigations** | A user cannot erase evidence of harassment by deleting it before it's reported or reviewed. |
| **Institutional accountability** | Schools using MyScholaria may have legal or internal obligations to retain communication records for a defined period. |
| **User transparency** | Users are not misled into thinking the content is destroyed — this is disclosed upfront, not discovered after the fact. |

---

## What "Delete for everyone" actually does

| Action | Visible to sender/recipient? | Stored in database? | Visible to admins? |
|---|---|---|---|
| Delete for me | No (for that user only) | Yes | May be |
| Delete for everyone | No (for both participants) | Yes (flagged `deleted = true`) | May be  |

No deletion action in the current implementation results in
irreversible erasure of message content from the database.

---

## Access control

- Only users with an **administrator** role (or a designated
  moderation role, if configured) can view soft-deleted message
  content.
- Access to soft-deleted messages should be logged (who viewed what,
  and when) to maintain an audit trail and protect against misuse of
  this capability.
- Regular users (students, parents, teachers, staff without
  moderation rights) never see soft-deleted content again once it is
  deleted from their view.

---

## Data retention

- Soft-deleted messages are retained according to the institution's
  configured retention period (see **Settings → Data Retention**).
- After the retention period expires, soft-deleted messages should be
  permanently purged from the database via a scheduled job.
- Institutions are responsible for setting a retention period
  consistent with their own legal obligations and data minimization
  requirements under GDPR (or other applicable regulations).

---

## GDPR / Privacy Policy disclosure

Because "Delete for everyone" does not result in immediate erasure,
this behavior **must** be disclosed to users in the Privacy Policy
under the data retention / right to erasure sections. Suggested
clause:

> **Message Deletion.** When you delete a message "for everyone," the
> message is removed from view for all participants in the
> conversation. For safety, moderation, and compliance purposes —
> particularly to protect minors and to allow our institutional
> partners to investigate reports of misconduct or harassment — the
> original content is retained in our systems for a limited period
> defined by your institution's data retention settings. Access to
> this retained content is restricted to authorized administrators
> and is logged for audit purposes. After the retention period
> expires, the content is permanently deleted.

---

## Related

- See [`README.md`](../Readme.md) → **🛡️ Data Protection & Compliance**
  for the broader GDPR posture of MyScholaria.
- See `server/src/modules/messages/message.service.ts` for the
  implementation of `DeleteMessageForMe` and
  `DeleteMessageForEveryone`.