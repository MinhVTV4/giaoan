// app.js

// --- CẤU HÌNH FIREBASE ---
// Đã cập nhật với thông tin cấu hình của bạn
const firebaseConfig = {
  apiKey: "AIzaSyA2818INoMI_LNIi3kTilRMUQXZ9S6yJjE", // API Key của bạn
  authDomain: "giaoandientu-7782.firebaseapp.com", // Auth Domain của bạn
  projectId: "giaoandientu-7782", // Project ID của bạn
  storageBucket: "giaoandientu-7782.firebasestorage.app", // Storage Bucket của bạn (Lưu ý: Tên bucket thường không có 'firebasestorage.app' trong config, nhưng tôi giữ nguyên theo bạn cung cấp. Hãy kiểm tra lại nếu có lỗi)
  messagingSenderId: "585204135383", // Messaging Sender ID của bạn
  appId: "1:585204135383:web:78c7566be2083638290792", // App ID của bạn
  measurementId: "G-4F3MHQT43X" // Measurement ID của bạn (tùy chọn)
};

// --- KHỞI TẠO FIREBASE ---
// Sử dụng API tương thích (compat) như trong các file HTML đã nạp
try {
    firebase.initializeApp(firebaseConfig);
    // Không cần khởi tạo analytics ở đây nếu không dùng đến trong MVP này
    // và nếu bạn đang dùng SDK compat như trong HTML
    // Nếu muốn dùng Analytics với SDK mới (modular), cách import và sử dụng sẽ khác
} catch (e) {
    console.error("Lỗi khởi tạo Firebase:", e);
    alert("Không thể khởi tạo ứng dụng. Vui lòng kiểm tra cấu hình Firebase trong app.js và kết nối mạng.");
}
// Sử dụng API compat
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
let currentUser = null; // Lưu thông tin người dùng đang đăng nhập
let currentClassId = null; // Lưu ID của lớp đang được xem chi tiết
let unsubscribeClasses = null; // Hàm để dừng lắng nghe thay đổi danh sách lớp
let unsubscribeStudents = null; // Hàm để dừng lắng nghe thay đổi danh sách học sinh

// --- HÀM TIỆN ÍCH ---

/**
 * Hiển thị một view cụ thể và ẩn các view khác.
 * @param {string} viewId ID của view cần hiển thị ('auth-view', 'dashboard-view', 'class-detail-view')
 */
function showView(viewId) {
    allViews.forEach(view => view.style.display = 'none'); // Ẩn tất cả
    const activeView = document.getElementById(viewId);
    if (activeView) {
        activeView.style.display = 'block'; // Hiển thị view được chọn
        activeView.classList.add('active-view'); // (Thêm class active nếu cần cho CSS)
    } else {
        console.error("Không tìm thấy view với ID:", viewId);
    }
}

/**
 * Xóa các thông báo lỗi trên giao diện.
 */
function clearErrors() {
    authError.textContent = '';
    registerError.textContent = '';
    classError.textContent = '';
    studentError.textContent = '';
}

/**
 * Hiển thị thông báo lỗi cho một phần tử cụ thể.
 * @param {HTMLElement} element Phần tử HTML để hiển thị lỗi (ví dụ: authError, classError)
 * @param {string} message Nội dung lỗi
 */
function displayError(element, message) {
    if (element) {
        element.textContent = message;
    } else {
        console.error("Phần tử lỗi không tồn tại:", message);
    }
}

// --- QUẢN LÝ XÁC THỰC (AUTHENTICATION) ---

