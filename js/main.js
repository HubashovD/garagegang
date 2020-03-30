/**
 * Created by yevheniia on 13.03.20.
 */
const color = d3.scaleOrdinal()
    .domain(["Культурний", "Соціальний","Людський", "Інфраструктурний","Економічний"])
    .range(["#5CE577", "#4A80FF", "#EAEDA0", "#EB6AC2", "white"]);

d3.csv("data/data.csv").then(function(data){
    const craudf = data.filter(function(d){ return d.platform_type != "Громадський бюджет"});
    const budget = data.filter(function(d){ return d.platform_type === "Громадський бюджет"});
    

    //обраний тип платформи
    var currentData = craudf;

    //обрані роки
    var startYear = '2016', endYear = '2019';

    //голоси чи гроші
    var yCount = "collected_amount";

    var mySlider = new rSlider({
        target: '#slider',
        values: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
        range: true,
        set: [2016, 2019],
        width:    null,
        scale:    true,
        labels:   true,
        tooltip:  false,
        step:     1,
        disabled: false,
        onChange: function (vals) {
            startYear = vals.split(",")[0];
            endYear = vals.split(",")[1];
            draw(currentData, startYear, endYear, yCount);
        }
    });

   d3.selectAll("#budget").on("click", function(e){
        d3.select(this).classed("active", true);
        d3.select("#craudf").classed("active", false);
        currentData = budget;
        draw(currentData, startYear, endYear, yCount);
    });

    d3.selectAll("#craudf").on("click", function(e){
        d3.select(this).classed("active", true);
        d3.select("#budget").classed("active", false);
        currentData = craudf;
        draw(currentData, startYear, endYear, yCount);
    });

    d3.selectAll("#money").on("click", function(e){
        d3.select(this).classed("active", true);
        d3.select("#voices").classed("active", false);
        yCount = "collected_amount";
        draw(currentData, startYear, endYear, yCount);
    });

    d3.selectAll("#voices").on("click", function(e){
        d3.select(this).classed("active", true);
        d3.select("#money").classed("active", false);
        yCount = "engaged_number";
        draw(currentData, startYear, endYear, yCount);
    });

    // window.addEventListener("resize", function(){
      //draw(currentData, startYear, endYear, yCount);
    // });

});






var draw = function(df, yearStart, yearEnd, yCount){
    d3.selectAll("#chart svg").remove();


    // const width = window.innerWidth >= 1200 ? 1200: window.innerWidth * 0.9;
    // const columns = Math.floor(width/250);
    const one_h = df[0].platform_type === "Краудфандинг"? 500 : 300;

    var multiplenest;
    var filtered;

    if(df[0].platform_type === "Краудфандинг"){
        multiplenest = "platform";
        filtered = df.filter(function(d) {
            return +d.any_date >= yearStart && +d.any_date < yearEnd
        });
        
    } else {
        multiplenest = "location";
        filtered = df.filter(function(d) {
            return +d.any_date >= yearStart && +d.any_date < yearEnd && d.status === "Успішний"
        });
    }

     var nested = d3.nest()
        .key(function(d) { return d[multiplenest]; })
        .key(function(d) { return d.status; })
        .key(function(d) { return d.capital; })
        .rollup(function(v) {
            return d3.sum(v, function (d) {
                return +d[yCount];
            })
        })
        .entries(filtered);


    const height = nested.length / columns * (one_h+ 50);
    const container =  d3.select("#chart")
        // .append("svg")
        // .attr("width", width)
        // .attr("height", height)
        //.append("div")
        // .attr("width", 300)
        // .attr("height", one_h)
        // .append("g")
        // .attr("transform", "translate(" + 50 + "," + 0 + ")")
        ;


    /* якщо немає успішного чи неуспішного, не малюються бари, додаємо відсутній*/
    nested.forEach(function(d){
        if(d.values.length < 2 && d.values[0].key === "Успішний") {
            d.values.push({key: "Неуспішний", values: []})
        }
    });

    nested.sort(function(a, b) { return d3.ascending(a.key, b.key) });

    const multiple = container.selectAll("svg")
        .data(nested).enter()
        .append("svg")
        .attr("class", "multiple")
            .attr("width", 250)
    .attr("height", one_h)
        // .attr("transform", function(d, i){
        //    var xshift = (i % columns) * 300;
        //    var yshift = ~~(i / columns) * one_h;
        //    return "translate(" + xshift + "," + yshift + ")"} )
        ;


    multiple
        .append("text")
        .text(function(d){ return d.key })
        .attr("y", 15)
        .attr("x", 70)
        .attr("fill", "white")
        .style("text-anchor", "middle");


    
    var neg_y = d3.scaleLinear();

    multiple
        .append('g')
        .attr("transform", "translate(" + 50 + "," + 50 + ")")
        .datum(function (d) {
            return d
         })
        .call(drawBars(df, multiplenest, yCount));
        
};


