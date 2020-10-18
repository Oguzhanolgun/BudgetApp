var budgetController = (function() {
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalInc) {
        if (totalInc > 0) {

            this.percentage = Math.round((this.value / totalInc) * 100);
        } else {

            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentage = function() {

        return this.percentage;
    };

    var Income = function(id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },

        budget: 0,
        percentage: -1
    };


    calculateTotal = function(type) {

        var sum = 0;
        data.allItems[type].forEach((cur) => {

            sum += cur.value;
        });
        data.totals[type] = sum;
    }

    return {
        addItem: function(type, des, val) {

            var newItem, ID;
            if (data.allItems[type].length > 0) {

                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

            } else {

                ID = 0;

            }

            if (type === "exp") {

                newItem = new Expense(ID, des, val);
            } else if (type === "inc") {

                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },
        showData: function() {

            console.log(data);
        },

        calculateBudget: function() {
            // 1. calculate total inc and exp

            calculateTotal('inc');
            calculateTotal('exp');

            // 2. calculate the budget: inc - exp

            data.budget = data.totals.inc - data.totals.exp;

            // 3. calculate the percentage of income that we spent
            if (data.totals.inc > 0) {

                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);

            } else {

                data.percentage = -1;

            }

        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(cur => cur.calcPercentage(data.totals.inc));
        },

        getPercentages: function() {

            var allPercentages = data.allItems.exp.map(cur => cur.getPercentage());
            return allPercentages;
        },

        getBudget: function() {

            return {

                budget: data.budget,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp

            };
        },

        deleteItem: function(type, id) {

            var ids, index;

            ids = data.allItems[type].map(function(cur) {
                return cur.id;
            });
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },




    };



})();




var UIController = (function() {
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercentagesLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };


    return {
        getInput: function() {

            return {

                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        getDOMStrings: function() {
            return DOMStrings;
        },

        addListItem: function(obj, type) {

            var html, newHtml, element;

            if (type === 'inc') {

                element = DOMStrings.incomeContainer;
                html = `<div class="item clearfix" id="inc-${obj.id}">
            <div class="item__description">${obj.description}</div>
             <div class="right clearfix">
                <div class="item__value">${this.formatNumber(obj.value, type)}</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
              </div>
           </div>`

            } else if (type === 'exp') {

                element = DOMStrings.expensesContainer;
                html = `<div class="item clearfix" id="exp-${obj.id}">
            <div class="item__description">${obj.description}</div>
               <div class="right clearfix">
                  <div class="item__value">${this.formatNumber(obj.value, type)}</div>
                  <div class="item__percentage">21%</div>
                  <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>`

            }

            document.querySelector(element).insertAdjacentHTML('beforeend', html);

        },

        clearFields: function() {

            var fields, fieldsArr;
            fields = document.querySelectorAll(`${DOMStrings.inputDescription} , ${DOMStrings.inputValue}`);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(current => {
                current.value = ""
            });
            fieldsArr[0].focus();

        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = `${this.formatNumber(obj.budget, type)}`;
            document.querySelector(DOMStrings.incomeLabel).textContent = `${this.formatNumber(obj.totalInc, type)}`;
            document.querySelector(DOMStrings.expensesLabel).textContent = `${this.formatNumber(obj.totalExp, type)}`;

            if (obj.percentage > 0) {

                document.querySelector(DOMStrings.percentageLabel).textContent = `${obj.percentage} %`;

            } else {

                document.querySelector(DOMStrings.percentageLabel).textContent = '---';

            }



        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMStrings.expPercentagesLabel);
            

            nodeListForEach(fields, function(cur, i) {

                if (percentages[i] > 0) {
                    cur.textContent = percentages[i] + '%';
                } else {
                    cur.textContent = '---';
                }
            });

        },

        deleteListItem: function(selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        formatNumber: function(num, type) {

            var numSplit, int, dec;
            num = Math.abs(num);
            num = num.toFixed(2);

            numSplit = num.split('.');
            int = numSplit[0];
            dec = numSplit[1];

            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
            }

            return (type === 'exp' ? '-' : '+') + int + '.' + dec;
        },

        displayDate: function() {
            var now, months, month, year;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'Jun', 'July', 'August', 'September', 
            'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {
            var fields = document.querySelectorAll(`
            ${DOMStrings.inputType}, 
            ${DOMStrings.inputDescription},
            ${DOMStrings.inputValue}`);

            nodeListForEach(fields, cur => cur.classList.toggle('red-focus'));
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },

    };




})();


var appController = (function(budgetCtrl, UICtrl) {

    setUpEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
        document.addEventListener("keypress", function() {

            if (KeyboardEvent.keyCode === 13 || KeyboardEvent.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    var updatePercentages = function() {
        // 1. Calculate Percentages
        budgetCtrl.calculatePercentages();

        // 2. Read Percentages fron the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages

        UICtrl.displayPercentages(percentages);
    };

    var updateBudget = function() {

        // 1. Calculate Budget

        budgetCtrl.calculateBudget();

        // 2. Return Budget 

        var budget = budgetController.getBudget();

        // 3. Display the budget on the UI 

        UICtrl.displayBudget(budget);


    };



    function ctrlAddItem() {
        // 1. Get the field input data
        var input = UICtrl.getInput();

        // 2. Add item to the budgetController

        if (input.description !== '' && input.value > 0) {

            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            budgetCtrl.showData();

            // 3. Add item to the UI

            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields

            UICtrl.clearFields();

            // 5. Calculate and update budget

            updateBudget();

            // 6. Calculate and update percentages

            updatePercentages();

        }


    };

    ctrlDeleteItem = function(e) {

        var itemID, splitID, type, ID;
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            // exp: itemID = inc-1 

            splitID = itemID.split('-');
            type = splitID[0];
            ID = +splitID[1];

            //1. delete the ıtem from the data structure

            budgetCtrl.deleteItem(type, ID);


            //2. delete the ıtem from the UI
            UICtrl.deleteListItem(itemID);

            //3. update and show the new budget
            updateBudget();

            // 6. Calculate and update percentages

            updatePercentages();
        }
    };

    return {
        init: function() {
            console.log('application is starting..');
            UICtrl.displayDate();
            UICtrl.displayBudget({

                budget: 0,
                percentage: 0,
                totalInc: 0,
                totalExp: 0

            })
            setUpEventListeners();
        }
    };



})(budgetController, UIController);

appController.init();