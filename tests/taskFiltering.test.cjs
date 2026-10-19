const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const Task = require('../models/taskModel');
const RequestQueryHandler = require('../utils/requestQueryHandler');

const readSource = (file) =>
  fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('vehicle search preserves percent signs, encoded-looking text and regex literals', () => {
  for (const search of ['100% electric', 'Audi%20A4', 'Audi (A4)+']) {
    const handler = new RequestQueryHandler(Task.find(), { search }).filter();
    const regex = handler.query.getFilter().carModel.$regex;
    assert.equal(regex.test(search), true);
    assert.equal(regex.test('unrelated vehicle'), false);
  }
});

test('Mongoose accepts atomic status transitions and rejects invalid statuses before writing', async (t) => {
  const writes = [];
  t.mock.method(Task.collection, 'updateMany', async (filter, update) => {
    writes.push({ filter, update });
    return { acknowledged: true, matchedCount: 2, modifiedCount: 2 };
  });
  const filter = { _id: { $in: ['507f1f77bcf86cd799439011'] } };
  for (const status of ['pending', 'complete', 'open', 'in-progress']) {
    await Task.setTaskStatus(filter, status);
    const [{ $set: update }] = writes.at(-1).update;
    assert.equal(update.taskStatus, status);
    assert.equal(
      update.statusRank,
      { open: 1, 'in-progress': 2, pending: 3, complete: 4 }[status],
    );
    if (['pending', 'complete'].includes(status)) {
      // Mongoose must pass the expression through, rather than casting it to
      // a fixed Date shared by tasks with different completion histories.
      assert.equal(typeof update.completedAt, 'object');
      assert.equal(update.completedAt instanceof Date, false);
    } else {
      assert.equal(update.completedAt, '$$REMOVE');
    }
  }
  assert.throws(
    () => Task.setTaskStatus(filter, 'invalid'),
    /Invalid task status/,
  );
  assert.equal(writes.length, 4);
});

test('document saves set, retain, clear and renew completion dates', async (t) => {
  t.mock.method(Task.collection, 'insertOne', async () => ({
    acknowledged: true,
  }));
  t.mock.method(Task.collection, 'updateOne', async () => ({
    acknowledged: true,
    matchedCount: 1,
  }));
  const task = new Task({
    user: '507f1f77bcf86cd799439011',
    taskStatus: 'pending',
  });
  await task.save();
  assert.ok(task.completedAt instanceof Date);
  const originalDate = new Date('2026-01-10T12:00:00Z');
  task.completedAt = originalDate;
  await task.save();
  task.taskStatus = 'complete';
  await task.save();
  assert.equal(task.completedAt.getTime(), originalDate.getTime());
  task.taskStatus = 'open';
  await task.save();
  assert.equal(task.completedAt, undefined);
  task.taskStatus = 'pending';
  await task.save();
  assert.ok(task.completedAt > originalDate);
});

test('local date boundaries include the entire local day across DST changes', () => {
  const oldTimeZone = process.env.TZ;
  process.env.TZ = 'Europe/Amsterdam';
  try {
    const source = readSource('public/js/taskDateFilters.js').replace(
      'export const',
      'const',
    );
    const context = { Date };
    vm.runInNewContext(
      `${source}\nthis.boundary = getLocalDateBoundary;`,
      context,
    );
    const boundary = context.boundary;
    assert.equal(boundary('2026-10-19'), '2026-10-19T00:00:00+02:00');
    assert.ok(
      new Date('2026-10-19T00:30:00+02:00') >= new Date(boundary('2026-10-19')),
    );
    assert.equal(boundary('2026-03-29', 1), '2026-03-30T00:00:00+02:00');
    assert.equal(boundary('2026-10-25', 1), '2026-10-26T00:00:00+01:00');
    assert.equal(
      new Date(boundary('2026-03-29', 1)) - new Date(boundary('2026-03-29')),
      23 * 3600000,
    );
    assert.equal(
      new Date(boundary('2026-10-25', 1)) - new Date(boundary('2026-10-25')),
      25 * 3600000,
    );
  } finally {
    if (oldTimeZone === undefined) delete process.env.TZ;
    else process.env.TZ = oldTimeZone;
  }
});

const createReport = async (tasks, fail = false) => {
  const requests = [];
  const alerts = [];
  const downloads = [];
  const source = readSource('public/js/generateReport.js');
  const code = source
    .slice(
      source.indexOf('const getFilteredResults ='),
      source.indexOf('// export const generateTaskPDF'),
    )
    .replace('export const generatePDF', 'const generatePDF');
  const context = {
    URLSearchParams,
    window: {
      location: {
        search:
          '?page=3&limit=15&fields=carModel&search=100%25&taskStatus=pending&completedAt%5Bgte%5D=2026-10-19T00%3A00%3A00%2B02%3A00',
      },
    },
    axios: async (request) => {
      requests.push(request);
      if (fail) throw new Error('Network failure');
      return { data: { status: 'success', tasks } };
    },
    he: { decode: (value) => value },
    showAlert: (...args) => alerts.push(args),
    pdfMake: {
      createPdf: (definition) => ({
        download: (name) => downloads.push({ definition, name }),
      }),
    },
  };
  vm.runInNewContext(`${code}\nthis.generate = generatePDF;`, context);
  await context.generate();
  return { requests, alerts, downloads };
};

