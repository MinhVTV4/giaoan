// app.js

// --- CẤU HÌNH FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyA2818INoMI_LNIi3kTilRMUQXZ9S6yJjE",
  authDomain: "giaoandientu-7782.firebaseapp.com",
  projectId: "giaoandientu-7782",
  storageBucket: "giaoandientu-7782.firebasestorage.app",
  messagingSenderId: "585204135383",
  appId: "1:585204135383:web:78c7566be2083638290792",
  measurementId: "G-4F3MHQT43X"
};

// --- KHỞI TẠO FIREBASE ---
try {
    firebase.initializeApp(firebaseConfig);
} catch (e) {
    console.error("Lỗi khởi tạo Firebase:", e);
    alert("Không thể khởi tạo ứng dụng. Vui lòng kiểm tra cấu hình Firebase trong app.js và kết nối mạng.");
}
const auth = firebase.auth();
const db = firebase.firestore();

// --- LẤY THAM CHIẾU ĐẾN CÁC PHẦN TỬ HTML ---
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const classDetailView = document.getElementById('class-detail-view');
const allViews = document.querySelectorAll('.view');

// Auth Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const showRegisterButton = document.getElementById('show-register-button');
const showLoginButton = document.getElementById('show-login-button');
const authError = document.getElementById('auth-error');
const registerError = document.getElementById('register-error');
const logoutButton = document.getElementById('logout-button');
const userEmailSpan = document.getElementById('user-email');

// Dashboard Elements
const addClassForm = document.getElementById('add-class-form');
const classNameInput = document.getElementById('class-name');
const classListUl = document.getElementById('class-list');
const classError = document.getElementById('class-error');

// Class Detail Elements
const addStudentForm = document.getElementById('add-student-form');
const studentNameInput = document.getElementById('student-name');
const studentListUl = document.getElementById('student-list');
const detailClassNameH1 = document.getElementById('detail-class-name');
const backToDashboardButton = document.getElementById('back-to-dashboard-button');
const studentError = document.getElementById('student-error');

// Attendance Elements
const attendanceSection = document.getElementById('attendance-section');
const attendanceDateInput = document.getElementById('attendance-date');
const attendanceListUl = document.getElementById('attendance-list');
const attendanceError = document.getElementById('attendance-error');
const filterAbsentButton = document.getElementById('filter-absent-button');
const attendanceInfo = document.getElementById('attendance-info');

// Gradebook Elements (MỚI)
const gradebookSection = document.getElementById('gradebook-section');
const addGradeColumnButton = document.getElementById('add-grade-column-button');
const gradebookTableContainer = document.getElementById('gradebook-table-container');
const gradebookError = document.getElementById('gradebook-error');


// --- BIẾN TRẠNG THÁI ---
let currentUser = null;
let currentClassId = null;
let unsubscribeClasses = null;
let unsubscribeStudents = null; // Listener cho cả quản lý HS và điểm danh
let unsubscribeGradeColumns = null; // Listener cho cột điểm (MỚI)
let isFilteringAbsent = false;
let currentStudentsData = []; // Lưu trữ danh sách học sinh hiện tại (MỚI)
let currentGradeColumns = []; // Lưu trữ danh sách cột điểm hiện tại (MỚI)


// --- HÀM TIỆN ÍCH ---
function showView(viewId) {
    allViews.forEach(view => view.style.display = 'none');
    const activeView = document.getElementById(viewId);
    if (activeView) {
        activeView.style.display = 'block';
        activeView.classList.add('active-view');
    } else {
        console.error("Không tìm thấy view với ID:", viewId);
    }
}

function clearErrors() {
    authError.textContent = '';
    registerError.textContent = '';
    classError.textContent = '';
    studentError.textContent = '';
    attendanceError.textContent = '';
    attendanceInfo.textContent = '';
    gradebookError.textContent = ''; // Thêm xóa lỗi sổ điểm
}

function displayError(element, message) {
    if (element) {
        element.textContent = message;
    } else {
        console.error("Phần tử lỗi không tồn tại:", message);
    }
}

function displayInfo(element, message) {
    if (element) {
        element.textContent = message;
    } else {
        console.error("Phần tử thông tin không tồn tại:", message);
    }
}


function getCurrentDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// --- QUẢN LÝ XÁC THỰC (AUTHENTICATION) ---
auth.onAuthStateChanged(user => {
    clearErrors();
    if (user) {
        currentUser = user;
        userEmailSpan.textContent = user.email;
        showView('dashboard-view');
        loadClasses();
    } else {
        currentUser = null;
        if (unsubscribeClasses) unsubscribeClasses();
        if (unsubscribeStudents) unsubscribeStudents();
        if (unsubscribeGradeColumns) unsubscribeGradeColumns(); // Dừng nghe cột điểm
        unsubscribeClasses = null;
        unsubscribeStudents = null;
        unsubscribeGradeColumns = null; // Reset listener cột điểm
        classListUl.innerHTML = '';
        studentListUl.innerHTML = '';
        attendanceListUl.innerHTML = '';
        gradebookTableContainer.innerHTML = ''; // Xóa bảng điểm
        loginForm.reset();
        registerForm.reset();
        showView('auth-view');
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        isFilteringAbsent = false;
    }
});