// Lắng nghe sự thay đổi trạng thái đăng nhập
auth.onAuthStateChanged(user => {
    clearErrors(); // Xóa lỗi cũ khi trạng thái thay đổi
    if (user) {
        // Người dùng đã đăng nhập
        currentUser = user;
        userEmailSpan.textContent = user.email; // Hiển thị email người dùng
        showView('dashboard-view'); // Chuyển đến màn hình chính
        loadClasses(); // Tải danh sách lớp học của người dùng này
    } else {
        // Người dùng đã đăng xuất hoặc chưa đăng nhập
        currentUser = null;
        // Dừng lắng nghe dữ liệu cũ để tránh lỗi và tốn tài nguyên
        if (unsubscribeClasses) unsubscribeClasses();
        if (unsubscribeStudents) unsubscribeStudents();
        unsubscribeClasses = null;
        unsubscribeStudents = null;

        // Reset giao diện
        classListUl.innerHTML = ''; // Xóa danh sách lớp cũ
        studentListUl.innerHTML = ''; // Xóa danh sách học sinh cũ
        loginForm.reset(); // Xóa dữ liệu form đăng nhập
        registerForm.reset(); // Xóa dữ liệu form đăng ký
        showView('auth-view'); // Chuyển về màn hình đăng nhập
        registerForm.style.display = 'none'; // Ẩn form đăng ký
        loginForm.style.display = 'block'; // Hiện form đăng nhập
    }
});

// Xử lý đăng nhập
loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Ngăn form gửi đi theo cách truyền thống
    clearErrors();
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Đăng nhập thành công, onAuthStateChanged sẽ xử lý chuyển màn hình
            console.log("Đăng nhập thành công:", userCredential.user);
        })
        .catch(error => {
            console.error("Lỗi đăng nhập:", error);
            displayError(authError, `Đăng nhập thất bại: ${mapAuthError(error.code)}`);
        });
});

// Xử lý đăng ký
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    const email = registerEmailInput.value;
    const password = registerPasswordInput.value;

    if (password.length < 6) {
        displayError(registerError, "Mật khẩu phải có ít nhất 6 ký tự.");
        return; // Dừng lại nếu mật khẩu không hợp lệ
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Đăng ký thành công, onAuthStateChanged sẽ tự động xử lý đăng nhập và chuyển màn hình
            console.log("Đăng ký thành công:", userCredential.user);
            // Không cần reset form ở đây vì onAuthStateChanged sẽ làm
        })
        .catch(error => {
            console.error("Lỗi đăng ký:", error);
            displayError(registerError, `Đăng ký thất bại: ${mapAuthError(error.code)}`);
        });
});

// Chuyển đổi giữa form đăng nhập và đăng ký
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

// Xử lý đăng xuất
logoutButton.addEventListener('click', () => {
    auth.signOut().catch(error => {
        console.error("Lỗi đăng xuất:", error);
        // Có thể hiển thị lỗi cho người dùng nếu cần
    });
});

// Hàm chuyển mã lỗi Firebase Auth sang tiếng Việt (có thể mở rộng thêm)
function mapAuthError(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Địa chỉ email không hợp lệ.';
        case 'auth/user-disabled':
            return 'Tài khoản này đã bị vô hiệu hóa.';
        case 'auth/user-not-found':
            return 'Không tìm thấy tài khoản với email này.';
        case 'auth/wrong-password':
            return 'Sai mật khẩu.';
        case 'auth/email-already-in-use':
            return 'Địa chỉ email này đã được sử dụng.';
        case 'auth/weak-password':
            return 'Mật khẩu quá yếu.';
        default:
            return 'Có lỗi xảy ra, vui lòng thử lại.';
    }
}


// --- QUẢN LÝ LỚP HỌC (FIRESTORE) ---

// Thêm lớp học mới
addClassForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    const className = classNameInput.value.trim(); // Lấy tên lớp và xóa khoảng trắng thừa

    if (!className) {
        displayError(classError, "Vui lòng nhập tên lớp học.");
        return;
    }
    if (!currentUser) {
        displayError(classError, "Bạn cần đăng nhập để thêm lớp.");
        return;
    }

    // Thêm dữ liệu vào Firestore
    // Cấu trúc: users -> {userId} -> classes -> {classId}
    db.collection('users').doc(currentUser.uid).collection('classes').add({
        name: className,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(), // Lưu thời gian tạo trên server
        ownerId: currentUser.uid // Lưu ID người tạo (để sau này phân quyền)
    })
    .then(() => {
        console.log("Đã thêm lớp:", className);
        classNameInput.value = ''; // Xóa nội dung input sau khi thêm thành công
    })
    .catch(error => {
        console.error("Lỗi thêm lớp học: ", error);
        displayError(classError, `Không thể thêm lớp: ${error.message}`);
    });
});

