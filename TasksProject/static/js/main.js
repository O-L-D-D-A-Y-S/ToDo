var totalTaskComplete = 0
var totalTask = 0


var newDate = new Date()
var more = true

document.addEventListener("DOMContentLoaded", () => {
    totalTaskComplete = Number(document.querySelector("[data-total-task-completed]").innerHTML)
    totalTask = Number(document.querySelector("[data-total-task]").innerHTML)
    changeProgressBar()
    let btns = document.querySelectorAll(".tickCircle")
    btns.forEach((btn) => {
        if (btn.dataset.state == "False") {
            let status = false
            changeStateButton(status, btn)
        }
        else {
            let status = true
            changeStateButton(status, btn)
        }

    })

})




function stateManager(event) {
    let btn = event.target

    if (!btn.classList.contains("tickCircle")) {
        btn = btn.parentNode
    }


    if (btn.dataset.state == "False") {
        let status = true
        ChangeState(Number(btn.dataset.id), status, btn)
    }
    else {
        let status = false
        ChangeState(Number(btn.dataset.id), status, btn)
    }

}



function ChangeState(id, status, btn) {
    const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
    if (typeof (id) == "number" && id != NaN) {
        fetch(`/completeState/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                is_complete: status
            })
        }).then(response => {
            // Step 1: Handle network-level success but check if server says "error"
            if (!response.ok) {
                // This is a server-side error (like 400, 500)
                throw new Error("Server responded with " + response.status);
            }
            return response.json();
        })
            .then(data => {
                // Step 2: Handle application/business logic errors
                if (data.error) {
                    // Example: server returned { error: "Invalid input" }
                    throw new Error(data.error);
                }

                if (status) {
                    totalTaskComplete = totalTaskComplete + 1
                }
                else {
                    totalTaskComplete = totalTaskComplete - 1
                }
                // ✅ Success path: update UI here
                changeStateButton(status, btn)
                changeProgressBar()
            })
            .catch(err => {
                // Step 3: Handle both fetch errors and thrown errors
                console.error("Error occurred:", err.message);
            });

    }

}





function changeStateButton(status, btn) {
    if (status) {
        btn.style.backgroundColor = "#41a145"
        btn.setAttribute('data-state', 'True');
        btn.querySelector(".greentick").style.display = "block"
    }
    else {
        btn.style.backgroundColor = "white"
        btn.setAttribute('data-state', 'False');
        btn.querySelector(".greentick").style.display = "none"
    }
}



function changeProgressBar() {
    let progressBar = document.querySelector(".taskBar")
    let percent = Math.round((totalTaskComplete / totalTask) * 100)
    progressBar.style.background = `linear-gradient(0.25turn,lime ${percent}%,white ${percent}%)`
    document.querySelector("[data-total-task-completed]").innerText = totalTaskComplete
}


function showdescription(event) {
    let titletext = event.target
    if (!titletext.classList.contains("taskanchor")) {
        titletext = titletext.parentNode
    }


    let desCont = titletext.parentNode.nextElementSibling
    if (desCont.dataset.height != "0") {
        desCont.classList.add("height-0")
        desCont.dataset.height = 0
    }
    else {
        desCont.classList.remove("height-0")
        desCont.dataset.height = "fit-content"
    }
}


function showContext(event) {
    let arrowbtn = event.target
    let parent = arrowbtn.parentNode.nextElementSibling
    if (parent != null) {
        if (parent.classList.contains('none')) {
            parent.classList.remove('none')
            arrowbtn.classList.remove('rotate')
        }
        else {
            parent.classList.add('none')
            arrowbtn.classList.add('rotate')
        }
    }
}


function changeIndexPageContent(index, historyS) {
    let main = document.querySelector(".main")
    main.style.display = index
    let historySection = document.querySelector(".viewHistory")
    historySection.style.display = historyS
    if (historyS == "block") {
        window.onscroll = scrollHistory
        historyManager(true)
    }
    else {
        window.onscroll = ""
    }
}


function historyManager(first = false, normalRequest = true) {
    if (more) {
        if (first) {
            newDate = new Date()
        }
        let previous = calculatePreviousDate(newDate)
        fectchDates(newDate, previous, normalRequest)
        newDate = new Date(previous)
        newDate.setDate(previous.getDate() - 1)
    }


}



function calculatePreviousDate(current) {
    let previous = new Date(current)
    previous.setMonth(current.getMonth() - 1)
    return previous
}


function fectchDates(today, previous, normalRequest) {
    today = today.toISOString();
    previous = previous.toISOString();
    const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
    fetch(`/history/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
            currentDate: today,
            previousDate: previous
        })
    }).then(response => {
        // Step 1: Handle network-level success but check if server says "error"
        if (!response.ok) {
            // This is a server-side error (like 400, 500)
            throw new Error("Server responded with " + response.status);
        }
        return response.json();
    })
        .then(data => {
            // Step 2: Handle application/business logic errors
            if (data.error) {
                // Example: server returned { error: "Invalid input" }
                throw new Error(data.error);
            }
            more = data["ismore"]
            createHistoryUi(data, normalRequest)
        })
        .catch(err => {
            // Step 3: Handle both fetch errors and thrown errors
            console.error("Error occurred:", err);
        });
}


function createHistoryUi(data, normalRequest) {
    let i = 0
    let datesUl = document.querySelector(".datesUl")
    datesUl.classList.remove("none")
    delete data["ismore"]
    for (const date in data) {
        let dateli = datesUl.querySelector(".datesli")
        if (i != 0 || !normalRequest) {
            dateli = dateli.cloneNode(true)
            datesUl.append(dateli)
        }
        else {
            i++
        }
        dateli.querySelector(".Bold").innerHTML = date
        let tasksUl = dateli.querySelector(".taskUl")

        for (let j = 0; j < data[date].length; j++) {
            let taskli = tasksUl.querySelector("li")
            let obj = data[date][j]
            if (j != 0) {
                taskli = taskli.cloneNode(true)
                tasksUl.append(taskli)
            }
            taskli.querySelector(".taskanchor").innerHTML = obj.title
            if (obj.description == "") {
                taskli.querySelector(".task-description").innerHTML = "No Description Provided"
            }
            else {
                taskli.querySelector(".task-description").innerHTML = obj.description
            }

        }
    }
}

function scrollHistory() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        historyManager(false, false)
    }
}