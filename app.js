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

// Attendance Elements (MỚI)
const attendanceSection = document.getElementById('attendance-section');
const attendanceDateInput = document.getElementById('attendance-date');
const attendanceListUl = document.getElementById('attendance-list');
const attendanceError = document.getElementById('attendance-error');


// --- BIẾN TRẠNG THÁI ---
let currentUser = null;
let currentClassId = null;
let unsubscribeClasses = null;
let unsubscribeStudents = null;
// Không cần listener real-time cho attendance trong phiên bản này
// let unsubscribeAttendance = null;

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
    attendanceError.textContent = ''; // Thêm xóa lỗi điểm danh
}

function displayError(element, message) {
    if (element) {
        element.textContent = message;
    } else {
        console.error("Phần tử lỗi không tồn tại:", message);
    }
}

/**
 * Lấy ngày hiện tại dưới dạng chuỗi 'YYYY-MM-DD'.
 * @returns {string} Chuỗi ngày tháng năm.
 */
function getCurrentDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
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
        // if (unsubscribeAttendance) unsubscribeAttendance(); // Nếu có listener real-time
        unsubscribeClasses = null;
        unsubscribeStudents = null;
        // unsubscribeAttendance = null;
        classListUl.innerHTML = '';
        studentListUl.innerHTML = '';
        attendanceListUl.innerHTML = ''; // Xóa danh sách điểm danh khi logout
        loginForm.reset();
        registerForm.reset();
        showView('auth-view');
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    }
});

// (Các hàm xử lý đăng nhập, đăng ký, logout, mapAuthError giữ nguyên như trước)
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("Đăng nhập thành công:", userCredential.user);
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
            console.log("Đăng ký thành công:", userCredential.user);
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
            console.log("Đã tải và hiển thị danh sách lớp.");
        }, error => {
            console.error("Lỗi tải danh sách lớp: ", error);
            displayError(classError, `Lỗi tải lớp: ${error.message}`);
            classListUl.innerHTML = '<li class="loading-placeholder">Có lỗi xảy ra khi tải danh sách lớp.</li>';
        });
    console.log("Bắt đầu lắng nghe danh sách lớp.");
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

        // Xóa subcollection 'attendance' (MỚI)
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
    attendanceListUl.innerHTML = '<li class="loading-placeholder">Chọn ngày để xem điểm danh...</li>'; // Reset điểm danh
    clearErrors();
    showView('class-detail-view');

    // Khởi tạo và xử lý điểm danh TRƯỚC khi gọi loadStudents
    initializeAttendance(); // Đảm bảo ngày được đặt và listener được gắn

    loadStudents(classId); // Tải danh sách học sinh (sẽ gọi loadAttendance sau)
}

function loadStudents(classId) {
    if (!currentUser || !classId) return;
    if (unsubscribeStudents) unsubscribeStudents();
    console.log("[DEBUG] Bắt đầu loadStudents cho lớp:", classId); // DEBUG LOG

    unsubscribeStudents = db.collection('users').doc(currentUser.uid)
                          .collection('classes').doc(classId)
                          .collection('students')
                          .orderBy('name', 'asc')
                          .onSnapshot(snapshot => {
        console.log("[DEBUG] Nhận snapshot học sinh:", snapshot.size, "học sinh"); // DEBUG LOG
        studentListUl.innerHTML = ''; // Xóa list quản lý học sinh
        // Lưu danh sách học sinh để dùng cho điểm danh
        const students = [];
        if (snapshot.empty) {
            studentListUl.innerHTML = '<li class="loading-placeholder">Chưa có học sinh nào trong lớp này.</li>';
        } else {
             snapshot.forEach(doc => {
                const studentData = doc.data();
                students.push({ id: doc.id, name: studentData.name }); // Lưu id và tên
                const li = createStudentListItem(doc.id, studentData.name);
                studentListUl.appendChild(li);
            });
        }
        // Sau khi tải xong danh sách học sinh, tải điểm danh cho ngày hiện tại (hoặc ngày đang chọn)
        const selectedDate = attendanceDateInput.value || getCurrentDateString();
        console.log("[DEBUG] Gọi loadAttendance từ loadStudents với ngày:", selectedDate, "và", students.length, "học sinh"); // DEBUG LOG
        loadAttendance(classId, selectedDate, students); // Truyền danh sách học sinh vào

        console.log(`Đã tải và hiển thị danh sách học sinh cho lớp ${classId}.`);
    }, error => {
        console.error(`Lỗi tải danh sách học sinh cho lớp ${classId}: `, error); // DEBUG LOG
        displayError(studentError, `Lỗi tải học sinh: ${error.message}`);
        studentListUl.innerHTML = '<li class="loading-placeholder">Có lỗi xảy ra khi tải danh sách học sinh.</li>';
        attendanceListUl.innerHTML = '<li class="loading-placeholder">Lỗi tải danh sách học sinh, không thể điểm danh.</li>'; // Cập nhật list điểm danh
    });
     console.log(`Bắt đầu lắng nghe danh sách học sinh cho lớp ${classId}.`);
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
        // Không cần load lại attendance ở đây vì onSnapshot của loadStudents sẽ làm
    })
    .catch(error => {
        console.error("Lỗi thêm học sinh: ", error);
        displayError(studentError, `Không thể thêm học sinh: ${error.message}`);
    });
});

