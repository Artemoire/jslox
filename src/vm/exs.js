class Ex {
}

class Return extends Ex {

    constructor(value) {
        super();
        this.value = value;
    }

}
Ex.Return = Return;

module.exports = Ex;