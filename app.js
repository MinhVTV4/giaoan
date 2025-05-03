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

// --- BIẾN TRẠNG THÁI ---
let currentUser = null;
let currentClassId = null;
let unsubscribeClasses = null;
let unsubscribeStudents = null;

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
}

function displayError(element, message) {
    if (element) {
        element.textContent = message;
    } else {
        console.error("Phần tử lỗi không tồn tại:", message);
    }
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
        loginForm.reset();
        registerForm.reset();
        showView('auth-view');
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    }
});

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
                const li = createClassListItem(doc.id, classData.name); // Gọi hàm tạo li
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

/**
 * Tạo một phần tử list item (li) cho lớp học.
 * @param {string} classId ID của lớp học
 * @param {string} className Tên của lớp học
 * @returns {HTMLLIElement} Phần tử li đã được tạo
 */
function createClassListItem(classId, className) {
    const li = document.createElement('li');
    li.dataset.id = classId;
    li.dataset.name = className;
    li.classList.add('class-item');

    // Container cho nội dung (tên hoặc form sửa)
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('item-content');

    // Span hiển thị tên lớp
    const nameSpan = document.createElement('span');
    nameSpan.textContent = className;
    nameSpan.classList.add('item-name');
    nameSpan.style.cursor = 'pointer';
    nameSpan.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!li.classList.contains('editing')) { // Chỉ xem chi tiết khi không đang sửa
             viewClassDetail(classId, className);
        }
    });
    contentDiv.appendChild(nameSpan);

    // Form sửa tên lớp (ẩn ban đầu)
    const editForm = document.createElement('form');
    editForm.classList.add('edit-form');
    editForm.style.display = 'none'; // Ẩn ban đầu

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
    cancelButton.type = 'button'; // Quan trọng: không phải submit
    cancelButton.textContent = 'Hủy';
    cancelButton.classList.add('btn', 'btn-secondary', 'btn-sm');
    cancelButton.addEventListener('click', () => {
        // Thoát chế độ chỉnh sửa
        li.classList.remove('editing');
        nameSpan.style.display = ''; // Hiện lại tên
        editForm.style.display = 'none'; // Ẩn form
        actionsDiv.style.display = ''; // Hiện lại nút Sửa/Xóa
    });
    editForm.appendChild(cancelButton);

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = editInput.value.trim();
        if (newName && newName !== className) {
            try {
                await updateClassName(classId, newName);
                // Tự động thoát chế độ sửa sau khi lưu thành công (onSnapshot sẽ cập nhật tên)
                cancelButton.click(); // Giả lập click nút hủy để reset UI
            } catch (error) {
                console.error("Lỗi cập nhật tên lớp:", error);
                alert(`Không thể cập nhật tên lớp: ${error.message}`);
            }
        } else if (newName === className) {
             // Nếu tên không đổi, chỉ cần thoát chế độ sửa
             cancelButton.click();
        } else {
            alert("Tên lớp không được để trống.");
        }
    });

    contentDiv.appendChild(editForm);
    li.appendChild(contentDiv);


    // Container cho các nút hành động (Sửa, Xóa)
    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('actions');

    // Nút Sửa
    const editButton = document.createElement('button');
    editButton.textContent = 'Sửa';
    editButton.classList.add('btn', 'btn-warning', 'btn-sm');
    editButton.addEventListener('click', (e) => {
        e.stopPropagation();
        // Vào chế độ chỉnh sửa
        li.classList.add('editing');
        nameSpan.style.display = 'none'; // Ẩn tên
        editForm.style.display = 'flex'; // Hiện form sửa
        actionsDiv.style.display = 'none'; // Ẩn nút Sửa/Xóa
        editInput.focus(); // Focus vào input
        editInput.select(); // Chọn toàn bộ text cũ
    });
    actionsDiv.appendChild(editButton);


    // Nút Xóa
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


