/* globals require, jest, expect, describe, it */
const errors = require('../../lib/middleware/errors');

const fail = (status, data, statusText) => ({
  create: () => Promise.reject({ status, data, statusText }),
  read: () => Promise.reject({ status, data, statusText }),
  update: () => Promise.reject({ status, data, statusText }),
  delete: () => Promise.reject({ status, data, statusText }),
});

describe('Throws correct errors', () => {
  it('Throws validation error', () => errors(fail(400, {})).create()
  .catch(
    error => expect(error.validationErrors).toEqual({}),
  ));

  it('Throws authorization error', () => errors(fail(401, {})).read()
  .catch(
    error => expect(error.authorizationError).toBe(true),
  ));

  it('Throws permission error', () => errors(fail(403, {})).update()
  .catch(
    error => expect(error.permissionError).toBe(true),
  ));

  it('Throws default error', () => errors(fail(500, {}, 'Server down!')).delete()
  .catch(
    error => expect(error.message).toBe('Server down!'),
  ));
});

describe('Transforms errors correctly', () => {
  it('transforms non_field_errors', () => {
    const c = errors(fail(400, {
      non_field_errors: 'xxx',
      firstName: 'required',
    }));

    c.create().catch(
      error => expect(error.validationErrors).toEqual({
        _error: 'xxx',
        firstName: 'required',
      }),
    );
  });

  it('otherwise leaves intact', () => {
    const c = errors(fail(400, {
      firstName: 'required',
      lastName: 'required',
    }));

    c.create().catch(
      error => expect(error.validationErrors).toEqual({
        firstName: 'required',
        lastName: 'required',
      }),
    );
  });
});