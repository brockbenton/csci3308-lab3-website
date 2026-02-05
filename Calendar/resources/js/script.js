var events = [];
var editingIndex = -1;

function updateLocationOptions() {
    var modality = document.getElementById('event_modality').value;
    var locationGroup = document.getElementById('location_group');
    var remoteGroup = document.getElementById('remote_url_group');

    if (modality == 'in-person') {
        locationGroup.classList.remove('d-none');
        remoteGroup.classList.add('d-none');
    } else {
        locationGroup.classList.add('d-none');
        remoteGroup.classList.remove('d-none');
    }
}

function openEditModal(index) {
    editingIndex = index;
    var event = events[index];

    document.getElementById('event_name').value = event.name;
    document.getElementById('event_weekday').value = event.weekday;
    document.getElementById('event_time').value = event.time;
    document.getElementById('event_modality').value = event.modality;
    document.getElementById('event_category').value = event.category;
    document.getElementById('event_attendees').value = event.attendees;

    if (event.modality == 'in-person') {
        document.getElementById('event_location').value = event.location;
        document.getElementById('event_remote_url').value = '';
    } else {
        document.getElementById('event_remote_url').value = event.remote_url;
        document.getElementById('event_location').value = '';
    }

    updateLocationOptions();

    var modal = new bootstrap.Modal(document.getElementById('event_modal'));
    modal.show();
}

function saveEvent() {
    var name = document.getElementById('event_name').value;
    var weekday = document.getElementById('event_weekday').value;
    var time = document.getElementById('event_time').value;
    var modality = document.getElementById('event_modality').value;
    var location = document.getElementById('event_location').value;
    var remote_url = document.getElementById('event_remote_url').value;
    var category = document.getElementById('event_category').value;
    var attendees = document.getElementById('event_attendees').value;

    if (name == '' || time == '') {
        alert('Please fill in the event name and time.');
        return;
    }

    if (modality == 'in-person' && location == '') {
        alert('Please enter a location for in-person events.');
        return;
    }

    if (modality == 'remote') {
        var urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,6}\b([-a-zA-Z0-9@:%_+.~#()?&//=]*)$/;
        if (remote_url == '' || !urlPattern.test(remote_url)) {
            alert('Please enter a valid URL for remote events.');
            return;
        }
    }

    var eventDetails = {
        name: name,
        weekday: weekday,
        time: time,
        modality: modality,
        location: modality == 'in-person' ? location : null,
        remote_url: modality == 'remote' ? remote_url : null,
        category: category,
        attendees: attendees
    };

    if (editingIndex >= 0) {
        var oldWeekday = events[editingIndex].weekday;
        events[editingIndex] = eventDetails;

        var oldDayColumn = document.getElementById(oldWeekday);
        var oldCard = oldDayColumn.querySelectorAll('.event')[getCardIndexInDay(editingIndex, oldWeekday)];
        if (oldCard) {
            oldCard.remove();
        }

        addEventToCalendarUI(eventDetails, editingIndex);
        editingIndex = -1;
    } else {
        events.push(eventDetails);
        addEventToCalendarUI(eventDetails, events.length - 1);
    }

    console.log(events);

    document.getElementById('event_form').reset();

    var modal = bootstrap.Modal.getInstance(document.getElementById('event_modal'));
    modal.hide();
}

function getCardIndexInDay(eventIndex, weekday) {
    var count = 0;
    for (var i = 0; i < eventIndex; i++) {
        if (events[i].weekday == weekday) {
            count++;
        }
    }
    return count;
}

function createEventCard(eventDetails, index) {
    var event_element = document.createElement('div');
    event_element.classList = 'event row border rounded m-1 py-1';
    event_element.style.cursor = 'pointer';

    if (eventDetails.category == 'work') {
        event_element.style.backgroundColor = '#cfe2ff';
    } else if (eventDetails.category == 'personal') {
        event_element.style.backgroundColor = '#d1e7dd';
    } else if (eventDetails.category == 'school') {
        event_element.style.backgroundColor = '#fff3cd';
    } else {
        event_element.style.backgroundColor = '#e2e3e5';
    }

    var info = document.createElement('div');
    info.innerHTML = `<strong>${eventDetails.name}</strong><br>
        Time: ${eventDetails.time}<br>
        ${eventDetails.modality == 'in-person' ? 'Location: ' + eventDetails.location : 'URL: ' + eventDetails.remote_url}<br>
        Category: ${eventDetails.category}<br>
        Attendees: ${eventDetails.attendees}`;

    event_element.appendChild(info);

    event_element.addEventListener('click', function() {
        openEditModal(index);
    });

    return event_element;
}

function addEventToCalendarUI(eventInfo, index) {
    var event_card = createEventCard(eventInfo, index);
    var dayColumn = document.getElementById(eventInfo.weekday);
    dayColumn.appendChild(event_card);
}

document.getElementById('event_modal').addEventListener('hidden.bs.modal', function() {
    editingIndex = -1;
    document.getElementById('event_form').reset();
    updateLocationOptions();
});
