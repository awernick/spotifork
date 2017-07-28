class Retry {
  public static async do(
    fn: Function, n: number, timeout?: number): Promise<any> {

    if(n == 0) {
      throw new Error("Retry attempts exceeded");
    }

    try {
      await fn()
    } catch(e) {
      if(timeout) {
        await Retry.wait(timeout);
      }
      await Retry.do(fn, n-1);
    }
  }

  public static wait(ms: number) {
    return new Promise((resolve, reject) => {
      let id = setTimeout(() => {
        resolve();
      }, ms)
    })
  }
}

export default Retry;
