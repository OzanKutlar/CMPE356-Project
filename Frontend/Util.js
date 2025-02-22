class Utils {
  static delay = 500;

  static fakeAPI(obj, callback) {
    setTimeout(() => {
      callback(obj);
    }, Utils.delay);
  }
}

export default Utils;
