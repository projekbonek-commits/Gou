// LKMS Daily Tracker JS (Interactive Photo Slot Compare & Cyber Finance)

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initDailyChecklist();
  initHistoryModal();
  initLightbox();
  initCompareModal();
});

function initClock() {
  const timeElem = document.getElementById('wib-time');
  const dateElem = document.getElementById('wib-date');

  function updateClock() {
    const now = new Date();
    const timeOptions = { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const timeString = new Intl.DateTimeFormat('id-ID', timeOptions).format(now) + ' WIB';

    const dateOptions = { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dateString = new Intl.DateTimeFormat('id-ID', dateOptions).format(now);

    timeElem.textContent = timeString;
    dateElem.textContent = dateString;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

function getWIBDateKey(dateObj = new Date()) {
  const options = { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' };
  const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(dateObj);
  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  return `${year}-${month}-${day}`;
}

function initLightbox() {
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('close-lightbox-btn');

  window.openLightbox = function(src) {
    if (!src) return;
    lightboxImg.src = src;
    lightbox.classList.remove('hidden');
  };

  closeBtn.addEventListener('click', () => lightbox.classList.add('hidden'));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.classList.add('hidden');
  });
}

function initDailyChecklist() {
  const todayStr = getWIBDateKey();
  const todayKey = `lkms_daily_${todayStr}`;
  let dailyData = JSON.parse(localStorage.getItem(todayKey)) || {};

  const checkboxes = document.querySelectorAll('.custom-checkbox');
  const photoInput = document.getElementById('photo-input');
  const photoPreview = document.getElementById('photo-preview');
  const photoPreviewContainer = document.getElementById('photo-preview-container');
  const uploadBtn = document.querySelector('.upload-btn');

  const moneyIn = document.getElementById('money-in');
  const moneyOut = document.getElementById('money-out');
  const dailyNotes = document.getElementById('daily-notes');

  const waterAddBtn = document.getElementById('water-add-btn');
  const waterAmountTxt = document.getElementById('water-amount-txt');
  const waterSubTxt = document.getElementById('water-sub-txt');
  const waterCheck = document.getElementById('check-water');

  const sendHistoryBtn = document.getElementById('send-history-btn');
  const notifModal = document.getElementById('notif-modal');
  const notifTitle = document.getElementById('notif-title');
  const notifMsg = document.getElementById('notif-msg');
  const notifIcon = document.getElementById('notif-icon');
  const closeNotifBtn = document.getElementById('close-notif-btn');

  let currentWaterMl = dailyData['water_ml'] || 0;

  if (dailyData['money_in']) moneyIn.value = dailyData['money_in'];
  if (dailyData['money_out']) moneyOut.value = dailyData['money_out'];
  if (dailyData['notes']) dailyNotes.value = dailyData['notes'];

  moneyIn.addEventListener('input', (e) => {
    dailyData['money_in'] = parseFloat(e.target.value) || 0;
    localStorage.setItem(todayKey, JSON.stringify(dailyData));
  });

  moneyOut.addEventListener('input', (e) => {
    dailyData['money_out'] = parseFloat(e.target.value) || 0;
    localStorage.setItem(todayKey, JSON.stringify(dailyData));
  });

  dailyNotes.addEventListener('input', (e) => {
    dailyData['notes'] = e.target.value;
    localStorage.setItem(todayKey, JSON.stringify(dailyData));
  });

  function updateWaterUI() {
    const liters = (currentWaterMl / 1000).toFixed(2);
    waterAmountTxt.textContent = liters.endsWith('.00') ? parseInt(liters) : liters;

    if (currentWaterMl >= 1500) {
      waterCheck.checked = true;
      document.querySelector('[data-id="water"]').classList.add('completed');
      waterSubTxt.textContent = "Target 1.5L Terpenuhi! ✓";
    } else {
      waterCheck.checked = false;
      document.querySelector('[data-id="water"]').classList.remove('completed');
      waterSubTxt.textContent = `Sisa ${1500 - currentWaterMl} ml lagi`;
    }
  }

  waterAddBtn.addEventListener('click', () => {
    if (dailyData['sent_to_history']) return;

    currentWaterMl += 250;
    dailyData['water_ml'] = currentWaterMl;
    dailyData['water'] = currentWaterMl >= 1500;
    localStorage.setItem(todayKey, JSON.stringify(dailyData));
    updateWaterUI();
    updateProgressAndStreak();
  });

  updateWaterUI();

  if (photoPreviewContainer) {
    photoPreviewContainer.addEventListener('click', () => {
      if (photoPreview.src) window.openLightbox(photoPreview.src);
    });
  }

  const sleepCheck = document.getElementById('check-sleep');
  if (sleepCheck) {
    sleepCheck.addEventListener('change', (e) => {
      if (dailyData['sent_to_history']) {
        e.target.checked = !e.target.checked;
        return;
      }

      if (e.target.checked) {
        const now = new Date();
        const options = { timeZone: 'Asia/Jakarta', hour: '2-digit', hour12: false };
        const currentHour = parseInt(new Intl.DateTimeFormat('en-US', options).format(now), 10);

        if (currentHour >= 23 || currentHour < 5) {
          notifIcon.textContent = "🌙";
          notifTitle.textContent = "Peringatan Tidur!";
          notifMsg.textContent = "Tidur lah lebih awal demi kesehatanmu Dan bloatedmu";
          notifModal.classList.remove('hidden');
        }
      }
    });
  }

  checkboxes.forEach(cb => {
    const cardId = cb.closest('.card-item').dataset.id;
    if (cardId === 'water') return;

    if (dailyData[cardId]) {
      cb.checked = true;
      cb.closest('.card-item').classList.add('completed');
    }

    cb.addEventListener('change', (e) => {
      if (dailyData['sent_to_history']) {
        e.target.checked = !e.target.checked;
        return;
      }

      const isChecked = e.target.checked;
      dailyData[cardId] = isChecked;
      localStorage.setItem(todayKey, JSON.stringify(dailyData));

      if (isChecked) {
        cb.closest('.card-item').classList.add('completed');
      } else {
        cb.closest('.card-item').classList.remove('completed');
      }
      updateProgressAndStreak();
    });
  });

  if (photoInput) {
    if (dailyData['photo_base64']) {
      photoPreview.src = dailyData['photo_base64'];
      photoPreviewContainer.classList.remove('hidden');
      document.getElementById('check-photo').checked = true;
      document.querySelector('[data-id="photo"]').classList.add('completed');
    }

    photoInput.addEventListener('change', (e) => {
      if (dailyData['sent_to_history']) return;

      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (evt) {
          const base64Image = evt.target.result;
          photoPreview.src = base64Image;
          photoPreviewContainer.classList.remove('hidden');

          dailyData['photo'] = true;
          dailyData['photo_base64'] = base64Image;
          localStorage.setItem(todayKey, JSON.stringify(dailyData));

          document.getElementById('check-photo').checked = true;
          document.querySelector('[data-id="photo"]').classList.add('completed');
          updateProgressAndStreak();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  function lockUIIfSent() {
    if (dailyData['sent_to_history']) {
      sendHistoryBtn.disabled = true;
      sendHistoryBtn.textContent = "Tugas Hari Ini Sudah Dikirim ✓";
      sendHistoryBtn.style.opacity = "0.6";
      sendHistoryBtn.style.cursor = "not-allowed";

      waterAddBtn.disabled = true;
      waterAddBtn.style.opacity = "0.5";
      waterAddBtn.style.cursor = "not-allowed";

      moneyIn.disabled = true;
      moneyOut.disabled = true;
      dailyNotes.disabled = true;

      checkboxes.forEach(cb => cb.disabled = true);
      if (uploadBtn) {
        uploadBtn.style.opacity = "0.5";
        uploadBtn.style.cursor = "not-allowed";
      }
    }
  }

  sendHistoryBtn.addEventListener('click', () => {
    dailyData['sent_to_history'] = true;
    dailyData['saved_at'] = new Date().toISOString();
    localStorage.setItem(todayKey, JSON.stringify(dailyData));

    const items = document.querySelectorAll('.card-item');
    let completedCount = 0;
    const totalCount = items.length;

    items.forEach(item => {
      const cb = item.querySelector('.custom-checkbox');
      if (cb && cb.checked) {
        completedCount++;
      }
    });

    if (completedCount < totalCount) {
      notifIcon.textContent = "⚠️";
      notifTitle.textContent = "Tugas belum selesai sepenuhnya";
      notifMsg.textContent = "Data hari ini telah tersimpan ke history. Tingkatkan konsistensi besok!";
    } else {
      notifIcon.textContent = "🔥";
      notifTitle.textContent = "Tugas Harian Selesai!";
      notifMsg.textContent = "Selamat menikmati hari mu!";
    }

    lockUIIfSent();
    updateProgressAndStreak();
    notifModal.classList.remove('hidden');
  });

  closeNotifBtn.addEventListener('click', () => notifModal.classList.add('hidden'));
  notifModal.addEventListener('click', (e) => {
    if (e.target === notifModal) notifModal.classList.add('hidden');
  });

  lockUIIfSent();
  updateProgressAndStreak();
}

function updateProgressAndStreak() {
  const items = document.querySelectorAll('.card-item');
  let completedCount = 0;
  const totalCount = items.length;

  items.forEach(item => {
    const cb = item.querySelector('.custom-checkbox');
    if (cb && cb.checked) {
      completedCount++;
    }
  });

  const progressText = document.getElementById('progress-text');
  const progressFill = document.getElementById('progress-fill');

  progressText.textContent = `${completedCount} / ${totalCount} Selesai`;
  const percentage = (completedCount / totalCount) * 100;
  progressFill.style.width = `${percentage}%`;

  calculateStreak();
}

function calculateStreak() {
  let currentStreak = 0;
  let bestStreak = parseInt(localStorage.getItem('lkms_best_streak') || '0', 10);

  let dateCheck = new Date();

  while (true) {
    const dateStr = getWIBDateKey(dateCheck);
    const key = `lkms_daily_${dateStr}`;
    const data = JSON.parse(localStorage.getItem(key));

    if (data) {
      let count = 0;
      Object.keys(data).forEach(k => {
        if (data[k] === true && k !== 'photo_base64' && k !== 'sent_to_history') count++;
      });

      if (count >= 5) {
        currentStreak++;
      } else {
        if (dateStr !== getWIBDateKey(new Date())) break;
      }
    } else {
      if (dateStr !== getWIBDateKey(new Date())) break;
    }

    dateCheck.setDate(dateCheck.getDate() - 1);
  }

  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
    localStorage.setItem('lkms_best_streak', bestStreak.toString());
  }

  document.getElementById('current-streak').textContent = `${currentStreak} Hari`;
  document.getElementById('best-streak').textContent = `${bestStreak} Hari`;
}

function initHistoryModal() {
  const historyBtn = document.getElementById('history-btn');
  const modal = document.getElementById('history-modal');
  const closeBtn = document.getElementById('close-modal');
  const historyList = document.getElementById('history-list');
  const dayDetailContainer = document.getElementById('day-detail-container');
  const modalTitle = document.getElementById('modal-title');
  const totalSavingsElem = document.getElementById('total-savings');

  historyBtn.addEventListener('click', () => {
    calculateTotalSavings();
    showCalendarView();
    modal.classList.remove('hidden');
  });

  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  function calculateTotalSavings() {
    let totalIn = 0;
    let totalOut = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('lkms_daily_')) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data) {
          totalIn += (parseFloat(data['money_in']) || 0);
          totalOut += (parseFloat(data['money_out']) || 0);
        }
      }
    }

    const netSavings = totalIn - totalOut;
    totalSavingsElem.textContent = `Rp ${netSavings.toLocaleString('id-ID')}`;
  }

  function showCalendarView() {
    modalTitle.textContent = "Riwayat Absen Kalender";
    historyList.classList.remove('hidden');
    dayDetailContainer.classList.add('hidden');
    renderCalendarHistory();
  }

  function renderCalendarHistory() {
    historyList.innerHTML = '';
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const dayNames = ["Mi", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    const calContainer = document.createElement('div');
    calContainer.className = 'calendar-container';

    const title = document.createElement('div');
    title.className = 'calendar-month-title';
    title.textContent = `${monthNames[month]} ${year}`;
    calContainer.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'calendar-grid';

    dayNames.forEach(d => {
      const head = document.createElement('div');
      head.className = 'calendar-day-head';
      head.textContent = d;
      grid.appendChild(head);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      grid.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell';
      cell.textContent = day;

      const formattedMonth = String(month + 1).padStart(2, '0');
      const formattedDay = String(day).padStart(2, '0');
      const dateKeyStr = `${year}-${formattedMonth}-${formattedDay}`;
      const dateKey = `lkms_daily_${dateKeyStr}`;

      const data = JSON.parse(localStorage.getItem(dateKey));

      if (day === now.getDate()) cell.classList.add('today');

      if (data) {
        let count = 0;
        Object.keys(data).forEach(k => {
          if (data[k] === true && k !== 'photo_base64' && k !== 'sent_to_history') count++;
        });

        if (count >= 9) {
          cell.classList.add('completed');
        } else if (count > 0) {
          cell.classList.add('partial');
        }
      }

      cell.addEventListener('click', () => {
        showDayDetails(day, monthNames[month], year, dateKeyStr, data);
      });

      grid.appendChild(cell);
    }

    calContainer.appendChild(grid);

    const legend = document.createElement('div');
    legend.className = 'calendar-legend';
    legend.innerHTML = `
      <div class="legend-item"><div class="legend-box full"></div> Target Tuntas</div>
      <div class="legend-item"><div class="legend-box part"></div> Sebagian</div>
      <div class="legend-item"><div class="legend-box none"></div> Kosong</div>
    `;
    calContainer.appendChild(legend);

    historyList.appendChild(calContainer);
  }

  function showDayDetails(day, monthName, year, dateKeyStr, data) {
    historyList.classList.add('hidden');
    dayDetailContainer.classList.remove('hidden');
    modalTitle.textContent = `Tanggal ${day} ${monthName} ${year}`;

    dayDetailContainer.innerHTML = '';

    const backBtn = document.createElement('button');
    backBtn.className = 'back-to-cal-btn';
    backBtn.textContent = '← Kembali ke Kalender';
    backBtn.addEventListener('click', showCalendarView);
    dayDetailContainer.appendChild(backBtn);

    if (!data) {
      const emptyMsg = document.createElement('p');
      emptyMsg.style.color = '#888888';
      emptyMsg.style.fontSize = '13px';
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.padding = '20px 0';
      emptyMsg.textContent = 'Tidak ada catatan absen di tanggal ini.';
      dayDetailContainer.appendChild(emptyMsg);
      return;
    }

    if (data['photo_base64']) {
      const photoWrapper = document.createElement('div');
      photoWrapper.className = 'detail-photo-wrapper';
      const img = document.createElement('img');
      img.src = data['photo_base64'];
      img.alt = 'Foto Progress';
      photoWrapper.appendChild(img);

      photoWrapper.addEventListener('click', () => {
        window.openLightbox(data['photo_base64']);
      });
      dayDetailContainer.appendChild(photoWrapper);
    }

    if (data['notes']) {
      const noteBox = document.createElement('div');
      noteBox.className = 'detail-note-box';
      noteBox.innerHTML = `<strong>📝 Catatan:</strong> ${data['notes']}`;
      dayDetailContainer.appendChild(noteBox);
    }

    const tasks = [
      { name: `Air Putih ${((data['water_ml'] || 0) / 1000).toFixed(2)} L`, isDone: (data['water_ml'] || 0) >= 1500 },
      { name: 'Chin Tuck', isDone: !!data['chintuck'] },
      { name: 'Neck Curls', isDone: !!data['neckcurls'] },
      { name: 'Workout Ringan', isDone: !!data['workout'] },
      { name: 'Potassium 1x Sehari', isDone: !!data['potassium'] },
      { name: 'Masseter Workout', isDone: !!data['masseter'] },
      { name: 'Sodium & Sugar Limit', isDone: !!data['diet'] },
      { name: 'Tidur Tepat Waktu (21:00-22:00)', isDone: !!data['sleep'] },
      { name: 'Foto Harian Progress', isDone: !!data['photo'] }
    ];

    tasks.forEach(t => {
      const taskCard = document.createElement('div');
      taskCard.className = `detail-task-item ${t.isDone ? 'done' : ''}`;

      const taskName = document.createElement('span');
      taskName.className = 'detail-task-name';
      taskName.textContent = t.name;

      const taskStatus = document.createElement('span');
      taskStatus.className = `detail-task-status ${t.isDone ? 'done-mark' : 'fail-mark'}`;
      taskStatus.textContent = t.isDone ? '✓' : '✗';

      taskCard.appendChild(taskName);
      taskCard.appendChild(taskStatus);
      dayDetailContainer.appendChild(taskCard);
    });
  }
}

// Compare Photos Modal with Interactive 3 Slots & Photo Picker Submodal
function initCompareModal() {
  const compareBtn = document.getElementById('compare-btn');
  const modal = document.getElementById('compare-modal');
  const closeBtn = document.getElementById('close-compare-btn');

  const pickerModal = document.getElementById('photo-picker-modal');
  const closePickerBtn = document.getElementById('close-picker-btn');
  const pickerGrid = document.getElementById('picker-photo-grid');

  let targetSlotIndex = null;
  const compareSlotsData = [null, null, null];

  compareBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });

  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  closePickerBtn.addEventListener('click', () => pickerModal.classList.add('hidden'));

  window.openPhotoPicker = function(slotIdx) {
    targetSlotIndex = slotIdx;
    renderPhotoPickerGrid();
    pickerModal.classList.remove('hidden');
  };

  function renderPhotoPickerGrid() {
    pickerGrid.innerHTML = '';
    const datesWithPhotos = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('lkms_daily_')) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && data['photo_base64']) {
          const dateStr = key.replace('lkms_daily_', '');
          datesWithPhotos.push({ dateStr, img: data['photo_base64'] });
        }
      }
    }

    datesWithPhotos.sort((a, b) => b.dateStr.localeCompare(a.dateStr));

    if (datesWithPhotos.length === 0) {
      pickerGrid.innerHTML = '<p style="grid-column:span 2; color:#888; font-size:12px; text-align:center; padding:20px;">Belum ada foto tersimpan di history.</p>';
      return;
    }

    datesWithPhotos.forEach(item => {
      const card = document.createElement('div');
      card.className = 'picker-item';
      card.innerHTML = `
        <img src="${item.img}" alt="${item.dateStr}">
        <div class="picker-date-lbl">${item.dateStr}</div>
      `;

      card.addEventListener('click', () => {
        selectPhotoForSlot(targetSlotIndex, item.dateStr, item.img);
        pickerModal.classList.add('hidden');
      });

      pickerGrid.appendChild(card);
    });
  }

  function selectPhotoForSlot(slotIdx, dateStr, imgBase64) {
    compareSlotsData[slotIdx] = { dateStr, img: imgBase64 };
    const box = document.getElementById(`compare-box-${slotIdx}`);

    box.className = 'compare-img-box has-image';
    box.innerHTML = `
      <button class="slot-delete-btn" onclick="clearCompareSlot(${slotIdx})">&times;</button>
      <img src="${imgBase64}" alt="${dateStr}" onclick="window.openLightbox('${imgBase64}')">
      <div class="slot-date-badge">${dateStr}</div>
    `;
  }

  window.clearCompareSlot = function(slotIdx) {
    compareSlotsData[slotIdx] = null;
    const box = document.getElementById(`compare-box-${slotIdx}`);
    box.className = 'compare-img-box empty';
    box.innerHTML = `
      <button class="add-photo-slot-btn" onclick="openPhotoPicker(${slotIdx})">
        <span class="plus-icon">+</span>
        <span class="slot-lbl">Tambah Foto</span>
      </button>
    `;
  };
}

// Register Service Worker for PWA installability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW Registered:', reg))
      .catch(err => console.log('SW Register Error:', err));
  });
}
