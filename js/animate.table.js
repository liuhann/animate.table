/**
 * Created by hand on 2016/1/11.
 */

(function($, _) {

    var DEFAULT_OPTIONS = {
        styles: "ultratable",
        headers: [],
        headerTemplate: "<div>{{data}}</div>",
        page: null,
        headerWidth: [],
        dataWidth:null,
        rowTemplates: null,
        pageEntranceWithHeader: true,
        pageEntranceCellDelay: 40,
        pageEntranceAnimation: "pt-page-moveFromLeft",
        pageExistAnimation: "pt-page-rotatePushLeft",
        rowUpdateEffect: "pulse",
        rowUpdateSelector: null,
        rowUpdateInAnimation: null,
        rowUpdateOutAnimation: null
    };

    var ANIMATION_END_EVENT_NAMES = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";

    function AnimatedTable(initData, container) {
        var  options =_.extend(DEFAULT_OPTIONS, initData);
        var rowsData = null;
        var rowAddedCallBack = options.rowAdded;

        _.templateSettings = {
            interpolate: /\{\{(.+?)\}\}/g
        };

        container = $(container);
        container.addClass(options.styles);

        var header = $("<div></div>").addClass("ultra-header");
        var body = $("<div/>").addClass("ultra-body");
        var pager = $("<div/>").addClass("ultra-footer");



        if(!options.headerTemplate) {
            console.error("headerTemplate chould not be null");
            return;
        }
        var headerCompiled = _.template(options.headerTemplate);
        var rowCompiled = null;
        if (options.rowTemplates) {
            rowCompiled = [];
            _.each(options.rowTemplates, function(ele) {
                rowCompiled.push(_.template(ele));
            });
        }

        function addHeader() {
            _.each(options.headers, function(ele, index) {
                var cell;
                if (typeof(ele)==="string") {
                    cell = headerCompiled({data: ele});
                } else {
                    cell = _.template(ele.template)(ele.data);
                }
                header.append($(cell).addClass("ultra-cell"));
            });

            if (options.headerWidth) {
                if (_.isArray(options.headerWidth)) {
                    header.find(".ultra-cell").each(function(index) {
                        if (options.headerWidth.length>index) {
                            $(this).css("width", options.headerWidth[index]);
                        }
                    })
                } else {
                    console.warn("option headerWidth should be a array of string  like ['15%', '200px', '', '20%']");
                }
            }

            if (options.pageEntranceWithHeader) {
                header.addClass(options.pageEntranceAnimation);
            }

            $(container).append(header);
        }


        /**
         * Page to the page. the current rows would animate out and new rows are animate in;
         * @param pageIndex
         */
        function pageTo(pageIndex) {
            options.page.current = pageIndex;
            /* calculate current rows */
            var rows = rowsData.slice((options.page.current-1)*options.page.per, options.page.current * options.page.per);
            showRows(rows, pageIndex);
        }

        function showRows(rows, page) {
            var ultraRows = body.find(".ultra-row");
            if (ultraRows.length>0) {
                /**remove last animation wrapper */
                if (options.pageExistAnimation) {
                    $(".leaving").remove();
                    body.addClass("leaving");
                    body = $("<div/>").addClass("ultra-body");
                    $(".leaving").after(body);
                    /**
                     * create new wrapper. the most important thing is to set position absolute.
                     * */
                    ultraRows.each(function(index) {
                        $(this).addClass(options.pageExistAnimation).on(ANIMATION_END_EVENT_NAMES, function() {
                            $(this).remove();
                        });
                    });
                } else {
                    body.find(".ultra-row").remove();
                }
            }

            for(var i=0;i<rows.length; i++) {
                if (options.page) {
                    appendRow(rows[i], (page-1) * options.page.per + i);
                } else {
                    appendRow(rows[i], i);
                }
            }
        }

        function generateRow(rowData, index, animation) {
            var row = $("<div/>").addClass("ultra-row");

            if (rowCompiled) {
                _.each(rowCompiled, function(compiled) {
                    var cell = $("<div/>").addClass("ultra-cell")
                    rowData["_index"] = index+1;
                    cell.append(compiled(rowData));
                    row.append(cell);
                });
            } else {
                if (_.isObject(rowData)) {
                    _.each(rowData, function(ele, index, list) {
                        var cell = $("<div/>").addClass("ultra-cell " + index).html(ele);
                        row.append(cell);
                    });
                } else if (_.isArray(rowData)) {
                    _.each(rowData, function(ele, index, list) {
                        var cell = $("<div/>").addClass("ultra-cell").html(ele);
                        row.append(cell);
                    });
                }
            }

            row.data("row", rowData);
            if (body.find(">.ultra-row").length===0) {
                var widths = options.cellWidth;
                if (!widths) widths = options.headerWidth;
                if (widths) {
                    if (_.isArray(widths)) {
                        row.find(".ultra-cell").each(function (index) {
                            if (widths.length > index) {
                                $(this).css("width", widths[index]);
                            }
                        });
                    } else {
                        console.warn("option cellWidth should be a array of string  like ['15%', '200px', '', '20%']");
                    }
                }
            }
            if (index) {
                $(row).css("animation-delay", options.pageEntranceCellDelay * index + "ms");
            }

            if (!animation) animation = options.pageEntranceAnimation;
            row.addClass(animation).on(ANIMATION_END_EVENT_NAMES, function() {
                $(this).off(ANIMATION_END_EVENT_NAMES);
                $(this).removeClass(animation);
            });

            if (rowAddedCallBack) {
                rowAddedCallBack(row, rowData, index, rowsData);
            }
            return row;
        }

        function resetRowContent(ele, data) {
            if (rowCompiled) {
                _.each(rowCompiled, function(compiled, index) {
                    data["_index"] = index+1;
                    ele.find(".ultra-cell").eq(index).html(compiled(data));
                });
            } else {
                if (_.isObject(data)) {
                    _.each(data, function(value, key, list) {
                        ele.find(".ultra-cell." + key).html(value);
                    });
                } else if (_.isArray(rowData)) {
                    _.each(data, function(value, index, list) {
                        ele.find(".ultra-cell").eq(index).html(value)
                    });
                }
            }
        }

        function appendRow(rowData, index) {
            var row = generateRow(rowData, index);
            body.append(row);
            return row;
        }

        function insertRow(rowData, position) {
            var index = position;
            if (!index) {
                index = rowsData.push(rowData);
            } else {
                rowsData.splice(index,0,rowData);
            }

            var newPage = Math.floor((index-1) / options.page.per) + 1;
            options.page.total = Math.floor((rowsData.length-1)/options.page.per) + 1;

            if (options.page.current!=newPage) {
                pageTo(newPage);
                /**when page changes, detect if paging need refresh */
            } else {
                var row = generateRow(rowData, index, "pt-page-moveFromLeft");
                if (position) {
                    body.find(">.ultra-row").eq(index-1).after(row);

                    if (body.find(">.ultra-row").length>options.page.per) {
                        body.find(">.ultra-row").last().remove();
                    }

                    body.find(">.ultra-row").filter(":gt(" + (index) + ")").addClass("pt-page-moveFromTop").on(ANIMATION_END_EVENT_NAMES, function() {
                        $(this).off(ANIMATION_END_EVENT_NAMES);
                        $(this).removeClass("pt-page-moveFromTop");
                    });
                } else {
                    body.append(row);
                }
            }

            if ( options.page.total != Math.floor(rowsData.length-1/options.page.per)) {
                this.pager = new Pager(
                    _.extend(options.page, {container: container})
                    , function(page) {
                        pageTo(page);
                    });
            }
        }


        function setData(rows) {
            rowsData = rows;
            if (options.page) {
                if(!options.page.current)  options.page.current = 1;
                if (!options.page.total) {
                    options.page.total = Math.floor((rowsData.length-1)/options.page.per) + 1;
                }
                var pager = new Pager(
                    _.extend(options.page, {container: container})
                    , function(page) {
                        pageTo(page);
                    });
                pageTo(options.page.current);
            } else {
                showRows(rowsData, 1);
            }
        }

        function removeRow(row, div) {
            _.each(body.find(">.ultra-row"), function() {
                $(this).data("row")
            });
        }

        function updateRow(rowData, index) {
            rowsData[index] = rowData;

            if (options.page && (Math.floor(index/options.page.per)+1) == options.page.current ) {
                index = index/options.page.per % options.page.per;
            }
            var cell = $(body).find(".ultra-row").eq(index);

            if (options.rowUpdateSelector) { //if we specified the selector, then the animation only fade at the selector
                var newClone = cell.clone();
                resetRowContent(newClone, rowData);

                var newAnims = newClone.find("." + options.rowUpdateSelector);
                var oldAnims = cell.find("." + options.rowUpdateSelector);
                for(var i=0; i<newAnims.length; i++) {
                    $(newAnims[i]).before(
                        $(oldAnims).addClass("cell-banned").addClass(options.pageExistAnimation).on(ANIMATION_END_EVENT_NAMES, function(){
                        $(this).remove();
                    }));
                    $(newAnims[i]).addClass(options.pageEntranceAnimation);
                }

                cell.replaceWith(newClone);
            } else {
                resetRowContent(cell, rowData);
                cell.addClass(options.rowUpdateEffect);
            }
        }

        function animateCellUpdate() {

        }


        function getDisplayedRowsData() {
            var list = [];
            body.find(">.ultra-row").each(function() {
                list.push($(this).data("row"));
            });
            return list;
        }

        function __addPager() {

        }

        function updateRows(rows, func) {

        }

        function rowAdded(cb) {
            rowAddedCallBack = cb;
        }



        function init() {
            addHeader();
            container.append(header);
            container.append(body);

            if (options.rows) {
                setData(options.rows);
            }
            container.append(pager);
        }


        init();
        return {
            insertRow: insertRow,
            data: setData,
            rowAdded: rowAdded,
            updateRow: updateRow,
            getDisplayedRowsDataL: getDisplayedRowsData
        }
    }

    function Pager(options, topage) {
        var defaultOptions = {
            total: 1,
            current: 1,
            neighbours: 2,
            label: {
                first: "First",
                previous: "Previous",
                next: "Next",
                last: "Last"
            }
        };

        options =_.extend(defaultOptions, options);
        var TEMPLATE =
          '<div class="pagination">'
              + '<ul class="numbers">'
              + '<li class="first common" >' + options.label.first + '</li>'
              + '<li class="prev common">' + options.label.previous + '</li>'
              + '<li class="next common">' + options.label.next + '</li>'
              + '<li class="last common">' + options.label.last + '</li>'
              + '</ul>'
             /* + '<input type="text" class="goto"/>'
              + '<input type="button" class="btngo"/>'
              + '<span class="current"></span>/'
              + '<span class="totao"></span>'*/
        + '</div>';

        function setPage(total, current, neighbors) {
            if (current<1) current = 1;
            if (current>total) current = total;

            if (options.total===total && options.current===current && options.neighbours===neighbors) {
                return;
            }
            options.total = total;
            options.current = current;
            options.neighbours = neighbors;
            draw();
            topage(current);
        }

        function draw() {
            $(options.container).find(".pagination").remove();
            var pagination = $(TEMPLATE);

            if (options.total<2) {
                pagination.find("li.common").hide();
            }

            for(var i=1;i<=options.total; i++) {
                if (Math.abs(options.current-i)<options.neighbours) {
                    var li = $("<li class='page'>" + i + "</li>");
                    if (i===options.current) {
                        li.addClass("current");
                    }
                    pagination.find("ul.numbers li.next").before(li);
                }
            }

            pagination.find("ul.numbers li").click(function() {
                var page = $(this).html();
                if (page===options.label.first) {
                    setPage(options.total, 1, options.neighbours);
                } else if (page===options.label.previous) {
                    setPage(options.total, options.current-1, options.neighbours);
                } else if (page===options.label.next) {
                    setPage(options.total, options.current+1, options.neighbours);
                } else if (page===options.label.last) {
                    setPage(options.total, options.total, options.neighbours);
                } else {
                    setPage(options.total, parseInt(page), options.neighbours);
                }
            });

            $(options.container).append(pagination);
        }
        draw();
    }

    $.fn.animatedTable = function(options) {
       if (options) {
           var ultra = new AnimatedTable(options, this);
           $(this).data("ultra", ultra);
           return ultra;
       } else {
           var ultra = $(this).data("ultra");
           if (ultra) {
               return ultra;
           } else {
               var ultra = new AnimatedTable({}, this);
               $(this).data("ultra", ultra);
               return ultra;
           }
       }
    };
}(jQuery, _));