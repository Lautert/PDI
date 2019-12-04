/*! Application - v0.0.0 - 2019-12-04 */
var Application = function($, PDI) {
    window.Pdi = PDI;
    function Application() {
        this.elements = {
            inputFile: null,
            contentHead: null,
            contentBody: null,
            canvasOri: null,
            canvasChg: null,
            modals: {
                config: null
            }
        };
    }
    Application.prototype = {
        renderOrigin: function(image) {
            var c = this.elements.canvasOri.get(0);
            c.width = image.width;
            c.height = image.height;
            var ctx = c.getContext("2d");
            ctx.drawImage(image, 0, 0);
            var contentResult = this.elements.canvasOri.parents("div.content-image:eq(0)").find(".image-result");
            contentResult.find(".img-size").text(image.width + "x" + image.height);
        },
        loadStatistics: function() {
            var statistics = PDI.getStatistics();
            var contentResult = $(".statistics");
            contentResult.removeClass("d-none");
            contentResult.find(".media span").text(statistics.average.toFixed(2));
            contentResult.find(".mediana span").text(statistics.median);
            contentResult.find(".vari span").text(statistics.variance.toFixed(2));
            contentResult.find(".moda span").text(statistics.moda);
            contentResult.find(".total span").text(statistics.totalPx);
        },
        events: function() {
            var _this = this;
            _this.elements.contentHead.on("click", ".image-upload", function() {
                _this.elements.inputFile.click();
            });
            _this.elements.contentHead.on("click", ".reset", function() {
                var results = PDI.resetImage(true);
                _this.renderResults(results);
            });
            _this.elements.contentHead.on("click", ".filter-gray .apply_filter_gray", function(e) {
                var results = PDI.applyFilter("filterGray");
                _this.renderResults(results);
                _this.loadStatistics();
            });
            _this.elements.contentHead.on("click", ".negative .apply_filter_negative", function(e) {
                var results = PDI.applyFilter("negative");
                _this.renderResults(results);
                _this.loadStatistics();
            });
            var binary = 200;
            var labelBinaryValue = _this.elements.contentHead.find(".binary label.value");
            function sliderBinaryChange(slider) {
                labelBinaryValue.text(slider.value);
                binary = slider.value;
            }
            var slider = _this.elements.contentHead.find("#slider_binary").slider();
            slider.on("click", sliderBinaryChange);
            slider.on("slideStop", sliderBinaryChange);
            slider.on("slide", function(slider) {
                labelBinaryValue.text(slider.value);
            });
            _this.elements.contentHead.on("click", ".binary .apply_filter_binary", function(e) {
                var results = PDI.applyFilter("binary", binary);
                _this.renderResults(results);
                _this.loadStatistics();
            });
            _this.elements.contentHead.on("click", ".detect-border", function() {
                var matrix = [ [ -1, -1, -1 ], [ -1, 8, -1 ], [ -1, -1, -1 ] ];
                var results = PDI.applyFilter("applyFilterMatrix", matrix);
                _this.renderResults(results);
            });
            _this.elements.contentHead.on("click", ".transladar", function() {
                var top = parseInt(prompt("Transladar em top", "0")) || 0;
                var left = parseInt(prompt("Transladar em left", "0")) || 0;
                var bottom = 0;
                var right = 0;
                var results = PDI.applyFilter("transladar", top, left, bottom, right);
                _this.renderResults(results);
            });
            _this.elements.contentHead.on("click", ".resize", function() {
                var x = parseFloat(prompt("Redimencionar em X", "0")) || 0;
                var y = parseFloat(prompt("Redimencionar em Y", "0")) || 0;
                var results = PDI.applyFilter("resize", x, y);
                _this.renderResults(results);
            });
            var rotate = 0;
            var labelRotateValue = _this.elements.contentHead.find(".rotate label.value");
            function sliderRotateChange(slider) {
                labelRotateValue.text(slider.value);
                rotate = slider.value;
            }
            var slider = _this.elements.contentHead.find("#slider_rotate").slider();
            slider.on("click", sliderRotateChange);
            slider.on("slideStop", sliderRotateChange);
            slider.on("slide", function(slider) {
                labelRotateValue.text(slider.value);
            });
            _this.elements.contentHead.on("click", ".rotate .apply_filter_rotate", function(e) {
                var results = PDI.applyFilter("rotate", rotate);
                _this.renderResults(results);
                _this.loadStatistics();
            });
            var brightness = 0;
            var contrast = 1;
            var labelBrightnessValue = _this.elements.contentHead.find(".brightness label.value");
            function sliderBrightnessChange(slider) {
                labelBrightnessValue.text(slider.value);
                brightness = slider.value;
            }
            var slider = _this.elements.contentHead.find("#slider_brightness").slider();
            slider.on("click", sliderBrightnessChange);
            slider.on("slideStop", sliderBrightnessChange);
            slider.on("slide", function(slider) {
                labelBrightnessValue.text(slider.value);
            });
            _this.elements.contentHead.on("click", ".brightness .apply_filter_brightness", function(e) {
                var results = PDI.applyFilter("brightnessContrast", brightness, contrast);
                _this.renderResults(results);
                _this.loadStatistics();
            });
            var labelContrastValue = _this.elements.contentHead.find(".contrast label.value");
            function sliderContrastChange(slider) {
                labelContrastValue.text(slider.value);
                contrast = slider.value;
            }
            var slider = _this.elements.contentHead.find("#slider_contrast").slider();
            slider.on("click", sliderContrastChange);
            slider.on("slideStop", sliderContrastChange);
            slider.on("slide", function(slider) {
                labelContrastValue.text(slider.value);
            });
            _this.elements.contentHead.on("click", ".contrast .apply_filter_contrast", function(e) {
                var results = PDI.applyFilter("brightnessContrast", brightness, contrast);
                _this.renderResults(results);
                _this.loadStatistics();
            });
            _this.elements.contentHead.on("click", ".mirror .apply_filter_mirror", function() {
                var x = _this.elements.contentHead.find(".mirror #mirror_x").is(":checked");
                var y = _this.elements.contentHead.find(".mirror #mirror_y").is(":checked");
                var results = PDI.applyFilter("mirror", x, y);
                _this.renderResults(results);
            });
            _this.elements.inputFile.on("change", function(e) {
                PDI.loadImagem(event.target.files[0], function(image) {
                    _this.renderOrigin(image);
                });
            });
            _this.elements.contentHead.on("click", ".matrix", function() {
                var results = PDI.applyFilter("applyFilterMatrix");
                _this.renderResults(results);
            });
            _this.elements.contentHead.on("click", ".domino", function() {
                var results = PDI.domino();
                _this.renderResults(results);
            });
            _this.elements.stack.on("click", ".process .remove", function() {
                var li = $(this).parents("li.process:eq(0)");
                var index = li.attr("data-index");
                PDI.processes.splice(index, 1);
                li.remove();
                var results = PDI.processImage();
                _this.renderResults(results);
            });
        },
        renderResults: function(results) {
            var _this = this;
            this.elements.result.html("");
            for (var i in results) {
                var curr = results[i];
                var data = curr;
                if (curr.dataImg != undefined) {
                    data = curr.dataImg;
                }
                var modelo = this.elements.modelo.clone();
                modelo.removeClass("modelo").addClass("content-image");
                var title = "Resultado (Processo " + (parseInt(i) + 1) + ")";
                modelo.find("h4").html(title);
                var canvas = modelo.find("canvas.canvas-image-change");
                var c = canvas.get(0);
                c.width = data.width;
                c.height = data.height;
                var ctx = c.getContext("2d");
                ctx.putImageData(data, 0, 0);
                var contentResult = modelo.find(".image-result");
                contentResult.find(".img-size").text(data.width + "x" + data.height);
                if (curr.type != undefined) {
                    contentResult.find(".img-features").append("<span>" + curr.type + "</span>");
                }
                if (curr.color != undefined) {
                    contentResult.find(".img-features").append('<div style="width:25px; height:25px; background-color:rgb(' + curr.color.R + "," + curr.color.G + "," + curr.color.B + ')"></span>');
                }
                _this.elements.result.append(modelo);
            }
            _this.renderProcessStack();
        },
        renderProcessStack: function() {
            var processes = PDI.processes;
            var renderProcesses = this.elements.stack.find(".stack-process");
            renderProcesses.html("");
            for (var i in processes) {
                var curr = processes[i];
                var func = curr.name;
                var params = curr.params;
                var process = this.elements.stack.find(".model li").clone();
                process.find(".name").text(func);
                process.find(".params .value").text(params.join(", "));
                process.attr("data-index", i);
                renderProcesses.append(process);
            }
        },
        init: function() {
            this.elements.inputFile = $("#inputFile");
            this.elements.contentHead = $(".content-menu");
            this.elements.contentBody = $(".content-render");
            this.elements.canvasOri = this.elements.contentBody.find("#canvas-image-origin");
            this.elements.canvasChg = this.elements.contentBody.find("#canvas-image-change");
            this.elements.modals.config = $("div.modal#configuration");
            this.elements.modelo = $(".content-render .modelo");
            this.elements.result = $(".content-render .results");
            this.elements.stack = $(".content-stack");
            this.events();
            return this;
        }
    };
    return new Application();
}(jQuery, new PDI());

Application.init();