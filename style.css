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

// Gradebook Elements
const gradebookSection = document.getElementById('gradebook-section');
const addGradeColumnButton = document.getElementById('add-grade-column-button');
const gradebookTableContainer = document.getElementById('gradebook-table-container');
const gradebookError = document.getElementById('gradebook-error');


// --- BIẾN TRẠNG THÁI ---
let currentUser = null;
let currentClassId = null;
let unsubscribeClasses = null;
let unsubscribeStudents = null;
let unsubscribeGradeColumns = null;
let isFilteringAbsent = false;
let currentStudentsData = [];
let currentGradeColumns = [];


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
    gradebookError.textContent = '';
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
        if (unsubscribeGradeColumns) unsubscribeGradeColumns();
        unsubscribeClasses = null;
        unsubscribeStudents = null;
        unsubscribeGradeColumns = null;
        classListUl.innerHTML = '';
        studentListUl.innerHTML = '';
        attendanceListUl.innerHTML = '';
        gradebookTableContainer.innerHTML = '';
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

        // Xóa subcollection 'gradeColumns'
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
    gradebookTableContainer.innerHTML = '<p class="loading-placeholder">Đang tải sổ điểm...</p>';
    clearErrors();
    showView('class-detail-view');

    initializeAttendance();
    initializeGradebook();
    loadStudentsAndGradeColumns(classId);
}


function loadStudentsAndGradeColumns(classId) {
    if (!currentUser || !classId) return;

    if (unsubscribeStudents) unsubscribeStudents();
    if (unsubscribeGradeColumns) unsubscribeGradeColumns();

    const studentsRef = db.collection('users').doc(currentUser.uid)
                        .collection('classes').doc(classId)
                        .collection('students').orderBy('name', 'asc');

    const gradeColsRef = db.collection('users').doc(currentUser.uid)
                         .collection('classes').doc(classId)
                         .collection('gradeColumns').orderBy('createdAt', 'asc');

    unsubscribeStudents = studentsRef.onSnapshot(studentSnapshot => {
        studentListUl.innerHTML = '';
        currentStudentsData = [];
        if (studentSnapshot.empty) {
            studentListUl.innerHTML = '<li class="loading-placeholder">Chưa có học sinh nào trong lớp này.</li>';
        } else {
             studentSnapshot.forEach(doc => {
                const studentData = doc.data();
                currentStudentsData.push({ id: doc.id, ...studentData });
                // Truyền toàn bộ studentData vào hàm tạo li
                const li = createStudentListItem(doc.id, studentData);
                studentListUl.appendChild(li);
            });
        }
        const selectedDate = attendanceDateInput.value || getCurrentDateString();
        loadAttendance(classId, selectedDate, currentStudentsData);
        renderGradebookTable(currentStudentsData, currentGradeColumns);

    }, error => {
        console.error(`Lỗi tải danh sách học sinh: `, error);
        displayError(studentError, `Lỗi tải học sinh: ${error.message}`);
        studentListUl.innerHTML = '<li class="loading-placeholder">Có lỗi xảy ra khi tải danh sách học sinh.</li>';
        attendanceListUl.innerHTML = '<li class="loading-placeholder">Lỗi tải danh sách học sinh, không thể điểm danh.</li>';
        gradebookTableContainer.innerHTML = '<p class="loading-placeholder">Lỗi tải danh sách học sinh, không thể hiển thị sổ điểm.</p>';
    });

    unsubscribeGradeColumns = gradeColsRef.onSnapshot(colsSnapshot => {
        currentGradeColumns = [];
        colsSnapshot.forEach(doc => {
            currentGradeColumns.push({ id: doc.id, ...doc.data() });
        });
        renderGradebookTable(currentStudentsData, currentGradeColumns);

    }, error => {
         console.error(`Lỗi tải cột điểm: `, error);
         displayError(gradebookError, `Lỗi tải cột điểm: ${error.message}`);
         gradebookTableContainer.innerHTML = '<p class="loading-placeholder">Có lỗi xảy ra khi tải các cột điểm.</p>';
    });
}

