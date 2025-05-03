/* style.css */

/* Thiết lập cơ bản và font chữ */
body {
    font-family: 'Inter', sans-serif; /* Sử dụng font Inter */
    margin: 0;
    padding: 0;
    background-color: #f0f2f5; /* Màu nền xám nhạt */
    color: #333;
    line-height: 1.6;
}

.container {
    max-width: 900px; /* Giới hạn chiều rộng tối đa */
    margin: 30px auto; /* Căn giữa container */
    padding: 20px;
}

/* Kiểu cho các thẻ Card (chứa các view) */
.card {
    background-color: #ffffff; /* Nền trắng */
    padding: 25px 30px;
    margin-bottom: 20px;
    border-radius: 8px; /* Bo góc */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08); /* Đổ bóng nhẹ */
    border: 1px solid #e0e0e0; /* Viền mờ */
}

/* Kiểu cho các View (màn hình) */
.view {
    display: none; /* Ẩn tất cả các view ban đầu */
}

.active-view {
    display: block; /* Chỉ hiển thị view đang hoạt động */
}

.view-title {
    color: #1a237e; /* Màu xanh đậm cho tiêu đề chính */
    margin-top: 0;
    margin-bottom: 20px;
    font-weight: 600;
}

.section-title {
    color: #3949ab; /* Màu xanh nhạt hơn cho tiêu đề phụ */
    margin-top: 25px;
    margin-bottom: 15px;
    font-weight: 500;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 5px;
}

/* Kiểu cho Form */
.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #555;
}

input[type="text"],
input[type="email"],
input[type="password"],
input[type="date"],
input[type="number"] { /* Thêm input number */
    width: 100%; /* Chiếm toàn bộ chiều rộng */
    padding: 12px 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box; /* Tính cả padding và border vào width */
    font-size: 1rem;
    transition: border-color 0.2s ease-in-out;
    /* Đảm bảo font chữ kế thừa */
    font-family: inherit;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus,
input[type="date"]:focus,
input[type="number"]:focus { /* Thêm input number */
    border-color: #007bff; /* Đổi màu viền khi focus */
    outline: none; /* Bỏ viền focus mặc định */
}

/* Kiểu riêng cho input điểm trong bảng */
.grade-input {
    padding: 6px 8px; /* Giảm padding */
    font-size: 0.95rem; /* Giảm cỡ chữ */
    text-align: center; /* Căn giữa điểm */
    max-width: 70px; /* Giới hạn chiều rộng ô điểm */
    /* Loại bỏ mũi tên lên xuống của input number (tuỳ trình duyệt) */
    -moz-appearance: textfield;
}
.grade-input::-webkit-outer-spin-button,
.grade-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}


/* Kiểu cho các nút bấm */
.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    text-align: center;
    transition: background-color 0.2s ease, box-shadow 0.2s ease;
    margin-right: 8px;
    margin-bottom: 8px; /* Thêm khoảng cách dưới cho nút */
    /* Thêm thuộc tính để các nút trên cùng dòng căn chỉnh tốt hơn */
    vertical-align: middle;
    line-height: 1.5; /* Đảm bảo chiều cao ổn định */
}

.btn-primary {
    background-color: #007bff; /* Xanh dương */
    color: white;
}

.btn-primary:hover {
    background-color: #0056b3;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-secondary {
    background-color: #6c757d; /* Xám */
    color: white;
}

.btn-secondary:hover {
    background-color: #5a6268;
}

.btn-success {
    background-color: #28a745; /* Xanh lá */
    color: white;
}

.btn-success:hover {
    background-color: #218838;
}

/* Thêm kiểu cho nút xóa */
.btn-danger {
    background-color: #dc3545; /* Màu đỏ */
    color: white;
}

.btn-danger:hover {
    background-color: #c82333;
}

