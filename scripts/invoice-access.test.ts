// LEG-25: only roles that can read every org invoice may use the invoice generator.
import test from 'node:test';
import assert from 'node:assert/strict';
import { canReadOrgInvoices } from '../src/lib/invoiceAccess.ts';

const org = 'org-1';
test('owner/admin/manager in the same org can read org invoices', () => {
  for (const role of ['owner', 'admin', 'manager']) assert.equal(canReadOrgInvoices([{ role, organization_id: org }], org), true, role);
});
test('lawyers, paralegals, employees and clients cannot (fail closed)', () => {
  for (const role of ['lawyer', 'paralegal', 'employee', 'client', '', null]) assert.equal(canReadOrgInvoices([{ role, organization_id: org }], org), false, String(role));
});
test('a privileged role in a different org does not count', () => {
  assert.equal(canReadOrgInvoices([{ role: 'owner', organization_id: 'other' }], org), false);
  assert.equal(canReadOrgInvoices([{ role: 'owner', organization_id: null }], org), false);
});
test('no roles, no org or a failed lookup means no access', () => {
  assert.equal(canReadOrgInvoices([], org), false);
  assert.equal(canReadOrgInvoices(null, org), false);
  assert.equal(canReadOrgInvoices([{ role: 'owner', organization_id: org }], null), false);
});
