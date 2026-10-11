/**
 * Firestore Security Rules Verification Specification (Dirty Dozen Test Suite)
 * Verifies that all 12 adversarial payloads in security_spec.md return PERMISSION_DENIED.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  pillar: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: {
    uid: string;
    email?: string;
    email_verified?: boolean;
  } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on ClassRoom create',
    pillar: 'Pillar 2: Validation Blueprints (hasOnly)',
    collectionPath: '/classes/cls_1',
    operation: 'create',
    auth: { uid: 'user_uid_1', email: 'guru@baiturrahman.sch.id', email_verified: true },
    payload: {
      id: 1,
      docId: 'cls_1',
      ownerId: 'user_uid_1',
      name: 'Aliyah 1',
      teacher: 'Ust. Ridwan',
      isSuperAdmin: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Identity Spoofing on Grade create',
    pillar: 'Pillar 2: Identity Integrity',
    collectionPath: '/grades/grd_101',
    operation: 'create',
    auth: { uid: 'attacker_uid', email: 'attacker@example.com', email_verified: true },
    payload: {
      id: 101,
      docId: 'grd_101',
      ownerId: 'victim_uid',
      studentId: 1,
      studentDocId: 'std_1',
      subjectId: 14,
      subjectDocId: 'sub_14',
      classId: 1,
      classDocId: 'cls_1',
      semester: 1,
      score: 90,
      testDate: '2025-10-12',
      type: 'regular',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Path Variable ID Poisoning with invalid characters',
    pillar: 'Pillar 3: Path Variable Hardening',
    collectionPath: '/subjects/invalid$id!with_spaces',
    operation: 'create',
    auth: { uid: 'user_uid_1', email: 'guru@baiturrahman.sch.id', email_verified: true },
    payload: {
      id: 99,
      docId: 'invalid$id!with_spaces',
      ownerId: 'user_uid_1',
      name: 'Fiqih',
      category: 'Diniyah',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Unverified Email Spoofing Attack on Admin privileges',
    pillar: 'Phase 5: Email Spoofing Test',
    collectionPath: '/admins/spoofed_admin_uid',
    operation: 'create',
    auth: { uid: 'spoofed_admin_uid', email: 'akhirzaman998@gmail.com', email_verified: false },
    payload: {
      uid: 'spoofed_admin_uid',
      role: 'superadmin',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Cross-User PII Harvesting on UserProfile',
    pillar: 'Pillar 6: PII Isolation',
    collectionPath: '/users/usr_1',
    operation: 'get',
    auth: { uid: 'user_uid_2', email: 'other@baiturrahman.sch.id', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Orphaned Student Creation without existing ClassRoom',
    pillar: 'Constraint 11: Global Consistency Invariant',
    collectionPath: '/students/std_500',
    operation: 'create',
    auth: { uid: 'user_uid_1', email: 'guru@baiturrahman.sch.id', email_verified: true },
    payload: {
      id: 500,
      docId: 'std_500',
      ownerId: 'user_uid_1',
      nis: '99999',
      name: 'Santri Orphan',
      classId: 999,
      classDocId: 'cls_nonexistent',
      birthPlace: 'Bandung',
      birthDate: '2010-01-01',
      guardian: 'Wali',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Subcollection Master Gate Bypass on ExamQuestion',
    pillar: 'Pillar 1: Master Gate Relational Sync',
    collectionPath: '/exam_packages/pkg_65/questions/q_99',
    operation: 'create',
    auth: { uid: 'attacker_uid', email: 'attacker@example.com', email_verified: true },
    payload: {
      id: 99,
      docId: 'q_99',
      packageDocId: 'pkg_65',
      ownerId: 'attacker_uid',
      text: 'Soal Injeksi',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Terminal State Mutation on Published ReportCard',
    pillar: 'Constraint 6: Terminal State Locking',
    collectionPath: '/report_cards/rep_4_1_2025-2026',
    operation: 'update',
    auth: { uid: 'user_uid_1', email: 'guru@baiturrahman.sch.id', email_verified: true },
    payload: {
      teacherNotes: 'Catatan diubah setelah rilis resmi',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Value Poisoning on Whitelisted Grade score field',
    pillar: 'Phase 5: Value Poisoning Test',
    collectionPath: '/grades/grd_101',
    operation: 'update',
    auth: { uid: 'user_uid_1', email: 'guru@baiturrahman.sch.id', email_verified: true },
    payload: {
      score: 9999,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Immortal Field Tampering on ClassRoom createdAt',
    pillar: 'Constraint 12: Immortal Field Rule',
    collectionPath: '/classes/cls_1',
    operation: 'update',
    auth: { uid: 'user_uid_1', email: 'guru@baiturrahman.sch.id', email_verified: true },
    payload: {
      name: 'Aliyah Baru',
      createdAt: '2020-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Client Timestamp Forgery on ClassRoom create',
    pillar: 'Constraint 13: Temporal Integrity',
    collectionPath: '/classes/cls_2',
    operation: 'create',
    auth: { uid: 'user_uid_1', email: 'guru@baiturrahman.sch.id', email_verified: true },
    payload: {
      id: 2,
      docId: 'cls_2',
      ownerId: 'user_uid_1',
      name: 'Kelas Forged Time',
      teacher: 'Ust. Ahmad',
      createdAt: '2099-01-01T00:00:00Z',
      updatedAt: '2099-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Unconstrained Cross-Tenant List Query Scraping on Students',
    pillar: 'Pillar 8: Secure List Queries',
    collectionPath: '/students',
    operation: 'list',
    auth: { uid: 'attacker_uid', email: 'attacker@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
];