/* Thêm kiểu cho nút sửa */
.btn-warning {
    background-color: #ffc107; /* Màu vàng */
    color: #212529; /* Màu chữ tối */
}

.btn-warning:hover {
    background-color: #e0a800;
}

/* Thêm kiểu cho nút info (dùng cho nút lọc) */
.btn-info {
    background-color: #17a2b8; /* Xanh lam */
    color: white;
}

.btn-info:hover {
    background-color: #117a8b;
}


.btn-sm {
    padding: 5px 10px; /* Giảm padding cho nút nhỏ */
    font-size: 0.875rem; /* Giảm cỡ chữ */
    line-height: 1.4; /* Điều chỉnh line-height cho phù hợp */
    margin-left: 5px; /* Thêm khoảng cách trái */
}

.btn-link {
    background: none;
    border: none;
    color: #007bff;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
    font-size: 0.9em;
}

.btn-link:hover {
    color: #0056b3;
}

/* Form nằm trên một hàng */
.inline-form {
    display: flex;
    align-items: center; /* Căn giữa các item theo chiều dọc */
    gap: 10px; /* Khoảng cách giữa các phần tử */
    margin-bottom: 15px;
    flex-wrap: wrap; /* Cho phép xuống dòng nếu không đủ chỗ */
}

.inline-form input[type="text"] {
    flex-grow: 1; /* Cho phép input chiếm không gian còn lại */
    margin-bottom: 0; /* Bỏ margin dưới khi nằm trên hàng */
    min-width: 150px; /* Đặt chiều rộng tối thiểu */
}

.inline-form button {
     flex-shrink: 0; /* Ngăn nút bị co lại */
}

/* Thông báo lỗi và thông tin */
.error-message {
    color: #dc3545; /* Màu đỏ */
    font-size: 0.9em;
    margin-top: 5px;
    min-height: 1.2em; /* Đảm bảo có không gian ngay cả khi không có lỗi */
}
.info-message { /* Kiểu cho dòng thông tin */
    color: #17a2b8; /* Màu xanh lam */
    font-size: 0.9em;
    margin-top: -5px; /* Kéo lên gần hơn */
    margin-bottom: 10px;
    min-height: 1.2em;
}

/* Header của các view */
.header {
    display: flex;
    justify-content: space-between; /* Đẩy các phần tử ra hai bên */
    align-items: center; /* Căn giữa theo chiều dọc */
    margin-bottom: 15px;
    flex-wrap: wrap; /* Cho phép xuống dòng trên màn hình nhỏ */
    gap: 10px; /* Thêm khoảng cách giữa các phần tử header */
}

.user-info {
    font-size: 0.95em;
    color: #555;
    display: flex;
    align-items: center;
    gap: 10px; /* Khoảng cách giữa text và nút logout */
    flex-shrink: 0; /* Ngăn co lại */
}

/* Danh sách */
.item-list {
    list-style: none;
    padding: 0;
    margin-top: 15px;
}

.item-list li {
    background-color: #f8f9fa; /* Màu nền nhạt cho item */
    padding: 12px 15px;
    margin-bottom: 8px;
    border-radius: 5px;
    border: 1px solid #e9ecef;
    display: flex; /* Sử dụng flexbox để căn chỉnh tên và nút */
    justify-content: space-between; /* Đẩy tên và nút ra hai bên */
    align-items: center; /* Căn giữa theo chiều dọc */
    transition: background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease; /* Thêm opacity */
    min-height: 40px; /* Đảm bảo chiều cao tối thiểu ổn định khi sửa inline */
}

.item-list li .item-content { /* Container cho tên hoặc form sửa */
    flex-grow: 1; /* Chiếm không gian */
    margin-right: 10px; /* Khoảng cách với nút */
    display: flex; /* Dùng flex để chứa tên hoặc form sửa */
    align-items: center;
}


