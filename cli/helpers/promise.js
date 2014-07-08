var Promise = require('bluebird')
  , logger = require('ezseed-logger')
  , i18n = require('i18n')
  , util = require('util')
  , debug = require('debug')('ezseed:cli')

var pw = ''

module.exports = {
  runasroot: function(cmd) {

    var args = [].slice.call(arguments)

    if(args.length == 2) {
      pw = args[0], cmd = args[1]
    } else {
      cmd = args[1]
    }

    var c = pw ? 'echo "'+pw+'" | ' : ''
        c += 'sudo -S su root -c "'+cmd+'"'

    return require('./spawner')
      .spawn(c)
  },
  checkroot: function() {
    if(process.getuid() !== 0) {
      logger().error('Sorry but this needs to be run as root. Exiting.')
      process.exit(1)
    } else {
      return true
    }

  },
  next: function() {
    var args = [].slice.call(arguments)
    return new Promise(function(resolve, reject) { return resolve.apply(null, args) })
  },
  condition: function(condition, success, failed) {

    if(condition)
      return success()
    else
      return typeof failed == 'function' ? failed() : this.next()

  },
  exit: function() {
    var message = util.format.call(util, arguments)

    return function(code) {
      if(code === 0)
        logger('exit').info(message, i18n.__('was successful'))
      else {
        if(code instanceof Error) {
          logger('exit').error(message, i18n.__('failed with error:'))
          logger().error(code.stack)
        } else {
          logger('exit').error(message, i18n.__('failed with code: %s', code))
        }
      }

      process.exit(code)
    }
  }
}