// (Các hàm xử lý đăng nhập, đăng ký, logout, mapAuthError giữ nguyên)
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("Đăng nhập thành công:", userCredential.user.email);
        })
        .catch(error => {
            console.error("Lỗi đăng nhập:", error);
            displayError(authError, `Đăng nhập thất bại: ${mapAuthError(error.code)}`);
        });
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    const email = registerEmailInput.value;
    const password = registerPasswordInput.value;
    if (password.length < 6) {
        displayError(registerError, "Mật khẩu phải có ít nhất 6 ký tự.");
        return;
    }
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("Đăng ký thành công:", userCredential.user.email);
        })
        .catch(error => {
            console.error("Lỗi đăng ký:", error);
            displayError(registerError, `Đăng ký thất bại: ${mapAuthError(error.code)}`);
        });
});

showRegisterButton.addEventListener('click', () => {
    clearErrors();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
});

showLoginButton.addEventListener('click', () => {
    clearErrors();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
});

logoutButton.addEventListener('click', () => {
    auth.signOut().catch(error => console.error("Lỗi đăng xuất:", error));
});

function mapAuthError(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-email': return 'Địa chỉ email không hợp lệ.';
        case 'auth/user-disabled': return 'Tài khoản này đã bị vô hiệu hóa.';
        case 'auth/user-not-found': return 'Không tìm thấy tài khoản với email này.';
        case 'auth/wrong-password': return 'Sai mật khẩu.';
        case 'auth/email-already-in-use': return 'Địa chỉ email này đã được sử dụng.';
        case 'auth/weak-password': return 'Mật khẩu quá yếu.';
        case 'auth/requires-recent-login': return 'Hành động này yêu cầu đăng nhập lại gần đây.';
        default: return 'Có lỗi xảy ra, vui lòng thử lại. (' + errorCode + ')';
    }
}


// --- QUẢN LÝ LỚP HỌC (FIRESTORE) ---
addClassForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    const className = classNameInput.value.trim();
    if (!className) { displayError(classError, "Vui lòng nhập tên lớp học."); return; }
    if (!currentUser) { displayError(classError, "Bạn cần đăng nhập để thêm lớp."); return; }

    db.collection('users').doc(currentUser.uid).collection('classes').add({
        name: className,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        ownerId: currentUser.uid
    })
    .then(() => {
        console.log("Đã thêm lớp:", className);
        classNameInput.value = '';
    })
    .catch(error => {
        console.error("Lỗi thêm lớp học: ", error);
        displayError(classError, `Không thể thêm lớp: ${error.message}`);
    });
});

function loadClasses() {
    if (!currentUser) return;
    if (unsubscribeClasses) unsubscribeClasses();

    unsubscribeClasses = db.collection('users').doc(currentUser.uid).collection('classes')
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            classListUl.innerHTML = '';
            if (snapshot.empty) {
                classListUl.innerHTML = '<li class="loading-placeholder">Chưa có lớp học nào. Hãy thêm lớp mới!</li>';
                return;
            }
            snapshot.forEach(doc => {
                const classData = doc.data();
                const li = createClassListItem(doc.id, classData.name);
                classListUl.appendChild(li);
            });
        }, error => {
            console.error("Lỗi tải danh sách lớp: ", error);
            displayError(classError, `Lỗi tải lớp: ${error.message}`);
            classListUl.innerHTML = '<li class="loading-placeholder">Có lỗi xảy ra khi tải danh sách lớp.</li>';
        });
}

