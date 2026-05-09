import { defaultLeadForm, formatDate } from "./adminUtils";

function LeadsSection({
  adminToken,
  leadForm,
  leads,
  leadsSummary,
  runMutation,
  setLeadForm,
  submitting,
  updateAdminLead,
}) {
  const handleSubmit = async (event) => {
    event.preventDefault();

    await runMutation(
      "lead",
      () =>
        updateAdminLead(adminToken, leadForm.id, {
          status: leadForm.status,
          notes: leadForm.notes,
          followUpDate: leadForm.followUpDate,
        }),
      () => setLeadForm(defaultLeadForm),
    );
  };

  const startEdit = (lead) => {
    setLeadForm({
      id: lead._id,
      status: lead.status || "New",
      notes: lead.notes || "",
      followUpDate: lead.followUpDate ? lead.followUpDate.slice(0, 10) : "",
    });
  };

  return (
    <div className="stack-lg">
      <section className="admin-stat-grid">
        <article className="admin-stat-card">
          <span>Total Leads</span>
          <strong>{leadsSummary.totalLeads || 0}</strong>
        </article>
        <article className="admin-stat-card">
          <span>New Leads</span>
          <strong>{leadsSummary.newLeads || 0}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Interested</span>
          <strong>{leadsSummary.interestedLeads || 0}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Follow-ups Today</span>
          <strong>{leadsSummary.followUpsToday || 0}</strong>
        </article>
      </section>

      <form className="panel admin-form-panel" onSubmit={handleSubmit}>
        <div className="section-head">
          <div>
            <p className="section-tag">Lead Dashboard</p>
            <h3>{leadForm.id ? "Update lead" : "Select a lead below to manage"}</h3>
          </div>
          {leadForm.id ? (
            <button type="button" className="ghost-button" onClick={() => setLeadForm(defaultLeadForm)}>
              Reset
            </button>
          ) : null}
        </div>
        <div className="admin-form-grid">
          <label className="field">
            <span>Status</span>
            <select
              value={leadForm.status}
              onChange={(event) => setLeadForm((current) => ({ ...current, status: event.target.value }))}
              disabled={!leadForm.id}
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Not Interested">Not Interested</option>
              <option value="Converted">Converted</option>
            </select>
          </label>
          <label className="field">
            <span>Follow-up Date</span>
            <input
              type="date"
              value={leadForm.followUpDate}
              onChange={(event) =>
                setLeadForm((current) => ({
                  ...current,
                  followUpDate: event.target.value,
                }))
              }
              disabled={!leadForm.id}
            />
          </label>
          <label className="field field-span">
            <span>Notes</span>
            <textarea
              rows="4"
              value={leadForm.notes}
              onChange={(event) => setLeadForm((current) => ({ ...current, notes: event.target.value }))}
              disabled={!leadForm.id}
            />
          </label>
        </div>
        <button type="submit" className="primary-button" disabled={!leadForm.id || submitting === "lead"}>
          {submitting === "lead" ? "Saving..." : "Save Lead Update"}
        </button>
      </form>

      <div className="admin-card-grid">
        {leads.length ? (
          leads.map((lead) => (
            <article key={lead._id} className="admin-record-card">
              <div className="section-head compact">
                <div>
                  <h4>{lead.name || "WhatsApp Lead"}</h4>
                  <p>{lead.mobileNumber}</p>
                </div>
                <span className="admin-tag">{lead.status}</span>
              </div>
              <p>Interest: {lead.interest || "Not captured yet"}</p>
              <p>Qualification: {lead.qualification || "Awaiting response"}</p>
              <p>Last Message: {lead.lastMessageText || "No message captured yet."}</p>
              <p>Last Interaction: {formatDate(lead.lastInteractionAt)}</p>
              <p>Follow-up: {formatDate(lead.followUpDate)}</p>
              {lead.notes ? <p>Notes: {lead.notes}</p> : null}
              <div className="admin-inline-actions">
                <a className="ghost-button" href={`tel:${lead.mobileNumber.replace(/\s+/g, "")}`}>
                  Call
                </a>
                <a
                  className="ghost-button"
                  href={`https://wa.me/${lead.mobileNumber.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
                <button type="button" className="ghost-button" onClick={() => startEdit(lead)}>
                  Manage
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="info-card">WhatsApp leads will appear here automatically from the bot webhook.</div>
        )}
      </div>
    </div>
  );
}

export default LeadsSection;