/**
 * Tạo một phần tử list item (li) cho học sinh, bao gồm cả form sửa chi tiết.
 * @param {string} studentId ID của học sinh
 * @param {object} studentData Dữ liệu học sinh từ Firestore (bao gồm name, dob, parentContact, notes, grades)
 * @returns {HTMLLIElement} Phần tử li đã được tạo
 */
function createStudentListItem(studentId, studentData) {
    const li = document.createElement('li');
    li.dataset.id = studentId;

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('item-content');

    // --- Phần hiển thị thông tin ---
    const nameSpan = document.createElement('span');
    nameSpan.textContent = studentData.name;
    nameSpan.classList.add('item-name');
    contentDiv.appendChild(nameSpan);

    // (Tùy chọn) Hiển thị thêm chi tiết nhỏ bên cạnh tên
    // const detailsSpan = document.createElement('span');
    // detailsSpan.classList.add('student-details');
    // detailsSpan.textContent = ` (NS: ${studentData.dob || 'N/A'})`; // Ví dụ
    // contentDiv.appendChild(detailsSpan);

    // --- Form sửa chi tiết (ẩn ban đầu) ---
    const editForm = document.createElement('form');
    editForm.classList.add('edit-form');
    editForm.style.display = 'none';

    // Input cho Tên
    editForm.innerHTML += `
        <div class="form-group-inline">
            <label for="edit-student-name-${studentId}">Tên:</label>
            <input type="text" id="edit-student-name-${studentId}" value="${studentData.name || ''}" required>
        </div>
        <div class="form-group-inline">
            <label for="edit-student-dob-${studentId}">Ngày sinh:</label>
            <input type="date" id="edit-student-dob-${studentId}" value="${studentData.dob || ''}">
        </div>
        <div class="form-group-inline">
            <label for="edit-student-contact-${studentId}">ĐT Phụ huynh:</label>
            <input type="tel" id="edit-student-contact-${studentId}" value="${studentData.parentContact || ''}">
        </div>
        <div class="form-group-inline">
            <label for="edit-student-notes-${studentId}">Ghi chú:</label>
            <textarea id="edit-student-notes-${studentId}">${studentData.notes || ''}</textarea>
        </div>
        <div class="edit-form-buttons">
             <button type="submit" class="btn btn-success btn-sm">Lưu</button>
             <button type="button" class="btn btn-secondary btn-sm cancel-edit-student">Hủy</button>
        </div>
    `;

    // Gắn sự kiện cho nút Hủy trong form
    const cancelButton = editForm.querySelector('.cancel-edit-student');
    cancelButton.addEventListener('click', () => {
        li.classList.remove('editing');
        // Không cần ẩn/hiện thủ công vì listener sẽ render lại
    });

    // Gắn sự kiện submit cho form
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedDetails = {
            name: editForm.querySelector(`#edit-student-name-${studentId}`).value.trim(),
            dob: editForm.querySelector(`#edit-student-dob-${studentId}`).value || null, // Lưu null nếu trống
            parentContact: editForm.querySelector(`#edit-student-contact-${studentId}`).value.trim() || null,
            notes: editForm.querySelector(`#edit-student-notes-${studentId}`).value.trim() || null,
        };

        if (!updatedDetails.name) {
            alert("Tên học sinh không được để trống.");
            return;
        }

        try {
            await updateStudentDetails(studentId, updatedDetails);
            cancelButton.click(); // Thoát chế độ sửa (listener sẽ cập nhật UI)
        } catch (error) {
            console.error("Lỗi cập nhật thông tin học sinh:", error);
            alert(`Không thể cập nhật thông tin học sinh: ${error.message}`);
        }
    });

    contentDiv.appendChild(editForm);
    li.appendChild(contentDiv);

    // --- Các nút hành động (Sửa, Xóa) ---
    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('actions');

    const editButton = document.createElement('button');
    editButton.textContent = 'Sửa';
    editButton.classList.add('btn', 'btn-warning', 'btn-sm');
    editButton.addEventListener('click', (e) => {
        e.stopPropagation();
        // Đóng tất cả các form sửa khác trước khi mở form này
        document.querySelectorAll('#student-list li.editing').forEach(otherLi => {
            if(otherLi !== li) {
                 otherLi.querySelector('.cancel-edit-student')?.click(); // Giả lập click hủy
            }
        });
        // Mở form sửa này
        li.classList.add('editing');
        // Không cần ẩn/hiện thủ công vì CSS xử lý
        editForm.querySelector('input[type="text"]').focus(); // Focus vào ô tên
    });
    actionsDiv.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Xóa';
    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteStudent(studentId, studentData.name);
    });
    actionsDiv.appendChild(deleteButton);

    li.appendChild(actionsDiv);

    return li;
}


