# Security Specification — Sistem Rapor Digital (Zero-Trust ABAC Firestore Architecture)

## 1. Data Invariants & Master Source of Truth

1. **Global Default-Deny Safety Net**: Every path not explicitly matched is unconditionally denied (`allow read, write: if false;`).
2. **Verified Identity Invariant**: All write and read operations require a valid, non-null Firebase Authentication session with `request.auth.token.email_verified == true`.
3. **Bootstrapped & Database Admin Invariant**: Administrative elevation (`isAdmin()`) is only granted if `request.auth.token.email_verified == true` AND either `request.auth.token.email in ['nasam998@gmail.com', 'akhirzaman998@gmail.com', 'mediabaiturrahman01@gmail.com']` or `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`. Client-provided role strings in user profiles never grant administrative privileges.
4. **Master Gate & Relational Consistency Invariant**:
   - Subcollection `/exam_packages/{packageId}/questions/{questionId}` MUST verify parent ownership via `get(/databases/$(database)/documents/exam_packages/$(packageId)).data.ownerId == request.auth.uid`.
   - Child entities (`students`, `grades`, `tahfidz_grades`, `report_cards`, `exam_files`, `exam_packages`) MUST verify the existence of their referenced parent documents (`classes`, `subjects`, `students`) via `exists()` upon creation.
5. **PII Isolation Invariant**: `/users/{userId}` contains educator `email` and profile information. `get` and `list` operations on `/users` are strictly restricted to the document owner (`resource.data.ownerId == request.auth.uid`) or `isAdmin()`. Blanket `isSignedIn()` reads are forbidden.
6. **Terminal State Locking Invariant**: Once a `ReportCard` in `/report_cards/{reportId}` reaches `status == 'published'`, all further client modifications are locked (`existing().status != 'published'`) unless executed by `isAdmin()`.
7. **Temporal & Immortal Field Integrity**:
   - On `create`: `incoming().createdAt == request.time && incoming().updatedAt == request.time`.
   - On `update`: `incoming().createdAt == existing().createdAt && incoming().ownerId == existing().ownerId && incoming().updatedAt == request.time`.
8. **Secure List Query Enforcer**: Every `allow list` rule explicitly enforces `resource.data.ownerId == request.auth.uid` (or `isAdmin()`), preventing unauthorized cross-tenant query scraping without incurring `O(n)` `get()` read explosions.

---

## 2. The "Dirty Dozen" Adversarial Payloads

### Payload 1: Shadow Field Injection (Pillar 2 — Anti-Update-Gap)
Attempts to inject an undeclared `isSuperAdmin: true` ghost key into `/classes/cls_1`.
```json
{
  "id": 1,
  "docId": "cls_1",
  "ownerId": "user_uid_1",
  "name": "Aliyah 1",
  "teacher": "Ust. Ridwan",
  "isSuperAdmin": true,
  "createdAt": "SERVER_TIMESTAMP",
  "updatedAt": "SERVER_TIMESTAMP"
}
```
**Expected Outcome**: `PERMISSION_DENIED` (blocked by `data.keys().hasOnly(...)`).

### Payload 2: Identity Spoofing on Creation (Pillar 2 — Identity Integrity)
Authenticated as `attacker_uid`, attempts to create a grade under `ownerId: "victim_uid"`.
```json
{
  "id": 101,
  "docId": "grd_101",
  "ownerId": "victim_uid",
  "studentId": 1,
  "studentDocId": "std_1",
  "subjectId": 14,
  "subjectDocId": "sub_14",
  "classId": 1,
  "classDocId": "cls_1",
  "semester": 1,
  "score": 90,
  "testDate": "2025-10-12",
  "type": "regular",
  "createdAt": "SERVER_TIMESTAMP",
  "updatedAt": "SERVER_TIMESTAMP"
}
```
**Expected Outcome**: `PERMISSION_DENIED` (blocked by `data.ownerId == request.auth.uid`).

### Payload 3: Path Variable ID Poisoning (Pillar 3 — Regex & Size Guard)
Attempts to create `/subjects/invalid$id!with spaces` or a 200-character document ID.
```json
{
  "id": 99,
  "docId": "invalid$id!with spaces",
  "ownerId": "user_uid_1",
  "name": "Fiqih",
  "category": "Diniyah",
  "createdAt": "SERVER_TIMESTAMP",
  "updatedAt": "SERVER_TIMESTAMP"
}
```
**Expected Outcome**: `PERMISSION_DENIED` (blocked by `isValidId(subjectId)` regex `^[a-zA-Z0-9_\-]+$`).

### Payload 4: Unverified Email Spoofing Attack (Phase 5 — Email Spoofing Test)
Authenticated with `email: "akhirzaman998@gmail.com"` but `email_verified: false`.
```json
{
  "uid": "spoofed_admin_uid",
  "role": "superadmin",
  "createdAt": "SERVER_TIMESTAMP",
  "updatedAt": "SERVER_TIMESTAMP"
}
```
**Expected Outcome**: `PERMISSION_DENIED` (blocked by `request.auth.token.email_verified == true`).

