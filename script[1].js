const daysContainer = document.getElementById('daysContainer');
const monthYear = document.getElementById('monthYear');
const notesList = document.getElementById('notesList');
const myElement = document.getElementById('note');

let currentDate = new Date();
let notesData = {};

function renderCalendar() {
  daysContainer.innerHTML = '';

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  const monthName = getMonthName(currentDate.getMonth());
  const year = currentDate.getFullYear();
  monthYear.textContent = `${monthName} ${year}`;

  for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
    const emptyDay = document.createElement('div');
    emptyDay.classList.add('empty');
    daysContainer.appendChild(emptyDay);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement('div');
    day.textContent = i;
    day.classList.add('button');
    day.dataset.day = i;
    day.addEventListener('click', () => toggleDaySelection(day));
    daysContainer.appendChild(day);
  }
}

function getMonthName(monthIndex) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[monthIndex];
}

function toggleDaySelection(day) {
  const selectedDay = day.dataset.day;
  Swal.fire({
    title: `Enter topic and note for day ${selectedDay}`,
    html: `<input id="topic" class="swal2-input" placeholder="Topic">
           <input id="note" class="swal2-input" placeholder="Note">
           <input id="time" type="time" class="swal2-input" placeholder="Time">`,
    focusConfirm: false,
    preConfirm: () => {
      const topic = document.getElementById('topic').value;
      const note = document.getElementById('note').value;
      const time = document.getElementById('time').value;
      return { selectedDay, topic, note, time };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const { selectedDay, topic, note, time } = result.value;
      if (topic && note && time) {
        const monthName = getMonthName(currentDate.getMonth());
        const year = currentDate.getFullYear();
        if (!notesData[selectedDay]) {
          notesData[selectedDay] = [];
        }
        notesData[selectedDay].push({ month: monthName, year, topic, note, time });
        displayNotes();
        const customAlert = document.getElementById('customAlert');
        const alertDay = document.getElementById('alertDay');
        alertDay.textContent = selectedDay;
        customAlert.classList.add('show');
        setTimeout(function(){ customAlert.classList.remove('show'); }, 3000);

        // Schedule notification
        scheduleNotification(selectedDay, topic, note, time);
      }
    }
  });
}

function displayNotes() {
  const notesBody = document.getElementById('notesBody');
  notesBody.innerHTML = '';
  Object.keys(notesData).forEach(day => {
    notesData[day].forEach(noteObj => {
      const { month, year, topic, note, time } = noteObj;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${day}</td>
        <td>${month}</td>
        <td>${year}</td>
        <td>${topic}</td>
        <td>${note}</td>
        <td>${time}</td>
      `;
      notesBody.appendChild(row);
    });
  });
}

function scheduleNotification(selectedDay, topic, note, time) {
  const [hours, minutes] = time.split(':');
  const targetDateTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay, hours, minutes);

  const currentTime = new Date();
  const timeUntilNotification = targetDateTime - currentTime;

  if (timeUntilNotification <= 0) {
    console.log('Selected time is in the past.');
    return;
  }

  setTimeout(() => {
    showNotification(topic, note);
  }, timeUntilNotification);
}

function showNotification(title, message) {
  // Play notification sound
  const notificationSound = document.getElementById('notificationSound');
  notificationSound.play();

  // Display notification
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: 'https://cdn-icons-png.flaticon.com/512/565/565422.png' // Optional icon for the notification
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showNotification(title, message);
      }
    });
  }
}


renderCalendar();
