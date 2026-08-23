const fs = require('fs');

function fixReadlinkError(err, path) {
  if (err && (err.code === 'EISDIR' || err.code === 'UNKNOWN' || err.code === 'EPERM')) {
    const einval = new Error(`EINVAL: invalid argument, readlink '${path}'`);
    einval.code = 'EINVAL';
    einval.errno = -4071;
    einval.syscall = 'readlink';
    return einval;
  }
  return err;
}

const origReadlinkSync = fs.readlinkSync;
fs.readlinkSync = function (path, options) {
  try {
    return origReadlinkSync.call(fs, path, options);
  } catch (err) {
    throw fixReadlinkError(err, path);
  }
};

const origReadlink = fs.readlink;
fs.readlink = function (path, ...args) {
  const cb = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;
  const otherArgs = cb ? args.slice(0, -1) : args;
  if (!cb) return origReadlink.call(fs, path, ...args);
  return origReadlink.call(fs, path, ...otherArgs, (err, linkString) => {
    return cb(fixReadlinkError(err, path), linkString);
  });
};

if (fs.promises) {
  const origPromisesReadlink = fs.promises.readlink;
  fs.promises.readlink = async function (path, options) {
    try {
      return await origPromisesReadlink.call(fs.promises, path, options);
    } catch (err) {
      throw fixReadlinkError(err, path);
    }
  };
}