/**
 * Cập nhật thông tin chi tiết của học sinh trong Firestore.
 * @param {string} studentId ID học sinh
 * @param {object} details Đối tượng chứa các thông tin cần cập nhật (name, dob, parentContact, notes)
 */
async function updateStudentDetails(studentId, details) {
    if (!currentUser || !currentClassId || !studentId || !details) return;
    const studentRef = db.collection('users').doc(currentUser.uid)
                       .collection('classes').doc(currentClassId)
                       .collection('students').doc(studentId);
    try {
        // Chỉ cập nhật các trường được cung cấp trong details
        await studentRef.update(details);
        console.log(`Đã cập nhật thông tin cho học sinh ${studentId}`);
    } catch (error) {
        console.error("Lỗi cập nhật thông tin học sinh:", error);
        throw error; // Ném lỗi ra để hàm gọi xử lý
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
        await studentRef.delete();
        console.log(`Đã xóa thành công học sinh: ${studentName}`);
        // Listener của loadStudentsAndGradeColumns sẽ tự động cập nhật UI
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
        dob: null, // Khởi tạo các trường mới
        parentContact: null,
        notes: null,
        grades: {},
        addedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log(`Đã thêm học sinh "${studentName}" vào lớp ${currentClassId}`);
        studentNameInput.value = '';
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
    // Đếm số li không phải placeholder trong danh sách gốc (chưa lọc)
    const totalStudents = currentStudentsData.length;
    // Đếm số li có class 'absent' (đang hiển thị hoặc ẩn)
    const absentCount = attendanceListUl.querySelectorAll('li.absent').length;

    if (totalStudents > 0) {
         if (isFilteringAbsent) {
             displayInfo(attendanceInfo, `Đang hiển thị ${absentCount} học sinh vắng mặt.`);
         } else {
             displayInfo(attendanceInfo, `Tổng số: ${totalStudents} học sinh | Vắng mặt: ${absentCount}`);
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
    // clearErrors();

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
        applyAttendanceFilter(); // Áp dụng bộ lọc sau khi render

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
             loadAttendance(currentClassId, dateString, currentStudentsData); // Load lại
         }
    }
}

// --- QUẢN LÝ SỔ ĐIỂM ---

function initializeGradebook() {
    addGradeColumnButton.removeEventListener('click', handleAddGradeColumn);
    addGradeColumnButton.addEventListener('click', handleAddGradeColumn);
    gradebookTableContainer.removeEventListener('change', handleGradeInputChange);
    gradebookTableContainer.addEventListener('change', handleGradeInputChange);
    // Thêm listener cho nút xóa cột điểm (dùng event delegation)
    gradebookTableContainer.removeEventListener('click', handleDeleteGradeColumnClick);
    gradebookTableContainer.addEventListener('click', handleDeleteGradeColumnClick);

}

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
        } catch (error) {
            console.error("Lỗi thêm cột điểm:", error);
            displayError(gradebookError, `Không thể thêm cột điểm: ${error.message}`);
            alert("Có lỗi xảy ra khi thêm cột điểm.");
        }
    } else if (columnName !== null) {
        alert("Tên cột điểm không được để trống.");
    }
}