function createClassListItem(classId, className) {
    // (Giữ nguyên hàm này như phiên bản trước)
    const li = document.createElement('li');
    li.dataset.id = classId;
    li.dataset.name = className;
    li.classList.add('class-item');

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('item-content');

    const nameSpan = document.createElement('span');
    nameSpan.textContent = className;
    nameSpan.classList.add('item-name');
    nameSpan.style.cursor = 'pointer';
    nameSpan.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!li.classList.contains('editing')) {
             viewClassDetail(classId, className);
        }
    });
    contentDiv.appendChild(nameSpan);

    const editForm = document.createElement('form');
    editForm.classList.add('edit-form');
    editForm.style.display = 'none';

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = className;
    editInput.required = true;
    editForm.appendChild(editInput);

    const saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.textContent = 'Lưu';
    saveButton.classList.add('btn', 'btn-success', 'btn-sm');
    editForm.appendChild(saveButton);

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.textContent = 'Hủy';
    cancelButton.classList.add('btn', 'btn-secondary', 'btn-sm');
    cancelButton.addEventListener('click', () => {
        li.classList.remove('editing');
        nameSpan.style.display = '';
        editForm.style.display = 'none';
        actionsDiv.style.display = '';
    });
    editForm.appendChild(cancelButton);

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = editInput.value.trim();
        if (newName && newName !== className) {
            try {
                await updateClassName(classId, newName);
                cancelButton.click();
            } catch (error) {
                console.error("Lỗi cập nhật tên lớp:", error);
                alert(`Không thể cập nhật tên lớp: ${error.message}`);
            }
        } else if (newName === className) {
             cancelButton.click();
        } else {
            alert("Tên lớp không được để trống.");
        }
    });

    contentDiv.appendChild(editForm);
    li.appendChild(contentDiv);

    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('actions');

    const editButton = document.createElement('button');
    editButton.textContent = 'Sửa';
    editButton.classList.add('btn', 'btn-warning', 'btn-sm');
    editButton.addEventListener('click', (e) => {
        e.stopPropagation();
        li.classList.add('editing');
        nameSpan.style.display = 'none';
        editForm.style.display = 'flex';
        actionsDiv.style.display = 'none';
        editInput.focus();
        editInput.select();
    });
    actionsDiv.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Xóa';
    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteClass(classId, className);
    });
    actionsDiv.appendChild(deleteButton);

    li.appendChild(actionsDiv);

    return li;
}

async function updateClassName(classId, newName) {
    if (!currentUser || !classId || !newName) return;
    const classRef = db.collection('users').doc(currentUser.uid).collection('classes').doc(classId);
    try {
        await classRef.update({ name: newName });
        console.log(`Đã cập nhật tên lớp ${classId} thành "${newName}"`);
    } catch (error) {
        console.error("Lỗi cập nhật tên lớp:", error);
        throw error;
    }
}

async function deleteClass(classId, className) {
    if (!currentUser || !classId) return;
    const confirmation = confirm(`Bạn có chắc chắn muốn xóa lớp "${className}" không? Hành động này sẽ xóa cả lớp, học sinh, điểm danh, và sổ điểm của lớp đó và không thể hoàn tác.`);
    if (!confirmation) { console.log("Hủy bỏ thao tác xóa lớp."); return; }

    console.log(`Bắt đầu xóa lớp: ${className} (ID: ${classId})`);
    const classRef = db.collection('users').doc(currentUser.uid).collection('classes').doc(classId);

    try {
        // Xóa subcollection 'students' (và điểm trong đó)
        const studentsRef = classRef.collection('students');
        const studentSnapshot = await studentsRef.get();
        if (!studentSnapshot.empty) {
            console.log(`Tìm thấy ${studentSnapshot.size} học sinh để xóa...`);
            const batchStudents = db.batch();
            studentSnapshot.forEach(doc => batchStudents.delete(doc.ref));
            await batchStudents.commit();
            console.log("Đã xóa xong học sinh.");
        } else {
            console.log("Không có học sinh nào trong lớp để xóa.");
        }

        // Xóa subcollection 'attendance'
        const attendanceRef = classRef.collection('attendance');
        const attendanceSnapshot = await attendanceRef.get();
         if (!attendanceSnapshot.empty) {
            console.log(`Tìm thấy ${attendanceSnapshot.size} bản ghi điểm danh để xóa...`);
            const batchAttendance = db.batch();
            attendanceSnapshot.forEach(doc => batchAttendance.delete(doc.ref));
            await batchAttendance.commit();
            console.log("Đã xóa xong dữ liệu điểm danh.");
        } else {
            console.log("Không có dữ liệu điểm danh nào trong lớp để xóa.");
        }

        // Xóa subcollection 'gradeColumns' (MỚI)
        const gradeColsRef = classRef.collection('gradeColumns');
        const gradeColsSnapshot = await gradeColsRef.get();
         if (!gradeColsSnapshot.empty) {
            console.log(`Tìm thấy ${gradeColsSnapshot.size} cột điểm để xóa...`);
            const batchGradeCols = db.batch();
            gradeColsSnapshot.forEach(doc => batchGradeCols.delete(doc.ref));
            await batchGradeCols.commit();
            console.log("Đã xóa xong các cột điểm.");
        } else {
            console.log("Không có cột điểm nào trong lớp để xóa.");
        }


        // Xóa document của lớp học
        await classRef.delete();
        console.log(`Đã xóa thành công lớp: ${className}`);
    } catch (error) {
        console.error(`Lỗi khi xóa lớp "${className}": `, error);
        displayError(classError, `Không thể xóa lớp "${className}": ${error.message}`);
        alert(`Đã xảy ra lỗi khi xóa lớp "${className}". Vui lòng thử lại.`);
    }
}

