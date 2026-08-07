// Ganti URL ini dengan URL Web App Google Apps Script kamu setelah di-deploy
const GAS_URL = "https://script.google.com/macros/s/AKfycbw1jbIXpl5eV0W5gkl1vldMbmkBEoLO8DZYktTmjIi-PjNZMZcGPLcTbpD9oOuHB46g/exec";

// --- UI Utilities ---

function toggleMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

function showLoading() {
    let loader = document.getElementById('loadingOverlay');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loadingOverlay';
        loader.className = 'loading-overlay';
        loader.innerHTML = '<div class="spinner"></div><p style="margin-top:10px; font-weight:600; color:var(--primary-color);">Tunggu sebentar...</p>';
        document.body.appendChild(loader);
    }
    loader.classList.add('active');
}

function hideLoading() {
    const loader = document.getElementById('loadingOverlay');
    if (loader) loader.classList.remove('active');
}

function showModal(type, title, message, callback = null) {
    let overlay = document.getElementById('customModal');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'customModal';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
      <div class="modal-content">
        <div id="modalIcon" class="modal-icon"></div>
        <h2 id="modalTitle" class="modal-title"></h2>
        <p id="modalMessage" class="modal-message"></p>
        <button id="modalBtn" class="btn btn-primary modal-btn">OK</button>
      </div>
    `;
        document.body.appendChild(overlay);
    }

    const icon = document.getElementById('modalIcon');
    const titleEl = document.getElementById('modalTitle');
    const messageEl = document.getElementById('modalMessage');
    const btnEl = document.getElementById('modalBtn');

    // Set Icon
    icon.className = `modal-icon ${type}`;
    if (type === 'success') icon.innerHTML = '✓';
    else if (type === 'error') icon.innerHTML = '✕';
    else icon.innerHTML = 'i';

    titleEl.innerText = title;
    messageEl.innerText = message;

    overlay.classList.add('active');

    btnEl.onclick = () => {
        overlay.classList.remove('active');
        if (callback) callback();
    };
}

function showConfirmModal(title, message, onConfirm) {
    let overlay = document.getElementById('confirmModal');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'confirmModal';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-icon warning">?</div>
        <h2 id="confirmTitle" class="modal-title"></h2>
        <p id="confirmMessage" class="modal-message"></p>
        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
          <button id="confirmBtnYes" class="btn btn-primary modal-btn" style="margin-top: 0; min-width: 100px;">Ya</button>
          <button id="confirmBtnNo" class="btn btn-secondary modal-btn" style="margin-top: 0; min-width: 100px;">Batal</button>
        </div>
      </div>
    `;
        document.body.appendChild(overlay);
    }

    const titleEl = document.getElementById('confirmTitle');
    const messageEl = document.getElementById('confirmMessage');
    const btnYes = document.getElementById('confirmBtnYes');
    const btnNo = document.getElementById('confirmBtnNo');

    titleEl.innerText = title;
    messageEl.innerText = message;

    overlay.classList.add('active');

    btnYes.onclick = () => {
        overlay.classList.remove('active');
        if (onConfirm) onConfirm();
    };
    
    btnNo.onclick = () => {
        overlay.classList.remove('active');
    };
}

// --- API Call Utilities ---

async function fetchGAS(action, data = {}) {
    if (GAS_URL === "URL_WEB_APP_KAMU_DISINI") {
        showModal('error', 'Error!', 'URL GAS belum di-set. Silakan edit file script.js dan masukkan URL Web App kamu.');
        return null;
    }

    showLoading();
    try {
        const formData = new URLSearchParams();
        formData.append('action', action);
        formData.append('data', JSON.stringify(data));

        const response = await fetch(GAS_URL, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const text = await response.text();
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            console.error("Non-JSON Response:", text);
            throw new Error("Respon bukan JSON. Pastikan akses Web App GAS di-set ke 'Anyone' (Siapa saja).");
        }
        
        hideLoading();

        if (result.status === 'success') {
            return result;
        } else {
            showModal('error', 'Gagal', result.message || 'Terjadi kesalahan pada server');
            return null;
        }
    } catch (error) {
        hideLoading();
        showModal('error', 'Koneksi / Server Error', error.message || 'Gagal menghubungi server. Pastikan URL GAS benar.');
        console.error("Fetch GAS Error:", error);
        return null;
    }
}

async function fetchGASGet(action) {
    if (GAS_URL === "URL_WEB_APP_KAMU_DISINI") {
        showModal('error', 'Error!', 'URL GAS belum di-set. Silakan edit file script.js dan masukkan URL Web App kamu.');
        return null;
    }

    showLoading();
    try {
        const response = await fetch(`${GAS_URL}?action=${action}`);
        const text = await response.text();
        
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            console.error("Non-JSON Response:", text);
            throw new Error("Respon bukan JSON. Pastikan akses Web App GAS di-set ke 'Anyone' (Siapa saja).");
        }
        
        hideLoading();

        if (result.status === 'success') {
            return result;
        } else {
            showModal('error', 'Gagal', result.message || 'Terjadi kesalahan pada server');
            return null;
        }
    } catch (error) {
        hideLoading();
        showModal('error', 'Koneksi / Server Error', error.message || 'Gagal menghubungi server. Pastikan URL GAS benar.');
        console.error("Fetch GAS Get Error:", error);
        return null;
    }
}

// --- General Utils ---

function getAge(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
        years--;
        months += 12;
    }
    
    if (today.getDate() < birthDate.getDate()) {
        months--;
        if (months < 0) {
            months += 12;
        }
    }
    
    return `${years} Tahun ${months} Bulan`;
}

function formatDateToWIB(dateObj) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = days[dateObj.getDay()];

    let dd = String(dateObj.getDate()).padStart(2, '0');
    let mm = String(dateObj.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = dateObj.getFullYear();

    let hours = String(dateObj.getHours()).padStart(2, '0');
    let minutes = String(dateObj.getMinutes()).padStart(2, '0');

    return `${dayName}, ${dd}/${mm}/${yyyy} - ${hours}:${minutes} WIB`;
}

function formatRupiah(angka) {
    if (!angka) return "Rp0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(angka);
}

// Listen to common filter/search logic if exist on page
document.addEventListener('DOMContentLoaded', () => {
    // Navigation active state based on URL
    const path = window.location.pathname;
    document.querySelectorAll('.nav-item').forEach(el => {
        const href = el.getAttribute('href');
        if (path.includes(href) && href !== "/") {
            el.classList.add('active');
        } else if (path === "/" || path.endsWith("index.html") && !path.includes("menu")) {
            if (href === "/") el.classList.add('active');
        }
    });
});