function renderGradebookTable(students, columns) {
    gradebookTableContainer.innerHTML = '';
    if (!students || columns === undefined) {
         gradebookTableContainer.innerHTML = '<p class="loading-placeholder">Đang tải dữ liệu sổ điểm...</p>';
         return;
    }

    if (students.length === 0) {
        gradebookTableContainer.innerHTML = '<p class="loading-placeholder">Chưa có học sinh để hiển thị sổ điểm.</p>';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('gradebook-table');

    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    const thStudent = document.createElement('th');
    thStudent.textContent = 'Học sinh';
    headerRow.appendChild(thStudent);

    columns.forEach(col => {
        const thCol = document.createElement('th');
        thCol.dataset.columnId = col.id; // Lưu ID cột

        // Span chứa tên cột
        const colNameSpan = document.createElement('span');
        colNameSpan.textContent = col.name;
        thCol.appendChild(colNameSpan);

        // Nút xóa cột điểm (MỚI)
        const deleteColBtn = document.createElement('button');
        deleteColBtn.innerHTML = '&times;'; // Dấu 'x'
        deleteColBtn.classList.add('btn-icon-danger', 'delete-column-btn');
        deleteColBtn.title = `Xóa cột điểm "${col.name}"`; // Tooltip
        deleteColBtn.dataset.columnId = col.id; // Lưu ID cột vào nút
        deleteColBtn.dataset.columnName = col.name; // Lưu tên cột vào nút
        thCol.appendChild(deleteColBtn);

        headerRow.appendChild(thCol);
    });

    const tbody = table.createTBody();
    students.forEach(student => {
        const tr = tbody.insertRow();
        const thName = document.createElement('th');
        thName.textContent = student.name;
        tr.appendChild(thName);

        columns.forEach(col => {
            const td = tr.insertCell();
            const input = document.createElement('input');
            input.type = 'number';
            input.classList.add('grade-input');
            input.dataset.studentId = student.id;
            input.dataset.columnId = col.id;
            input.min = 0;
            input.max = 10;
            input.step = 0.1;

            const currentGrade = student.grades && student.grades[col.id] !== undefined
                               ? student.grades[col.id]
                               : '';
            input.value = currentGrade;

            td.appendChild(input);
        });
    });

    gradebookTableContainer.appendChild(table);
}

/**
 * Xử lý sự kiện click trên container bảng điểm, kiểm tra nút xóa cột điểm. (MỚI)
 * @param {Event} e Sự kiện click
 */
function handleDeleteGradeColumnClick(e) {
    if (e.target.classList.contains('delete-column-btn')) {
        const button = e.target;
        const columnId = button.dataset.columnId;
        const columnName = button.dataset.columnName;
        if (columnId && columnName) {
            deleteGradeColumn(columnId, columnName);
        }
    }
}

/**
 * Hàm xóa một cột điểm và điểm tương ứng của học sinh. (MỚI)
 * @param {string} columnId ID cột điểm
 * @param {string} columnName Tên cột điểm
 */
async function deleteGradeColumn(columnId, columnName) {
    if (!currentUser || !currentClassId || !columnId) return;

    const confirmation = confirm(`Bạn có chắc chắn muốn xóa cột điểm "${columnName}" không? Hành động này sẽ xóa điểm của TẤT CẢ học sinh trong cột này và không thể hoàn tác.`);
    if (!confirmation) { console.log("Hủy bỏ thao tác xóa cột điểm."); return; }

    console.log(`Bắt đầu xóa cột điểm: ${columnName} (ID: ${columnId})`);
    const columnRef = db.collection('users').doc(currentUser.uid)
                      .collection('classes').doc(currentClassId)
                      .collection('gradeColumns').doc(columnId);
    const studentsRef = db.collection('users').doc(currentUser.uid)
                      .collection('classes').doc(currentClassId)
                      .collection('students');

    try {
        // 1. Xóa điểm của cột này khỏi tất cả học sinh
        const studentSnapshot = await studentsRef.get();
        if (!studentSnapshot.empty) {
            console.log(`Chuẩn bị xóa điểm cột ${columnId} khỏi ${studentSnapshot.size} học sinh...`);
            const batch = db.batch();
            const gradeKeyToDelete = `grades.${columnId}`;
            studentSnapshot.forEach(doc => {
                // Chỉ update nếu học sinh có field grades
                if (doc.data().grades) {
                     batch.update(doc.ref, { [gradeKeyToDelete]: firebase.firestore.FieldValue.delete() });
                }
            });
            await batch.commit();
            console.log("Đã xóa điểm của cột khỏi học sinh.");
        }

        // 2. Xóa tài liệu cột điểm
        await columnRef.delete();
        console.log(`Đã xóa thành công cột điểm: ${columnName}`);
        // Listener của loadStudentsAndGradeColumns sẽ tự cập nhật bảng

    } catch (error) {
        console.error(`Lỗi khi xóa cột điểm "${columnName}": `, error);
        displayError(gradebookError, `Không thể xóa cột điểm "${columnName}": ${error.message}`);
        alert(`Đã xảy ra lỗi khi xóa cột điểm "${columnName}". Vui lòng thử lại.`);
    }
}


function handleGradeInputChange(e) {
    if (e.target.classList.contains('grade-input')) {
        const input = e.target;
        const studentId = input.dataset.studentId;
        const columnId = input.dataset.columnId;
        let score = input.value.trim();

        if (!studentId || !columnId) return;

        let scoreToSave;
        if (score === '') {
            scoreToSave = firebase.firestore.FieldValue.delete();
        } else {
            const numericScore = parseFloat(score);
            if (!isNaN(numericScore)) {
                 scoreToSave = Math.round(numericScore * 10) / 10;
                 if (scoreToSave < 0) scoreToSave = 0;
                 if (scoreToSave > 10) scoreToSave = 10;
                 if (input.value !== String(scoreToSave)) { // Chỉ cập nhật nếu giá trị thay đổi sau khi làm tròn/giới hạn
                    input.value = scoreToSave;
                 }
            } else {
                 input.value = '';
                 scoreToSave = firebase.firestore.FieldValue.delete();
                 displayError(gradebookError, "Vui lòng nhập điểm là số.");
                 setTimeout(() => clearErrors(), 3000);
                 return; // Dừng lại nếu nhập không phải số
            }
        }
        saveGrade(studentId, columnId, scoreToSave);
    }
}

async function saveGrade(studentId, columnId, score) {
    if (!currentUser || !currentClassId || !studentId || !columnId) return;

    const studentRef = db.collection('users').doc(currentUser.uid)
                       .collection('classes').doc(currentClassId)
                       .collection('students').doc(studentId);

    const gradeKey = `grades.${columnId}`;

    try {
        await studentRef.update({
            [gradeKey]: score
        });
        console.log(`Đã lưu điểm cho HS ${studentId}, cột ${columnId}: ${score === firebase.firestore.FieldValue.delete() ? '(đã xóa)' : score}`);
        displayError(gradebookError, "");
    } catch (error) {
        console.error("Lỗi lưu điểm:", error);
        displayError(gradebookError, `Lỗi lưu điểm: ${error.message}`);
    }
}


// --- XỬ LÝ NÚT QUAY LẠI ---
backToDashboardButton.addEventListener('click', () => {
    if (unsubscribeStudents) unsubscribeStudents();
    if (unsubscribeGradeColumns) unsubscribeGradeColumns();
    unsubscribeStudents = null;
    unsubscribeGradeColumns = null;
    currentClassId = null;
    studentListUl.innerHTML = '';
    attendanceListUl.innerHTML = '';
    gradebookTableContainer.innerHTML = '';
    clearErrors();
    isFilteringAbsent = false;
    showView('dashboard-view');
});

// --- KHỞI CHẠY BAN ĐẦU ---
console.log("Ứng dụng đã sẵn sàng.");
