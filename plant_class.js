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

const tomato = new Plant(1.5, 3, 5, 10, 10, 8, 95, "summer");
const carrot = new Plant(1.5, 1, 5, 10, 10, 6, 70, "summer");
const beet = new Plant(1.5, 0.25, 5, 10, 10, 6, 60, "spring");
const corn = new Plant( 2, 4, 5, 10, 10, 8, 115, "summer");
const lettuce = new Plant(1.5, 4, 10, 10, 10, 4, 55, "spring");
const bean = new Plant(1.25, 3, 5, 10, 10, 8, 55, "summer");
const broccoli = new Plant(1.5, 3, 5, 10, 10, 8, 57, "spring");
const cucumber = new Plant(1.5, 0, 0, 0, 0, 8, 65, "summer");
const potato = new Plant(1.5, 4, 5, 10, 10, 6, 105, "spring");
const peanut = new Plant(2.5, 0, 0, 0, 0, 8, 140, "spring");
const blackberry = new Plant(1.5, 5, 5, 10, 10, 8, 900, "spring");
const blueberry = new Plant(1.5, 5,5,10,10,8, 1750, "spring");
const strawberry = new Plant(1.5, 5,5,10,10,8,120,"spring");
const basil = new Plant(1.25, .1, 5,10,5,6,25, "spring");
const parsley = new Plant(2.5,.1,5,10,5,6,75,"spring");
