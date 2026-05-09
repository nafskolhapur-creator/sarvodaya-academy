const manualTemplateOptions = [
  { value: "reminder", label: "Fee Reminder", interaktName: "fee_reminder" },
  { value: "urgent", label: "Urgent Reminder", interaktName: "fee_urgent" },
  { value: "late", label: "Late Fee Reminder", interaktName: "fee_late" },
  { value: "paymentReceived", label: "Payment Received", interaktName: "payment_received" },
  { value: "enquiryReply", label: "Course Enquiry Reply", interaktName: "course_enquiry_reply" },
];

function WhatsAppSection({
  adminToken,
  manualWhatsAppForm,
  runMutation,
  sendAdminWhatsAppMessage,
  setManualWhatsAppForm,
  setWhatsAppForm,
  submitting,
  updateAdminWhatsApp,
  whatsAppForm,
  whatsAppOverview,
}) {
  const handleSettingsSubmit = async (event) => {
    event.preventDefault();

    await runMutation("whatsapp-settings", () =>
      updateAdminWhatsApp(adminToken, {
        apiUrl: whatsAppForm.apiUrl,
        apiKey: whatsAppForm.apiKey,
        phoneNumber: whatsAppForm.phoneNumber,
        automationEnabled: whatsAppForm.automationEnabled,
        botEnabled: whatsAppForm.botEnabled,
        botReplyDelaySeconds: whatsAppForm.botReplyDelaySeconds,
        autoReplies: whatsAppForm.autoReplies,
        templates: whatsAppForm.templates,
      }),
    );
  };

  const handleManualSend = async (event) => {
    event.preventDefault();

    const bodyValues = manualWhatsAppForm.bodyValuesText
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    await runMutation(
      "whatsapp-send",
      () =>
        sendAdminWhatsAppMessage(adminToken, {
          to: manualWhatsAppForm.to,
          templateKey: manualWhatsAppForm.templateKey,
          bodyValues,
        }),
      () =>
        setManualWhatsAppForm({
          to: "",
          templateKey: "enquiryReply",
          bodyValuesText: "",
        }),
    );
  };

  const updateTemplate = (key, value) => {
    setWhatsAppForm((current) => ({
      ...current,
      templates: {
        ...current.templates,
        [key]: value,
      },
    }));
  };

  const updateAutoReply = (key, value) => {
    setWhatsAppForm((current) => ({
      ...current,
      autoReplies: {
        ...current.autoReplies,
        [key]: value,
      },
    }));
  };

  const selectedTemplate =
    manualTemplateOptions.find((option) => option.value === manualWhatsAppForm.templateKey) ||
    manualTemplateOptions[0];

  return (
    <div className="stack-lg">
      <section className="admin-stat-grid">
        <article className="admin-stat-card">
          <span>Provider</span>
          <strong>{whatsAppOverview.settings.provider || "Interakt"}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Automation</span>
          <strong>{whatsAppOverview.settings.automationEnabled ? "ON" : "OFF"}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Bot</span>
          <strong>{whatsAppOverview.settings.botEnabled ? "ACTIVE" : "OFF"}</strong>
        </article>
        <article className="admin-stat-card">
          <span>API Key</span>
          <strong>{whatsAppOverview.settings.apiKeyConfigured ? "Configured" : "Missing"}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Sender Number</span>
          <strong>{whatsAppOverview.settings.phoneNumber || "Not set"}</strong>
        </article>
      </section>

      <form className="panel admin-form-panel" onSubmit={handleSettingsSubmit}>
        <p className="section-tag">Interakt Settings</p>
        <h3>Provider and automation controls</h3>
        <div className="admin-form-grid">
          <label className="field field-span">
            <span>Interakt API URL</span>
            <input
              value={whatsAppForm.apiUrl}
              onChange={(event) =>
                setWhatsAppForm((current) => ({ ...current, apiUrl: event.target.value }))
              }
              placeholder="https://api.interakt.ai/v1/public/message/"
            />
          </label>
          <label className="field">
            <span>Interakt API Key</span>
            <input
              type="password"
              value={whatsAppForm.apiKey}
              onChange={(event) =>
                setWhatsAppForm((current) => ({ ...current, apiKey: event.target.value }))
              }
              placeholder={
                whatsAppOverview.settings.apiKeyConfigured
                  ? "Saved already. Enter a new key to replace it."
                  : "Paste Interakt API key"
              }
            />
          </label>
          <label className="field">
            <span>Sender Phone Number</span>
            <input
              value={whatsAppForm.phoneNumber}
              onChange={(event) =>
                setWhatsAppForm((current) => ({ ...current, phoneNumber: event.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>Messaging</span>
            <select
              value={whatsAppForm.automationEnabled ? "on" : "off"}
              onChange={(event) =>
                setWhatsAppForm((current) => ({
                  ...current,
                  automationEnabled: event.target.value === "on",
                }))
              }
            >
              <option value="on">Enabled</option>
              <option value="off">Disabled</option>
            </select>
          </label>
          <label className="field">
            <span>Auto Reply Bot</span>
            <select
              value={whatsAppForm.botEnabled ? "on" : "off"}
              onChange={(event) =>
                setWhatsAppForm((current) => ({
                  ...current,
                  botEnabled: event.target.value === "on",
                }))
              }
            >
              <option value="on">Enabled</option>
              <option value="off">Disabled</option>
            </select>
          </label>
          <label className="field">
            <span>Bot Reply Delay (seconds)</span>
            <input
              type="number"
              min="5"
              max="600"
              value={whatsAppForm.botReplyDelaySeconds}
              onChange={(event) =>
                setWhatsAppForm((current) => ({
                  ...current,
                  botReplyDelaySeconds: event.target.value,
                }))
              }
            />
          </label>
          <div className="info-card">
            <span className="label">Interakt Templates</span>
            <p>
              Fee reminders use `fee_reminder`, `fee_urgent`, and `fee_late`. Payment confirmation
              uses `payment_received`. Bot replies should also have approved Interakt templates.
            </p>
          </div>
          <label className="field field-span">
            <span>Fees Reply</span>
            <textarea
              rows="2"
              value={whatsAppForm.autoReplies.fees}
              onChange={(event) => updateAutoReply("fees", event.target.value)}
            />
          </label>
          <label className="field field-span">
            <span>Course Reply</span>
            <textarea
              rows="2"
              value={whatsAppForm.autoReplies.course}
              onChange={(event) => updateAutoReply("course", event.target.value)}
            />
          </label>
          <label className="field field-span">
            <span>Job Reply</span>
            <textarea
              rows="2"
              value={whatsAppForm.autoReplies.job}
              onChange={(event) => updateAutoReply("job", event.target.value)}
            />
          </label>
          <label className="field field-span">
            <span>Duration Reply</span>
            <textarea
              rows="2"
              value={whatsAppForm.autoReplies.duration}
              onChange={(event) => updateAutoReply("duration", event.target.value)}
            />
          </label>
          <label className="field field-span">
            <span>10th Suggestion</span>
            <textarea
              rows="3"
              value={whatsAppForm.autoReplies.tenthSuggestion}
              onChange={(event) => updateAutoReply("tenthSuggestion", event.target.value)}
            />
          </label>
          <label className="field field-span">
            <span>12th Suggestion</span>
            <textarea
              rows="3"
              value={whatsAppForm.autoReplies.twelfthSuggestion}
              onChange={(event) => updateAutoReply("twelfthSuggestion", event.target.value)}
            />
          </label>
          <label className="field field-span">
            <span>Graduate Suggestion</span>
            <textarea
              rows="3"
              value={whatsAppForm.autoReplies.graduateSuggestion}
              onChange={(event) => updateAutoReply("graduateSuggestion", event.target.value)}
            />
          </label>
          <label className="field field-span">
            <span>Payment Received Preview Template</span>
            <textarea
              rows="3"
              value={whatsAppForm.templates.paymentReceived}
              onChange={(event) => updateTemplate("paymentReceived", event.target.value)}
            />
          </label>
          <label className="field field-span">
            <span>Course Enquiry Reply Preview Template</span>
            <textarea
              rows="3"
              value={whatsAppForm.templates.enquiryReply}
              onChange={(event) => updateTemplate("enquiryReply", event.target.value)}
            />
          </label>
        </div>
        <div className="admin-inline-actions">
          <button type="submit" className="primary-button" disabled={submitting === "whatsapp-settings"}>
            {submitting === "whatsapp-settings" ? "Saving..." : "Save Interakt Settings"}
          </button>
          <p className="hint-text">
            Fee reminder preview text is still managed from the Fees section; this panel stores the
            Interakt key, bot controls, and message previews.
          </p>
        </div>
      </form>

      <form className="panel admin-form-panel" onSubmit={handleManualSend}>
        <p className="section-tag">Manual Send</p>
        <h3>Send an Interakt template</h3>
        <div className="admin-form-grid">
          <label className="field">
            <span>Recipient Number</span>
            <input
              value={manualWhatsAppForm.to}
              onChange={(event) =>
                setManualWhatsAppForm((current) => ({ ...current, to: event.target.value }))
              }
              required
            />
          </label>
          <label className="field">
            <span>Template</span>
            <select
              value={manualWhatsAppForm.templateKey}
              onChange={(event) =>
                setManualWhatsAppForm((current) => ({
                  ...current,
                  templateKey: event.target.value,
                }))
              }
            >
              {manualTemplateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="info-card">
            <span className="label">Selected Interakt Name</span>
            <p>{selectedTemplate.interaktName}</p>
          </div>
          <label className="field field-span">
            <span>Body Values</span>
            <input
              value={manualWhatsAppForm.bodyValuesText}
              onChange={(event) =>
                setManualWhatsAppForm((current) => ({
                  ...current,
                  bodyValuesText: event.target.value,
                }))
              }
              placeholder="Value 1, Value 2"
            />
          </label>
        </div>
        <div className="admin-inline-actions">
          <button type="submit" className="primary-button" disabled={submitting === "whatsapp-send"}>
            {submitting === "whatsapp-send" ? "Sending..." : "Send Template"}
          </button>
          <p className="hint-text">
            Add body values in the same order as your approved Interakt template placeholders.
          </p>
        </div>
      </form>

      <section className="panel">
        <p className="section-tag">Message Logs</p>
        <h3>Recent WhatsApp activity</h3>
        <div className="admin-log-list">
          {whatsAppOverview.logs.length ? (
            whatsAppOverview.logs.map((log) => (
              <article key={log._id} className="admin-log-row">
                <div>
                  <strong>{log.category}</strong>
                  <p>{log.student?.name || log.recipientPhone}</p>
                </div>
                <div>
                  <strong>{log.templateKey || "custom"}</strong>
                  <p>{new Date(log.sentAt).toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <strong className={log.status === "sent" ? "status-paid" : "status-unpaid"}>
                    {log.status}
                  </strong>
                  <p>{log.errorMessage || "Delivered to provider."}</p>
                  {log.providerResponse ? <p className="hint-text">{log.providerResponse}</p> : null}
                </div>
              </article>
            ))
          ) : (
            <div className="info-card">No WhatsApp logs yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default WhatsAppSection;