/**
 * Cập nhật tên lớp học trong Firestore.
 * @param {string} classId ID của lớp học
 * @param {string} newName Tên mới
 */
async function updateClassName(classId, newName) {
    if (!currentUser || !classId || !newName) return;
    const classRef = db.collection('users').doc(currentUser.uid).collection('classes').doc(classId);
    try {
        await classRef.update({ name: newName });
        console.log(`Đã cập nhật tên lớp ${classId} thành "${newName}"`);
    } catch (error) {
        console.error("Lỗi cập nhật tên lớp:", error);
        throw error; // Ném lỗi ra để hàm gọi xử lý (ví dụ: hiển thị alert)
    }
}


async function deleteClass(classId, className) {
    if (!currentUser || !classId) return;
    const confirmation = confirm(`Bạn có chắc chắn muốn xóa lớp "${className}" không? Hành động này sẽ xóa cả lớp và TOÀN BỘ học sinh trong lớp đó và không thể hoàn tác.`);
    if (!confirmation) { console.log("Hủy bỏ thao tác xóa lớp."); return; }

    console.log(`Bắt đầu xóa lớp: ${className} (ID: ${classId})`);
    const classRef = db.collection('users').doc(currentUser.uid).collection('classes').doc(classId);
    const studentsRef = classRef.collection('students');

    try {
        const studentSnapshot = await studentsRef.get();
        if (!studentSnapshot.empty) {
            console.log(`Tìm thấy ${studentSnapshot.size} học sinh để xóa...`);
            const batch = db.batch();
            studentSnapshot.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log("Đã xóa xong học sinh.");
        } else {
            console.log("Không có học sinh nào trong lớp để xóa.");
        }
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
    clearErrors();
    showView('class-detail-view');
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
        if (snapshot.empty) {
            studentListUl.innerHTML = '<li class="loading-placeholder">Chưa có học sinh nào trong lớp này.</li>';
            return;
        }
        snapshot.forEach(doc => {
            const studentData = doc.data();
            const li = createStudentListItem(doc.id, studentData.name); // Gọi hàm tạo li
            studentListUl.appendChild(li);
        });
         console.log(`Đã tải và hiển thị danh sách học sinh cho lớp ${classId}.`);
    }, error => {
        console.error(`Lỗi tải danh sách học sinh cho lớp ${classId}: `, error);
        displayError(studentError, `Lỗi tải học sinh: ${error.message}`);
        studentListUl.innerHTML = '<li class="loading-placeholder">Có lỗi xảy ra khi tải danh sách học sinh.</li>';
    });
     console.log(`Bắt đầu lắng nghe danh sách học sinh cho lớp ${classId}.`);
}

/**
 * Tạo một phần tử list item (li) cho học sinh.
 * @param {string} studentId ID của học sinh
 * @param {string} studentName Tên của học sinh
 * @returns {HTMLLIElement} Phần tử li đã được tạo
 */
