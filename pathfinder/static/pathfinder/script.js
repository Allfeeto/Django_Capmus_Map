// класс для животных
class Animal {
  constructor(name, age) {
    this.name = name;
    this.age = age;
    this.children = []; // Дети животного (имена)
  }

  // Метод для добавления детей
  addChild(childName) {
    this.children.push(childName);
  }

  // Метод для подсчета
  totalAge() {
    return this.age;
  }
}

// Классы для разных
class Sheep extends Animal {
  constructor(name, age) {
    super(name, age);
  }
}

class Goose extends Animal {
  constructor(name, age) {
    super(name, age);
  }
}

class Cow extends Animal {
  constructor(name, age) {
    super(name, age);
  }
}


let sheep1 = new Sheep("Овца 1", 5);
let sheep2 = new Sheep("Овца 2", 3);
let goose1 = new Goose("Гусь 1", 2);
let cow1 = new Cow("Корова 1", 6);


sheep1.addChild("Овца Шляпа");
goose1.addChild("Гусь Сапог");

// Ферма
let farmAnimals = [sheep1, sheep2, goose1, cow1];

// Подсчёт общего возраста
let totalAge = farmAnimals.reduce((sum, animal) => sum + animal.totalAge(), 0);

console.log("Общий возраст всех животных на ферме: " + totalAge);
