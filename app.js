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
const filterAbsentButton = document.getElementById('filter-absent-button'); // Nút lọc MỚI
const attendanceInfo = document.getElementById('attendance-info'); // Dòng thông tin MỚI


// --- BIẾN TRẠNG THÁI ---
let currentUser = null;
let currentClassId = null;
let unsubscribeClasses = null;
let unsubscribeStudents = null;
let isFilteringAbsent = false; // Trạng thái lọc điểm danh MỚI

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
    attendanceInfo.textContent = ''; // Xóa cả thông tin điểm danh
}

function displayError(element, message) {
    if (element) {
        element.textContent = message;
    } else {
        console.error("Phần tử lỗi không tồn tại:", message);
    }
}

function displayInfo(element, message) { // Hàm hiển thị thông tin
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
        unsubscribeClasses = null;
        unsubscribeStudents = null;
        classListUl.innerHTML = '';
        studentListUl.innerHTML = '';
        attendanceListUl.innerHTML = '';
        loginForm.reset();
        registerForm.reset();
        showView('auth-view');
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        isFilteringAbsent = false; // Reset trạng thái lọc khi logout
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
    const confirmation = confirm(`Bạn có chắc chắn muốn xóa lớp "${className}" không? Hành động này sẽ xóa cả lớp và TOÀN BỘ học sinh, điểm danh trong lớp đó và không thể hoàn tác.`);
    if (!confirmation) { console.log("Hủy bỏ thao tác xóa lớp."); return; }

    console.log(`Bắt đầu xóa lớp: ${className} (ID: ${classId})`);
    const classRef = db.collection('users').doc(currentUser.uid).collection('classes').doc(classId);

    try {
        // Xóa subcollection 'students'
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
    clearErrors();
    showView('class-detail-view');

    initializeAttendance();
    loadStudents(classId);
}

function loadStudents(classId) {
    if (!currentUser || !classId) return;
    if (unsubscribeStudents) unsubscribeStudents();

    unsubscribeStudents = db.collection('users').doc(currentUser.uid)
                          .collection('classes').doc(classId)
                          .collection('students')
                          .orderBy('name', 'asc')
                          .onSnapshot(snapshot => {
        studentListUl.innerHTML = '';
        const students = [];
        if (snapshot.empty) {
            studentListUl.innerHTML = '<li class="loading-placeholder">Chưa có học sinh nào trong lớp này.</li>';
        } else {
             snapshot.forEach(doc => {
                const studentData = doc.data();
                students.push({ id: doc.id, name: studentData.name });
                const li = createStudentListItem(doc.id, studentData.name);
                studentListUl.appendChild(li);
            });
        }
        const selectedDate = attendanceDateInput.value || getCurrentDateString();
        loadAttendance(classId, selectedDate, students);

    }, error => {
        console.error(`Lỗi tải danh sách học sinh cho lớp ${classId}: `, error);
        displayError(studentError, `Lỗi tải học sinh: ${error.message}`);
        studentListUl.innerHTML = '<li class="loading-placeholder">Có lỗi xảy ra khi tải danh sách học sinh.</li>';
        attendanceListUl.innerHTML = '<li class="loading-placeholder">Lỗi tải danh sách học sinh, không thể điểm danh.</li>';
    });
}

function createStudentListItem(studentId, studentName) {
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
    } catch (error) {
        console.error("Lỗi cập nhật tên học sinh:", error);
        throw error;
    }
}

