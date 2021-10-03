let Vocalia = {
    $chartjs: null,
    colors: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(255, 205, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(201, 203, 207, 0.7)'
    ],
    // demo: [
    //     'i\t271\t2062\n' +
    //     'e,355,1883\n' +
    //     'Ɛ;550;1745\n' +
    //     'ɑ|685|1460\n' +
    //     'Ə\t449\t1212\n' +
    //     'ɔ\t599\t990\n' +
    //     'o\t453\t810\n' +
    //     'u\t342\t678'
    // ],
    datasets: [],
    chartAreaBorder: {
        id: 'chartAreaBorder',
        beforeDraw(chart, args, options) {
            const {ctx, chartArea: {left, top, width, height}} = chart;
            ctx.save();
            ctx.strokeStyle = options.borderColor;
            ctx.lineWidth = options.borderWidth;
            ctx.strokeRect(left, top, width, height);
            ctx.restore();
        }
    },
    samples: 0,

    init: function () {

        document.querySelector('[data-save]').addEventListener('click', (e) => {
            Vocalia.save();
        });
        document.querySelector('[data-add_sample]').addEventListener('click', (e) => {
            e.preventDefault();
            Vocalia.add(true);
        });

        document.querySelector('[data-load_demo]').addEventListener('click', (e) => {
            e.preventDefault();
            Vocalia.load_demo();
        });

        document.querySelectorAll('#phonetics > span').forEach(($symbol) => {
            $symbol.addEventListener('click', () => {
                navigator.clipboard.writeText($symbol.innerHTML).then(function () {
                    console.log('Async: Copying to clipboard was successful!');
                }, function (err) {
                    console.error('Async: Could not copy text: ', err);
                });
            });
        })

        Vocalia.load_demo();
    },

    load_demo: function () {
        let $demo = Vocalia.add(false);
        Vocalia.add_row($demo, {vowel: 'i', f1: 271, f2: 2062});
        Vocalia.add_row($demo, {vowel: 'e', f1: 355, f2: 1883});
        Vocalia.add_row($demo, {vowel: 'Ɛ', f1: 550, f2: 1745});
        Vocalia.add_row($demo, {vowel: 'a', f1: 685, f2: 1460});
        Vocalia.add_row($demo, {vowel: 'Ə', f1: 449, f2: 1212});
        Vocalia.add_row($demo, {vowel: 'ɔ', f1: 599, f2: 990});
        Vocalia.add_row($demo, {vowel: 'o', f1: 453, f2: 810});
        Vocalia.add_row($demo, {vowel: 'u', f1: 342, f2: 678});
    },

    add: function (add_row) {
        let $samples_container = document.getElementById('samples');
        let sample = Vocalia.samples++;
        let color = Vocalia.colors[sample % Vocalia.colors.length];

        let template = document.getElementById('sample-template').innerText;
        let $sample = Vocalia.createElement(Vocalia.render(template, {color: color}));
        $sample.style.setProperty('--color', color);
        $sample.dataset.index = sample.toString();
        $samples_container.append($sample);

        if (add_row) {
            Vocalia.add_row($sample);
        }

        $sample.querySelector('[data-add_row]').addEventListener('click', (e) => {
            e.preventDefault();
            Vocalia.add_row($sample);
        })

        $sample.querySelector('[data-remove_sample]').addEventListener('click', (e) => {
            e.preventDefault();
            $sample.remove();
            Vocalia.load();
        });

        return $sample;
    },

    add_row: function ($sample, data) {
        let $table = $sample.querySelector('table');

        if (typeof data != 'object') {
            data = {vowel: '', f1: '', f2: ''};
        } else {
            data.vowel = data.vowel || '';
            data.f1 = data.f1 || '';
            data.f2 = data.f2 || '';
        }

        let template = document.getElementById('row-template').innerText;
        let $row = Vocalia.createElement(Vocalia.render(template, data));
        $table.append($row);

        $row.querySelectorAll('input').forEach(($input) => {
            $input.addEventListener('input', () => {
                Vocalia.load();
            })
        });

        $row.querySelectorAll('[data-remove_row]').forEach(($remove) => {
            $remove.addEventListener('click', (e) => {
                e.preventDefault();
                // Vocalia.remove_row(sample, row);
                $row.remove();
                Vocalia.load();
            })
        });

        Vocalia.load();

        return $row;
    },

    load: function () {
        // let table = [];

        Vocalia.datasets = [];
        let max_x = 0;
        let min_x = 99999999999999999;
        let max_y = 0;
        let min_y = 99999999999999999;

        document.querySelectorAll('#samples table').forEach(($table) => {
            let sample = {
                backgroundColor: $table.dataset.color,
                data: [],
            };
            $table.querySelectorAll('tr').forEach(($line) => {
                let row = [];
                $line.querySelectorAll('input').forEach(($column) => {
                    row.push($column.value);
                });
                let point = {
                    label: row[0].toString().trim(),
                    y: parseFloat(row[1]),
                    x: parseFloat(row[2]),
                };
                if (isNaN(point.x) || isNaN(point.y) || point.label === '') {
                    return;
                }
                sample.data.push(point);

                max_x = Math.max(max_x, point.x);
                min_x = Math.min(min_x, point.x);
                max_y = Math.max(max_y, point.y);
                min_y = Math.min(min_y, point.y);
            });
            // console.table(sample);
            // table.push(sample);
            Vocalia.datasets.push(sample);
        });

        // document.querySelectorAll('#samples > textarea').forEach(($sample) => {
        //     let i = $sample.dataset.index;
        //     let data = $sample.value.split("\n");
        //
        //     data.forEach((line) => {
        //         line = line.toString().trim();
        //         if (line === '') {
        //             return;
        //         }
        //         line = line.split("\t").join(',').split('|').join(',').split(';').join(',').split(',');
        //         if (line.length !== 3) {
        //             return;
        //         }
        //         let vocal = line[0].toString().trim();
        //         let y = parseFloat(line[1].trim());
        //         let x = parseFloat(line[2].trim());
        //
        //         table[i] = table[i] || [];
        //         table[i].push({x, y, label: vocal})
        //
        //         max_x = Math.max(max_x, x);
        //         min_x = Math.min(min_x, x);
        //         max_y = Math.max(max_y, y);
        //         min_y = Math.min(min_y, y);
        //     })
        // })

        Vocalia.min_x = Math.max(min_x - 50, 1);
        Vocalia.min_y = Math.max(min_y - 50, 1);
        Vocalia.max_x = max_x + 100;
        Vocalia.max_y = max_y + 100;

        // Vocalia.datasets = [];
        // Object.keys(table).forEach((index) => {
        //     Vocalia.datasets.push({
        //         backgroundColor: Vocalia.colors[index % Vocalia.colors.length],
        //         // borderColor: Vocalia.colors[index % Vocalia.colors.length],
        //         data: table[index],
        //     });
        // });

        Vocalia.print();
    },

    print: function () {
        const config = {
            type: 'scatter',
            data: {
                datasets: Vocalia.datasets
            },
            plugins: [ChartDataLabels, Vocalia.chartAreaBorder],
            options: {
                // responsive: true,
                // pointRadius: 0,
                // pointHoverRadius: 0,
                animation: {
                    duration: 0
                },
                plugins: {
                    chartAreaBorder: {
                        borderColor: 'black',
                        borderWidth: 1,
                        // borderDash: [5, 5],
                        // borderDashOffset: 2,
                    },
                    tooltips: {
                        enabled: false,
                        callbacks: {
                            footer: function () {
                                return '';
                            },
                        }
                    },
                    legend: {
                        display: false,
                    },
                    datalabels: {
                        display: true,
                        formatter: function (value, ctx) {
                            return value.label;
                        },
                        backgroundColor: function (context) {
                            return context.dataset.backgroundColor;
                        },
                        font: {
                            weight: 'bold'
                        },
                        color: 'white',
                        padding: 6,
                        borderRadius: 4,
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'F2',
                        },
                        display: true,
                        type: 'logarithmic',
                        reverse: true,
                        position: 'top',
                        min: Vocalia.min_x,
                        max: Vocalia.max_x,
                        grid: {
                            display: false
                        },
                        ticks: {
                            display: true,
                            callback: (value, index, arr) => {
                                if (index === 0 || index === arr.length - 1) {
                                    return value;
                                } else {
                                    return '';
                                }
                            },
                            // maxRotation: 45,
                            // minRotation: 45
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'F1',
                        },
                        display: true,
                        type: 'logarithmic',
                        reverse: true,
                        position: 'right',
                        min: Vocalia.min_y,
                        max: Vocalia.max_y,
                        grid: {
                            display: false
                        },
                        ticks: {
                            display: true,
                            callback: (value, index, arr) => {
                                if (index === 0 || index === arr.length - 1) {
                                    return value;
                                } else {
                                    return '';
                                }
                            },
                        }
                    }
                }
            },
        };
        if (Vocalia.$chartjs) {
            Vocalia.$chartjs.destroy();
        }
        Vocalia.$chartjs = new Chart(
            document.getElementById('chartjs'),
            config
        );
    },

    save: function () {
        let $canvas = document.getElementById('chartjs');

        let ctx = $canvas.getContext('2d');
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, $canvas.width, $canvas.height);
        ctx.restore();

        let $save = document.createElement('a');
        $save.setAttribute('download', 'vocalia.png');
        $save.href = $canvas.toDataURL('image/png');
        $save.click();
        $save.remove();
    },

    render: function (template, item, parent) {
        Object.keys(item).forEach((key) => {
            let value = item[key];
            if (typeof parent !== 'undefined') {
                key = parent + '.' + key;
            }
            if (typeof value === 'object') {
                template = Vocalia.render(template, value, key);
            } else {
                template = template.split('{' + key + '}').join(value)
            }
        });

        return template;
    },

    createElement: function (html) {
        let template = document.createElement('template');
        template.innerHTML = html.trim(); // Never return a text node of whitespace as the result
        return template.content.firstChild;
    }

}

window.onload = function () {
    Vocalia.init();
}
