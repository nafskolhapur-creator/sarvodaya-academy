import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppIcon from "../components/AppIcon";
import BrandingSection from "../admin/BrandingSection";
import CertificatesSection from "../admin/CertificatesSection";
import CoursesSection from "../admin/CoursesSection";
import FeesSection from "../admin/FeesSection";
import GallerySection from "../admin/GallerySection";
import InterviewsSection from "../admin/InterviewsSection";
import JobsSection from "../admin/JobsSection";
import LeadsSection from "../admin/LeadsSection";
import MaterialsSection from "../admin/MaterialsSection";
import OverviewSection from "../admin/OverviewSection";
import PlacementsSection from "../admin/PlacementsSection";
import StudentsSection from "../admin/StudentsSection";
import TestsSection from "../admin/TestsSection";
import WhatsAppSection from "../admin/WhatsAppSection";
import LoadingState from "../components/LoadingState";
import {
  defaultCertificateForm,
  defaultCourseForm,
  defaultCourseSettingsForm,
  defaultFeeForm,
  defaultFeeReminderForm,
  defaultGalleryForm,
  defaultInterviewForm,
  defaultJobForm,
  defaultLeadForm,
  defaultManualWhatsAppForm,
  defaultMaterialForm,
  defaultPlacementForm,
  defaultStudentForm,
  defaultTestForm,
  defaultWhatsAppForm,
  sectionItems,
} from "../admin/adminUtils";
import { useAuth } from "../context/AuthContext";
import {
  createAdminCertificate,
  createAdminCourse,
  getAdminCourseSettings,
  getAdminCourses,
  createAdminFee,
  createAdminGallery,
  createAdminInterview,
  createAdminJob,
  createAdminMaterial,
  createAdminPlacement,
  createAdminStudent,
  createAdminTest,
  deleteAdminCertificate,
  deleteAdminCourse,
  deleteAdminFee,
  deleteAdminGallery,
  deleteAdminInterview,
  deleteAdminJob,
  deleteAdminMaterial,
  deleteAdminPlacement,
  deleteAdminStudent,
  deleteAdminTest,
  getAdminCertificates,
  getAdminFees,
  getAdminGallery,
  getAdminFeeReminders,
  getAdminInterviews,
  getAdminJobs,
  getAdminLeads,
  getAdminMaterials,
  getAdminPlacements,
  getAdminWhatsApp,
  getAdminOverview,
  getAdminStudents,
  getAdminTests,
  markAdminFeePaid,
  runAdminFeeReminderCycle,
  sendAdminWhatsAppMessage,
  toggleAdminJobApplicant,
  updateAdminLead,
  updateAdminCourse,
  updateAdminCourseSettings,
  updateAdminFeeReminderSettings,
  updateAdminGallery,
  updateAdminJob,
  updateAdminMaterial,
  updateAdminPlacement,
  updateAdminStudent,
  updateAdminTest,
  updateAdminWhatsApp,
} from "../services/api";
import { useBranding } from "../context/BrandingContext";

