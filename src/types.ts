export type Language = 'vi' | 'en';
export type Theme = 'light' | 'dark';
export type UserRole = 'admin' | 'student' | 'mentor';

export interface UserSession {
  isLoggedIn: boolean;
  username: string;
  fullName: string;
  role: UserRole;
  language: Language;
  theme: Theme;
}

export interface LogbookEntry {
  id: string;
  date: string;
  topic: string;
  clinicalCase: string;
  details: string;
  aiAdvisorNotes?: string;
  mentorFeedback?: string;
  status: 'Approved' | 'Pending' | 'Action Required';
}

export interface Rotation {
  id: string;
  studentName: string;
  studentCode: string;
  hospitalName: string;
  department: string;
  startDate: string;
  endDate: string;
  mentorName: string;
  status: 'Active' | 'Completed' | 'Upcoming';
  clinicalHours: number;
  logbooks: LogbookEntry[];
}

export interface BoardingRoom {
  id: string;
  roomNumber: string;
  floor: string;
  genderZone: 'Nam' | 'Nữ' | 'Male' | 'Female';
  capacity: number;
  occupied: number;
  residentNames: string[];
  status: 'Excellent' | 'Good' | 'Maintenance Required';
  facilities: string[];
}

export interface MaintenanceTicket {
  id: string;
  roomNumber: string;
  title: string;
  description: string;
  dateCreated: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
}