// --- QUẢN LÝ ĐIỂM DANH (MỚI) ---

/**
 * Khởi tạo phần điểm danh: đặt ngày mặc định và thêm event listener.
 */
function initializeAttendance() {
    console.log("[DEBUG] Khởi tạo điểm danh"); // DEBUG LOG
    attendanceDateInput.value = getCurrentDateString(); // Đặt ngày hiện tại làm mặc định
    // Xóa event listener cũ nếu có để tránh bị gọi nhiều lần
    attendanceDateInput.removeEventListener('change', handleDateChange);
    // Thêm event listener mới
    attendanceDateInput.addEventListener('change', handleDateChange);
    // Tải điểm danh cho ngày mặc định (sẽ được gọi trong loadStudents)
}

/**
 * Xử lý sự kiện khi ngày điểm danh thay đổi.
 */
function handleDateChange() {
    if (!currentClassId) return;
    const selectedDate = attendanceDateInput.value;
    if (selectedDate) {
        console.log("[DEBUG] Ngày điểm danh thay đổi:", selectedDate); // DEBUG LOG
        attendanceListUl.innerHTML = '<li class="loading-placeholder">Đang tải điểm danh...</li>';
         // Cần lấy lại danh sách học sinh hiện tại để truyền vào loadAttendance
         db.collection('users').doc(currentUser.uid)
           .collection('classes').doc(currentClassId)
           .collection('students')
           .orderBy('name', 'asc').get()
           .then(snapshot => {
               const students = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
               console.log("[DEBUG] Lấy lại học sinh khi đổi ngày:", students.length, "học sinh"); // DEBUG LOG
               loadAttendance(currentClassId, selectedDate, students);
           })
           .catch(error => {
               console.error("Lỗi lấy lại danh sách học sinh khi đổi ngày:", error); // DEBUG LOG
               displayError(attendanceError, `Lỗi tải lại học sinh: ${error.message}`);
               attendanceListUl.innerHTML = '<li class="loading-placeholder">Lỗi tải danh sách học sinh.</li>';
           });

    }
}

/**
 * Tải và hiển thị danh sách điểm danh cho một ngày cụ thể.
 * @param {string} classId ID của lớp học
 * @param {string} dateString Ngày điểm danh (YYYY-MM-DD)
 * @param {Array<{id: string, name: string}>} students Danh sách học sinh của lớp
 */
async function loadAttendance(classId, dateString, students) {
    if (!currentUser || !classId || !dateString || !students) {
         console.warn("[DEBUG] Thiếu thông tin để tải điểm danh:", { classId, dateString, students }); // DEBUG LOG
         attendanceListUl.innerHTML = '<li class="loading-placeholder">Thiếu thông tin để tải điểm danh.</li>';
         return;
    }
    console.log(`[DEBUG] Bắt đầu loadAttendance cho lớp ${classId}, ngày ${dateString}`); // DEBUG LOG
    attendanceListUl.innerHTML = ''; // Xóa danh sách cũ
    clearErrors(); // Xóa lỗi cũ

    // Lấy dữ liệu điểm danh cho ngày này
    const attendanceDocRef = db.collection('users').doc(currentUser.uid)
                               .collection('classes').doc(classId)
                               .collection('attendance').doc(dateString);

    try {
        const attendanceDoc = await attendanceDocRef.get();
        console.log(`[DEBUG] Attendance doc exists for ${dateString}?`, attendanceDoc.exists); // DEBUG LOG
        const attendanceData = attendanceDoc.exists ? attendanceDoc.data() : { absentStudents: {} };
        const absentStudentsMap = attendanceData.absentStudents || {};
        console.log(`[DEBUG] Absent students map for ${dateString}:`, absentStudentsMap); // DEBUG LOG

        if (students.length === 0) {
            attendanceListUl.innerHTML = '<li class="loading-placeholder">Chưa có học sinh trong lớp để điểm danh.</li>';
            return;
        }
        console.log(`[DEBUG] Rendering attendance for ${students.length} students`); // DEBUG LOG

        // Hiển thị danh sách học sinh với trạng thái điểm danh
        students.forEach(student => {
            const isAbsent = absentStudentsMap[student.id] === true;
            // console.log(`[DEBUG] Student: ${student.name}, ID: ${student.id}, isAbsent: ${isAbsent}`); // DEBUG LOG (có thể quá nhiều)
            const li = createAttendanceListItem(student.id, student.name, isAbsent, dateString);
            attendanceListUl.appendChild(li); // Append the created li
        });
         console.log("[DEBUG] Đã hiển thị xong danh sách điểm danh."); // DEBUG LOG

    } catch (error) {
        console.error(`Lỗi tải điểm danh ngày ${dateString}: `, error); // DEBUG LOG
        displayError(attendanceError, `Lỗi tải điểm danh: ${error.message}`);
        attendanceListUl.innerHTML = '<li class="loading-placeholder">Có lỗi xảy ra khi tải điểm danh.</li>';
    }
}

