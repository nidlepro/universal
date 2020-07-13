import { createDefinition } from '.'

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

Scenario: Launching a SpaceX rocket
  Given I am Elon Musk attempting to launch a rocket into space
  When I launch the rocket
  Then the rocket should end up in space
    And the booster(s) should land back on the launch pad
    And nobody should doubt me ever again
  `)

interface CucumberExampleWorld {
  cucumbersCount: number
}

createDefinition<CucumberExampleWorld>()
  .withGiven<{ amount: string }>(/^there are (?<amount>\d+) cucumbers$/, ({ world, params }) => {
    world.cucumbersCount = Number(params?.amount)
  })
  .withWhen<{ amount: string }>(/^I eat (?<amount>\d+) cucumbers$/, ({ world, params }) => {
    world.cucumbersCount -= Number(params?.amount)
  })
  .withThen<{ amount: string }>(/^I should have (?<amount>\d+) cucumbers$/, ({ world, params }) => {
    expect(world.cucumbersCount).toBe(Number(params?.amount))
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
