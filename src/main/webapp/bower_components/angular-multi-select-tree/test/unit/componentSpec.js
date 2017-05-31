describe('author.component-name', function () {

  beforeEach(module('author.component-name'));

  it('should have thingService', function () {
    inject(function (thingService) {
      expect(thingService).toBeDefined();
    });
  });

  describe('thingService', function () {

    var thingService;

    beforeEach(inject(function (_thingService_) {
      thingService = _thingService_;
    }));

    it('should be an object', function () {
      expect(typeof thingService).toBe('object');
    });

    it('should have a method sayHello()', function () {
      expect(thingService.sayHello).toBeDefined();
    });

    describe('sayHello()', function () {

      it('should be a function', function () {
        expect(typeof thingService.sayHello).toBe('function');
      });

      it('should return a string', function () {
        expect(typeof thingService.sayHello()).toBe('string');
      });

      it('should return \'Hello!\'', function () {
        expect(thingService.sayHello()).toEqual('Hello!');
      });
    });
  });
});