/**
 * Tạo một phần tử list item (li) cho danh sách điểm danh.
 * @param {string} studentId ID học sinh
 * @param {string} studentName Tên học sinh
 * @param {boolean} isAbsent Trạng thái vắng mặt
 * @param {string} dateString Ngày điểm danh (YYYY-MM-DD)
 * @returns {HTMLLIElement} Phần tử li đã được tạo
 */
function createAttendanceListItem(studentId, studentName, isAbsent, dateString) {
    const li = document.createElement('li');
    li.dataset.id = studentId;
    li.textContent = studentName;
    li.classList.toggle('absent', isAbsent); // Thêm class 'absent' nếu vắng

    li.addEventListener('click', () => {
        toggleAttendance(studentId, isAbsent, dateString); // Gọi hàm xử lý khi click
    });

    return li;
}

/**
 * Thay đổi trạng thái điểm danh (vắng/có mặt) cho học sinh.
 * @param {string} studentId ID học sinh
 * @param {boolean} wasAbsent Trạng thái vắng mặt hiện tại
 * @param {string} dateString Ngày điểm danh (YYYY-MM-DD)
 */
async function toggleAttendance(studentId, wasAbsent, dateString) {
    if (!currentUser || !currentClassId || !studentId || !dateString) return;

    console.log(`[DEBUG] Toggle attendance for HS ${studentId} on ${dateString}. Was absent: ${wasAbsent}`); // DEBUG LOG
    const attendanceDocRef = db.collection('users').doc(currentUser.uid)
                               .collection('classes').doc(currentClassId)
                               .collection('attendance').doc(dateString);

    const studentKey = `absentStudents.${studentId}`; // Key để cập nhật trong map

    try {
        if (wasAbsent) {
            // Nếu đang vắng -> chuyển thành có mặt (xóa khỏi map)
            await attendanceDocRef.update({
                [studentKey]: firebase.firestore.FieldValue.delete() // Xóa field trong map
            });
            console.log(`[DEBUG] Đã điểm danh CÓ MẶT cho HS ${studentId} ngày ${dateString}`);
        } else {
            // Nếu đang có mặt -> chuyển thành vắng (thêm vào map)
            // Sử dụng set với merge:true để tạo document nếu chưa có, hoặc cập nhật nếu đã có
            await attendanceDocRef.set({
                absentStudents: {
                    [studentId]: true // Đánh dấu là vắng
                }
            }, { merge: true }); // Merge để không ghi đè các học sinh vắng khác
            console.log(`[DEBUG] Đã điểm danh VẮNG MẶT cho HS ${studentId} ngày ${dateString}`);
        }
        // Tải lại giao diện điểm danh để cập nhật trạng thái
         // Cần lấy lại danh sách học sinh hiện tại
         const studentsSnapshot = await db.collection('users').doc(currentUser.uid)
                                         .collection('classes').doc(currentClassId)
                                         .collection('students')
                                         .orderBy('name', 'asc').get();
         const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
         console.log("[DEBUG] Gọi lại loadAttendance sau khi toggle."); // DEBUG LOG
         loadAttendance(currentClassId, dateString, students);

    } catch (error) {
        console.error(`Lỗi cập nhật điểm danh cho HS ${studentId} ngày ${dateString}: `, error); // DEBUG LOG
        displayError(attendanceError, `Lỗi cập nhật điểm danh: ${error.message}`);
        alert("Có lỗi xảy ra khi cập nhật điểm danh, vui lòng thử lại.");
    }
}


// --- XỬ LÝ NÚT QUAY LẠI ---
backToDashboardButton.addEventListener('click', () => {
    if (unsubscribeStudents) unsubscribeStudents();
    // Không cần unsubscribe attendance vì không dùng listener real-time
    // if (unsubscribeAttendance) unsubscribeAttendance();
    unsubscribeStudents = null;
    // unsubscribeAttendance = null;
    currentClassId = null;
    studentListUl.innerHTML = '';
    attendanceListUl.innerHTML = ''; // Xóa list điểm danh khi quay lại
    clearErrors();
    showView('dashboard-view');
});

// --- KHỞI CHẠY BAN ĐẦU ---
console.log("Ứng dụng đã sẵn sàng.");
