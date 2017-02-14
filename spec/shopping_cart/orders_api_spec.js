import '../spec_helper';

describe('OrdersApi', () => {
  let subject;
  beforeEach(() => {
    subject = require('../../shopping_cart/orders_api');
    process.env.ORDERS_HOST = 'http://example.com';
  });
  
  afterEach(() => {
    delete process.env.ORDERS_HOST;
  });

  describe('#processOrder', () => {
    describe('when it is successful', () => {
      const text = 'it works!';
      beforeEach(() => {
        spyOn(global, 'fetch').and.callFake(() => {
          return Promise.resolve({
            status: 200,
            text() { return Promise.resolve(text);}
          });
        });
      });

      it.async('makes an ajax call to /process-order and returns text', async () => {
        expect(await subject.processOrder()).toBe(text);
        expect(global.fetch).toHaveBeenCalledWith('http://example.com/process-order', {});
      });
    });

    describe('when it is not successful', () => {
      let error;
      beforeEach(() => {
        error = {response: {status: 500}};
        spyOn(global, 'fetch').and.callFake(() => Promise.reject(error));
      });

      it.async('makes an ajax call to /process-order and returns text', async () => {
        const err = await subject.processOrder().catch(e => Promise.resolve(e));
        expect(err).toEqual(error);
      });
    });
  });
});