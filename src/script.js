let langSetting = './en.json';
let lang;

let days;
let months;
let money;

let date;
let dayOfWeek;
let day;
let month;
let year;
let hour;
let minute;

let id = 1;

let _x = [];
let _y = [];

function init() {
	days = lang.day;
	months = lang.month;
	money = lang.money;

	date = new Date();
	dayOfWeek = date.getDay();
	day = date.getDate();
	month = parseInt(date.getMonth()) + 1;
	year = date.getFullYear();
	hour = date.getHours();
	minute = date.getMinutes();

	if (localStorage.lastId) {
		id = parseInt(localStorage.getItem("lastId"));
	} else {
		id = 1;
	}

	translateGUI();
	recoverCategories();
	recoverExpenses();
	navigate("expensesTab");
	overwriteForms();
}

function translateGUI() {
	document.getElementById("expense").value = lang.menu.expense;
	document.getElementById("entry").value = lang.menu.newExpense;
	document.getElementById("settings").value = lang.menu.settings;
	document.getElementById("categoriesButton").value = lang.menu.categories;
	document.getElementById("categoryInput").placeholder = lang.menu.category;
	document.getElementById("resetButton").value = lang.menu.reset;
	document.getElementById("deleteButton").value = lang.menu.erase;
	document.getElementById("deleteCategoryButton").value = lang.menu.erase;
	document.getElementById("cancelButton").value = lang.cancel;
	document.getElementById("confirmButton").value = lang.accept;
}

function overwriteForms() {
	document.getElementById("expenseForm").addEventListener("submit", function(event) {
		event.preventDefault();
		addExpense();
	});

	document.getElementById("confirmForm").addEventListener("submit", function(event) {
		event.preventDefault();
		document.getElementById("confirmButton").click();
	});

	document.getElementById("categoryForm").addEventListener("submit", function(event) {
		event.preventDefault();
		document.getElementById("addCategoryButton").click();
	});
}

function saveCategories(click = true) {
	if (click) {
		let inputValue = document.getElementById("categoryInput").value.trim();

		if (inputValue.match(/^[0-9a-zA-Z ]+$/)) {
			let categoriesArray = localStorage.getItem("categories").toLowerCase().split(';');

			if (categoriesArray.indexOf(inputValue.toLowerCase()) !== -1) {
				showAlert("show", lang.catExists);
				document.getElementById("categoryInput").value = "";
				return;
			}

			let newCategory = localStorage.getItem("categories") + ";" + inputValue;
			localStorage.setItem("categories", newCategory);
		} else {
			showAlert("show", lang.invalidData);
			document.getElementById("categoryInput").value = "";
			return;
		}
	} else {
		let categoriesText = document
			.getElementById("categories")
			.innerText
			.replace(/\n/g, ';')
			.replace(/;$/, '');

		localStorage.setItem("categories", categoriesText);
	}

	recoverCategories();
	document.getElementById("categoryInput").value = "";
}

function removeCategories(confirmed = false) {
	if (!confirmed) {
		openConfirm("show", removeCategories);
		return;
	}

	let categories = document.getElementsByName("category");

	for (let i = categories.length - 1; i >= 0; i--) {
		if (categories[i].checked) {
			categories[i].parentNode.parentNode.remove();
		}
	}

	saveCategories(false);
}

function recoverCategories() {
	if (!localStorage.categories) {
		localStorage.setItem("categories", lang.defaultCat);
	}

	let categoriesList = localStorage.getItem("categories").split(";");

	document.getElementById("categories").innerHTML = "";
	document.getElementById("location").options.length = 0;

	for (let i = 0; i < categoriesList.length; i++) {
		if (categoriesList[i].length > 0) {
			let option = document.createElement("option");
			option.text = categoriesList[i];
			option.value = categoriesList[i];

			document.getElementById("location").appendChild(option);

			document.getElementById("categories").innerHTML +=
				"<div class='categoryRow'><label for='category_" + categoriesList[i] + "'>"
				+ "<input type='checkbox' name='category' id='category_" + categoriesList[i] + "' "
				+ "onclick='enableDelete(\"category\", \"deleteCategoryButton\")' />"
				+ "<div class='dayValue'>" + categoriesList[i] + "</div></label></div>";
		}
	}

	enableDelete("category", "deleteCategoryButton");
}

