import React, { useState, useEffect, useRef } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Fingerprint, 
  Sun, 
  Moon, 
  Globe, 
  LogOut, 
  LayoutDashboard, 
  Stethoscope, 
  Home, 
  FileText, 
  Brain, 
  Clock, 
  Hospital, 
  Activity, 
  UserCheck, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Send, 
  ChevronRight, 
  FileSpreadsheet, 
  Bookmark, 
  Sparkles,
  Search,
  Check,
  AlertCircle,
  Database,
  RefreshCw,
  Edit,
  Trash2
} from 'lucide-react';
import { 
  Language, 
  Theme, 
  UserSession, 
  translations, 
  Rotation, 
  BoardingRoom, 
  MaintenanceTicket, 
  StudentAppraisal, 
  LogbookEntry,
  SokhambenhRow,
  SoCapThuocRow,
  BaoCaoThuocRow
} from './types';
import { 
  initialRotations, 
  initialBoardingRooms, 
  initialMaintenanceTickets, 
  initialAppraisals 
} from './mockData';
import ExcelSheets from './components/ExcelSheets';

export default function App() {
  // Theme and Localization State
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });
  const [lang, setLang] = useState<Language>('vi');

  // Session State
  const [session, setSession] = useState<UserSession>({
    isLoggedIn: false,
    username: 'student@school.edu',
    fullName: 'Nguyễn Hoàng Huân',
    role: 'student',
    language: 'vi',
    theme: 'light'
  });

  // Login Form Inputs
  const [usernameInput, setUsernameInput] = useState('student@school.edu');
  const [passwordInput, setPasswordInput] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active ERP Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rotations' | 'boarding' | 'appraisals' | 'aiAdvisor'>('dashboard');
  const [useExcelView, setUseExcelView] = useState<boolean>(true);

  // Live App States (Loaded from Mock Data, then kept in component state for real-time interactivity)
  const [rotations, setRotations] = useState<Rotation[]>(initialRotations);
  const [rooms, setRooms] = useState<BoardingRoom[]>(initialBoardingRooms);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(initialMaintenanceTickets);
  const [appraisals, setAppraisals] = useState<StudentAppraisal[]>(initialAppraisals);

  // Excel Sheet Database States
  const [soKhambenhData, setSoKhambenhData] = useState<SokhambenhRow[]>([]);
  const [phatthuocData, setPhatthuocData] = useState<SoCapThuocRow[]>([]);
  const [baocaotonData, setBaocaotonData] = useState<BaoCaoThuocRow[]>([]);

  // Database Integration States
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [dbStatus, setDbStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('synced');
  const [dbProvider, setDbProvider] = useState<'Local JSON' | 'Firestore'>('Local JSON');

  // Active Selected Item States
  const [selectedRotation, setSelectedRotation] = useState<Rotation | null>(initialRotations && initialRotations.length > 0 ? initialRotations[0] : null);
  const [selectedLogbook, setSelectedLogbook] = useState<LogbookEntry | null>(initialRotations && initialRotations.length > 0 && initialRotations[0].logbooks && initialRotations[0].logbooks.length > 0 ? initialRotations[0].logbooks[0] : null);

  // Modals / Forms States
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [showAddTicketModal, setShowAddTicketModal] = useState(false);
  const [showAppraisalForm, setShowAppraisalForm] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // Editing states
  const [editingStudent, setEditingStudent] = useState<Rotation | null>(null);
  const [editingLogbook, setEditingLogbook] = useState<LogbookEntry | null>(null);
  const [editingRoom, setEditingRoom] = useState<BoardingRoom | null>(null);
  const [editingTicket, setEditingTicket] = useState<MaintenanceTicket | null>(null);
  const [editingAppraisal, setEditingAppraisal] = useState<StudentAppraisal | null>(null);

  // Modal open states
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [showEditLogModal, setShowEditLogModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);
  const [showEditTicketModal, setShowEditTicketModal] = useState(false);
  const [showEditAppraisalModal, setShowEditAppraisalModal] = useState(false);

  // Boarding Room addition states
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState('Tầng 1');
  const [newRoomGender, setNewRoomGender] = useState<'Nam' | 'Nữ' | 'Male' | 'Female'>('Nam');
  const [newRoomCapacity, setNewRoomCapacity] = useState(8);
  const [newRoomStatus, setNewRoomStatus] = useState<'Excellent' | 'Good' | 'Maintenance Required'>('Excellent');
  const [newRoomResidents, setNewRoomResidents] = useState('');

  // Form Inputs for "Add Student Health Record"
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentCode, setNewStudentCode] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('Lớp 12A1 (Khối 12)');
  const [newStudentHealthGroup, setNewStudentHealthGroup] = useState('Sức khỏe loại I (Bình thường)');
  const [newStudentBMI, setNewStudentBMI] = useState(20.0);
  const [newStudentMentor, setNewStudentMentor] = useState('Cô Nguyễn Thị Mai (GVCN)');
  const [newStudentStartDate, setNewStudentStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStudentEndDate, setNewStudentEndDate] = useState(new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]);
  const [newStudentStatus, setNewStudentStatus] = useState<'Active' | 'Completed' | 'Upcoming'>('Active');

  // Form Inputs for "Add Logbook"
  const [newLogTopic, setNewLogTopic] = useState('');
  const [newLogCase, setNewLogCase] = useState('');
  const [newLogDetails, setNewLogDetails] = useState('');

  // Form Inputs for "Add Maintenance Ticket"
  const [newTicketRoom, setNewTicketRoom] = useState('Phòng 202');
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketDesc, setNewTicketDesc] = useState('');
  const [newTicketSeverity, setNewTicketSeverity] = useState<'Low' | 'Medium' | 'High'>('Medium');

  // Form Inputs for "Add Appraisal" (Mentor flow)
  const [newAppStudentName, setNewAppStudentName] = useState('Trần Minh Anh');
  const [newAppDept, setNewAppDept] = useState('Lớp 11B3 (Khối 11)');
  const [newAppHours, setNewAppHours] = useState(150);
  const [newAppScoreKnowledge, setNewAppScoreKnowledge] = useState(8.5);
  const [newAppScoreSkills, setNewAppScoreSkills] = useState(8.5);
  const [newAppScoreAttitude, setNewAppScoreAttitude] = useState(9.0);
  const [newAppNotes, setNewAppNotes] = useState('');
  const [appraisalSearch, setAppraisalSearch] = useState('');
  const [studentFilterInForm, setStudentFilterInForm] = useState('');

  // AI Assistant States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLogs, setAiLogs] = useState<Array<{ sender: 'user' | 'ai', text: string, timestamp: string }>>([
    {
      sender: 'ai',
      text: lang === 'vi' 
        ? "Xin chào! Tôi là Trợ lý Y tế Học đường AI của hệ thống PTDTBT HEALTH PRO. Tôi có thể hỗ trợ bạn hướng dẫn sơ cấp cứu, lên thực đơn dinh dưỡng, tư vấn phòng dịch học đường, hoặc soạn thông cáo vệ sinh nội trú." 
        : "Hello! I am your School Health AI Assistant on PTDTBT HEALTH PRO. I can help you with first aid guidelines, balanced meal planning, school epidemic defense, or drafting dormitory hygiene notices.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [activeLogAiFeedback, setActiveLogAiFeedback] = useState<string>('');
  const [isAnalyzingLog, setIsAnalyzingLog] = useState(false);

  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const requestConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(null);
      }
    });
  };

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  } | null>(null);

  const showAlert = (title: string, message: string) => {
    setAlertModal({
      isOpen: true,
      title,
      message
    });
  };

  // Sync theme with Document Element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load database state on component mount
  useEffect(() => {
    const loadDbData = async () => {
      try {
        // Query server health to determine if we are running Cloud Firestore or Local JSON
        try {
          const healthRes = await fetch('/api/health');
          if (healthRes.ok) {
            const healthData = await healthRes.json();
            if (healthData && healthData.database) {
              setDbProvider(healthData.database);
            }
          }
        } catch (e) {
          console.warn("Failed to fetch database provider type:", e);
        }

        const response = await fetch('/api/data');
        if (response.ok) {
          const data = await response.json();
          if (data.rotations) setRotations(data.rotations);
          if (data.rooms) setRooms(data.rooms);
          if (data.tickets) setTickets(data.tickets);
          if (data.appraisals) setAppraisals(data.appraisals);
          if (data.soKhambenhData) setSoKhambenhData(data.soKhambenhData);
          if (data.phatthuocData) setPhatthuocData(data.phatthuocData);
          if (data.baocaotonData) setBaocaotonData(data.baocaotonData);
          
          // Select default item from loaded database
          if (data.rotations && data.rotations.length > 0) {
            setSelectedRotation(data.rotations[0]);
            if (data.rotations[0].logbooks && data.rotations[0].logbooks.length > 0) {
              setSelectedLogbook(data.rotations[0].logbooks[0]);
            } else {
              setSelectedLogbook(null);
            }
          }
          setIsDbLoaded(true);
          setDbStatus('synced');
        } else {
          setDbStatus('error');
        }
      } catch (err) {
        console.error("Error loading database:", err);
        setDbStatus('error');
      }
    };
    loadDbData();
  }, []);

  const isInitialLoadRef = useRef(true);

  // Sync to database whenever state changes, only after database is initially loaded!
  useEffect(() => {
    if (!isDbLoaded) return;

    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }
    
    const saveData = async () => {
      setDbStatus('syncing');
      try {
        const response = await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rotations,
            rooms,
            tickets,
            appraisals,
            soKhambenhData,
            phatthuocData,
            baocaotonData
          })
        });
        if (response.ok) {
          setDbStatus('synced');
        } else {
          setDbStatus('error');
        }
      } catch (err) {
        console.error("Error syncing to database:", err);
        setDbStatus('error');
      }
    };
    
    // Debounce saving slightly if multiple updates happen quickly
    const timer = setTimeout(saveData, 600);
    return () => clearTimeout(timer);
  }, [rotations, rooms, tickets, appraisals, soKhambenhData, phatthuocData, baocaotonData, isDbLoaded]);

  // Handle manual database reset to defaults
  const handleResetDatabase = () => {
    requestConfirmation(
      lang === 'vi' ? "Khôi phục CSDL mặc định" : "Restore Mock Defaults",
      lang === 'vi' ? "Bạn có chắc chắn muốn khôi phục CSDL về trạng thái mặc định không? Mọi dữ liệu tự thêm/sửa đổi sẽ bị xóa sạch." : "Are you sure you want to restore the database to mock defaults? All custom changes will be wiped.",
      async () => {
        setDbStatus('syncing');
        try {
          const response = await fetch('/api/data/reset', { method: 'POST' });
          if (response.ok) {
            const result = await response.json();
            const data = result.data;
            
            setIsDbLoaded(false); // Temporarily lock sync
            setRotations(data.rotations);
            setRooms(data.rooms);
            setTickets(data.tickets);
            setAppraisals(data.appraisals);
            setSoKhambenhData(data.soKhambenhData || []);
            setPhatthuocData(data.phatthuocData || []);
            setBaocaotonData(data.baocaotonData || []);
            
            if (data.rotations && data.rotations.length > 0) {
              setSelectedRotation(data.rotations[0]);
              if (data.rotations[0].logbooks && data.rotations[0].logbooks.length > 0) {
                setSelectedLogbook(data.rotations[0].logbooks[0]);
              } else {
                setSelectedLogbook(null);
              }
            }
            
            setIsDbLoaded(true); // Unlock sync
            setDbStatus('synced');
            showAlert(lang === 'vi' ? "Thông báo" : "Notification", lang === 'vi' ? "Đã khôi phục CSDL gốc thành công!" : "Database reset successfully!");
          } else {
            setDbStatus('error');
          }
        } catch (err) {
          console.error("Failed to reset database:", err);
          setDbStatus('error');
        }
      }
    );
  };

  // Handle Login Action
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    // Simulated network verification delay for Fluent look
    setTimeout(() => {
      // Allow any login but configure role based on matching usernames
      const userLower = usernameInput.toLowerCase();
      let role: 'admin' | 'student' | 'mentor' = 'student';
      let fullName = 'Nguyễn Hoàng Huân';

      if (userLower.includes('admin') || userLower.includes('health') || userLower.includes('officer')) {
        role = 'admin';
        fullName = 'Trần Văn Thắng (Cán bộ Y tế)';
      } else if (userLower.includes('mentor') || userLower.includes('doctor') || userLower.includes('teacher') || userLower.includes('mai')) {
        role = 'mentor';
        fullName = 'Cô Nguyễn Thị Mai (GVCN)';
      }

      setSession({
        isLoggedIn: true,
        username: usernameInput,
        fullName: fullName,
        role: role,
        language: lang,
        theme: theme
      });
      setIsLoggingIn(false);
    }, 1200);
  };

  // Quick autofill for demo
  const handleAutofill = (roleType: 'student' | 'admin' | 'mentor') => {
    if (roleType === 'student') {
      setUsernameInput('student@school.edu');
      setPasswordInput('admin');
    } else if (roleType === 'mentor') {
      setUsernameInput('teacher@school.edu');
      setPasswordInput('admin');
    } else {
      setUsernameInput('health.officer@school.edu');
      setPasswordInput('admin');
    }
  };

  // Submit New Logbook Entry
  const handleAddLogbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogTopic || !newLogCase) return;

    if (selectedRotation) {
      const newEntry: LogbookEntry = {
        id: `LOG-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        topic: newLogTopic,
        clinicalCase: newLogCase,
        details: newLogDetails,
        status: 'Pending'
      };

      const updatedRotations = rotations.map(rot => {
        if (rot.id === selectedRotation.id) {
          const updatedLogs = [newEntry, ...rot.logbooks];
          return {
            ...rot,
            logbooks: updatedLogs,
            clinicalHours: rot.clinicalHours + 4 // add mock clinical hours
          };
        }
        return rot;
      });

      setRotations(updatedRotations);
      // update selected rotation in state
      const targetRot = updatedRotations.find(r => r.id === selectedRotation.id);
      if (targetRot) {
        setSelectedRotation(targetRot);
        setSelectedLogbook(newEntry);
      }

      // Reset form & close modal
      setNewLogTopic('');
      setNewLogCase('');
      setNewLogDetails('');
      setShowAddLogModal(false);
    }
  };

  // Submit New Maintenance Ticket
  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketTitle || !newTicketDesc) return;

    const newTicket: MaintenanceTicket = {
      id: `TCK-${Date.now()}`,
      roomNumber: newTicketRoom,
      title: newTicketTitle,
      description: newTicketDesc,
      dateCreated: new Date().toISOString().split('T')[0],
      severity: newTicketSeverity,
      status: 'Open'
    };

    setTickets([newTicket, ...tickets]);

    // Also update matching room's status to 'Maintenance Required'
    const updatedRooms = rooms.map(rm => {
      if (rm.roomNumber === newTicketRoom) {
        return { ...rm, status: 'Maintenance Required' as const };
      }
      return rm;
    });
    setRooms(updatedRooms);

    // Reset Form
    setNewTicketTitle('');
    setNewTicketDesc('');
    setShowAddTicketModal(false);
  };

  // Submit New Appraisal Evaluation (Mentor Flow)
  const handleAddAppraisal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppStudentName || !newAppNotes) return;

    const matchedStudent = rotations.find(r => r.studentName === newAppStudentName);
    const matchedExcel = soKhambenhData.find(r => r.hoTen === newAppStudentName);
    const studentCode = matchedStudent 
      ? matchedStudent.studentCode 
      : `HS-${10 + Math.floor(Math.random() * 3)}-${100 + Math.floor(Math.random() * 900)}`;
    const department = matchedStudent 
      ? matchedStudent.hospitalName 
      : matchedExcel 
        ? matchedExcel.lop 
        : newAppDept;

    const overallScore = parseFloat(((newAppScoreKnowledge + newAppScoreSkills + newAppScoreAttitude) / 3).toFixed(1));

    const newAppraisal: StudentAppraisal = {
      id: `APR-${Date.now()}`,
      studentName: newAppStudentName,
      studentCode: studentCode,
      department: department,
      clinicalHoursCompleted: newAppHours,
      clinicalHoursRequired: 22.0,
      knowledgeScore: newAppScoreKnowledge,
      skillsScore: newAppScoreSkills,
      attitudeScore: newAppScoreAttitude,
      overallScore: overallScore,
      notes: newAppNotes,
      approvedBy: session.fullName
    };

    setAppraisals([newAppraisal, ...appraisals]);

    // Reset Form & Collapse
    setNewAppNotes('');
    setShowAppraisalForm(false);
  };

  // Submit New Student Health Record
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentCode) return;

    const newStudent: Rotation = {
      id: `ROT-${Date.now()}`,
      studentName: newStudentName,
      studentCode: newStudentCode,
      hospitalName: newStudentClass,
      department: newStudentHealthGroup,
      startDate: newStudentStartDate,
      endDate: newStudentEndDate,
      mentorName: newStudentMentor,
      status: newStudentStatus,
      clinicalHours: parseFloat(Number(newStudentBMI).toFixed(1)),
      logbooks: []
    };

    const updated = [newStudent, ...rotations];
    setRotations(updated);
    setSelectedRotation(newStudent);
    setSelectedLogbook(null);

    // Reset Form & Close Modal
    setNewStudentName('');
    setNewStudentCode('');
    setNewStudentBMI(20.0);
    setShowAddStudentModal(false);
  };

  // Add Student from Excel Grid sync flow
  const handleAddStudentFromExcel = (studentName: string, studentClass: string, healthGroup: string) => {
    const newStudent: Rotation = {
      id: `ROT-${Date.now()}`,
      studentName: studentName,
      studentCode: `HS-${10 + Math.floor(Math.random() * 3)}${['A','B','C'][Math.floor(Math.random() * 3)]}-${100 + Math.floor(Math.random() * 899)}`,
      hospitalName: studentClass || "Lớp 12A1 (Khối 12)",
      department: healthGroup || "Sức khỏe loại I (Bình thường)",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      mentorName: "Cô Nguyễn Thị Mai (GVCN)",
      status: "Active",
      clinicalHours: 20.5,
      logbooks: []
    };

    const updated = [newStudent, ...rotations];
    setRotations(updated);
    setSelectedRotation(newStudent);
    setSelectedLogbook(null);
  };

  // 1. EDIT STUDENT
  const handleEditStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    const updated = rotations.map(r => r.id === editingStudent.id ? editingStudent : r);
    setRotations(updated);
    if (selectedRotation && selectedRotation.id === editingStudent.id) {
      setSelectedRotation(editingStudent);
    }
    setShowEditStudentModal(false);
    setEditingStudent(null);
  };

  // 2. DELETE STUDENT
  const handleDeleteStudent = (studentId: string) => {
    requestConfirmation(
      lang === 'vi' ? 'Xóa hồ sơ sức khỏe' : 'Delete Health Record',
      lang === 'vi' ? 'Bạn có chắc chắn muốn xóa hồ sơ sức khỏe của học sinh này?' : 'Are you sure you want to delete this student\'s health record?',
      () => {
        const updated = rotations.filter(r => r.id !== studentId);
        setRotations(updated);
        if (selectedRotation && selectedRotation.id === studentId) {
          setSelectedRotation(updated.length > 0 ? updated[0] : null);
          if (updated.length > 0 && updated[0].logbooks && updated[0].logbooks.length > 0) {
            setSelectedLogbook(updated[0].logbooks[0]);
          } else {
            setSelectedLogbook(null);
          }
        }
      }
    );
  };

  // 3. EDIT CLINICAL LOGBOOK
  const handleEditLogbookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLogbook || !selectedRotation) return;
    const updatedLogs = selectedRotation.logbooks.map(l => l.id === editingLogbook.id ? editingLogbook : l);
    const updatedRotation = { ...selectedRotation, logbooks: updatedLogs };
    
    const updatedRotations = rotations.map(r => r.id === selectedRotation.id ? updatedRotation : r);
    setRotations(updatedRotations);
    setSelectedRotation(updatedRotation);
    setSelectedLogbook(editingLogbook);
    setShowEditLogModal(false);
    setEditingLogbook(null);
  };

  // 4. DELETE CLINICAL LOGBOOK
  const handleDeleteLogbook = (logId: string) => {
    if (!selectedRotation) return;
    requestConfirmation(
      lang === 'vi' ? 'Xóa lượt khám/cấp thuốc' : 'Delete Clinical Record',
      lang === 'vi' ? 'Bạn có chắc chắn muốn xóa lượt khám/cấp thuốc này?' : 'Are you sure you want to delete this clinical record?',
      () => {
        const updatedLogs = selectedRotation.logbooks.filter(l => l.id !== logId);
        const updatedRotation = { ...selectedRotation, logbooks: updatedLogs };
        
        const updatedRotations = rotations.map(r => r.id === selectedRotation.id ? updatedRotation : r);
        setRotations(updatedRotations);
        setSelectedRotation(updatedRotation);
        setSelectedLogbook(updatedLogs.length > 0 ? updatedLogs[0] : null);
      }
    );
  };

  // 5. ADD DORM ROOM
  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber) return;
    const newRoom: BoardingRoom = {
      id: `room-${Date.now()}`,
      roomNumber: newRoomNumber,
      floor: newRoomFloor,
      genderZone: newRoomGender as any,
      capacity: newRoomCapacity,
      occupied: newRoomResidents ? newRoomResidents.split(',').map(s => s.trim()).filter(Boolean).length : 0,
      residentNames: newRoomResidents ? newRoomResidents.split(',').map(s => s.trim()).filter(Boolean) : [],
      status: newRoomStatus as any,
      facilities: ['Giường tầng', 'Tủ cá nhân', 'Quạt trần', 'Nhà vệ sinh khép kín']
    };
    setRooms([...rooms, newRoom]);
    setShowAddRoomModal(false);
    // Reset room inputs
    setNewRoomNumber('');
    setNewRoomFloor('Tầng 1');
    setNewRoomGender('Nam');
    setNewRoomCapacity(8);
    setNewRoomStatus('Excellent');
    setNewRoomResidents('');
  };

  // 6. EDIT DORM ROOM
  const handleEditRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    const updatedRoom = {
      ...editingRoom,
      occupied: editingRoom.residentNames.length
    };
    const updated = rooms.map(r => r.id === editingRoom.id ? updatedRoom : r);
    setRooms(updated);
    setShowEditRoomModal(false);
    setEditingRoom(null);
  };

  // 7. DELETE DORM ROOM
  const handleDeleteRoom = (roomId: string) => {
    requestConfirmation(
      lang === 'vi' ? 'Xóa phòng ký túc xá' : 'Delete Boarding Room',
      lang === 'vi' ? 'Bạn có chắc chắn muốn xóa phòng ký túc xá này?' : 'Are you sure you want to delete this room?',
      () => {
        const updated = rooms.filter(r => r.id !== roomId);
        setRooms(updated);
      }
    );
  };

  // 8. EDIT MAINTENANCE TICKET
  const handleEditTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;
    const updated = tickets.map(t => t.id === editingTicket.id ? editingTicket : t);
    setTickets(updated);
    setShowEditTicketModal(false);
    setEditingTicket(null);
  };

  // 9. DELETE MAINTENANCE TICKET
  const handleDeleteTicket = (ticketId: string) => {
    requestConfirmation(
      lang === 'vi' ? 'Xóa yêu cầu hỗ trợ/bảo trì' : 'Delete Maintenance Ticket',
      lang === 'vi' ? 'Bạn có chắc chắn muốn xóa yêu cầu hỗ trợ/bảo trì này?' : 'Are you sure you want to delete this ticket?',
      () => {
        const updated = tickets.filter(t => t.id !== ticketId);
        setTickets(updated);
      }
    );
  };

  // 10. EDIT APPRAISAL
  const handleEditAppraisalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppraisal) return;
    const overallScore = parseFloat(((editingAppraisal.knowledgeScore + editingAppraisal.skillsScore + editingAppraisal.attitudeScore) / 3).toFixed(1));
    const updatedAppraisal = {
      ...editingAppraisal,
      overallScore
    };
    const updated = appraisals.map(a => a.id === editingAppraisal.id ? updatedAppraisal : a);
    setAppraisals(updated);
    setShowEditAppraisalModal(false);
    setEditingAppraisal(null);
  };

  // 11. DELETE APPRAISAL
  const handleDeleteAppraisal = (appraisalId: string) => {
    requestConfirmation(
      lang === 'vi' ? 'Xóa phiếu đánh giá thể trạng' : 'Delete Growth Appraisal',
      lang === 'vi' ? 'Bạn có chắc chắn muốn xóa phiếu đánh giá thể trạng này?' : 'Are you sure you want to delete this growth appraisal?',
      () => {
        const updated = appraisals.filter(a => a.id !== appraisalId);
        setAppraisals(updated);
      }
    );
  };

  // Call Server-Side Gemini API to Analyze active Clinical Logbook Case
  const analyzeLogbookWithAI = async (log: LogbookEntry) => {
    if (!log) return;
    setIsAnalyzingLog(true);
    setActiveLogAiFeedback('');

    try {
      const response = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Hãy phân tích ca bệnh / sự việc y tế học đường này của học sinh bán trú dưới vai trò là Bác sĩ Cố vấn Y tế Học đường giàu kinh nghiệm. Đưa ra:
1. Đánh giá sơ bộ về tính hợp lý và an toàn trong cách sơ cứu / xử trí ban đầu.
2. 3 Điểm lâm sàng / Lưu ý đặc biệt (Key safety points) đối với triệu chứng hoặc chấn thương này ở trẻ lứa tuổi đi học.
3. 2 lời khuyên dinh dưỡng, chế độ sinh hoạt hoặc vệ sinh phòng dịch phù hợp cho học sinh này tại khu ký túc xá.

Sự việc y tế / Triệu chứng: ${log.clinicalCase}
Lý do khám / Chẩn đoán sơ bộ: ${log.topic}
Xử trí & Lời dặn: ${log.details}`,
          context: {
            studentName: session.fullName,
            role: session.role,
            hospital: selectedRotation?.hospitalName,
            department: selectedRotation?.department
          }
        })
      });

      const data = await response.json();
      if (response.ok) {
        setActiveLogAiFeedback(data.result);
        
        // Save the AI insights directly onto the logbook state
        const updatedRotations = rotations.map(rot => {
          if (rot.id === selectedRotation?.id) {
            return {
              ...rot,
              logbooks: rot.logbooks.map(lg => {
                if (lg.id === log.id) {
                  return { ...lg, aiAdvisorNotes: data.result };
                }
                return lg;
              })
            };
          }
          return rot;
        });
        setRotations(updatedRotations);

        // sync log state
        setSelectedLogbook({ ...log, aiAdvisorNotes: data.result });
      } else {
        setActiveLogAiFeedback(`Lỗi từ Trợ lý AI: ${data.error || 'Không thể lấy kết quả phân tích.'}. Vui lòng thử lại.`);
      }
    } catch (err: any) {
      setActiveLogAiFeedback(`Lỗi kết nối máy chủ: ${err.message}. Đảm bảo đã đặt khóa bí mật GEMINI_API_KEY.`);
    } finally {
      setIsAnalyzingLog(false);
    }
  };

  // Call Server-Side Gemini API for dedicated Chat Tab
  const handleSendAiChat = async () => {
    if (!aiPrompt.trim()) return;

    const userMessage = aiPrompt;
    setAiPrompt('');
    
    const newLogs = [...aiLogs, { sender: 'user' as const, text: userMessage, timestamp: new Date().toLocaleTimeString() }];
    setAiLogs(newLogs);
    setIsAiGenerating(true);

    try {
      const response = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          context: {
            userRole: session.role,
            fullName: session.fullName,
            activeTab: activeTab
          }
        })
      });

      const data = await response.json();
      if (response.ok) {
        setAiLogs([...newLogs, { sender: 'ai' as const, text: data.result, timestamp: new Date().toLocaleTimeString() }]);
      } else {
        setAiLogs([...newLogs, { sender: 'ai' as const, text: `Lỗi: ${data.error || 'Đã xảy ra sự cố.'}\n\nChi tiết: Vui lòng kiểm tra GEMINI_API_KEY trong cấu hình Secrets của AI Studio.`, timestamp: new Date().toLocaleTimeString() }]);
      }
    } catch (err: any) {
      setAiLogs([...newLogs, { sender: 'ai' as const, text: `Lỗi kết nối mạng: ${err.message}. Không thể kết nối với máy chủ Express proxy.`, timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Help Chips click in chat
  const handleQuickPromptClick = (promptText: string) => {
    setAiPrompt(promptText);
  };

  const t = translations[lang];

  // ==========================================
  // DYNAMIC METRICS FOR THE MAIN OVERVIEW DB BOARD
  // ==========================================
  
  // Helper to classify students without double-counting or misses
  const classifyStudent = (dept: any) => {
    const d = String(dept || '').toLowerCase();
    if (
      d.includes('đặc biệt') ||
      d.includes('special') ||
      d.includes('hen') ||
      d.includes('dị ứng') ||
      d.includes('asthma') ||
      d.includes('allergy') ||
      d.includes('chronic')
    ) {
      return 'Special';
    }
    if (
      d.includes('loại iii') ||
      d.includes('class iii') ||
      d.includes('average') ||
      d.includes('suy dinh dưỡng') ||
      d.includes('underweight')
    ) {
      return 'III';
    }
    if (
      d.includes('loại ii') ||
      d.includes('class ii') ||
      d.includes('cần theo dõi') ||
      d.includes('good')
    ) {
      return 'II';
    }
    return 'I';
  };

  // 1. Total Students metric
  const countClassI = rotations.filter(r => classifyStudent(r.department) === 'I').length;
  const countClassII = rotations.filter(r => classifyStudent(r.department) === 'II').length;
  const countClassIII = rotations.filter(r => classifyStudent(r.department) === 'III').length;
  const countSpecial = rotations.filter(r => classifyStudent(r.department) === 'Special').length;

  // Fully dynamic metrics representing actual active database registrations
  const classITotal = countClassI;
  const classIITotal = countClassII;
  const classIIITotal = countClassIII;
  const specialTotal = countSpecial;
  const grandTotal = rotations.length;

  const classIPercent = grandTotal > 0 ? Math.round((classITotal / grandTotal) * 100) : 0;
  const classIIPercent = grandTotal > 0 ? Math.round((classIITotal / grandTotal) * 100) : 0;
  const classIIIPercent = grandTotal > 0 ? Math.round((classIIITotal / grandTotal) * 100) : 0;
  const specialPercent = grandTotal > 0 ? Math.round((specialTotal / grandTotal) * 100) : 0;

  // 2. Boarding Room occupancy percent
  const totalOccupied = rooms.reduce((sum, r) => sum + (Number(r.occupied) || 0), 0);
  const totalCapacity = rooms.reduce((sum, r) => sum + (Number(r.capacity) || 0), 0);
  const occupancyPercent = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : "0.0";

  // 3. Flatten and sort logbooks to get real-time active cases
  const allLogs = rotations.flatMap(student => 
    (student.logbooks || []).map(log => ({
      ...log,
      studentName: student.studentName,
      studentClass: student.hospitalName,
      studentCode: student.studentCode
    }))
  ).sort((a, b) => b.date.localeCompare(a.date));

  // Construct activities list
  const defaultActivities = [
    {
      time: "08:15",
      dateLabel: lang === 'vi' ? 'Hôm nay' : 'Today',
      color: "bg-sky-500",
      content: lang === 'vi' 
        ? "Cán bộ Y tế đã xử trí sơ cứu và cấp hạ sốt cho học sinh Nguyễn Hoàng Huân" 
        : "administered fever treatment to student Nguyen Hoang Huan"
    },
    {
      time: "18:00",
      dateLabel: lang === 'vi' ? 'Hôm qua' : 'Yesterday',
      color: "bg-yellow-500",
      content: lang === 'vi' 
        ? "Phòng 202 báo cáo yêu cầu phun thuốc chống muỗi phòng sốt xuất huyết" 
        : "requested dengue fever mosquito control spraying for Room 202"
    },
    {
      time: "15:30",
      dateLabel: lang === 'vi' ? 'Hôm qua' : 'Yesterday',
      color: "bg-emerald-500",
      content: lang === 'vi' 
        ? "Cô Nguyễn Thị Mai đã hoàn tất Phiếu đánh giá thể trạng định kỳ lớp 12A1" 
        : "Teacher Nguyen Thi Mai approved 12A1 fitness growth appraisal"
    }
  ];

  const realLogsActivities = allLogs.slice(0, 4).map((log, index) => {
    const colors = ["bg-sky-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500"];
    const color = colors[index % colors.length];
    const formattedDate = log.date ? log.date.split('-').reverse().join('/') : "Hôm nay";
    
    return {
      time: formattedDate,
      dateLabel: lang === 'vi' ? 'Ghi chép y tế' : 'Clinical Log',
      color,
      content: lang === 'vi'
        ? `Xử lý: ${log.studentName} (${log.studentClass}) - ${log.topic}`
        : `Treated: ${log.studentName} (${log.studentClass}) - ${log.topic}`
    };
  });

  const mergedActivities = [...realLogsActivities, ...defaultActivities].slice(0, 4);

  return (
    <div className={`min-h-screen text-slate-800 dark:text-slate-100 flex transition-colors duration-300 font-sans ${theme === 'dark' ? 'dark bg-[#1A1C1C]' : 'bg-[#FAF9F8]'}`}>
      
      <AnimatePresence mode="wait">
        {!session.isLoggedIn ? (
          // =================== LOGIN SCREEN MODULE ===================
          <motion.div 
            key="login-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-screen flex items-center justify-center relative overflow-hidden px-4"
          >
            {/* Ambient Animated Blurred Blobs */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] right-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full bg-[#005faa]/10 blur-[80px] md:blur-[140px] animate-pulse"></div>
              <div className="absolute bottom-[-10%] left-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full bg-[#006e06]/10 blur-[80px] md:blur-[140px] animate-pulse"></div>
              
              {/* Decorative Medical Graphic Mesh overlay */}
              <div 
                className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08] mix-blend-overlay pointer-events-none"
                style={{ 
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXu3KHZRMKwzXrwDgx_tTEiddBQ0AhS7I5YVCQ-8CsilAgxOkd-ODwkHPJmxImzLiWYYKPTuAN5_jJaTCRt9T0vW7T9iSCGEQh80uMXIwdRI8y7GO054N3cn6OLx7AOpDlFZll4lRpJSjZ3uYXfwzEA9CApdIuYihBrteMw-AjK3ijq4Wk-lGqk0d7fXGpYuUX74lH8gh8t2e0zQ7le0e2eIibO0lgY8xfKNrlwPM16nQqeIJucRXZKA794XO-iljPX5gKJKec_THaJr')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              ></div>
            </div>

            {/* Quick Demo Autofill Controls */}
            <div className="absolute top-4 left-4 z-50 flex flex-wrap gap-2 max-w-sm bg-white/80 dark:bg-zinc-900/80 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-zinc-800 text-xs">
              <span className="font-semibold text-slate-500 block w-full mb-1">Demo Autofill Roles:</span>
              <button 
                onClick={() => handleAutofill('student')}
                className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900 rounded font-medium transition"
              >
                Học sinh (Huân)
              </button>
              <button 
                onClick={() => handleAutofill('mentor')}
                className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900 rounded font-medium transition"
              >
                Giáo viên (Mai)
              </button>
              <button 
                onClick={() => handleAutofill('admin')}
                className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 dark:hover:bg-purple-900 rounded font-medium transition"
              >
                Cán bộ Y tế (Thắng)
              </button>
            </div>

            {/* Top Right Quick Settings Theme & Translation */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
              {/* Language Switcher */}
              <button 
                onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
                className="p-3 rounded-full bg-white/85 dark:bg-zinc-800/85 hover:bg-slate-100 dark:hover:bg-zinc-700 shadow-sm border border-slate-200/50 dark:border-zinc-700/50 flex items-center justify-center transition"
                title="Switch Language"
              >
                <Globe className="w-5 h-5 text-[#005faa]" />
                <span className="ml-1 text-xs font-bold uppercase">{lang === 'vi' ? 'EN' : 'VI'}</span>
              </button>

              {/* Theme Toggle */}
              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-3 rounded-full bg-white/85 dark:bg-zinc-800/85 hover:bg-slate-100 dark:hover:bg-zinc-700 shadow-sm border border-slate-200/50 dark:border-zinc-700/50 flex items-center justify-center transition"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5 text-[#005faa]" /> : <Sun className="w-5 h-5 text-amber-400" />}
              </button>
            </div>

            {/* MAIN CREDENTIAL CARD */}
            <main className="relative z-10 w-full max-w-[440px]">
              <div className="acrylic rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col border border-white/40 dark:border-zinc-800/40">
                
                {/* Brand Logo & Header */}
                <div className="mb-8 text-center">
                  <div className="relative inline-block mb-4">
                    {/* Glowing outer shadow ring */}
                    <div className="absolute inset-0 bg-[#005faa]/20 rounded-full blur-md"></div>
                    <img 
                      alt="PTDTBT PRO 3.0 Logo" 
                      className="w-20 h-20 relative z-10 mx-auto drop-shadow-md object-contain" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjyv-lSwd5scLYjMETyStn7rN9QMq02gSIo5bvsNCIWQ78bLym1MVfzYaEgJyDnGP6DVT7kR6ktY47QNrwvNzI4TrS9hWKoACJAVHOPyTAewWOHbIrC0muYVvX96R6N9vttB6p4svk3yfjz_uiPDtwVq57m_cABZ5vXQEbq9uOYI44Roq3qzqq7OTAtCa9ZpIHz4rpTIA7k-rj6rO118TEmHwK2F0qUGWvaRkwVo9qUoB8mU-TxnmXpQ-CaOJgfYvcC49NKFIhA4Am"
                    />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight leading-none">
                    {t.portalTitle}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    {t.portalSubtitle}
                  </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  
                  {/* Username Field */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1" htmlFor="username">
                      {t.usernameLabel}
                    </label>
                    <div className="relative flex items-center border-b-2 border-slate-300 dark:border-zinc-700 focus-within:border-[#0078d4] dark:focus-within:border-sky-500 focus-within:bg-[#0078d4]/5 dark:focus-within:bg-sky-500/5 transition duration-200">
                      <User className="absolute left-1.5 w-5 h-5 text-slate-400" />
                      <input 
                        className="w-full bg-transparent py-2.5 pl-9 pr-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 border-none outline-none focus:ring-0" 
                        id="username"
                        type="text" 
                        placeholder={lang === 'vi' ? 'Ví dụ: health.officer@school.edu' : 'e.g. health.officer@school.edu'}
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1" htmlFor="password">
                      {t.passwordLabel}
                    </label>
                    <div className="relative flex items-center border-b-2 border-slate-300 dark:border-zinc-700 focus-within:border-[#0078d4] dark:focus-within:border-sky-500 focus-within:bg-[#0078d4]/5 dark:focus-within:bg-sky-500/5 transition duration-200">
                      <Lock className="absolute left-1.5 w-5 h-5 text-slate-400" />
                      <input 
                        className="w-full bg-transparent py-2.5 pl-9 pr-12 text-sm text-slate-800 dark:text-white placeholder-slate-400 border-none outline-none focus:ring-0" 
                        id="password"
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1.5 p-1 text-slate-400 hover:text-[#005faa] transition"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember & Forgot controls */}
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 dark:border-zinc-700 text-[#0078d4] focus:ring-[#0078d4] focus:ring-offset-0 bg-transparent transition"
                      />
                      <span className="ml-2 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition">
                        {t.rememberMe}
                      </span>
                    </label>
                    <a href="#" className="text-[#0078d4] dark:text-sky-400 font-semibold hover:underline decoration-2 underline-offset-4">
                      {t.forgotPassword}
                    </a>
                  </div>

                  {/* Submit Action Button with active indicator */}
                  <div className="pt-2">
                    <button 
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full py-3 bg-[#0078d4] hover:bg-[#005faa] active:scale-[0.98] disabled:bg-slate-400 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/25 dark:shadow-sky-500/10 flex items-center justify-center gap-2 transition duration-200 cursor-pointer"
                    >
                      {isLoggingIn ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{lang === 'vi' ? 'Đang xác thực...' : 'Authenticating...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{t.signIn}</span>
                          <LogIn className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* SSO Enterprise Divider Section */}
                <div className="mt-8">
                  <div className="relative flex items-center justify-center mb-6">
                    <div className="w-full border-t border-slate-300 dark:border-zinc-700"></div>
                    <span className="absolute px-3 bg-white dark:bg-zinc-800 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500">
                      {t.secureEnterprise}
                    </span>
                  </div>

                  {/* Biometric login shortcut */}
                  <button 
                    onClick={() => {
                      setIsLoggingIn(true);
                      setTimeout(() => {
                        setSession({
                          isLoggedIn: true,
                          username: 'student@medical.edu',
                          fullName: 'Nguyễn Hoàng Huân',
                          role: 'student',
                          language: lang,
                          theme: theme
                        });
                        setIsLoggingIn(false);
                      }, 1000);
                    }}
                    className="p-2.5 border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700/50 rounded-lg transition-colors flex items-center justify-center gap-2 w-full text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <Fingerprint className="w-5 h-5 text-slate-500 dark:text-sky-400 animate-pulse" />
                    <span>{t.biometricLogin}</span>
                  </button>
                </div>

              </div>

              {/* Secure Cert Footnote */}
              <footer className="mt-8 text-center space-y-2 text-slate-400 dark:text-zinc-500">
                <p className="text-xs">{t.footerCopy}</p>
                <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider font-bold">
                  <span>{t.versionLabel}</span>
                  <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full"></span>
                  <span>{t.securityCertified}</span>
                </div>
              </footer>
            </main>
          </motion.div>
        ) : (
          // =================== FULL-STACK WORKSPACE MODULE ===================
          <motion.div 
            key="workspace-dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full min-h-screen flex"
          >
            {/* LEFT NAVIGATION SIDEBAR (RAIL) */}
            <aside className="w-64 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#201F1E] flex flex-col z-30 shrink-0">
              
              {/* Sidebar Header Brand block */}
              <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-3">
                <img 
                  alt="Logo" 
                  className="w-10 h-10 object-contain" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjyv-lSwd5scLYjMETyStn7rN9QMq02gSIo5bvsNCIWQ78bLym1MVfzYaEgJyDnGP6DVT7kR6ktY47QNrwvNzI4TrS9hWKoACJAVHOPyTAewWOHbIrC0muYVvX96R6N9vttB6p4svk3yfjz_uiPDtwVq57m_cABZ5vXQEbq9uOYI44Roq3qzqq7OTAtCa9ZpIHz4rpTIA7k-rj6rO118TEmHwK2F0qUGWvaRkwVo9qUoB8mU-TxnmXpQ-CaOJgfYvcC49NKFIhA4Am"
                />
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">{t.portalTitle}</h2>
                  <span className="text-[10px] text-[#0078d4] dark:text-sky-400 font-bold tracking-wider uppercase">ERP PLATFORM</span>
                </div>
              </div>

              {/* Logged in User Profile Details */}
              <div className="p-4 mx-4 my-4 rounded-xl bg-slate-100 dark:bg-zinc-800/60 border border-slate-200/50 dark:border-zinc-800/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#0078d4]/10 dark:bg-sky-500/10 flex items-center justify-center text-[#0078d4] dark:text-sky-300 font-semibold text-sm border border-[#0078d4]/20">
                    {session.fullName.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{session.fullName}</h4>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                      {session.role === 'student' ? 'Học sinh Bán trú' : session.role === 'mentor' ? 'Giáo viên Chủ nhiệm' : 'Cán bộ Y tế'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sidebar Navigation Items */}
              <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {/* Dashboard */}
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${activeTab === 'dashboard' ? 'bg-[#0078d4]/10 text-[#0078d4] dark:bg-sky-500/10 dark:text-sky-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                >
                  <LayoutDashboard className="w-4.5 h-4.5" />
                  <span>{t.navDashboard}</span>
                </button>

                {/* Rotations */}
                <button 
                  onClick={() => setActiveTab('rotations')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${activeTab === 'rotations' ? 'bg-[#0078d4]/10 text-[#0078d4] dark:bg-sky-500/10 dark:text-sky-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                >
                  <Stethoscope className="w-4.5 h-4.5" />
                  <span>{t.navRotations}</span>
                </button>

                {/* Boarding */}
                <button 
                  onClick={() => setActiveTab('boarding')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${activeTab === 'boarding' ? 'bg-[#0078d4]/10 text-[#0078d4] dark:bg-sky-500/10 dark:text-sky-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                >
                  <Home className="w-4.5 h-4.5" />
                  <span>{t.navBoarding}</span>
                </button>

                {/* Appraisals & Grades */}
                <button 
                  onClick={() => setActiveTab('appraisals')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${activeTab === 'appraisals' ? 'bg-[#0078d4]/10 text-[#0078d4] dark:bg-sky-500/10 dark:text-sky-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                >
                  <FileText className="w-4.5 h-4.5" />
                  <span>{t.navAppraisals}</span>
                </button>

                {/* AI Assistant */}
                <button 
                  onClick={() => setActiveTab('aiAdvisor')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${activeTab === 'aiAdvisor' ? 'bg-[#0078d4]/10 text-[#0078d4] dark:bg-sky-500/10 dark:text-sky-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                >
                  <Brain className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400" />
                  <span className="flex items-center gap-1.5">
                    {t.navAiAdvisor}
                    <span className="px-1 py-0.2 bg-indigo-100 text-indigo-800 dark:bg-indigo-950/75 dark:text-indigo-300 text-[9px] rounded-full uppercase tracking-wider font-extrabold font-mono border border-indigo-200 dark:border-indigo-800">GEMINI</span>
                  </span>
                </button>
              </nav>

              {/* Bottom control bar with Logout and preferences */}
              <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#1E1D1D] space-y-3">
                
                {/* Lang and Theme controls side-by-side */}
                <div className="flex items-center justify-between gap-2">
                  <button 
                    onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
                    className="flex-1 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/50 hover:bg-slate-50 dark:hover:bg-zinc-700/50 rounded-lg text-[11px] font-bold text-slate-500 dark:text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{lang === 'vi' ? 'Tiếng Việt' : 'English'}</span>
                  </button>

                  <button 
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/50 hover:bg-slate-50 dark:hover:bg-zinc-700/50 rounded-lg text-slate-500 dark:text-slate-300 transition cursor-pointer"
                    title="Change Theme"
                  >
                    {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                  </button>
                </div>

                {/* Main Logout Action */}
                <button 
                  onClick={() => setSession({ ...session, isLoggedIn: false })}
                  className="w-full py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-bold rounded-lg text-xs transition flex items-center justify-center gap-2 border border-red-200/50 dark:border-red-900/30 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.logout}</span>
                </button>
              </div>

            </aside>

            {/* MAIN CONTENT WORKSPACE STAGE */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
              
              {/* TOP COMMAND CONTEXT BAR */}
              <header className="sticky top-0 bg-white/90 dark:bg-[#1C1B1B]/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 p-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">Hệ thống ERP</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-700" />
                  <span className="text-xs text-[#0078d4] dark:text-sky-400 font-bold uppercase tracking-wider">
                    {activeTab === 'dashboard' && t.navDashboard}
                    {activeTab === 'rotations' && t.navRotations}
                    {activeTab === 'boarding' && t.navBoarding}
                    {activeTab === 'appraisals' && t.navAppraisals}
                    {activeTab === 'aiAdvisor' && t.navAiAdvisor}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Real-time Database Status Indicator */}
                   <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-900/50 text-[10px] font-bold uppercase tracking-wider">
                    <Database className={`w-3.5 h-3.5 ${dbStatus === 'syncing' ? 'animate-spin text-amber-500' : 'text-emerald-500'}`} />
                    <span>
                      {dbStatus === 'syncing' && (lang === 'vi' ? 'ĐANG ĐỒNG BỘ...' : 'DB SYNCING...')}
                      {dbStatus === 'synced' && (lang === 'vi' ? `ĐÃ ĐỒNG BỘ (${dbProvider === 'Firestore' ? 'Đám mây Cloud' : 'Bộ nhớ máy'})` : `SYNCED (${dbProvider === 'Firestore' ? 'Cloud Firestore' : 'Local Disk'})`)}
                      {dbStatus === 'error' && (lang === 'vi' ? 'LỖI ĐỒNG BỘ CSDL' : 'DB SYNC ERROR')}
                    </span>
                  </div>

                  {/* Reset Database Button */}
                  <button
                    onClick={handleResetDatabase}
                    title={lang === 'vi' ? 'Khôi phục CSDL gốc' : 'Reset database to defaults'}
                    className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-200 dark:border-zinc-800 transition cursor-pointer flex items-center gap-1 text-[11px] font-bold bg-white dark:bg-[#201F1E]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{lang === 'vi' ? 'Đặt lại CSDL' : 'Reset DB'}</span>
                  </button>

                  <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full border border-slate-200/50 dark:border-zinc-700/50">
                    <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                      SYSTEM ONLINE
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-lg border border-slate-200/50 dark:border-zinc-700/50">
                    UTC: 2026-07-19
                  </span>
                </div>
              </header>

              {/* CORE DASHBOARD STAGES FOR TAB RENDER */}
              <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
                <AnimatePresence mode="wait">
                  
                  {/* =================== TAB 1: DASHBOARD =================== */}
                  {activeTab === 'dashboard' && (
                    <motion.div
                      key="dashboard-stage"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-8"
                    >
                      {/* Metric Bento Cards Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Bento Card 1: Total Students */}
                        <div className="bg-white dark:bg-[#252423] p-6 rounded-xl shadow-sm hover:shadow-md hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5 border border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between group">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider group-hover:text-blue-500 dark:group-hover:text-sky-400 transition-colors duration-300">{t.metricTotalStudents}</span>
                            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{grandTotal}</h3>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                              +14.2% {lang === 'vi' ? 'so với kỳ trước' : 'vs last term'}
                            </span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-sky-950/40 text-[#0078d4] dark:text-sky-300 group-hover:bg-blue-100 dark:group-hover:bg-sky-900/60 group-hover:scale-110 transition-all duration-300">
                            <UserCheck className="w-6 h-6" />
                          </div>
                        </div>

                        {/* Bento Card 2: Active Placements */}
                        <div className="bg-white dark:bg-[#252423] p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider">{t.metricActiveRotations}</span>
                            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">
                              {rotations.filter(r => r.status === 'Active').length}
                            </h3>
                            <span className="text-[10px] font-bold text-[#0078d4] dark:text-sky-300 uppercase">
                              {lang === 'vi' ? 'Học sinh đang điều trị/theo dõi' : 'Students under care'}
                            </span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300">
                            <Activity className="w-6 h-6" />
                          </div>
                        </div>

                        {/* Bento Card 3: Boarding Occupancy */}
                        <div className="bg-white dark:bg-[#252423] p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider">{t.metricBoardingOccupancy}</span>
                            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">{occupancyPercent}%</h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {rooms.filter(r => r.status !== 'Maintenance Required').length}/{rooms.length} {lang === 'vi' ? 'phòng đạt chuẩn' : 'rooms sanitized'}
                            </span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-green-50 dark:bg-emerald-950/40 text-green-600 dark:text-green-300">
                            <Home className="w-6 h-6" />
                          </div>
                        </div>

                        {/* Bento Card 4: Open Tickets */}
                        <div className="bg-white dark:bg-[#252423] p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider">{t.metricOpenTickets}</span>
                            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">
                              {tickets.filter(t => t.status !== 'Resolved').length}
                            </h3>
                            <span className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1">
                              {tickets.filter(t => t.severity === 'High').length} {lang === 'vi' ? 'yêu cầu y tế khẩn' : 'high priority'}
                            </span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300">
                            <AlertTriangle className="w-6 h-6" />
                          </div>
                        </div>
                      </div>

                      {/* Distribution statistics chart section */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Hospital Distribution Progress Bar chart */}
                        <div className="bg-white dark:bg-[#252423] p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-zinc-800/60 lg:col-span-2 space-y-6">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-slate-700 dark:text-white">{t.distributionByHospital}</h4>
                            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Báo cáo trực quan</span>
                          </div>

                          <div className="space-y-4">
                            {/* Category 1 */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-medium">
                                <span className="text-slate-700 dark:text-slate-300">{lang === 'vi' ? 'Sức khỏe Loại I (Tốt, Phát triển hoàn hảo)' : 'Health Class I (Excellent)'}</span>
                                <span className="font-bold text-[#0078d4]">{classITotal} {lang === 'vi' ? 'học sinh' : 'students'} ({classIPercent}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-[#0078d4] h-full rounded-full" style={{ width: `${classIPercent}%` }}></div>
                              </div>
                            </div>

                            {/* Category 2 */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-medium">
                                <span className="text-slate-700 dark:text-slate-300">{lang === 'vi' ? 'Sức khỏe Loại II (Khá, Đủ thể lực)' : 'Health Class II (Good)'}</span>
                                <span className="font-bold text-emerald-500">{classIITotal} {lang === 'vi' ? 'học sinh' : 'students'} ({classIIPercent}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${classIIPercent}%` }}></div>
                              </div>
                            </div>

                            {/* Category 3 */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-medium">
                                <span className="text-slate-700 dark:text-slate-300">{lang === 'vi' ? 'Sức khỏe Loại III (Trung bình, Cần bổ sung dinh dưỡng)' : 'Health Class III (Average)'}</span>
                                <span className="font-bold text-indigo-500">{classIIITotal} {lang === 'vi' ? 'học sinh' : 'students'} ({classIIIPercent}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${classIIIPercent}%` }}></div>
                              </div>
                            </div>

                            {/* Category 4 */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-medium">
                                <span className="text-slate-700 dark:text-slate-300">{lang === 'vi' ? 'Theo dõi đặc biệt (Bệnh nền: Hen phế quản, Dị ứng)' : 'Special Monitoring (Chronic illness)'}</span>
                                <span className="font-bold text-purple-500">{specialTotal} {lang === 'vi' ? 'học sinh' : 'students'} ({specialPercent}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${specialPercent}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Recent Activities Notification block */}
                        <div className="bg-white dark:bg-[#252423] p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-zinc-800/60 space-y-6">
                          <h4 className="font-bold text-sm text-slate-700 dark:text-white">{t.recentActivities}</h4>
                          <div className="relative border-l border-slate-200 dark:border-zinc-800 pl-4 space-y-5">
                            
                            {mergedActivities.map((act, idx) => (
                              <div key={idx} className="relative text-xs">
                                <div className={`absolute left-[-21px] top-1 w-2.5 h-2.5 ${act.color} rounded-full border-2 border-white dark:border-[#252423]`}></div>
                                <span className="text-slate-400 block mb-0.5">{act.time} - {act.dateLabel}</span>
                                <p className="text-slate-700 dark:text-slate-300">
                                  {act.content}
                                </p>
                              </div>
                            ))}

                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* =================== TAB 2: CLINICAL ROTATIONS =================== */}
                  {activeTab === 'rotations' && (
                    <motion.div
                      key="rotations-stage"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {/* Interactive Mode Switcher with high fidelity */}
                      <div className="bg-white dark:bg-[#252423] p-4 rounded-2xl shadow-sm border border-slate-200/60 dark:border-zinc-800/60 flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>{lang === 'vi' ? 'HỒ SƠ Y TẾ & SỔ CẤP THUỐC' : 'MEDICAL RECORDS & DRUG DISPENSING'}</span>
                          </h3>
                          <p className="text-xs text-slate-400 dark:text-zinc-500 font-semibold">
                            {lang === 'vi' ? 'Chọn chế độ hiển thị thẻ trực quan hoặc bảng tính Excel chuẩn Bộ Y Tế' : 'Toggle between graphic dashboard cards or Ministry-approved Excel sheets'}
                          </p>
                        </div>

                        <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200/50 dark:border-zinc-700/50">
                          <button
                            onClick={() => setUseExcelView(true)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${useExcelView ? 'bg-[#107c41] text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'}`}
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>{lang === 'vi' ? 'Bảng tính Excel chuẩn y tế' : 'Excel Spreadsheet Mode'}</span>
                          </button>
                          <button
                            onClick={() => setUseExcelView(false)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${!useExcelView ? 'bg-[#0078d4] text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:text-[#0078d4]'}`}
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>{lang === 'vi' ? 'Dạng Thẻ Dashboard 📇' : 'Standard Cards View'}</span>
                          </button>
                        </div>
                      </div>

                      {useExcelView ? (
                        <ExcelSheets 
                          lang={lang} 
                          onAddStudentFromExcel={handleAddStudentFromExcel} 
                          soKhambenhData={soKhambenhData}
                          setSoKhambenhData={setSoKhambenhData}
                          phatthuocData={phatthuocData}
                          setPhatthuocData={setPhatthuocData}
                          baocaotonData={baocaotonData}
                          setBaocaotonData={setBaocaotonData}
                        />
                      ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                          {/* Left list of placements and active rotation periods */}
                          <div className="xl:col-span-1 space-y-6">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{lang === 'vi' ? 'Hồ sơ sức khỏe học sinh' : 'Student Health Records'}</h3>
                              <button 
                                onClick={() => setShowAddStudentModal(true)}
                                className="px-2.5 py-1.5 bg-[#0078d4] hover:bg-[#005faa] text-white font-bold text-xs rounded-lg transition-all shadow flex items-center gap-1 cursor-pointer shrink-0"
                              >
                                <Plus className="w-4 h-4" />
                                <span>{lang === 'vi' ? 'Thêm học sinh' : 'Add Student'}</span>
                              </button>
                            </div>

                            {rotations.map(rot => (
                          <div 
                            key={rot.id}
                            onClick={() => {
                              setSelectedRotation(rot);
                              setSelectedLogbook(rot.logbooks[0] || null);
                            }}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedRotation?.id === rot.id ? 'bg-[#0078d4]/5 dark:bg-sky-500/5 border-[#0078d4] dark:border-sky-500 shadow-md' : 'bg-white dark:bg-[#252423] border-slate-200/60 dark:border-zinc-800/60 hover:border-slate-300 dark:hover:border-zinc-700'}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                                  {rot.studentCode}
                                </span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingStudent(rot);
                                    setShowEditStudentModal(true);
                                  }}
                                  className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-slate-300 rounded transition cursor-pointer"
                                  title="Sửa học sinh"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteStudent(rot.id);
                                  }}
                                  className="p-1 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600 rounded transition cursor-pointer"
                                  title="Xóa học sinh"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${rot.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                {rot.status === 'Active' ? t.statusActive : t.statusCompleted}
                              </span>
                            </div>

                            <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{rot.studentName}</h4>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-1.5 mt-1">
                              <Hospital className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{rot.hospitalName}</span>
                            </p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-1.5 mt-0.5">
                              <Bookmark className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{rot.department}</span>
                            </p>

                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                              <span>{rot.logbooks.length} {t.logsCount}</span>
                              <span className="text-[#0078d4] dark:text-sky-400">{rot.clinicalHours} {t.clinicalHours}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Right panel showing detailed logbooks for active placement */}
                      <div className="xl:col-span-2 space-y-6">
                        {selectedRotation ? (
                          <div className="bg-white dark:bg-[#252423] p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-zinc-800/60 space-y-6">
                            
                            {/* Header details with placement overview */}
                            <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-100 dark:border-zinc-800/80">
                              <div>
                                <span className="text-xs text-[#0078d4] dark:text-sky-400 font-bold uppercase tracking-wider">{selectedRotation.department}</span>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-1">{selectedRotation.hospitalName}</h3>
                                <p className="text-xs text-slate-400 dark:text-zinc-500 font-semibold mt-1">
                                  {t.mentor}: {selectedRotation.mentorName} • {selectedRotation.startDate} {lang === 'vi' ? 'đến' : 'to'} {selectedRotation.endDate}
                                </p>
                              </div>

                              <button 
                                onClick={() => setShowAddLogModal(true)}
                                className="px-3.5 py-2 bg-[#0078d4] hover:bg-[#005faa] text-white font-bold text-xs rounded-lg transition-all shadow flex items-center gap-1.5 cursor-pointer"
                              >
                                <Plus className="w-4.5 h-4.5" />
                                <span>{t.addLogTitle}</span>
                              </button>
                            </div>

                            {/* Rotation's Logbooks Sub-split Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                              
                              {/* Logbooks titles column */}
                              <div className="md:col-span-4 space-y-2 border-r border-slate-100 dark:border-zinc-800/80 pr-2">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">{t.logbookTitle}</span>
                                
                                {selectedRotation.logbooks.length === 0 ? (
                                  <p className="text-xs text-slate-400 dark:text-zinc-500 italic p-2">{lang === 'vi' ? 'Chưa có nhật ký nào.' : 'No logs recorded.'}</p>
                                ) : (
                                  selectedRotation.logbooks.map(log => (
                                    <button
                                      key={log.id}
                                      onClick={() => {
                                        setSelectedLogbook(log);
                                        setActiveLogAiFeedback(log.aiAdvisorNotes || '');
                                      }}
                                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex flex-col cursor-pointer ${selectedLogbook?.id === log.id ? 'bg-[#0078d4]/10 text-[#0078d4] dark:bg-sky-500/10 dark:text-sky-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}
                                    >
                                      <span className="truncate">{log.topic}</span>
                                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-1">{log.date}</span>
                                    </button>
                                  ))
                                )}
                              </div>

                              {/* Selected Logbook's detail column */}
                              <div className="md:col-span-8 space-y-4">
                                {selectedLogbook ? (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-200 dark:border-zinc-800">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">{selectedLogbook.topic}</h4>
                                        <button 
                                          onClick={() => {
                                            setEditingLogbook(selectedLogbook);
                                            setShowEditLogModal(true);
                                          }}
                                          className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-slate-400 rounded transition cursor-pointer"
                                          title="Sửa nhật ký"
                                        >
                                          <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          onClick={() => {
                                            handleDeleteLogbook(selectedLogbook.id);
                                          }}
                                          className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 rounded transition cursor-pointer"
                                          title="Xóa nhật ký"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                      <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${selectedLogbook.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'}`}>
                                        {selectedLogbook.status === 'Approved' ? t.statusApproved : t.statusPending}
                                      </span>
                                    </div>

                                    {/* Clinical Case Description */}
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">{t.clinicalCase}</span>
                                      <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#1E1D1D] p-3 rounded-lg border border-slate-200/40 dark:border-zinc-800/40 leading-relaxed font-medium">
                                        {selectedLogbook.clinicalCase}
                                      </p>
                                    </div>

                                    {/* Action details */}
                                    {selectedLogbook.details && (
                                      <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">{t.details}</span>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-[#1E1D1D] p-3 rounded-lg border border-slate-200/40 dark:border-zinc-800/40">
                                          {selectedLogbook.details}
                                        </p>
                                      </div>
                                    )}

                                    {/* AI Assistant Insight Box powered by server response */}
                                    <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-2.5">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                                          <Sparkles className="w-4 h-4" />
                                          <span className="text-xs font-bold uppercase tracking-wider">{t.aiNotes}</span>
                                        </div>

                                        <button 
                                          onClick={() => analyzeLogbookWithAI(selectedLogbook)}
                                          disabled={isAnalyzingLog}
                                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:bg-slate-400 text-white text-[10px] font-bold rounded-md transition-all shadow flex items-center gap-1 cursor-pointer"
                                        >
                                          {isAnalyzingLog ? (
                                            <>
                                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                              <span>{lang === 'vi' ? 'Đang phân tích...' : 'Analyzing...'}</span>
                                            </>
                                          ) : (
                                            <>
                                              <Brain className="w-3 h-3" />
                                              <span>{t.askAi}</span>
                                            </>
                                          )}
                                        </button>
                                      </div>

                                      <div className="text-xs text-indigo-900 dark:text-indigo-200 font-medium leading-relaxed whitespace-pre-line">
                                        {activeLogAiFeedback ? activeLogAiFeedback : selectedLogbook.aiAdvisorNotes ? selectedLogbook.aiAdvisorNotes : (
                                          <p className="italic text-slate-400 dark:text-zinc-500">
                                            {lang === 'vi' ? 'Nhấn nút để kích hoạt AI cố vấn chẩn đoán phân tích ca lâm sàng này.' : 'Press the button to activate the AI mentor for clinical insights.'}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Mentor Feedback notes */}
                                    {selectedLogbook.mentorFeedback && (
                                      <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/10 rounded-xl border border-emerald-100/60 dark:border-emerald-900/30 space-y-1.5">
                                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                                          {t.mentorNotes}
                                        </span>
                                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                          {selectedLogbook.mentorFeedback}
                                        </p>
                                      </div>
                                    )}

                                  </div>
                                ) : (
                                  <div className="h-40 flex items-center justify-center text-xs text-slate-400 dark:text-zinc-500 italic">
                                    {lang === 'vi' ? 'Chọn một nhật ký để xem chi tiết.' : 'Select a logbook entry to see clinical records.'}
                                  </div>
                                )}
                              </div>

                            </div>

                          </div>
                        ) : (
                          <div className="h-60 flex items-center justify-center text-sm text-slate-400 dark:text-zinc-500 italic">
                            {lang === 'vi' ? 'Chọn một sinh viên đi lâm sàng để bắt đầu.' : 'Select a clinical student placement to start.'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                    </motion.div>
                  )}

                  {/* =================== TAB 3: BOARDING & DORMITORY =================== */}
                  {activeTab === 'boarding' && (
                    <motion.div
                      key="boarding-stage"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                      {/* Top Header Row with facility report triggers */}
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{lang === 'vi' ? 'Hệ thống Quản lý Nội trú Ký túc xá' : 'Dormitory & Boarding Housing'}</h3>
                          <p className="text-xs text-slate-400 dark:text-zinc-500 font-semibold mt-1">
                            {lang === 'vi' ? 'Phân khu nam nữ cách biệt, đảm bảo an ninh phòng dịch và tiện nghi.' : 'Separated male/female zones, clean facility logs and secure checks.'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setShowAddRoomModal(true)}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{lang === 'vi' ? 'Thêm phòng' : 'Add Room'}</span>
                          </button>

                          <button 
                            onClick={() => setShowAddTicketModal(true)}
                            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-all shadow flex items-center gap-1.5 cursor-pointer"
                          >
                            <AlertTriangle className="w-4.5 h-4.5" />
                            <span>{t.createTicket}</span>
                          </button>
                        </div>
                      </div>

                      {/* Rooms overview grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {rooms.map(rm => (
                          <div 
                            key={rm.id}
                            className="bg-white dark:bg-[#252423] p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-zinc-800/60 flex flex-col justify-between space-y-4"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-xs text-slate-400 font-bold block">{rm.floor}</span>
                                <h4 className="text-xl font-black text-slate-800 dark:text-white mt-1">Phòng {rm.roomNumber}</h4>
                              </div>

                              <div className="flex flex-col items-end gap-1.5">
                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${rm.genderZone === 'Nam' || rm.genderZone === 'Male' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300' : 'bg-pink-100 text-pink-800 dark:bg-pink-950/40 dark:text-pink-300'}`}>
                                  {rm.genderZone}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => {
                                      setEditingRoom(rm);
                                      setShowEditRoomModal(true);
                                    }}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 rounded transition cursor-pointer"
                                    title="Sửa phòng"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      handleDeleteRoom(rm.id);
                                    }}
                                    className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 rounded transition cursor-pointer"
                                    title="Xóa phòng"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* resident list */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 tracking-wider block">{t.residents}</span>
                              <div className="flex flex-wrap gap-1">
                                {rm.residentNames.map((resName, i) => (
                                  <span 
                                    key={i} 
                                    className="px-2 py-1 bg-slate-50 dark:bg-zinc-800 text-[10px] font-medium rounded border border-slate-200/30 dark:border-zinc-700/30 text-slate-600 dark:text-slate-300"
                                  >
                                    {resName}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Occupied rate bar */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400">{t.roomCapacity}</span>
                                <span className="font-bold">{rm.occupied} / {rm.capacity}</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${rm.occupied === rm.capacity ? 'bg-indigo-500' : 'bg-[#0078d4]'}`} 
                                  style={{ width: `${(rm.occupied / rm.capacity) * 100}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Room Condition Tag */}
                            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex justify-between items-center text-xs">
                              <span className="text-slate-400">{t.roomStatus}</span>
                              <span className={`font-bold flex items-center gap-1 ${rm.status === 'Excellent' ? 'text-green-600 dark:text-emerald-400' : rm.status === 'Good' ? 'text-blue-600 dark:text-sky-400' : 'text-amber-500'}`}>
                                <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
                                {rm.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Maintenance tickets List and updates */}
                      <div className="bg-white dark:bg-[#252423] p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-zinc-800/60 space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-4 flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-bold text-sm text-slate-700 dark:text-white">{t.maintenanceTickets}</h4>
                            <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-md">
                              {tickets.filter(t => t.status !== 'Resolved').length} Active Alerts
                            </span>
                          </div>
                          
                          {/* Section-specific Add Ticket Trigger */}
                          <button 
                            onClick={() => setShowAddTicketModal(true)}
                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-amber-500/10 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{lang === 'vi' ? 'Tạo Phiếu Mới' : 'Create Ticket'}</span>
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 uppercase tracking-wider font-semibold">
                                <th className="pb-3">{t.roomNumber}</th>
                                <th className="pb-3">{t.ticketTitle}</th>
                                <th className="pb-3">Date</th>
                                <th className="pb-3">{t.severity}</th>
                                <th className="pb-3">{t.ticketStatus}</th>
                                <th className="pb-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tickets.map(tck => (
                                <tr key={tck.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                                  <td className="py-3.5 font-bold text-[#0078d4] dark:text-sky-400">P.{tck.roomNumber}</td>
                                  <td className="py-3.5">
                                    <div className="font-semibold text-slate-800 dark:text-white">{tck.title}</div>
                                    <div className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 truncate max-w-md">{tck.description}</div>
                                  </td>
                                  <td className="py-3.5 font-mono text-slate-400">{tck.dateCreated}</td>
                                  <td className="py-3.5">
                                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${tck.severity === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300' : tck.severity === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                      {tck.severity}
                                    </span>
                                  </td>
                                  <td className="py-3.5">
                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${tck.status === 'Resolved' ? 'bg-green-100 text-green-800 dark:bg-emerald-950/50 dark:text-emerald-300' : tck.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'}`}>
                                      {tck.status}
                                    </span>
                                  </td>
                                  <td className="py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {tck.status !== 'Resolved' ? (
                                        <button 
                                          onClick={() => {
                                            const updated = tickets.map(ti => {
                                              if (ti.id === tck.id) {
                                                return { ...ti, status: 'Resolved' as const };
                                              }
                                              return ti;
                                            });
                                            setTickets(updated);
                                          }}
                                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold rounded cursor-pointer transition"
                                        >
                                          {lang === 'vi' ? 'Xong' : 'Resolve'}
                                        </button>
                                      ) : (
                                        <span className="text-slate-400 font-bold text-[10px] uppercase">{lang === 'vi' ? 'Đã sửa' : 'Complete'}</span>
                                      )}
                                      <button 
                                        onClick={() => {
                                          setEditingTicket(tck);
                                          setShowEditTicketModal(true);
                                        }}
                                        className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 rounded transition cursor-pointer"
                                        title="Sửa phiếu"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => {
                                          handleDeleteTicket(tck.id);
                                        }}
                                        className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 rounded transition cursor-pointer"
                                        title="Xóa phiếu"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* =================== TAB 4: APPRAISALS & GRADES =================== */}
                  {activeTab === 'appraisals' && (
                    <motion.div
                      key="appraisals-stage"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                      {/* Top title bar with triggers */}
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{lang === 'vi' ? 'Kết quả Đánh giá & Điểm thi Lâm sàng' : 'Appraisals & Clinical Scores'}</h3>
                          <p className="text-xs text-slate-400 dark:text-zinc-500 font-semibold mt-1">
                            {lang === 'vi' ? 'Ghi nhận kết quả thi lý thuyết lâm sàng, kỹ năng thủ thuật và thái độ đạo đức y khoa.' : 'Comprehensive evaluation scorecards, signatures of hospital advisors.'}
                          </p>
                        </div>

                        <button 
                          onClick={() => {
                            setShowAppraisalForm(!showAppraisalForm);
                            if (!showAppraisalForm) {
                              const rotationNames = rotations.map(r => r.studentName);
                              const excelNames = soKhambenhData.map(r => r.hoTen).filter(Boolean);
                              const allUniqueNames = Array.from(new Set([...rotationNames, ...excelNames]));
                              if (allUniqueNames.length > 0) {
                                const firstStudentName = allUniqueNames[0];
                                setNewAppStudentName(firstStudentName);
                                const matched = rotations.find(r => r.studentName === firstStudentName);
                                if (matched) {
                                  setNewAppDept(matched.hospitalName);
                                  setNewAppHours(matched.clinicalHours);
                                } else {
                                  const matchedExcel = soKhambenhData.find(r => r.hoTen === firstStudentName);
                                  if (matchedExcel) {
                                    setNewAppDept(matchedExcel.lop || "Lớp bán trú");
                                    setNewAppHours(22.0);
                                  }
                                }
                              }
                            }
                          }}
                          className="px-3.5 py-2 bg-[#0078d4] hover:bg-[#005faa] text-white font-bold text-xs rounded-lg transition-all shadow flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4.5 h-4.5" />
                          <span>{lang === 'vi' ? 'Ghi nhận điểm thi mới' : 'Record New Appraisal'}</span>
                        </button>
                      </div>

                      {/* appraisal evaluation recorder form */}
                      <AnimatePresence>
                        {showAppraisalForm && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white dark:bg-[#252423] p-6 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-lg overflow-hidden"
                          >
                            <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-zinc-800/80 pb-2">
                              {t.appraisalForm}
                            </h4>
                            <form onSubmit={handleAddAppraisal} className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
                              {/* Search student in form */}
                              <div className="space-y-1">
                                <label className="font-bold text-slate-400 block">
                                  {lang === 'vi' ? '1. Gõ tìm học sinh' : '1. Search Student'}
                                </label>
                                <div className="relative">
                                  <input 
                                    type="text"
                                    placeholder={lang === 'vi' ? 'Nhập tên tìm...' : 'Type name...'}
                                    value={studentFilterInForm}
                                    onChange={(e) => {
                                      const filterVal = e.target.value;
                                      setStudentFilterInForm(filterVal);
                                      
                                      const rotationNames = rotations.map(r => r.studentName);
                                      const excelNames = soKhambenhData.map(r => r.hoTen).filter(Boolean);
                                      const allUniqueNames = Array.from(new Set([...rotationNames, ...excelNames]));
                                      const matchedFirst = allUniqueNames.find(name => 
                                        name.toLowerCase().includes(filterVal.toLowerCase())
                                      );
                                      if (matchedFirst) {
                                        setNewAppStudentName(matchedFirst);
                                        const matched = rotations.find(r => r.studentName === matchedFirst);
                                        if (matched) {
                                          setNewAppDept(matched.hospitalName);
                                          setNewAppHours(matched.clinicalHours);
                                        } else {
                                          const matchedExcel = soKhambenhData.find(r => r.hoTen === matchedFirst);
                                          if (matchedExcel) {
                                            setNewAppDept(matchedExcel.lop || "Lớp bán trú");
                                            setNewAppHours(22.0);
                                          }
                                        }
                                      }
                                    }}
                                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2 pl-7 rounded border border-slate-200 dark:border-zinc-700 font-bold"
                                  />
                                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="font-bold text-slate-400 block">
                                  {lang === 'vi' ? '2. Chọn học sinh tương thích' : '2. Select Matched Student'}
                                </label>
                                <select 
                                  value={newAppStudentName}
                                  onChange={(e) => {
                                    const name = e.target.value;
                                    setNewAppStudentName(name);
                                    const matched = rotations.find(r => r.studentName === name);
                                    if (matched) {
                                      setNewAppDept(matched.hospitalName);
                                      setNewAppHours(matched.clinicalHours);
                                    } else {
                                      const matchedExcel = soKhambenhData.find(r => r.hoTen === name);
                                      if (matchedExcel) {
                                        setNewAppDept(matchedExcel.lop || "Lớp bán trú");
                                        setNewAppHours(22.0);
                                      }
                                    }
                                  }}
                                  className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded border border-slate-200 dark:border-zinc-700 font-bold text-slate-800 dark:text-white"
                                >
                                  {(() => {
                                    const rotationNames = rotations.map(r => r.studentName);
                                    const excelNames = soKhambenhData.map(r => r.hoTen).filter(Boolean);
                                    const allUniqueNames = Array.from(new Set([...rotationNames, ...excelNames]));
                                    
                                    const filteredNames = allUniqueNames.filter(name => 
                                      name.toLowerCase().includes(studentFilterInForm.toLowerCase())
                                    );

                                    if (filteredNames.length === 0) {
                                      return (
                                        <option value="">{lang === 'vi' ? '-- Không tìm thấy --' : '-- No students found --'}</option>
                                      );
                                    }

                                    return filteredNames.map((name) => (
                                      <option key={name} value={name}>
                                        {name}
                                      </option>
                                    ));
                                  })()}
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="font-bold text-slate-400 block">{t.department}</label>
                                <input 
                                  type="text" 
                                  value={newAppDept}
                                  onChange={(e) => setNewAppDept(e.target.value)}
                                  className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded border border-slate-200 dark:border-zinc-700"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="font-bold text-slate-400 block">{t.clinicalHours}</label>
                                <input 
                                  type="number" 
                                  value={newAppHours}
                                  onChange={(e) => setNewAppHours(parseInt(e.target.value))}
                                  className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded border border-slate-200 dark:border-zinc-700"
                                />
                              </div>

                              {/* scores range inputs */}
                              <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                  <label className="font-bold text-slate-400 block" title="Knowledge">{lang === 'vi' ? 'Thuyết' : 'Kno.'}</label>
                                  <input 
                                    type="number" 
                                    step="0.1" 
                                    min="0" 
                                    max="10"
                                    value={newAppScoreKnowledge}
                                    onChange={(e) => setNewAppScoreKnowledge(parseFloat(e.target.value))}
                                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded border border-slate-200 dark:border-zinc-700"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="font-bold text-slate-400 block" title="Clinical Skills">{lang === 'vi' ? 'Năng' : 'Skil.'}</label>
                                  <input 
                                    type="number" 
                                    step="0.1" 
                                    min="0" 
                                    max="10"
                                    value={newAppScoreSkills}
                                    onChange={(e) => setNewAppScoreSkills(parseFloat(e.target.value))}
                                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded border border-slate-200 dark:border-zinc-700"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="font-bold text-slate-400 block" title="Attitude">{lang === 'vi' ? 'Thái' : 'Atti.'}</label>
                                  <input 
                                    type="number" 
                                    step="0.1" 
                                    min="0" 
                                    max="10"
                                    value={newAppScoreAttitude}
                                    onChange={(e) => setNewAppScoreAttitude(parseFloat(e.target.value))}
                                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded border border-slate-200 dark:border-zinc-700"
                                  />
                                </div>
                              </div>

                              {/* evaluation notes */}
                              <div className="md:col-span-4 space-y-1">
                                <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Ý kiến nhận xét chi tiết' : 'Detailed appraisal notes'}</label>
                                <textarea 
                                  rows={2}
                                  value={newAppNotes}
                                  onChange={(e) => setNewAppNotes(e.target.value)}
                                  placeholder={lang === 'vi' ? 'Nhập ghi chú nhận định, thái độ làm việc...' : 'Enter clinical progress, attendance notes...'}
                                  className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                                  required
                                ></textarea>
                              </div>

                              <div className="md:col-span-4 flex justify-end gap-2">
                                <button 
                                  type="button" 
                                  onClick={() => setShowAppraisalForm(false)}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition font-bold"
                                >
                                  {t.cancel}
                                </button>
                                <button 
                                  type="submit" 
                                  className="px-3.5 py-1.5 bg-[#0078d4] hover:bg-[#005faa] text-white rounded transition font-bold"
                                >
                                  {t.save}
                                </button>
                              </div>
                            </form>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Search & Statistics Bar */}
                      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-slate-200/50 dark:border-zinc-800/50">
                        <div className="relative w-full sm:w-80">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input 
                            type="text"
                            placeholder={lang === 'vi' ? 'Tìm nhanh học sinh trong phiếu đánh giá...' : 'Quick search student in appraisals...'}
                            value={appraisalSearch}
                            onChange={(e) => setAppraisalSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 w-full text-xs rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-zinc-200 font-medium shadow-sm"
                          />
                        </div>
                        <div className="text-xs font-mono font-bold text-slate-500 dark:text-zinc-400">
                          {lang === 'vi' ? `Tìm thấy ${appraisals.filter(app => {
                            if (!appraisalSearch) return true;
                            const searchLower = appraisalSearch.toLowerCase();
                            return (
                              app.studentName.toLowerCase().includes(searchLower) ||
                              app.studentCode.toLowerCase().includes(searchLower) ||
                              app.department.toLowerCase().includes(searchLower)
                            );
                          }).length} / ${appraisals.length} kết quả` : `Found ${appraisals.filter(app => {
                            if (!appraisalSearch) return true;
                            const searchLower = appraisalSearch.toLowerCase();
                            return (
                              app.studentName.toLowerCase().includes(searchLower) ||
                              app.studentCode.toLowerCase().includes(searchLower) ||
                              app.department.toLowerCase().includes(searchLower)
                            );
                          }).length} / ${appraisals.length} results`}
                        </div>
                      </div>

                      {/* Grades scorecard table */}
                      <div className="bg-white dark:bg-[#252423] p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-zinc-800/60 space-y-6">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 uppercase tracking-wider font-semibold">
                                <th className="pb-3">{t.studentCode}</th>
                                <th className="pb-3">{t.studentName}</th>
                                <th className="pb-3">{t.department}</th>
                                <th className="pb-3">{t.clinicalHours}</th>
                                <th className="pb-3">{t.knowledge}</th>
                                <th className="pb-3">{t.skills}</th>
                                <th className="pb-3">{t.attitude}</th>
                                <th className="pb-3">{t.overall}</th>
                                <th className="pb-3">{t.approvedBy}</th>
                                <th className="pb-3 text-right">{lang === 'vi' ? 'Hành động' : 'Actions'}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {appraisals.filter(app => {
                                if (!appraisalSearch) return true;
                                const searchLower = appraisalSearch.toLowerCase();
                                return (
                                  app.studentName.toLowerCase().includes(searchLower) ||
                                  app.studentCode.toLowerCase().includes(searchLower) ||
                                  app.department.toLowerCase().includes(searchLower)
                                );
                              }).map(app => (
                                <tr key={app.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                                  <td className="py-3.5 font-mono font-bold text-slate-400">{app.studentCode}</td>
                                  <td className="py-3.5">
                                    <span className="font-bold text-slate-800 dark:text-white block">{app.studentName}</span>
                                  </td>
                                  <td className="py-3.5 font-medium text-slate-500 dark:text-zinc-400">{app.department}</td>
                                  <td className="py-3.5 font-bold text-slate-500 dark:text-zinc-400">
                                    {app.clinicalHoursCompleted} / {app.clinicalHoursRequired}h
                                  </td>
                                  <td className="py-3.5 font-mono font-semibold">{app.knowledgeScore}</td>
                                  <td className="py-3.5 font-mono font-semibold">{app.skillsScore}</td>
                                  <td className="py-3.5 font-mono font-semibold">{app.attitudeScore}</td>
                                  <td className="py-3.5 font-mono font-black text-[#0078d4] dark:text-sky-400 text-sm">
                                    {app.overallScore}
                                  </td>
                                  <td className="py-3.5 text-xs text-slate-400 dark:text-zinc-500 italic">
                                    {app.approvedBy}
                                  </td>
                                  <td className="py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button 
                                        onClick={() => {
                                          setEditingAppraisal(app);
                                          setShowEditAppraisalModal(true);
                                        }}
                                        className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 rounded transition cursor-pointer"
                                        title="Sửa đánh giá"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => {
                                          handleDeleteAppraisal(app.id);
                                        }}
                                        className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 rounded transition cursor-pointer"
                                        title="Xóa đánh giá"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* =================== TAB 5: AI ASSISTANT CHAT =================== */}
                  {activeTab === 'aiAdvisor' && (
                    <motion.div
                      key="aiAdvisor-stage"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-white dark:bg-[#252423] rounded-2xl shadow-sm border border-slate-200/60 dark:border-zinc-800/60 h-[calc(100vh-180px)] flex flex-col overflow-hidden"
                    >
                      {/* welcome header */}
                      <div className="p-5 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-[#1E1D1D]/50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">{t.aiWelcome}</h3>
                            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{t.aiIntro}</p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-bold text-[10px] uppercase tracking-wider">
                          Gemini 3.5 Flash Active
                        </span>
                      </div>

                      {/* Chat Logs Stage */}
                      <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {aiLogs.map((msg, idx) => (
                          <div 
                            key={idx}
                            className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border text-xs font-bold ${msg.sender === 'user' ? 'bg-[#0078d4]/10 border-[#0078d4]/20 text-[#0078d4] dark:text-sky-300' : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 border-indigo-100'}`}>
                              {msg.sender === 'user' ? 'H' : <Sparkles className="w-3.5 h-3.5" />}
                            </div>

                            <div className={`p-4 rounded-2xl text-xs leading-relaxed font-medium whitespace-pre-wrap shadow-sm border ${msg.sender === 'user' ? 'bg-[#0078d4] text-white border-[#0078d4]' : 'bg-slate-50 dark:bg-[#1E1D1D] text-slate-700 dark:text-slate-300 border-slate-200/50 dark:border-zinc-800/40'}`}>
                              {msg.text}
                              <span className="block text-[9px] opacity-60 text-right mt-1.5 font-mono">{msg.timestamp}</span>
                            </div>
                          </div>
                        ))}

                        {isAiGenerating && (
                          <div className="flex gap-3 max-w-3xl">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-indigo-50 text-indigo-600 border border-indigo-100">
                              <Sparkles className="w-3.5 h-3.5 animate-spin" />
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-[#1E1D1D] text-slate-400 rounded-2xl text-xs border border-slate-200/50 dark:border-zinc-800/40 flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                              <span>{t.generating}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quick chip helpers to save keystrokes */}
                      <div className="p-3 bg-slate-50 dark:bg-[#1E1D1D] border-t border-slate-100 dark:border-zinc-800/80 flex flex-wrap gap-2 overflow-x-auto text-[11px]">
                        <span className="text-slate-400 font-bold flex items-center self-center uppercase tracking-wider text-[9px] mr-1">{lang === 'vi' ? 'Gợi ý câu hỏi:' : 'Suggestions:'}</span>
                        
                        <button 
                          onClick={() => handleQuickPromptClick(lang === 'vi' ? "Hướng dẫn quy trình sơ cứu học sinh bị trầy xước, chảy máu tay chân tại sân trường?" : "Guide to first aid for students with abrasions and bleeding limbs on the school yard?")}
                          className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-500 dark:text-slate-300 rounded font-semibold cursor-pointer transition"
                        >
                          {lang === 'vi' ? "Sơ cứu trầy xước học đường" : "School First Aid"}
                        </button>

                        <button 
                          onClick={() => handleQuickPromptClick(lang === 'vi' ? "Viết thông báo nhắc nhở nội quy giữ vệ sinh chung cho phòng nội trú học sinh?" : "Write an announcement reminder about clean common rules for student dorm rooms.")}
                          className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-500 dark:text-slate-300 rounded font-semibold cursor-pointer transition"
                        >
                          {lang === 'vi' ? "Nội quy vệ sinh phòng" : "Dorm Cleanliness Rule"}
                        </button>

                        <button 
                          onClick={() => handleQuickPromptClick(lang === 'vi' ? "Cách tư vấn chế độ dinh dưỡng bán trú cho học sinh bị suy dinh dưỡng thể nhẹ cân?" : "Outline guidance on boarding nutrition plans for students classified as underweight.")}
                          className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-500 dark:text-slate-300 rounded font-semibold cursor-pointer transition"
                        >
                          {lang === 'vi' ? "Tư vấn dinh dưỡng bán trú" : "Boarding Nutrition Guidance"}
                        </button>
                      </div>

                      {/* Input Actions Panel */}
                      <div className="p-4 bg-white dark:bg-[#201F1E] border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                        <input 
                          type="text"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendAiChat()}
                          placeholder={t.aiPlaceholder}
                          disabled={isAiGenerating}
                          className="flex-1 bg-slate-50 dark:bg-zinc-800 p-2.5 rounded-xl text-xs border border-slate-200/50 dark:border-zinc-700/50 text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                        />
                        <button 
                          onClick={handleSendAiChat}
                          disabled={isAiGenerating}
                          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl transition flex items-center justify-center cursor-pointer shadow shadow-indigo-600/20"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>

                    </motion.div>
                  )}

                </AnimatePresence>
              </main>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* =================== MODAL: ADD CLINICAL LOGBOOK =================== */}
      {/* ================================================================= */}
      <AnimatePresence>
        {showAddLogModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#252423] p-6 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4"
            >
              <h4 className="font-bold text-base text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                {t.addLogTitle}
              </h4>

              <form onSubmit={handleAddLogbook} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">{t.topic}</label>
                  <input 
                    type="text" 
                    value={newLogTopic}
                    onChange={(e) => setNewLogTopic(e.target.value)}
                    placeholder="Ví dụ: Kỹ thuật chọc dò dịch tủy sống"
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">{t.clinicalCase}</label>
                  <textarea 
                    rows={3}
                    value={newLogCase}
                    onChange={(e) => setNewLogCase(e.target.value)}
                    placeholder="Bệnh nhân nam 45 tuổi, đau đầu cấp tính kèm nôn vọt, cứng gáy dương tính..."
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                    required
                  ></textarea>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">{t.details}</label>
                  <textarea 
                    rows={3}
                    value={newLogDetails}
                    onChange={(e) => setNewLogDetails(e.target.value)}
                    placeholder="Được sự giám sát của BS hướng dẫn, tôi thực hiện sát khuẩn, gây tê L3-L4..."
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddLogModal(false)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-bold"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-[#0078d4] hover:bg-[#005faa] text-white rounded-lg transition font-bold"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* =================== MODAL: REPORT DORM TICKET =================== */}
      {/* ================================================================= */}
      <AnimatePresence>
        {showAddTicketModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#252423] p-6 rounded-2xl max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4"
            >
              <h4 className="font-bold text-base text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                {t.createTicket}
              </h4>

              <form onSubmit={handleAddTicket} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{t.roomNumber}</label>
                    <select 
                      value={newTicketRoom}
                      onChange={(e) => setNewTicketRoom(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                    >
                      <option value="101">P.101</option>
                      <option value="102">P.102</option>
                      <option value="201">P.201</option>
                      <option value="202">P.202</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{t.severity}</label>
                    <select 
                      value={newTicketSeverity}
                      onChange={(e) => setNewTicketSeverity(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">{t.ticketTitle}</label>
                  <input 
                    type="text" 
                    value={newTicketTitle}
                    onChange={(e) => setNewTicketTitle(e.target.value)}
                    placeholder="Ví dụ: Hỏng vòi sen nhà tắm"
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Chi tiết sự cố' : 'Issue details'}</label>
                  <textarea 
                    rows={3}
                    value={newTicketDesc}
                    onChange={(e) => setNewTicketDesc(e.target.value)}
                    placeholder={t.ticketPlaceholder}
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                    required
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddTicketModal(false)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-bold"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition font-bold"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* =================== MODAL: ADD STUDENT PROFILE =================== */}
      {/* ================================================================= */}
      <AnimatePresence>
        {showAddStudentModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#252423] p-6 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <h4 className="font-bold text-base text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                {lang === 'vi' ? 'Thêm Hồ sơ Sức khỏe Học sinh' : 'Add Student Health Record'}
              </h4>

              <form onSubmit={handleAddStudent} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Họ và tên học sinh' : 'Student Full Name'}</label>
                    <input 
                      type="text" 
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder={lang === 'vi' ? 'Ví dụ: Nguyễn Văn A' : 'e.g. Nguyen Van A'}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Mã học sinh' : 'Student Code'}</label>
                    <input 
                      type="text" 
                      value={newStudentCode}
                      onChange={(e) => setNewStudentCode(e.target.value)}
                      placeholder="HS-2026112"
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Lớp & Khối' : 'Class & Grade'}</label>
                    <input 
                      type="text" 
                      value={newStudentClass}
                      onChange={(e) => setNewStudentClass(e.target.value)}
                      placeholder="Lớp 12A1 (Khối 12)"
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Giáo viên chủ nhiệm' : 'Homeroom Teacher'}</label>
                    <input 
                      type="text" 
                      value={newStudentMentor}
                      onChange={(e) => setNewStudentMentor(e.target.value)}
                      placeholder="Cô Nguyễn Thị Mai"
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Nhóm sức khỏe / Bệnh nền' : 'Health Status Group'}</label>
                    <select 
                      value={newStudentHealthGroup}
                      onChange={(e) => setNewStudentHealthGroup(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                    >
                      <option value={lang === 'vi' ? 'Sức khỏe loại I (Bình thường)' : 'Health Class I (Normal)'}>{lang === 'vi' ? 'Loại I (Tốt, Phát triển hoàn hảo)' : 'Class I (Excellent)'}</option>
                      <option value={lang === 'vi' ? 'Sức khỏe loại II (Bình thường)' : 'Health Class II (Normal)'}>{lang === 'vi' ? 'Loại II (Khá, Đủ thể lực)' : 'Class II (Good)'}</option>
                      <option value={lang === 'vi' ? 'Sức khỏe loại III (Suy dinh dưỡng)' : 'Health Class III (Underweight)'}>{lang === 'vi' ? 'Loại III (Trung bình, Cần bổ sung dinh dưỡng)' : 'Class III (Average)'}</option>
                      <option value={lang === 'vi' ? 'Theo dõi đặc biệt (Hen phế quản)' : 'Special Monitoring (Asthma)'}>{lang === 'vi' ? 'Theo dõi đặc biệt (Hen phế quản, Bệnh nền)' : 'Special Monitoring (Chronic disease)'}</option>
                      <option value={lang === 'vi' ? 'Theo dõi đặc biệt (Dị ứng thực phẩm)' : 'Special Monitoring (Food Allergy)'}>{lang === 'vi' ? 'Theo dõi đặc biệt (Dị ứng thực phẩm)' : 'Special Monitoring (Allergies)'}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Chỉ số BMI học sinh' : 'Student BMI Index'}</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={newStudentBMI}
                      onChange={(e) => setNewStudentBMI(parseFloat(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Ngày kiểm tra gần nhất' : 'Last Health Exam'}</label>
                    <input 
                      type="date" 
                      value={newStudentStartDate}
                      onChange={(e) => setNewStudentStartDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Ngày hẹn kiểm tra tiếp theo' : 'Next Scheduled Exam'}</label>
                    <input 
                      type="date" 
                      value={newStudentEndDate}
                      onChange={(e) => setNewStudentEndDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Trạng thái theo dõi' : 'Monitoring Status'}</label>
                  <select 
                    value={newStudentStatus}
                    onChange={(e) => setNewStudentStatus(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                  >
                    <option value="Active">{lang === 'vi' ? 'Đang hoạt động / Cần theo dõi' : 'Active / Under Monitoring'}</option>
                    <option value="Completed">{lang === 'vi' ? 'Đã hoàn thành đợt điều trị' : 'Completed / Standard Care'}</option>
                    <option value="Upcoming">{lang === 'vi' ? 'Chờ khám định kỳ đợt tới' : 'Upcoming Examination'}</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddStudentModal(false)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-bold"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-[#0078d4] hover:bg-[#005faa] text-white rounded-lg transition font-bold"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* =================== MODAL: EDIT STUDENT PROFILE =================== */}
      {/* ================================================================= */}
      <AnimatePresence>
        {showEditStudentModal && editingStudent && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#252423] p-6 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <h4 className="font-bold text-base text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                {lang === 'vi' ? 'Sửa Hồ sơ Sức khỏe Học sinh' : 'Edit Student Health Record'}
              </h4>

              <form onSubmit={handleEditStudentSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Họ và tên học sinh' : 'Student Full Name'}</label>
                    <input 
                      type="text" 
                      value={editingStudent.studentName}
                      onChange={(e) => setEditingStudent({ ...editingStudent, studentName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Mã học sinh' : 'Student Code'}</label>
                    <input 
                      type="text" 
                      value={editingStudent.studentCode}
                      onChange={(e) => setEditingStudent({ ...editingStudent, studentCode: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Lớp & Khối' : 'Class & Grade'}</label>
                    <input 
                      type="text" 
                      value={editingStudent.hospitalName}
                      onChange={(e) => setEditingStudent({ ...editingStudent, hospitalName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Giáo viên chủ nhiệm' : 'Homeroom Teacher'}</label>
                    <input 
                      type="text" 
                      value={editingStudent.mentorName}
                      onChange={(e) => setEditingStudent({ ...editingStudent, mentorName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Nhóm sức khỏe / Bệnh nền' : 'Health Status Group'}</label>
                    <select 
                      value={editingStudent.department}
                      onChange={(e) => setEditingStudent({ ...editingStudent, department: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                    >
                      <option value="Sức khỏe loại I (Bình thường)">{lang === 'vi' ? 'Loại I (Tốt, Phát triển hoàn hảo)' : 'Class I (Excellent)'}</option>
                      <option value="Sức khỏe loại II (Bình thường)">{lang === 'vi' ? 'Loại II (Khá, Đủ thể lực)' : 'Class II (Good)'}</option>
                      <option value="Sức khỏe loại III (Suy dinh dưỡng)">{lang === 'vi' ? 'Loại III (Trung bình, Cần bổ sung dinh dưỡng)' : 'Class III (Average)'}</option>
                      <option value="Theo dõi đặc biệt (Hen phế quản)">{lang === 'vi' ? 'Theo dõi đặc biệt (Hen phế quản, Bệnh nền)' : 'Special Monitoring (Chronic disease)'}</option>
                      <option value="Theo dõi đặc biệt (Dị ứng thực phẩm)">{lang === 'vi' ? 'Theo dõi đặc biệt (Dị ứng thực phẩm)' : 'Special Monitoring (Allergies)'}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Chỉ số BMI học sinh' : 'Student BMI Index'}</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={editingStudent.clinicalHours}
                      onChange={(e) => setEditingStudent({ ...editingStudent, clinicalHours: parseFloat(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Ngày kiểm tra gần nhất' : 'Last Exam Date'}</label>
                    <input 
                      type="date" 
                      value={editingStudent.startDate}
                      onChange={(e) => setEditingStudent({ ...editingStudent, startDate: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Ngày kiểm tra tiếp theo' : 'Next Exam Date'}</label>
                    <input 
                      type="date" 
                      value={editingStudent.endDate}
                      onChange={(e) => setEditingStudent({ ...editingStudent, endDate: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Trạng thái theo dõi' : 'Monitoring Status'}</label>
                  <select 
                    value={editingStudent.status}
                    onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                  >
                    <option value="Active">{lang === 'vi' ? 'Đang hoạt động / Cần theo dõi' : 'Active / Under Monitoring'}</option>
                    <option value="Completed">{lang === 'vi' ? 'Đã hoàn thành đợt điều trị' : 'Completed / Standard Care'}</option>
                    <option value="Upcoming">{lang === 'vi' ? 'Chờ khám định kỳ đợt tới' : 'Upcoming Examination'}</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowEditStudentModal(false);
                      setEditingStudent(null);
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-bold"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-[#0078d4] hover:bg-[#005faa] text-white rounded-lg transition font-bold"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* =================== MODAL: EDIT CLINICAL LOGBOOK =================== */}
      {/* ================================================================= */}
      <AnimatePresence>
        {showEditLogModal && editingLogbook && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#252423] p-6 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4"
            >
              <h4 className="font-bold text-base text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                {lang === 'vi' ? 'Sửa lượt khám/cấp thuốc' : 'Edit Clinical / Dispensing Log'}
              </h4>

              <form onSubmit={handleEditLogbookSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">{t.topic}</label>
                  <input 
                    type="text" 
                    value={editingLogbook.topic}
                    onChange={(e) => setEditingLogbook({ ...editingLogbook, topic: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">{t.clinicalCase}</label>
                  <textarea 
                    rows={3}
                    value={editingLogbook.clinicalCase}
                    onChange={(e) => setEditingLogbook({ ...editingLogbook, clinicalCase: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                    required
                  ></textarea>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">{t.details}</label>
                  <textarea 
                    rows={3}
                    value={editingLogbook.details || ''}
                    onChange={(e) => setEditingLogbook({ ...editingLogbook, details: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">Date</label>
                    <input 
                      type="date" 
                      value={editingLogbook.date}
                      onChange={(e) => setEditingLogbook({ ...editingLogbook, date: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">Status</label>
                    <select 
                      value={editingLogbook.status}
                      onChange={(e) => setEditingLogbook({ ...editingLogbook, status: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowEditLogModal(false);
                      setEditingLogbook(null);
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-bold"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-[#0078d4] hover:bg-[#005faa] text-white rounded-lg transition font-bold"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* =================== MODAL: ADD DORMITORY ROOM =================== */}
      {/* ================================================================= */}
      <AnimatePresence>
        {showAddRoomModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#252423] p-6 rounded-2xl max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4"
            >
              <h4 className="font-bold text-base text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                {lang === 'vi' ? 'Thêm phòng ký túc xá mới' : 'Add New Dormitory Room'}
              </h4>

              <form onSubmit={handleAddRoom} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Số phòng' : 'Room Number'}</label>
                    <input 
                      type="text" 
                      value={newRoomNumber}
                      onChange={(e) => setNewRoomNumber(e.target.value)}
                      placeholder="e.g. 302"
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Tầng' : 'Floor'}</label>
                    <select 
                      value={newRoomFloor}
                      onChange={(e) => setNewRoomFloor(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                    >
                      <option value="Tầng 1">Tầng 1</option>
                      <option value="Tầng 2">Tầng 2</option>
                      <option value="Tầng 3">Tầng 3</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Khu Nam/Nữ' : 'Gender Zone'}</label>
                    <select 
                      value={newRoomGender}
                      onChange={(e) => setNewRoomGender(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Sức chứa (Học sinh)' : 'Capacity'}</label>
                    <input 
                      type="number" 
                      value={newRoomCapacity}
                      onChange={(e) => setNewRoomCapacity(parseInt(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Danh sách học sinh (cách nhau bằng dấu phẩy)' : 'Resident Names'}</label>
                  <input 
                    type="text" 
                    value={newRoomResidents}
                    onChange={(e) => setNewRoomResidents(e.target.value)}
                    placeholder="e.g. Nguyễn Văn A, Trần Văn B"
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Tình trạng vệ sinh / cơ sở' : 'Room Status'}</label>
                  <select 
                    value={newRoomStatus}
                    onChange={(e) => setNewRoomStatus(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Maintenance Required">Maintenance Required</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddRoomModal(false)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-bold"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-[#0078d4] hover:bg-[#005faa] text-white rounded-lg transition font-bold"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* =================== MODAL: EDIT DORMITORY ROOM =================== */}
      {/* ================================================================= */}
      <AnimatePresence>
        {showEditRoomModal && editingRoom && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#252423] p-6 rounded-2xl max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4"
            >
              <h4 className="font-bold text-base text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                {lang === 'vi' ? 'Sửa thông tin phòng ký túc' : 'Edit Dormitory Room'}
              </h4>

              <form onSubmit={handleEditRoomSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Số phòng' : 'Room Number'}</label>
                    <input 
                      type="text" 
                      value={editingRoom.roomNumber}
                      onChange={(e) => setEditingRoom({ ...editingRoom, roomNumber: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Tầng' : 'Floor'}</label>
                    <select 
                      value={editingRoom.floor}
                      onChange={(e) => setEditingRoom({ ...editingRoom, floor: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                    >
                      <option value="Tầng 1">Tầng 1</option>
                      <option value="Tầng 2">Tầng 2</option>
                      <option value="Tầng 3">Tầng 3</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Khu Nam/Nữ' : 'Gender Zone'}</label>
                    <select 
                      value={editingRoom.genderZone}
                      onChange={(e) => setEditingRoom({ ...editingRoom, genderZone: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Sức chứa (Học sinh)' : 'Capacity'}</label>
                    <input 
                      type="number" 
                      value={editingRoom.capacity}
                      onChange={(e) => setEditingRoom({ ...editingRoom, capacity: parseInt(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Danh sách học sinh (cách nhau bằng dấu phẩy)' : 'Resident Names'}</label>
                  <input 
                    type="text" 
                    value={editingRoom.residentNames.join(', ')}
                    onChange={(e) => setEditingRoom({ ...editingRoom, residentNames: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Tình trạng vệ sinh / cơ sở' : 'Room Status'}</label>
                  <select 
                    value={editingRoom.status}
                    onChange={(e) => setEditingRoom({ ...editingRoom, status: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Maintenance Required">Maintenance Required</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowEditRoomModal(false);
                      setEditingRoom(null);
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-bold"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-[#0078d4] hover:bg-[#005faa] text-white rounded-lg transition font-bold"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* =================== MODAL: EDIT DORM TICKET ===================== */}
      {/* ================================================================= */}
      <AnimatePresence>
        {showEditTicketModal && editingTicket && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#252423] p-6 rounded-2xl max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4"
            >
              <h4 className="font-bold text-base text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                {lang === 'vi' ? 'Sửa yêu cầu sửa chữa/bảo trì' : 'Edit Maintenance Ticket'}
              </h4>

              <form onSubmit={handleEditTicketSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{t.roomNumber}</label>
                    <input 
                      type="text" 
                      value={editingTicket.roomNumber}
                      onChange={(e) => setEditingTicket({ ...editingTicket, roomNumber: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{t.severity}</label>
                    <select 
                      value={editingTicket.severity}
                      onChange={(e) => setEditingTicket({ ...editingTicket, severity: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">{t.ticketTitle}</label>
                  <input 
                    type="text" 
                    value={editingTicket.title}
                    onChange={(e) => setEditingTicket({ ...editingTicket, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Chi tiết sự cố' : 'Issue details'}</label>
                  <textarea 
                    rows={3}
                    value={editingTicket.description}
                    onChange={(e) => setEditingTicket({ ...editingTicket, description: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">Date Created</label>
                    <input 
                      type="date" 
                      value={editingTicket.dateCreated}
                      onChange={(e) => setEditingTicket({ ...editingTicket, dateCreated: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">Status</label>
                    <select 
                      value={editingTicket.status}
                      onChange={(e) => setEditingTicket({ ...editingTicket, status: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowEditTicketModal(false);
                      setEditingTicket(null);
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-bold"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition font-bold"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* =================== MODAL: EDIT APPRAISAL EVALUATION ============== */}
      {/* ================================================================= */}
      <AnimatePresence>
        {showEditAppraisalModal && editingAppraisal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#252423] p-6 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <h4 className="font-bold text-base text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                {lang === 'vi' ? 'Sửa phiếu đánh giá thể trạng học sinh' : 'Edit Growth Appraisal'}
              </h4>

              <form onSubmit={handleEditAppraisalSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Họ và tên học sinh' : 'Student Full Name'}</label>
                    <input 
                      type="text" 
                      value={editingAppraisal.studentName}
                      onChange={(e) => setEditingAppraisal({ ...editingAppraisal, studentName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Mã học sinh' : 'Student Code'}</label>
                    <input 
                      type="text" 
                      value={editingAppraisal.studentCode}
                      onChange={(e) => setEditingAppraisal({ ...editingAppraisal, studentCode: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Phân loại sức khỏe' : 'Health Classification'}</label>
                    <input 
                      type="text" 
                      value={editingAppraisal.department}
                      onChange={(e) => setEditingAppraisal({ ...editingAppraisal, department: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Số ngày ăn bán trú' : 'Boarding Attendance (days)'}</label>
                    <input 
                      type="number" 
                      value={editingAppraisal.clinicalHoursCompleted}
                      onChange={(e) => setEditingAppraisal({ ...editingAppraisal, clinicalHoursCompleted: parseInt(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Điểm Thể lực' : 'Physical'}</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="10"
                      value={editingAppraisal.knowledgeScore}
                      onChange={(e) => setEditingAppraisal({ ...editingAppraisal, knowledgeScore: parseFloat(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Điểm Vệ sinh' : 'Hygiene'}</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="10"
                      value={editingAppraisal.skillsScore}
                      onChange={(e) => setEditingAppraisal({ ...editingAppraisal, skillsScore: parseFloat(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Điểm Nề nếp' : 'Attitude'}</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="10"
                      value={editingAppraisal.attitudeScore}
                      onChange={(e) => setEditingAppraisal({ ...editingAppraisal, attitudeScore: parseFloat(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 p-2 rounded border border-slate-200 dark:border-zinc-700"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">{lang === 'vi' ? 'Nhận xét' : 'Notes'}</label>
                  <textarea 
                    rows={2}
                    value={editingAppraisal.notes}
                    onChange={(e) => setEditingAppraisal({ ...editingAppraisal, notes: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-200 dark:border-zinc-700"
                    required
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowEditAppraisalModal(false);
                      setEditingAppraisal(null);
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-bold"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-[#0078d4] hover:bg-[#005faa] text-white rounded-lg transition font-bold"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================== CUSTOM CONFIRMATION DIALOG =================== */}
      <AnimatePresence>
        {confirmModal && confirmModal.isOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-md bg-white dark:bg-[#252423] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 p-6 flex flex-col space-y-4 text-slate-800 dark:text-white"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="space-y-1 col-span-3">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {confirmModal.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
                    {confirmModal.message}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-slate-700 dark:text-slate-300 rounded-xl transition-all font-bold text-xs cursor-pointer"
                >
                  {lang === 'vi' ? 'Hủy bỏ' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className="px-4.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-bold text-xs shadow-md shadow-red-500/10 cursor-pointer"
                >
                  {lang === 'vi' ? 'Xác nhận xóa' : 'Confirm Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================== CUSTOM ALERT DIALOG =================== */}
      <AnimatePresence>
        {alertModal && alertModal.isOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAlertModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#252423] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 p-6 flex flex-col space-y-4 text-slate-800 dark:text-white"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#e1dfdd] dark:bg-zinc-800 text-[#0078d4] dark:text-sky-400 rounded-full shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {alertModal.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
                    {alertModal.message}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setAlertModal(null)}
                  className="px-5 py-2 bg-[#0078d4] hover:bg-[#005faa] text-white rounded-xl transition-all font-bold text-xs shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  {lang === 'vi' ? 'Đóng' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
