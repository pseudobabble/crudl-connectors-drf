/* globals require, jest, expect, describe, it, beforeEach */
const numberedPagination = require('../../lib/middleware/numberedPagination');

const success = res => ({
  create: () => Promise.resolve(res),
  read: () => Promise.resolve(res),
  update: () => Promise.resolve(res),
  delete: () => Promise.resolve(res),
});

const firstPage = {
  status: 200,
  data: {
    total: 24,
    count: 8,
    next: 'http://127.0.0.1:8000/api/entries/?page=2',
    previous: null,
    results: [1, 2, 3],
  },
};

const middlePage = {
  status: 200,
  data: {
    total: 24,
    count: 8,
    next: 'http://127.0.0.1:8000/api/entries/?page=3',
    previous: 'http://127.0.0.1:8000/api/entries/?page=1',
    results: [4, 5, 6],
  },
};

const lastPage = {
  status: 200,
  data: {
    total: 24,
    count: 8,
    next: null,
    previous: 'http://127.0.0.1:8000/api/entries/?page=2',
    results: [7, 8],
  },
};

const noPage = {
  status: 200,
  data: [],
};

it('gets correct pagination info for the first page', () => {
  const mw = numberedPagination();
  const c = mw(success(firstPage));
  return c.read().then((res) => {
    expect(res.pagination).toEqual({
      type: 'numbered',
      allPages: ['1', '2', '3'],
      currentPage: 1,
      resultsTotal: 24,
      filteredTotal: 8,
    });
    expect(res.data).toEqual([1, 2, 3]);
  });
});

it('gets correct pagination info for the middle page', () => {
  const mw = numberedPagination();
  const c = mw(success(middlePage));
  return c.read().then((res) => {
    expect(res.pagination).toEqual({
      type: 'numbered',
      allPages: ['1', '2', '3'],
      currentPage: 2,
      resultsTotal: 24,
      filteredTotal: 8,
    });
    expect(res.data).toEqual([4, 5, 6]);
  });
});

it('gets correct pagination info for the last page', () => {
  const mw = numberedPagination();
  const c = mw(success(lastPage));
  return c.read().then((res) => {
    expect(res.pagination).toEqual({
      type: 'numbered',
      allPages: ['1', '2', '3'],
      currentPage: 3,
      resultsTotal: 24,
      filteredTotal: 8,
    });
    expect(res.data).toEqual([7, 8]);
  });
});

it('throws when response does not contain pagination info', () => {
  const mw = numberedPagination();
  const c = mw(success(noPage));
  return c.read().catch(e => e).then(e => expect(e.message).toMatch(/Wrong response format/));
});