// Tải và hiển thị danh sách lớp học (sử dụng onSnapshot để cập nhật real-time)
function loadClasses() {
    if (!currentUser) return; // Chỉ tải khi đã đăng nhập

    // Dừng lắng nghe danh sách cũ (nếu có) trước khi bắt đầu lắng nghe mới
    // Quan trọng khi người dùng đăng xuất rồi đăng nhập lại bằng tài khoản khác
    if (unsubscribeClasses) {
        unsubscribeClasses();
        console.log("Đã dừng lắng nghe danh sách lớp cũ.");
    }

    // Bắt đầu lắng nghe thay đổi trong collection 'classes' của user hiện tại
    unsubscribeClasses = db.collection('users').doc(currentUser.uid).collection('classes')
        .orderBy('createdAt', 'desc') // Sắp xếp lớp mới nhất lên đầu
        .onSnapshot(snapshot => {
            classListUl.innerHTML = ''; // Xóa danh sách cũ trên UI trước khi render mới
            if (snapshot.empty) {
                classListUl.innerHTML = '<li class="loading-placeholder">Chưa có lớp học nào. Hãy thêm lớp mới!</li>';
                return;
            }
            // Lặp qua từng document (lớp học) trong snapshot
            snapshot.forEach(doc => {
                const classData = doc.data();
                const li = document.createElement('li');
                // Tạo span chứa tên lớp để click vào xem chi tiết
                const nameSpan = document.createElement('span');
                nameSpan.textContent = classData.name;
                nameSpan.style.cursor = 'pointer'; // Đổi con trỏ khi di chuột vào tên
                nameSpan.style.flexGrow = '1'; // Cho phép tên lớp chiếm không gian
                nameSpan.style.marginRight = '10px'; // Khoảng cách với nút xóa
                nameSpan.addEventListener('click', (e) => {
                    // Ngăn sự kiện click lan ra thẻ li (nếu có)
                    e.stopPropagation();
                    viewClassDetail(doc.id, classData.name);
                });
                li.appendChild(nameSpan);

                li.dataset.id = doc.id; // Lưu ID của lớp vào thuộc tính data-id để dùng sau
                li.dataset.name = classData.name; // Lưu tên lớp để dùng khi chuyển view
                li.classList.add('class-item'); // Thêm class để dễ dàng style

                classListUl.appendChild(li); // Thêm mục lớp học vào danh sách trên UI
            });
            console.log("Đã tải và hiển thị danh sách lớp.");
        }, error => {
            // Xử lý lỗi khi lắng nghe
            console.error("Lỗi tải danh sách lớp: ", error);
            displayError(classError, `Lỗi tải lớp: ${error.message}`);
            classListUl.innerHTML = '<li class="loading-placeholder">Có lỗi xảy ra khi tải danh sách lớp.</li>';
        });
        console.log("Bắt đầu lắng nghe danh sách lớp.");
}

// --- QUẢN LÝ HỌC SINH (FIRESTORE) ---

/**
 * Chuyển sang màn hình chi tiết lớp học và tải danh sách học sinh.
 * @param {string} classId ID của lớp học cần xem
 * @param {string} className Tên của lớp học
 */
function viewClassDetail(classId, className) {
    if (!classId || !className) {
        console.error("Thiếu thông tin lớp để xem chi tiết.");
        return;
    }
    currentClassId = classId; // Lưu lại ID lớp đang xem
    detailClassNameH1.textContent = `Lớp: ${className}`; // Hiển thị tên lớp trên tiêu đề
    studentListUl.innerHTML = '<li class="loading-placeholder">Đang tải danh sách học sinh...</li>'; // Hiển thị trạng thái tải
    showView('class-detail-view'); // Chuyển sang màn hình chi tiết
    loadStudents(classId); // Bắt đầu tải danh sách học sinh cho lớp này
}