test('PDF exports all matches and computes its period independently of status order', async () => {
  const makeTask = (createdAt) => ({
    user: { name: 'Customer' },
    carModel: 'Audi A4',
    taskStatus: 'pending',
    totalCost: 10,
    createdAt,
  });
  const tasks = [
    makeTask('2026-06-10T12:00:00Z'),
    makeTask('2026-01-01T12:00:00Z'),
    makeTask('2026-12-31T12:00:00Z'),
    ...Array.from({ length: 1002 }, () => makeTask('2026-06-15T12:00:00Z')),
  ];
  const { requests, alerts, downloads } = await createReport(tasks);
  const url = new URL(requests[0].url, 'https://example.test');
  assert.equal(url.pathname, '/api/v1/tasks/report-data');
  for (const field of ['page', 'limit', 'fields'])
    assert.equal(url.searchParams.has(field), false);
  assert.equal(url.searchParams.get('search'), '100%');
  assert.equal(url.searchParams.get('taskStatus'), 'pending');
  assert.equal(
    url.searchParams.get('completedAt[gte]'),
    '2026-10-19T00:00:00+02:00',
  );
  assert.equal(alerts.length, 0);
  assert.equal(
    downloads[0].definition.content[0].text,
    'Period: Jan 01, 2026 t/m Dec 31, 2026',
  );
  const rows = downloads[0].definition.content[2].table.body;
  assert.equal(rows.length, tasks.length + 2);
  assert.equal(rows.at(-1)[3].text, tasks.length * 10);
});

test('empty PDF results and failed requests show an alert without creating a PDF', async () => {
  for (const fail of [false, true]) {
    const { alerts, downloads } = await createReport([], fail);
    assert.equal(alerts.length, 1);
    assert.equal(downloads.length, 0);
  }
});

const invoke = (handler, req) =>
  new Promise((resolve, reject) => {
    const res = {
      status() {
        return this;
      },
      json: resolve,
      render: (view, locals) => resolve({ view, locals }),
    };
    handler(req, res, reject);
  });

test('report endpoint applies filters without pagination or field projection', async (t) => {
  const controller = require('../controllers/taskController');
  const queries = [];
  const tasks = Array.from({ length: 1001 }, () => ({ carModel: 'Audi A4' }));
  t.mock.method(Task.Query.prototype, 'exec', async function () {
    queries.push(this);
    return tasks;
  });
  const result = await invoke(controller.getTaskReportData, {
    user: { role: 'user', id: '507f1f77bcf86cd799439011' },
    query: {
      page: 3,
      limit: 15,
      fields: 'carModel',
      user: '507f191e810c19729de860ea',
      search: 'Audi',
      taskStatus: 'pending',
    },
  });
  assert.equal(result.tasks.length, 1001);
  assert.equal(queries[0].getFilter().user, '507f1f77bcf86cd799439011');
  assert.equal(queries[0].getFilter().taskStatus, 'pending');
  assert.equal(queries[0].getFilter().carModel.$regex.test('Audi A4'), true);
  assert.equal(queries[0].getOptions().skip, undefined);
  assert.equal(queries[0].getOptions().limit, undefined);
  assert.equal(queries[0].projection(), undefined);
});

test('both status controllers use the shared transition rules', async (t) => {
  const controller = require('../controllers/taskController');
  const writes = [];
  t.mock.method(Task, 'setTaskStatus', async (filter, status) => {
    writes.push({ filter, status });
  });
  const id = '507f1f77bcf86cd799439011';
  await invoke(controller.updateDents, {
    user: { role: 'admin' },
    params: { id },
    body: { taskStatus: 'complete' },
  });
  await invoke(controller.updateStatusBulk, {
    user: { role: 'admin' },
    body: { selectedTasks: [id], updatedStatus: 'pending' },
  });
  assert.deepEqual(writes, [
    { filter: { _id: id }, status: 'complete' },
    { filter: { _id: { $in: [id] } }, status: 'pending' },
  ]);
});

test('date inputs round-trip independently of the server timezone', async (t) => {
  const controller = require('../controllers/viewsController');
  t.mock.method(Task.Query.prototype, 'exec', async () => []);
  const oldTimeZone = process.env.TZ;
  process.env.TZ = 'America/Los_Angeles';
  try {
    for (const completedAt of [
      { gte: '2026-03-29T00:00:00+01:00', lt: '2026-03-30T00:00:00+02:00' },
      { gte: '2026-10-25T00:00:00+02:00', lt: '2026-10-26T00:00:00+01:00' },
      { gte: '2026-10-25', lt: '2026-10-26' },
    ]) {
      const { locals } = await invoke(controller.getMyTasks, {
        user: { role: 'user', id: '507f1f77bcf86cd799439011' },
        query: { completedAt },
      });
      assert.equal(locals.from, completedAt.gte.slice(0, 10));
      assert.equal(locals.to, completedAt.gte.slice(0, 10));
      const handler = new RequestQueryHandler(Task.find(), {
        completedAt,
      }).filter();
      handler.query.cast(Task);
      assert.equal(
        handler.query.getFilter().completedAt.$gte.getTime(),
        new Date(completedAt.gte).getTime(),
      );
      assert.equal(
        handler.query.getFilter().completedAt.$lt.getTime(),
        new Date(completedAt.lt).getTime(),
      );
    }
  } finally {
    if (oldTimeZone === undefined) delete process.env.TZ;
    else process.env.TZ = oldTimeZone;
  }
});
