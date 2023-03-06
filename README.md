# deferable
wrapper for promises to allow to defer the execution


## 
[![npm version](https://badge.fury.io/js/angular2-expandable-list.svg)](https://badge.fury.io/js/angular2-expandable-list)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Deferable

> Wrapper for promises to allow to defer the execution.

## Prerequisites

None. It only requires Promise capable version javascript interpreter.
e.g. Node version(0.12 and higher)

```sh
$ npm -v && node -v
6.4.1
v8.16.0
```

## Table of contents

- [Project Name](#deferable)
  - [Prerequisites](#prerequisites)
  - [Table of contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Factory flavor](#factory-flavor)
    - [Class Flavor](#class-flavor)
    - [Running the tests](#running-the-tests)
    - [Building a distribution version](#building-a-distribution-version)
  - [Contributing](#contributing)
  - [Credits](#credits)
  - [Built With](#built-with)
  - [Versioning](#versioning)
  - [Authors](#authors)
  - [License](#license)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

clone the repository and from inside run the usual
```sh
$ npm run test
$ npm run build
```

## Installation

**BEFORE YOU INSTALL:** please read the [prerequisites](#prerequisites)

Start with cloning this repo on your local machine:

```sh
$ cd npm-project
$ npm install deferable
```

## Usage

Factory Flavor: **Defer**

This is a simple factory method returning a holder object for promise and the 

Inside your project:

```js
import {
    Defer
} from 'deferable'

const { result, ...lever } = Defer(function() {
    // returning the actual operation which returns promise e.g.
    return http.call(url)
    }, "result")


// passing a promise to where is it expected
consumerService(result)
...
// at some point in the code this triggers the promise fulfillment
lever.trigger()
```

It returns an object with three keys: `promise, trigger, called`;

    - first contains the actual promise which can be consumed.
    - trigger is a function which triggers the promise fulfillment.
    - called is a flag


Class flavor: **Deferred, DeferredTrigger**

In essence the class implementation of the above.
Objects `Deferred` and `DeferredTrigger` is typeof **Promise** should your project require this feature.

```js
import {
    DefferedTrigger
} from 'deferable';

const deferred = new Deferred(() => http.call(url))

// passing a promise to where is it expected
consumerService(deferred.promise)

// at some point in the code this triggers the promise fulfillment
deferred.trigger()
```

**Deferred** class is just a plain implementation of the deferred pattern exposing `resolve` and `reject` resolvers.


```js
import {
    Deffered
} from 'deferable';

const deferred = new Deffered()

// passing a promise to where is it expected
consumerService(deferred)

// at some point in the code this triggers the promise fulfillment
thanableService().then((data) => {
    deferred.resolve(data)
});
```

### Running the tests

```sh
$ npm test
```

### Building a distribution version

```sh
$ npm run build
```

This task will create a distribution version of the project
inside your local `dist/` folder


## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

1.  Fork it!
2.  Create your feature branch: `git checkout -b my-new-feature`
3.  Add your changes: `git add .`
4.  Commit your changes: `git commit -am 'Add some feature'`
5.  Push to the branch: `git push origin my-new-feature`
6.  Submit a pull request :sunglasses:

## Credits

TODO: Write credits

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

* **Andrej Bartko** - *Initial work* - [AndrejBartko](https://github.com/webduvet)

See also the list of [contributors](https://github.com/webduvet/deferable/contributors) who participated in this project.

## License

[MIT License](https://github.com/git/git-scm.com/blob/main/MIT-LICENSE.txt) © 2012-2022 Scott Chacon and others