async function deleteStudent(studentId, studentName) {
    if (!currentUser || !currentClassId || !studentId) return;
    const confirmation = confirm(`Bạn có chắc chắn muốn xóa học sinh "${studentName}" khỏi lớp này không? Dữ liệu điểm danh của học sinh này cũng sẽ bị ảnh hưởng.`);
    if (!confirmation) { console.log("Hủy bỏ thao tác xóa học sinh."); return; }

    console.log(`Bắt đầu xóa học sinh: ${studentName} (ID: ${studentId})`);
    const studentRef = db.collection('users').doc(currentUser.uid)
                       .collection('classes').doc(currentClassId)
                       .collection('students').doc(studentId);
    try {
        await studentRef.delete();
        console.log(`Đã xóa thành công học sinh: ${studentName}`);
        // Cần cập nhật lại cả danh sách điểm danh nếu đang hiển thị
        const selectedDate = attendanceDateInput.value || getCurrentDateString();
        // Tải lại danh sách học sinh (đã loại bỏ em vừa xóa)
        const updatedStudentsSnapshot = await db.collection('users').doc(currentUser.uid)
                                            .collection('classes').doc(currentClassId)
                                            .collection('students')
                                            .orderBy('name', 'asc').get();
        const updatedStudents = updatedStudentsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
        // Tải lại điểm danh với danh sách học sinh mới
        loadAttendance(currentClassId, selectedDate, updatedStudents);

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
    // Gắn listener cho ô ngày
    attendanceDateInput.removeEventListener('change', handleDateChange);
    attendanceDateInput.addEventListener('change', handleDateChange);
    // Gắn listener cho nút lọc (MỚI)
    filterAbsentButton.removeEventListener('click', toggleAbsentFilter);
    filterAbsentButton.addEventListener('click', toggleAbsentFilter);
    // Reset trạng thái lọc khi vào lớp mới
    isFilteringAbsent = false;
    updateFilterButton(); // Cập nhật text nút lọc
    attendanceListUl.classList.remove('filtering-absent'); // Bỏ class lọc
}

function handleDateChange() {
    if (!currentClassId) return;
    const selectedDate = attendanceDateInput.value;
    if (selectedDate) {
        attendanceListUl.innerHTML = '<li class="loading-placeholder">Đang tải điểm danh...</li>';
         db.collection('users').doc(currentUser.uid)
           .collection('classes').doc(currentClassId)
           .collection('students')
           .orderBy('name', 'asc').get()
           .then(snapshot => {
               const students = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
               loadAttendance(currentClassId, selectedDate, students);
           })
           .catch(error => {
               console.error("Lỗi lấy lại danh sách học sinh khi đổi ngày:", error);
               displayError(attendanceError, `Lỗi tải lại học sinh: ${error.message}`);
               attendanceListUl.innerHTML = '<li class="loading-placeholder">Lỗi tải danh sách học sinh.</li>';
           });
    }
}

/**
 * Bật/tắt chế độ lọc chỉ hiển thị học sinh vắng mặt. (MỚI)
 */
function toggleAbsentFilter() {
    isFilteringAbsent = !isFilteringAbsent; // Đảo trạng thái lọc
    updateFilterButton(); // Cập nhật text nút
    applyAttendanceFilter(); // Áp dụng bộ lọc lên danh sách hiện tại
}

/**
 * Cập nhật text và trạng thái của nút lọc. (MỚI)
 */
function updateFilterButton() {
     if (isFilteringAbsent) {
        filterAbsentButton.textContent = 'Hiện tất cả HS';
        filterAbsentButton.classList.remove('btn-secondary');
        filterAbsentButton.classList.add('btn-info'); // Đổi màu nút khi đang lọc
    } else {
        filterAbsentButton.textContent = 'Chỉ hiện HS vắng';
        filterAbsentButton.classList.remove('btn-info');
        filterAbsentButton.classList.add('btn-secondary'); // Màu mặc định
    }
}

/**
 * Áp dụng/bỏ áp dụng bộ lọc lên danh sách điểm danh UL. (MỚI)
 */
function applyAttendanceFilter() {
     if (isFilteringAbsent) {
        attendanceListUl.classList.add('filtering-absent'); // Thêm class để CSS ẩn các mục không vắng
    } else {
        attendanceListUl.classList.remove('filtering-absent'); // Bỏ class để hiện tất cả
    }
    // Cập nhật lại thông tin số HS vắng
    updateAttendanceInfo();
}


/**
 * Cập nhật dòng thông tin số học sinh vắng. (MỚI)
 */
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
         attendanceInfo.textContent = ''; // Xóa thông tin nếu không có học sinh
    }
}


