/**
 * Created by yevheniia on 13.03.20.
 */
var drawBars = function(df, multiplenest, yCount) {
    drawHeaders(df, multiplenest);
    drawTable(df, multiplenest);

    const formatValue = d3.format(".2s");

    const margin = { top: 0, right: 0, bottom: 0, left: 50 };
    const chart_height = 400;
    const chart_width = one_w - margin.left;

    //console.log("---------");

    const x = d3.scaleBand()
        .range([0, chart_width])
        .domain(["Культурний", "Соціальний", "Людський", "Інфраструктурний"])
        .padding(0.3);

    function chart(selection) {
        selection.each(function(data) {

            var all_values = [];

            var G = d3.select(this);


            //успішні
            const succsess = data.values.filter(function(c) {
                return c.key === "Успішний"
            });

            //неуспішні
            const unsuccsess = data.values.filter(function(c) {
                return c.key === "Неуспішний"
            });


            succsess[0].values.forEach(function(d) {
                d.res = "Успішний";
                if (d.value != 0) {
                    all_values.push(d);
                }
            });

            unsuccsess[0].values.forEach(function(d) {
                d.res = "Неуспішний";
                d.value = -Math.abs(d.value);
                if (d.value != 0) {
                    all_values.push(d);
                }

            });

            var maxValue = d3.max(all_values, function(d) { return d.value });


            var y = d3.scaleLinear()
                .domain([-maxValue, maxValue])
                .range([chart_height, 0]);

            const y_pos = d3.scaleLinear()
                .domain([0, maxValue])
                .range([chart_height / 2, 0]);

            const y_neg = d3.scaleLinear()
                .domain([-maxValue, 0])
                .range([chart_height, chart_height / 2]);

            const bars = G
                .append("g")
                .attr("transform", "translate(0,0)")
                .selectAll(".bar")
                .data(all_values);

            const labels = G
                .append("g")
                .attr("transform", "translate(0,0)")
                .selectAll(".label")
                .data(all_values);

            bars.enter()
                .append("rect")
                .attr("class", "bar")
                .attr("width", x.bandwidth())
                .attr("x", function(d) {
                    return x(d.key)
                })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("fill", function(d) { return color(d.key) })
                .attr('y', y(0))
                .on("click", function(k) {
                    var table_data = df.filter(function(d) {
                        return d.status === k.res &&
                            d[multiplenest] === data.key &&
                            d.capital === k.key
                    });
                    drawTable(table_data, multiplenest);
                    $('#platform').removeClass("hidden").attr('size', 1).val(data.key).change();
                    $('#platform').closest("th").find("h3").text("×");
                    $('#capital').removeClass("hidden").attr('size', 1).val(k.key).change();
                    $('#capital').closest("th").find("h3").text("×");
                    // $('#status').removeClass("hidden").attr('size', 1).val(k.res).change();
                    // $('#status').closest("th").find("h3").text("×");
                    $("#any_date").prop('selectedIndex', -1).addClass("hidden");
                    $([document.documentElement, document.body]).animate({ scrollTop: $("table").offset().top }, 1000); //прокрутка до таблички на клік


                })

            .transition()
                .duration(500)
                .attr("y", function(k) { return k.value < 0 ? y(0) + 5 : y(k.value) })
                .attr("height", function(k) { return chart_height / 2 - y(Math.abs(k.value)); })
                .style("cursor", "pointer");

            labels
                .enter()
                .append("text")
                .attr("class", "label")
                .attr("text-anchor", "start")
                .style("font-size", "12px")
                .style("fill", "#1381B5")
                .attr("x", function(d) {
                    return x(d.key)
                })
                .attr("dx", x.bandwidth() / 2)
                // .attr("dy", y.bandwidth()/2)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "central")
                .attr("y", function(k) { return k.value < 0 ? y(-Math.abs(k.value)) + 20 : y(k.value) - 10 })
                .text(function(k) { return formatValue(Math.abs(k.value)); });



            //додаємо вісі та підписи к ним
            const pos_y = G
                .append("g")
                .attr("transform", "translate(-20,0)")
                .call(d3.axisRight(y_pos));

            pos_y.append("text")
                .attr("x", -10)
                .attr("y", -10)
                .attr("dy", "0")
                .attr("text-anchor", "start")
                .style("font-size", "1.2em")
                .style("fill", "#1381B5")
                .text(yCount === "engaged_number" ? maxValue : formatValue(maxValue));

            pos_y.append("text")
                .attr("class", "axis-hint")
                .attr("x", -10)
                .attr("y", -10)
                .attr("dy", "0")
                .attr("transform", "translate(0, " + (chart_height / 2 - 10) + ") rotate(-90)")
                .attr("text-anchor", "start")
                .style("font-size", "1.3em")
                .style("letter-spacing", "1.5px")
                .style("fill", "#1381B5")
                .text("реалізовано проектів");



            if (multiplenest === "platform") {
                const neg_y = G
                    .append("g")
                    .attr("transform", "translate(-20,10)")
                    .call(d3.axisRight(y_neg));

                neg_y.append("text")
                    .attr("class", "axis-hint")
                    .attr("x", -10)
                    .attr("y", -10)
                    .attr("dy", "0")
                    .attr("transform", "translate(0, " + (chart_height - 10) + ") rotate(-90)")

                .attr("text-anchor", "start")
                    .style("font-size", "1.3em")
                    .style("letter-spacing", "1.5px")
                    .style("fill", "#1381B5")
                    .text("нереалізовано проектів");

            }

        });

    }
    return chart;

};