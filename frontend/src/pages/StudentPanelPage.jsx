import { useEffect, useMemo, useState } from "react";

import AppIcon from "../components/AppIcon";
import LoadingState from "../components/LoadingState";
import { useAuth } from "../context/AuthContext";
import {
  applyStudentJob,
  getStudentCertificates,
  getStudentFees,
  getStudentJobs,
  getStudentMaterials,
  getStudentPlacements,
  getStudentProfile,
  getStudentTests,
  submitStudentTest,
} from "../services/api";

const studentSections = [
  { id: "profile", label: "Profile", icon: "profile", caption: "Personal details" },
  { id: "fees", label: "Fees", icon: "fees", caption: "Monthly payment status" },
  { id: "placements", label: "Placement", icon: "placements", caption: "Career progress" },
  { id: "materials", label: "Study Material", icon: "materials", caption: "Read-only resources" },
  { id: "tests", label: "Test Series", icon: "tests", caption: "MCQ practice links" },
  { id: "jobs", label: "Jobs", icon: "jobs", caption: "Apply to opportunities" },
  { id: "certificates", label: "Certificates", icon: "certificates", caption: "Issued documents" },
];

const formatDate = (dateString) =>
  dateString
    ? new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not set";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getFeeStatusClass = (status) => {
  if (status === "paid") {
    return "status-paid";
  }

  if (status === "late") {
    return "status-late";
  }

  return "status-unpaid";
};

const monthLabel = (monthNumber) =>
  new Date(2000, Number(monthNumber) - 1, 1).toLocaleString("en-IN", {
    month: "long",
  });