async function loadAttendance(classId, dateString, students) {
    if (!currentUser || !classId || !dateString || !students) {
         attendanceListUl.innerHTML = '<li class="loading-placeholder">Thiếu thông tin để tải điểm danh.</li>';
         return;
    }
    attendanceListUl.innerHTML = '';
    clearErrors(); // Xóa lỗi cũ, giữ lại info

    const attendanceDocRef = db.collection('users').doc(currentUser.uid)
                               .collection('classes').doc(classId)
                               .collection('attendance').doc(dateString);

    try {
        const attendanceDoc = await attendanceDocRef.get();
        const attendanceData = attendanceDoc.exists ? attendanceDoc.data() : { absentStudents: {} };
        const absentStudentsMap = attendanceData.absentStudents || {};

        if (students.length === 0) {
            attendanceListUl.innerHTML = '<li class="loading-placeholder">Chưa có học sinh trong lớp để điểm danh.</li>';
             updateAttendanceInfo(); // Cập nhật thông tin (sẽ là 0)
            return;
        }

        students.forEach(student => {
            const isAbsent = absentStudentsMap[student.id] === true;
            const li = createAttendanceListItem(student.id, student.name, isAbsent, dateString);
            attendanceListUl.appendChild(li);
        });
        applyAttendanceFilter(); // Áp dụng bộ lọc sau khi tải xong
        // updateAttendanceInfo(); // Cập nhật thông tin số HS vắng (đã gọi trong applyAttendanceFilter)

    } catch (error) {
        console.error(`Lỗi tải điểm danh ngày ${dateString}: `, error);
        displayError(attendanceError, `Lỗi tải điểm danh: ${error.message}`);
        attendanceListUl.innerHTML = '<li class="loading-placeholder">Có lỗi xảy ra khi tải điểm danh.</li>';
        attendanceInfo.textContent = ''; // Xóa thông tin khi có lỗi
    }
}

function createAttendanceListItem(studentId, studentName, isAbsent, dateString) {
    const li = document.createElement('li');
    li.dataset.id = studentId;
    li.textContent = studentName;
    li.classList.toggle('absent', isAbsent);

    li.addEventListener('click', () => {
        // Khi click, luôn tắt chế độ lọc để người dùng thấy sự thay đổi
        if (isFilteringAbsent) {
            toggleAbsentFilter(); // Tắt lọc trước khi toggle
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

    // Tìm phần tử li tương ứng để cập nhật UI tạm thời trước khi load lại
    const listItem = attendanceListUl.querySelector(`li[data-id="${studentId}"]`);
    if (listItem) {
        listItem.style.opacity = '0.5'; // Làm mờ đi trong khi chờ cập nhật
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
         // Tải lại danh sách học sinh và điểm danh để đảm bảo dữ liệu mới nhất
         const studentsSnapshot = await db.collection('users').doc(currentUser.uid)
                                         .collection('classes').doc(currentClassId)
                                         .collection('students')
                                         .orderBy('name', 'asc').get();
         const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
         loadAttendance(currentClassId, dateString, students); // Load lại sẽ tự cập nhật UI và info

    } catch (error) {
        console.error(`Lỗi cập nhật điểm danh cho HS ${studentId} ngày ${dateString}: `, error);
        displayError(attendanceError, `Lỗi cập nhật điểm danh: ${error.message}`);
        alert("Có lỗi xảy ra khi cập nhật điểm danh, vui lòng thử lại.");
         // Khôi phục giao diện nếu lỗi
         if (listItem) {
             listItem.style.opacity = '1';
             // Có thể cần load lại để chắc chắn trạng thái đúng
              const studentsSnapshot = await db.collection('users').doc(currentUser.uid)
                                         .collection('classes').doc(currentClassId)
                                         .collection('students')
                                         .orderBy('name', 'asc').get();
             const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
             loadAttendance(currentClassId, dateString, students);
         }
    }
}


// --- XỬ LÝ NÚT QUAY LẠI ---
backToDashboardButton.addEventListener('click', () => {
    if (unsubscribeStudents) unsubscribeStudents();
    unsubscribeStudents = null;
    currentClassId = null;
    studentListUl.innerHTML = '';
    attendanceListUl.innerHTML = '';
    clearErrors();
    isFilteringAbsent = false; // Reset trạng thái lọc khi thoát
    showView('dashboard-view');
});

// --- KHỞI CHẠY BAN ĐẦU ---
console.log("Ứng dụng đã sẵn sàng.");
