# Universal Gherkin

This library was created to add possiblity to write tests in gherkin language with testing framework we already use.

There are several reasons why use gherkin language to write any kind of tests:

> **Each assertion has it's own assertion**  
In classic approach if we want to describe assertion we need to make different test ( one assertion per `it/test` statement). This couse the problem with performence, because we need to run all beforeEach statements to make assertion that not change for each of those tests. 
In Gherkin we have `then` segment that we can run in parallel, because we declare that this step not change anything.

> **Easier to code review**  
In classic approach we write very long test files what makes it hard to code review if test is correct because to read whole test we need to scroll several times

> **Hardly defined context (world)**  
In classic approach we initialize variables in several code scopes. That makes a problem to extract similar code. Using world each our action define something inside it, so as we know what we want to use we are able to change it or read it

## Installation

```sh
# Using npm
npm install @nidlepro/universal-gherkin --save-dev
# Using yarn
yarn add @nidlepro/universal-gherkin --dev
```

In setup test file we need to define framework we use

```javascript
import { configureAdapter, JestAdapter } from '@nidlepro/universal-gherkin'

configureAdapter(new JestAdapter())
```

Currently available are two adapters: JestAdapter and JasmineAdapter

## Example

```typescript
import { createDefinition } from '@nidlepro/universal-gherkin'

class Rocket {
  isInSpace = false

  boostersLanded = false

  launch() {
    this.isInSpace = true
    this.boostersLanded = true
  }
}

// Here's we define world for our test
// Any variable used in test need to be declared here
interface World {
  rocket: Rocket
}

// When we pass World as generic we don't need to do it again
// for whole definition
createDefinition<World>()
  .withGiven('I am Elon Musk attempting to launch a rocket into space', ({ world }) => {
    world.rocket = new Rocket()
  })
  .withWhen('I launch the rocket', ({ world }) => {
    world.rocket.launch()
  })
  .withThen('the rocket should end up in space', ({ world }) => {
    // You can use any assertion mechanism from your testing tool
    expect(world.rocket.isInSpace).toBe(true)
  })
  .withThen('the booster(s) should land back on the launch pad', ({ world }) => {
    expect(world.rocket.boostersLanded).toBe(true)
  })
  .withThen('nobody should doubt me ever again', ({ world }) => {
    expect('people').not.toBe('haters')
  })
  // This method will run one test case per scenario grouped
  // by feature
  .run(`
Feature: Rocket Launching

Scenario: Launching a SpaceX rocket
  Given I am Elon Musk attempting to launch a rocket into space
  When I launch the rocket
  Then the rocket should end up in space
    And the booster(s) should land back on the launch pad
    And nobody should doubt me ever again
  `)
```

## Features

### Reusable definitions

You can create definition without running any test or use it in other definition.

```typescript
// definition.ts
import { createDefinition } from '@nidlepro/universal-gherkin'

class Rocket {
  isInSpace = false

  boostersLanded = false

  launch() {
    this.isInSpace = true
    this.boostersLanded = true
  }
}

export interface RocketLaunchingWorld {
  rocket: Rocket
}

// Without running any test this definition can be reused
export default createDefinition<RocketLaunchingWorld>()
  .withGiven('I am Elon Musk attempting to launch a rocket into space', ({ world }) => {
    world.rocket = new Rocket()
  })
  .withWhen('I launch the rocket', ({ world }) => {
    world.rocket.launch()
  })
  .withThen('the rocket should end up in space', ({ world }) => {
    expect(world.rocket.isInSpace).toBe(true)
  })
  .withThen('the booster(s) should land back on the launch pad', ({ world }) => {
    expect(world.rocket.boostersLanded).toBe(true)
  })
```

Now we only need to import it inside our test

```typescript
// index.spec.ts
import { createDefinition } from '@nidlepro/universal-gherkin'
import rocketLaunchingDefinition, { RocketLaunchingWorld } from './definition'

interface World extends RocketLaunchingWorld {}

createDefinition<World>()
  .from(rocketLaunchingDefinition)
  .withThen('nobody should doubt me ever again', () => {
    expect('people').not.toBe('haters')
  })
  .run(`
Feature: Rocket Launching

Scenario: Launching a SpaceX rocket
  Given I am Elon Musk attempting to launch a rocket into space
  When I launch the rocket
  Then the rocket should end up in space
    And the booster(s) should land back on the launch pad
    And nobody should doubt me ever again
  `)
```

### Scenario Outline