export interface StudentAppraisal {
  id: string;
  studentName: string;
  studentCode: string;
  department: string;
  clinicalHoursCompleted: number;
  clinicalHoursRequired: number;
  knowledgeScore: number; // 0-10
  skillsScore: number; // 0-10
  attitudeScore: number; // 0-10
  overallScore: number; // 0-10
  notes: string;
  approvedBy: string;
}// Fluent Translations Dictionary
export const translations = {
  vi: {
    portalTitle: "PTDTBT HEALTH PRO",
    portalSubtitle: "Cổng Quản lý Y tế & Nội trú Học sinh",
    usernameLabel: "Tên đăng nhập / Email",
    passwordLabel: "Mật khẩu",
    rememberMe: "Ghi nhớ đăng nhập",
    forgotPassword: "Quên mật khẩu?",
    signIn: "Đăng nhập",
    biometricLogin: "Xác thực nhanh bằng vân tay",
    secureEnterprise: "Hệ thống bảo mật thông tin y tế học sinh",
    footerCopy: "© 2026 Hệ thống Y tế Học đường PTDTBT PRO. Bảo lưu mọi quyền.",
    versionLabel: "Phiên bản 3.2.0-MedStable",
    securityCertified: "Đạt chuẩn an toàn dữ liệu y tế quốc gia",
    
    // Sidebar
    navDashboard: "Bảng Tổng quan Y tế",
    navRotations: "Sổ Sức khỏe & Khám bệnh",
    navBoarding: "Vệ sinh & Nội trú",
    navAppraisals: "Đánh giá Thể trạng",
    navAiAdvisor: "Trợ lý Y tế Học đường AI",
    logout: "Đăng xuất",
    
    // Common
    statusActive: "Đang theo dõi",
    statusCompleted: "Sức khỏe tốt",
    statusUpcoming: "Chờ khám định kỳ",
    statusApproved: "Đã xử trí / Cấp thuốc",
    statusPending: "Chờ bác sĩ khám",
    statusActionRequired: "Theo dõi đặc biệt",
    add: "Thêm mới",
    save: "Lưu hồ sơ",
    cancel: "Hủy bỏ",
    delete: "Xóa",
    view: "Xem chi tiết",
    searchPlaceholder: "Tìm kiếm học sinh, phòng ở...",
    all: "Tất cả",
    
    // Dashboard widgets
    metricTotalStudents: "Tổng số học sinh",
    metricActiveRotations: "Học sinh đang điều trị/theo dõi",
    metricBoardingOccupancy: "Tỷ lệ phòng bán trú sạch",
    metricOpenTickets: "Yêu cầu y tế & Vệ sinh",
    recentActivities: "Nhật ký y tế gần đây",
    quickStats: "Thống kê nhanh",
    distributionByHospital: "Phân loại sức khỏe học sinh theo lớp",
    
    // Rotations Tab
    hospital: "Lớp học / Khối",
    department: "Nhóm sức khỏe / Bệnh nền",
    dates: "Ngày kiểm tra gần nhất",
    mentor: "Giáo viên chủ nhiệm",
    clinicalHours: "Chỉ số BMI",
    logsCount: "Lần khám bệnh",
    logbookTitle: "Lịch sử khám & Cấp thuốc học sinh",
    addLogTitle: "Ghi nhận lượt khám / Cấp phát thuốc mới",
    topic: "Lý do khám / Triệu chứng lâm sàng",
    clinicalCase: "Chẩn đoán y khoa & Đơn thuốc cấp phát",
    details: "Xử trí lâm sàng & Lời dặn học sinh",
    aiNotes: "Định hướng sơ cứu & Khuyến cáo dinh dưỡng (AI)",
    mentorNotes: "Ý kiến kiểm tra từ bác sĩ chuyên khoa",
    submitToMentor: "Lưu & Báo cáo Ban Giám hiệu",
    askAi: "Hỏi Trợ lý AI về phác đồ xử trí",
    
    // Boarding Tab
    roomNumber: "Số phòng bán trú",
    floor: "Tầng / Khu",
    residents: "Học sinh ở phòng này",
    roomStatus: "Vệ sinh & Dịch tễ",
    roomCapacity: "Sức chứa tối đa",
    maintenanceTickets: "Yêu cầu hỗ trợ Y tế & Khử trùng phòng",
    ticketTitle: "Nội dung yêu cầu / Sự cố dịch tễ",
    severity: "Mức độ khẩn cấp",
    ticketStatus: "Trạng thái xử lý",
    createTicket: "Yêu cầu khử trùng / Sơ cứu phòng nội trú",
    ticketPlaceholder: "Mô tả chi tiết sự cố (ví dụ: học sinh sốt cao ở phòng, cần phun thuốc muỗi chống sốt xuất huyết, rò rỉ nước phòng tắm...)",
    
    // Appraisals Tab
    studentCode: "Mã học sinh",
    studentName: "Họ và tên học sinh",
    knowledge: "Chỉ số phát triển chiều cao",
    skills: "Thể lực & Vận động",
    attitude: "Thói quen vệ sinh & Dinh dưỡng",
    overall: "Xếp loại thể trạng chung",
    appraisalForm: "Phiếu đánh giá sức khỏe & Phát triển thể trạng",
    approvedBy: "Cán bộ y tế ký tên",
    
    // AI Assistant Tab
    aiWelcome: "Trợ lý Y tế Học đường Thông minh (PTDTBT AI)",
    aiIntro: "Sử dụng sức mạnh của Gemini AI để hướng dẫn sơ cấp cứu, phân tích nguy cơ ngộ độc thực phẩm, thiết kế thực đơn dinh dưỡng học đường, hoặc soạn thảo thông báo vệ sinh phòng dịch tại ký túc xá.",
    aiPlaceholder: "Nhập câu hỏi của bạn (ví dụ: 'Cách sơ cứu học sinh bị hóc dị vật đường thở' hoặc 'Lên thực đơn 1 tuần giàu dinh dưỡng cho học sinh bán trú vùng cao' hoặc 'Viết thông cáo phun thuốc phòng dịch sốt xuất huyết')...",
    generateBtn: "Gửi câu hỏi",
    generating: "Đang phân tích y khoa...",
    aiResponseTitle: "Lời khuyên & Định hướng y tế từ Trợ lý AI"
  },
  en: {
    portalTitle: "PTDTBT HEALTH PRO",
    portalSubtitle: "Student Health & Boarding Management Portal",
    usernameLabel: "Username / Email",
    passwordLabel: "Password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot Password?",
    signIn: "Sign In",
    biometricLogin: "Biometric Quick Sign In",
    secureEnterprise: "Student Medical Information Security",
    footerCopy: "© 2026 PTDTBT Health Pro Management Systems. All rights reserved.",
    versionLabel: "Version 3.2.0-MedStable",
    securityCertified: "National Health Data Security Standard",
    
    // Sidebar
    navDashboard: "Health Dashboard",
    navRotations: "Health Records & Clinic Visits",
    navBoarding: "Sanitation & Dormitory",
    navAppraisals: "Growth & Physical Appraisal",
    navAiAdvisor: "School Health AI Advisor",
    logout: "Log Out",
    
    // Common
    statusActive: "Under Monitoring",
    statusCompleted: "Excellent Health",
    statusUpcoming: "Pending Routine Checkup",
    statusApproved: "Treated & Medicated",
    statusPending: "Pending Doctor Review",
    statusActionRequired: "Special Care Needed",
    add: "Add New",
    save: "Save Record",
    cancel: "Cancel",
    delete: "Delete",
    view: "View Details",
    searchPlaceholder: "Search students, rooms...",
    all: "All",
    
    // Dashboard widgets
    metricTotalStudents: "Total Boarding Students",
    metricActiveRotations: "Students Under Health Monitoring",
    metricBoardingOccupancy: "Clean Room Percentage",
    metricOpenTickets: "Medical & Sanitation Requests",
    recentActivities: "Recent Health Logs",
    quickStats: "Quick Stats",
    distributionByHospital: "Student Health Classification by Class",
    
    // Rotations Tab
    hospital: "Class / Grade",
    department: "Health Group / Chronic Pathology",
    dates: "Last Health Checkup",
    mentor: "Homeroom Teacher",
    clinicalHours: "BMI Index",
    logsCount: "Clinic Visits",
    logbookTitle: "Student Clinic Visits & Medication History",
    addLogTitle: "Record New Clinic Visit or Medicine Dispensation",
    topic: "Reason for Visit / Clinical Symptoms",
    clinicalCase: "Medical Diagnosis & Medicine Dispensed",
    details: "Clinical Treatment & Advice to Student",
    aiNotes: "SOP Sơ cứu & Khuyến cáo dinh dưỡng (AI)",
    mentorNotes: "Specialist Physician Inspection Notes",
    submitToMentor: "Save & Report to School Board",
    askAi: "Consult AI Advisor on First Aid Protocol",
    
    // Boarding Tab
    roomNumber: "Dorm Room Number",
    floor: "Floor / Block",
    residents: "Students in This Room",
    roomStatus: "Sanitation & Hygiene",
    roomCapacity: "Max Capacity",
    maintenanceTickets: "Medical & Sanitation Service Requests",
    ticketTitle: "Request Details / Epidemic Incident",
    severity: "Severity Level",
    ticketStatus: "Processing Status",
    createTicket: "Request Dorm Sanitation or Medical Support",
    ticketPlaceholder: "Describe the issue (e.g., student with high fever in room, mosquito spraying required to prevent dengue, water leakage...)",
    
    // Appraisals Tab
    studentCode: "Student ID",
    studentName: "Student Name",
    knowledge: "Height Growth Track",
    skills: "Motor & Fitness Skills",
    attitude: "Hygiene & Nutrition Habits",
    overall: "Overall Development Score",
    appraisalForm: "Detailed Physical & Nutritional Growth Sheet",
    approvedBy: "Signed by Medical Officer",
    
    // AI Assistant Tab
    aiWelcome: "School Health AI Assistant (PTDTBT AI)",
    aiIntro: "Leverage Gemini AI to obtain guidelines on school first aid, analyze food poisoning risks, design balanced boarding school menu diets, or draft sanitation and epidemic alerts for the school.",
    aiPlaceholder: "Enter your question (e.g., 'How to perform first aid for a student choking on a foreign object' or 'Draft a 1-week healthy menu for boarding students' or 'Write an announcement for dengue fever mosquito control spraying')...",
    generateBtn: "Ask Assistant",
    generating: "Analyzing medical data...",
    aiResponseTitle: "AI Consultation Insights"
  }
};