// --- QUẢN LÝ HỌC SINH (FIRESTORE) ---
function viewClassDetail(classId, className) {
    if (!classId || !className) { console.error("Thiếu thông tin lớp để xem chi tiết."); return; }
    currentClassId = classId;
    detailClassNameH1.textContent = `Lớp: ${className}`;
    studentListUl.innerHTML = '<li class="loading-placeholder">Đang tải danh sách học sinh...</li>';
    attendanceListUl.innerHTML = '<li class="loading-placeholder">Chọn ngày để xem điểm danh...</li>';
    gradebookTableContainer.innerHTML = '<p class="loading-placeholder">Đang tải sổ điểm...</p>'; // Reset sổ điểm
    clearErrors();
    showView('class-detail-view');

    initializeAttendance();
    initializeGradebook(); // Khởi tạo sổ điểm (MỚI)
    loadStudentsAndGradeColumns(classId); // Tải cả HS và cột điểm (MỚI)
}

// (Hàm loadStudents cũ được thay bằng loadStudentsAndGradeColumns)
// function loadStudents(classId) { ... }

function createStudentListItem(studentId, studentName) {
    // (Giữ nguyên hàm này như phiên bản trước)
     const li = document.createElement('li');
    li.dataset.id = studentId;

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('item-content');

    const nameSpan = document.createElement('span');
    nameSpan.textContent = studentName;
    nameSpan.classList.add('item-name');
    contentDiv.appendChild(nameSpan);

    const editForm = document.createElement('form');
    editForm.classList.add('edit-form');
    editForm.style.display = 'none';

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = studentName;
    editInput.required = true;
    editForm.appendChild(editInput);

    const saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.textContent = 'Lưu';
    saveButton.classList.add('btn', 'btn-success', 'btn-sm');
    editForm.appendChild(saveButton);

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.textContent = 'Hủy';
    cancelButton.classList.add('btn', 'btn-secondary', 'btn-sm');
    cancelButton.addEventListener('click', () => {
        li.classList.remove('editing');
        nameSpan.style.display = '';
        editForm.style.display = 'none';
        actionsDiv.style.display = '';
    });
    editForm.appendChild(cancelButton);

     editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = editInput.value.trim();
        if (newName && newName !== studentName) {
            try {
                await updateStudentName(studentId, newName);
                 cancelButton.click();
            } catch (error) {
                console.error("Lỗi cập nhật tên học sinh:", error);
                alert(`Không thể cập nhật tên học sinh: ${error.message}`);
            }
        } else if (newName === studentName) {
             cancelButton.click();
        } else {
            alert("Tên học sinh không được để trống.");
        }
    });

    contentDiv.appendChild(editForm);
    li.appendChild(contentDiv);

    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('actions');

    const editButton = document.createElement('button');
    editButton.textContent = 'Sửa';
    editButton.classList.add('btn', 'btn-warning', 'btn-sm');
    editButton.addEventListener('click', (e) => {
        e.stopPropagation();
        li.classList.add('editing');
        nameSpan.style.display = 'none';
        editForm.style.display = 'flex';
        actionsDiv.style.display = 'none';
        editInput.focus();
        editInput.select();
    });
    actionsDiv.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Xóa';
    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteStudent(studentId, studentName);
    });
    actionsDiv.appendChild(deleteButton);

    li.appendChild(actionsDiv);

    return li;
}

async function updateStudentName(studentId, newName) {
    if (!currentUser || !currentClassId || !studentId || !newName) return;
    const studentRef = db.collection('users').doc(currentUser.uid)
                       .collection('classes').doc(currentClassId)
                       .collection('students').doc(studentId);
    try {
        await studentRef.update({ name: newName });
        console.log(`Đã cập nhật tên học sinh ${studentId} thành "${newName}"`);
        // Không cần load lại sổ điểm ở đây vì listener sẽ tự cập nhật
    } catch (error) {
        console.error("Lỗi cập nhật tên học sinh:", error);
        throw error;
    }
}

async function deleteStudent(studentId, studentName) {
    if (!currentUser || !currentClassId || !studentId) return;
    const confirmation = confirm(`Bạn có chắc chắn muốn xóa học sinh "${studentName}" khỏi lớp này không? Điểm và dữ liệu điểm danh của học sinh này cũng sẽ bị xóa.`);
    if (!confirmation) { console.log("Hủy bỏ thao tác xóa học sinh."); return; }

    console.log(`Bắt đầu xóa học sinh: ${studentName} (ID: ${studentId})`);
    const studentRef = db.collection('users').doc(currentUser.uid)
                       .collection('classes').doc(currentClassId)
                       .collection('students').doc(studentId);
    try {
        await studentRef.delete(); // Xóa tài liệu HS (bao gồm cả điểm)
        console.log(`Đã xóa thành công học sinh: ${studentName}`);
        // Cập nhật lại danh sách điểm danh (sẽ tự gọi loadAttendance)
        // Cập nhật lại sổ điểm (sẽ tự gọi renderGradebookTable)
        // -> Chỉ cần load lại cả hai (loadStudentsAndGradeColumns sẽ làm việc này)
        if(currentClassId) { // Đảm bảo vẫn đang ở chi tiết lớp
             loadStudentsAndGradeColumns(currentClassId);
        }

    } catch (error) {
        console.error(`Lỗi khi xóa học sinh "${studentName}": `, error);
        displayError(studentError, `Không thể xóa học sinh "${studentName}": ${error.message}`);
        alert(`Đã xảy ra lỗi khi xóa học sinh "${studentName}". Vui lòng thử lại.`);
    }
}

addStudentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    const studentName = studentNameInput.value.trim();
    if (!studentName) { displayError(studentError, "Vui lòng nhập tên học sinh."); return; }
    if (!currentUser || !currentClassId) { displayError(studentError, "Không xác định được người dùng hoặc lớp học hiện tại."); return; }

    db.collection('users').doc(currentUser.uid)
      .collection('classes').doc(currentClassId)
      .collection('students').add({
        name: studentName,
        grades: {}, // Khởi tạo map điểm rỗng cho học sinh mới
        addedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log(`Đã thêm học sinh "${studentName}" vào lớp ${currentClassId}`);
        studentNameInput.value = '';
        // Listener của loadStudentsAndGradeColumns sẽ tự cập nhật UI
    })
    .catch(error => {
        console.error("Lỗi thêm học sinh: ", error);
        displayError(studentError, `Không thể thêm học sinh: ${error.message}`);
    });
});

// --- QUẢN LÝ ĐIỂM DANH ---

function initializeAttendance() {
    attendanceDateInput.value = getCurrentDateString();
    attendanceDateInput.removeEventListener('change', handleDateChange);
    attendanceDateInput.addEventListener('change', handleDateChange);
    filterAbsentButton.removeEventListener('click', toggleAbsentFilter);
    filterAbsentButton.addEventListener('click', toggleAbsentFilter);
    isFilteringAbsent = false;
    updateFilterButton();
    attendanceListUl.classList.remove('filtering-absent');
}

function handleDateChange() {
    if (!currentClassId) return;
    const selectedDate = attendanceDateInput.value;
    if (selectedDate) {
        attendanceListUl.innerHTML = '<li class="loading-placeholder">Đang tải điểm danh...</li>';
         // Chỉ cần tải lại điểm danh với danh sách học sinh đã lưu
         loadAttendance(currentClassId, selectedDate, currentStudentsData);
    }
}

function toggleAbsentFilter() {
    isFilteringAbsent = !isFilteringAbsent;
    updateFilterButton();
    applyAttendanceFilter();
}

function updateFilterButton() {
     if (isFilteringAbsent) {
        filterAbsentButton.textContent = 'Hiện tất cả HS';
        filterAbsentButton.classList.remove('btn-secondary');
        filterAbsentButton.classList.add('btn-info');
    } else {
        filterAbsentButton.textContent = 'Chỉ hiện HS vắng';
        filterAbsentButton.classList.remove('btn-info');
        filterAbsentButton.classList.add('btn-secondary');
    }
}

function applyAttendanceFilter() {
     if (isFilteringAbsent) {
        attendanceListUl.classList.add('filtering-absent');
    } else {
        attendanceListUl.classList.remove('filtering-absent');
    }
    updateAttendanceInfo();
}

function updateAttendanceInfo() {
    const totalStudents = attendanceListUl.querySelectorAll('li:not(.loading-placeholder)').length;
    const absentStudents = attendanceListUl.querySelectorAll('li.absent').length;

    if (totalStudents > 0) {
         if (isFilteringAbsent) {
             displayInfo(attendanceInfo, `Đang hiển thị ${absentStudents} học sinh vắng mặt.`);
         } else {
             displayInfo(attendanceInfo, `Tổng số: ${totalStudents} học sinh | Vắng mặt: ${absentStudents}`);
         }
    } else {
         attendanceInfo.textContent = '';
    }
}