.item-list li .item-name { /* Kiểu cho tên hiển thị bình thường */
    flex-grow: 1; /* Cho phép tên chiếm không gian */
    overflow: hidden; /* Ẩn phần tên quá dài */
    text-overflow: ellipsis; /* Hiển thị dấu ... nếu tên quá dài */
    white-space: nowrap; /* Ngăn tên xuống dòng */
    display: inline-block; /* Để hoạt động đúng với flex */
}

.item-list li.class-item .item-name { /* Thêm class riêng cho item lớp để có thể click */
     cursor: pointer;
}

.item-list li.class-item:hover {
     background-color: #e9ecef; /* Đổi màu nền khi hover */
}

.item-list li .actions { /* Container cho các nút hành động */
    flex-shrink: 0; /* Ngăn container nút bị co lại */
    display: flex;
    gap: 5px; /* Khoảng cách giữa các nút */
}

.item-list li .edit-form { /* Kiểu cho form sửa inline */
    display: none; /* Ẩn ban đầu */
    flex-grow: 1;
    display: flex;
    align-items: center;
    gap: 5px;
}

.item-list li .edit-form input[type="text"] {
    flex-grow: 1;
    padding: 5px 8px; /* Giảm padding cho input inline */
    font-size: 0.95rem; /* Giảm cỡ chữ chút */
    margin-bottom: 0; /* Bỏ margin dưới */
}

.item-list li.editing .item-content .item-name {
    display: none; /* Ẩn tên khi đang sửa */
}
.item-list li.editing .item-content .edit-form {
    display: flex; /* Hiện form sửa khi đang sửa */
}
.item-list li.editing .actions {
    display: none; /* Ẩn nút Sửa/Xóa khi đang sửa */
}



.loading-placeholder {
    color: #6c757d;
    font-style: italic;
    text-align: center;
    padding: 20px;
}

hr {
    border: 0;
    border-top: 1px solid #e0e0e0;
    margin: 25px 0;
}

/* --- Kiểu cho Phần Điểm danh --- */
.attendance-controls {
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap; /* Cho phép xuống dòng */
}

.attendance-controls label {
    font-weight: 500;
    color: #555;
    flex-shrink: 0; /* Không co lại */
}

.attendance-controls input[type="date"] {
    width: auto; /* Cho phép chiều rộng tự động */
    flex-grow: 1; /* Chiếm không gian còn lại */
    max-width: 200px; /* Giới hạn chiều rộng tối đa */
}

.attendance-controls button { /* Kiểu cho nút lọc */
     flex-shrink: 0; /* Không co lại */
     margin-left: auto; /* Đẩy nút sang phải nếu đủ chỗ */
}

.attendance-list li {
    cursor: pointer; /* Cho phép click để điểm danh */
    /* Hiệu ứng chuyển đổi mượt mà hơn */
    transition: background-color 0.2s ease, border-left 0.2s ease, opacity 0.2s ease, display 0.3s ease; /* Thêm display */
    border-left: 5px solid transparent; /* Viền trái để chỉ trạng thái */
}

.attendance-list li:hover {
    background-color: #e9ecef;
}

.attendance-list li.absent {
    background-color: #f8d7da; /* Nền đỏ nhạt cho học sinh vắng */
    border-left-color: #dc3545; /* Viền trái màu đỏ */
    /* opacity: 0.7; */ /* Có thể làm mờ đi một chút */
    color: #721c24; /* Màu chữ đậm hơn */
}

.attendance-list li.absent:hover {
    background-color: #f1c6cb; /* Đậm hơn khi hover */
}

/* Kiểu để ẩn học sinh khi lọc */
.attendance-list.filtering-absent li:not(.absent) {
    display: none;
}

/* --- Kiểu cho Phần Sổ điểm --- */
.gradebook-controls {
    margin-bottom: 15px;
}

.table-responsive {
    overflow-x: auto; /* Cho phép cuộn ngang nếu bảng quá rộng */
    margin-top: 15px;
}

