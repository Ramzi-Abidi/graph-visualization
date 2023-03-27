let treeData = {
    name: "X",
    children: [
        {
            name: "A",
            children : [
              {
                name : "H",
              },
              {
                name : "L",
                children : [
                  {
                    name : "M",
                  },
                  {
                    name : "T",
                  }
                ]
              },
            ]
        },
        {
          name : "B",
          children : [
            {
              name : "E",
            },
            {
              name : "F",
            },
          ]
        }
    ],
};

let margin = { top: 20, right: 90, bottom: 20, left: 90 };
let width = 960 - margin.left - margin.right;
let height = 500 - margin.top - margin.bottom;

let svg = d3
    .select(".container")
    .append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let i = 0;
let duration = 750;
let root;

let treemap = d3.tree().size([height, width]);
root = d3.hierarchy(treeData, function (d) {
    return d.children;
});
root.x0 = height / 2;
root.y0 = 0;
console.log("root ", root);

update(root);

function update(source) {
    let treeData = treemap(root);

    // nodes
    let nodes = treeData.descendants();
    nodes.forEach(function (d) {
        d.y = d.depth * 180;
    });
    let node = svg.selectAll("g.node").data(nodes, function (d) {
        return d.id || (d.id = ++i);
    });
    let nodeEnter = node
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + source.y0 + ", " + source.x0 + ")";
        })
        .on("click", click);

    nodeEnter
        .append("circle")
        .attr("class", "node")
        .attr("r", 0)
        .style("fill", function (d) {
            return d._children ? "red" : "#fff";
        });

    nodeEnter
        .append("text")
        .attr("class", "text")
        .attr("dy", ".35em")
        .attr("x", function (d) {
            return d.children || d._children ? -13 : 13;
        })
        .attr("text-anchor", function (d) {
            return d.children || d._children ? "end" : "start";
        })
        .text(function (d) {
            return d.data.name;
        });

    let nodeUpdate = nodeEnter.merge(node);

    nodeUpdate
        .transition()
        .duration(duration)
        .attr("transform", function (d) {
            return "translate(" + d.y + ", " + d.x + ")";
        });

    nodeUpdate
        .select("circle.node")
        .attr("r", 10)
        .style("fill", function (d) {
            return d._children ? "red" : "#fff";
        })
        .attr("cursor", "pointer");

    nodeExit = node
        .exit()
        .transition()
        .duration(duration)
        .attr("transform", function (d) {
            return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

    nodeExit.select("circle").attr("r", 0);
    nodeExit.select("text").style("fill-opacity", 0);

    // links
    function diagonal(s, d) {
        path = `M ${s.y} ${s.x}
      C ${(s.y + d.y) / 2} ${s.x}
        ${(s.y + d.y) / 2} ${d.x}
        ${d.y} ${d.x}`;
        return path;
    }
    let links = treeData.descendants().slice(1);
    let link = svg.selectAll("path.link").data(links, function (d) {
        return d.id;
    });
    let linkEnter = link
        .enter()
        .insert("path", "g")
        .attr("class", "link")
        .attr("d", function (d) {
            let o = { x: source.x0, y: source.y };
            return diagonal(o, o);
        });
    let linkUpdate = linkEnter.merge(link);
    linkUpdate
        .transition()
        .duration(duration)
        .attr("d", function (d) {
            return diagonal(d, d.parent);
        });

    let linkExit = link
        .exit()
        .transition()
        .duration(duration)
        .attr("d", function (d) {
            let o = { x: source.x0, y: source.y0 };
            return diagonal(o, o);
        })
        .remove();

    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });

    function click(event, d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }

    d3.selectAll("text").style("color", "#fff");



    d3.drag()
    .on('start', 0)
    .on('drag', 60)
    .container(function() { return this.parentNode.parentNode; })
}