### Payload 5: Cross-User PII Harvesting (Pillar 6 — PII Isolation)
Authenticated as `user_uid_2`, attempts `get(/databases/(default)/documents/users/usr_1)` belonging to `user_uid_1`.
```json
{
  "operation": "get",
  "path": "/users/usr_1",
  "auth": { "uid": "user_uid_2", "email_verified": true }
}
```
**Expected Outcome**: `PERMISSION_DENIED` (blocked by `existing().ownerId == request.auth.uid || isAdmin()`).

### Payload 6: Orphaned Child Creation (Constraint 11 — Global Consistency Invariant)
Attempts to create a `Student` referencing a non-existent `classDocId: "cls_nonexistent"`.
```json
{
  "id": 500,
  "docId": "std_500",
  "ownerId": "user_uid_1",
  "nis": "99999",
  "name": "Santri Orphan",
  "classId": 999,
  "classDocId": "cls_nonexistent",
  "birthPlace": "Bandung",
  "birthDate": "2010-01-01",
  "guardian": "Wali",
  "createdAt": "SERVER_TIMESTAMP",
  "updatedAt": "SERVER_TIMESTAMP"
}
```
**Expected Outcome**: `PERMISSION_DENIED` (blocked by `exists(/databases/$(database)/documents/classes/$(incoming().classDocId))`).

### Payload 7: Subcollection Master Gate Bypass (Pillar 1 — Relational Sync)
Authenticated as `attacker_uid`, attempts to add a question to `/exam_packages/pkg_65/questions/q_99` where `pkg_65` is owned by `user_uid_1`.
```json
{
  "id": 99,
  "docId": "q_99",
  "packageDocId": "pkg_65",
  "ownerId": "attacker_uid",
  "text": "Soal Injeksi",
  "optionA": "",
  "optionB": "",
  "optionC": "",
  "optionD": "",
  "correctAnswer": "",
  "createdAt": "SERVER_TIMESTAMP",
  "updatedAt": "SERVER_TIMESTAMP"
}
```
**Expected Outcome**: `PERMISSION_DENIED` (blocked by Master Gate `get(/databases/$(database)/documents/exam_packages/$(packageId)).data.ownerId == request.auth.uid`).

### Payload 8: Terminal State Mutation on Published Report Card (Constraint 6 — Terminal State Locking)
Non-admin owner attempts to modify `teacherNotes` on a `ReportCard` whose current `status` is already `'published'`.
```json
{
  "teacherNotes": "Catatan diubah setelah rilis resmi",
  "updatedAt": "SERVER_TIMESTAMP"
}
```
**Expected Outcome**: `PERMISSION_DENIED` (blocked by `existing().status != 'published' || isAdmin()`).

### Payload 9: Value Poisoning on Whitelisted Update Field (Phase 5 — Value Poisoning Test)
Attempts to update `score` in `/grades/grd_101` with an out-of-range value (`score: 9999`) or string type (`score: "A+"`).
```json
{
  "score": 9999,
  "updatedAt": "SERVER_TIMESTAMP"
}
```
**Expected Outcome**: `PERMISSION_DENIED` (blocked by `isValidGrade(incoming())` enforcing `data.score >= 0 && data.score <= 100`).

### Payload 10: Immortal Field Tampering (`createdAt` / `ownerId` Mutation)
Owner attempts to backdate `createdAt` or transfer `ownerId` during an `update` on `/classes/cls_1`.
```json
{
  "name": "Aliyah Baru",
  "createdAt": "2020-01-01T00:00:00Z",
  "updatedAt": "SERVER_TIMESTAMP"
}
```
**Expected Outcome**: `PERMISSION_DENIED` (blocked by `incoming().createdAt == existing().createdAt` and `affectedKeys().hasOnly(...)`).

### Payload 11: Client Timestamp Forgery (Constraint 13 — Temporal Integrity)
Client supplies a custom future timestamp instead of `request.time` (`serverTimestamp()`) on creation.
```json
{
  "id": 2,
  "docId": "cls_2",
  "ownerId": "user_uid_1",
  "name": "Kelas Forged Time",
  "teacher": "Ust. Ahmad",
  "createdAt": "2099-01-01T00:00:00Z",
  "updatedAt": "2099-01-01T00:00:00Z"
}
```
**Expected Outcome**: `PERMISSION_DENIED` (blocked by `incoming().createdAt == request.time && incoming().updatedAt == request.time`).

### Payload 12: Unconstrained List Query Scraping (Pillar 8 — Query Enforcer)
Authenticated user `attacker_uid` executes an unconstrained `list` query on `/students` without filtering `where('ownerId', '==', 'attacker_uid')`.
```json
{
  "operation": "list",
  "path": "/students",
  "auth": { "uid": "attacker_uid", "email_verified": true }
}
```
**Expected Outcome**: `PERMISSION_DENIED` (blocked by `allow list: if isVerified() && (resource.data.ownerId == request.auth.uid || isAdmin())`).