.gradebook-table {
    width: 100%;
    border-collapse: collapse; /* Gộp đường viền */
    min-width: 600px; /* Đặt chiều rộng tối thiểu để tránh quá hẹp */
}

.gradebook-table th,
.gradebook-table td {
    border: 1px solid #dee2e6; /* Viền xám nhạt */
    padding: 8px 10px; /* Padding cho ô */
    text-align: left; /* Căn trái mặc định */
    vertical-align: middle; /* Căn giữa theo chiều dọc */
}

.gradebook-table thead th {
    background-color: #e9ecef; /* Nền xám nhạt cho header */
    font-weight: 600; /* Chữ đậm */
    position: sticky; /* Giữ header cố định khi cuộn dọc */
    top: 0; /* Vị trí cố định ở trên cùng */
    z-index: 1; /* Đảm bảo header nằm trên nội dung */
    white-space: nowrap; /* Không xuống dòng tên cột */
}

.gradebook-table tbody th { /* Kiểu cho cột tên học sinh */
    font-weight: 500;
    background-color: #f8f9fa; /* Nền khác biệt chút */
    position: sticky; /* Giữ cột tên HS cố định khi cuộn ngang */
    left: 0; /* Vị trí cố định bên trái */
    z-index: 0; /* Nằm dưới header cột */
    min-width: 150px; /* Đảm bảo đủ rộng */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.gradebook-table td {
    text-align: center; /* Căn giữa ô điểm */
}


/* Responsive Design */
@media (max-width: 600px) {
    .container {
        margin: 15px;
        padding: 15px;
    }

    .card {
        padding: 20px;
    }

    .inline-form {
        flex-direction: column; /* Chuyển thành cột trên màn hình nhỏ */
        align-items: stretch; /* Kéo dài các phần tử */
    }

    .inline-form input[type="text"] {
        margin-bottom: 10px; /* Thêm lại margin dưới */
        min-width: unset; /* Bỏ min-width trên mobile */
    }

    .inline-form button {
        width: 100%; /* Nút chiếm toàn bộ chiều rộng */
         margin-right: 0; /* Bỏ margin phải */
    }

     .header {
        flex-direction: column;
        align-items: flex-start; /* Căn trái các phần tử header */
        gap: 10px;
    }
     .user-info {
        width: 100%;
        justify-content: space-between; /* Đẩy nút logout sang phải */
    }

    .item-list li .item-name {
        /* Có thể cho phép xuống dòng tên trên mobile nếu cần */
        /* white-space: normal; */
    }

    .item-list li .edit-form {
        flex-direction: column; /* Chuyển form sửa thành cột */
        align-items: stretch;
    }
    .item-list li .edit-form input[type="text"] {
         margin-bottom: 5px; /* Thêm khoảng cách dưới cho input */
    }
     .item-list li .edit-form .btn {
         width: 100%; /* Nút chiếm hết chiều rộng */
         margin-left: 0; /* Bỏ margin trái */
         margin-right: 0;
     }

     .attendance-controls {
        flex-direction: column;
        align-items: stretch;
     }
     .attendance-controls input[type="date"] {
         max-width: none; /* Bỏ giới hạn max-width trên mobile */
         margin-bottom: 10px; /* Thêm khoảng cách dưới */
     }
     .attendance-controls button {
         margin-left: 0; /* Bỏ margin trái tự động */
         width: 100%; /* Nút chiếm hết chiều rộng */
     }

     /* Responsive cho bảng điểm */
     .gradebook-table thead th,
     .gradebook-table tbody th {
         /* Giảm kích thước font trên mobile nếu cần */
         /* font-size: 0.9rem; */
     }
     .gradebook-table tbody th {
         min-width: 120px; /* Giảm chiều rộng tối thiểu cột tên HS */
     }
     .grade-input {
         max-width: 60px; /* Giảm chiều rộng ô điểm */
     }

}
