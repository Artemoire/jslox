class Callable {

    arity() {

    }

    call(interpreter, args) {

    }

}

class NativeClock extends Callable {
    arity() {
        return 0;
    }

    call(interpreter, args) {
        return process.uptime();
    }

    toString() {
        return "<native fn>";
    }
}
Callable.NativeClock = NativeClock;

module.exports = Callable;