function createStudentListItem(studentId, studentName) {
    const li = document.createElement('li');
    li.dataset.id = studentId;

     // Container cho nội dung (tên hoặc form sửa)
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('item-content');

    // Span hiển thị tên học sinh
    const nameSpan = document.createElement('span');
    nameSpan.textContent = studentName;
    nameSpan.classList.add('item-name');
    contentDiv.appendChild(nameSpan);

     // Form sửa tên học sinh (ẩn ban đầu)
    const editForm = document.createElement('form');
    editForm.classList.add('edit-form');
    editForm.style.display = 'none'; // Ẩn ban đầu

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
    cancelButton.type = 'button'; // Quan trọng: không phải submit
    cancelButton.textContent = 'Hủy';
    cancelButton.classList.add('btn', 'btn-secondary', 'btn-sm');
    cancelButton.addEventListener('click', () => {
        // Thoát chế độ chỉnh sửa
        li.classList.remove('editing');
        nameSpan.style.display = ''; // Hiện lại tên
        editForm.style.display = 'none'; // Ẩn form
        actionsDiv.style.display = ''; // Hiện lại nút Sửa/Xóa
    });
    editForm.appendChild(cancelButton);

     editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = editInput.value.trim();
        if (newName && newName !== studentName) {
            try {
                await updateStudentName(studentId, newName);
                // Tự động thoát chế độ sửa sau khi lưu thành công (onSnapshot sẽ cập nhật tên)
                 cancelButton.click(); // Giả lập click nút hủy để reset UI
            } catch (error) {
                console.error("Lỗi cập nhật tên học sinh:", error);
                alert(`Không thể cập nhật tên học sinh: ${error.message}`);
            }
        } else if (newName === studentName) {
             // Nếu tên không đổi, chỉ cần thoát chế độ sửa
             cancelButton.click();
        } else {
            alert("Tên học sinh không được để trống.");
        }
    });

    contentDiv.appendChild(editForm);
    li.appendChild(contentDiv);


    // Container cho các nút hành động (Sửa, Xóa)
    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('actions');

    // Nút Sửa
    const editButton = document.createElement('button');
    editButton.textContent = 'Sửa';
    editButton.classList.add('btn', 'btn-warning', 'btn-sm');
    editButton.addEventListener('click', (e) => {
        e.stopPropagation();
         // Vào chế độ chỉnh sửa
        li.classList.add('editing');
        nameSpan.style.display = 'none'; // Ẩn tên
        editForm.style.display = 'flex'; // Hiện form sửa
        actionsDiv.style.display = 'none'; // Ẩn nút Sửa/Xóa
        editInput.focus(); // Focus vào input
        editInput.select(); // Chọn toàn bộ text cũ
    });
    actionsDiv.appendChild(editButton);

    // Nút Xóa
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Xóa';
    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteStudent(studentId, studentName); // Gọi hàm xóa học sinh
    });
    actionsDiv.appendChild(deleteButton);

    li.appendChild(actionsDiv);

    return li;
}

/**
 * Cập nhật tên học sinh trong Firestore.
 * @param {string} studentId ID của học sinh
 * @param {string} newName Tên mới
 */
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
        throw error; // Ném lỗi ra để hàm gọi xử lý
    }
}


/**
 * Hàm xóa một học sinh.
 * @param {string} studentId ID của học sinh cần xóa
 * @param {string} studentName Tên học sinh (để hiển thị xác nhận)
 */
async function deleteStudent(studentId, studentName) {
    if (!currentUser || !currentClassId || !studentId) return;

    const confirmation = confirm(`Bạn có chắc chắn muốn xóa học sinh "${studentName}" khỏi lớp này không?`);

    if (confirmation) {
        console.log(`Bắt đầu xóa học sinh: ${studentName} (ID: ${studentId})`);
        const studentRef = db.collection('users').doc(currentUser.uid)
                           .collection('classes').doc(currentClassId)
                           .collection('students').doc(studentId);
        try {
            await studentRef.delete();
            console.log(`Đã xóa thành công học sinh: ${studentName}`);
            // Giao diện sẽ tự cập nhật nhờ onSnapshot của loadStudents
        } catch (error) {
            console.error(`Lỗi khi xóa học sinh "${studentName}": `, error);
            displayError(studentError, `Không thể xóa học sinh "${studentName}": ${error.message}`);
            alert(`Đã xảy ra lỗi khi xóa học sinh "${studentName}". Vui lòng thử lại.`);
        }
    } else {
        console.log("Hủy bỏ thao tác xóa học sinh.");
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

backToDashboardButton.addEventListener('click', () => {
    if (unsubscribeStudents) unsubscribeStudents();
    unsubscribeStudents = null;
    currentClassId = null;
    studentListUl.innerHTML = '';
    clearErrors();
    showView('dashboard-view');
});

// --- KHỞI CHẠY BAN ĐẦU ---
console.log("Ứng dụng đã sẵn sàng.");