function n(number) {
	return number > 9 ? "" + number : "0" + number;
}

function addExpense() {
	let expenseDate = dayOfWeek + ";" + n(day) + "/" + n(month) + "/" + year + ";" + n(hour) + ":" + n(minute);
	let value = parseFloat(document.getElementById("value").value).toFixed(2);

	if (value && !isNaN(value)) {
		let locationValue = document.getElementById("location").value;

		localStorage.setItem(id, expenseDate + ";" + value + ";" + locationValue);
		localStorage.setItem("lastId", ++id);
	} else {
		showAlert("show", lang.moneyInvalid);
		return;
	}

	document.getElementById("value").value = "";
	recoverExpenses();
	navigate("expensesTab");
}

function recoverExpenses() {
	let hasAnyExpense = false;

	_x = [];
	_y = [];

	if (id > 1) {
		for (let i = id - 1; i > 0; i--) {
			if (localStorage.getItem(i)) {
				hasAnyExpense = true;
				break;
			}
		}
	}

	if (hasAnyExpense) {
		document.getElementById("deleteExpense").style.display = "block";
		document.getElementById("expensesContent").innerHTML = "";

		let totalMonthValue = 0;
		let totalDayValue = 0;
		let lastMonth = "00";
		let lastYear = "0000";
		let lastDate = "00/00/0000";

		for (let i = id - 1; i > 0; i--) {
			if (localStorage.getItem(i)) {
				let dataValues = localStorage.getItem(i).split(";");
				let splitDate = dataValues[1].split('/');

				let currentYear = splitDate[2];
				let currentMonth = splitDate[1];

				if (currentYear == year && currentMonth >= month - 3) {
					if (localStorage.categories.split(';').indexOf(dataValues[4]) !== -1) {
						_x.push([
							dataValues[0],
							dataValues[2].split(':')[0],
							parseFloat(dataValues[3]).toFixed(2)
						]);

						_y.push(localStorage.categories.split(';').indexOf(dataValues[4]));
					}
				}

				if (currentYear !== lastYear) {
					lastYear = currentYear;
				}

				if (currentMonth !== lastMonth) {
					lastMonth = currentMonth;

					if (i !== id - 1) {
						document.getElementById("expensesContent").innerHTML += "<br>";
					}

					document.getElementById("expensesContent").innerHTML +=
						months[parseInt(lastMonth) - 1]
						+ " <div id='month_" + lastMonth + lastYear + "' class='monthValue'></div>";

					totalMonthValue = 0;
				}

				if (dataValues[1] !== lastDate) {
					lastDate = dataValues[1];

					document.getElementById("expensesContent").innerHTML +=
						"<div class='date'>"
						+ days[parseInt(dataValues[0])] + ", " + dataValues[1]
						+ "<div id='date_" + dataValues[1].replaceAll("/", "_") + "' class='dayValue'></div>"
						+ "</div>";

					totalDayValue = 0;
				}

				totalDayValue += parseFloat(dataValues[3]);
				totalMonthValue += parseFloat(dataValues[3]);

				document.getElementById("expensesContent").innerHTML +=
					"<div class='expense'>"
					+ "<div class='expenseCell1'>"
					+ "<input type='checkbox' name='expense' value='" + i + "' "
					+ "onclick='enableDelete(\"expense\", \"deleteButton\")'></div>"
					+ "<div class='expenseCell2'>" + dataValues[2] + "</div>"
					+ "<div class='expenseCell3'>" + money + " " + parseFloat(dataValues[3]).toFixed(2) + "</div>"
					+ "<div class='expenseCell4'>" + dataValues[4] + "</div>"
					+ "</div>";

				document.getElementById("month_" + lastMonth + lastYear).innerHTML =
					money + " " + totalMonthValue.toFixed(2);

				document.getElementById("date_" + dataValues[1].replaceAll("/", "_")).innerHTML =
					money + " " + totalDayValue.toFixed(2);
			}
		}

		enableDelete("expense", "deleteButton");
	} else {
		document.getElementById("expensesContent").innerHTML = lang.noneExpanse;
		document.getElementById("deleteExpense").style.display = "none";
	}
}