// Sheet 1: SỔ KHÁM BỆNH — matches PTDTBT_YTCS_PRO_V1.xlsx > SoKhamBenh
export interface SokhambenhRow {
  stt: number;
  ngayKham: string;       // Ngày, tháng khám bệnh
  hoTen: string;          // Họ tên
  gioiTinh: string;       // Giới tính
  lop: string;            // Lớp
  diaChi: string;         // Địa chỉ
  trieuChung: string;     // Triệu chứng
  chanDoan: string;       // Chẩn đoán
  thuoc1: string;         // Thuốc 1
  sl1: number;            // SL1
  thuoc2: string;         // Thuốc 2
  sl2: number;            // SL2
}

// Sheet 2: SỔ CẤP PHÁT THUỐC — matches SoCapThuoc, fully derived from SoKhamBenh
export interface SoCapThuocRow {
  stt: number;
  ngay: string;
  hoTen: string;
  lop: string;
  chanDoan: string;
  thuoc1: string;
  sl1: number;
  thuoc2: string;
  sl2: number;
}

// Sheet 3: BÁO CÁO THUỐC — matches BaoCaoThuoc (drug inventory catalog)
export interface BaoCaoThuocRow {
  stt: number;
  tenThuoc: string;
  donVi: string;
  donGia: number;
  tonCuoiKy: number;      // Tồn cuối kỳ (lượng)
  nhapTrongThang: number; // Nhập trong tháng (lượng)
}

