import test from 'node:test';
import assert from 'node:assert/strict';
import { formatAppointmentWhen, loadDashboardData } from '../src/lib/dashboardData.ts';

type Call = { table: string; ops: [string, unknown[]][] };

function fakeClient(results: Record<string, unknown[]>) {
  const calls: Call[] = [];
  const seen: Record<string, number> = {};
  return {
    calls,
    from(table: string) {
      const call: Call = { table, ops: [] };
      calls.push(call);
      const idx = (seen[table] = (seen[table] ?? -1) + 1);
      const result = (results[table] ?? [])[idx] ?? { data: [], count: 0, error: null };
      const builder: Record<string, unknown> = {
        then: (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) => Promise.resolve(result).then(res, rej),
      };
      for (const op of ['select', 'eq', 'in', 'gte', 'order', 'limit']) {
        builder[op] = (...args: unknown[]) => { call.ops.push([op, args]); return builder; };
      }
      return builder;
    },
  };
}

test('every dashboard query is scoped to the active organization', async () => {
  const client = fakeClient({});
  await loadDashboardData(client, 'org-1', new Date('2026-10-29T12:00:00Z'));
  assert.equal(client.calls.length, 5);
  for (const call of client.calls) {
    assert.ok(
      call.ops.some(([op, args]) => op === 'eq' && args[0] === 'organization_id' && args[1] === 'org-1'),
      `${call.table} query is not org-scoped`,
    );
  }
});

test('upcoming appointments exclude cancelled and no-show visits', async () => {
  const client = fakeClient({});
  await loadDashboardData(client, 'org-1');
  const appt = client.calls.find((c) => c.table === 'appointments')!;
  const inOp = appt.ops.find(([op]) => op === 'in')!;
  assert.deepEqual(inOp[1], ['status', ['scheduled', 'confirmed']]);
});

test('totals are computed and failures are reported instead of silent zeros', async () => {
  const client = fakeClient({
    cases: [{ count: 3, error: null }, { data: [{ id: 'c1', title: 'Doe v. Roe', status: 'active', updated_at: '2026-10-28T00:00:00Z' }], error: null }],
    clients: [{ count: null, error: { message: 'permission denied' } }],
    appointments: [{ data: [{ id: 'a1', title: null, start_time: '2026-10-30T17:00:00Z', clients: null }], count: 1, error: null }],
    invoices: [{ data: [{ amount: 100.5 }, { amount: null }, { amount: 50 }], error: null }],
  });
  const result = await loadDashboardData(client, 'org-1');
  assert.deepEqual(result.stats, { activeCases: 3, clients: 0, upcomingAppointments: 1, pendingInvoices: 150.5 });
  assert.deepEqual(result.failed, ['clients']);
  assert.equal(result.appointments[0].title, 'Appointment');
  assert.equal(result.appointments[0].clientName, 'Unknown client');
  assert.equal(result.recentCases[0].title, 'Doe v. Roe');
});

test('appointment times say which day they are on', () => {
  const now = new Date(2026, 9, 29, 9, 0);
  assert.match(formatAppointmentWhen(new Date(2026, 9, 29, 14, 30).toISOString(), now, 'en-US'), /^Today 2:30/);
  assert.match(formatAppointmentWhen(new Date(2026, 9, 30, 9, 0).toISOString(), now, 'en-US'), /^Tomorrow 9:00/);
  assert.match(formatAppointmentWhen(new Date(2026, 10, 4, 9, 0).toISOString(), now, 'en-US'), /^Nov 4, 9:00/);
  assert.equal(formatAppointmentWhen('not a date', now), 'Time not set');
});