function showAlert(what, msg = "") {
	switch (what) {
		case "show":
			document.getElementById("alertMessage").innerHTML = msg;
			document.getElementById("backdrop").style.display = "block";
			document.getElementById("alert").style.display = "block";
			break;

		case "hide":
			document.getElementById("backdrop").style.display = "none";
			document.getElementById("alert").style.display = "none";
			break;
	}
}

function openConfirm(what, callback) {
	switch (what) {
		case "show":
			document.getElementById("backdrop").style.display = "block";
			document.getElementById("confirm").style.display = "block";
			document.getElementById("confirmMessage").innerHTML = lang.confirm;

			document.getElementById("confirmButton").onclick = function() {
				callback(true);
				openConfirm("hide");
			};
			break;

		case "hide":
			document.getElementById("backdrop").style.display = "none";
			document.getElementById("confirm").style.display = "none";
			break;
	}
}

function enableDelete(checkbox, button) {
	let anySelected = false;

	let checkboxes = document.getElementsByName(checkbox);

	for (let i = 0; i < checkboxes.length; i++) {
		if (checkboxes[i].checked) {
			anySelected = true;
			break;
		}
	}

	document.getElementById(button).disabled = !anySelected;
}

function removeExpense(confirmed = false) {
	if (!confirmed) {
		openConfirm("show", removeExpense);
		return;
	}

	let values = document.getElementsByName("expense");

	for (let i = values.length - 1; i >= 0; i--) {
		if (values[i].checked) {
			localStorage.removeItem(values[i].value);
		}
	}

	recoverExpenses();
}

function navigate(tab) {
	let tabs = document.getElementsByClassName("tab");

	for (let i = 0; i < tabs.length; i++) {
		tabs[i].style.display = "none";
	}

	document.getElementById(tab).style.display = "block";
}

function reset(confirmed = false) {
	if (!confirmed) {
		openConfirm("show", reset);
		return;
	}

	localStorage.clear();
	init();
}

function predictCategory() {
	if (_x && _x.length > 0) {
		let textInput = document.getElementById("value");
		let currentHour = new Date().getHours();

		setTimeout(function() {
			document.getElementById("location").selectedIndex = prediction([
				dayOfWeek,
				currentHour,
				textInput.value
			]);
		}, 500);
	}
}

function prediction(_p, k = 3) {
	let distance = [];
	let answer;
	let compare;
	let result;
	let frequency = {};

	for (let i = 0; i < _x.length; i++) {
		let d = 0;

		for (let j = 0; j < _x[i].length; j++) {
			d += Math.abs(parseFloat(_p[j]) - parseFloat(_x[i][j]));
		}

		distance.push(d);
	}

	result = [];

	if (distance.length >= k * k) {
		for (let i = 0; i < k; i++) {
			let distanceIndex = distance.indexOf(Math.min.apply(null, distance));
			result.push(_y[distanceIndex]);
			distance.splice(distanceIndex, 1);
		}

		compare = -1;

		for (let i = 0; i < k; i++) {
			if (!frequency[result[i]]) {
				frequency[result[i]] = 1;
			} else {
				frequency[result[i]] += 1;
			}

			if (frequency[result[i]] > compare) {
				compare = frequency[result[i]];
				answer = result[i];
			}
		}
	} else {
		answer = _y[distance.indexOf(Math.min.apply(null, distance))];
	}

	return answer;
}

window.onload = () => {
	fetch(langSetting)
		.then(response => response.json())
		.then(result => {
			lang = result;
			init();
		})
		.catch(error => {
			console.error(error);
			alert("Could not load en.json. Use Live Server instead of opening index.html directly.");
		});
};