function AdminPanelPage() {
  const { admin, adminToken, logoutAdmin } = useAuth();
  const { branding, resolvedLogoUrl } = useBranding();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState("");
  const [overview, setOverview] = useState(null);
  const [courseSettings, setCourseSettings] = useState(defaultCourseSettingsForm);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [groupedStudents, setGroupedStudents] = useState({});
  const [feeRecords, setFeeRecords] = useState([]);
  const [feeCollectionSummary, setFeeCollectionSummary] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    totalExpected: 0,
    totalCollected: 0,
    pendingAmount: 0,
  });
  const [feeReminderOverview, setFeeReminderOverview] = useState({
    settings: defaultFeeReminderForm,
    summary: {
      autoRemindersEnabled: false,
      unpaidCount: 0,
      lateCount: 0,
      messagesToday: 0,
    },
    dueToday: [],
    overdue: [],
    logs: [],
  });
  const [materials, setMaterials] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [tests, setTests] = useState([]);
  const [leads, setLeads] = useState([]);
  const [leadsSummary, setLeadsSummary] = useState({
    totalLeads: 0,
    newLeads: 0,
    interestedLeads: 0,
    followUpsToday: 0,
  });
  const [whatsAppOverview, setWhatsAppOverview] = useState({
    settings: defaultWhatsAppForm,
    logs: [],
  });
  const [interviews, setInterviews] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [studentForm, setStudentForm] = useState(defaultStudentForm);
  const [courseForm, setCourseForm] = useState(defaultCourseForm);
  const [feeForm, setFeeForm] = useState(defaultFeeForm);
  const [feeReminderForm, setFeeReminderForm] = useState(defaultFeeReminderForm);
  const [materialForm, setMaterialForm] = useState(defaultMaterialForm);
  const [galleryForm, setGalleryForm] = useState(defaultGalleryForm);
  const [placementForm, setPlacementForm] = useState(defaultPlacementForm);
  const [testForm, setTestForm] = useState(defaultTestForm);
  const [interviewForm, setInterviewForm] = useState(defaultInterviewForm);
  const [certificateForm, setCertificateForm] = useState(defaultCertificateForm);
  const [courseSettingsForm, setCourseSettingsForm] = useState(defaultCourseSettingsForm);
  const [jobForm, setJobForm] = useState(defaultJobForm);
  const [leadForm, setLeadForm] = useState(defaultLeadForm);
  const [manualWhatsAppForm, setManualWhatsAppForm] = useState(defaultManualWhatsAppForm);
  const [jobApplicantSelection, setJobApplicantSelection] = useState({});
  const [whatsAppForm, setWhatsAppForm] = useState(defaultWhatsAppForm);

  const studentOptions = useMemo(
    () =>
      students.map((student) => ({
        id: student._id,
        label: `${student.name} (${student.academicYear})`,
      })),
    [students],
  );

  const loadAdminData = async () => {
    if (!adminToken) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const responses = await Promise.all([
        getAdminOverview(adminToken),
        getAdminCourseSettings(adminToken),
        getAdminCourses(adminToken),
        getAdminStudents(adminToken),
        getAdminFees(adminToken),
        getAdminFeeReminders(adminToken),
        getAdminPlacements(adminToken),
        getAdminWhatsApp(adminToken),
        getAdminLeads(adminToken),
        getAdminMaterials(adminToken),
        getAdminGallery(adminToken),
        getAdminTests(adminToken),
        getAdminInterviews(adminToken),
        getAdminCertificates(adminToken),
        getAdminJobs(adminToken),
      ]);

      setOverview(responses[0].overview);
      setCourseSettings(responses[1].settings);
      setCourseSettingsForm(responses[1].settings);
      setCourses(responses[2].courses);
      setStudents(responses[3].students);
      setGroupedStudents(responses[3].groupedStudents);
      setFeeRecords(responses[4].feeRecords);
      setFeeCollectionSummary(responses[4].collectionSummary);
      setFeeReminderOverview({
        settings: responses[5].settings,
        summary: responses[5].summary,
        dueToday: responses[5].dueToday,
        overdue: responses[5].overdue,
        logs: responses[5].logs,
      });
      setFeeReminderForm(responses[5].settings);
      setPlacements(responses[6].placements);
      setWhatsAppOverview({
        settings: responses[7].settings,
        logs: responses[7].logs,
      });
      setWhatsAppForm(responses[7].settings);
      setLeads(responses[8].leads);
      setLeadsSummary(responses[8].summary);
      setMaterials(responses[9].materials);
      setGalleryItems(responses[10].items);
      setTests(responses[11].tests);
      setInterviews(responses[12].resources);
      setCertificates(responses[13].certificates);
      setJobs(responses[14].jobs);
      setFeeForm((current) => ({
        ...current,
        lateFee: String(responses[5].settings.defaultLateFee || 100),
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [adminToken]);

  const runMutation = async (key, task, onSuccess) => {
    setSubmitting(key);
    setError("");

    try {
      await task();
      await loadAdminData();
      if (onSuccess) {
        onSuccess();
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting("");
    }
  };

  const handleDelete = async (label, task) => {
    if (!window.confirm(`Delete this ${label}?`)) {
      return;
    }

    await runMutation(label, task);
  };

  if (loading && !overview) {
    return (
      <LoadingState
        title="Loading admin dashboard"
        description="Fetching students, fees, placements, leads, and communication modules."
      />
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="dashboard-brand-lockup">
            <img src={resolvedLogoUrl} alt={branding.instituteName} className="dashboard-brand-logo" />
            <div className="auth-brand-copy">
              <p className="eyebrow">{branding.instituteName}</p>
              <span>{branding.instituteSubtitle}</span>
            </div>
          </div>
          <h2>Admin Dashboard</h2>
          <p>{admin?.name}</p>
        </div>

        <nav className="admin-nav">
          {sectionItems.map((section) => (
            <button
              key={section.id}
              type="button"
              className={activeSection === section.id ? "admin-nav-item active" : "admin-nav-item"}
              onClick={() => setActiveSection(section.id)}
            >
              <div className="admin-nav-icon">
                <AppIcon name={section.icon} />
              </div>
              <div>
                <strong>{section.label}</strong>
                <span>{section.caption}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-actions">
          <button type="button" className="ghost-button" onClick={loadAdminData}>
            <AppIcon name="refresh" />
            Refresh data
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              logoutAdmin();
              navigate("/admin/login");
            }}
          >
            <AppIcon name="logout" />
            Logout
          </button>
        </div>
      </aside>

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <p className="section-tag">Operations Center</p>
            <h1>Welcome back, {admin?.name}</h1>
            <p>Manage admissions, finances, resources, certifications, and placement activity.</p>
            <div className="dashboard-highlight-row">
              <span className="dashboard-pill">
                <AppIcon name="students" size={16} />
                Student lifecycle
              </span>
              <span className="dashboard-pill">
                <AppIcon name="fees" size={16} />
                Fee control
              </span>
              <span className="dashboard-pill">
                <AppIcon name="placements" size={16} />
                Placement outcomes
              </span>
            </div>
          </div>
          <div className="admin-highlight">
            <span>Logged in as</span>
            <strong>{admin?.email}</strong>
          </div>
        </header>

        {error ? <div className="panel error-text">{error}</div> : null}

        {activeSection === "overview" ? <OverviewSection overview={overview} /> : null}
        {activeSection === "branding" ? (
          <BrandingSection adminToken={adminToken} runMutation={runMutation} submitting={submitting} />
        ) : null}
        {activeSection === "courses" ? (
          <CoursesSection
            adminToken={adminToken}
            courseForm={courseForm}
            courseSettings={courseSettings}
            courseSettingsForm={courseSettingsForm}
            createAdminCourse={createAdminCourse}
            courses={courses}
            deleteAdminCourse={deleteAdminCourse}
            handleDelete={handleDelete}
            runMutation={runMutation}
            setCourseForm={setCourseForm}
            setCourseSettingsForm={setCourseSettingsForm}
            submitting={submitting}
            updateAdminCourse={updateAdminCourse}
            updateAdminCourseSettings={updateAdminCourseSettings}
          />
        ) : null}
        {activeSection === "whatsapp" ? (
          <WhatsAppSection
            adminToken={adminToken}
            manualWhatsAppForm={manualWhatsAppForm}
            runMutation={runMutation}
            sendAdminWhatsAppMessage={sendAdminWhatsAppMessage}
            setManualWhatsAppForm={setManualWhatsAppForm}
            setWhatsAppForm={setWhatsAppForm}
            submitting={submitting}
            updateAdminWhatsApp={updateAdminWhatsApp}
            whatsAppForm={whatsAppForm}
            whatsAppOverview={whatsAppOverview}
          />
        ) : null}
        {activeSection === "leads" ? (
          <LeadsSection
            adminToken={adminToken}
            leadForm={leadForm}
            leads={leads}
            leadsSummary={leadsSummary}
            runMutation={runMutation}
            setLeadForm={setLeadForm}
            submitting={submitting}
            updateAdminLead={updateAdminLead}
          />
        ) : null}
        {activeSection === "students" ? (
          <StudentsSection
            adminToken={adminToken}
            createAdminStudent={createAdminStudent}
            deleteAdminStudent={deleteAdminStudent}
            groupedStudents={groupedStudents}
            handleDelete={handleDelete}
            runMutation={runMutation}
            setActiveSection={setActiveSection}
            setStudentForm={setStudentForm}
            studentForm={studentForm}
            submitting={submitting}
            updateAdminStudent={updateAdminStudent}
          />
        ) : null}
        {activeSection === "fees" ? (
          <FeesSection
            adminToken={adminToken}
            createAdminFee={createAdminFee}
            deleteAdminFee={deleteAdminFee}
            feeForm={feeForm}
            feeCollectionSummary={feeCollectionSummary}
            feeRecords={feeRecords}
            feeReminderForm={feeReminderForm}
            feeReminderOverview={feeReminderOverview}
            markAdminFeePaid={markAdminFeePaid}
            runAdminFeeReminderCycle={runAdminFeeReminderCycle}
            runMutation={runMutation}
            setFeeForm={setFeeForm}
            setFeeReminderForm={setFeeReminderForm}
            studentOptions={studentOptions}
            submitting={submitting}
            updateAdminFeeReminderSettings={updateAdminFeeReminderSettings}
          />
        ) : null}
        {activeSection === "placements" ? (
          <PlacementsSection
            adminToken={adminToken}
            createAdminPlacement={createAdminPlacement}
            deleteAdminPlacement={deleteAdminPlacement}
            handleDelete={handleDelete}
            placementForm={placementForm}
            placements={placements}
            runMutation={runMutation}
            setPlacementForm={setPlacementForm}
            studentOptions={studentOptions}
            submitting={submitting}
            updateAdminPlacement={updateAdminPlacement}
          />
        ) : null}
        {activeSection === "materials" ? (
          <MaterialsSection
            adminToken={adminToken}
            createAdminMaterial={createAdminMaterial}
            deleteAdminMaterial={deleteAdminMaterial}
            materialForm={materialForm}
            materials={materials}
            runMutation={runMutation}
            setMaterialForm={setMaterialForm}
            submitting={submitting}
            updateAdminMaterial={updateAdminMaterial}
          />
        ) : null}
        {activeSection === "gallery" ? (
          <GallerySection
            adminToken={adminToken}
            createAdminGallery={createAdminGallery}
            deleteAdminGallery={deleteAdminGallery}
            galleryForm={galleryForm}
            galleryItems={galleryItems}
            handleDelete={handleDelete}
            runMutation={runMutation}
            setGalleryForm={setGalleryForm}
            submitting={submitting}
            updateAdminGallery={updateAdminGallery}
          />
        ) : null}
        {activeSection === "tests" ? (
          <TestsSection
            adminToken={adminToken}
            createAdminTest={createAdminTest}
            deleteAdminTest={deleteAdminTest}
            runMutation={runMutation}
            setTestForm={setTestForm}
            submitting={submitting}
            testForm={testForm}
            tests={tests}
            updateAdminTest={updateAdminTest}
          />
        ) : null}
        {activeSection === "interviews" ? (
          <InterviewsSection
            adminToken={adminToken}
            createAdminInterview={createAdminInterview}
            deleteAdminInterview={deleteAdminInterview}
            interviewForm={interviewForm}
            interviews={interviews}
            runMutation={runMutation}
            setInterviewForm={setInterviewForm}
            submitting={submitting}
          />
        ) : null}
        {activeSection === "certificates" ? (
          <CertificatesSection
            adminToken={adminToken}
            certificateForm={certificateForm}
            certificates={certificates}
            createAdminCertificate={createAdminCertificate}
            deleteAdminCertificate={deleteAdminCertificate}
            runMutation={runMutation}
            setCertificateForm={setCertificateForm}
            studentOptions={studentOptions}
            submitting={submitting}
          />
        ) : null}
        {activeSection === "jobs" ? (
          <JobsSection
            adminToken={adminToken}
            createAdminJob={createAdminJob}
            deleteAdminJob={deleteAdminJob}
            jobApplicantSelection={jobApplicantSelection}
            jobForm={jobForm}
            jobs={jobs}
            runMutation={runMutation}
            setError={setError}
            setJobApplicantSelection={setJobApplicantSelection}
            setJobForm={setJobForm}
            studentOptions={studentOptions}
            submitting={submitting}
            toggleAdminJobApplicant={toggleAdminJobApplicant}
            updateAdminJob={updateAdminJob}
          />
        ) : null}
      </section>
    </div>
  );
}

export default AdminPanelPage;
