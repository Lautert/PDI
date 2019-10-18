/*! Application - v0.0.0 - 2019-10-17 */
var Application = function($, PDI) {
    window.Pdi = PDI;
    function Application() {
        this.brightness = 0;
        this.contrast = 1;
        this.binary = 200;
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
            var applyFilterGray = false;
            var ckFilterGray = _this.elements.contentHead.find('.filter-gray input[type="checkbox"]');
            ckFilterGray.attr("checked", applyFilterGray);
            function filterGray() {
                if (!applyFilterGray) {
                    if (PDI.processes["filterGray"] !== undefined) {
                        delete PDI.processes["filterGray"];
                    }
                    var results = PDI.processImage();
                } else {
                    var results = PDI.applyFilter("filterGray");
                }
                _this.renderResults(results);
                _this.loadStatistics();
            }
            _this.elements.contentHead.on("click", ".filter-gray", function(e) {
                var checkbox = $(e.target).parents(".checkbox-squared");
                if (checkbox.length > 0) {
                    applyFilterGray = !applyFilterGray;
                    ckFilterGray.attr("checked", applyFilterGray);
                    filterGray();
                    e.preventDefault();
                } else {
                    filterGray();
                }
            });
            var applyFilterNG = false;
            var ckFilterNG = _this.elements.contentHead.find('.negative input[type="checkbox"]');
            ckFilterNG.attr("checked", applyFilterNG);
            function filterNegative() {
                if (!applyFilterNG) {
                    if (PDI.processes["negative"] !== undefined) {
                        delete PDI.processes["negative"];
                    }
                    var results = PDI.processImage();
                } else {
                    var results = PDI.applyFilter("negative");
                }
                _this.renderResults(results);
                _this.loadStatistics();
            }
            _this.elements.contentHead.on("click", ".negative", function(e) {
                var checkbox = $(e.target).parents(".checkbox-squared");
                if (checkbox.length > 0) {
                    applyFilterNG = !applyFilterNG;
                    ckFilterNG.attr("checked", applyFilterNG);
                    filterNegative();
                    e.preventDefault();
                } else {
                    filterNegative();
                }
            });
            var applyFilterBinary = false;
            var ckFilterBinary = _this.elements.contentHead.find('.binary input[type="checkbox"]');
            ckFilterBinary.attr("checked", applyFilterBinary);
            var labelBinaryValue = _this.elements.contentHead.find(".binary label.value");
            function sliderBinaryChange(slider) {
                labelBinaryValue.text(slider.value);
                _this.binary = slider.value;
                filterBinary();
            }
            var slider = _this.elements.contentHead.find("#slider_binary").slider();
            slider.on("click", sliderBinaryChange);
            slider.on("slideStop", sliderBinaryChange);
            slider.on("slide", function(slider) {
                labelBinaryValue.text(slider.value);
            });
            function filterBinary() {
                if (!applyFilterBinary) {
                    if (PDI.processes["binary"] !== undefined) {
                        delete PDI.processes["binary"];
                    }
                    var results = PDI.processImage();
                } else {
                    var results = PDI.applyFilter("binary", _this.binary);
                }
                _this.renderResults(results);
                _this.loadStatistics();
            }
            _this.elements.contentHead.on("click", ".binary", function(e) {
                var checkbox = $(e.target).parents(".checkbox-squared");
                if (checkbox.length > 0) {
                    applyFilterBinary = !applyFilterBinary;
                    ckFilterBinary.attr("checked", applyFilterBinary);
                    filterBinary();
                    e.preventDefault();
                } else {
                    filterBinary();
                }
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
            var labelRotateValue = _this.elements.contentHead.find(".rotate label.value");
            function sliderRotateChange(slider) {
                labelRotateValue.text(slider.value);
                var results = PDI.applyFilter("rotate", slider.value);
                _this.renderResults(results);
            }
            var slider = _this.elements.contentHead.find("#slider_rotate").slider();
            slider.on("click", sliderRotateChange);
            slider.on("slideStop", sliderRotateChange);
            slider.on("slide", function(slider) {
                labelRotateValue.text(slider.value);
            });
            var labelBrightnessValue = _this.elements.contentHead.find(".brightness label.value");
            function sliderBrightnessChange(slider) {
                labelBrightnessValue.text(slider.value);
                _this.brightness = slider.value;
                var results = PDI.applyFilter("brightnessContrast", _this.brightness, _this.contrast);
                _this.renderResults(results);
            }
            var slider = _this.elements.contentHead.find("#slider_brightness").slider();
            slider.on("click", sliderBrightnessChange);
            slider.on("slideStop", sliderBrightnessChange);
            slider.on("slide", function(slider) {
                labelBrightnessValue.text(slider.value);
            });
            var labelContrastValue = _this.elements.contentHead.find(".contrast label.value");
            function sliderContrastChange(slider) {
                labelContrastValue.text(slider.value);
                _this.contrast = slider.value;
                var results = PDI.applyFilter("brightnessContrast", _this.brightness, _this.contrast);
                _this.renderResults(results);
            }
            var slider = _this.elements.contentHead.find("#slider_contrast").slider();
            slider.on("click", sliderContrastChange);
            slider.on("slideStop", sliderContrastChange);
            slider.on("slide", function(slider) {
                labelContrastValue.text(slider.value);
            });
            _this.elements.contentHead.on("change", '.mirror input[type="checkbox"]', function() {
                var x = _this.elements.contentHead.find(".mirror #mirror_x").is(":checked");
                var y = _this.elements.contentHead.find(".mirror #mirror_y").is(":checked");
                var results = PDI.applyFilter("mirror", x, y);
                _this.renderResults(results);
            });
            _this.elements.contentHead.on("click", ".aliasing", function() {
                var results = PDI.aliasing();
                _this.renderResults(results);
            });
            _this.elements.modals.config.on("change", ".gray-type", function() {
                PDI.setGrayScale(this.value);
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
        },
        renderResults: function(results) {
            var _this = this;
            this.elements.result.html("");
            for (var i in results) {
                var curr = results[i];
                var modelo = this.elements.modelo.clone();
                modelo.removeClass("modelo").addClass("content-image");
                var title = "Resultado";
                modelo.find("h4").html(title);
                var canvas = modelo.find("canvas.canvas-image-change");
                var c = canvas.get(0);
                c.width = curr.width;
                c.height = curr.height;
                var ctx = c.getContext("2d");
                ctx.putImageData(curr, 0, 0);
                var contentResult = modelo.find(".image-result");
                contentResult.find(".img-size").text(curr.width + "x" + curr.height);
                _this.elements.result.append(modelo);
            }
        },
        init: function() {
            this.elements.inputFile = $("#inputFile");
            this.elements.contentHead = $(".main-sidebar");
            this.elements.contentBody = $(".content-wrapper");
            this.elements.canvasOri = this.elements.contentBody.find("#canvas-image-origin");
            this.elements.canvasChg = this.elements.contentBody.find("#canvas-image-change");
            this.elements.modals.config = $("div.modal#configuration");
            this.elements.modelo = $(".content-wrapper .modelo");
            this.elements.result = $(".content-wrapper .results");
            this.events();
            return this;
        }
    };
    return new Application();
}(jQuery, new PDI());

Application.init();