Papa.parse("data.csv", {
	download: true,
    dynamicTyping: true,
	complete: function(results) {
        // console.log(results.data.length);
        var animation = new Animation();
        // animation.init(results.data, 1, 1, 5);
        animation.init(randomData(1000), 1, 1, 3);
        animation.animate();
	}
});

function randomData(N) {
    data = [];
    for (let i = 0; i < N; i++) {
        data.push([
            randomIntFromRange(0, innerWidth),
            randomIntFromRange(0, innerHeight),
            randomIntFromRange(15, 50),
            randomIntFromRange(0, 360)
        ]);
    }
    return data;
}
