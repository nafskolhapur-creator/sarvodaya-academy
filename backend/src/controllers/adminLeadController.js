import { listLeads, updateLeadRecord } from "../services/leadService.js";

const isSameDay = (firstDate, secondDate) => {
  const first = new Date(firstDate);
  const second = new Date(secondDate);

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
};

export const getAdminLeads = async (_req, res) => {
  const leads = await listLeads();
  const today = new Date();

  res.json({
    success: true,
    leads,
    summary: {
      totalLeads: leads.length,
      newLeads: leads.filter((lead) => lead.status === "New").length,
      interestedLeads: leads.filter((lead) => lead.status === "Interested").length,
      followUpsToday: leads.filter((lead) => lead.followUpDate && isSameDay(lead.followUpDate, today)).length,
    },
  });
};

export const updateAdminLead = async (req, res) => {
  const status = String(req.body.status || "").trim();

  if (status && !["New", "Contacted", "Interested", "Not Interested", "Converted"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid lead status.",
    });
  }

  const lead = await updateLeadRecord(req.params.id, {
    status,
    notes: req.body.notes,
    followUpDate: req.body.followUpDate,
  });

  if (!lead) {
    return res.status(404).json({
      success: false,
      message: "Lead not found.",
    });
  }

  res.json({ success: true, lead });
};