function StudentPanelPage() {
  const { user, userToken } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState("");
  const [profile, setProfile] = useState(null);
  const [fees, setFees] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [tests, setTests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const submittedTestIds = useMemo(
    () => new Set(submissions.map((entry) => String(entry.testSeries?._id || "")).filter(Boolean)),
    [submissions],
  );

  const loadStudentData = async () => {
    if (!userToken) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [
        profileResponse,
        feesResponse,
        materialsResponse,
        placementsResponse,
        testsResponse,
        jobsResponse,
        certificatesResponse,
      ] = await Promise.all([
        getStudentProfile(userToken),
        getStudentFees(userToken),
        getStudentMaterials(userToken),
        getStudentPlacements(userToken),
        getStudentTests(userToken),
        getStudentJobs(userToken),
        getStudentCertificates(userToken),
      ]);

      setProfile(profileResponse.profile);
      setFees(feesResponse.feeRecords);
      setMaterials(materialsResponse.materials);
      setSelectedMaterial((current) => {
        if (!materialsResponse.materials.length) {
          return null;
        }

        return (
          materialsResponse.materials.find((material) => material._id === current?._id) ||
          materialsResponse.materials[0]
        );
      });
      setPlacements(placementsResponse.placements);
      setTests(testsResponse.tests);
      setSubmissions(testsResponse.submissions);
      setJobs(jobsResponse.jobs);
      setCertificates(certificatesResponse.certificates);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [userToken]);

  const runAction = async (key, task) => {
    setSubmitting(key);
    setError("");

    try {
      await task();
      await loadStudentData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting("");
    }
  };

  if (loading && !profile) {
    return (
      <LoadingState
        title="Loading student panel"
        description="Preparing profile, fees, study material, jobs, and certificates."
      />
    );
  }

  return (
    <div className="student-shell">
      <section className="student-header panel">
        <div>
          <p className="section-tag">Student Panel</p>
          <h2>{profile?.name || user?.name}</h2>
          <p>
            {profile?.courseEnrolled || user?.courseEnrolled} | {profile?.academicYear || user?.academicYear}
          </p>
        </div>
        <div className="student-header-card">
          <span>Mobile</span>
          <strong>{profile?.mobileNumber || user?.mobileNumber}</strong>
        </div>
      </section>

      {error ? <div className="panel error-text">{error}</div> : null}

      <div className="student-workspace">
        <aside className="student-sidebar panel">
          <div>
            <p className="section-tag">Navigation</p>
            <h3>Student services</h3>
          </div>
          <div className="student-nav">
            {studentSections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={activeSection === section.id ? "student-nav-item active" : "student-nav-item"}
                onClick={() => setActiveSection(section.id)}
              >
                <div className="icon-chip">
                  <AppIcon name={section.icon} />
                </div>
                <div>
                  <strong>{section.label}</strong>
                  <span>{section.caption}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div className="student-content-stack">
      {activeSection === "profile" ? (
        <section className="panel">
          <p className="section-tag">Profile</p>
          <h3>Personal details</h3>
          <div className="student-info-grid">
            <div className="info-card">
              <span className="label">Name</span>
              <p>{profile?.name}</p>
            </div>
            <div className="info-card">
              <span className="label">Mobile Number</span>
              <p>{profile?.mobileNumber}</p>
            </div>
            <div className="info-card">
              <span className="label">DOB</span>
              <p>{formatDate(profile?.dob)}</p>
            </div>
            <div className="info-card">
              <span className="label">Course</span>
              <p>{profile?.courseEnrolled}</p>
            </div>
            <div className="info-card">
              <span className="label">Academic Year</span>
              <p>{profile?.academicYear}</p>
            </div>
            <div className="info-card">
              <span className="label">Parent Contact</span>
              <p>{profile?.parentContact}</p>
            </div>
          </div>
        </section>
      ) : null}

      {activeSection === "fees" ? (
        <section className="panel">
          <p className="section-tag">Fee Records</p>
          <h3>Monthly fee overview</h3>
          <div className="student-record-list">
            {fees.map((fee) => (
              <article key={fee._id} className="student-record-row">
                <div>
                  <strong>
                    {monthLabel(fee.month)} {fee.year}
                  </strong>
                  <p>Due on {formatDate(fee.dueDate)}</p>
                </div>
                <div>
                  <strong>{formatCurrency(fee.totalDue)}</strong>
                  <p>Late fee: {formatCurrency(fee.lateFee)}</p>
                </div>
                <div>
                  <strong className={getFeeStatusClass(fee.status)}>
                    {fee.status}
                  </strong>
                  <p>
                    {fee.paidDate
                      ? `Paid on ${formatDate(fee.paidDate)}`
                      : fee.status === "late"
                        ? "Late fee has been applied."
                        : "Awaiting payment"}
                  </p>
                </div>
                <div>
                  {fee.payment ? (
                    <>
                      <strong>{formatCurrency(fee.payment.amountPaid)}</strong>
                      <p>{fee.payment.paymentMode}</p>
                      <p>{fee.payment.transactionId || "No transaction ID"}</p>
                    </>
                  ) : (
                    <>
                      <strong>Payment history</strong>
                      <p>No payment recorded yet.</p>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
          <div className="student-card-grid">
            {fees.filter((fee) => fee.payment).length ? (
              fees
                .filter((fee) => fee.payment)
                .map((fee) => (
                  <article key={`${fee._id}-receipt`} className="admin-record-card">
                    <h4>
                      {monthLabel(fee.month)} {fee.year}
                    </h4>
                    <p>Receipt No: {fee.payment.receiptNumber || "Pending"}</p>
                    <p>Paid on {formatDate(fee.payment.paymentDate)}</p>
                    <div className="admin-inline-actions">
                      {fee.payment.receiptUrl ? (
                        <a className="ghost-button" href={fee.payment.receiptUrl} target="_blank" rel="noreferrer">
                          View receipt
                        </a>
                      ) : null}
                      {fee.payment.proofUrl ? (
                        <a className="ghost-button" href={fee.payment.proofUrl} target="_blank" rel="noreferrer">
                          View proof
                        </a>
                      ) : null}
                    </div>
                  </article>
                ))
            ) : (
              <div className="info-card">Receipts will appear here after fee payments are recorded.</div>
            )}
          </div>
        </section>
      ) : null}

      {activeSection === "placements" ? (
        <section className="panel">
          <p className="section-tag">Placement Status</p>
          <h3>Your placement records</h3>
          <div className="student-card-grid">
            {placements.length ? (
              placements.map((placement) => (
                <article key={placement._id} className="admin-record-card placement-card">
                  <div className="tag-row">
                    <span className="admin-tag">{placement.placementStatus}</span>
                    {placement.placementStatus === "Placed" ? (
                      <span className="placement-badge">Placed Student</span>
                    ) : null}
                  </div>
                  <h4>{placement.companyName}</h4>
                  <p>{placement.jobRole}</p>
                  <p>{placement.location || "Location to be shared"}</p>
                  <p>Joining: {formatDate(placement.dateOfJoining)}</p>
                  <p>
                    Salary: {placement.salaryAmount ? formatCurrency(placement.salaryAmount) : "Not shared"}{" "}
                    {placement.salaryAmount ? `/${placement.salaryPeriod}` : ""}
                  </p>
                  <p>{placement.successStoryDescription || "Placement update available in your profile."}</p>
                  <div className="admin-inline-actions">
                    {placement.offerLetterUrl ? (
                      <a className="ghost-button" href={placement.offerLetterUrl} target="_blank" rel="noreferrer">
                        View offer letter
                      </a>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <div className="info-card">No placement records available yet.</div>
            )}
          </div>
        </section>
      ) : null}

      {activeSection === "materials" ? (
        <div className="student-material-layout">
          <section className="panel">
            <p className="section-tag">Study Material</p>
            <h3>Available resources</h3>
            <div className="student-record-list">
              {materials.length ? (
                materials.map((material) => (
                  <button
                    key={material._id}
                    type="button"
                    className={
                      selectedMaterial?._id === material._id ? "student-material-item active" : "student-material-item"
                    }
                    onClick={() => setSelectedMaterial(material)}
                  >
                    <strong>{material.title}</strong>
                    <span>{material.courseName || "General material"}</span>
                  </button>
                ))
              ) : (
                <div className="info-card">No study material has been uploaded yet.</div>
              )}
            </div>
          </section>

          <section className="panel">
            <p className="section-tag">Preview</p>
            <h3>{selectedMaterial?.title || "Select a material"}</h3>
            <p>{selectedMaterial?.description || "Preview resources without edit access."}</p>
            {selectedMaterial ? (
              <iframe
                title={selectedMaterial.title}
                className="student-preview-frame"
                src={selectedMaterial.fileUrl}
              />
            ) : (
              <div className="info-card">No material selected.</div>
            )}
          </section>
        </div>
      ) : null}

      {activeSection === "tests" ? (
        <div className="stack-lg">
          <section className="panel">
            <p className="section-tag">Test Series</p>
            <h3>Available Google Form tests</h3>
            <div className="student-card-grid">
              {tests.length ? (
                tests.map((test) => (
                  <article key={test._id} className="admin-record-card">
                    <h4>{test.title}</h4>
                    <p>{test.courseName || "General"}</p>
                    <p>{test.description || "MCQ assessment link."}</p>
                    <div className="admin-inline-actions">
                      <a className="ghost-button" href={test.googleFormUrl} target="_blank" rel="noreferrer">
                        Open test
                      </a>
                      <button
                        type="button"
                        className="ghost-button"
                        disabled={submittedTestIds.has(String(test._id)) || submitting === `test-${test._id}`}
                        onClick={() => runAction(`test-${test._id}`, () => submitStudentTest(userToken, test._id))}
                      >
                        {submittedTestIds.has(String(test._id)) ? "Submitted" : "Mark submitted"}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="info-card">No tests available right now.</div>
              )}
            </div>
          </section>

          <section className="panel">
            <p className="section-tag">Submitted Tests</p>
            <h3>Your completed entries</h3>
            <div className="student-record-list">
              {submissions.length ? (
                submissions.map((submission) => (
                  <article key={submission._id} className="student-record-row">
                    <div>
                      <strong>{submission.testSeries?.title}</strong>
                      <p>{submission.testSeries?.courseName || "General"}</p>
                    </div>
                    <div>
                      <strong className="status-paid">Submitted</strong>
                      <p>{formatDate(submission.submittedAt)}</p>
                    </div>
                  </article>
                ))
              ) : (
                <div className="info-card">No tests marked as submitted yet.</div>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {activeSection === "jobs" ? (
        <section className="panel">
          <p className="section-tag">Jobs</p>
          <h3>Available opportunities</h3>
          <div className="student-card-grid">
            {jobs.length ? (
              jobs.map((job) => (
                <article key={job._id} className="admin-record-card">
                  <h4>{job.title}</h4>
                  <p>
                    {job.company} {job.location ? `| ${job.location}` : ""}
                  </p>
                  <p>{job.description || "No description provided."}</p>
                  <p>Deadline: {formatDate(job.deadline)}</p>
                  <div className="admin-inline-actions">
                    {job.applyLink ? (
                      <a className="ghost-button" href={job.applyLink} target="_blank" rel="noreferrer">
                        View job
                      </a>
                    ) : null}
                    <button
                      type="button"
                      className="primary-button"
                      disabled={job.isApplied || submitting === `job-${job._id}`}
                      onClick={() => runAction(`job-${job._id}`, () => applyStudentJob(userToken, job._id))}
                    >
                      {job.isApplied ? "Applied" : "Apply"}
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="info-card">No job opportunities available right now.</div>
            )}
          </div>
        </section>
      ) : null}

      {activeSection === "certificates" ? (
        <section className="panel">
          <p className="section-tag">Certificates</p>
          <h3>Issued certificates</h3>
          <div className="student-card-grid">
            {certificates.length ? (
              certificates.map((certificate) => (
                <article key={certificate._id} className="admin-record-card">
                  <h4>{certificate.title}</h4>
                  <p>Issued on {formatDate(certificate.issueDate)}</p>
                  <iframe
                    title={certificate.title}
                    className="student-certificate-frame"
                    src={certificate.fileUrl}
                  />
                </article>
              ))
            ) : (
              <div className="info-card">No certificates uploaded yet.</div>
            )}
          </div>
        </section>
      ) : null}
        </div>
      </div>
    </div>
  );
}

export default StudentPanelPage;
