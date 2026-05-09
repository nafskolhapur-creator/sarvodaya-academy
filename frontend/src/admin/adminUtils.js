export const sectionItems = [
  { id: "overview", label: "Overview", icon: "dashboard", caption: "Institute snapshot" },
  { id: "courses", label: "Courses", icon: "courses", caption: "Catalog and marketing" },
  { id: "whatsapp", label: "WhatsApp", icon: "whatsapp", caption: "Messaging and templates" },
  { id: "gallery", label: "Gallery", icon: "gallery", caption: "Activities and showcase" },
  { id: "leads", label: "Leads", icon: "leads", caption: "Admissions pipeline" },
  { id: "students", label: "Students", icon: "students", caption: "Academic records" },
  { id: "fees", label: "Fees", icon: "fees", caption: "Payments and reminders" },
  { id: "placements", label: "Placements", icon: "placements", caption: "Success stories" },
  { id: "materials", label: "Study Material", icon: "materials", caption: "Learning resources" },
  { id: "tests", label: "Test Series", icon: "tests", caption: "Google Form assessments" },
  { id: "interviews", label: "Interview Q&A", icon: "interviews", caption: "Preparation bank" },
  { id: "certificates", label: "Certificates", icon: "certificates", caption: "Issued credentials" },
  { id: "jobs", label: "Job Updates", icon: "jobs", caption: "Opportunities and applicants" },
];

const currentDate = new Date();
export const currentMonth = currentDate.getMonth() + 1;
export const currentYear = currentDate.getFullYear();

export const defaultStudentForm = {
  id: "",
  name: "",
  mobileNumber: "",
  dob: "",
  academicYear: `${currentYear}-${currentYear + 1}`,
  courseEnrolled: "",
  courseFee: "",
  installmentsCount: "1",
  fine: "0",
  parentContact: "",
  photo: null,
  photoUrl: "",
};

export const defaultFeeForm = {
  studentId: "",
  month: String(currentMonth),
  year: String(currentYear),
  amountDue: "",
  lateFee: "100",
};

export const defaultFeeReminderForm = {
  autoRemindersEnabled: false,
  dueDay: 10,
  reminderDay: 5,
  urgentReminderDay: 9,
  defaultLateFee: 100,
  templates: {
    reminder:
      "Reminder: Your monthly fee for [Course Name] is pending. Please pay before 10th to avoid late fee.",
    urgent: "Urgent: Your fee is still pending. Pay before due date to avoid penalty.",
    late: "Your fee is overdue. Late fee has been applied. Kindly pay as soon as possible.",
  },
};

export const defaultMaterialForm = {
  id: "",
  title: "",
  description: "",
  courseName: "",
  file: null,
};

export const defaultGalleryForm = {
  id: "",
  title: "",
  description: "",
  category: "Student Activities",
  activityDate: new Date().toISOString().slice(0, 10),
  files: [],
  image: null,
};

export const defaultTestForm = {
  id: "",
  title: "",
  description: "",
  courseName: "",
  academicYear: "",
  googleFormUrl: "",
};

export const defaultInterviewForm = {
  title: "",
  description: "",
  courseName: "",
  file: null,
};

export const defaultCertificateForm = {
  studentId: "",
  title: "",
  issueDate: new Date().toISOString().slice(0, 10),
  file: null,
};

export const defaultJobForm = {
  id: "",
  title: "",
  company: "",
  location: "",
  description: "",
  applyLink: "",
  deadline: "",
};

export const defaultPlacementForm = {
  id: "",
  studentId: "",
  course: "",
  companyName: "",
  jobRole: "",
  salaryAmount: "",
  salaryPeriod: "monthly",
  location: "",
  dateOfJoining: "",
  placementStatus: "In Process",
  offerLetter: null,
  studentPhoto: null,
  companyLogo: null,
  successStoryDescription: "",
  highlightOnHomepage: false,
};

export const defaultCourseSettingsForm = {
  whatsappNumber: "+91-9730848101",
};

export const defaultCourseForm = {
  id: "",
  title: "",
  board: "NAFS",
  duration: "",
  eligibility: "",
  description: "",
  featured: false,
  popular: false,
  isPublished: true,
};

export const defaultWhatsAppForm = {
  apiUrl: "https://api.interakt.ai/v1/public/message/",
  apiKey: "",
  phoneNumber: "+91-9730848101",
  automationEnabled: true,
  botEnabled: true,
  botReplyDelaySeconds: 45,
  autoReplies: {
    fees: "Fees depend on course. Please tell your qualification (10th/12th/Graduate).",
    course: "We offer Fire & Safety courses. Please share your qualification.",
    job: "Yes, we provide 100% job assistance after course completion.",
    duration: "Courses duration ranges from 1 month to 2 years depending on course.",
    tenthSuggestion: "Based on your qualification, you can explore these diploma options: [Courses].",
    twelfthSuggestion:
      "Based on your qualification, you can explore these advanced diploma options: [Courses].",
    graduateSuggestion:
      "For graduates, we recommend PG Diploma and advanced safety pathways. Our team will guide you for the best option.",
  },
  templates: {
    paymentReceived: "Payment received successfully. Your receipt is attached.",
    enquiryReply:
      "Hello, thank you for your enquiry at Sarvodaya Academy. Our team will guide you for the best Fire and Safety course options.",
  },
};

export const defaultManualWhatsAppForm = {
  to: "",
  templateKey: "enquiryReply",
  bodyValuesText: "",
};

export const defaultLeadForm = {
  id: "",
  status: "New",
  notes: "",
  followUpDate: "",
};

export const monthLabel = (monthNumber) =>
  new Date(2000, Number(monthNumber) - 1, 1).toLocaleString("en-IN", {
    month: "long",
  });

export const formatDate = (dateString) =>
  dateString
    ? new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not set";

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const buildInstallments = (courseFee, count) => {
  const totalFee = Number(courseFee || 0);
  const totalInstallments = Math.max(1, Number(count || 1));
  const baseAmount = Number((totalFee / totalInstallments).toFixed(2));

  return Array.from({ length: totalInstallments }, (_value, index) => {
    const dueDate = new Date(currentYear, currentDate.getMonth() + index, 10);

    return {
      label: `Installment ${index + 1}`,
      amount: index === totalInstallments - 1 ? totalFee - baseAmount * index : baseAmount,
      dueDate,
      status: "pending",
    };
  });
};
