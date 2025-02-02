import { LocalStorage } from 'node-localstorage';
const localStorage = new LocalStorage('./scratch');

class Plant {
    constructor(water, fertilizer, n, p, k, sunlight, growth, season) {
        this.water = water;
        this.n = n*(fertilizer/(n+p+k+.01));
        this.p = p*(fertilizer/(n+p+k+.01));
        this.k = k*(fertilizer/(n+p+k+.01));
        this.sunlight = sunlight;
        this.growth = growth;
        this.season = season;
    }
}

let plantList = [
new Plant(1.5, 3, 5, 10, 10, 8, 95, "summer"),
new Plant(1.5, 1, 5, 10, 10, 6, 70, "summer"),
new Plant(1.5, 0.25, 5, 10, 10, 6, 60, "spring"),
new Plant( 2, 4, 5, 10, 10, 8, 115, "summer"),
new Plant(1.5, 4, 10, 10, 10, 4, 55, "spring"),
new Plant(1.25, 3, 5, 10, 10, 8, 55, "summer"),
new Plant(1.5, 3, 5, 10, 10, 8, 57, "spring"),
new Plant(1.5, 0, 0, 0, 0, 8, 65, "summer"),
new Plant(1.5, 4, 5, 10, 10, 6, 105, "spring"),
new Plant(2.5, 0, 0, 0, 0, 8, 140, "spring"),
new Plant(1.5, 5, 5, 10, 10, 8, 900, "spring"),
new Plant(1.5, 5,5,10,10,8, 1750, "spring"),
new Plant(1.5, 5,5,10,10,8,120,"spring"),
new Plant(1.25, .1, 5,10,5,6,25, "spring"),
new Plant(2.5,.1,5,10,5,6,75,"spring")]

let plantName = ["tomato", "carrot", "beet", "corn", "lettuce", "bean", "broccoli", "cucumber", "potato", "peanut", "blackberry", "blueberry", "strawberry", "basil", "parsley"]

for (let i = 0; i < plantList.length; i++) {
    let plantSerialized = JSON.stringify(plantList[i]);
    console.log(plantSerialized);
    localStorage.setItem(plantName[i], plantSerialized);
}

// To revert back into info use JSON.parse(localStorage.getItem("plantName"));
localStorage.clear();