// Tải và hiển thị danh sách học sinh cho một lớp cụ thể (real-time)
function loadStudents(classId) {
    if (!currentUser || !classId) return;

    // Dừng lắng nghe danh sách học sinh của lớp cũ (nếu có)
    if (unsubscribeStudents) {
        unsubscribeStudents();
        console.log("Đã dừng lắng nghe danh sách học sinh cũ.");
    }

    // Bắt đầu lắng nghe collection 'students' bên trong document của lớp học hiện tại
    // Cấu trúc: users -> {userId} -> classes -> {classId} -> students -> {studentId}
    unsubscribeStudents = db.collection('users').doc(currentUser.uid)
                          .collection('classes').doc(classId)
                          .collection('students')
                          .orderBy('name', 'asc') // Sắp xếp học sinh theo tên A-Z
                          .onSnapshot(snapshot => {
        studentListUl.innerHTML = ''; // Xóa danh sách cũ
        if (snapshot.empty) {
            studentListUl.innerHTML = '<li class="loading-placeholder">Chưa có học sinh nào trong lớp này.</li>';
            return;
        }
        snapshot.forEach(doc => {
            const studentData = doc.data();
            const li = document.createElement('li');
            // Tạo span chứa tên học sinh
            const nameSpan = document.createElement('span');
            nameSpan.textContent = studentData.name;
            nameSpan.style.flexGrow = '1'; // Cho phép tên chiếm không gian
            nameSpan.style.marginRight = '10px'; // Khoảng cách với nút xóa
            li.appendChild(nameSpan);

            li.dataset.id = doc.id; // Lưu ID học sinh (có thể dùng để sửa/xóa sau này)

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


// Thêm học sinh mới vào lớp hiện tại đang xem
addStudentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    const studentName = studentNameInput.value.trim();

    if (!studentName) {
         displayError(studentError, "Vui lòng nhập tên học sinh.");
        return;
    }
    if (!currentUser || !currentClassId) {
         displayError(studentError, "Không xác định được người dùng hoặc lớp học hiện tại.");
        return;
    }

    // Thêm học sinh vào subcollection 'students' của lớp hiện tại
    db.collection('users').doc(currentUser.uid)
      .collection('classes').doc(currentClassId)
      .collection('students').add({
        name: studentName,
        addedAt: firebase.firestore.FieldValue.serverTimestamp() // Lưu thời gian thêm
    })
    .then(() => {
        console.log(`Đã thêm học sinh "${studentName}" vào lớp ${currentClassId}`);
        studentNameInput.value = ''; // Xóa input sau khi thêm
    })
    .catch(error => {
        console.error("Lỗi thêm học sinh: ", error);
        displayError(studentError, `Không thể thêm học sinh: ${error.message}`);
    });
});

// Xử lý nút quay lại Bảng điều khiển từ màn hình chi tiết lớp
backToDashboardButton.addEventListener('click', () => {
    // Dừng lắng nghe danh sách học sinh của lớp vừa xem để tiết kiệm tài nguyên
    if (unsubscribeStudents) {
        unsubscribeStudents();
        console.log("Đã dừng lắng nghe danh sách học sinh khi quay lại dashboard.");
    }
    unsubscribeStudents = null;
    currentClassId = null; // Reset ID lớp đang xem
    studentListUl.innerHTML = ''; // Xóa danh sách học sinh cũ trên UI
    clearErrors(); // Xóa các lỗi có thể còn sót lại
    showView('dashboard-view'); // Chuyển về màn hình dashboard
});

// --- KHỞI CHẠY BAN ĐẦU ---
// Khi trang tải xong, hàm onAuthStateChanged sẽ tự động kiểm tra
// trạng thái đăng nhập và hiển thị view phù hợp.
console.log("Ứng dụng đã sẵn sàng.");