Scenario Outline are equivalent of [jest.each](https://jestjs.io/docs/en/api#testeachtablename-fn-timeout). With it we can run multiple tests that differents only with few parameters added to test.

```typescript 
import { createDefinition } from '@nidlepro/universal-gherkin'

interface CucumberExampleWorld {
  cucumbersCount: number
}

createDefinition<CucumberExampleWorld>()
  .withGiven<[string]>(/^there are (?<amount>\d+) cucumbers$/, ({ world, params: [amount] }) => {
    world.cucumbersCount = Number(amount)
  })
  .withWhen<[string]>(/^I eat (?<amount>\d+) cucumbers$/, ({ world, params: [amount] }) => {
    world.cucumbersCount -= Number(amount)
  })
  .withThen<[string]>(/^I should have (?<amount>\d+) cucumbers$/, ({ world, params: [amount] }) => {
    expect(world.cucumbersCount).toBe(Number(amount))
  })
  .run(`
Feature: Eating cucumbers

Scenario Outline: eating <start> cucumbers
  Given there are <start> cucumbers
  When I eat <eat> cucumbers
  Then I should have <left> cucumbers

  Examples:
    | start | eat | left |
    |    12 |   5 |    7 |
    |    20 |   5 |   15 |
  `)
```

This will run 2 tests, one for each example.

### Backgrounds

If we have some steps that we run at the beginning of each scenario we can move it to background.

```typescript
import { createDefinition } from '@nidlepro/universal-gherkin'

class Rocket {
  isInSpace = false

  boostersLanded = false

  launch() {
    this.isInSpace = true
    this.boostersLanded = true
  }
}

interface World {
  rocket: Rocket
}

createDefinition<World>()
  .withGiven('I am Elon Musk attempting to launch a rocket into space', ({ world }) => {
    world.rocket = new Rocket()
  })
  .withWhen('I launch the rocket', ({ world }) => {
    world.rocket.launch()
  })
  .withThen('the rocket should end up in space', ({ world }) => {
    expect(world.rocket.isInSpace).toBe(true)
  })
  .withThen('the booster(s) should land back on the launch pad', ({ world }) => {
    expect(world.rocket.boostersLanded).toBe(true)
  })
  .withThen('nobody should doubt me ever again', ({ world }) => {
    expect('people').not.toBe('haters')
  })
  .run(`
Feature: Rocket Launching

Background:
  Given I am Elon Musk attempting to launch a rocket into space

Scenario: Launching a SpaceX rocket
  When I launch the rocket
  Then the rocket should end up in space
    And the booster(s) should land back on the launch pad
    And nobody should doubt me ever again
  `)
```

Background steps will be added at the beginning of each scenario.

### RegExp parameters

We can add some parameters to our step definition by using regexp match. Each match will be added as params in the same order. We can define it's type by passing it.

This works for any kind of step.

```typescript
.withGiven<[string]>(
  /^there are (?<amount>\d+) cucumbers$/,
  ({ world, params: [amount] }) => {
    world.cucumbersCount = Number(amount)
  }
)
```

We still need to cast it to correct type.

### Skipping

In gherkin language we can use tags. To skip scenario or feature we need to place `@skip` tag line above it.

### Data Tables

If you need to pass some data as parameter into step use Data Table:

```feature
Given the following users exist:
  | name   | email              | twitter         |
  | Aslak  | aslak@cucumber.io  | @aslak_hellesoy |
  | Julien | julien@cucumber.io | @jbpros         |
  | Matt   | matt@cucumber.io   | @mattwynne      |
```

We are able to get this data in step:

```typescript
.withGiven(
  'the following users exist:',
  ({ world, dataTable }) => {
    world.users = dataTable.rows.map(row => new User(
      row.name,
      row.email,
      row.twitter,
    ))
  }
)
```

### Doc Strings

If you need to pass long text with newlines use Doc String:

```feature
Then I see text:
  """
  Some Title, Eh?
  ===============
  Here is the first paragraph of my blog post. Lorem ipsum dolor sit amet,
  consectetur adipiscing elit.
  """
```

We are able to get this text in step:

```typescript
.withThen(
  'I see text:',
  ({ world, docString }) => {
    expect(world.text).toBe(docString.content)
  }
)
```

### Step timeout

We can define timeout for steps, so we will get information which step exceeded allowed time otherwise we will get only information about timeouted scenario.

To set timeout for steps pass option to definition

```typescript
createDefinition<any>({ timeout: 200 })
```

By default timeout is set to `300` ms

### Better error handler

When test throw error stack trace is modified to omit library code, what makes much cleaner. Additionally stack trace shows the gherkin line as the first entry.

### Gherkin test formatter ( for now jest only )

You can change reporter to support gherkin format.

```js
//jest.config.js
module.exports = {
  reporters: ['@nidlepro/universal-gherkin/src/reporters/jest.reporter.js']
}
```

### Hooks

Often we need to cleanup after test or run some processes before the tests. To do so we can use `hooks`.

There are few methods that you can use in definition to use them:

* beforeFeature
* beforeScenario
* afterScenario
* afterFeature
