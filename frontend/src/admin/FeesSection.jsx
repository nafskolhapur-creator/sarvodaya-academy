import { useState } from "react";

import { defaultFeeForm, formatCurrency, formatDate, monthLabel } from "./adminUtils";

const formatDateTime = (dateString) =>
  dateString
    ? new Date(dateString).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not sent";

const getStatusClass = (status) => {
  if (status === "paid") {
    return "status-paid";
  }

  if (status === "late") {
    return "status-late";
  }

  return "status-unpaid";
};

function FeesSection({
  adminToken,
  createAdminFee,
  deleteAdminFee,
  feeForm,
  feeCollectionSummary,
  feeRecords,
  feeReminderForm,
  feeReminderOverview,
  markAdminFeePaid,
  runAdminFeeReminderCycle,
  runMutation,
  setFeeForm,
  setFeeReminderForm,
  studentOptions,
  submitting,
  updateAdminFeeReminderSettings,
}) {
  const [activePaymentRecordId, setActivePaymentRecordId] = useState("");
  const [paymentForms, setPaymentForms] = useState({});

  const buildPaymentForm = (record) => ({
    paymentDate: new Date().toISOString().slice(0, 10),
    amountPaid: String(record.totalDue || record.amountDue || 0),
    paymentMode: "Cash",
    transactionId: "",
    proof: null,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    await runMutation(
      "fee",
      () => createAdminFee(adminToken, feeForm),
      () => setFeeForm(defaultFeeForm),
    );
  };

  const handleReminderSettingsSubmit = async (event) => {
    event.preventDefault();

    await runMutation("fee-reminder-settings", () =>
      updateAdminFeeReminderSettings(adminToken, {
        autoRemindersEnabled: feeReminderForm.autoRemindersEnabled,
        dueDay: Number(feeReminderForm.dueDay),
        reminderDay: Number(feeReminderForm.reminderDay),
        urgentReminderDay: Number(feeReminderForm.urgentReminderDay),
        defaultLateFee: Number(feeReminderForm.defaultLateFee),
        templates: feeReminderForm.templates,
      }),
    );
  };

  const updateTemplate = (key, value) => {
    setFeeReminderForm((current) => ({
      ...current,
      templates: {
        ...current.templates,
        [key]: value,
      },
    }));
  };

  const openPaymentForm = (record) => {
    setActivePaymentRecordId((current) => (current === record._id ? "" : record._id));
    setPaymentForms((current) => ({
      ...current,
      [record._id]: current[record._id] || buildPaymentForm(record),
    }));
  };

  const updatePaymentForm = (recordId, key, value) => {
    setPaymentForms((current) => ({
      ...current,
      [recordId]: {
        ...(current[recordId] || {}),
        [key]: value,
      },
    }));
  };

  const submitPayment = async (recordId) => {
    const paymentForm = paymentForms[recordId];
    const payload = new FormData();

    payload.append("paymentDate", paymentForm.paymentDate);
    payload.append("amountPaid", paymentForm.amountPaid);
    payload.append("paymentMode", paymentForm.paymentMode);
    payload.append("transactionId", paymentForm.transactionId);

    if (paymentForm.proof) {
      payload.append("proof", paymentForm.proof);
    }

    await runMutation(
      `fee-pay-${recordId}`,
      () => markAdminFeePaid(adminToken, recordId, payload),
      () => {
        setActivePaymentRecordId("");
        setPaymentForms((current) => {
          const next = { ...current };
          delete next[recordId];
          return next;
        });
      },
    );
  };

  return (
    <div className="stack-lg">
      <section className="admin-stat-grid">
        <article className="admin-stat-card">
          <span>Total Expected</span>
          <strong>{formatCurrency(feeCollectionSummary.totalExpected)}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Total Collected</span>
          <strong>{formatCurrency(feeCollectionSummary.totalCollected)}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Pending Amount</span>
          <strong>{formatCurrency(feeCollectionSummary.pendingAmount)}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Collection Month</span>
          <strong>
            {monthLabel(feeCollectionSummary.month)} {feeCollectionSummary.year}
          </strong>
        </article>
      </section>

      <section className="admin-stat-grid">
        <article className="admin-stat-card">
          <span>Auto Reminders</span>
          <strong>{feeReminderOverview.summary.autoRemindersEnabled ? "ON" : "OFF"}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Open Fee Records</span>
          <strong>{feeReminderOverview.summary.unpaidCount || 0}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Late Records</span>
          <strong>{feeReminderOverview.summary.lateCount || 0}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Messages Today</span>
          <strong>{feeReminderOverview.summary.messagesToday || 0}</strong>
        </article>
      </section>

      <form className="panel admin-form-panel" onSubmit={handleReminderSettingsSubmit}>
        <div className="section-head">
          <div>
            <p className="section-tag">Fee Reminder Automation</p>
            <h3>WhatsApp reminders and due-date rules</h3>
          </div>
          <button
            type="button"
            className="primary-button"
            disabled={submitting === "fee-reminder-run"}
            onClick={() =>
              runMutation("fee-reminder-run", () => runAdminFeeReminderCycle(adminToken))
            }
          >
            {submitting === "fee-reminder-run" ? "Sending..." : "Send Reminder Now"}
          </button>
        </div>

        <div className="admin-form-grid">
          <label className="field">
            <span>Auto Reminders</span>
            <select
              value={feeReminderForm.autoRemindersEnabled ? "on" : "off"}
              onChange={(event) =>
                setFeeReminderForm((current) => ({
                  ...current,
                  autoRemindersEnabled: event.target.value === "on",
                }))
              }
            >
              <option value="off">Off</option>
              <option value="on">On</option>
            </select>
          </label>
          <label className="field">
            <span>Due Day</span>
            <input
              type="number"
              min="1"
              max="28"
              value={feeReminderForm.dueDay}
              onChange={(event) =>
                setFeeReminderForm((current) => ({
                  ...current,
                  dueDay: event.target.value,
                }))
              }
            />
          </label>
          <label className="field">
            <span>Reminder Day</span>
            <input
              type="number"
              min="1"
              max="28"
              value={feeReminderForm.reminderDay}
              onChange={(event) =>
                setFeeReminderForm((current) => ({
                  ...current,
                  reminderDay: event.target.value,
                }))
              }
            />
          </label>
          <label className="field">
            <span>Urgent Reminder Day</span>
            <input
              type="number"
              min="1"
              max="28"
              value={feeReminderForm.urgentReminderDay}
              onChange={(event) =>
                setFeeReminderForm((current) => ({
                  ...current,
                  urgentReminderDay: event.target.value,
                }))
              }
            />
          </label>
          <label className="field">
            <span>Default Late Fee</span>
            <input
              type="number"
              min="0"
              value={feeReminderForm.defaultLateFee}
              onChange={(event) =>
                setFeeReminderForm((current) => ({
                  ...current,
                  defaultLateFee: event.target.value,
                }))
              }
            />
          </label>
          <div className="info-card">
            <span className="label">Template Variables</span>
            <p className="hint-text">
              Use <strong>[Course Name]</strong>, <strong>[Student Name]</strong>,{" "}
              <strong>[Due Day]</strong>, or <strong>[Month Name]</strong>.
            </p>
          </div>
          <label className="field field-span">
            <span>5th Reminder Template</span>
            <textarea
              rows="3"
              value={feeReminderForm.templates.reminder}
              onChange={(event) => updateTemplate("reminder", event.target.value)}
            />
          </label>
          <label className="field field-span">
            <span>9th Urgent Template</span>
            <textarea
              rows="3"
              value={feeReminderForm.templates.urgent}
              onChange={(event) => updateTemplate("urgent", event.target.value)}
            />
          </label>
          <label className="field field-span">
            <span>Late Fee Template</span>
            <textarea
              rows="3"
              value={feeReminderForm.templates.late}
              onChange={(event) => updateTemplate("late", event.target.value)}
            />
          </label>
        </div>

        <div className="admin-inline-actions">
          <button
            type="submit"
            className="primary-button"
            disabled={submitting === "fee-reminder-settings"}
          >
            {submitting === "fee-reminder-settings" ? "Saving..." : "Save Reminder Settings"}
          </button>
          <p className="hint-text">Interakt WhatsApp credentials stay on the backend or secure admin settings.</p>
        </div>
      </form>

      <form className="panel admin-form-panel" onSubmit={handleSubmit}>
        <p className="section-tag">Fee Management</p>
        <h3>Create monthly fee record</h3>
        <div className="admin-form-grid">
          <label className="field">
            <span>Student</span>
            <select
              value={feeForm.studentId}
              onChange={(event) =>
                setFeeForm((current) => ({ ...current, studentId: event.target.value }))
              }
              required
            >
              <option value="">Select student</option>
              {studentOptions.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Month</span>
            <select
              value={feeForm.month}
              onChange={(event) =>
                setFeeForm((current) => ({ ...current, month: event.target.value }))
              }
            >
              {Array.from({ length: 12 }, (_value, index) => (
                <option key={index + 1} value={index + 1}>
                  {monthLabel(index + 1)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Year</span>
            <input
              type="number"
              value={feeForm.year}
              onChange={(event) =>
                setFeeForm((current) => ({ ...current, year: event.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>Amount Due</span>
            <input
              type="number"
              min="0"
              value={feeForm.amountDue}
              onChange={(event) =>
                setFeeForm((current) => ({ ...current, amountDue: event.target.value }))
              }
              required
            />
          </label>
          <label className="field">
            <span>Base Late Fee</span>
            <input
              type="number"
              min="0"
              value={feeForm.lateFee}
              onChange={(event) =>
                setFeeForm((current) => ({ ...current, lateFee: event.target.value }))
              }
            />
          </label>
        </div>
        <button type="submit" className="primary-button" disabled={submitting === "fee"}>
          {submitting === "fee" ? "Saving..." : "Add fee record"}
        </button>
      </form>

      <section className="panel">
        <p className="section-tag">Monthly Records</p>
        <h3>Paid and unpaid tracking</h3>
        <div className="admin-table-stack">
          {feeRecords.map((record) => (
            <article key={record._id} className="admin-payment-card">
              <div className="admin-table-row">
                <div>
                  <strong>{record.student?.name}</strong>
                  <p>
                    {monthLabel(record.month)} {record.year} | {record.student?.academicYear}
                  </p>
                  <p>{record.student?.courseEnrolled}</p>
                </div>
                <div>
                  <strong>{formatCurrency(record.totalDue)}</strong>
                  <p>
                    Base: {formatCurrency(record.amountDue)} | Late Applied:{" "}
                    {formatCurrency(record.lateFee)}
                  </p>
                  <p>Late fee rule: {formatCurrency(record.lateFeeAmount)}</p>
                </div>
                <div>
                  <strong className={getStatusClass(record.status)}>
                    {record.status}
                  </strong>
                  <p>Due on {formatDate(record.dueDate)}</p>
                  <p>Last reminder: {formatDateTime(record.reminderSummary?.lastReminderSentAt)}</p>
                </div>
                <div className="admin-inline-actions">
                  {record.status !== "paid" ? (
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => openPaymentForm(record)}
                    >
                      {activePaymentRecordId === record._id ? "Close payment" : "Record payment"}
                    </button>
                  ) : null}
                  {record.status !== "paid" ? (
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() =>
                        runMutation(`fee-remind-${record._id}`, () =>
                          runAdminFeeReminderCycle(adminToken, { feeRecordId: record._id }),
                        )
                      }
                    >
                      Send reminder
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="ghost-button danger"
                    onClick={() => runMutation("fee-delete", () => deleteAdminFee(adminToken, record._id))}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {record.payment ? (
                <div className="payment-summary-grid">
                  <div className="info-card">
                    <span className="label">Payment Date</span>
                    <p>{formatDate(record.payment.paymentDate)}</p>
                  </div>
                  <div className="info-card">
                    <span className="label">Amount Paid</span>
                    <p>{formatCurrency(record.payment.amountPaid)}</p>
                  </div>
                  <div className="info-card">
                    <span className="label">Mode</span>
                    <p>{record.payment.paymentMode}</p>
                  </div>
                  <div className="info-card">
                    <span className="label">Receipt Number</span>
                    <p>{record.payment.receiptNumber || "Pending"}</p>
                  </div>
                  <div className="info-card">
                    <span className="label">Transaction ID</span>
                    <p>{record.payment.transactionId || "Not provided"}</p>
                  </div>
                  <div className="info-card">
                    <span className="label">Receipt WhatsApp</span>
                    <p className={record.payment.receiptWhatsappStatus === "sent" ? "status-paid" : "status-unpaid"}>
                      {record.payment.receiptWhatsappStatus || "pending"}
                    </p>
                  </div>
                </div>
              ) : null}

              {record.payment ? (
                <div className="admin-inline-actions">
                  {record.payment.receiptUrl ? (
                    <a className="ghost-button" href={record.payment.receiptUrl} target="_blank" rel="noreferrer">
                      View receipt
                    </a>
                  ) : null}
                  {record.payment.proofUrl ? (
                    <a className="ghost-button" href={record.payment.proofUrl} target="_blank" rel="noreferrer">
                      View proof
                    </a>
                  ) : null}
                </div>
              ) : null}

              {activePaymentRecordId === record._id ? (
                <div className="payment-entry-panel">
                  <div className="section-head">
                    <div>
                      <p className="section-tag">Payment Entry</p>
                      <h3>Record fee payment</h3>
                    </div>
                  </div>
                  <div className="admin-form-grid">
                    <label className="field">
                      <span>Payment Date</span>
                      <input
                        type="date"
                        value={paymentForms[record._id]?.paymentDate || ""}
                        onChange={(event) =>
                          updatePaymentForm(record._id, "paymentDate", event.target.value)
                        }
                      />
                    </label>
                    <label className="field">
                      <span>Amount Paid</span>
                      <input
                        type="number"
                        min="0"
                        value={paymentForms[record._id]?.amountPaid || ""}
                        onChange={(event) =>
                          updatePaymentForm(record._id, "amountPaid", event.target.value)
                        }
                      />
                    </label>
                    <label className="field">
                      <span>Payment Mode</span>
                      <select
                        value={paymentForms[record._id]?.paymentMode || "Cash"}
                        onChange={(event) =>
                          updatePaymentForm(record._id, "paymentMode", event.target.value)
                        }
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </label>
                    <label className="field">
                      <span>Transaction ID</span>
                      <input
                        value={paymentForms[record._id]?.transactionId || ""}
                        onChange={(event) =>
                          updatePaymentForm(record._id, "transactionId", event.target.value)
                        }
                        placeholder="Optional"
                      />
                    </label>
                    <label className="field field-span">
                      <span>Payment Proof</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,application/pdf"
                        onChange={(event) =>
                          updatePaymentForm(record._id, "proof", event.target.files?.[0] || null)
                        }
                      />
                    </label>
                  </div>
                  <div className="admin-inline-actions">
                    <button
                      type="button"
                      className="primary-button"
                      disabled={submitting === `fee-pay-${record._id}`}
                      onClick={() => submitPayment(record._id)}
                    >
                      {submitting === `fee-pay-${record._id}` ? "Saving..." : "Save payment and generate receipt"}
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="admin-card-grid">
        <article className="panel">
          <p className="section-tag">Due Today</p>
          <h3>Records hitting the due date</h3>
          <div className="student-record-list">
            {feeReminderOverview.dueToday?.length ? (
              feeReminderOverview.dueToday.map((record) => (
                <div key={record._id} className="student-record-row">
                  <div>
                    <strong>{record.student?.name}</strong>
                    <p>{record.student?.courseEnrolled}</p>
                  </div>
                  <div>
                    <strong>{monthLabel(record.month)} {record.year}</strong>
                    <p>Due on {formatDate(record.dueDate)}</p>
                  </div>
                  <div>
                    <strong>{formatCurrency(record.totalDue)}</strong>
                  </div>
                </div>
              ))
            ) : (
              <div className="info-card">No fee records are due today.</div>
            )}
          </div>
        </article>

        <article className="panel">
          <p className="section-tag">Overdue</p>
          <h3>Late fee records to follow up</h3>
          <div className="student-record-list">
            {feeReminderOverview.overdue?.length ? (
              feeReminderOverview.overdue.map((record) => (
                <div key={record._id} className="student-record-row">
                  <div>
                    <strong>{record.student?.name}</strong>
                    <p>{record.student?.courseEnrolled}</p>
                  </div>
                  <div>
                    <strong>{monthLabel(record.month)} {record.year}</strong>
                    <p>Due on {formatDate(record.dueDate)}</p>
                  </div>
                  <div>
                    <strong className="status-late">Late</strong>
                    <p>{formatCurrency(record.totalDue || record.amountDue)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="info-card">No overdue fee records right now.</div>
            )}
          </div>
        </article>
      </section>

      <section className="panel">
        <p className="section-tag">Reminder Logs</p>
        <h3>Latest WhatsApp attempts</h3>
        <div className="admin-log-list">
          {feeReminderOverview.logs?.length ? (
            feeReminderOverview.logs.map((log) => (
              <article key={log._id} className="admin-log-row">
                <div>
                  <strong>{log.student?.name || "Student"}</strong>
                  <p>
                    {monthLabel(log.feeRecord?.month || 1)} {log.feeRecord?.year || ""}
                  </p>
                </div>
                <div>
                  <strong>{log.reminderType}</strong>
                  <p>{formatDateTime(log.sentAt)}</p>
                </div>
                <div>
                  <strong className={log.status === "sent" ? "status-paid" : "status-unpaid"}>
                    {log.status}
                  </strong>
                  <p>{log.recipientPhone}</p>
                </div>
              </article>
            ))
          ) : (
            <div className="info-card">No reminder logs yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default FeesSection;
