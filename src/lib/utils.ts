export const sum = (items: number[]) =>
  items.reduce((sum, current) => +sum + +current, 0);

export function sumField<T>(items: T[], getKey: (item: T) => number) {
  return sum(items.map(getKey));
}

export function avgField<T>(items: T[], getKey: (item: T) => number) {
  if (items.length === 0) return 0;
  const summedValues = sum(items.map(getKey));
  return Math.round(summedValues / items.length);
}
export function flatten<T>(nestedArrays: T[][]): T[] {
  return ([] as T[]).concat(...nestedArrays);
}

export function isEmptyOrSpaces(str: string) {
  return str === null || str === undefined || str.match(/^ *$/) !== null;
}

export function IsNullOrUndefined(value: unknown) {
  return value === null || value === undefined;
}

export function sort<T, K>(list: T[], getKey: (item: T) => K, desc = false) {
  list.sort((a: T, b: T) => {
    const valueA = getKey(a);
    const valueB = getKey(b);
    if (valueA < valueB) {
      return !desc ? -1 : 1;
    } else if (valueA > valueB) {
      return !desc ? 1 : -1;
    } else {
      return 0;
    }
  });
  return list;
}

export const getUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const trim = (s: string, c: string) => {
  if (c === ']') c = '\\]';
  if (c === '^') c = '\\^';
  if (c === '\\') c = '\\\\';
  return s.replace(new RegExp('^[' + c + ']+|[' + c + ']+$', 'g'), '');
};

export const getBetween = (s: string, start: string, stop: string) => {
  if (!s) return '';
  const indexStartWithoutCorrection = s.indexOf(start);
  const indexStopWithoutCorrection = s.indexOf(stop);
  if (indexStartWithoutCorrection === -1 || indexStopWithoutCorrection === -1) {
    return '';
  }
  const startIndex = indexStartWithoutCorrection + start.length;
  const stopIndex = indexStopWithoutCorrection + stop.length;

  return s.substring(startIndex, stopIndex);
};

export function removeDoubleSlashes(str: string) {
  const singleForwardSlashes = str
    .replace(/([^:]\/)\/+/g, '$1')
    .replace(/\/\//g, '/')
    .replace('http:/', 'http://')
    .replace('https:/', 'https://');
  return singleForwardSlashes;
}

export const dateId = () => {
  const dt = new Date();
  const year = dt.getFullYear();
  const month = (dt.getMonth() + 1).toString().padStart(2, '0');
  const day = dt.getDate().toString().padStart(2, '0');
  const hour = dt.getHours().toString().padStart(2, '0');
  const minutes = dt.getMinutes().toString().padStart(2, '0');
  const seconds = dt.getSeconds().toString().padStart(2, '0');
  const milliseconds = dt.getMilliseconds().toString().padStart(3, '0');
  return `${year}${month}${day}${hour}${minutes}${seconds}${milliseconds}`;
};

export const todayId = () => {
  const dt = new Date();
  const year = dt.getFullYear();
  const month = (dt.getMonth() + 1).toString().padStart(2, '0');
  const day = dt.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
};

export function convertFirebaseDate(
  dateObject: { seconds: number; nanoseconds: number } | Date
) {
  // let nanoseconds = 0;
  // if ((dateObject as { nanoseconds: number }).nanoseconds) {
  //     nanoseconds  = (dateObject as { nanoseconds: number }).nanoseconds;
  // }
  if ((dateObject as { seconds: number }).seconds) {
    const firebaseDate = dateObject as { seconds: number; nanoseconds: number };
    const convertedDate = new Date(firebaseDate.seconds * 1000);
    return convertedDate;
  }
  return dateObject as Date;
}

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// function onlyUnique(value: any, index: number, self: Array<any> ) {
//     return self.indexOf(value) === index;
//   }

export function getUnique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export function groupBy<T, K>(list: T[], getKey: (item: T) => K) {
  const map = new Map<K, T[]>();
  list.forEach((item) => {
    const key = getKey(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return Array.from(map);
}

export const timeout = (ms: number) =>
  new Promise((res) => setTimeout(() => res(''), ms));

export const waitUntilLoaded = async (
  query: string,
  elementCount = 1,
  timeoutMs = 5000
) => {
  // timeout because of unknown appendchild issue?
  await timeout(0);
  let observer: MutationObserver | undefined = undefined;
  const observablePromise = new Promise((resolve) => {
    let found = document.querySelectorAll(query).length === elementCount;
    if (found) {
      resolve(found);
    }
    const callback = function () {
      found = document.querySelectorAll(query).length === elementCount;
      if (found) {
        observer?.disconnect();
        resolve(found);
      }
    };
    // Create an observer instance linked to the callback function
    observer = new MutationObserver(callback);
    const config = { attributes: false, childList: true, subtree: true };
    observer.observe(document, config);
  });
  const timeoutPromise = timeout(timeoutMs);
  const value = await Promise.race([observablePromise, timeoutPromise]);
  if (observer) {
    (observer as MutationObserver).disconnect();
  }
  return value;
};

export const createCode = (length: number) => {
  let result = '';
  const characters = 'BCDFGHJKLMNPQRSTVWXYZ';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const parseUrl = (url: string) => {
  // eslint-disable-next-line no-useless-escape
  const m = url.match(
    // eslint-disable-next-line no-useless-escape
    /^(([^:\/?#]+:)?(?:\/\/((?:([^\/?#:]*):([^\/?#:]*)@)?([^\/?#:]*)(?::([^\/?#:]*))?)))?([^?#]*)(\?[^#]*)?(#.*)?$/
  );
  if (m) {
    const r = {
      hash: m[10] || '', // #asd
      host: m[3] || '', // localhost:257
      hostname: m[6] || '', // localhost
      href: m[0] || '', // http://username:password@localhost:257/deploy/?asd=asd#asd
      origin: m[1] || '', // http://username:password@localhost:257
      pathname: m[8] || (m[1] ? '/' : ''), // /deploy/
      port: m[7] || '', // 257
      protocol: m[2] || '', // http:
      search: m[9] || '', // ?asd=asd
      username: m[4] || '', // username
      password: m[5] || '', // password
    };
    if (r.protocol.length == 2) {
      r.protocol = 'file:///' + r.protocol.toUpperCase();
      r.origin = r.protocol + '//' + r.host;
    }
    r.href = r.origin + r.pathname + r.search + r.hash;
    return r;
  }
  return null;
};

export const truncate = (str: string, n: number, useWordBoundary: boolean) => {
  if (!str) return '';
  if (str?.length <= n) {
    return str;
  }
  const subString = str.substr(0, n - 1); // the original check
  return (
    (useWordBoundary
      ? subString.substr(0, subString.lastIndexOf(' '))
      : subString) + '...'
  );
};

export const waitForElement = (selector: string) => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};
