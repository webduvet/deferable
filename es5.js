function Person(name) {
    this.name = name
}

Person.prototype.sayName = function() {
    console.log(`hello my name is ${this.name}`)
}


function Student(name, school) {
    this.school = school
    Person.call(this, name)
}

Student.prototype = Object.create(Person.prototype)
Student.prototype.constructor = Student

Student.prototype.identify = function() {
    console.log(`My name is ${this.name}, I addent ${this.school}.`)
}


function Bond(factoryP) {
    this._f = factoryP;
}

Bond.prototype = Object.create(Promise.prototype)
Bond.prototype.constructor = Bond

Bond.prototype.trigger = function() {
    this._f();
}

Bond.then = function(callback) {
}

