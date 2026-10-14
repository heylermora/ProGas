// Run only through Firestore emulators:exec, using a demo project.
const fs = require('fs');
const path = require('path');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } = require('firebase/firestore');

(async () => {
  const env = await initializeTestEnvironment({ projectId: 'demo-progas-analytics', firestore: { rules: fs.readFileSync(path.resolve(__dirname, '..', 'firestore.rules'), 'utf8') } });
  try {
    await env.withSecurityRulesDisabled(async context => {
      const db = context.firestore();
      await setDoc(doc(db, 'Sponsors', 'active'), { active: true, links: ['https://example.test', 'https://www.tiktok.com/@business'], socialLinks: { email: 'contact@example.test' } });
      await setDoc(doc(db, 'Sponsors', 'inactive'), { active: false, links: ['https://example.test'] });
      await setDoc(doc(db, 'users', 'admin'), { active: true, roles: ['admin'], userId: 'admin' });
      await setDoc(doc(db, 'users', 'staff'), { active: true, roles: ['colaborador'], userId: 'staff' });
    });
    const db = env.unauthenticatedContext().firestore();
    let count = 0;
    const write = (overrides = {}) => {
      const data = { type: 'link_click', sessionId: '00000000-0000-4000-8000-000000000001', digest: (++count).toString(16).padStart(64, '0'), businessId: 'active', url: 'https://example.test', network: 'website', source: 'mall', createdAt: serverTimestamp(), ...overrides };
      const ref = doc(db, 'PublicAnalyticsEvents', `${data.sessionId}_${data.type}_${data.digest}`);
      return { ref, data, promise: setDoc(ref, data) };
    };
    const valid = write();
    await assertSucceeds(valid.promise);
    await assertFails(getDoc(valid.ref));
    await assertFails(getDoc(doc(env.authenticatedContext('staff').firestore(), valid.ref.path)));
    await assertSucceeds(getDoc(doc(env.authenticatedContext('admin').firestore(), valid.ref.path)));
    await assertFails(setDoc(valid.ref, valid.data));
    await assertFails(updateDoc(valid.ref, { url: 'https://other.test' }));
    await assertFails(deleteDoc(valid.ref));
    for (const type of ['page_view', 'browse_click']) await assertSucceeds(write({ type, businessId: '', url: '', network: '', source: 'home' }).promise);
    await assertSucceeds(write({ url: 'https://www.tiktok.com/@business', network: 'tiktok', source: 'mall-preview' }).promise);
    await assertSucceeds(write({ url: 'mailto:contact@example.test', network: 'email' }).promise);
    for (const overrides of [
      { businessId: 'inactive' }, { businessId: 'unknown' }, { url: 'https://unpublished.test' },
      { source: 'admin' }, { type: 'fake_type' }, { sessionId: 'invalid' }, { visitorPhone: '00000000' },
      { createdAt: Timestamp.fromDate(new Date('2000-01-01')) },
    ]) await assertFails(write(overrides).promise);
    console.log('Analytics rules verified: valid public creation, published URLs, admin-only reads, immutable events and invalid data denied.');
  } finally { await env.cleanup(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
