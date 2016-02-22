/**
 * Created by ¡ı∫≠ on 2016/2/19.
 */
var menu = [
    {
        title: "Download&Install",
        url: "https://github.com/liuhann/animate.table",
        style:""
    },
    {
        title: "Get started",
        style: "",
        url: "index.html"
    },
    {
        title: "Options & API",
        style: "",
        url: "option-n-api.html"
    },
    {
        title: "Animation Selector",
        style: "",
        url: "how-we-animated.html"
    },
    {
        title: "Html structure and styling",
        style: "",
        url: "html-structure.html"
    },
    {
        title: "Demos",
        style: "",
        url: ""
    },
    {
        title: "Basic table",
        style: "sub",
        url: "basic-table.html"
    }, {
        title: "Append and insert row",
        style: "sub",
        url: "add-row.html"
    },
    {
        title: "Using row template",
        style: "sub",
        url: "row-template.html"
    },
    {
        title: "Row update with animation",
        style: "sub",
        url: "cell-update-animation.html"
    }
];

$("#nav-table").animatedTable({
    rowTemplates: ["<a class='{{style}}' href='{{url}}'>{{title}}</a>"]
}).data(menu);