
document.addEventListener("DOMContentLoaded", () => {


    const display = document.getElementById("display");
    const history = document.getElementById("history");
    const angleMode = document.getElementById("angleMode");

    const themeToggle = document.getElementById("themeToggle");
    const modeText = document.getElementById("modeText");

    const categories = document.querySelectorAll(".category");
    const moduleTitle = document.getElementById("moduleTitle");
    const operationSelect = document.getElementById("operation");
    const solverForm = document.getElementById("solverForm");
    const inputFields = document.getElementById("inputFields");

    const solverResult = document.getElementById("solverResult");
    const formula = document.getElementById("formula");

    if (typeof math === "undefined") {
        alert("Math.js could not load. Check your internet connection.");
        return;
    }


    function setTheme(isDark) {

        document.body.classList.toggle("dark", isDark);

        themeToggle.checked = isDark;

        modeText.textContent = isDark
            ? "DARK MODE"
            : "LIGHT MODE";

        try {
            localStorage.setItem(
                "calculatorTheme",
                isDark ? "dark" : "light"
            );
        } catch (error) {
        
        }
    }

    let savedTheme = "light";

    try {
        savedTheme = localStorage.getItem("calculatorTheme") || "light";
    } catch (error) {
        savedTheme = "light";
    }

    setTheme(savedTheme === "dark");

    themeToggle.addEventListener("change", () => {
        setTheme(themeToggle.checked);
    });


    let expression = "";
    let isDegree = true;
    let calculationHistory = [];

    function updateDisplay() {
        display.value = expression || "0";
    }

    function evaluateExpression(input) {

        const scope = {
            sin: value => Math.sin(
                isDegree ? value * Math.PI / 180 : value
            ),

            cos: value => Math.cos(
                isDegree ? value * Math.PI / 180 : value
            ),

            tan: value => {
                const angle = isDegree
                    ? value * Math.PI / 180
                    : value;

                if (Math.abs(Math.cos(angle)) < 1e-12) {
                    throw new Error("Tangent is undefined at this angle.");
                }

                return Math.tan(angle);
            }
        };

        return math.evaluate(input, scope);
    }

    function formatAnswer(answer) {

        if (typeof answer === "number" && !Number.isFinite(answer)) {
            throw new Error("Result is not a finite number.");
        }

        return math.format(answer, {
            precision: 12
        });
    }

    function calculateScientific() {

        if (!expression.trim()) return;

        try {
            const originalExpression = expression;
            const answer = evaluateExpression(expression);
            const formattedAnswer = formatAnswer(answer);

            history.textContent = originalExpression + " =";

            calculationHistory.unshift(
                originalExpression + " = " + formattedAnswer
            );

            expression = String(formattedAnswer);

            updateDisplay();
            renderHistory();

        } catch (error) {
            history.textContent = "Calculation error";
            display.value = "Error";
        }
    }

    function insertValue(value) {

        if (expression === "Error") {
            expression = "";
        }

        if (expression === "0" && /^[0-9.]$/.test(value)) {
            expression = "";
        }

        expression += value;

        updateDisplay();
    }

    function clearCalculator() {

        expression = "";

        display.value = "0";
        history.textContent = "";

    }

    function deleteLast() {

        if (expression === "Error") {
            expression = "";
        } else {
            expression = expression.slice(0, -1);
        }

        updateDisplay();
    }

    function toggleSign() {

        if (!expression) {
            expression = "-";
        } else if (expression.startsWith("-")) {
            expression = expression.slice(1);
        } else {
            expression = "-" + expression;
        }

        updateDisplay();
    }

    function calculatePercent() {

        if (!expression) return;

        try {
            const answer = evaluateExpression(expression);

            expression = String(Number(answer) / 100);

            updateDisplay();

        } catch (error) {
            display.value = "Error";
        }
    }

    function calculateReciprocal() {

        if (!expression) return;

        expression = `1/(${expression})`;

        updateDisplay();
    }

    function calculateFactorial() {

        if (!expression) return;

        expression += "!";

        updateDisplay();
    }


    document.querySelectorAll("[data-insert]").forEach(button => {

        button.addEventListener("click", () => {
            insertValue(button.dataset.insert);
        });

    });

    document.querySelectorAll("[data-action]").forEach(button => {

        button.addEventListener("click", () => {

            const action = button.dataset.action;

            switch (action) {

                case "clear":
                    clearCalculator();
                    break;

                case "delete":
                    deleteLast();
                    break;

                case "calculate":
                    calculateScientific();
                    break;

                case "percent":
                    calculatePercent();
                    break;

                case "sign":
                    toggleSign();
                    break;

                case "reciprocal":
                    calculateReciprocal();
                    break;

                case "factorial":
                    calculateFactorial();
                    break;
            }
        });

    });

    document.getElementById("clear").addEventListener(
        "click",
        clearCalculator
    );


    angleMode.addEventListener("click", () => {

        isDegree = !isDegree;

        angleMode.textContent = isDegree ? "DEG" : "RAD";

    });


    document.addEventListener("keydown", event => {

        if (event.target.matches("input, select, textarea")) {
            return;
        }

        if (/^[0-9.]$/.test(event.key)) {
            insertValue(event.key);
        }

        else if (["+", "-", "*", "/", "^", "(", ")"].includes(event.key)) {
            insertValue(event.key);
        }

        else if (event.key === "Enter" || event.key === "=") {
            event.preventDefault();
            calculateScientific();
        }

        else if (event.key === "Backspace") {
            deleteLast();
        }

        else if (event.key === "Escape") {
            clearCalculator();
        }
    });


    function renderHistory() {

        const historyList = document.getElementById("historyList");

        if (!historyList) return;

        historyList.innerHTML = "";

        calculationHistory.slice(0, 10).forEach(item => {

            const li = document.createElement("li");

            li.textContent = item;

            historyList.appendChild(li);

        });
    }


    function number(value, name) {

        const result = Number(value);

        if (value === "" || !Number.isFinite(result)) {
            throw new Error("Enter a valid number for " + name + ".");
        }

        return result;
    }

    function positive(value, name) {

        const result = number(value, name);

        if (result <= 0) {
            throw new Error(name + " must be greater than zero.");
        }

        return result;
    }

    function nonNegative(value, name) {

        const result = number(value, name);

        if (result < 0) {
            throw new Error(name + " cannot be negative.");
        }

        return result;
    }

    function resultText(value) {

        if (typeof value === "number" && !Number.isFinite(value)) {
            throw new Error("The result is undefined.");
        }

        return typeof value === "number"
            ? math.format(value, { precision: 12 })
            : String(value);
    }

    function parseNumberList(input) {

        if (!input.trim()) {
            throw new Error("Enter numbers separated by commas.");
        }

        const values = input.split(",").map(item => {

            const value = Number(item.trim());

            if (item.trim() === "" || !Number.isFinite(value)) {
                throw new Error("Enter valid numbers separated by commas.");
            }

            return value;

        });

        return values;
    }

    function parseMatrix(value) {

        let matrix;

        try {
            matrix = JSON.parse(value);
        } catch (error) {
            throw new Error(
                "Enter a valid matrix, e.g. [[1,2],[3,4]]."
            );
        }

        if (
            !Array.isArray(matrix) ||
            matrix.length === 0 ||
            !matrix.every(row =>
                Array.isArray(row) &&
                row.length === matrix.length &&
                row.every(item =>
                    typeof item === "number" &&
                    Number.isFinite(item)
                )
            )
        ) {
            throw new Error("Enter a square matrix containing numbers.");
        }

        return matrix;
    }

    function requireNerdamer() {

        if (typeof nerdamer === "undefined") {
            throw new Error(
                "Nerdamer could not load. Check your internet connection."
            );
        }
    }


    const modules = {

        /* FINANCE */

        finance: {
            title: "Finance Calculator",

            operations: {

                "Simple Interest": {
                    fields: [
                        "Principal amount",
                        "Annual interest rate (%)",
                        "Time (years)"
                    ],

                    calculate: v => {

                        const p = positive(v[0], "Principal");
                        const r = nonNegative(v[1], "Interest rate");
                        const t = nonNegative(v[2], "Time");

                        const interest = p * r * t / 100;

                        return {
                            answer:
                                "Interest: " + resultText(interest) +
                                " | Total: " + resultText(p + interest),

                            formula: "SI = (P × R × T) / 100"
                        };
                    }
                },

                "Compound Interest": {
                    fields: [
                        "Principal amount",
                        "Annual interest rate (%)",
                        "Time (years)",
                        "Compounds per year"
                    ],

                    calculate: v => {

                        const p = positive(v[0], "Principal");
                        const r = nonNegative(v[1], "Interest rate") / 100;
                        const t = nonNegative(v[2], "Time");
                        const n = positive(v[3], "Compounds per year");

                        const amount = p * Math.pow(1 + r / n, n * t);
                        const interest = amount - p;

                        return {
                            answer:
                                "Interest: " + resultText(interest) +
                                " | Amount: " + resultText(amount),

                            formula: "A = P(1 + R/n)^(nt)"
                        };
                    }
                },

                "EMI Calculator": {
                    fields: [
                        "Loan amount",
                        "Annual interest rate (%)",
                        "Loan period (years)"
                    ],

                    calculate: v => {

                        const p = positive(v[0], "Loan amount");
                        const rate = nonNegative(v[1], "Interest rate");
                        const years = positive(v[2], "Loan period");

                        const monthlyRate = rate / 1200;
                        const months = years * 12;

                        const emi = monthlyRate === 0
                            ? p / months
                            : p * monthlyRate *
                              Math.pow(1 + monthlyRate, months) /
                              (Math.pow(1 + monthlyRate, months) - 1);

                        return {
                            answer:
                                "Monthly EMI: " + resultText(emi) +
                                " | Total payment: " +
                                resultText(emi * months),

                            formula: "EMI = P × r × (1+r)^n / ((1+r)^n - 1)"
                        };
                    }
                },

                "Discount Calculator": {
                    fields: [
                        "Original price",
                        "Discount percentage (%)"
                    ],

                    calculate: v => {

                        const price = nonNegative(v[0], "Price");
                        const rate = nonNegative(v[1], "Discount");

                        if (rate > 100) {
                            throw new Error("Discount cannot exceed 100%.");
                        }

                        const discount = price * rate / 100;

                        return {
                            answer:
                                "Discount: " + resultText(discount) +
                                " | Final price: " +
                                resultText(price - discount),

                            formula: "Discount = Price × Rate / 100"
                        };
                    }
                },

                "GST Calculator": {
                    fields: [
                        "Original price",
                        "GST percentage (%)"
                    ],

                    calculate: v => {

                        const price = nonNegative(v[0], "Price");
                        const rate = nonNegative(v[1], "GST rate");

                        const gst = price * rate / 100;

                        return {
                            answer:
                                "GST: " + resultText(gst) +
                                " | Total price: " + resultText(price + gst),

                            formula: "GST = Price × GST rate / 100"
                        };
                    }
                },

                "Profit and Loss": {
                    fields: [
                        "Cost price",
                        "Selling price"
                    ],

                    calculate: v => {

                        const cost = positive(v[0], "Cost price");
                        const selling = nonNegative(v[1], "Selling price");

                        const difference = selling - cost;
                        const percentage = Math.abs(difference) / cost * 100;

                        return {
                            answer: difference > 0
                                ? "Profit: " + resultText(difference) +
                                  " | Profit percentage: " +
                                  resultText(percentage) + "%"
                                : difference < 0
                                ? "Loss: " + resultText(-difference) +
                                  " | Loss percentage: " +
                                  resultText(percentage) + "%"
                                : "No profit, no loss.",

                            formula: "Profit/Loss = Selling Price - Cost Price"
                        };
                    }
                }
            }
        },


        physics: {
            title: "Physics Calculator",

            operations: {

                "Speed": {
                    fields: ["Distance (metres)", "Time (seconds)"],

                    calculate: v => {

                        const d = nonNegative(v[0], "Distance");
                        const t = positive(v[1], "Time");

                        return {
                            answer: resultText(d / t) + " m/s",
                            formula: "Speed = Distance / Time"
                        };
                    }
                },

                "Force": {
                    fields: ["Mass (kg)", "Acceleration (m/s²)"],

                    calculate: v => {

                        const m = nonNegative(v[0], "Mass");
                        const a = number(v[1], "Acceleration");

                        return {
                            answer: resultText(m * a) + " N",
                            formula: "Force = Mass × Acceleration"
                        };
                    }
                },

                "Work": {
                    fields: ["Force (newtons)", "Distance (metres)"],

                    calculate: v => {

                        const f = number(v[0], "Force");
                        const d = number(v[1], "Distance");

                        return {
                            answer: resultText(f * d) + " J",
                            formula: "Work = Force × Distance (same direction)"
                        };
                    }
                },

                "Power": {
                    fields: ["Work (joules)", "Time (seconds)"],

                    calculate: v => {

                        const w = number(v[0], "Work");
                        const t = positive(v[1], "Time");

                        return {
                            answer: resultText(w / t) + " W",
                            formula: "Power = Work / Time"
                        };
                    }
                },

                "Density": {
                    fields: ["Mass (kg)", "Volume (m³)"],

                    calculate: v => {

                        const m = nonNegative(v[0], "Mass");
                        const volume = positive(v[1], "Volume");

                        return {
                            answer: resultText(m / volume) + " kg/m³",
                            formula: "Density = Mass / Volume"
                        };
                    }
                },

                "Pressure": {
                    fields: ["Force (newtons)", "Area (m²)"],

                    calculate: v => {

                        const f = number(v[0], "Force");
                        const a = positive(v[1], "Area");

                        return {
                            answer: resultText(f / a) + " Pa",
                            formula: "Pressure = Force / Area"
                        };
                    }
                }
            }
        },


        geometry: {
            title: "Geometry Calculator",

            operations: {

                "Rectangle": {
                    fields: ["Length", "Width"],

                    calculate: v => {

                        const l = positive(v[0], "Length");
                        const w = positive(v[1], "Width");

                        return {
                            answer:
                                "Area: " + resultText(l * w) +
                                " | Perimeter: " + resultText(2 * (l + w)),

                            formula: "Area = Length × Width"
                        };
                    }
                },

                "Circle": {
                    fields: ["Radius"],

                    calculate: v => {

                        const r = positive(v[0], "Radius");

                        return {
                            answer:
                                "Area: " + resultText(Math.PI * r * r) +
                                " | Circumference: " +
                                resultText(2 * Math.PI * r),

                            formula: "Area = πr² | Circumference = 2πr"
                        };
                    }
                },

                "Triangle": {
                    fields: ["Side A", "Side B", "Side C"],

                    calculate: v => {

                        const a = positive(v[0], "Side A");
                        const b = positive(v[1], "Side B");
                        const c = positive(v[2], "Side C");

                        if (a + b <= c || a + c <= b || b + c <= a) {
                            throw new Error("These sides cannot form a triangle.");
                        }

                        const s = (a + b + c) / 2;
                        const area = Math.sqrt(
                            s * (s - a) * (s - b) * (s - c)
                        );

                        return {
                            answer:
                                "Area: " + resultText(area) +
                                " | Perimeter: " + resultText(a + b + c),

                            formula: "Heron's Formula: √[s(s-a)(s-b)(s-c)]"
                        };
                    }
                },

                "Cylinder": {
                    fields: ["Radius", "Height"],

                    calculate: v => {

                        const r = positive(v[0], "Radius");
                        const h = positive(v[1], "Height");

                        return {
                            answer:
                                "Volume: " + resultText(Math.PI * r * r * h) +
                                " | Total surface area: " +
                                resultText(2 * Math.PI * r * (r + h)),

                            formula: "Volume = πr²h"
                        };
                    }
                },

                "Sphere": {
                    fields: ["Radius"],

                    calculate: v => {

                        const r = positive(v[0], "Radius");

                        return {
                            answer:
                                "Volume: " +
                                resultText(4 / 3 * Math.PI * r ** 3) +
                                " | Surface area: " +
                                resultText(4 * Math.PI * r * r),

                            formula: "Volume = (4/3)πr³"
                        };
                    }
                },

                "Pythagorean Theorem": {
                    fields: ["Side A", "Side B"],

                    calculate: v => {

                        const a = positive(v[0], "Side A");
                        const b = positive(v[1], "Side B");

                        return {
                            answer: "Hypotenuse: " + resultText(Math.hypot(a, b)),
                            formula: "c = √(a² + b²)"
                        };
                    }
                }
            }
        },


        statistics: {
            title: "Statistics Calculator",

            operations: {

                "Mean": {
                    fields: ["Numbers separated by commas (e.g. 10,20,30,40)"],

                    calculate: v => {

                        const values = parseNumberList(v[0]);

                        return {
                            answer: "Mean: " + resultText(math.mean(values)),
                            formula: "Mean = Sum of values / Number of values"
                        };
                    }
                },

                "Median": {
                    fields: ["Numbers separated by commas (e.g. 10,20,30,40)"],

                    calculate: v => {

                        const values = parseNumberList(v[0]);

                        return {
                            answer: "Median: " + resultText(math.median(values)),
                            formula: "Median = Middle value of sorted data"
                        };
                    }
                },

                "Mode": {
                    fields: ["Numbers separated by commas (e.g. 1,2,2,3,4)"],

                    calculate: v => {

                        const values = parseNumberList(v[0]);
                        const frequencies = new Map();

                        values.forEach(n => {
                            frequencies.set(n, (frequencies.get(n) || 0) + 1);
                        });

                        const maxFrequency = Math.max(...frequencies.values());

                        if (maxFrequency === 1) {
                            return {
                                answer: "No mode (all values occur once).",
                                formula: "Mode = Most frequently occurring value"
                            };
                        }

                        const modes = [...frequencies.entries()]
                            .filter(([, count]) => count === maxFrequency)
                            .map(([value]) => value);

                        return {
                            answer: "Mode: " + modes.join(", "),
                            formula: "Mode = Most frequently occurring value(s)"
                        };
                    }
                },

                "Population Standard Deviation": {
                    fields: ["Numbers separated by commas (e.g. 10,20,30,40)"],

                    calculate: v => {

                        const values = parseNumberList(v[0]);

                        return {
                            answer: "Population standard deviation: " +
                                resultText(math.std(values, "uncorrected")),

                            formula: "σ = √[Σ(x - μ)² / N]"
                        };
                    }
                },

                "Probability": {
                    fields: ["Favourable outcomes", "Total possible outcomes"],

                    calculate: v => {

                        const favourable = nonNegative(v[0], "Favourable outcomes");
                        const total = positive(v[1], "Total outcomes");

                        if (favourable > total) {
                            throw new Error("Favourable outcomes cannot exceed total outcomes.");
                        }

                        const probability = favourable / total;

                        return {
                            answer:
                                "Probability: " + resultText(probability) +
                                " | Percentage: " +
                                resultText(probability * 100) + "%",

                            formula: "P(E) = Favourable outcomes / Total outcomes"
                        };
                    }
                }
            }
        },


        engineering: {
            title: "Engineering Calculator",

            operations: {

                "Matrix Determinant": {
                    fields: ["Matrix JSON (e.g. [[1,2],[3,4]])"],

                    calculate: v => {

                        const matrix = parseMatrix(v[0]);

                        return {
                            answer: "Determinant: " + resultText(math.det(matrix)),
                            formula: "Determinant of a square matrix"
                        };
                    }
                },

                "Matrix Inverse": {
                    fields: ["Matrix JSON (e.g. [[1,2],[3,4]])"],

                    calculate: v => {

                        const matrix = parseMatrix(v[0]);
                        const determinant = math.det(matrix);

                        if (Math.abs(determinant) < 1e-12) {
                            throw new Error("This matrix has no inverse.");
                        }

                        return {
                            answer: math.format(math.inv(matrix), { precision: 10 }),
                            formula: "A × A⁻¹ = I"
                        };
                    }
                },

                "Complex Numbers": {
                    fields: ["Complex expression (e.g. (2+3i)*(4-2i))"],

                    calculate: v => {

                        const answer = math.evaluate(v[0]);

                        return {
                            answer: resultText(answer),
                            formula: "Complex number calculation using i² = -1"
                        };
                    }
                },

                "Differentiation": {
                    fields: ["Expression in x (e.g. x^3 + 2*x^2)"],

                    calculate: v => {

                        requireNerdamer();

                        return {
                            answer: "Derivative: " + nerdamer.diff(v[0], "x").toString(),
                            formula: "Differentiate with respect to x"
                        };
                    }
                },

                "Integration": {
                    fields: ["Expression in x (e.g. x^2 + 3*x)"],

                    calculate: v => {

                        requireNerdamer();

                        return {
                            answer: "Integral: " +
                                nerdamer.integrate(v[0], "x").toString() + " + C",

                            formula: "Indefinite integration with respect to x"
                        };
                    }
                },

                "Linear Equation": {
                    fields: ["Equation (e.g. 2*x+5=15)"],

                    calculate: v => {

                        requireNerdamer();

                        const equation = v[0].replace(/\s+/g, "");

                        if (!equation.includes("=")) {
                            throw new Error("Enter an equation, e.g. 2*x+5=15.");
                        }

                        return {
                            answer: "Solution: x = " +
                                nerdamer.solve(equation, "x").toString(),

                            formula: "Solve the equation for x"
                        };
                    }
                }
            }
        },


        algebra: {
            title: "Algebra Calculator",

            operations: {

                "Expand": {
                    fields: ["Expression (e.g. (x+2)*(x+3))"],

                    calculate: v => {

                        requireNerdamer();

                        return {
                            answer: nerdamer.expand(v[0]).toString(),
                            formula: "Expand brackets and multiply terms"
                        };
                    }
                },

                "Factor": {
                    fields: ["Expression (e.g. x^2+5*x+6)"],

                    calculate: v => {

                        requireNerdamer();

                        return {
                            answer: nerdamer.factor(v[0]).toString(),
                            formula: "Write the expression as a product of factors"
                        };
                    }
                },

                "Simplify": {
                    fields: ["Expression (e.g. 3*x+2*x+5+4)"],

                    calculate: v => {

                        requireNerdamer();

                        return {
                            answer: nerdamer.simplify(v[0]).toString(),
                            formula: "Combine like terms and simplify"
                        };
                    }
                },

                "Solve for x": {
                    fields: ["Equation (e.g. 2*x+5=15)"],

                    calculate: v => {

                        requireNerdamer();

                        const equation = v[0].replace(/\s+/g, "");

                        if (!equation.includes("=")) {
                            throw new Error("Enter an equation, e.g. 2*x+5=15.");
                        }

                        return {
                            answer: "x = " +
                                nerdamer.solve(equation, "x").toString(),

                            formula: "Find the value of x that satisfies the equation"
                        };
                    }
                }
            }
        }
    };


    let currentModule = "finance";

    function clearSolverResult() {

        solverResult.textContent = "Your answer will appear here.";
        formula.textContent = "";

    }

    function createInputFields() {

        const operation = operationSelect.value;
        const config = modules[currentModule].operations[operation];

        inputFields.innerHTML = "";

        if (!config) return;

        config.fields.forEach((field, index) => {

            const wrapper = document.createElement("div");
            wrapper.className = "field";

            const isTextField =
                /comma|json|expression|equation/i.test(field);

            if (isTextField) {
                wrapper.classList.add("full");
            }

            const label = document.createElement("label");
            label.textContent = field;

            const input = document.createElement("input");

            input.type = "text";
            input.name = "field" + index;
            input.placeholder = "Enter " + field;
            input.autocomplete = "off";
            input.required = true;

            if (!isTextField) {
                input.inputMode = "decimal";
            }

            wrapper.appendChild(label);
            wrapper.appendChild(input);

            inputFields.appendChild(wrapper);

        });
    }


    function loadModule(moduleName) {

        const module = modules[moduleName];

        if (!module) return;

        currentModule = moduleName;

        moduleTitle.textContent = module.title;

        operationSelect.innerHTML = "";

        Object.keys(module.operations).forEach(operation => {

            const option = document.createElement("option");

            option.value = operation;
            option.textContent = operation;

            operationSelect.appendChild(option);

        });

        createInputFields();
        clearSolverResult();
    }

    operationSelect.addEventListener("change", () => {

        createInputFields();
        clearSolverResult();

    });


    categories.forEach(button => {

        button.addEventListener("click", () => {

            categories.forEach(category => {
                category.classList.remove("active");
            });

            button.classList.add("active");

            loadModule(button.dataset.module);

        });

    });


    solverForm.addEventListener("submit", event => {

        event.preventDefault();

        const operation = operationSelect.value;
        const config = modules[currentModule].operations[operation];

        if (!config) return;

        const inputs = [
            ...inputFields.querySelectorAll("input")
        ];

        const values = inputs.map(input => input.value.trim());

        if (values.some(value => value === "")) {

            solverResult.textContent = "Please fill in all fields.";
            formula.textContent = "";

            return;
        }

        try {

            const result = config.calculate(values);

            solverResult.textContent = result.answer;

            formula.textContent = "Formula: " + result.formula;

        } catch (error) {

            solverResult.textContent = "Error: " + error.message;

            formula.textContent = "Please check your inputs and try again.";

        }

    });

    updateDisplay();
    loadModule("finance");

});
// REAL-WORLD SOLVER CLEAR BUTTON
const clearSolver = document.getElementById("clearSolver");

clearSolver.addEventListener("click", function () {

    // Clear all input values
    document.querySelectorAll("#inputFields input").forEach(input => {
        input.value = "";
    });

    // Reset result
    document.getElementById("solverResult").textContent =
        "Your answer will appear here.";

    // Clear formula
    document.getElementById("formula").textContent = "";

});