async function loadAttendance(classId, dateString, students) {
    if (!currentUser || !classId || !dateString || !students) {
         attendanceListUl.innerHTML = '<li class="loading-placeholder">Thiếu thông tin để tải điểm danh.</li>';
         return;
    }
    attendanceListUl.innerHTML = '';
    // Giữ lại lỗi điểm danh nếu có
    // clearErrors(); // Không xóa lỗi ở đây nữa

    const attendanceDocRef = db.collection('users').doc(currentUser.uid)
                               .collection('classes').doc(classId)
                               .collection('attendance').doc(dateString);

    try {
        const attendanceDoc = await attendanceDocRef.get();
        const attendanceData = attendanceDoc.exists ? attendanceDoc.data() : { absentStudents: {} };
        const absentStudentsMap = attendanceData.absentStudents || {};

        if (students.length === 0) {
            attendanceListUl.innerHTML = '<li class="loading-placeholder">Chưa có học sinh trong lớp để điểm danh.</li>';
             updateAttendanceInfo();
            return;
        }

        students.forEach(student => {
            const isAbsent = absentStudentsMap[student.id] === true;
            const li = createAttendanceListItem(student.id, student.name, isAbsent, dateString);
            attendanceListUl.appendChild(li);
        });
        applyAttendanceFilter();

    } catch (error) {
        console.error(`Lỗi tải điểm danh ngày ${dateString}: `, error);
        displayError(attendanceError, `Lỗi tải điểm danh: ${error.message}`);
        attendanceListUl.innerHTML = '<li class="loading-placeholder">Có lỗi xảy ra khi tải điểm danh.</li>';
        attendanceInfo.textContent = '';
    }
}

function createAttendanceListItem(studentId, studentName, isAbsent, dateString) {
    const li = document.createElement('li');
    li.dataset.id = studentId;
    li.textContent = studentName;
    li.classList.toggle('absent', isAbsent);

    li.addEventListener('click', () => {
        if (isFilteringAbsent) {
            toggleAbsentFilter();
        }
        toggleAttendance(studentId, isAbsent, dateString);
    });

    return li;
}

async function toggleAttendance(studentId, wasAbsent, dateString) {
    if (!currentUser || !currentClassId || !studentId || !dateString) return;

    const attendanceDocRef = db.collection('users').doc(currentUser.uid)
                               .collection('classes').doc(currentClassId)
                               .collection('attendance').doc(dateString);

    const studentKey = `absentStudents.${studentId}`;

    const listItem = attendanceListUl.querySelector(`li[data-id="${studentId}"]`);
    if (listItem) {
        listItem.style.opacity = '0.5';
    }


    try {
        if (wasAbsent) {
            await attendanceDocRef.update({
                [studentKey]: firebase.firestore.FieldValue.delete()
            });
            console.log(`Đã điểm danh CÓ MẶT cho HS ${studentId} ngày ${dateString}`);
        } else {
            await attendanceDocRef.set({
                absentStudents: {
                    [studentId]: true
                }
            }, { merge: true });
            console.log(`Đã điểm danh VẮNG MẶT cho HS ${studentId} ngày ${dateString}`);
        }
         // Chỉ cần load lại điểm danh với danh sách học sinh hiện tại
         loadAttendance(currentClassId, dateString, currentStudentsData);

    } catch (error) {
        console.error(`Lỗi cập nhật điểm danh cho HS ${studentId} ngày ${dateString}: `, error);
        displayError(attendanceError, `Lỗi cập nhật điểm danh: ${error.message}`);
        alert("Có lỗi xảy ra khi cập nhật điểm danh, vui lòng thử lại.");
         // Khôi phục giao diện nếu lỗi
         if (listItem) {
             listItem.style.opacity = '1';
             // Load lại để chắc chắn
             loadAttendance(currentClassId, dateString, currentStudentsData);
         }
    }
}

// --- QUẢN LÝ SỔ ĐIỂM (MỚI) ---

/**
 * Khởi tạo phần sổ điểm: gắn listener cho nút thêm cột.
 */
function initializeGradebook() {
    addGradeColumnButton.removeEventListener('click', handleAddGradeColumn);
    addGradeColumnButton.addEventListener('click', handleAddGradeColumn);
    // Listener cho việc nhập điểm sẽ được gắn vào container khi render bảng
    gradebookTableContainer.removeEventListener('change', handleGradeInputChange); // Sử dụng change thay vì blur
    gradebookTableContainer.addEventListener('change', handleGradeInputChange);
}

/**
 * Xử lý sự kiện khi nhấn nút "Thêm cột điểm".
 */
