import mongoose from "mongoose";

import { runtimeLeads } from "../data/defaultCatalog.js";
import Lead from "../models/Lead.js";

const isDatabaseReady = () => mongoose.connection.readyState === 1;

export const normalizeLeadPhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.startsWith("91") && digits.length >= 12) {
    return `+${digits}`;
  }

  return `+${digits}`;
};

const normalizeLead = (lead) => ({
  _id: String(lead._id || lead.id),
  name: lead.name || "",
  mobileNumber: lead.mobileNumber || "",
  source: lead.source || "whatsapp-bot",
  interest: lead.interest || "",
  qualification: lead.qualification || "",
  status: lead.status || "New",
  notes: lead.notes || "",
  followUpDate: lead.followUpDate || null,
  city: lead.city || "",
  lastMessageText: lead.lastMessageText || "",
  lastInteractionAt: lead.lastInteractionAt || lead.updatedAt || lead.createdAt || null,
  lastBotReplyAt: lead.lastBotReplyAt || null,
  conversationStage: lead.conversationStage || "new",
  createdAt: lead.createdAt || null,
  updatedAt: lead.updatedAt || null,
});

export const listLeads = async () => {
  if (isDatabaseReady()) {
    const leads = await Lead.find().sort({ lastInteractionAt: -1, updatedAt: -1 }).lean();
    return leads.map(normalizeLead);
  }

  return runtimeLeads
    .slice()
    .sort(
      (first, second) =>
        new Date(second.lastInteractionAt || second.updatedAt || 0).getTime() -
        new Date(first.lastInteractionAt || first.updatedAt || 0).getTime(),
    )
    .map(normalizeLead);
};

export const findLeadByMobileNumber = async (mobileNumber) => {
  const normalizedMobileNumber = normalizeLeadPhone(mobileNumber);

  if (!normalizedMobileNumber) {
    return null;
  }

  if (isDatabaseReady()) {
    const lead = await Lead.findOne({ mobileNumber: normalizedMobileNumber });
    return lead || null;
  }

  return runtimeLeads.find((lead) => lead.mobileNumber === normalizedMobileNumber) || null;
};

export const upsertLeadFromMessage = async ({
  mobileNumber,
  name = "",
  interest = "",
  qualification = "",
  messageText = "",
  receivedAt = new Date(),
  conversationStage = "new",
}) => {
  const normalizedMobileNumber = normalizeLeadPhone(mobileNumber);

  if (!normalizedMobileNumber) {
    return { lead: null, previousLead: null };
  }

  if (isDatabaseReady()) {
    let lead = await Lead.findOne({ mobileNumber: normalizedMobileNumber });
    const previousLead = lead ? lead.toObject() : null;

    if (!lead) {
      lead = new Lead({
        mobileNumber: normalizedMobileNumber,
        source: "whatsapp-bot",
      });
    }

    if (name && !lead.name) {
      lead.name = name;
    }

    if (interest) {
      lead.interest = interest;
    }

    if (qualification) {
      lead.qualification = qualification;
      if (["New", "Contacted"].includes(lead.status)) {
        lead.status = "Interested";
      }
    }

    lead.lastMessageText = messageText;
    lead.lastInteractionAt = new Date(receivedAt);
    lead.conversationStage = conversationStage;
    await lead.save();

    return {
      lead,
      previousLead,
    };
  }

  const index = runtimeLeads.findIndex((lead) => lead.mobileNumber === normalizedMobileNumber);
  const previousLead = index >= 0 ? { ...runtimeLeads[index] } : null;
  const baseLead =
    index >= 0
      ? runtimeLeads[index]
      : {
          _id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date(),
          source: "whatsapp-bot",
          notes: "",
          status: "New",
          city: "",
          lastBotReplyAt: null,
        };

  const nextLead = {
    ...baseLead,
    mobileNumber: normalizedMobileNumber,
    name: baseLead.name || name || "",
    interest: interest || baseLead.interest || "",
    qualification: qualification || baseLead.qualification || "",
    status:
      qualification && ["New", "Contacted"].includes(baseLead.status || "New")
        ? "Interested"
        : baseLead.status || "New",
    lastMessageText: messageText,
    lastInteractionAt: new Date(receivedAt),
    conversationStage,
    updatedAt: new Date(),
  };

  if (index >= 0) {
    runtimeLeads[index] = nextLead;
  } else {
    runtimeLeads.unshift(nextLead);
  }

  return {
    lead: nextLead,
    previousLead,
  };
};

export const updateLeadRecord = async (leadId, payload) => {
  const nextStatus = String(payload.status || "").trim();
  const nextNotes = String(payload.notes || "").trim();
  const nextFollowUpDate = payload.followUpDate ? new Date(payload.followUpDate) : null;

  if (isDatabaseReady()) {
    const lead = await Lead.findById(leadId);

    if (!lead) {
      return null;
    }

    if (nextStatus) {
      lead.status = nextStatus;
    }

    lead.notes = nextNotes;
    lead.followUpDate = nextFollowUpDate || undefined;
    await lead.save();

    return normalizeLead(lead.toObject());
  }

  const index = runtimeLeads.findIndex((lead) => String(lead._id || lead.id) === String(leadId));

  if (index === -1) {
    return null;
  }

  runtimeLeads[index] = {
    ...runtimeLeads[index],
    status: nextStatus || runtimeLeads[index].status,
    notes: nextNotes,
    followUpDate: nextFollowUpDate,
    updatedAt: new Date(),
  };

  return normalizeLead(runtimeLeads[index]);
};