async function handleAddGradeColumn() {
    if (!currentUser || !currentClassId) return;

    const columnName = prompt("Nhập tên cột điểm mới (ví dụ: Kiểm tra 15 phút, Giữa kỳ):");
    if (columnName && columnName.trim()) {
        const trimmedName = columnName.trim();
        try {
            await db.collection('users').doc(currentUser.uid)
                    .collection('classes').doc(currentClassId)
                    .collection('gradeColumns').add({
                        name: trimmedName,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
            console.log(`Đã thêm cột điểm: ${trimmedName}`);
            // Listener của loadStudentsAndGradeColumns sẽ tự cập nhật bảng
        } catch (error) {
            console.error("Lỗi thêm cột điểm:", error);
            displayError(gradebookError, `Không thể thêm cột điểm: ${error.message}`);
            alert("Có lỗi xảy ra khi thêm cột điểm.");
        }
    } else if (columnName !== null) { // Chỉ báo lỗi nếu người dùng nhập tên trống, không phải nhấn Hủy
        alert("Tên cột điểm không được để trống.");
    }
}

/**
 * Tải đồng thời danh sách học sinh và cột điểm, sau đó render các phần liên quan.
 * @param {string} classId ID của lớp học
 */
function loadStudentsAndGradeColumns(classId) {
    if (!currentUser || !classId) return;

    // Dừng các listener cũ
    if (unsubscribeStudents) unsubscribeStudents();
    if (unsubscribeGradeColumns) unsubscribeGradeColumns();

    const studentsRef = db.collection('users').doc(currentUser.uid)
                        .collection('classes').doc(classId)
                        .collection('students').orderBy('name', 'asc');

    const gradeColsRef = db.collection('users').doc(currentUser.uid)
                         .collection('classes').doc(classId)
                         .collection('gradeColumns').orderBy('createdAt', 'asc'); // Sắp xếp cột theo thời gian tạo

    // Lắng nghe thay đổi trên cả hai collection
    unsubscribeStudents = studentsRef.onSnapshot(studentSnapshot => {
        studentListUl.innerHTML = ''; // Xóa list quản lý học sinh
        currentStudentsData = []; // Reset danh sách học sinh đã lưu
        if (studentSnapshot.empty) {
            studentListUl.innerHTML = '<li class="loading-placeholder">Chưa có học sinh nào trong lớp này.</li>';
        } else {
             studentSnapshot.forEach(doc => {
                const studentData = doc.data();
                // Lưu trữ đầy đủ dữ liệu học sinh (bao gồm cả điểm)
                currentStudentsData.push({ id: doc.id, ...studentData });
                const li = createStudentListItem(doc.id, studentData.name);
                studentListUl.appendChild(li);
            });
        }
        // Cập nhật điểm danh và sổ điểm với danh sách học sinh mới
        const selectedDate = attendanceDateInput.value || getCurrentDateString();
        loadAttendance(classId, selectedDate, currentStudentsData);
        renderGradebookTable(currentStudentsData, currentGradeColumns); // Render lại bảng điểm

    }, error => {
        console.error(`Lỗi tải danh sách học sinh: `, error);
        displayError(studentError, `Lỗi tải học sinh: ${error.message}`);
        studentListUl.innerHTML = '<li class="loading-placeholder">Có lỗi xảy ra khi tải danh sách học sinh.</li>';
        attendanceListUl.innerHTML = '<li class="loading-placeholder">Lỗi tải danh sách học sinh, không thể điểm danh.</li>';
        gradebookTableContainer.innerHTML = '<p class="loading-placeholder">Lỗi tải danh sách học sinh, không thể hiển thị sổ điểm.</p>';
    });

    unsubscribeGradeColumns = gradeColsRef.onSnapshot(colsSnapshot => {
        currentGradeColumns = []; // Reset danh sách cột điểm đã lưu
        colsSnapshot.forEach(doc => {
            currentGradeColumns.push({ id: doc.id, ...doc.data() });
        });
        // Render lại bảng điểm với danh sách cột mới
        renderGradebookTable(currentStudentsData, currentGradeColumns);

    }, error => {
         console.error(`Lỗi tải cột điểm: `, error);
         displayError(gradebookError, `Lỗi tải cột điểm: ${error.message}`);
         gradebookTableContainer.innerHTML = '<p class="loading-placeholder">Có lỗi xảy ra khi tải các cột điểm.</p>';
    });
}


/**
 * Render bảng điểm dựa trên danh sách học sinh và cột điểm.
 * @param {Array} students Danh sách học sinh (bao gồm cả điểm)
 * @param {Array} columns Danh sách cột điểm
 */
function renderGradebookTable(students, columns) {
    gradebookTableContainer.innerHTML = ''; // Xóa nội dung cũ
    if (!students || !columns === undefined) { // Kiểm tra columns có phải undefined không
         gradebookTableContainer.innerHTML = '<p class="loading-placeholder">Đang tải dữ liệu sổ điểm...</p>';
         return;
    }

    if (students.length === 0) {
        gradebookTableContainer.innerHTML = '<p class="loading-placeholder">Chưa có học sinh để hiển thị sổ điểm.</p>';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('gradebook-table');

    // Tạo hàng tiêu đề (thead)
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    const thStudent = document.createElement('th');
    thStudent.textContent = 'Học sinh';
    headerRow.appendChild(thStudent);

    columns.forEach(col => {
        const thCol = document.createElement('th');
        thCol.textContent = col.name;
        thCol.dataset.columnId = col.id; // Lưu ID cột để tham chiếu
        // TODO: Thêm nút xóa cột điểm ở đây nếu cần
        headerRow.appendChild(thCol);
    });

    // Tạo các hàng dữ liệu (tbody)
    const tbody = table.createTBody();
    students.forEach(student => {
        const tr = tbody.insertRow();
        const thName = document.createElement('th'); // Dùng th cho tên HS để sticky
        thName.textContent = student.name;
        tr.appendChild(thName);

        columns.forEach(col => {
            const td = tr.insertCell();
            const input = document.createElement('input');
            input.type = 'number';
            input.classList.add('grade-input');
            input.dataset.studentId = student.id; // Lưu ID học sinh
            input.dataset.columnId = col.id;     // Lưu ID cột điểm
            input.min = 0; // Điểm không âm (tùy chỉnh nếu cần)
            input.max = 10; // Điểm tối đa (tùy chỉnh nếu cần)
            input.step = 0.1; // Bước nhảy điểm (tùy chỉnh nếu cần)

            // Lấy điểm đã lưu (nếu có)
            const currentGrade = student.grades && student.grades[col.id] !== undefined
                               ? student.grades[col.id]
                               : ''; // Để trống nếu chưa có điểm
            input.value = currentGrade;

            td.appendChild(input);
        });
    });

    gradebookTableContainer.appendChild(table);
}

/**
 * Xử lý sự kiện khi giá trị trong ô nhập điểm thay đổi.
 * Sử dụng event delegation.
 * @param {Event} e Sự kiện change
 */
function handleGradeInputChange(e) {
    if (e.target.classList.contains('grade-input')) {
        const input = e.target;
        const studentId = input.dataset.studentId;
        const columnId = input.dataset.columnId;
        let score = input.value.trim(); // Lấy giá trị và xóa khoảng trắng

        if (!studentId || !columnId) return; // Không có đủ thông tin

        // Chuyển đổi điểm sang số hoặc null/undefined nếu trống
        let scoreToSave;
        if (score === '') {
            // Nếu ô trống, xóa điểm khỏi Firestore
            scoreToSave = firebase.firestore.FieldValue.delete();
        } else {
            const numericScore = parseFloat(score);
            if (!isNaN(numericScore)) {
                 // Làm tròn đến 1 chữ số thập phân (ví dụ)
                 scoreToSave = Math.round(numericScore * 10) / 10;
                 // Kiểm tra giới hạn điểm nếu cần
                 if (scoreToSave < 0) scoreToSave = 0;
                 if (scoreToSave > 10) scoreToSave = 10; // Giả sử thang điểm 10
                 input.value = scoreToSave; // Cập nhật lại giá trị đã làm tròn/giới hạn
            } else {
                 // Nếu nhập không phải số, xóa giá trị và không lưu
                 input.value = '';
                 scoreToSave = firebase.firestore.FieldValue.delete();
                 displayError(gradebookError, "Vui lòng nhập điểm là số.");
                 // Có thể thêm timeout để xóa lỗi sau vài giây
                 setTimeout(() => clearErrors(), 3000);
            }
        }


        // Lưu điểm vào Firestore
        saveGrade(studentId, columnId, scoreToSave);
    }
}

/**
 * Lưu điểm của học sinh vào Firestore.
 * @param {string} studentId ID học sinh
 * @param {string} columnId ID cột điểm
 * @param {number | FieldValue} score Điểm cần lưu (số) hoặc FieldValue.delete()
 */
async function saveGrade(studentId, columnId, score) {
    if (!currentUser || !currentClassId || !studentId || !columnId) return;

    const studentRef = db.collection('users').doc(currentUser.uid)
                       .collection('classes').doc(currentClassId)
                       .collection('students').doc(studentId);

    const gradeKey = `grades.${columnId}`; // Key để cập nhật bằng dot notation

    try {
        await studentRef.update({
            [gradeKey]: score
        });
        console.log(`Đã lưu điểm cho HS ${studentId}, cột ${columnId}: ${score === firebase.firestore.FieldValue.delete() ? '(đã xóa)' : score}`);
        displayError(gradebookError, ""); // Xóa lỗi nếu lưu thành công
    } catch (error) {
        console.error("Lỗi lưu điểm:", error);
        displayError(gradebookError, `Lỗi lưu điểm: ${error.message}`);
        // Có thể thử tải lại bảng điểm để đảm bảo đồng bộ
        // loadStudentsAndGradeColumns(currentClassId);
    }
}


// --- XỬ LÝ NÚT QUAY LẠI ---
backToDashboardButton.addEventListener('click', () => {
    if (unsubscribeStudents) unsubscribeStudents();
    if (unsubscribeGradeColumns) unsubscribeGradeColumns(); // Dừng nghe cột điểm
    unsubscribeStudents = null;
    unsubscribeGradeColumns = null;
    currentClassId = null;
    studentListUl.innerHTML = '';
    attendanceListUl.innerHTML = '';
    gradebookTableContainer.innerHTML = ''; // Xóa bảng điểm
    clearErrors();
    isFilteringAbsent = false;
    showView('dashboard-view');
});

// --- KHỞI CHẠY BAN ĐẦU ---
console.log("Ứng dụng đã sẵn sàng.");
